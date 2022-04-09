import { useOktaAuth } from '@okta/okta-react';
import { useCallback } from 'react';
import { ITemplateCategory } from '../Types';

function useApi() {

  const { authState } = useOktaAuth();

  const fetchWithAuth = useCallback((input: RequestInfo, init?: RequestInit | undefined) => {

    let newInit = {};

    if(authState && authState.accessToken) {
      newInit = { headers: { Authorization: 'Bearer ' + authState.accessToken.accessToken } };

      if (init) {

        newInit = {
          ...init,
          ...{
            'headers': { ...init.headers, ...{ Authorization: 'Bearer ' + authState.accessToken.accessToken } }
          }
        }

      }
    }

    return fetch(input, newInit);

  }, [authState]);

  const postWithAuth = useCallback(async (input: RequestInfo, body: object) => {

    const init = {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }

    return fetchWithAuth(input, init)

  }, [fetchWithAuth]);

  const addTemplate = useCallback(async ({ category_id, content, whatsAppApproved }) => {

    const result = await postWithAuth(`/api/v1/template`, {
      category_id: category_id,
      content: content,
      whatsAppApproved: whatsAppApproved
    });

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }

  }, [postWithAuth]);



  const deleteTemplate = useCallback(async (id) => {

    const result = await fetchWithAuth(`/api/v1/template/${id}`, {
      method: "DELETE"
    });

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }

  }, [fetchWithAuth]);



  const getTemplate : () => Promise<ITemplateCategory[]> = useCallback(async () => {

    const result = await fetchWithAuth(`/api/v1/template`);
    const data = await result.json();

    if (result.ok) {

      return data as ITemplateCategory[];

    } else {
      throw new Error(data.message);
    }

  }, [fetchWithAuth]);


  return {
    getTemplate,
    addTemplate,
    deleteTemplate
  };
}




export default useApi;