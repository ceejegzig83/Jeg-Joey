import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, User, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminLoginModal: React.FC = () => {
  const { 
    isAdminLoginModalOpen, 
    setIsAdminLoginModalOpen, 
    loginAdmin 
  } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAdminLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const success = loginAdmin(username.trim(), password);
      if (success) {
        setUsername('');
        setPassword('');
        setIsAdminLoginModalOpen(false);
      } else {
        setErrorMessage('Invalid Administrator username or password. Access denied.');
      }
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-stone-900 text-stone-100 rounded-3xl shadow-2xl border border-stone-800 max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 p-6 border-b border-stone-800 relative">
            <button
              onClick={() => {
                setErrorMessage('');
                setIsAdminLoginModalOpen(false);
              }}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-stone-800/80 hover:bg-stone-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white font-display">
                  Authorized Staff & Admin Portal
                </h3>
                <p className="text-xs text-stone-400">
                  Flourish Destiny Collection HQ Management
                </p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3.5 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-2xl text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-300">
                Administrator Username / Email:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter administrator username or email"
                  className="w-full bg-stone-950 text-white placeholder-stone-500 text-sm rounded-xl pl-10 pr-4 py-2.5 border border-stone-700 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
                <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-300">
                Administrator Password:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret password"
                  className="w-full bg-stone-950 text-white placeholder-stone-500 text-sm rounded-xl pl-10 pr-11 py-2.5 border border-stone-700 focus:outline-hidden focus:border-amber-400 transition-colors"
                />
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Administrator'}</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <p className="text-[11px] text-stone-500">
                Secured access restricted to authorized management personnel of Flourish Destiny Collection.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
