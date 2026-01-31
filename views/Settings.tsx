
import React, { useState } from 'react';
import { translations } from '../translations';
import { Globe, Database, User, Mail, Lock, CheckCircle, ShieldCheck } from 'lucide-react';

const SettingsView: React.FC<{ store: any }> = ({ store }) => {
  const t = translations[store.language];
  const isRTL = store.language === 'ar';
  
  const [accountData, setAccountData] = useState({
    username: store.currentUser?.username || '',
    email: store.currentUser?.email || '',
    password: '',
    confirmPassword: ''
  });

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountData.password && accountData.password !== accountData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    const updated = { ...store.currentUser, ...accountData };
    delete updated.confirmPassword;
    if (!accountData.password) delete updated.password;

    store.setCurrentUser(updated);
    alert('Compte mis à jour avec succès');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          store.restoreData(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{t.settings}</h2>
        <p className="text-slate-500 mt-1">Personnalisez votre application et sécurisez vos données</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Localization & Backup */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Globe className="text-indigo-600" size={18} />
              Localisation
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-slate-500 font-medium">Langue de l'interface</p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => store.setLanguage('fr')}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${store.language === 'fr' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  FRANÇAIS
                </button>
                <button 
                  onClick={() => store.setLanguage('ar')}
                  className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${store.language === 'ar' ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                >
                  العربية
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Database className="text-indigo-600" size={18} />
              {t.backup} & {t.restore}
            </h3>
            <div className="space-y-4">
              <button 
                onClick={() => store.backupData()}
                className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                <Database size={18} />
                Exporter JSON
              </button>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".json" 
                  id="restore-file" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="restore-file"
                  className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl font-bold hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Importer Backup
                </label>
              </div>
              <p className="text-[10px] text-slate-400 italic text-center leading-relaxed">
                Toutes les données seront écrasées par le fichier importé. Faites attention.
              </p>
            </div>
          </div>
        </div>

        {/* Account Management */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" size={20} />
                Gestion du Compte
              </h3>
              <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1">
                <CheckCircle size={14} />
                Profil Actif
              </div>
            </div>

            <form onSubmit={handleUpdateAccount} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{t.username}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={accountData.username}
                      onChange={e => setAccountData({...accountData, username: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">{t.email}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      value={accountData.email}
                      onChange={e => setAccountData({...accountData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nouveau {t.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      value={accountData.password}
                      onChange={e => setAccountData({...accountData, password: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Laisser vide pour ne pas changer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Confirmer {t.password}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      value={accountData.confirmPassword}
                      onChange={e => setAccountData({...accountData, confirmPassword: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Confirmez le nouveau mot de passe"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex justify-end">
                <button 
                  type="submit"
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Mettre à jour le profil
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
