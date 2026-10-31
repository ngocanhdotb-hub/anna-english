-- ============================================================
-- BỔ SUNG: ôn theo lịch, thẻ giữ chuỗi, hội thoại đóng vai, nhắc học, hiện đáp án đúng
-- Chạy sau schema.sql. Không làm mất tiến độ đã có.
-- ============================================================

-- ---------- ÔN THEO LỊCH ----------
alter table public.user_progress
  add column review_stage int not null default 0,
  add column next_review_on date;
update public.user_progress p set next_review_on = local_today(p.user_id) + 1
  where completed_at is not null and next_review_on is null;

-- Khoảng cách ôn tăng dần: 1, 3, 7, 14, 30 ngày
create function public.review_gap(stage int) returns int
language sql immutable as $$
  select (array[1, 3, 7, 14, 30])[least(greatest(stage, 0), 4) + 1];
$$;

-- ---------- THẺ GIỮ CHUỖI ----------
alter table public.profiles
  add column streak_freezes int not null default 1 check (streak_freezes between 0 and 2),
  add column freeze_awarded_on date;
create table public.streak_freeze_days (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);
-- Ngày dùng thẻ giúp chuỗi không đứt nhưng không làm chuỗi dài thêm
create or replace function public.current_streak(uid uuid) returns int
language sql stable security definer set search_path = public as $$
  with d as (
    select day, true studied from study_sessions where user_id = uid and (attempts > 0 or seconds > 0)
    union all
    select day, false from streak_freeze_days where user_id = uid
      and day not in (select day from study_sessions where user_id = uid and (attempts > 0 or seconds > 0))
  ),
  g as (select day, studied, day + (row_number() over (order by day desc) * interval '1 day') grp from d),
  latest as (select count(*) filter (where studied) len, max(day) last_day from g group by grp order by max(day) desc limit 1)
  select coalesce((select len::int from latest where last_day >= local_today(uid) - 1), 0);
$$;
-- Dùng thẻ cho các ngày vừa nghỉ nếu đủ thẻ; đạt mỗi 7 ngày liên tiếp được tặng 1 thẻ, giữ tối đa 2
create function public.touch_streak(uid uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare today date := local_today(uid); last_day date; gap int; held int; used int := 0; awarded boolean := false; streak int;
begin
  select greatest(
      (select max(day) from study_sessions where user_id = uid and day < today and (attempts > 0 or seconds > 0)),
      (select max(day) from streak_freeze_days where user_id = uid and day < today))
    into last_day;
  select streak_freezes into held from profiles where id = uid;
  if last_day is not null then
    gap := today - last_day - 1;
    if gap > 0 and gap <= held then
      insert into streak_freeze_days (user_id, day)
        select uid, last_day + n from generate_series(1, gap) n on conflict do nothing;
      update profiles set streak_freezes = streak_freezes - gap where id = uid;
      used := gap;
      held := held - gap;
    end if;
  end if;
  streak := current_streak(uid);
  if streak > 0 and streak % 7 = 0 and held < 2 and exists (select 1 from study_sessions where user_id = uid and day = today and (attempts > 0 or seconds > 0))
     and (select freeze_awarded_on is distinct from today from profiles where id = uid) then
    update profiles set streak_freezes = streak_freezes + 1, freeze_awarded_on = today where id = uid;
    held := held + 1;
    awarded := true;
  end if;
  return jsonb_build_object('used', used, 'freezes', held, 'awarded', awarded, 'streak', streak);
end $$;
create function public.sync_streak() returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'NOT_SIGNED_IN'; end if;
  return touch_streak(auth.uid());
end $$;

-- ---------- GHI LƯỢT NÓI: thêm lịch ôn và cập nhật thẻ giữ chuỗi ----------
create or replace function public.record_attempt(p_attempt_id uuid, p_sentence text, p_heard text, p_result text, p_score real, p_session_attempts int default 1)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); t text; lv int; solved boolean := p_result in ('correct', 'manual'); today date; cur record; stage int;
begin
  if uid is null then raise exception 'NOT_SIGNED_IN'; end if;
  select tp.id, tp.level_id into t, lv from sentences s join lessons l on l.id = s.lesson_id join topics tp on tp.id = l.topic_id where s.id = p_sentence;
  if t is null then raise exception 'SENTENCE_NOT_FOUND'; end if;
  if not level_unlocked(uid, lv) then raise exception 'LEVEL_LOCKED'; end if;
  insert into speaking_attempts (id, user_id, sentence_id, heard, result, score)
    values (p_attempt_id, uid, p_sentence, left(p_heard, 300), p_result, p_score) on conflict (id) do nothing;
  if not found then return 'duplicate'; end if;
  today := local_today(uid);
  select review_stage, next_review_on, completed_at into cur from user_progress where user_id = uid and sentence_id = p_sentence;
  insert into user_progress as up (user_id, sentence_id, status, attempts, successes, first_result, completed_at, last_heard, needs_review, next_review_on)
  values (uid, p_sentence, case when solved then 'done' else 'doing' end, 1, case when solved then 1 else 0 end, p_result,
          case when solved then now() end, left(p_heard, 300), not solved, case when solved then today + 1 end)
  on conflict (user_id, sentence_id) do update set
    attempts = up.attempts + 1,
    successes = up.successes + case when solved then 1 else 0 end,
    first_result = coalesce(up.first_result, p_result),
    completed_at = case when solved then coalesce(up.completed_at, now()) else up.completed_at end,
    status = case when solved then 'done' else up.status end,
    last_heard = left(p_heard, 300),
    needs_review = case when solved then p_session_attempts > 1 else true end;
  if solved then
    if cur.completed_at is null then
      -- Vừa hoàn thành lần đầu: ôn lại vào ngày mai
      update user_progress set review_stage = 0, next_review_on = today + 1 where user_id = uid and sentence_id = p_sentence;
    elsif cur.next_review_on is null or cur.next_review_on <= today then
      -- Đến hạn ôn: đúng ngay thì giãn lịch, phải thử nhiều lần thì rút ngắn lại
      stage := case when p_session_attempts <= 1 then cur.review_stage + 1 else greatest(cur.review_stage - 1, 0) end;
      update user_progress set review_stage = stage, next_review_on = today + review_gap(stage) where user_id = uid and sentence_id = p_sentence;
    end if;
  end if;
  insert into study_sessions as ss (user_id, day, attempts) values (uid, today, 1)
    on conflict (user_id, day) do update set attempts = ss.attempts + 1;
  update level_progress set status = 'in_progress' where user_id = uid and level_id = lv and status = 'available';
  perform refresh_topic(uid, t);
  perform touch_streak(uid);
  return p_result;
