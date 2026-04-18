import { supabaseAdmin } from "../config/supabase.js";

export type NotificationType = 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'sale' | 'troc_proposal' | 'troc_accepted' | 'troc_rejected' | 'message' | 'system';

export async function createNotification(userId: string, title: string, body: string, type: NotificationType) {
  try {
    const { error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        body,
        type,
        is_read: false
      });

    if (error) {
      console.error("Error creating notification:", error);
    }
  } catch (err) {
    console.error("Unexpected error in createNotification:", err);
  }
}
