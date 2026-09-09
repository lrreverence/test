import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().default("mysql://labelwise:labelwise@localhost:3306/labelwise"),
  WEB_URL: z.url().default("http://localhost:3000"),
  OPEN_FOOD_FACTS_USER_AGENT: z.string().default("Labelwise/1.0 (development@example.com)"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional()
});

export const env = schema.parse(process.env);
