-- Add trigger to create a notification when a new message is sent
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  receiver_id UUID;
  sender_name TEXT;
BEGIN
  -- Determine receiver
  SELECT CASE WHEN participant_1 = NEW.sender_id THEN participant_2 ELSE participant_1 END
  INTO receiver_id
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  -- Get sender name
  SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;

  -- Only notify if the receiver is not the sender
  IF receiver_id != NEW.sender_id THEN
    INSERT INTO public.notifications (user_id, title, body, type, link, is_read)
    VALUES (
      receiver_id,
      'Nouveau message',
      sender_name || ' : ' || LEFT(NEW.content, 50),
      'message',
      '/dashboard?tab=messages',
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_message_notify ON public.messages;
CREATE TRIGGER on_new_message_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();
