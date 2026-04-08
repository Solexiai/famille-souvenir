
DROP POLICY "System or circle managers can insert notifications" ON public.notifications;

CREATE POLICY "Users or managers can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (circle_id IS NOT NULL AND is_circle_manager(auth.uid(), circle_id))
  );
