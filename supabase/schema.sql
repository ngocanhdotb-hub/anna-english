-- ============================================================
-- ANNA ENGLISH - CẤU TRÚC DATABASE VÀ PHÂN QUYỀN (Supabase)
-- Cách dùng: dán toàn bộ file vào Supabase > SQL Editor > Run.
-- Nguyên tắc:
--   * Trình duyệt chỉ được ĐỌC dữ liệu được phép; mọi thay đổi tiến độ đi qua
--     các hàm ở phần 5, để người dùng không thể tự mở khóa level hay sửa điểm.
--   * Đăng nhập bằng tên đăng nhập và mật khẩu, không cần email thật. Supabase Auth bắt buộc
--     có email nên ứng dụng tự tạo một địa chỉ nội bộ từ tên đăng nhập; mật khẩu do Supabase
--     lưu ở dạng băm trong auth.users, không có ở các bảng dưới đây.
-- ============================================================

-- ---------- 1. NỘI DUNG HỌC (dùng chung, chỉ đọc) ----------
create table public.levels (
  id int primary key,
  code text not null,                -- ví dụ: Level 1
  cefr text not null,                -- ví dụ: A1 - Beginner 1
  title_vi text not null,
  outcome_vi text not null           -- mục tiêu đầu ra
);
create table public.topics (
  id text primary key,
  level_id int not null references public.levels(id),
  position int not null,
  title_en text not null,
  title_vi text not null,
  icon text not null default '📘',
  goal_vi text not null,
  required boolean not null default true
);
create table public.lessons (
  id text primary key,
  topic_id text not null references public.topics(id) on delete cascade,
  position int not null,
  title_vi text not null
);
create table public.sentences (
  id text primary key,
  lesson_id text not null references public.lessons(id) on delete cascade,
  position int not null,
  en text not null,
  vi text not null,
  ipa text,
  accepts text[] not null default '{}',   -- đáp án tương đương
  keywords text[] not null default '{}',  -- từ khóa bắt buộc
  required boolean not null default true
);
create table public.vocabulary (
  id text primary key,
  topic_id text not null references public.topics(id) on delete cascade,
  position int not null,
  word text not null,
  ipa text not null,
  vi text not null,
  example text not null,
  example_vi text not null
);
create table public.quiz_questions (
  id text primary key,
  topic_id text references public.topics(id) on delete cascade,
  level_id int references public.levels(id) on delete cascade,
  position int not null,
  kind text not null check (kind in ('choice', 'listen', 'translate')),
  prompt text not null,
  audio_text text,
  options jsonb not null default '[]',
  check ((topic_id is null) <> (level_id is null))
);
-- Đáp án tách riêng và trình duyệt không đọc được; hàm submit_quiz chấm trên máy chủ
create table public.quiz_answers (
  question_id text primary key references public.quiz_questions(id) on delete cascade,
  answer text not null
);
create table public.achievements (
  id text primary key,
  title_vi text not null,
  icon text not null default '🏅',
  description_vi text not null
);

-- ---------- 2. NGƯỜI DÙNG VÀ BẠN BÈ ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_.]{3,20}$'),   -- tên đăng nhập, không đổi được
  display_name text not null check (char_length(display_name) between 2 and 40),
  avatar_url text,
  friend_code text not null unique default upper(substr(md5(random()::text), 1, 8)),
  daily_goal_min int not null default 15 check (daily_goal_min between 5 and 120),
  timezone text not null default 'Asia/Ho_Chi_Minh',
  created_at timestamptz not null default now()
);
create table public.shared_progress_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  share_progress boolean not null default true,
  share_history boolean not null default true,
  share_tests boolean not null default true,
  share_achievements boolean not null default true
);
create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles(id) on delete cascade,
  to_user uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  check (from_user <> to_user)
);
create unique index friend_requests_one_pending on public.friend_requests
  (least(from_user, to_user), greatest(from_user, to_user)) where status = 'pending';
-- Mỗi cặp bạn chỉ lưu một dòng, user_a luôn nhỏ hơn user_b
create table public.friendships (
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b),
  check (user_a < user_b)
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);
create table public.shared_goals (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  target_days int not null default 5 check (target_days between 2 and 30),
  starts_on date not null,
  created_at timestamptz not null default now(),
  check (creator_id <> friend_id)
);