end $$;

-- ---------- BÀI KIỂM TRA: trả thêm đáp án đúng của các câu sai ----------
create or replace function public.submit_quiz(p_topic text, p_level int, p_answers jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); total int; right_count int; pct int; lv int; passed boolean; first_pass boolean; review jsonb; next_lv int;
begin
  if uid is null then raise exception 'NOT_SIGNED_IN'; end if;
  if (p_topic is null) = (p_level is null) then raise exception 'BAD_SCOPE'; end if;
  lv := coalesce(p_level, (select level_id from topics where id = p_topic));
  if lv is null or not level_unlocked(uid, lv) then raise exception 'LEVEL_LOCKED'; end if;
  if p_level is not null and exists (
    select 1 from topics t left join topic_results r on r.topic_id = t.id and r.user_id = uid
    where t.level_id = p_level and t.required and r.completed_at is null) then
    raise exception 'TOPICS_INCOMPLETE';
  end if;
  select count(*), count(*) filter (where lower(trim(p_answers ->> q.id)) = lower(trim(a.answer))),
         coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'answer', a.answer)) filter (where lower(trim(coalesce(p_answers ->> q.id, ''))) <> lower(trim(a.answer))), '[]')
    into total, right_count, review
    from quiz_questions q join quiz_answers a on a.question_id = q.id
    where (p_topic is not null and q.topic_id = p_topic) or (p_level is not null and q.level_id = p_level);
  if total = 0 then raise exception 'NO_QUESTIONS'; end if;
  pct := round(right_count * 100.0 / total);
  passed := pct >= 80;
  if p_topic is not null then
    insert into topic_results as r (user_id, topic_id, best_score, test_passed) values (uid, p_topic, pct, passed)
    on conflict (user_id, topic_id) do update set best_score = greatest(r.best_score, pct), test_passed = r.test_passed or passed;
    perform refresh_topic(uid, p_topic);
  else
    insert into level_tests (user_id, level_id, score, passed) values (uid, p_level, pct, passed);
    if passed then
      update level_progress set status = 'completed', completed_at = coalesce(completed_at, now()) where user_id = uid and level_id = p_level and status <> 'completed';
      first_pass := found;
      select min(id) into next_lv from levels where id > p_level;
      if next_lv is not null then
        insert into level_progress (user_id, level_id) values (uid, next_lv) on conflict do nothing;
      end if;
      if first_pass then perform grant_achievement(uid, 'level_' || p_level); end if;
    end if;
  end if;
  return jsonb_build_object('score', pct, 'passed', passed, 'total', total, 'correct', right_count, 'review', review,
    'wrong', (select coalesce(jsonb_agg(x -> 'id'), '[]') from jsonb_array_elements(review) x));  -- giữ cho bản web cũ đang mở
