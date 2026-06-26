async function find(ctx) {
  const roleService = strapi.plugin("strapi-plugin-sso").service("role");
  ctx.send((await roleService.getConfig()) ?? {});
}

async function update(ctx) {
  try {
    const roleService = strapi.plugin("strapi-plugin-sso").service("role");
    await roleService.setConfig(ctx.request.body);
    ctx.send({}, 204);
  } catch (e) {
    strapi.log.error(e);
    ctx.send({ error: e.message }, 400);
  }
}

export default {
  find,
  update,
};
