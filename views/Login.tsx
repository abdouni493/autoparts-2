
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../translations';
import { LogIn, Lock, User as UserIcon, CheckCircle2, AlertCircle, Mail, UserPlus } from 'lucide-react';

const LoginView: React.FC<{ store: any }> = ({ store }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const t = translations[store.language];
  const isRTL = store.language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let result;
      if (isRegisterMode) {
        const targetEmail = email || `${username}@autopro.com`;
        result = await store.signUp(username, targetEmail, password);
      } else {
        result = await store.login(username, password);
      }

      if (!result.success) {
        setError(result.error || t.invalidCredentials);
      }
    } catch (err: any) {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#0f172a] overflow-hidden p-6 ${isRTL ? 'font-arabic' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-24 h-24 gradient-bg rounded-[2rem] text-white shadow-2xl shadow-indigo-500/40 mb-8 animate-float"
          >
            {isRegisterMode ? <UserPlus size={42} /> : <LogIn size={42} />}
          </motion.div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">AutoPro <span className="text-indigo-400">HQ</span></h1>
          <p className="text-slate-400 text-lg font-medium">{isRegisterMode ? "Créer un nouveau compte" : t.loginTitle}</p>
        </div>

        <motion.div 
          className="bg-white/95 backdrop-blur-2xl p-10 lg:p-12 rounded-[3rem] shadow-2xl border border-white/20"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="p-5 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-100 flex items-start gap-4"
                >
                  <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-black uppercase tracking-widest mb-1">Erreur</p>
                    <p className="opacity-80 leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">
                  {isRegisterMode ? "Nom complet" : t.username}
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-5' : 'left-0 pl-5'} flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors`}>
                    <UserIcon size={20} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`block w-full ${isRTL ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-800`}
                    placeholder={isRegisterMode ? "Admin Principal" : "admin"}
                    required
                  />
                </div>
              </div>

              {isRegisterMode && (
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">Email</label>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-5' : 'left-0 pl-5'} flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors`}>
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`block w-full ${isRTL ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-800`}
                      placeholder="admin@autopro.com"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">{t.password}</label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-5' : 'left-0 pl-5'} flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors`}>
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full ${isRTL ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-800`}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black rounded-3xl shadow-2xl shadow-indigo-200 transition-all transform active:scale-[0.97] flex items-center justify-center gap-3 text-lg"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isRegisterMode ? "S'inscrire" : t.loginBtn}</span>
                    <CheckCircle2 size={22} className="opacity-40" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <button 
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError('');
                }}
                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 underline transition-colors"
              >
                {isRegisterMode ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
              </button>
            </div>
            
            <div className="pt-6 border-t border-slate-100 flex justify-center items-center gap-6">
               <button 
                type="button"
                onClick={() => store.setLanguage('fr')} 
                className={`text-xs font-black uppercase tracking-widest transition-all ${store.language === 'fr' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Français
              </button>
              <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
              <button 
                type="button"
                onClick={() => store.setLanguage('ar')} 
                className={`text-xs font-black uppercase tracking-widest transition-all ${store.language === 'ar' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                العربية
              </button>
            </div>
          </form>
        </motion.div>
        
        <p className="mt-10 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
           Powered by <span className="text-slate-400">AutoPro Cloud Engines</span>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginView;
