import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "backend/.env") });

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function findAdmins() {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .eq("role", "admin");

    if (error) {
        console.error("Error fetching admins:", error);
        return;
    }

    console.log("Admin Users:");
    console.table(data);
}

findAdmins();
