import AnswerBubble from "./Answerchatbubble";
import QuestionBubble from "./Questionchatbubble";

export default function ChatWindow({ chatData }) {
  return (
    <div className="flex-1 overflow-y-auto w-full pb-20 bg-gray-950">
      {chatData.length === 0 ? (
        null
      ) : (
        chatData.map((chat, index) => (
          <div key={index}>
            <QuestionBubble text={chat.question} />
            <AnswerBubble text={chat.answer} />
          </div>
        ))
      )}
    </div>
  );
}
