export default ({strapi}) => ({
  SSO_TYPE_OIDC: '4',
  ssoRoles() {
    return [
      {
        'oauth_type': this.SSO_TYPE_OIDC,
        name: 'OIDC'
      },
    ];
  },
  async oidcRoles() {
    return await strapi
      .query('plugin::strapi-plugin-sso.roles')
      .findOne({
        where: {
          'oauth_type': this.SSO_TYPE_OIDC
        }
      })
  },
  async find() {
    return await strapi
      .query('plugin::strapi-plugin-sso.roles')
      .findMany()
  },
  async update(roles) {
    const query = strapi.query('plugin::strapi-plugin-sso.roles')
    await Promise.all(
      roles.map((role) => {
        return query.findOne({where: {'oauth_type': role['oauth_type']}}).then(ssoRole => {
          if (ssoRole) {
            query.update({
              where: {'oauth_type': role['oauth_type']},
              data: {roles: role.role},
            });
          } else {
            query.create({
              data: {
                'oauth_type': role['oauth_type'],
                roles: role.role,
              }
            })
          }
        })
      })
    );
  }
})
