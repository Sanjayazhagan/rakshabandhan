import { chatApi } from "./api/chatApi";
import { groupApi } from "./api/groupApi";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from '@reduxjs/toolkit/query';
const store = configureStore({
  reducer: {
    [chatApi.reducerPath]: chatApi.reducer,
    [groupApi.reducerPath]: groupApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(chatApi.middleware, groupApi.middleware),
});

setupListeners(store.dispatch);

export { useSendMessageMutation, useSendAudioMutation } from "./api/chatApi";
export { useFetchNewGroupQuery,useFetchChatQuery,useFetchUserGroupsQuery } from "./api/groupApi";
export default store;