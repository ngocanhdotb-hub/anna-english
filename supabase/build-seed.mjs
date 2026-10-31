// Tạo supabase/seed.sql từ content.mjs. Chạy lại an toàn: chỉ thêm hoặc cập nhật, không đụng tiến độ người học.
import { writeFileSync } from 'fs';
import { LEVELS, TOPICS } from './content.mjs';
import { DIALOGUES } from './dialogues.mjs';

const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => `array[${a.map(q).join(',')}]::text[]`;
const STOP = new Set(['a', 'an', 'the', 'is', 'am', 'are', 'to', 'at', 'in', 'of', 'by', 'do', 'does', 'and', 'very', 'please', 'i', 'it', 'this', 'you', 'your', 'my', 'our', 'we', 'on', 'for', 'too', 'so', 'me', 'he', 'she', 'that', 'there', 'with', 'one', 'be', 'us', 'what', 'how', 'can', 'here', 'where', 'will', 'have', 'has', 'any', 'some']);
const keywordsOf = (en) => en.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter((x) => x && !STOP.has(x));
// Trộn cố định theo hạt giống để mỗi lần tạo seed cho cùng kết quả
function shuffle(list, seed) {
  const a = list.slice();
  let x = seed;
  for (let i = a.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = Math.floor((x / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const options = (right, pool, seed) => shuffle([right, ...shuffle(pool.filter((p) => p !== right), seed).slice(0, 3)], seed + 7);

const out = ['-- FILE TỰ TẠO từ content.mjs, không sửa trực tiếp', 'begin;'];
for (const l of LEVELS) {
  out.push(`insert into levels values (${l.id},${q(l.code)},${q(l.cefr)},${q(l.title_vi)},${q(l.outcome_vi)}) on conflict (id) do update set code=excluded.code,cefr=excluded.cefr,title_vi=excluded.title_vi,outcome_vi=excluded.outcome_vi;`);
  out.push(`insert into achievements values ('level_${l.id}',${q('Vượt ' + l.code)},'🏅',${q('Hoàn thành ' + l.code + ': ' + l.title_vi)}) on conflict (id) do nothing;`);
}
const quiz = [];
const add = (id, topic, level, position, kind, prompt, audio, opts, answer) => quiz.push({ id, topic, level, position, kind, prompt, audio, opts, answer });
TOPICS.forEach((t, ti) => {
  const lesson = `${t.id}-1`;
  out.push(`insert into topics values (${q(t.id)},${t.level},${ti + 1},${q(t.en)},${q(t.vi)},${q(t.icon)},${q(t.goal)},true) on conflict (id) do update set position=excluded.position,title_en=excluded.title_en,title_vi=excluded.title_vi,icon=excluded.icon,goal_vi=excluded.goal_vi;`);
  out.push(`insert into lessons values (${q(lesson)},${q(t.id)},1,'Bài 1') on conflict (id) do nothing;`);
  t.sentences.forEach((s, i) => out.push(`insert into sentences values (${q(`${t.id}-s${i}`)},${q(lesson)},${i},${q(s.en)},${q(s.vi)},null,${arr(s.accepts)},${arr(keywordsOf(s.en))},true) on conflict (id) do update set en=excluded.en,vi=excluded.vi,accepts=excluded.accepts,keywords=excluded.keywords;`));
  t.words.forEach((w, i) => out.push(`insert into vocabulary values (${q(`${t.id}-w${i}`)},${q(t.id)},${i},${q(w.word)},${q(w.ipa)},${q(w.vi)},${q(w.example)},${q(w.example_vi)}) on conflict (id) do update set word=excluded.word,ipa=excluded.ipa,vi=excluded.vi,example=excluded.example,example_vi=excluded.example_vi;`));
  // Bài kiểm tra chủ đề: 2 câu dịch, 2 câu từ vựng, 1 câu nghe
  const levelSent = TOPICS.filter((x) => x.level === t.level).flatMap((x) => x.sentences);
  const enPool = levelSent.map((s) => s.en);
  const viWords = TOPICS.filter((x) => x.level === t.level).flatMap((x) => x.words.map((w) => w.vi));
  const order = shuffle(t.sentences, ti + 11);
  const wordsOrder = shuffle(t.words, ti + 23);
  add(`${t.id}-q1`, t.id, null, 1, 'translate', `Câu nào có nghĩa: "${order[0].vi}"`, null, options(order[0].en, enPool, ti + 1), order[0].en);
  add(`${t.id}-q2`, t.id, null, 2, 'choice', `Từ "${wordsOrder[0].word}" nghĩa là gì?`, null, options(wordsOrder[0].vi, viWords, ti + 2), wordsOrder[0].vi);
  add(`${t.id}-q3`, t.id, null, 3, 'listen', 'Nghe và chọn câu bạn vừa nghe', order[1].en, options(order[1].en, enPool, ti + 3), order[1].en);
  add(`${t.id}-q4`, t.id, null, 4, 'choice', `Từ "${wordsOrder[1].word}" nghĩa là gì?`, null, options(wordsOrder[1].vi, viWords, ti + 4), wordsOrder[1].vi);
  add(`${t.id}-q5`, t.id, null, 5, 'translate', `Câu nào có nghĩa: "${order[2].vi}"`, null, options(order[2].en, enPool, ti + 5), order[2].en);
});
// Bài kiểm tra level: mỗi chủ đề có 1 câu dịch và 1 câu nghe, dùng câu khác với bài chủ đề
for (const l of LEVELS) {
  const ts = TOPICS.filter((t) => t.level === l.id);
  if (!ts.length) continue;
  const enPool = ts.flatMap((t) => t.sentences.map((s) => s.en));
  let pos = 1;
  ts.forEach((t, i) => {
    const order = shuffle(t.sentences, i + 101);
    add(`level${l.id}-q${pos}`, null, l.id, pos, 'translate', `Câu nào có nghĩa: "${order[3].vi}"`, null, options(order[3].en, enPool, i + 31), order[3].en); pos++;
    add(`level${l.id}-q${pos}`, null, l.id, pos, 'listen', 'Nghe và chọn câu bạn vừa nghe', order[4].en, options(order[4].en, enPool, i + 41), order[4].en); pos++;
  });
}
for (const x of quiz) {
  out.push(`insert into quiz_questions values (${q(x.id)},${q(x.topic)},${x.level ?? 'null'},${x.position},${q(x.kind)},${q(x.prompt)},${q(x.audio)},${q(JSON.stringify(x.opts))}::jsonb) on conflict (id) do update set prompt=excluded.prompt,audio_text=excluded.audio_text,options=excluded.options;`);
  out.push(`insert into quiz_answers values (${q(x.id)},${q(x.answer)}) on conflict (question_id) do update set answer=excluded.answer;`);
}
for (const d of DIALOGUES) {
  const id = `${d.topic}-d1`;
  out.push(`insert into dialogues values (${q(id)},${q(d.topic)},${q(d.title)},${q(d.scene)}) on conflict (id) do update set title_vi=excluded.title_vi,scene_vi=excluded.scene_vi;`);
  d.lines.forEach((l, i) => out.push(`insert into dialogue_lines values (${q(`${id}-${i}`)},${q(id)},${i},${q(l.speaker)},${q(l.en)},${q(l.vi)},${arr(l.accepts)},${arr(keywordsOf(l.en))}) on conflict (id) do update set speaker=excluded.speaker,en=excluded.en,vi=excluded.vi,accepts=excluded.accepts,keywords=excluded.keywords;`));
}
// Tài khoản đã có khi seed lần đầu cũng được mở level 1
out.push('insert into level_progress (user_id, level_id) select id, 1 from profiles on conflict do nothing;');
out.push('commit;');
writeFileSync(new URL('./seed.sql', import.meta.url), out.join('\n') + '\n');

// Tự kiểm tra nội dung
const problems = [];
for (const t of TOPICS) {
  if (t.sentences.length < 8) problems.push(`${t.id}: thiếu câu`);
  for (const s of t.sentences) if (s.en.split(/\s+/).length > 8) problems.push(`quá 8 từ: ${s.en}`);
  const text = t.sentences.map((s) => s.en.toLowerCase()).join(' ');
  for (const w of t.words) if (!new RegExp(`\\b${w.word.toLowerCase()}\\b`).test(text)) problems.push(`${t.id}: từ "${w.word}" không có trong câu mẫu`);
}
for (const d of DIALOGUES) {
  if (!TOPICS.some((t) => t.id === d.topic)) problems.push(`hội thoại sai chủ đề: ${d.topic}`);
  if (d.lines.length < 4 || d.lines.at(-1).speaker !== 'user') problems.push(`hội thoại chưa đạt: ${d.topic}`);
  for (const l of d.lines) if (l.en.split(/\s+/).length > 8) problems.push(`quá 8 từ: ${l.en}`);
}
if (DIALOGUES.length !== TOPICS.length) problems.push(`thiếu hội thoại: ${DIALOGUES.length}/${TOPICS.length}`);
const seen = new Map();
for (const t of TOPICS) for (const s of t.sentences) { if (seen.has(s.en)) problems.push(`trùng câu: ${s.en} (${seen.get(s.en)}, ${t.id})`); seen.set(s.en, t.id); }
for (const x of quiz) if (new Set(x.opts).size < 4 || !x.opts.includes(x.answer)) problems.push(`câu hỏi lỗi ${x.id}: ${x.opts.length} lựa chọn`);
console.log(`levels ${LEVELS.length}, topics ${TOPICS.length}, sentences ${seen.size}, questions ${quiz.length}`);
console.log(problems.length ? problems.join('\n') : 'content ok');
// Đáp án cho bộ kiểm thử
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(Object.fromEntries(quiz.map((x) => [x.id, { a: x.answer, t: x.topic, l: x.level }]))));
