import { supabaseDb } from "./supabase.mjs";
import { redisDb } from "./redis.mjs";
export const pickDb = () => supabaseDb() || redisDb();
