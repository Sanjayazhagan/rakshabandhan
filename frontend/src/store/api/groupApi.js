import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const groupApi = createApi({
  reducerPath: 'groupApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:8000' }),
  endpoints(builder){
    return{
        fetchNewGroup: builder.query({
        query: (user) => {
          return {
            url: '/groups',
            params: {
              userId: user.id,
            },
            method: 'GET',
          };
        },
      }),
    }
  }
});

export const { useFetchNewGroupQuery } = groupApi;
export { groupApi };