import Elysia from "elysia";
import { api } from "./routes";

export const app = new Elysia()
    .use(api)
    .get("/", () => "API is OK");
    
export type App = typeof app;