import { defineConfig } from "astro/config";

const adminEnabled = process.env.ADMIN_ENABLED === "true";

function conditionalAdminRoute(enabled) {
  return {
    name: "conditional-admin-route",
    hooks: {
      "astro:config:setup": ({ injectRoute }) => {
        if (enabled) {
          injectRoute({
            pattern: "/admin",
            entrypoint: "./src/admin/index.astro",
            prerender: true,
          });
        }
      },
    },
  };
}

export default defineConfig({
  site: "https://kita-lestari.19623060.workers.dev",
  output: "static",
  integrations: [conditionalAdminRoute(adminEnabled)],
});
