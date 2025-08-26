import ChatWindow from './components/Chatwindow'
import { FaMicrophone } from "react-icons/fa";
import InputBar from "./components/Inputbar";
import { useFetchChatQuery } from './store';
import { useState } from 'react';
function App() {
  const {data ,isLoading,error} = useFetchChatQuery(1);
  console.log("Fetched chat data:", data);
  const [chatData, setChatData] = useState([]);
  if (error) {
    console.error("Error fetching chat data:", error);
  }
  if (!isLoading && data && data.data) !chatData.length && setChatData(data.data);
  const handleAddMessage = (message) => {
    setChatData((chatData) => [...chatData, message]);
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      {/* Scrollable chat window */}
      <div className="flex-1 overflow-y-auto bg-white flex justify-center ">
        <div className="w-full sm:w-[80vw] md:w-[50vw] lg:w-[33.33vw] p-2">
          <ChatWindow chatData={chatData} />
        </div>
      </div>

      {/* Fixed input bar */}
      <div className="flex justify-center w-full bg-white">
        <div className="z-10 bg-white flex">
          <InputBar onSendMessage={handleAddMessage} />
        </div>
      </div>
  </div>
  );
}

export default App;
