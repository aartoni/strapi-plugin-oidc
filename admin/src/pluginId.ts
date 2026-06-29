import pluginPkg from "../../package.json";

const PLUGIN_ID = pluginPkg.name.replace(/^@strapi\/plugin-/i, "");

export default PLUGIN_ID;
