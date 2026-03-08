import { useState } from "react";
import useAuth from "../../hooks/useAuth";

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
      const token = await getToken();
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      
      const response = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ message: userMsg.text }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { text: data.data.message || "Processing...", sender: "bot" },
        ]);
      } else {
        throw new Error(data.error?.message || "Unknown error");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { 
          text: `Error: ${err.message || "Server error. Try again."}`, 
          sender: "bot" 
        },
      ]);
    }

    setLoading(false);
  };

  return { messages, input, setInput, sendMessage, loading };
}