If RLS were disabled after deployment, any unauthenticated or malicious user could query or alter the database via public API endpoints and read, modify, or delete every user's private habits and logs.

https://supabase.com/docs/guides/auth/row-level-security

One sentence: why client-side validation is UX and the storage policy is the security.
"Client-side validation provides immediate feedback for user experience, while the storage policy ensures database security by preventing unauthorized access on the server."