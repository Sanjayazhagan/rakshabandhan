import ReactMarkdown from 'react-markdown';

export default function AnswerBubble({ text }) {
  return (
    <div className="flex justify-start my-2 w-full">
      <div className="bg-gray-950 text-white px-4 py-2 rounded-2xl w-full break-words">
        <ReactMarkdown>
          {text}
        </ReactMarkdown>
      </div>
    </div>
  );
}
 