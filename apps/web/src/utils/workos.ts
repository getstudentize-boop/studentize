import { createClient } from "@workos-inc/authkit-js";

export const getUserAuth = async () => {
  const authkit = await createClient(import.meta.env.VITE_WORKOS_CLIENT_ID, {
    // todo: set a custom domain when we move to app.studentize.com
    devMode: true,
  });

  const user = await authkit.getUser();

  return user;
};
