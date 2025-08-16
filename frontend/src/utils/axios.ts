import axios from 'axios';
import axiosCaseConverter from 'simple-axios-case-converter';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function axiosGet<P>(url: string, accessToken: string | undefined, params?: P) {
  axiosCaseConverter(axios);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
  return await axios.get(`${BASE_URL}${url}`, { params, headers });
}

export async function axiosPost<P>(url: string, accessToken: string | undefined, params: P) {
  axiosCaseConverter(axios);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  return await axios.post(`${BASE_URL}${url}`, params, { headers });
}

export async function axiosPatch<P>(url: string, accessToken: string | undefined, params: P) {
  axiosCaseConverter(axios);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  return await axios.patch(`${BASE_URL}${url}`, params, { headers });
}
