import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:8000' }),
  endpoints(builder){
    return{
        sendMessage: builder.mutation({
            invalidatesTags: (result, error, arg) =>{ 
                return [{ type: 'Chat', id: arg.id }];
            },
            query: (message) => {
                return {
                url: '/chat',
                method: 'POST',
                body: {
                    groupid: message.groupid,
                    prompt: message.prompt
                },
                };
            },
        }),
        sendAudio: builder.mutation({
            invalidatesTags: (result, error, arg) => {
                return [{ type: 'Chat', id: arg.id }];
            },
            query: (audio) => {
                return {
                    url: '/chat/audio',
                    method: 'POST',
                    body: {
                        groupid: audio.groupid,
                        audio: audio.file
                    },
                };
            },
        }),
    }
  }
});

export const { useSendMessageMutation, useSendAudioMutation } = chatApi;
export { chatApi };
