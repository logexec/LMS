import axios from "axios";
export const csrf = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,  // http://localhost:8000
  withCredentials: true,
});
