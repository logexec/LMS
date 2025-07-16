import axios from 'axios';

export const guest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

export async function getCsrf() {
  await guest.get('/sanctum/csrf-cookie');
}

export async function login(email: string, password: string) {
  await getCsrf();
  return guest.post('/login', { email, password });
}

export async function logout() {
  await guest.post('/logout');
}
