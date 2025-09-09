import TypingIndicator from "./Typinganimation";
import BlueRingLoader from "./Blueringloader";

export default function AnswerBubble({ text, showLoader=false }) {
  return (
    <div className="flex justify-start my-2 w-full">
      <div className="bg-gray-950 text-white px-4 py-2 rounded-2xl w-full break-words">
        {text === "Loading..." ? <TypingIndicator /> : text}
         {showLoader ? (
          <div className="flex justify-end">
            <BlueRingLoader/>
          </div>
        ) : (
          text
        )}
      </div>
    </div>
  );
}
 