end $$;

-- ---------- HỘI THOẠI ĐÓNG VAI ----------
create table public.dialogues (
  id text primary key,
  topic_id text not null references public.topics(id) on delete cascade,
  title_vi text not null,
  scene_vi text not null
);
create table public.dialogue_lines (
  id text primary key,
  dialogue_id text not null references public.dialogues(id) on delete cascade,
  position int not null,
  speaker text not null check (speaker in ('app', 'user')),
  en text not null,
  vi text not null,
  accepts text[] not null default '{}',
  keywords text[] not null default '{}'
);
create table public.dialogue_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  dialogue_id text not null references public.dialogues(id) on delete cascade,
  completed_at timestamptz not null default now(),
  times int not null default 1,
  primary key (user_id, dialogue_id)
);
create function public.complete_dialogue(p_dialogue text) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); lv int;
begin
  if uid is null then raise exception 'NOT_SIGNED_IN'; end if;
  select t.level_id into lv from dialogues d join topics t on t.id = d.topic_id where d.id = p_dialogue;
  if lv is null or not level_unlocked(uid, lv) then raise exception 'LEVEL_LOCKED'; end if;
  insert into dialogue_progress as p (user_id, dialogue_id) values (uid, p_dialogue)
    on conflict (user_id, dialogue_id) do update set times = p.times + 1, completed_at = now();
  insert into study_sessions as ss (user_id, day, attempts) values (uid, local_today(uid), 1)
    on conflict (user_id, day) do update set attempts = ss.attempts + 1;
  perform touch_streak(uid);
end $$;

-- ---------- NHẮC HỌC MỖI NGÀY ----------
create table public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  remind_hour int not null default 20 check (remind_hour between 0 and 23),
  created_at timestamptz not null default now()
);
-- Chỉ dịch vụ gửi nhắc trên máy chủ được gọi: thiết bị đến giờ nhắc mà hôm nay chủ tài khoản chưa học
create function public.due_reminders() returns table (endpoint text, p256dh text, auth text, streak int)
language sql stable security definer set search_path = public as $$
  select s.endpoint, s.p256dh, s.auth, current_streak(s.user_id)
  from push_subscriptions s join profiles p on p.id = s.user_id
  where s.remind_hour = extract(hour from now() at time zone p.timezone)::int
    and not exists (select 1 from study_sessions ss where ss.user_id = s.user_id and ss.day = local_today(s.user_id) and (ss.attempts > 0 or ss.seconds > 0));
$$;

-- ---------- PHÂN QUYỀN ----------
alter table public.streak_freeze_days enable row level security;
alter table public.dialogues enable row level security;
alter table public.dialogue_lines enable row level security;
alter table public.dialogue_progress enable row level security;
alter table public.push_subscriptions enable row level security;
revoke all on public.streak_freeze_days, public.dialogues, public.dialogue_lines, public.dialogue_progress, public.push_subscriptions from anon, authenticated;
grant select on public.dialogues, public.dialogue_lines, public.dialogue_progress, public.streak_freeze_days to authenticated;
create policy "read content" on public.dialogues for select to authenticated using (true);
create policy "read content" on public.dialogue_lines for select to authenticated using (true);
create policy "own dialogue progress" on public.dialogue_progress for select to authenticated using (user_id = auth.uid());
create policy "own freeze days" on public.streak_freeze_days for select to authenticated using (user_id = auth.uid());
grant select, insert, update, delete on public.push_subscriptions to authenticated;
create policy "own devices" on public.push_subscriptions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on function public.review_gap(int), public.touch_streak(uuid), public.sync_streak(), public.complete_dialogue(text), public.due_reminders() from public, anon, authenticated;
grant execute on function public.sync_streak(), public.complete_dialogue(text) to authenticated;
grant execute on function public.due_reminders() to service_role;
