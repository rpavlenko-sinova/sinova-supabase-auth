import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { type Session, type User } from '@supabase/supabase-js';

export const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: browser.runtime.getURL('/auth-callback.html'),
      },
    });

    if (error) {
      console.error(error.message);
    } else {
      if (data.user && data.session) {
        console.info('Account created successfully!');
      } else {
        console.info('Check your email for verification link! You need to verify your email before signing in.');
      }
    }
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error.message);
    }
    setIsLoading(false);
  };

  const handleSignInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: browser.runtime.getURL('/auth-callback.html'),
      },
    });

    if (error) {
      console.error('Google sign in error:', error);
    } else {
      browser.tabs.create({ url: data.url });
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="w-[300px] p-5 text-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (session && user) {
    return (
      <div className="w-[300px] p-5">
        <h2>Welcome!</h2>
        <p>Email: {user.email}</p>
        <p>ID: {user.id}</p>
        <button
          onClick={handleSignOut}
          className="w-full cursor-pointer rounded border-none bg-red-600 p-2.5 text-white"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="w-[300px] p-5">
      <h2>Sign In</h2>
      <form
        onSubmit={handleSignIn}
        className="mb-2.5"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-2.5 box-border w-full rounded border border-gray-300 p-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-2.5 box-border w-full rounded border border-gray-300 p-2"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mb-2.5 w-full cursor-pointer rounded border-none bg-blue-600 p-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sign In
        </button>
      </form>

      <button
        onClick={handleSignUp}
        disabled={isLoading}
        className="mb-2.5 w-full cursor-pointer rounded border-none bg-green-600 p-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Sign Up
      </button>

      <button
        onClick={handleSignInWithGoogle}
        disabled={isLoading}
        className="w-full cursor-pointer rounded border-none bg-red-600 p-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Sign in with Google
      </button>
    </div>
  );
};
