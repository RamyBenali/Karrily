import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function checkDb() {
    const { count: users } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const { count: items } = await supabase.from("items").select("*", { count: "exact", head: true });
    const { count: bookings } = await supabase.from("bookings").select("*", { count: "exact", head: true });
    const { count: sales } = await supabase.from("sales").select("*", { count: "exact", head: true });

    console.log({ users, items, bookings, sales });
}

checkDb();
