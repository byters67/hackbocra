/**
 * Authentication Context & Provider
 *
 * Provides authentication state throughout the app using React Context.
 * Wraps Supabase Auth for login, logout, registration, and session management.
 *
 * USAGE:
 *   import { useAuth } from '@/lib/auth';
 *   const { user, loading, signIn, signOut } = useAuth();
 *
 * FEATURES:
 * - Automatic session persistence (survives page refresh)
 * - Role-based access (user.role from profiles table — server-side, NOT user_metadata)
 * - Protected route wrapper component
 *
 * SECURITY (V-05 remediation):
 *   ProtectedRoute fetches the role from the server-side `profiles` table,
 *   not from client-controlled `user_metadata`. This prevents privilege
 *   escalation via JWT metadata manipulation.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from './supabase';

const AuthContext = createContext(null);

/**
 * AuthProvider - Wrap your app with this to enable auth everywhere
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Stale/invalid session in storage — clean it up
        supabase.auth.signOut().catch(() => {});
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'TOKEN_REFRESHED' && !session) {
          // Refresh token was invalid/expired — clear stale session
          supabase.auth.signOut().catch(() => {});
          setUser(null);
          setLoading(false);
          return;
        }
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          return;
        }
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{data, error}>}
   */
  const signIn = async (email, password) => {
    const result = await supabase.auth.signInWithPassword({ email, password });
    return result;
  };

  /**
   * Sign up with email, password, and full name
   * @param {string} email
   * @param {string} password
   * @param {string} fullName
   * @returns {Promise<{data, error}>}
   */
  const signUp = async (email, password, fullName) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/hackbocra/auth/verified`,
      },
    });
    return result;
  };

  /**
   * Sign out the current user
   */
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = { user, loading, signIn, signUp, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook - Access auth state from any component
 * @returns {{ user: object|null, loading: boolean, signIn: Function, signUp: Function, signOut: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * ProtectedRoute - Wrapper component for authenticated-only pages
 *
 * V-05 remediation: role is fetched from the server-side `profiles` table
 * (protected by RLS), NOT from client-controlled user_metadata.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The protected page content
 * @param {string} [props.requiredRole] - Optional role requirement ('admin', 'operator', etc.)
 *
 * USAGE:
 *   <Route path="/admin" element={
 *     <ProtectedRoute requiredRole="admin">
 *       <AdminDashboard />
 *     </ProtectedRoute>
 *   } />
 */
export function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const [roleLoading, setRoleLoading] = useState(!!requiredRole);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!requiredRole || !user) {
      setRoleLoading(false);
      return;
    }

    // V-05: Fetch role from profiles table (server-side, RLS-protected)
    // instead of trusting client-controlled user_metadata
    let cancelled = false;
    (async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!cancelled) {
          if (!error && profile?.role === requiredRole) {
            setAuthorized(true);
          } else {
            setAuthorized(false);
          }
          setRoleLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAuthorized(false);
          setRoleLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [user, requiredRole]);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-bocra-blue/20 border-t-bocra-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole && !authorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
