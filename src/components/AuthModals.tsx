import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Mail,
  KeyRound,
  X,
  AlertCircle,
  LogIn,
  UserPlus,
  Gamepad2,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export const MemberAuthModal: React.FC = () => {
  const {
    isMemberAuthModalOpen,
    setIsMemberAuthModalOpen,
    loginMember,
    registerMember,
    authModalTab,
    setAuthModalTab
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authModalTab) {
      setMode(authModalTab);
    }
  }, [authModalTab, isMemberAuthModalOpen]);

  if (!isMemberAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = loginMember(username, password);
        setLoading(false);
        if (!res.success) {
          setError(res.message || 'Invalid username or password.');
        } else {
          if (res.isAdmin) {
            setSuccessMsg('Admin access verified. Welcome back!');
          } else {
            setSuccessMsg('Welcome back!');
          }
          setTimeout(() => {
            setIsMemberAuthModalOpen(false);
            setPassword('');
            setSuccessMsg(null);
          }, 300);
        }
      } else {
        const res = await registerMember(username, email, password);
        setLoading(false);
        if (!res.success) {
          setError(res.message || 'Registration failed.');
        } else {
          setSuccessMsg('Account created successfully!');
          setTimeout(() => {
            setIsMemberAuthModalOpen(false);
            setPassword('');
            setSuccessMsg(null);
          }, 300);
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e0e11] border border-zinc-800 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsMemberAuthModalOpen(false);
            setError(null);
            setSuccessMsg(null);
          }}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto mb-3 shadow-md text-zinc-200">
            {mode === 'register' ? (
              <UserPlus className="w-6 h-6 text-zinc-300" />
            ) : (
              <Gamepad2 className="w-6 h-6 text-zinc-300" />
            )}
          </div>
          <h2 className="text-xl font-bold font-gaming text-white">
            {mode === 'login' ? 'Sign In to EasyAcss' : 'Create an Account'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'login'
              ? 'Enter your credentials to access your profile & games.'
              : 'Join thousands of gamers and claim free accounts.'}
          </p>
        </div>

        {/* Mode Switcher Tabs: Login | Register (Strictly 2 tabs, clean & standard) */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#16161a] border border-zinc-800 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setAuthModalTab('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-2 rounded-lg text-xs font-gaming font-bold tracking-wide transition-all ${
              mode === 'login'
                ? 'bg-zinc-200 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setAuthModalTab('register');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-2 rounded-lg text-xs font-gaming font-bold tracking-wide transition-all ${
              mode === 'register'
                ? 'bg-zinc-200 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              {mode === 'login' ? 'Username or Email' : 'Username'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'login' ? 'e.g. PlayerOne or admin' : 'Choose a username'}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#16161a] border border-zinc-700 focus:border-zinc-500 text-white text-sm outline-none transition-all"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gamer@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#16161a] border border-zinc-700 focus:border-zinc-500 text-white text-sm outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#16161a] border border-zinc-700 focus:border-zinc-500 text-white text-sm outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 rounded-xl font-gaming text-xs font-bold tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 bg-zinc-200 hover:bg-white text-zinc-950 shadow-zinc-800/40 active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-4 text-center text-xs text-zinc-400 font-mono">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setAuthModalTab('register');
                  setError(null);
                }}
                className="text-white hover:underline font-semibold"
              >
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setAuthModalTab('login');
                  setError(null);
                }}
                className="text-white hover:underline font-semibold"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