-- ---------- 3. TIẾN ĐỘ HỌC TẬP ----------
create table public.user_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  sentence_id text not null references public.sentences(id) on delete cascade,
  status text not null default 'doing' check (status in ('doing', 'done', 'review')),
  attempts int not null default 0,
  successes int not null default 0,
  first_result text,
  completed_at timestamptz,
  last_heard text,
  needs_review boolean not null default false,
  primary key (user_id, sentence_id)
);
create table public.user_vocabulary (
  user_id uuid not null references public.profiles(id) on delete cascade,
  vocabulary_id text not null references public.vocabulary(id) on delete cascade,
  known boolean not null default false,
  wrong int not null default 0,
  primary key (user_id, vocabulary_id)
);
-- id do trình duyệt tạo cho mỗi lượt nói, để kết quả nhận diện trùng không bị tính hai lần
create table public.speaking_attempts (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  sentence_id text not null references public.sentences(id) on delete cascade,
  heard text,
  result text not null check (result in ('correct', 'near', 'wrong', 'manual')),
  score real,
  created_at timestamptz not null default now()
);
create index on public.speaking_attempts (user_id, created_at desc);
create table public.study_sessions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  seconds int not null default 0,
  attempts int not null default 0,
  primary key (user_id, day)
);
create table public.topic_results (
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id text not null references public.topics(id) on delete cascade,
  best_score int not null default 0,
  test_passed boolean not null default false,
  completed_at timestamptz,
  primary key (user_id, topic_id)
);
create table public.level_progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  level_id int not null references public.levels(id) on delete cascade,
  status text not null default 'available' check (status in ('available', 'in_progress', 'completed')),
  unlocked_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, level_id)              -- không có dòng nghĩa là level đang khóa
);
create table public.level_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  level_id int not null references public.levels(id) on delete cascade,
  score int not null,
  passed boolean not null,
  taken_at timestamptz not null default now()
);
create table public.user_achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ---------- 4. HÀM KIỂM TRA QUYỀN ----------
create function public.are_friends(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from friendships where user_a = least(a, b) and user_b = greatest(a, b));
$$;
-- what: progress | history | tests | achievements
create function public.can_view(owner uuid, what text) returns boolean
language sql stable security definer set search_path = public as $$
  select owner = auth.uid() or (
    are_friends(owner, auth.uid()) and coalesce((
      select case what when 'progress' then share_progress when 'history' then share_history
                       when 'tests' then share_tests when 'achievements' then share_achievements else false end
      from shared_progress_settings where user_id = owner), false));
$$;

-- ---------- 5. CÁC HÀM GHI DỮ LIỆU (chạy trên máy chủ) ----------
-- Tạo hồ sơ khi có tài khoản mới, mở sẵn level đầu tiên
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, username, display_name)
  values (new.id, lower(new.raw_user_meta_data ->> 'username'),
          coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), new.raw_user_meta_data ->> 'username'));
  insert into shared_progress_settings (user_id) values (new.id);
  insert into level_progress (user_id, level_id) select new.id, min(id) from levels having min(id) is not null;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.local_today(uid uuid) returns date
language sql stable security definer set search_path = public as $$
  select (now() at time zone coalesce((select timezone from profiles where id = uid), 'Asia/Ho_Chi_Minh'))::date;
$$;
create function public.grant_achievement(uid uuid, ach text, notify boolean default true) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from achievements where id = ach) then return; end if;
  insert into user_achievements (user_id, achievement_id) values (uid, ach) on conflict do nothing;
  if found and notify and exists (select 1 from shared_progress_settings where user_id = uid and share_achievements) then
    insert into notifications (user_id, actor_id, kind, payload)
    select case when f.user_a = uid then f.user_b else f.user_a end, uid, 'achievement', jsonb_build_object('achievement', ach)
    from friendships f where uid in (f.user_a, f.user_b);
  end if;
