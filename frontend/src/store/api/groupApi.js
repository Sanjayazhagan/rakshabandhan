import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const groupApi = createApi({
  reducerPath: 'groupApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:8000' }),
  endpoints(builder){
    return{
        fetchNewGroup: builder.query({
        query: (id) => {
          return {
            url: `/users/${id}`,
            method: 'POST',
          };
        },
      }),
      fetchChat: builder.query({
        query: (id) => {
          return {
            url: `/groups/${id}`,
            method: 'GET',
          };
        },
      }),
      fetchUserGroups: builder.query({
        query: (userId) => {
          return {
            url: `/user/${userId}`,
            method: 'GET',
          };
        },
      }),
    };
  },
});

export const { useFetchNewGroupQuery, useFetchChatQuery, useFetchUserGroupsQuery } = groupApi;
export { groupApi };