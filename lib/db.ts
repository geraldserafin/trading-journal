import postgres from "postgres";
import { drizzle } from "drizzle-orm/node-postgres";

const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient);
