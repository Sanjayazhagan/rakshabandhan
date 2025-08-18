import React, { useState, useRef } from "react";
import { FaMicrophone, FaStop, FaPaperPlane } from "react-icons/fa";
import { ElevenLabsClient, OutputFormat } from "@elevenlabs/elevenlabs-js";

const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
const voiceId = "JBFqnCBsd6RMkjVDRZzb"; // Rachel's voice

function InputBar() {
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

    mediaRecorder.onstop = async () => {
      // check if we actually recorded anything
      if (!audioChunksRef.current || audioChunksRef.current.length === 0) {
        console.warn("No audio recorded.");
        return;
      }

      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

      console.log(blob);
      

      // optional local preview (to check if blob works)
      // const audio = new Audio(URL.createObjectURL(blob));
      // audio.play();

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
        speakText(data.text); // TTS
      } catch (err) {
        console.error("Error uploading audio:", err);
      }
    };

    mediaRecorder.start();
    setListening(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setListening(false);
  };

  async function playReadableStreamAudio(
    readableStream,
    mimeType = "audio/mpeg"
  ) {
    // 1️⃣ Get a reader for the stream
    const reader = readableStream.getReader();
    const chunks = [];

    // 2️⃣ Read chunks until done
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // 3️⃣ Merge chunks into a single Uint8Array
    const audioData = new Uint8Array(
      chunks.reduce((acc, chunk) => [...acc, ...chunk], [])
    );

    // 4️⃣ Create a Blob and an object URL
    const blob = new Blob([audioData], { type: mimeType });
    const audioUrl = URL.createObjectURL(blob);

    // 5️⃣ Play using the HTMLAudioElement API
    const audio = new Audio(audioUrl);
    await audio.play();
  }


  const speakText = async (text) => {
    try {
      const elevenlabs = new ElevenLabsClient({ apiKey });

      // Get MP3 output (easy for browsers to handle)
      const audioData = await elevenlabs.textToSpeech.convert(voiceId, {
        text,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128",
      });
      console.log("Audio data:", audioData);
      await playReadableStreamAudio(audioData);
  }
  
  catch (error) {
      console.error("Error:", error);
  }
  };





  const sendMessage = (msg) => {
    if (!msg.trim()) return;
    console.log("User message:", msg);
    setMessage("");
    speakText(msg);
  };

  return (
    <>
      {/* Main input bar */}
      <div className="fixed flex justify-center bottom-4 inset-x-0 px-2">
        <div className="bg-blue-300 rounded-3xl w-full sm:w-[80vw] md:w-[50vw] lg:w-[33.33vw] p-2 flex items-center gap-2 shadow-lg">
          {/* Input box */}
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
              className=" w-full px-3 py-2 rounded-full focus:outline-none text-sm sm:text-base "
              disabled={listening}
            />
          </form>

          {/* Send / Mic button */}
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

      {/* Pulsing circle overlay while recording */}
      {listening && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-64 h-64 md:w-72 md:h-72 rounded-full bg-blue-400 opacity-50 animate-pulse"></div>
        </div>
      )}
    </>
  );
}

export default InputBar;
