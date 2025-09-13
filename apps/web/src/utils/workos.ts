import { createClient } from "@workos-inc/authkit-js";

export const getUserAuth = async () => {
  const authkit = await createClient(import.meta.env.VITE_WORKOS_CLIENT_ID);
  return authkit.getUser();
};
