import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Wifi, Clock, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiLogin } from '../api';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const DEMO_ACCOUNTS = [
  { username: 'student', password: 'student123', role: 'Student', badge: 'bg-blue-500' },
  { username: 'admin',   password: 'admin123',   role: 'Admin',   badge: 'bg-purple-500' },
];

const FEATURES = [
  { icon: Wifi,        title: 'Real-time Updates',   desc: 'Live order tracking with instant notifications' },
  { icon: Clock,       title: 'Skip the Queue',      desc: 'Pre-order and get your token before you arrive' },
  { icon: ShieldCheck, title: 'Secure Payments',     desc: 'Pay securely via UPI, card, or canteen wallet' },
];

export default function LoginPage() {
  const { dispatch, toast } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    const uName = username.trim().toLowerCase();
    const pWord = password.trim();
    if (!uName || !pWord) { setError('Please enter your credentials.'); return; }
    setLoading(true);
    setError('');
    try {
      // 1. Check local custom profile for password override first
      const localProfileStr = localStorage.getItem(`sc_profile_${uName}`);
      let user = null;
      if (localProfileStr) {
        try {
          const profile = JSON.parse(localProfileStr);
          if (profile.password && profile.password === pWord) {
            user = profile;
          }
        } catch {}
      }
      
      // 2. If no local custom password match, authenticate via backend
      if (!user) {
        const res = await apiLogin(uName, pWord);
        if (!res.user) throw new Error('Invalid response');
        user = res.user;
        // Merge with existing local profile details (displayName, avatarColor, profilePic, custom password)
        if (localProfileStr) {
          try {
            const profile = JSON.parse(localProfileStr);
            user = { ...user, ...profile };
          } catch {}
        }
      }

      localStorage.setItem('sc_user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_PAGE', payload: user.role === 'admin' ? 'admin' : 'home' });
      toast('success', `Welcome back, ${user.displayName || user.username}!`, 'You are now signed in');
    } catch (err) {
      setError(err.message === 'Invalid credentials'
        ? 'Incorrect username or password. Please try again.'
        : 'Cannot connect to server. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => { setUsername(acc.username); setPassword(acc.password); setError(''); };

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">

      {/* Left — Brand Panel (desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] bg-gradient-to-br from-surface-900 via-surface-950 to-black p-10 relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-brand-500/5 blur-2xl" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand">
            <span className="text-white text-base font-black">SC</span>
          </div>
          <div>
            <p className="text-white font-display font-bold text-xl leading-none">SmartCanteen</p>
            <p className="text-surface-400 text-xs mt-0.5">JJ College of Engineering</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative">
          <h1 className="text-white font-display font-extrabold text-4xl leading-tight mb-4">
            Order food.<br />
            Skip the queue.<br />
            <span className="gradient-text">Eat smarter.</span>
          </h1>
          <p className="text-surface-400 text-base leading-relaxed">
            The modern campus canteen experience — pre-order, track in real-time, and pick up without the wait.
          </p>

          <div className="mt-8 space-y-5">
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4.5 h-4.5 text-brand-500" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{f.title}</p>
                    <p className="text-surface-500 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-surface-600 text-xs relative">© 2024 SmartCanteen · Campus Food Platform</p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <span className="text-white text-sm font-black">SC</span>
            </div>
            <div>
              <p className="font-display font-bold text-surface-900 dark:text-white">SmartCanteen</p>
              <p className="text-xs text-surface-400">JJ College of Engineering</p>
            </div>
          </div>

          <h2 className="text-h2 mb-1">Sign in</h2>
          <p className="text-surface-400 text-sm mb-8">Access your canteen account</p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              disabled={loading}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="text-surface-400 hover:text-surface-600 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              iconRight={!loading && <ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <p className="text-xs text-surface-400 font-semibold uppercase tracking-wider mb-3">Quick Access</p>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.username}
                  onClick={() => fillDemo(acc)}
                  className="p-3 rounded-xl border border-surface-200 dark:border-surface-800 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all text-left"
                >
                  <div className={`w-6 h-6 ${acc.badge} rounded-lg flex items-center justify-center mb-2`}>
                    <span className="text-white text-[10px] font-bold">{acc.role[0]}</span>
                  </div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">{acc.role}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{acc.username}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
