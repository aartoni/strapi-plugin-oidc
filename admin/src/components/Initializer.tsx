import { ComponentProps, useEffect } from "react";
import PLUGIN_ID from "../pluginId";
import { PluginConfig } from "@strapi/strapi/admin";

type Props = ComponentProps<NonNullable<PluginConfig["initializer"]>>;

export const Initializer = ({ setPlugin }: Props) => {
  useEffect(() => setPlugin(PLUGIN_ID), [setPlugin]);
  return null;
};
