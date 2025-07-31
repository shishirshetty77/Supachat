-- Check if users exist in auth.users but not in public.users
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'username' as username,
    pu.id as public_user_id
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- If users are missing, let's manually insert them
-- (You'll need to run this if the above query shows missing users)
INSERT INTO public.users (id, email, username, avatar_url)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
    au.raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify all users are now in public.users
SELECT id, username, email, created_at FROM public.users ORDER BY created_at;
