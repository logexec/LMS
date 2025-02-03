"use server";

import { getAuthToken } from "@/services/auth.service";

interface Account {
  id: string;
  name: string;
  type?: string;
}

export const getAccounts = async () => {
  const response = await fetch(`${process.env.STAGING_PROJECTS_URI}/accounts`, {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    credentials: "include",
  });
  return response.json();
};
