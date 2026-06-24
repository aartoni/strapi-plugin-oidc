import { useEffect, useRef } from "react";
import PLUGIN_ID from "../pluginId";

export const Initializer = ({ setPlugin }) => {
  const ref = useRef();
  ref.current = setPlugin;

  useEffect(() => {
    ref.current(PLUGIN_ID);
  }, []);

  return null;
};