end $$;
-- Chủ đề hoàn thành khi: đủ câu bắt buộc, nhớ tối thiểu 80% từ vựng, đạt bài kiểm tra
create function public.refresh_topic(uid uuid, t text) returns void
language plpgsql security definer set search_path = public as $$
declare ok boolean;
begin
  select not exists (
      select 1 from sentences s join lessons l on l.id = s.lesson_id
      left join user_progress p on p.sentence_id = s.id and p.user_id = uid
      where l.topic_id = t and s.required and p.completed_at is null)
    and (select count(*) filter (where uv.known) * 100 >= count(*) * 80
         from vocabulary v left join user_vocabulary uv on uv.vocabulary_id = v.id and uv.user_id = uid where v.topic_id = t)
    and coalesce((select test_passed from topic_results where user_id = uid and topic_id = t), false)
  into ok;
  if ok then
    update topic_results set completed_at = coalesce(completed_at, now()) where user_id = uid and topic_id = t;
  end if;
end $$;
create function public.level_unlocked(uid uuid, lv int) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from level_progress where user_id = uid and level_id = lv);
$$;

-- Ghi một lượt nói. p_attempt_id trùng thì bỏ qua, nên không bao giờ cộng hai lần
create function public.record_attempt(p_attempt_id uuid, p_sentence text, p_heard text, p_result text, p_score real, p_session_attempts int default 1)
returns text language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); t text; lv int; solved boolean := p_result in ('correct', 'manual');
begin
  if uid is null then raise exception 'NOT_SIGNED_IN'; end if;
  select tp.id, tp.level_id into t, lv from sentences s join lessons l on l.id = s.lesson_id join topics tp on tp.id = l.topic_id where s.id = p_sentence;
  if t is null then raise exception 'SENTENCE_NOT_FOUND'; end if;
  if not level_unlocked(uid, lv) then raise exception 'LEVEL_LOCKED'; end if;
  insert into speaking_attempts (id, user_id, sentence_id, heard, result, score)
    values (p_attempt_id, uid, p_sentence, left(p_heard, 300), p_result, p_score) on conflict (id) do nothing;
  if not found then return 'duplicate'; end if;
  insert into user_progress as up (user_id, sentence_id, status, attempts, successes, first_result, completed_at, last_heard, needs_review)
  values (uid, p_sentence, case when solved then 'done' else 'doing' end, 1, case when solved then 1 else 0 end, p_result,
          case when solved then now() end, left(p_heard, 300), not solved)
  on conflict (user_id, sentence_id) do update set
    attempts = up.attempts + 1,
    successes = up.successes + case when solved then 1 else 0 end,
    first_result = coalesce(up.first_result, p_result),
    completed_at = case when solved then coalesce(up.completed_at, now()) else up.completed_at end,
    status = case when solved then 'done' else up.status end,
    last_heard = left(p_heard, 300),
    needs_review = case when solved then p_session_attempts > 1 else true end;
  insert into study_sessions as ss (user_id, day, attempts) values (uid, local_today(uid), 1)
    on conflict (user_id, day) do update set attempts = ss.attempts + 1;
  update level_progress set status = 'in_progress' where user_id = uid and level_id = lv and status = 'available';
  perform refresh_topic(uid, t);
  return p_result;
end $$;
-- Bỏ qua câu: đưa vào danh sách ôn tập, không tính là sai
create function public.skip_sentence(p_sentence text) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); lv int;
begin
  if uid is null then raise exception 'NOT_SIGNED_IN'; end if;
  select tp.level_id into lv from sentences s join lessons l on l.id = s.lesson_id join topics tp on tp.id = l.topic_id where s.id = p_sentence;
  if lv is null or not level_unlocked(uid, lv) then raise exception 'LEVEL_LOCKED'; end if;
  insert into user_progress as up (user_id, sentence_id, status, needs_review) values (uid, p_sentence, 'review', true)
  on conflict (user_id, sentence_id) do update set needs_review = true,
    status = case when up.completed_at is null then 'review' else up.status end;
