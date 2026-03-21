/**
 * AdminLayout — Protected layout wrapper for the admin portal.
 *
 * Security:
 * - Redirects to /auth/login if not authenticated
 * - Fetches profile from Supabase to verify admin/staff role
 * - Shows access denied if role is not admin or staff
 *
 * Layout:
 * - Dark sidebar (AdminSidebar) on the left
 * - Main content area with Outlet on the right
 * - Responsive — sidebar collapses to hamburger on mobile
 */

import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminLayout() {
  // Auth bypass strictly for local development only — stripped from production builds by Vite
  const DEV_BYPASS_AUTH = import.meta.env.DEV === true
    && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'
    && typeof window !== 'undefined'
    && window.location.hostname === 'localhost';

  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState(DEV_BYPASS_AUTH ? { id: 'demo', full_name: 'Demo Admin', role: 'admin' } : null);
  const [profileLoading, setProfileLoading] = useState(DEV_BYPASS_AUTH ? false : true);
  const [profileError, setProfileError] = useState(null);

  // Security: require fresh login each browser session for admin portal
  const [sessionValid, setSessionValid] = useState(DEV_BYPASS_AUTH ? true : false);
  useEffect(() => {
    if (DEV_BYPASS_AUTH) return;
    const hasSession = sessionStorage.getItem('bocra-admin-session');
    if (user && hasSession) {
      setSessionValid(true);
    } else {
      setSessionValid(false);
    }
  }, [user, DEV_BYPASS_AUTH]);

  // Set the session flag after successful login
  useEffect(() => {
    if (user && !DEV_BYPASS_AUTH) {
      sessionStorage.setItem('bocra-admin-session', Date.now().toString());
      setSessionValid(true);
    }
  }, [user]);

  useEffect(() => {
    if (DEV_BYPASS_AUTH) return;
    if (user) {
      fetchProfile();
    } else {
      setProfileLoading(false);
    }
  }, [user]);

  async function fetchProfile() {
    setProfileError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, organization, phone')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('[BOCRA] Profile fetch error:', error.message);
        setProfileError(error.message);
        return;
      }
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('[BOCRA] Network error fetching profile:', err);
      setProfileError('Unable to verify your access. Check your connection and try again.');
    } finally {
      setProfileLoading(false);
    }
  }

  // Show loading spinner while auth or profile is loading
  if (!DEV_BYPASS_AUTH && (authLoading || profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00458B]/20 border-t-[#00458B] rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm mt-4">Loading admin portal…</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated or session expired
  if (!DEV_BYPASS_AUTH && (!user || !sessionValid)) {
    return <Navigate to="/auth/login" replace />;
  }

  // Show retry UI if profile fetch failed (distinct from access denied)
  if (!DEV_BYPASS_AUTH && profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Profile</h2>
          <p className="text-gray-600 mb-6">{profileError}</p>
          <button
            onClick={() => { setProfileError(null); setProfileLoading(true); fetchProfile(); }}
            className="inline-block px-6 py-2.5 bg-[#00458B] text-white rounded-lg font-medium hover:bg-[#002D5C] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check role from profile only — never trust client-controlled user_metadata
  if (!DEV_BYPASS_AUTH) {
    const role = profile?.role;
    if (role !== 'admin' && role !== 'staff') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{lang === 'tn' ? 'Phitlhelelo e Ganetswe' : 'Access Denied'}</h2>
            <p className="text-gray-600 mb-6">
              You do not have permission to access the admin portal.
              Only admin and staff users can access this area.
            </p>
            <a
              href="/hackbocra/"
              className="inline-block px-6 py-2.5 bg-[#00458B] text-white rounded-lg font-medium hover:bg-[#002D5C] transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar profile={profile} />
      <main className="flex-1 lg:pl-0 pl-0 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
          <Outlet context={{ profile, user }} />
        </div>
      </main>
    </div>
  );
}
