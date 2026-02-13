import z from "zod";

const schema = {
  signupAsAdvisor: z.boolean().nullable().default(false),
};

export const getLocalStorage = (name: keyof typeof schema) => {
  const localStorage = window.localStorage;
  const data = localStorage.getItem(name);
  return data ? schema[name].parse(JSON.parse(data)) : null;
};

export const setLocalStorage = (name: keyof typeof schema, data: any) => {
  const localStorage = window.localStorage;
  localStorage.setItem(name, JSON.stringify(data));
};
