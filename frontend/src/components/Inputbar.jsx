import React, { useState, useRef } from "react";
import { FaMicrophone, FaStop, FaPaperPlane } from "react-icons/fa";
import {speakText} from "./ElevenlabsAPI";
import { useSendMessageMutation } from "../store";

function InputBar() {
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimeoutRef = useRef(null);
  
  const [sendMessageMutation, { data, error, isLoading }] = useSendMessageMutation();

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      if (!audioChunksRef.current.length) {
        console.warn("No audio recorded.");
        return;
      }

      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

      const formData = new FormData();
      formData.append("audio", blob, `${Date.now()}.webm`);

      try {
        const res = await fetch("/api/upload-audio", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        setMessage(data.text);

        // Bot speaks → when finished → start recording again
        await speakText(data.text);
        startRecording();
      } catch (err) {
        console.error("Error uploading audio:", err);
      }
    };

    // Silence detection
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    const dataArray = new Uint8Array(analyser.fftSize);

    const detectSilence = () => {
      analyser.getByteTimeDomainData(dataArray);
      const isSilent = dataArray.every((val) => Math.abs(val - 128) < 5);

      if (isSilent) {
        if (!silenceTimeoutRef.current) {
          silenceTimeoutRef.current = setTimeout(() => {
            stopRecording();
            silenceTimeoutRef.current = null;
          }, 1500); // 1.5s silence = stop
        }
      } else {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }

      if (mediaRecorder.state === "recording") {
        requestAnimationFrame(detectSilence);
      }
    };

    mediaRecorder.start();
    setListening(true);
    detectSilence();
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    setListening(false);
  };

  

  const sendMessage = async (msg) => {
    if (!msg.trim()) return;
    setMessage("");
    const test={groupid:1,prompt:msg};
    try {
            const response= await sendMessageMutation(test).unwrap();
            setMessage('');
            console.log('Message sent:', response.data);
            await speakText(response.data);
        } catch (err) {
            console.error('Failed to send message:', err);
        }
  };

  return (
    <>
      <div className="fixed flex justify-center bottom-4 inset-x-0 px-2">
        <div className="bg-blue-300 rounded-3xl w-full sm:w-[80vw] md:w-[50vw] lg:w-[33.33vw] p-2 flex items-center gap-2 shadow-lg">
          <form
            className="flex-grow"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(message);
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type here"
              className="w-full px-3 py-2 rounded-full focus:outline-none text-sm sm:text-base"
              disabled={listening}
            />
          </form>

          {message.trim() ? (
            <button
              onClick={() => sendMessage(message)}
              className="w-12 h-12 md:w-10 md:h-10 bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center justify-center"
            >
              <FaPaperPlane size={20} />
            </button>
          ) : (
            <button
              onClick={listening ? stopRecording : startRecording}
              className="w-12 h-12 md:w-10 md:h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center justify-center relative"
            >
              {listening ? <FaStop size={20} /> : <FaMicrophone size={20} />}
            </button>
          )}
        </div>
      </div>

      {listening && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-64 h-64 md:w-72 md:h-72 rounded-full bg-blue-400 opacity-50 animate-pulse"></div>
        </div>
      )}
    </>
  );
}

export default InputBar;
