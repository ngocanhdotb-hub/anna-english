// Dịch vụ nhắc học: lịch trên máy chủ gọi mỗi giờ, gửi thông báo tới ai đến giờ nhắc mà hôm nay chưa học.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

Deno.serve(async (req) => {
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) {
    return new Response("forbidden", { status: 401 });
  }
  webpush.setVapidDetails(
    "https://ngocanhdotb-hub.github.io/anna-english/",
    Deno.env.get("VAPID_PUBLIC_KEY")!,
    Deno.env.get("VAPID_PRIVATE_KEY")!,
  );
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await db.rpc("due_reminders");
  if (error) return new Response(error.message, { status: 500 });
  let sent = 0, failed = 0, removed = 0;
  for (const row of data ?? []) {
    const body = row.streak > 0
      ? `Luyện vài câu để giữ chuỗi ${row.streak} ngày của bạn nhé! 🔥`
      : "Đến giờ luyện nói rồi. Chỉ vài phút thôi!";
    try {
      await webpush.sendNotification(
        { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
        JSON.stringify({ title: "Anna English", body }),
      );
      sent++;
    } catch (e) {
      failed++;
      // Thiết bị đã hủy đăng ký thì xóa để không gửi lại
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) {
        await db.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
        removed++;
      }
    }
  }
  return Response.json({ sent, failed, removed });
});
