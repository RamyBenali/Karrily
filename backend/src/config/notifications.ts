import { supabaseAdmin } from "../config/supabase.js";

export type NotificationType = 'booking' | 'sale' | 'troc' | 'message' | 'system';

export async function createNotification(userId: string, title: string, content: string, type: NotificationType, link?: string) {
  try {
    const { error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        content,
        type,
        link,
        is_read: false
      });

    if (error) {
      console.error("Error creating notification:", error);
    }
  } catch (err) {
    console.error("Unexpected error in createNotification:", err);
  }
}
