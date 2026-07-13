import { oidcAuthPagePlugin } from "@aartoni/strapi-plugin-oidc/vite";
import { mergeConfig, type UserConfig } from "vite";

export default (config: UserConfig) =>
  mergeConfig(config, { plugins: [oidcAuthPagePlugin] });
