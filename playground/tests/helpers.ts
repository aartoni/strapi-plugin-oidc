import { Core, createStrapi } from "@strapi/strapi";
import fs, { PathLike } from "fs";

let instance: Core.Strapi | null = null;

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
  if (!instance) return;
  instance.server.httpServer.close();
  await instance.db.connection.destroy();
  instance.destroy();
  const tmpDbFile: PathLike = instance.config.get(
    "database.connection.connection.filename",
  );
  if (fs.existsSync(tmpDbFile)) {
    fs.unlinkSync(tmpDbFile);
  }
  instance = null;
}

export { setupStrapi, stopStrapi };
