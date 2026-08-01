import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Lock, Mail, ArrowRight, UserPlus, ShieldCheck, UserCheck, Store } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const loggedUser = await loginUser(email, password);
      // Dynamic Role-based Redirect
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (loggedUser.role === 'vendor') {
        navigate('/vendor/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetFill = (presetEmail, presetPass) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 z-10 my-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-primary to-slate-900 p-7 text-center text-white relative">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-xs mb-3 ring-1 ring-white/20">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">CampusProcure</h1>
          <p className="text-xs text-blue-200 mt-1 font-medium">
            Smart Institutional Procurement ERP System
          </p>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleLogin} className="p-7 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50"
                placeholder="user@campusprocure.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 mt-1"
          >
            <span>{loading ? 'Validating Credentials...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Access Buttons */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center mb-2">
              Quick Demo Access (Auto-Fill Credentials)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePresetFill('admin@campusprocure.com', 'admin123')}
                className="flex flex-col items-center p-2 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 hover:border-purple-300 transition-all text-center group"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 mb-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Admin</span>
                <span className="text-[9px] text-slate-500 font-medium">Manager</span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetFill('faculty@test.com', 'faculty123')}
                className="flex flex-col items-center p-2 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 hover:border-blue-300 transition-all text-center group"
              >
                <UserCheck className="w-4 h-4 text-blue-600 mb-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Faculty</span>
                <span className="text-[9px] text-slate-500 font-medium">Requisitioner</span>
              </button>

              <button
                type="button"
                onClick={() => handlePresetFill('vendor@test.com', 'vendor123')}
                className="flex flex-col items-center p-2 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/70 hover:border-teal-300 transition-all text-center group"
              >
                <Store className="w-4 h-4 text-teal-600 mb-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-800">Vendor</span>
                <span className="text-[9px] text-slate-500 font-medium">Supplier Firm</span>
              </button>
            </div>
          </div>
        </form>

        {/* Signup Action Link Footer */}
        <div className="px-8 py-3 text-center border-t border-slate-100 bg-slate-50/50">
          <Link
            to="/signup"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary hover:text-slate-900 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Don't have an account? Create new account</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
