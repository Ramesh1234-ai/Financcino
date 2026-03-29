import { useState } from "react";
import useAuth from "../../hooks/useAuth";
import * as api from "../../services/api";

export default function useChatbot() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([
    { text: "Hi 👋 I'm your AI financial assistant. Ask me about budgeting, expense tracking, or receipts!", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Fetch token with error handling
      let token = null;
      try {
        token = await getToken();
        if (!token) {
          console.warn("⚠️  [usechatbot] Token is null after getToken()");
          throw new Error("Not authenticated - please login");
        }
        console.log("✅ [usechatbot] Token obtained, length:", token.length);
      } catch (tokenErr) {
        console.error("❌ [usechatbot] Failed to get token:", tokenErr.message);
        setMessages((prev) => [
          ...prev,
          {
            text: `Authentication error: ${tokenErr.message}. Please refresh and login again.`,
            sender: "bot",
          },
        ]);
        setLoading(false);
        return;
      }

      // Send message to API
      console.log("💬 [usechatbot] Sending message to API...");
      const data = await api.sendChatMessage(userMsg.text, token);

      if (data?.error) {
        console.error("❌ [usechatbot] API error:", data.error);
        throw new Error(data.error);
      }

      if (!data?.success && !data?.data?.message) {
        console.error("❌ [usechatbot] Invalid response format:", data);
        throw new Error("Invalid server response");
      }

      const botMessage = data?.data?.message || data?.message || "Processing...";
      console.log("✅ [usechatbot] Bot response received:", botMessage.slice(0, 50) + "...");
      
      setMessages((prev) => [
        ...prev,
        { text: botMessage, sender: "bot" },
      ]);
    } catch (err) {
      console.error("❌ [usechatbot] Chat error:", err.message);
      setMessages((prev) => [
        ...prev,
        {
          text: `Error: ${err.message || "Server error. Try again later."}`,
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, input, setInput, sendMessage, loading };
}