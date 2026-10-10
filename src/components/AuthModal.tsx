import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

import { RecipeHubLogo } from './RecipeHubLogo.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
      onClose();
    } catch {
      // Errors handled in context toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setIsSubmitting(true);
    try {
      await login({ email: userEmail, password: userPass });
      onClose();
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E8E2D8] text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-7 pb-4 bg-[#FAF7F2] border-b border-[#E8E2D8]">
          <div className="mb-3">
            <RecipeHubLogo variant="compact" size="md" />
          </div>
          <h3 className="font-['Playfair_Display',serif] text-2xl font-bold text-[#2D2A26] mb-1">
            {mode === 'login' ? 'Welcome Back to RecipeHub' : 'Join RecipeHub Community'}
          </h3>
          <p className="text-xs text-[#7B7368]">
            {mode === 'login'
              ? 'Sign in to access your saved recipes and personal culinary collection'
              : 'Create an account to start bookmarking and sharing delicious dishes'}
          </p>

          {/* Quick Demo Switcher for Evaluation */}
          <div className="mt-4 p-2.5 rounded-xl bg-white border border-[#E8E2D8]">
            <p className="text-[11px] font-semibold text-[#5F5850] mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#E86A33]" />
              <span>One-Click Demo Credentials:</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@recipehub.com', 'admin123')}
                disabled={isSubmitting}
                className="px-2.5 py-1.5 rounded-lg bg-[#2E7D32]/10 hover:bg-[#2E7D32]/20 text-[#2E7D32] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <Shield className="w-3 h-3" />
                <span>Chef Marcus (Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('sophia@recipehub.com', 'user123')}
                disabled={isSubmitting}
                className="px-2.5 py-1.5 rounded-lg bg-[#E86A33]/10 hover:bg-[#E86A33]/20 text-[#E86A33] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <UserIcon className="w-3 h-3" />
                <span>Sophia (User)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#E8E2D8] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
              mode === 'login'
                ? 'text-[#E86A33] border-b-2 border-[#E86A33] bg-white font-bold'
                : 'text-stone-500 hover:text-stone-800 bg-[#FAF7F2]/50'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
              mode === 'register'
                ? 'text-[#E86A33] border-b-2 border-[#E86A33] bg-white font-bold'
                : 'text-stone-500 hover:text-stone-800 bg-[#FAF7F2]/50'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#5F5850] mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E8E2D8] text-xs sm:text-sm focus:outline-none focus:border-[#E86A33]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#5F5850] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E8E2D8] text-xs sm:text-sm focus:outline-none focus:border-[#E86A33]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5F5850] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E8E2D8] text-xs sm:text-sm focus:outline-none focus:border-[#E86A33]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#E86A33] hover:bg-[#D45924] text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting
              ? 'Authenticating...'
              : mode === 'login'
              ? 'Sign In to RecipeHub'
              : 'Create Account & Continue'}
          </button>

          <p className="text-[11px] text-center text-stone-500 pt-2">
            Protected by standard JWT and salted bcrypt password hashing.
          </p>
        </form>
      </div>
    </div>
  );
};
