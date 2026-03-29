import { useState } from "react";
import ChatWindow from "./chatwindow";
import { Bot } from "lucide-react";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        aria-label="Open AI Assistant"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50
        p-4 rounded-full
        bg-gradient-to-r from-purple-600 to-blue-600
        shadow-xl hover:scale-110 transition duration-300"
      >
        <Bot className="text-black" size={22} />
      </button>
      {open && <ChatWindow onClose={() => setOpen(false)} />}
    </>
  );
}