export default function Sidebar({ chatLogs, onNewChat , onGroupClick }) {
  return (
    <div className="h-full bg-gray-800 p-4 flex flex-col">
      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        + New Chat
      </button>

      {/* Chat Logs */}
      <div className="flex-1 overflow-y-auto">
        {chatLogs.length === 0 ? (
          <p className="text-white">No chats yet</p>
        ) : (
          <ul className="space-y-2">
            {chatLogs.map((chat) => (
              <li
                key={chat.id}
                className="px-3 py-2 bg-gray-600 rounded-md shadow cursor-pointer hover:bg-gray-400"
                onClick={() => onGroupClick(chat.id)}
              >
                {chat.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
