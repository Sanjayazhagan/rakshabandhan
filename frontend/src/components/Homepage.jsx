import React from "react";
import InputBar from "./Inputbar";

export default function Homepage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <h1 className="text-4xl font-bold mb-4">My ChatBot</h1>
      <p className="text-gray-500 mb-8">
        Welcome! Ask me anything to get started.
      </p>
    </div>
  );
}
