"use server";

interface Account {
  id: string;
  name: string;
  type?: string;
}

export const getAccounts = async () => {
  const response = await fetch(`${process.env.STAGING_PROJECTS_URI}/accounts`);
  return response.json();
};