end $$;
create function public.mark_word(p_vocabulary text, p_known boolean) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); t text; lv int;
begin
  if uid is null then raise exception 'NOT_SIGNED_IN'; end if;
  select v.topic_id, tp.level_id into t, lv from vocabulary v join topics tp on tp.id = v.topic_id where v.id = p_vocabulary;
  if t is null or not level_unlocked(uid, lv) then raise exception 'LEVEL_LOCKED'; end if;
  insert into user_vocabulary as uv (user_id, vocabulary_id, known, wrong) values (uid, p_vocabulary, p_known, case when p_known then 0 else 1 end)
  on conflict (user_id, vocabulary_id) do update set known = p_known, wrong = uv.wrong + case when p_known then 0 else 1 end;
  perform refresh_topic(uid, t);
end $$;
-- Cộng thời gian học; giới hạn 5 phút mỗi lần gửi để số liệu không bị thổi phồng
create function public.add_study_time(p_seconds int) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'NOT_SIGNED_IN'; end if;
  insert into study_sessions as ss (user_id, day, seconds) values (uid, local_today(uid), greatest(0, least(p_seconds, 300)))
  on conflict (user_id, day) do update set seconds = ss.seconds + greatest(0, least(p_seconds, 300));
end $$;

-- Chấm bài kiểm tra trên máy chủ. p_answers có dạng {"mã câu hỏi": "câu trả lời"}
create function public.submit_quiz(p_topic text, p_level int, p_answers jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); total int; right_count int; pct int; lv int; passed boolean; first_pass boolean; wrong_ids jsonb; next_lv int;
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
         coalesce(jsonb_agg(q.id) filter (where lower(trim(coalesce(p_answers ->> q.id, ''))) <> lower(trim(a.answer))), '[]')
    into total, right_count, wrong_ids
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
  return jsonb_build_object('score', pct, 'passed', passed, 'total', total, 'correct', right_count, 'wrong', wrong_ids);
end $$;

