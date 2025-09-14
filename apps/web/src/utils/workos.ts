import { createClient } from "@workos-inc/authkit-js";

export const getUserAuth = async () => {
  const authkit = await createClient(import.meta.env.VITE_WORKOS_CLIENT_ID, {
    // apiHostname: "auth.workos.com",
    devMode: true,
  });

  const user = await authkit.getUser();
  console.log("getUserAuth user 🔥".repeat(19), user);

  return user;
};
