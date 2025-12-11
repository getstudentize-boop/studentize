import { WorkOS } from "@workos-inc/node";
import { jwtVerify, createRemoteJWKSet } from "jose";

export const WORKOS_SESSION_KEY = "wos-session";

export const cookieOpts = {
  path: "/",
  httpOnly: true,
  secure: true,
  sameSite: "lax",
} as const;

export const workos = new WorkOS(process.env.WORKOS_API_KEY!, {
  clientId: process.env.VITE_WORKOS_CLIENT_ID!,
});

const jwksUrl = workos.userManagement.getJwksUrl(
  process.env.VITE_WORKOS_CLIENT_ID!
);

const JWKS = createRemoteJWKSet(new URL(jwksUrl));

const verifyAccessToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, JWKS);
    return payload;
  } catch (e) {
    console.error("Error verifying access token:", e);
    return false;
  }
};

export const getUserAuth = async (accessToken: string) => {
  const user = await verifyAccessToken(accessToken);

  const userId = user?.sub as string | undefined;
  if (user) {
    const userData = await workos.userManagement.getUser(userId!);

    return { userData, userAccessToken: accessToken };
  }
};
