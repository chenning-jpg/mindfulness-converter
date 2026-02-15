import type { VercelRequest, VercelResponse } from "@vercel/node";

const API_BASE = "https://api.deepseek.com/v1";
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 分钟
const RATE_LIMIT_MAX_REQUESTS = 20; // 每分钟最多 20 次

// 简单内存限流（单实例有效，生产高并发建议用 Upstash Redis）
const rateLimitMap = new Map<
  string,
  { count: number; resetAt: number }
>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (now > record.resetAt) {
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded)) return forwarded[0].trim();
  return req.socket?.remoteAddress ?? "unknown";
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "服务配置错误",
      message: "请配置 DEEPSEEK_API_KEY 环境变量",
    });
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      error: "请求过于频繁",
      message: "请稍后再试，每分钟最多 20 次请求",
    });
  }

  try {
    const body = req.body as { messages?: unknown[]; jsonMode?: boolean };
    const { messages, jsonMode } = body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "参数错误",
        message: "messages 必须是非空数组",
      });
    }

    const deepseekRes = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        ...(jsonMode && { response_format: { type: "json_object" } }),
      }),
    });

    const data = await deepseekRes.json();
    const content =
      data?.choices?.[0]?.message?.content ?? "";

    if (!deepseekRes.ok) {
      return res.status(deepseekRes.status).json({
        error: "DeepSeek API 错误",
        message: data?.error?.message ?? data?.error ?? String(data),
      });
    }

    return res.status(200).json({ text: (content as string).trim() });
  } catch (err) {
    console.error("API proxy error:", err);
    return res.status(500).json({
      error: "服务暂时不可用",
      message: err instanceof Error ? err.message : "未知错误",
    });
  }
}
