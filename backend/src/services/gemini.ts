import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Message } from "../types";

function getClient(apiKey?: string): GoogleGenerativeAI {
  // If no API key provided, use the one from .env
  const finalApiKey = apiKey || process.env.GEMINI_API_KEY;

  if (!finalApiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Please set it in your .env file or provide it via the X-API-Key header."
    );
  }

  return new GoogleGenerativeAI(finalApiKey);
}

export async function generateResponse(
  messages: Message[],
  systemPrompt?: string,
  apiKey?: string,
  model: string = "gemini-2.5-flash"
): Promise<string> {
  const client = getClient(apiKey);
  const genModel = client.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
  });

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const chat = genModel.startChat({
    history,
  });

  const result = await chat.sendMessage(lastMessage.content);
  const response = await result.response;
  return response.text();
}

export async function generateTitle(
  messages: Message[],
  apiKey?: string
): Promise<string> {
  const client = getClient(apiKey);
  const genModel = client.getGenerativeModel({ model: "gemini-2.5-flash" });

  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const result = await genModel.generateContent(
    `Generate a short, concise title (3-6 words) for this conversation:\n\n${conversationText}\n\nRespond with ONLY the title, nothing else.`
  );

  const response = await result.response;
  return response.text().trim();
}

export async function generateSummary(
  messages: Message[],
  apiKey?: string
): Promise<string> {
  const client = getClient(apiKey);
  const genModel = client.getGenerativeModel({ model: "gemini-2.5-flash" });

  const conversationText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const result = await genModel.generateContent(
    `Summarize the key points and context of this conversation in 2-3 sentences:\n\n${conversationText}`
  );

  const response = await result.response;
  return response.text();
}

export async function generateConnectionLabel(
  prompt: string,
  apiKey?: string
): Promise<{ type: string; label: string }> {
  const client = getClient(apiKey);
  const genModel = client.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await genModel.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    // Try to parse JSON response
    const parsed = JSON.parse(text);
    return {
      type: parsed.type || "extends",
      label: parsed.label || "branch",
    };
  } catch (error) {
    // If parsing fails, return default
    return {
      type: "extends",
      label: "branch",
    };
  }
}
