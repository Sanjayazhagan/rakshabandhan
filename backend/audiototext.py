# audiototext.py
import base64
from chatmodel import llm
from langchain_core.messages import HumanMessage
from llmWrap import finalize_response

def convert_blob_to_base64(blob_data):
    encoded_bytes = base64.b64encode(blob_data)
    encoded_string = encoded_bytes.decode('utf-8')
    return encoded_string
    
# Make sure this function is defined with 'async'
async def audio_to_text(audio_bytes: bytes, audio_mime_type: str):
    message = HumanMessage(
        content=[
            {"type": "text", "text": "make a transcript of the audio."},
            {
                "type": "media",
                "data": convert_blob_to_base64(audio_bytes),
                "mime_type": audio_mime_type,
            },
        ]
    )
    # Make sure llm.ainvoke is correctly awaited
    response = await llm.ainvoke([message])
    return response.content