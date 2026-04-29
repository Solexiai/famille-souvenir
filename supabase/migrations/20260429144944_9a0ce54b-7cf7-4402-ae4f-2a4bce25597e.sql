INSERT INTO public.profiles (user_id, email, full_name)
SELECT u.id, LOWER(u.email), COALESCE(u.raw_user_meta_data->>'full_name', '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

INSERT INTO public.subscriptions (user_id, plan, subscription_status)
SELECT u.id, 'free', 'active'
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
WHERE s.user_id IS NULL;