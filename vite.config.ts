import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
   plugins: [
      tailwindcss(),
      reactRouter(),
      tsconfigPaths(),
      devtoolsJson(),
      {
         name: "full-reload-on-any-change",
         handleHotUpdate({ server }) {
            server.ws.send({
               type: "full-reload",
            });
         },
      },
   ],
   base: "/canvas-games/",
});
