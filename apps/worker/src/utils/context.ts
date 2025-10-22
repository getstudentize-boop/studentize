import { Context } from "hono";

export const getAccessToken = (input: { c: Context }) => {
  const { c } = input;

  const authorization = c.req.header("Authorization");

  const [_, accessToken] = authorization?.split(" ") || [];
  return { accessToken };
};
