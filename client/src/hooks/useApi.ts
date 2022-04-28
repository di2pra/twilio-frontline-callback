import { useOktaAuth } from '@okta/okta-react';
import { useCallback } from 'react';
import { IClaim, IConfiguration, IConfigurationInfo, ITemplateCategory } from '../Types';

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

  const putWithAuth = useCallback(async (input: RequestInfo, body: object) => {

    const init = {
      method: "PUT",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }

    return fetchWithAuth(input, init)

  }, [fetchWithAuth]);

  const addTemplate = useCallback(async ({ category_id, content, whatsapp_approved }) => {

    const result = await postWithAuth(`/api/v1/template`, {
      category_id: category_id,
      content: content,
      whatsapp_approved: whatsapp_approved
    });

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }

  }, [postWithAuth]);

  const updateTemplate = useCallback(async (id, { category_id, content, whatsapp_approved }) => {

    const result = await putWithAuth(`/api/v1/template/${id}`, {
      category_id: category_id,
      content: content,
      whatsapp_approved: whatsapp_approved
    });

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }

  }, [putWithAuth]);



  const deleteTemplate = useCallback(async (id) => {

    const result = await fetchWithAuth(`/api/v1/template/${id}`, {
      method: "DELETE"
    });

    const data = await result.text();

    if (result.ok) {
      return null;
    } else {
      throw new Error("Error");
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

  const getConfiguration : () => Promise<IConfiguration> = useCallback(async () => {

    const result = await fetchWithAuth(`/api/v1/configuration`);
    const data = await result.json();

    if (result.ok) {
      return data as IConfiguration;
    } else {
      throw new Error(data.message);
    }

  }, [fetchWithAuth]);

  const addConfiguration = useCallback(async (info: IConfigurationInfo) => {

    const result = await postWithAuth(`/api/v1/configuration`, {info});

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }

  }, [postWithAuth]);

  const getClaim : () => Promise<IClaim | null> = useCallback(async () => {

    const result = await fetchWithAuth(`/api/v1/claim`);
    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }

  }, [fetchWithAuth]);

  const addClaim : () => Promise<IClaim | null> = useCallback(async () => {

    const result = await postWithAuth(`/api/v1/claim`, {});

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }

  }, [postWithAuth]);

  const closeClaim : (id: number) => Promise<IClaim | null> = useCallback(async (id: number) => {

    const result = await putWithAuth(`/api/v1/claim/${id}`, {});

    const data = await result.json();

    if (result.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }

  }, [putWithAuth]);

  return {
    getTemplate,
    addTemplate,
    deleteTemplate,
    getConfiguration,
    addConfiguration,
    getClaim,
    addClaim,
    closeClaim,
    updateTemplate
  };
}




export default useApi;