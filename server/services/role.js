import { search, compile } from "@jmespath-community/jmespath";

export default ({ strapi }) => ({
  async getConfig() {
    return await strapi.query("plugin::strapi-plugin-sso.roles").findOne({});
  },
  async setConfig({ expression }) {
    // Throws on invalid JMESPath syntax — caught by the controller.
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
  async resolveRole(userInfo) {
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
