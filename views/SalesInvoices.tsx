
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../translations';
/* Added Eye icon to the imports */
import { Search, ReceiptText, ChevronRight, Filter, Printer, Calendar, CreditCard, History, X, Phone, Edit2, Trash2, ArrowRight, Eye } from 'lucide-react';

const SalesInvoicesView: React.FC<{ store: any }> = ({ store }) => {
  const t = translations[store.language];
  const isRTL = store.language === 'ar';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | string>('');

  const filteredInvoices = useMemo(() => {
    return store.salesInvoices.filter((inv: any) => 
      inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [store.salesInvoices, searchTerm]);

  const handlePayDebt = (inv: any) => {
    if (!paymentAmount) return;
    store.payDebt(inv.id, Number(paymentAmount));
    setPaymentAmount('');
    alert(isRTL ? 'تم تسجيل الدفع' : 'Paiement enregistré');
  };

  const openDetails = (inv: any) => {
    setSelectedInvoice(inv);
    setIsDetailsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      store.deleteSalesInvoice(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.salesInvoices}</h2>
          <p className="text-slate-500 mt-1">{filteredInvoices.length} {t.salesCount}</p>
        </div>
      </div>

      <div className="relative group">
        <Search className={`absolute inset-y-0 ${isRTL ? 'right-4' : 'left-4'} my-auto text-slate-400 group-focus-within:text-indigo-500 transition-colors`} size={20} />
        <input 
          type="text" 
          placeholder={t.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 shadow-sm transition-all font-medium`}
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">{t.date}</th>
                <th className="px-8 py-5">{t.clientName}</th>
                <th className="px-8 py-5">{t.total}</th>
                <th className="px-8 py-5">{t.paidAmount}</th>
                <th className="px-8 py-5">{t.debt}</th>
                <th className="px-8 py-5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                      <Calendar size={14} className="text-slate-300" />
                      {new Date(inv.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-black text-slate-800">{inv.clientName || 'Client Comptoir'}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{inv.clientPhone || '---'}</div>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-800">
                    {inv.totalAmount.toLocaleString()} <span className="text-[10px]">DZD</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-black border border-emerald-100/50">
                      {inv.paidAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black border ${inv.debtAmount > 0 ? 'bg-rose-50 text-rose-700 border-rose-100/50' : 'bg-slate-50 text-slate-300 border-slate-200/50'}`}>
                      {inv.debtAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right whitespace-nowrap">
                     <div className="flex justify-end gap-2">
                        <button onClick={() => openDetails(inv)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white border border-slate-100 rounded-xl shadow-sm">
                           <Eye size={16} />
                        </button>
                        <button onClick={() => handleDelete(inv.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors bg-white border border-slate-100 rounded-xl shadow-sm">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredInvoices.length === 0 && (
             <div className="py-24 text-center text-slate-300 font-medium italic">Aucune facture de vente</div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
      {isDetailsOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-[1.2rem] flex items-center justify-center text-indigo-600 shadow-sm">
                  <ReceiptText size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Facture #{selectedInvoice.id.split('-')[0].toUpperCase()}</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{new Date(selectedInvoice.date).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100"><Printer size={22} /></button>
                <button onClick={() => setIsDetailsOpen(false)} className="p-3 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"><X size={28} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Client</h4>
                  <p className="font-black text-slate-800 text-xl tracking-tight">{selectedInvoice.clientName || 'Client de Passage'}</p>
                  <p className="text-slate-500 font-bold flex items-center gap-2"><Phone size={16} className="text-slate-300" /> {selectedInvoice.clientPhone || 'N/A'}</p>
                </div>
                <div className="p-8 bg-indigo-900 rounded-[2rem] text-white space-y-6 shadow-xl shadow-indigo-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8"></div>
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Résumé financier</span>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${selectedInvoice.debtAmount > 0 ? 'bg-rose-500/20 text-rose-200' : 'bg-emerald-500/20 text-emerald-200'}`}>
                      {selectedInvoice.debtAmount > 0 ? 'Dette Active' : 'Règlé'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div>
                      <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">{t.total}</p>
                      <p className="text-3xl font-black tracking-tight">{selectedInvoice.totalAmount.toLocaleString()} <span className="text-xs font-medium">DZD</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">{t.debt}</p>
                      <p className="text-3xl font-black tracking-tight">{selectedInvoice.debtAmount.toLocaleString()} <span className="text-xs font-medium">DZD</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-12">
                <h4 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-7 bg-indigo-600 rounded-full shadow-lg shadow-indigo-100"></div>
                  Articles de la facture
                </h4>
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.name}</th>
                        <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.quantity}</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest Prix Unitaire">Prix Unitaire</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest Sous-total">Sous-total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedInvoice.items.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5 text-sm font-black text-slate-800">{item.productName}</td>
                          <td className="px-6 py-5 text-center text-sm font-bold text-slate-500">
                             <span className="px-3 py-1 bg-slate-100 rounded-lg">{item.quantity}</span>
                          </td>
                          <td className="px-6 py-5 text-right text-sm font-bold text-slate-600">{item.price.toLocaleString()} DZD</td>
                          <td className="px-6 py-5 text-right text-sm font-black text-indigo-600">{(item.price * item.quantity).toLocaleString()} DZD</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div>
                  <h4 className="font-black text-slate-800 mb-6 flex items-center gap-3">
                    <History size={20} className="text-slate-300" />
                    {t.paymentHistory}
                  </h4>
                  <div className="space-y-4">
                    {selectedInvoice.paymentHistory.map((pay: any, idx: number) => (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-50 shadow-sm"><CreditCard size={18} /></div>
                           <div>
                              <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Versement #{idx+1}</p>
                              <p className="text-[10px] font-bold text-slate-400">{new Date(pay.date).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <span className="text-lg font-black text-emerald-600">+{pay.amount.toLocaleString()} <span className="text-xs font-medium">DZD</span></span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {selectedInvoice.debtAmount > 0 && (
                  <div>
                    <h4 className="font-black text-slate-800 mb-6 flex items-center gap-3">
                      <ArrowRight size={20} className="text-rose-300" />
                      Régler la dette en cours
                    </h4>
                    <div className="p-8 bg-rose-50/50 rounded-[2rem] border border-rose-100 space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-2">Montant à verser</label>
                         <div className="flex gap-3">
                           <input 
                             type="number" 
                             max={selectedInvoice.debtAmount}
                             value={paymentAmount}
                             onChange={e => setPaymentAmount(e.target.value)}
                             className="flex-1 px-6 py-4 bg-white border border-rose-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-500/10 font-black text-xl text-rose-900"
                             placeholder="Ex: 2000"
                           />
                           <button 
                             onClick={() => handlePayDebt(selectedInvoice)}
                             className="px-8 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all active:scale-95"
                           >
                             Régler
                           </button>
                         </div>
                      </div>
                      <p className="text-[11px] font-bold text-rose-400 text-center uppercase tracking-widest">Reste dû total: <span className="font-black text-rose-600 underline decoration-2">{selectedInvoice.debtAmount.toLocaleString()} DZD</span></p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-8 border-t bg-slate-50/50 flex justify-end">
               <button onClick={() => setIsDetailsOpen(false)} className="px-10 py-4 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm">Fermer la vue</button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default SalesInvoicesView;
