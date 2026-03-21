/**
 * Login Page
 * 
 * Authentication page for BOCRA Portal access.
 * Supports email/password login via Supabase Auth.
 * Used by: licensees, operators, admin staff
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import BocraLogo from '../../components/ui/BocraLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email format'); return; }
    if (!password) { setError('Password is required'); return; }
    setLoading(true);
    
    const { error } = await signIn(email, password);
    if (error) {
      if (error.message.includes('Invalid login')) setError('Incorrect email or password. Please try again.');
      else if (error.message.includes('Email not confirmed')) setError('Please verify your email first. Check your inbox for a verification link.');
      else setError(error.message);
    } else {
      navigate('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bocra-blue to-bocra-blue-dark p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-bocra-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-bocra-magenta/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <BocraLogo white height={44} className="mx-auto" />
          </Link>
          <p className="text-white/60 text-sm mt-3">BOCRA Portal Login</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-display text-bocra-slate mb-1">Welcome Back</h1>
          <p className="text-sm text-bocra-slate/50 mb-6">Sign in to access the BOCRA portal</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-bocra-slate mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bocra-slate/30" />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-bocra-off-white border border-gray-200 rounded-xl text-bocra-slate placeholder:text-bocra-slate/30 focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-bocra-slate mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bocra-slate/30" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  required placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-bocra-off-white border border-gray-200 rounded-xl text-bocra-slate placeholder:text-bocra-slate/30 focus:border-bocra-blue focus:ring-2 focus:ring-bocra-blue/10 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-bocra-slate/30 hover:text-bocra-slate/60">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Admin portal: no account self-service elements (remember/forgot handled elsewhere). */}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight size={16} />
            </button>

            <p className="text-xs text-bocra-slate/40 text-center mt-3">
              By signing in, you agree to BOCRA's{' '}
              <Link to="/privacy-notice" className="text-bocra-blue hover:underline" target="_blank">Privacy Notice</Link>{' '}
              and the Data Protection Act, 2018.
            </p>
          </form>
        </div>

        <div className="text-center mt-6 space-y-2">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={14} />
            Back to Home
          </Link>
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} BOCRA. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
