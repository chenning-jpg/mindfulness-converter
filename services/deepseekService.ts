import { Message, Wisdom } from "../types";

// 使用后端代理，避免在前端暴露 API Key
const API_BASE = "/api";

// 正念向导系统提示（与原先 Gemini 版本一致）
const THERAPIST_INSTRUCTION = `
你是“正念转化器”。你的角色是倾听那些感到压力、愤怒或受伤的用户（例如被老板骂了）。
1. 用极具同理心的方式确认他们的感受。
2. 温柔地引导他们转向斯多葛学派、佛教或成长型思维的视角。
3. 帮助他们将消极经历重构为学习机会或性格考验。
4. 回复要温暖、抚慰人心，但要简洁（通常不超过3句）。
5. 不要说教。做一个提供温柔援手的倾听者。
6. **请全程使用简体中文回答。**
`;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function chatCompletions(messages: ChatMessage[], options?: { jsonMode?: boolean }) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      jsonMode: options?.jsonMode ?? false,
    }),
  });
  if (!res.ok) {
    let errMsg = `请求失败: ${res.status}`;
    try {
      const errData = await res.json();
      errMsg = errData?.message ?? errData?.error ?? errMsg;
    } catch {
      errMsg = await res.text() || errMsg;
    }
    throw new Error(errMsg);
  }
  const data = await res.json();
  // 代理 API 返回 { text }，兼容原始 DeepSeek 格式
  const content = data?.text ?? data?.choices?.[0]?.message?.content ?? "";
  return { text: (typeof content === "string" ? content : "").trim() };
}

export interface ChatSession {
  sendMessage(params: { message: string }): Promise<{ text: string }>;
}

export function createChatSession(): ChatSession {
  const history: ChatMessage[] = [
    { role: "system", content: THERAPIST_INSTRUCTION },
  ];

  return {
    async sendMessage({ message }: { message: string }) {
      history.push({ role: "user", content: message });
      const { text } = await chatCompletions(history);
      history.push({ role: "assistant", content: text });
      return { text };
    },
  };
}

export async function extractWisdom(
  messages: Message[]
): Promise<Omit<Wisdom, "id" | "date">> {
  const conversationHistory = messages
    .map((m) => `${m.role === "user" ? "用户" : "助手"}: ${m.text}`)
    .join("\n");

  const userPrompt = `
以下是一个压力过大的用户与正念向导之间的对话。
请将这段对话提炼成一个“智慧结晶”，严格按 JSON 输出，只包含以下三个字段（均为字符串，中文）：
- title: 一个简短、充满诗意的 4～6 个字标题，总结学到的教训（例如“风雨中的宁静”）。
- insight: 提炼出的一段哲学逻辑或“心法”（2～3 句），源于这次经历。
- summary: 一句话总结最初发生的负面情况。

对话内容：
${conversationHistory}
`;

  const { text } = await chatCompletions(
    [
      { role: "system", content: "你只输出合法 JSON，不要其他说明。使用简体中文。" },
      { role: "user", content: userPrompt },
    ],
    { jsonMode: true }
  );

  let data: { title?: string; insight?: string; summary?: string } = {};
  try {
    data = JSON.parse(text || "{}");
  } catch {
    data = {};
  }

  return {
    title: data.title || "耐心的种子",
    situation: data.summary || "处理了一次艰难的时刻。",
    insight:
      data.insight ||
      "通过逆境，我们找到力量，将根深深扎入内心的平静之中。",
  };
}
