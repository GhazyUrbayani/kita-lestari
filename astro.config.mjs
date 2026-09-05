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
  output: "static",
  integrations: [conditionalAdminRoute(adminEnabled)],
});
