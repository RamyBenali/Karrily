import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "backend/.env") });

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function resetPassword() {
    const userId = '3e5f656c-c9b7-4838-b8a7-7336a1558444';
    const newPassword = 'Password123!';

    const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
    });

    if (error) {
        console.error("Error updating password:", error);
    } else {
        console.log(`Password reset for user ${userId} to ${newPassword}`);
    }
}

resetPassword();
