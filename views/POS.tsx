
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../translations';
// Added ChevronRight icon to imports
import { Search, ShoppingCart, Trash2, Plus, Minus, User, Phone, CheckCircle, CreditCard, X, QrCode, ScanLine, ChevronRight } from 'lucide-react';

const POSView: React.FC<{ store: any }> = ({ store }) => {
  const t = translations[store.language];
  const isRTL = store.language === 'ar';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '' });
  const [paidAmount, setPaidAmount] = useState<number | string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus search on mount
    searchInputRef.current?.focus();
  }, []);

  const filteredProducts = useMemo(() => {
    if (searchTerm.length < 1) return [];
    return store.products.filter((p: any) => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      p.reference.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [store.products, searchTerm]);

  const addToCart = (p: any) => {
    if (p.currentQuantity <= 0) {
      alert(isRTL ? 'المنتج غير متوفر' : 'Produit en rupture de stock');
      return;
    }
    const existing = cart.find(item => item.id === p.id);
    if (existing) {
      if (existing.quantity >= p.currentQuantity) return;
      setCart(cart.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([{ ...p, quantity: 1 }, ...cart]);
    }
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, Math.min(item.quantity + delta, item.currentQuantity));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);

  const handleCheckout = (isFullPayment: boolean) => {
    const finalPaidAmount = isFullPayment ? totalAmount : Number(paidAmount);
    const debtAmount = totalAmount - finalPaidAmount;

    store.addSalesInvoice({
      clientName: clientInfo.name,
      clientPhone: clientInfo.phone,
      items: cart.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.sellingPrice
      })),
      totalAmount,
      paidAmount: finalPaidAmount,
      debtAmount: Math.max(0, debtAmount)
    });

    setCart([]);
    setClientInfo({ name: '', phone: '' });
    setPaidAmount('');
    setIsCheckoutOpen(false);
    alert(isRTL ? 'تم إنشاء الفاتورة بنجاح' : 'Facture créée avec succès');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-8">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
               <QrCode className="text-indigo-600" size={28} />
               {t.pos}
             </h2>
             <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100">
               Scanner Actif
             </div>
          </div>
          
          <div className="relative group">
            <div className={`absolute inset-y-0 ${isRTL ? 'right-5' : 'left-5'} flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors`}>
              <Search size={24} />
            </div>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder={isRTL ? 'ابحث بالاسم أو الباركود...' : 'Scanner ou chercher (Nom, Réf, Barcode)...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${isRTL ? 'pr-16 pl-6' : 'pl-16 pr-6'} py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-lg`}
            />
            
            <AnimatePresence>
              {filteredProducts.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 max-h-[400px] overflow-y-auto p-4 space-y-2"
                >
                  {filteredProducts.map((p: any) => (
                    <button 
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="w-full flex items-center justify-between p-5 hover:bg-indigo-50/50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 group"
                      disabled={p.currentQuantity <= 0}
                    >
                      <div className="text-left flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-500 transition-colors shrink-0 font-black">
                           {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className={`font-black ${p.currentQuantity <= 0 ? 'text-slate-300' : 'text-slate-800'}`}>{p.name}</p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{p.brand} • {p.reference}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-indigo-600 text-lg">{p.sellingPrice.toLocaleString()} DZD</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${p.currentQuantity <= 5 ? 'text-orange-500' : 'text-slate-400'}`}>
                          Stock: {p.currentQuantity}
                        </p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Cart Listing */}
        <div className="bg-white flex-1 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Panier</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cart.length} Articles sélectionnés</p>
              </div>
            </div>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="px-4 py-2 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-xl uppercase tracking-widest transition-all">
                Vider
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence initial={false}>
              {cart.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className="h-full flex flex-col items-center justify-center text-slate-300 gap-6 py-20"
                >
                  <div className="relative">
                     <ShoppingCart size={80} strokeWidth={1} />
                     <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-10"
                     />
                  </div>
                  <p className="font-black text-lg uppercase tracking-widest italic">Le panier attend vos sélections</p>
                </motion.div>
              ) : (
                cart.map((item) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    className="flex items-center gap-6 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-black text-slate-800 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{item.sellingPrice.toLocaleString()} DZD / Unit</p>
                    </div>
                    <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm shrink-0">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-3 hover:bg-slate-50 text-slate-500 active:scale-90 transition-all"><Minus size={18} /></button>
                      <span className="w-12 text-center text-lg font-black text-slate-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-3 hover:bg-slate-50 text-slate-500 active:scale-90 transition-all"><Plus size={18} /></button>
                    </div>
                    <div className="w-32 text-right shrink-0">
                      <p className="text-xl font-black text-indigo-600">{(item.sellingPrice * item.quantity).toLocaleString()}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-3 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all">
                      <Trash2 size={22} />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Checkout Sidebar */}
      <div className="w-full lg:w-[400px] flex flex-col gap-8 shrink-0">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-3 uppercase tracking-widest">
            <User className="text-indigo-600" size={20} />
            {t.clientName}
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Identité</label>
              <input 
                type="text" 
                placeholder="Ex: Mourad Brahimi"
                value={clientInfo.name}
                onChange={e => setClientInfo({...clientInfo, name: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">{t.phone}</label>
              <input 
                type="text" 
                placeholder="06XX XX XX XX"
                value={clientInfo.phone}
                onChange={e => setClientInfo({...clientInfo, phone: e.target.value})}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all font-bold"
              />
            </div>
          </div>
        </div>

        <div className="bg-indigo-900 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-200 flex flex-col relative overflow-hidden flex-1">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full -mr-10 -mt-10 blur-2xl"></div>
          
          <div className="relative z-10 space-y-6 flex-1">
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                <span className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Sous-total</span>
                <span className="text-white font-black">{totalAmount.toLocaleString()} DZD</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Remise (0%)</span>
                <span className="text-emerald-400 font-black">- 0 DZD</span>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/10 flex flex-col gap-2">
              <span className="text-indigo-300 font-bold uppercase tracking-widest text-[10px]">Montant Total à Payer</span>
              <span className="text-4xl font-black text-white">{totalAmount.toLocaleString()} <span className="text-lg">DZD</span></span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="relative z-10 w-full py-6 mt-8 bg-white hover:bg-indigo-50 disabled:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-indigo-900 font-black text-xl rounded-[1.5rem] shadow-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-4 group"
          >
            {t.checkout}
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Modern Checkout Selection Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden relative z-10 p-10 lg:p-12"
            >
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                   <CheckCircle size={40} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Finalisation</h3>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-2">Choisir le mode de paiement</p>
              </div>

              <div className="space-y-6">
                <button 
                  onClick={() => handleCheckout(true)}
                  className="w-full flex items-center gap-6 p-8 bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-500 rounded-[2rem] transition-all group text-left"
                >
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-emerald-200 shrink-0">
                    <CreditCard size={32} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-emerald-900">{t.fullPayment}</p>
                    <p className="text-sm text-emerald-600/70 font-bold leading-relaxed">Le montant total de {totalAmount.toLocaleString()} DZD est réglé maintenant.</p>
                  </div>
                </button>

                <div className="relative py-4">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                   <div className="relative flex justify-center"><span className="px-4 bg-white text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Ou Partiel</span></div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Acompte Versé</label>
                    <div className="flex gap-3">
                      <input 
                        type="number" 
                        placeholder="Ex: 5000"
                        value={paidAmount}
                        onChange={e => setPaidAmount(e.target.value)}
                        className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-black text-xl text-slate-800"
                      />
                      <button 
                        onClick={() => handleCheckout(false)}
                        className="px-8 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-90"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                  {paidAmount && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-rose-50 text-rose-600 rounded-xl flex justify-between items-center text-xs font-black uppercase tracking-widest border border-rose-100"
                    >
                      <span>Reste à payer (Dette):</span>
                      <span className="text-sm">{(totalAmount - Number(paidAmount)).toLocaleString()} DZD</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default POSView;
