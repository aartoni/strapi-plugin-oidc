import PLUGIN_ID from "../pluginId";

export function getTranslation(id: string) {
  return `${PLUGIN_ID}.${id}`;
}

export function prefixPluginTranslations(
  trad: Record<string, string>,
  pluginId: string,
) {
  if (!pluginId) throw new TypeError("pluginId can't be empty");
  return Object.keys(trad).reduce(
    (acc, key) => {
      acc[`${pluginId}.${key}`] = trad[key];
      return acc;
    },
    {} as Record<string, string>,
  );
}
