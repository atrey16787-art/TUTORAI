import OpenAI from "openai";
import type { DifficultyLevel, TeachingMode, Message } from "../types";

export const generateSystemPrompt = (
subject: string,
difficulty: DifficultyLevel,
mode: TeachingMode
) => `
You are TutorAI, an expert, encouraging, and friendly AI teacher.
Your goal is to teach the user about: "${subject}".
The user's current level is: "${difficulty}".
The current teaching mode is: "${mode}".

Be interactive, educational, and helpful.
Always explain clearly and ask follow-up questions.
`;

export const streamChatCompletion = async (
apiKey: string,
messages: Omit<Message, "id" | "timestamp">[],
systemPrompt: string,
onChunk: (text: string) => void
) => {
try {
if (!apiKey) {
throw new Error("OpenRouter API Key is missing.");
}

const client = new OpenAI({
  apiKey: apiKey.trim(),
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "HTTP-Referer": window.location.origin,
    "X-Title": "TutorAI",
  },
});

const completion = await client.chat.completions.create({
  model: "openai/gpt-4o-mini",

  messages: [
    {
      role: "system",
      content: systemPrompt,
    },

    ...messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  ],

  temperature: 0.7,
  max_tokens: 800,
});

const text =
  completion.choices?.[0]?.message?.content ||
  "No response generated.";

onChunk(text);

} catch (error: any) {
console.error("OPENROUTER ERROR:", error);
const errorMessage =
  error?.message ||
  error?.error?.message ||
  "Connection error.";

onChunk(`Error: ${errorMessage}`);

}
};
