import { ElevenLabsClient } from "elevenlabs";

const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
const voiceId = "JBFqnCBsd6RMkjVDRZzb"; // Rachel's voice
export async function playReadableStreamAudio(
    readableStream,
    mimeType = "audio/mpeg"
  ) {
    const reader = readableStream.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const audioData = new Blob(chunks, { type: mimeType });
    const audioUrl = URL.createObjectURL(audioData);

    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      audio.onended = resolve;
      audio.play();
    });
  }

  export const speakText = async (text) => {
    try {
      const elevenlabs = new ElevenLabsClient({ apiKey });
      const audioData = await elevenlabs.textToSpeech.convert(voiceId, {
        text,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128",
      });
      await playReadableStreamAudio(audioData);
    } catch (error) {
      console.error("Error:", error);
    }
  };