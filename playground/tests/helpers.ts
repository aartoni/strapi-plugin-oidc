import { createStrapi } from "@strapi/strapi";
import { Strapi } from "@strapi/types/dist/core";
import fs, { PathLike } from "fs";

let instance: Strapi;

/**
 * Sets strapi up for further testing
 */
async function setupStrapi() {
  if (!instance) {
    const app = await createStrapi({
      appDir: "./playground",
      distDir: "./playground/dist",
    }).load();

    instance = app; // strapi is global now

    instance.server.mount();
  }
  return instance;
}

/**
 * Closes strapi after testing
 */
async function stopStrapi() {
  if (instance) {
    instance.server.httpServer.close();
    await instance.db.connection.destroy();
    instance.destroy();
    const tmpDbFile: PathLike = strapi.config.get(
      "database.connection.connection.filename",
    );

    if (fs.existsSync(tmpDbFile)) {
      fs.unlinkSync(tmpDbFile);
    }
  }
  return instance;
}

export { setupStrapi, stopStrapi };
