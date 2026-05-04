import { api } from "../lib/api";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export const aiService = {
  chat: async (message: string, history: ChatMessage[]) => {
    const response = await api.post("/ai/chat", { message, history });
    return response.data;
  },
};
