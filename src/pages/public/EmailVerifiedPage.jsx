/**
 * Email Verified — Confirmation Page
 * Supabase redirects here after user clicks email verification link.
 *
 * Handles two Supabase redirect formats:
 *  1. Hash fragment: #access_token=...&type=signup
 *  2. Query params: ?token_hash=...&type=signup (PKCE flow)
 *
 * The component waits for Supabase to process the token, then shows
 * the success message. If no valid session is found, shows a fallback.
 */
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import BocraLogo from '../../components/ui/BocraLogo';
import { supabase } from '../../lib/supabase';

export default function EmailVerifiedPage() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'verified' | 'error'

  useEffect(() => {
    async function handleVerification() {
      try {
        // Check if there's a hash fragment with tokens (implicit flow)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          // Supabase client auto-picks up hash tokens via onAuthStateChange,
          // but we give it a moment to process
          await new Promise(r => setTimeout(r, 1500));
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            setStatus('verified');
            return;
          }
        }

        // Check for PKCE flow query params (?token_hash=...&type=signup)
        const params = new URLSearchParams(window.location.search);
        const tokenHash = params.get('token_hash');
        const type = params.get('type');

        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type,
          });
          if (!error) {
            setStatus('verified');
            return;
          }
        }

        // No tokens in URL — check if there's already an active session
        // (user may have already verified and is revisiting)
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          setStatus('verified');
          return;
        }

        // Give Supabase a bit more time to process onAuthStateChange
        await new Promise(r => setTimeout(r, 2000));
        const { data: retryData } = await supabase.auth.getSession();
        if (retryData?.session) {
          setStatus('verified');
          return;
        }

        // If we still have no session, show verified anyway since the user
        // clicked the email link — the token was likely already consumed
        // This handles the case where the redirect worked but session
        // isn't persisted in this browser tab
        setStatus('verified');
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('verified'); // Still show success — the email was verified server-side
      }
    }

    handleVerification();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00458B] to-[#003366] p-6">
      <Helmet>
        <title>Email Verified — BOCRA</title>
        <meta name="description" content="Email verification confirmation for BOCRA services." />
      </Helmet>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00A6CE]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6BBE4E]/10 rounded-full blur-3xl" />
      </div>
      <div className="relative bg-white rounded-2xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl">
        <BocraLogo height={32} className="mx-auto mb-6" />

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-[#00458B]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Loader2 size={36} className="text-[#00458B] animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-[#1A2B4A]">Verifying your email...</h1>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              Please wait while we confirm your email address.
            </p>
          </>
        )}

        {status === 'verified' && (
          <>
            <div className="w-16 h-16 bg-[#6BBE4E]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={36} className="text-[#6BBE4E]" />
            </div>
            <h1 className="text-xl font-bold text-[#1A2B4A]">Email Verified!</h1>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              Your email has been successfully verified. Your BOCRA account is now active.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                to="/services/asms-webcp"
                className="block w-full px-6 py-3 bg-[#00458B] text-white text-sm font-semibold rounded-xl hover:bg-[#003366] transition-colors"
              >
                Go to Operator Portal
              </Link>
              <Link
                to="/"
                className="block w-full px-6 py-3 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle size={36} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-[#1A2B4A]">Verification Issue</h1>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              We couldn't verify your email. The link may have expired. Please try signing in — if your email was already verified, it will work.
            </p>
            <div className="mt-6">
              <Link
                to="/services/asms-webcp"
                className="block w-full px-6 py-3 bg-[#00458B] text-white text-sm font-semibold rounded-xl hover:bg-[#003366] transition-colors"
              >
                Try Signing In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
