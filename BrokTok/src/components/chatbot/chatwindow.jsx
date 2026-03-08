import { useRef, useEffect } from "react";
import useChatbot from "./usechatbot.js";
import MessageBubble from "./MessageBubble";
import { Bot, X, Send } from "lucide-react";

export default function ChatWindow({ onClose }) {
  const { messages, input, setInput, sendMessage, loading } = useChatbot();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-24 right-6 z-50 w-80 h-[480px]
    bg-white/10 backdrop-blur-xl border border-white/20
    rounded-2xl shadow-2xl flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bot className="text-purple-400" />
          <h2 className="text-black font-semibold text-sm">
            Financial AI Assistant
          </h2>
        </div>
        <button onClick={onClose}>
          <X className="text-white opacity-70 hover:opacity-100" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}

        {loading && (
          <div className="text-xs text-black-300">AI is typing…</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 pb-2 flex flex-wrap gap-2">
        {["Analyze spending", "Budget tips", "Save more"].map((s, i) => (
          <button
            key={i}
            onClick={() => setInput(s)}
            className="text-xs px-3 py-1 rounded-full
            bg-white/20 text-black hover:bg-white/30"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about finances..."
          className="flex-1 px-3 py-2 rounded-lg
          bg-white/20 text-black placeholder-gray-300
          focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-purple-600 rounded-lg hover:bg-purple-700"
        >
          <Send size={18} className="text-black" />
        </button>
      </div>
    </div>
  );
}