import { Context } from "koa";
import { Core } from "@strapi/strapi";
import { RoleConfig, RoleService } from "src/services/role";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: Context) {
    const roleService = strapi
      .plugin("strapi-plugin-sso")
      .service("role") as RoleService;
    ctx.send((await roleService.getConfig()) ?? {});
  },
  async update(ctx: Context) {
    try {
      const roleService = strapi
        .plugin("strapi-plugin-sso")
        .service("role") as RoleService;
      await roleService.setConfig(ctx.request.body as RoleConfig);
      ctx.send({}, 204);
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      strapi.log.error(e);
      ctx.send({ error: e.message }, 400);
    }
  },
});
