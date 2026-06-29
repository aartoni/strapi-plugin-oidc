import "koa";

// TODO Remove once Strapi starts providing its own augmented type definition.
declare module "koa" {
  interface Request {
    body?: unknown;
  }
}
