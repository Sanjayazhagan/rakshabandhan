import InputBar from './components/inputbar'
import ChatWindow from './components/Chatwindow'


function App() {

  const chatData = [
    { question: "What is your name?", answer: "keerthivasan" },
    { question: "What is your age?", answer: "23" },
    {
      question: "What is your favorite color?",
      answer:
        "blue What is your favorite book? What is your favorite book? What is your favorite book? vWhat is your favorite book?What is your favorite book?What is your favorite book?",
    },
    { question: "What is your favorite food?", answer: "pizza" },
    {
      question: "What is your favorite movie?",
      answer: "The Shawshank Redemption",
    },
    {
      question: "What is your favorite book?",
      answer: "To Kill a Mockingbird",
    },
    { question: "What is your favorite sport?", answer: "Soccer" },
    { question: "What is your favorite animal?", answer: "Dog" },
    { question: "What is your favorite color?", answer: "Blue" },
    { question: "What is your favorite color?", answer: "Blue" },
    { question: "What is your favorite color?", answer: "Blue" },
    { question: "What is your favorite color?", answer: "Blue" },
    { question: "What is your favorite color?", answer: "Blue" },
    { question: "What is your favorite sport?", answer: "Soccer" },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Scrollable chat window */}
      <div className="flex-1 overflow-y-auto bg-white flex justify-center ">
        <div className="w-full sm:w-[80vw] md:w-[50vw] lg:w-[33.33vw] p-2">
          <ChatWindow chatData={chatData} />
        </div>
      </div>

      {/* Fixed input bar */}
      <div className="flex justify-center bg-white p-2">
        <div className="w-full sm:w-[80vw] md:w-[50vw] lg:w-[33.33vw]">
          <InputBar />
        </div>
      </div>
    </div>
  );
}

export default App
