export default function QuestionBubble({ text }) {
  return (
    <div className="flex justify-end my-15">
      <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl max-w-3/4 break-words">
        {text}
      </div>
    </div>
  );
}
