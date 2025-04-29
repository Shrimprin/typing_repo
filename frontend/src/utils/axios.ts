import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function axiosGet(url: string, accessToken: string | undefined) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
  return await axios.get(`${BASE_URL}${url}`, { headers });
}

export async function axiosPost<P>(url: string, accessToken: string | undefined, params: P) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  return await axios.post(`${BASE_URL}${url}`, params, { headers });
}
