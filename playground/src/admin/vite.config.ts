import { oidcAuthPagePlugin } from "strapi-plugin-sso/vite";
import { mergeConfig, type UserConfig } from "vite";

export default (config: UserConfig) =>
  mergeConfig(config, { plugins: [oidcAuthPagePlugin] });
