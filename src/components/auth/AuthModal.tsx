// ============================================================================
// CapitalBridge Auth Modal
// Supabase Authentication (Sign In & Sign Up) with Session Management
// Specification: GirlCode Hackathon Ghana 2026
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { SupabaseService } from '../../services/supabaseService';
import { ProfileManager } from '../../services/profileManager';
import type { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onSuccess: (user: { id: string; email: string }, profile?: UserProfile) => void;
  onQuickDemoLogin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
  onQuickDemoLogin,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode when initialMode changes
  useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
    setIsEmailUnconfirmed(false);
    setSuccessMsg(null);
    setShowPassword(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsEmailUnconfirmed(false);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await SupabaseService.signIn(email, password);

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setIsEmailUnconfirmed(true);
          setErrorMsg(
            'Email confirmation is required. Please check your inbox for the confirmation link, or disable "Confirm email" in Supabase Authentication settings.'
          );
        } else if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrorMsg('Invalid email or password. Please verify your credentials and try again.');
        } else {
          setErrorMsg(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const authedUser = data.user;
        setSuccessMsg('Successfully signed in! Loading your readiness profile...');
        // Look up profile for this user
        const existingProfile = await SupabaseService.fetchProfileByEmail(authedUser.email || email);
        setTimeout(() => {
          setIsLoading(false);
          onSuccess(
            { id: authedUser.id, email: authedUser.email || email },
            existingProfile || undefined
          );
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred during sign in.');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsEmailUnconfirmed(false);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await SupabaseService.signUp(email, password, {
        name: name.trim() || 'Entrepreneur',
        businessName: businessName.trim() || 'SME Business',
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          setErrorMsg('An account with this email is already registered. Please sign in instead.');
        } else {
          setErrorMsg(error.message);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const authedUser = data.user;
        // Create initial borrower profile and link to this user
        const newProfile = ProfileManager.createProfileFromOnboarding({
          name: name.trim() || 'New Entrepreneur',
          businessName: businessName.trim() || 'My Business',
          businessType: 'Retail Trade & General Merchandise',
          businessLocation: 'Makola Market, Accra',
          email: email.trim(),
          phone: '',
          capitalGoalAmount: 10000,
          capitalGoalPurpose: 'Working capital and inventory growth',
          evidenceStreams: {
            hasMomo: true,
            momoInflowEstimate: 40000,
            hasBank: true,
            hasSusu: true,
            susuWeeklyAmount: 250,
            hasSalesLedger: true,
            salesMonthsCount: 3,
            hasStatutoryKyc: true,
            hasActiveLoan: false,
          },
        });

        // Persist to local store and cloud
        ProfileManager.saveProfile(newProfile.profile);
        ProfileManager.saveRecordsForProfile(newProfile.profile.id, newProfile.records);
        ProfileManager.saveActionsForProfile(newProfile.profile.id, newProfile.actions);
        SupabaseService.createProfile(newProfile.profile).catch(() => {});
        SupabaseService.insertEvidenceBatch(newProfile.records, newProfile.profile.id).catch(() => {});
        SupabaseService.insertActionsBatch(newProfile.actions, newProfile.profile.id).catch(() => {});

        if (!data.session) {
          // Email confirmation is required by Supabase project
          setIsEmailUnconfirmed(true);
          setSuccessMsg(
            'Account created! If Supabase email confirmation is enabled, please verify your email before signing in.'
          );
          setIsLoading(false);
        } else {
          setSuccessMsg('Account created successfully! Entering your workspace...');
          setTimeout(() => {
            setIsLoading(false);
            onSuccess(
              { id: authedUser.id, email: authedUser.email || email },
              newProfile.profile
            );
            onClose();
          }, 800);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred during account creation.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full shadow-2xl border-t sm:border border-slate-200/90 flex flex-col max-h-[94dvh] sm:max-h-[88vh] overflow-hidden relative animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 my-0 sm:my-auto">
        {/* Header Ribbon */}
        <div className="shrink-0 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-4 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-1.5 sm:mb-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-white text-xs sm:text-sm shadow-inner">
              CB
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">CapitalBridge</h2>
              <p className="text-[10px] sm:text-[11px] text-emerald-100 font-medium">
                Financial Readiness Infrastructure
              </p>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-emerald-50/90 mt-0.5 sm:mt-1">
            {mode === 'signin'
              ? 'Sign in to access your financial evidence, score, and passport.'
              : 'Create an account to prove your financial readiness for institutional capital.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="shrink-0 flex border-b border-slate-200 bg-slate-50/80 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setShowPassword(false);
            }}
            className={`flex-1 py-2 sm:py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setShowPassword(false);
            }}
            className={`flex-1 py-2 sm:py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Form Body (Internally Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 sm:space-y-4 overscroll-contain">
          {/* Error Banner */}
          {errorMsg && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                isEmailUnconfirmed
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <AlertCircle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  isEmailUnconfirmed ? 'text-amber-600' : 'text-rose-600'
                }`}
              />
              <div className="space-y-1">
                <p className="font-semibold leading-snug">{errorMsg}</p>
                {isEmailUnconfirmed && (
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    <strong>Tip:</strong> In Supabase Dashboard &rarr; <em>Authentication</em> &rarr;{' '}
                    <em>Providers</em> &rarr; <em>Email</em>, turn off <em>"Confirm email"</em> to enable
                    instant test logins.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-2xl border bg-emerald-50 border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <p className="font-semibold leading-snug">{successMsg}</p>
            </div>
          )}

          {mode === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="entrepreneur@capitalbridge.gh"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Create Account Form */
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Your Name</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kofi Boateng"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Business Name</label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Boateng Spares"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kofi.boateng@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Create Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition cursor-pointer p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account & Continue</span>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Option for Hackathon / Testing */}
          {onQuickDemoLogin && (
            <div className="pt-3 border-t border-slate-100">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant Benchmark Demo</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Explore with Ama Mensah (742 PTS, 86% ECI).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onQuickDemoLogin();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>Use Demo</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
