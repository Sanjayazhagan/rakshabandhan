import base64
from chatmodel import llm
from langchain_core.messages import HumanMessage

# Ensure you have an audio file named 'example_audio.mp3' or provide the correct path.
audio_file_path = "01.mp3"
audio_mime_type = "audio/mp3"


with open(audio_file_path, "rb") as audio_file:
    encoded_audio = base64.b64encode(audio_file.read()).decode("utf-8")

message = HumanMessage(
    content=[
        {"type": "text", "text": "make a transcript of the audio."},
        {
            "type": "media",
            "data": encoded_audio,  # Use base64 string directly
            "mime_type": audio_mime_type,
        },
    ]
)
response = llm.invoke([message])  # Uncomment to run
print(f"Response for audio: {response.content}")
print("="*100)