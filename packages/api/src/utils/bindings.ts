export type Env = {
  db: any;
};

let cachedEnv: Env | null = null;

export const initDevEnv = async () => {
  const { getPlatformProxy } = await import("wrangler");

  const proxy = await getPlatformProxy();
  cachedEnv = proxy.env as unknown as Env;
};

if (import.meta.env.DEV) {
  await initDevEnv();
}

export const getBindings = (): Env => {
  if (import.meta.env.DEV) {
    if (!cachedEnv) {
      throw new Error(
        "Dev bindings not initialized yet. Call initDevEnv() first."
      );
    }

    return cachedEnv;
  }

  return process.env as Env;
};
