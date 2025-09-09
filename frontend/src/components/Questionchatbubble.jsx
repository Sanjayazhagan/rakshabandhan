import TypingIndicator from "./Typinganimation";
export default function QuestionBubble({ text }) {
  return (
    <div className="flex justify-end my-15">
      <div className="bg-gray-500 text-white px-4 py-2 rounded-2xl max-w-3/4 break-words">
        {text === "Loading..." ? <TypingIndicator /> : text}
      </div>
    </div>
  );
}
