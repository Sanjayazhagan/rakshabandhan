import { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaPaperPlane } from "react-icons/fa";
import { speakText } from "./ElevenlabsAPI";
import { useSendMessageMutation, useSendAudioMutation } from "../store";

function InputBar() {
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
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
        formData.append("groupid", 1); 
        try {
          console.log("Audio Blob:",formData);
          const response = await sendAudioMutation(formData).unwrap();
          setMessage('');
          console.log('Audio message sent:', response.data);
          await speakText(response.data);
        } catch (err) {
          console.error('Failed to send audio:', err);
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
    const test = { groupid: 1, prompt: msg };
    try {
      const response = await sendMessageMutation(test).unwrap();
      setMessage('');
      console.log('Message sent:', response.data);
      await speakText(response.data);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  useEffect(() => {
    return () => {
      stopRecording(); // Cleanup on unmount
    };
  }, []);

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