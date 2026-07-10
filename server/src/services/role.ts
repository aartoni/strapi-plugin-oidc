import { search, compile, JSONValue } from "@jmespath-community/jmespath";
import { Core } from "@strapi/strapi";

export type RoleConfig = {
  expression: string;
  id: number;
};

const roleService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getConfig(): Promise<RoleConfig | null> {
    return await strapi.query("plugin::strapi-plugin-sso.roles").findOne({});
  },
  async setConfig({ expression }: RoleConfig) {
    // Throws on invalid JMESPath syntax, caught by the controller.
    compile(expression);

    const existing = await this.getConfig();
    if (existing) {
      return await strapi
        .query("plugin::strapi-plugin-sso.roles")
        .update({ where: { id: existing.id }, data: { expression } });
    }
    return await strapi
      .query("plugin::strapi-plugin-sso.roles")
      .create({ data: { expression } });
  },
  async resolveRole(userInfo: JSONValue) {
    const config = await this.getConfig();
    if (!config?.expression) {
      return null;
    }

    const result = search(userInfo, config.expression);
    if (typeof result !== "string") {
      return null;
    }

    const role = await strapi.db
      .query("admin::role")
      .findOne({ where: { name: result } });

    return role ? [{ id: role.id }] : null;
  },
});

export default roleService;
export type RoleService = ReturnType<typeof roleService>;
