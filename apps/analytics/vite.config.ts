import { defineConfig, loadEnv, type ConfigEnv } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { nitro } from "nitro/vite";

export default ({ mode }: ConfigEnv) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return defineConfig({
    plugins: [
      devtools(),
      tsconfigPaths({ projects: ["./tsconfig.json"] }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
      // @ts-ignore
      nitro({
        runtimeConfig: {
          nitro: {
            envPrefix: "VITE_",
          },
        },
      }),
    ],
  });
};
