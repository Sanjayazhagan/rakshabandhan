import { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaPaperPlane } from "react-icons/fa";
import { speakText } from "./ElevenlabsAPI";
import { useSendMessageMutation, useSendAudioMutation } from "../store";
import TypingIndicator from "./Typinganimation";
import { m } from "framer-motion";


function InputBar({ onSendMessage, groupId, onAnswerUpdate, onAddChatLog }) {
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const silenceTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);

  const [sendMessageMutation] = useSendMessageMutation();
  const [sendAudioMutation] = useSendAudioMutation();

  const startRecording = async () => {
    if (listening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
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
        formData.append("groupid", groupId); 
        try {
          console.log("Audio Blob:", formData);
          setIsAudioLoading(true);
          const response = await sendAudioMutation(formData).unwrap();

          setMessage('');
          onSendMessage({question: "Loading...", answer: "Loading..."});
          console.log('Audio message sent:', response.data);
          onAddChatLog({id: groupId,name: response.question});
          onSendMessage({question: response.question, answer: response.data});
          await speakText(response.data);
        } catch (err) {
          console.error("Failed to send audio:", err);
        } finally {
          setIsAudioLoading(false);
        }
      };

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.fftSize);
      const detectSilence = () => {
        analyser.getByteTimeDomainData(dataArray);
        console.log("Recording started");

        const sum = dataArray.reduce((acc, val) => acc + Math.abs(val - 128), 0);
        const averageAmplitude = sum / dataArray.length;

        const vol = Math.min(averageAmplitude / 50, 1);
        setVolume(vol);

        const silenceThreshold = 10;

        if (averageAmplitude < silenceThreshold) {
          if (!silenceTimeoutRef.current) {
            silenceTimeoutRef.current = setTimeout(() => {
              stopRecording();
            }, 1500);
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

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setListening(false);
    }
  };

  const stopRecording = async() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    setListening(false);
    console.log("Recording stopped");
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // A simple check to ensure the context is not already closed
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close();
      console.log('AudioContext closed successfully');
    }
    
    clearTimeout(silenceTimeoutRef.current);
    silenceTimeoutRef.current = null;
  };

  const sendMessage = async (msg) => {
    if (!msg.trim()) return;
    setMessage("");
    console.log(groupId);
    const test = { groupid: groupId, prompt: msg };
    onSendMessage({question: msg, answer: "Loading..."});
    onAddChatLog({id: groupId,name: msg});
    try {
      setIsAudioLoading(true);
      const response = await sendMessageMutation(test).unwrap();

      setMessage('');
      console.log('Message sent:', response.data);
      onAnswerUpdate(response.data);
      await speakText(response.data);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsAudioLoading(false);
    }

  };

  useEffect(() => {
    return () => {
      stopRecording(); // Cleanup on unmount
    };
  }, []);

  return (
    <>
      <div className="fixed w-full flex justify-center bottom-0 left-0 right-0 inset-x-0  ">
        <div className=" w-full z-10 bg-gray-950 rounded-t-3xl pb-5 sm:w-[80vw] md:w-[50vw] lg:w-[33.33vw]">
          <div className="bg-gray-500 rounded-3xl w-full sm:w-[80vw] md:w-[50vw] lg:w-[33.33vw] p-2 flex items-center gap-2 shadow-lg">
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
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div
              className=" w-64 h-64 md:w-72 md:h-72 rounded-full opacity-80 transition-transform duration-100 shadow-2xl"
              style={{
                width: "15rem",
                height: "15rem",
                transform: `scale(${1 + volume * 1.5})`,
                background: "radial-gradient(circle at center, #3b82f6, #1e3a8a)"
              }}
            ></div>
          </div>
        )}
      </div>
    </>
  );
}

export default InputBar;