import ChatWindow from "./components/Chatwindow";
import InputBar from "./components/Inputbar";
import Homepage from "./components/Homepage";
import Sidebar from "./components/Sidebar";
import TypingIndicator from "./components/Typinganimation";
import { useFetchChatQuery,useFetchNewGroupQuery,useFetchUserGroupsQuery } from "./store";
import { motion, AnimatePresence } from "framer-motion";
import { useState,useEffect, use } from "react";
import { user } from "elevenlabs/api";

function App() {
  const { data: newGroupData,isLoading: isNewGroupLoading } = useFetchNewGroupQuery(1);


  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [groupId, setGroupId] = useState(1);
  const { data: userGroupsData, isLoading: isUserGroupsLoading, error:gerror } = useFetchUserGroupsQuery(1);
  const { data, isLoading, error } = useFetchChatQuery(groupId)

  useEffect(() => {
    if (!isNewGroupLoading && newGroupData) {
      setGroupId(newGroupData.id);
    }
  }, [isNewGroupLoading, newGroupData]);
  console.log("New Group Data:", groupId);
  const [chatData, setChatData] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatLogs, setChatLogs] = useState([]);
  console.log("Chat Logs:", chatData);
  useEffect(() => {
    if (!isUserGroupsLoading && userGroupsData) {
      setChatLogs(userGroupsData);
  }
}, [isUserGroupsLoading, userGroupsData]);
  console.log("User Groups Data:", userGroupsData);
  if (error) {
    console.error("Error fetching chat data:", error);
  }
  useEffect(() => {
    if (!isLoading && data && data.data) {
      setChatData(data.data);
    }
  }, [isLoading, data]);
    const handleAddMessage = (message) => {
      if (chatData.length !== 0) {
        setChatData((chatData) => [...chatData, message]);
      }
      else {
        setChatData([message]);
      }
    };

  const isHomepage = chatData.length === 0;

  const handleNewChat = () => {
    newGroupData && setGroupId(newGroupData.id);
  };
  const handleAnswerUpdate = (newAnswer) => {
    setChatData((chatData) =>
      chatData.map((msg) =>
        msg.answer === "Loading..." ? { ...msg, answer: newAnswer } : msg
      )
    );
  };
  const handleGroupClick = (groupId) => {
    setGroupId(groupId);
  };

  const addChatLog = (chatLog) => {
    setChatLogs((prevLogs) => [...prevLogs, chatLog]);
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
            <Sidebar chatLogs={chatLogs} onNewChat={handleNewChat} onGroupClick={handleGroupClick} />
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
          className="sticky  top-4 z-40 bg-gray-500 text-white rounded-r-full w-8 h-8 flex items-center justify-center shadow hover:bg-gray-700"
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
                <ChatWindow chatData={chatData} isAudioLoading={isAudioLoading} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center w-full">
          <div className="z-10 flex">
            <InputBar
              isAudioLoading={isAudioLoading}
              setIsAudioLoading={setIsAudioLoading}
              onSendMessage={handleAddMessage}
              groupId={groupId}
              onAnswerUpdate={handleAnswerUpdate}
              onAddChatLog={addChatLog}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
