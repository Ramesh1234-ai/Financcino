export default function MessageBubble({ msg }) {
  const isUser = msg.sender === "user";

  return (
    <div
      className={`p-3 rounded-xl text-sm max-w-[75%]
      ${isUser
        ? "ml-auto bg-purple-600 text-black"
        : "bg-white/20 text-black"}`}
    >
      {msg.text}
    </div>
  );
}