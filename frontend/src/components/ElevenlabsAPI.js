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

    const audioData = new Uint8Array(chunks.flat());
    const blob = new Blob([audioData], { type: mimeType });
    const audioUrl = URL.createObjectURL(blob);

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