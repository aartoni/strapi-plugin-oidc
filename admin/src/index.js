import { getTranslation } from "./utils/getTranslation";
import pluginPkg from "../../package.json";
import PLUGIN_ID from "./pluginId";
import Initializer from "./components/Initializer";
import PluginIcon from "./components/PluginIcon";

const name = pluginPkg.strapi.displayName;

export default {
  bootstrap() {},
  register(app) {
    app.addMenuLink({
      to: `/plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: "Single Sign-On",
      },
      Component: async () => {
        return await import("./pages/App");
      },
      permissions: [
        { action: "plugin::strapi-plugin-sso.read", subject: null },
      ],
    });
    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      name,
    });
  },
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            const newData = Object.fromEntries(
              Object.entries(data).map(([key, value]) => [
                getTranslation(key),
                value,
              ]),
            );
            return {
              data: newData,
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      }),
    );
    return Promise.resolve(importedTrads);
  },
};
