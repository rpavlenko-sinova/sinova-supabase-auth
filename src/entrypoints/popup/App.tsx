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
      <div style={{ width: '300px', padding: '20px', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (session && user) {
    return (
      <div style={{ width: '300px', padding: '20px' }}>
        <h2>Welcome!</h2>
        <p>Email: {user.email}</p>
        <p>ID: {user.id}</p>
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '300px', padding: '20px' }}>
      <h2>Sign In</h2>
      <form
        onSubmit={handleSignIn}
        style={{ marginBottom: '10px' }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px',
          }}
        >
          Sign In
        </button>
      </form>

      <button
        onClick={handleSignUp}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '10px',
        }}
      >
        Sign Up
      </button>

      <button
        onClick={handleSignInWithGoogle}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
};
