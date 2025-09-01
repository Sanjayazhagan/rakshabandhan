export default function TypingIndicator() {
  return (
    <div className="flex space-x-1 p-2">
      <span className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce"></span>
      <span className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.2s]"></span>
      <span className="w-2.5 h-2.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.4s]"></span>
    </div>
  );
}
