import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [notice, setNotice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [retryAfter, setRetryAfter] = useState<number>(0);

  useEffect(() => {
    if (retryAfter === 0) return;

    const timer = window.setInterval(() => {
      setRetryAfter((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [retryAfter]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || (isSignUp && retryAfter > 0)) return;

    setError('');
    setNotice('');
    setLoading(true);

    try {
      const { data, error: authError } = isSignUp
        ? await supabase.auth.signUp({ email: email.trim(), password })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });

      if (authError) {
        if (authError.status === 429) {
          setRetryAfter(60);
          setError(
            'Supabase temporarily limited signup or confirmation emails. Wait before retrying. With the built-in email service, the project limit may last up to an hour. If you already have an account, switch to Sign In.'
          );
        } else {
          setError(authError.message);
        }
      } else if (isSignUp && data.user && !data.session) {
        setNotice('Account created. Check your email for the confirmation link before signing in.');
      }
    } catch {
      setError('Unable to reach the authentication service. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Create an Account' : 'Welcome Back'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Enter your details to register.' : 'Enter your credentials to access your tracker.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div role="alert" className="text-sm text-destructive font-medium">{error}</div>}
            {notice && <div role="status" className="text-sm font-medium text-green-700">{notice}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-1 flex w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={loading || retryAfter > 0}>
              {loading
                ? 'Processing...'
                : retryAfter > 0
                  ? `Try again in ${retryAfter}s`
                  : isSignUp
                    ? 'Sign Up'
                    : 'Sign In'}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setNotice('');
              }}
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
