import ChatWindow from "./components/Chatwindow";
import InputBar from "./components/Inputbar";
import Homepage from "./components/Homepage";
import Sidebar from "./components/Sidebar";
import { useFetchChatQuery } from "./store";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function App() {
  const { data, isLoading, error } = useFetchChatQuery(1);

  console.log("Fetched chat data:", data);

  const [chatData, setChatData] = useState([
    { question: "Hello", answer: "Hi there!" },
    { question: "How are you?", answer: "I'm good, how about you?" },
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatLogs, setChatLogs] = useState([
    { id : 1, title : "Chat 1" },
    { id : 2, title : "Chat 2" },

  ]);

  if (error) {
    console.error("Error fetching chat data:", error);
  }
  if (!isLoading && data && data.data) !chatData.length && setChatData(data.data);
  const handleAddMessage = (message) => {
    setChatData((chatData) => [...chatData, message]);
  };

  const isHomepage = chatData.length === 0;

  const handleNewChat = () => {
    setChatData([]);
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: -250, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -250, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 top-0 h-full w-[250px] bg-gray-800 border-r shadow-lg z-30"
          >
            <Sidebar chatLogs={chatLogs} onNewChat={handleNewChat} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 overflow-y-auto bg-gray-950 relative">
        <motion.button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          initial={false}
          animate={{
            x: isSidebarOpen ? 250 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute top-4 z-40 bg-gray-500 text-white rounded-r-full w-8 h-8 flex items-center justify-center shadow hover:bg-gray-700"
        >
          {isSidebarOpen ? "<" : ">"}
        </motion.button>

        <AnimatePresence mode="wait">
          {isHomepage ? (
            <motion.div
              key="homepage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col flex-1 justify-center items-center"
            >
              <Homepage />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex-1 bg-gray-950 flex justify-center"
            >
              <div className="w-full sm:w-[80vw] md:w-[50vw] lg:w-[33.33vw] p-2">
                <ChatWindow chatData={chatData} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center w-full">
          <div className="z-10 flex">
            <InputBar
              onSendMessage={
                isHomepage
                  ? (msg) => setChatData([{ question: msg, answer: "" }])
                  : handleAddMessage
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
