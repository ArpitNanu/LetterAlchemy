import { PrismaClient } from "@prisma/client/edge";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Env } from "../types/env";

export const getPrisma = (env: Env) => {
  const adapter = new PrismaNeon({
    connectionString: env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
};
