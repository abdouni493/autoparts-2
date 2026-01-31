
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../translations';
import { User, Phone, MapPin, CreditCard, Plus, Search, Edit2, Trash2, X, Calendar, DollarSign, History, ChevronRight } from 'lucide-react';
import { PaymentType } from '../types';

const WorkersView: React.FC<{ store: any }> = ({ store }) => {
  const t = translations[store.language];
  const isRTL = store.language === 'ar';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    username: '',
    password: '',
    paymentType: PaymentType.MONTHLY,
    paymentAmount: 0
  });

  const [paymentData, setPaymentData] = useState({
    amount: 0,
    period: ''
  });

  const filteredWorkers = useMemo(() => {
    return store.workers.filter((w: any) => 
      w.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.phone.includes(searchTerm)
    );
  }, [store.workers, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorker && !isPaymentModalOpen && !isHistoryOpen) {
      store.updateWorker(selectedWorker.id, formData);
    } else {
      store.addWorker(formData);
    }
    setIsModalOpen(false);
    setSelectedWorker(null);
    resetFormData();
  };

  const resetFormData = () => {
    setFormData({ fullName: '', phone: '', address: '', username: '', password: '', paymentType: PaymentType.MONTHLY, paymentAmount: 0 });
  };

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    store.registerWorkerPayment({
      workerId: selectedWorker.id,
      amount: paymentData.amount,
      period: paymentData.period
    });
    setIsPaymentModalOpen(false);
    setPaymentData({ amount: 0, period: '' });
    alert(isRTL ? 'تم تسجيل الدفع' : 'Paiement enregistré');
  };

  const openPayment = (w: any) => {
    setSelectedWorker(w);
    setPaymentData({ amount: w.paymentAmount, period: new Date().toLocaleDateString() });
    setIsPaymentModalOpen(true);
  };

  const openHistory = (w: any) => {
    setSelectedWorker(w);
    setIsHistoryOpen(true);
  };

  const workerPayments = useMemo(() => {
    if (!selectedWorker) return [];
    return store.workerPayments
      .filter((p: any) => p.workerId === selectedWorker.id)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedWorker, store.workerPayments]);

  const totalPaidToWorker = useMemo(() => {
    return workerPayments.reduce((acc: number, p: any) => acc + p.amount, 0);
  }, [workerPayments]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.workers}</h2>
          <p className="text-slate-500 mt-1 font-medium">{filteredWorkers.length} Employés actifs</p>
        </div>
        <button 
          onClick={() => { setSelectedWorker(null); resetFormData(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-indigo-100 transition-all font-black text-sm uppercase tracking-widest"
        >
          <Plus size={20} />
          {t.newWorker}
        </button>
      </div>

      <div className="relative group">
        <Search className={`absolute inset-y-0 ${isRTL ? 'right-4' : 'left-4'} my-auto text-slate-400 group-focus-within:text-indigo-500 transition-colors`} size={20} />
        <input 
          type="text" 
          placeholder={t.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-white border border-slate-200 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 shadow-sm transition-all font-bold`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredWorkers.map((w: any) => (
          <motion.div 
            layout
            key={w.id} 
            className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40 group relative overflow-hidden flex flex-col hover:shadow-indigo-100 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[5rem] -mr-10 -mt-10 opacity-30"></div>
            
            <div className="relative z-10 flex items-center gap-5 mb-8">
              <div className="w-16 h-16 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">{w.fullName}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{isRTL ? 'اسم المستخدم' : 'Compte'}: {w.username}</p>
              </div>
            </div>

            <div className="relative z-10 space-y-5 flex-1 mb-8">
              <div className="flex items-center gap-4 text-slate-600">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0"><Phone size={18} /></div>
                <span className="font-bold text-sm">{w.phone}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0"><MapPin size={18} /></div>
                <span className="font-bold text-sm line-clamp-1">{w.address}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 shrink-0"><DollarSign size={18} /></div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{w.paymentType === PaymentType.DAILY ? 'Journalier' : 'Mensuel'}</span>
                   <span className="font-black text-slate-800 text-lg">{w.paymentAmount.toLocaleString()} <span className="text-xs font-medium">DZD</span></span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-slate-50 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <button 
                  onClick={() => openPayment(w)}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  Payer
                </button>
                <button 
                  onClick={() => openHistory(w)}
                  className="px-3 py-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 font-black text-[11px] uppercase tracking-widest active:scale-95"
                  title="Historique des paiements"
                >
                  <History size={16} />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setSelectedWorker(w); setFormData({...w}); setIsModalOpen(true); }} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => store.deleteWorker(w.id)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Worker Form Modal */}
      <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedWorker ? t.edit : t.newWorker}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={28} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Nom Complet</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">{t.phone}</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">{t.address}</label>
                  <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all" />
                </div>
                
                <div className="md:col-span-2 pt-6 border-t border-slate-50">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6">Conditions Financières</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Fréquence Paie</label>
                      <select value={formData.paymentType} onChange={e => setFormData({...formData, paymentType: e.target.value as PaymentType})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all">
                        <option value={PaymentType.MONTHLY}>Mensuel</option>
                        <option value={PaymentType.DAILY}>Journalier</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Montant Fixe (DZD)</label>
                      <input required type="number" value={formData.paymentAmount} onChange={e => setFormData({...formData, paymentAmount: Number(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all" />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-6 border-t border-slate-50">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6">Identifiants Système</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">{t.username}</label>
                      <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">{t.password}</label>
                      <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.2rem] outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 border border-slate-200 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">{t.cancel}</button>
                <button type="submit" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all uppercase tracking-widest text-xs">{t.save}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
      {isPaymentModalOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b flex items-center justify-between bg-indigo-600 text-white">
              <h3 className="text-xl font-black tracking-tight">Régler un salaire</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="hover:text-indigo-100"><X size={28} /></button>
            </div>
            <form onSubmit={handleRegisterPayment} className="p-10 space-y-8">
              <div className="text-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Bénéficiaire</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">{selectedWorker.fullName}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Période ou Note</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input required type="text" value={paymentData.period} onChange={e => setPaymentData({...paymentData, period: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all" placeholder="Ex: Février 2024" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Montant à verser (DZD)</label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                    <input required type="number" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: Number(e.target.value)})} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 font-black text-2xl text-slate-800" />
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button type="submit" className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest text-sm">Confirmer le Versement</button>
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="w-full py-4 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs">{t.cancel}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Payment History Modal */}
      <AnimatePresence>
      {isHistoryOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-8 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm"><History size={24} /></div>
                 <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Historique des Paiements</h3>
                    <p className="text-sm font-bold text-slate-400">{selectedWorker.fullName}</p>
                 </div>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors"><X size={28} /></button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto">
              <div className="mb-8 p-6 bg-indigo-900 rounded-[2rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-10 -mt-10"></div>
                <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-2">Total versé à ce jour</p>
                <p className="text-3xl font-black">{totalPaidToWorker.toLocaleString()} <span className="text-lg">DZD</span></p>
              </div>

              <div className="space-y-4">
                {workerPayments.length === 0 ? (
                  <div className="py-20 text-center text-slate-300 font-bold italic uppercase tracking-widest">Aucun paiement enregistré</div>
                ) : (
                  workerPayments.map((p: any) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={p.id} 
                      className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center group hover:bg-white hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-emerald-500 border border-slate-100 transition-colors">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{p.period}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(p.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-600">+{p.amount.toLocaleString()} DZD</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
            <div className="p-8 border-t bg-slate-50/50 shrink-0">
               <button onClick={() => setIsHistoryOpen(false)} className="w-full py-4 bg-white border border-slate-200 text-slate-400 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">Fermer</button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

// CheckCircle missing import check
const CheckCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default WorkersView;