-- Kết bạn
create function public.search_users(q text) returns table (id uuid, display_name text, avatar_url text, friend_code text)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.avatar_url, p.friend_code from profiles p
  where char_length(trim(q)) >= 2 and p.id <> auth.uid()
    and (p.friend_code = upper(trim(q)) or p.username = lower(trim(q)) or p.display_name ilike '%' || replace(replace(replace(trim(q), '\', '\\'), '%', '\%'), '_', '\_') || '%')
  order by p.display_name limit 20;
$$;
create function public.send_friend_request(p_to uuid) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); reverse_id uuid;
begin
  if uid is null then raise exception 'NOT_SIGNED_IN'; end if;
  if p_to = uid then raise exception 'SELF_REQUEST'; end if;
  if not exists (select 1 from profiles where id = p_to) then raise exception 'USER_NOT_FOUND'; end if;
  if are_friends(uid, p_to) then return 'already_friends'; end if;
  select id into reverse_id from friend_requests where from_user = p_to and to_user = uid and status = 'pending';
  if reverse_id is not null then           -- người kia đã mời trước: coi như đồng ý
    update friend_requests set status = 'accepted' where id = reverse_id;
    insert into friendships (user_a, user_b) values (least(uid, p_to), greatest(uid, p_to)) on conflict do nothing;
    return 'accepted';
  end if;
  insert into friend_requests (from_user, to_user) values (uid, p_to) on conflict do nothing;
  if found then
    insert into notifications (user_id, actor_id, kind) values (p_to, uid, 'friend_request');
  end if;
  return 'sent';
end $$;
create function public.respond_friend_request(p_request uuid, p_accept boolean) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); sender uuid;
begin
  select from_user into sender from friend_requests where id = p_request and to_user = uid and status = 'pending';
  if sender is null then raise exception 'REQUEST_NOT_FOUND'; end if;
  update friend_requests set status = case when p_accept then 'accepted' else 'declined' end where id = p_request;
  if p_accept then
    insert into friendships (user_a, user_b) values (least(uid, sender), greatest(uid, sender)) on conflict do nothing;
    insert into notifications (user_id, actor_id, kind) values (sender, uid, 'friend_accepted');
  end if;
end $$;
create function public.remove_friend(p_other uuid) returns void
language sql security definer set search_path = public as $$
  delete from friendships where user_a = least(auth.uid(), p_other) and user_b = greatest(auth.uid(), p_other);
$$;
-- Lời động viên dùng mẫu có sẵn, chỉ gửi cho bạn bè
create function public.send_cheer(p_friend uuid, p_message text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not are_friends(auth.uid(), p_friend) then raise exception 'NOT_FRIENDS'; end if;
  if p_message not in ('keep_going', 'congrats', 'study_together') then raise exception 'BAD_MESSAGE'; end if;
  insert into notifications (user_id, actor_id, kind, payload) values (p_friend, auth.uid(), 'cheer', jsonb_build_object('message', p_message));
end $$;
create function public.create_shared_goal(p_friend uuid, p_days int) returns uuid
language plpgsql security definer set search_path = public as $$
declare gid uuid;
begin
  if not are_friends(auth.uid(), p_friend) then raise exception 'NOT_FRIENDS'; end if;
  insert into shared_goals (creator_id, friend_id, target_days, starts_on) values (auth.uid(), p_friend, p_days, local_today(auth.uid())) returning id into gid;
  insert into notifications (user_id, actor_id, kind, payload) values (p_friend, auth.uid(), 'shared_goal', jsonb_build_object('days', p_days));
  return gid;
end $$;

-- ---------- 6. CÁC HÀM ĐỌC SỐ LIỆU CHO BẠN BÈ ----------
create function public.current_streak(uid uuid) returns int
language sql stable security definer set search_path = public as $$
  with d as (select day, row_number() over (order by day desc) n from study_sessions where user_id = uid and (attempts > 0 or seconds > 0)),
       g as (select day + (n * interval '1 day') grp, day from d),
       latest as (select grp, count(*) len, max(day) last_day from g group by grp order by last_day desc limit 1)
  select coalesce((select len::int from latest where last_day >= local_today(uid) - 1), 0);
$$;
-- Chỉ trả số liệu của chính mình hoặc của bạn đã bật chia sẻ; không bao giờ có email
create function public.friend_stats(p_user uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select case when not can_view(p_user, 'progress') then null else jsonb_build_object(
    'level', (select max(level_id) from level_progress where user_id = p_user),
    'topics_done', (select count(*) from topic_results where user_id = p_user and completed_at is not null),
    'sentences_done', (select count(*) from user_progress where user_id = p_user and completed_at is not null),
    'streak', current_streak(p_user),
    'total_seconds', (select coalesce(sum(seconds), 0) from study_sessions where user_id = p_user),
    'last_study', (select max(day) from study_sessions where user_id = p_user),
    'level_percent', (select case when count(*) = 0 then 0 else round(count(r.completed_at) * 100.0 / count(*)) end
       from topics t left join topic_results r on r.topic_id = t.id and r.user_id = p_user
       where t.level_id = (select max(level_id) from level_progress where user_id = p_user))
  ) end;
$$;
create function public.friends_overview() returns table (id uuid, display_name text, avatar_url text, stats jsonb)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.avatar_url, friend_stats(p.id) from friendships f
  join profiles p on p.id = case when f.user_a = auth.uid() then f.user_b else f.user_a end
  where auth.uid() in (f.user_a, f.user_b);
$$;
-- Bảng xếp hạng tuần: bản thân và các bạn đã bật chia sẻ
create function public.weekly_leaderboard() returns table (id uuid, display_name text, avatar_url text, days int, seconds int, sentences int)
language sql stable security definer set search_path = public as $$
  select p.id, p.display_name, p.avatar_url,
    (select count(*)::int from study_sessions s where s.user_id = p.id and s.day >= date_trunc('week', local_today(auth.uid()))::date),
    (select coalesce(sum(s.seconds), 0)::int from study_sessions s where s.user_id = p.id and s.day >= date_trunc('week', local_today(auth.uid()))::date),
    (select count(*)::int from user_progress u where u.user_id = p.id and u.completed_at >= date_trunc('week', now()))
  from profiles p where can_view(p.id, 'progress')
  order by 6 desc, 5 desc;
$$;

-- ---------- 7. PHÂN QUYỀN ----------
-- Supabase mặc định cấp quyền rộng cho vai trò web, nên thu hồi hết rồi cấp lại đúng phần cần
revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on functions from public, anon, authenticated;

do $$ declare t text; begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
  -- Nội dung học: người đã đăng nhập được đọc. quiz_answers cố ý không có trong danh sách
  foreach t in array array['levels','topics','lessons','sentences','vocabulary','quiz_questions','achievements'] loop
    execute format('grant select on public.%I to authenticated', t);
    execute format('create policy "read content" on public.%I for select to authenticated using (true)', t);
  end loop;
  foreach t in array array['profiles','shared_progress_settings','friend_requests','friendships','notifications','shared_goals',
                           'user_progress','user_vocabulary','speaking_attempts','study_sessions','topic_results','level_progress','level_tests','user_achievements'] loop
    execute format('grant select on public.%I to authenticated', t);
  end loop;
end $$;

-- Hồ sơ: của mình, của bạn bè, hoặc người có lời mời đang chờ với mình
create policy "see profile" on public.profiles for select to authenticated using (
  id = auth.uid() or are_friends(id, auth.uid()) or exists (
    select 1 from friend_requests r where r.status = 'pending'
      and ((r.from_user = auth.uid() and r.to_user = profiles.id) or (r.to_user = auth.uid() and r.from_user = profiles.id))));
-- Chỉ các cột này được tự sửa, và chỉ trên dòng của chính mình
grant update (display_name, avatar_url, daily_goal_min, timezone) on public.profiles to authenticated;
create policy "edit own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "own settings" on public.shared_progress_settings for select to authenticated using (user_id = auth.uid());
grant update (share_progress, share_history, share_tests, share_achievements) on public.shared_progress_settings to authenticated;
create policy "edit own settings" on public.shared_progress_settings for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own requests" on public.friend_requests for select to authenticated using (auth.uid() in (from_user, to_user));
grant update (status) on public.friend_requests to authenticated;
create policy "cancel own request" on public.friend_requests for update to authenticated
  using (from_user = auth.uid() and status = 'pending') with check (from_user = auth.uid() and status = 'cancelled');
create policy "own friendships" on public.friendships for select to authenticated using (auth.uid() in (user_a, user_b));

create policy "own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
grant update (read_at) on public.notifications to authenticated;
create policy "read own notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own goals" on public.shared_goals for select to authenticated using (auth.uid() in (creator_id, friend_id));

-- Riêng tư tuyệt đối: chỉ chủ tài khoản đọc được (có câu nghe được và từ vựng cá nhân)
create policy "own progress" on public.user_progress for select to authenticated using (user_id = auth.uid());
create policy "own vocabulary" on public.user_vocabulary for select to authenticated using (user_id = auth.uid());
create policy "own attempts" on public.speaking_attempts for select to authenticated using (user_id = auth.uid());
-- Chia sẻ theo lựa chọn của chủ tài khoản
create policy "shared history" on public.study_sessions for select to authenticated using (can_view(user_id, 'history'));
create policy "shared topics" on public.topic_results for select to authenticated using (can_view(user_id, 'progress'));
create policy "shared levels" on public.level_progress for select to authenticated using (can_view(user_id, 'progress'));
create policy "shared tests" on public.level_tests for select to authenticated using (can_view(user_id, 'tests'));
create policy "shared achievements" on public.user_achievements for select to authenticated using (can_view(user_id, 'achievements'));

-- Chỉ các hàm dành cho trình duyệt mới được gọi; hàm nội bộ như grant_achievement thì không
grant execute on function
  public.are_friends(uuid, uuid), public.can_view(uuid, text),
  public.record_attempt(uuid, text, text, text, real, int), public.skip_sentence(text), public.mark_word(text, boolean),
  public.add_study_time(int), public.submit_quiz(text, int, jsonb),
  public.search_users(text), public.send_friend_request(uuid), public.respond_friend_request(uuid, boolean), public.remove_friend(uuid),
  public.send_cheer(uuid, text), public.create_shared_goal(uuid, int),
  public.friend_stats(uuid), public.friends_overview(), public.weekly_leaderboard()
to authenticated;

-- Thông báo tức thời khi bạn bè đạt thành tích
alter publication supabase_realtime add table public.notifications;
