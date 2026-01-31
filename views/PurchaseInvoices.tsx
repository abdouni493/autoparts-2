
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../translations';
import { Plus, Search, FileText, ChevronRight, X, User, Package, Calendar, ArrowRight, Eye, Edit2, Trash2, Info } from 'lucide-react';

const PurchaseInvoicesView: React.FC<{ store: any }> = ({ store }) => {
  const t = translations[store.language];
  const isRTL = store.language === 'ar';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  const [productQuery, setProductQuery] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  
  // New/Edit Invoice Form
  const [formData, setFormData] = useState({
    productId: '',
    supplierId: '',
    quantity: 1,
    purchasePrice: 0,
    sellingPrice: 0
  });

  const filteredInvoices = useMemo(() => {
    return store.purchaseInvoices.filter((inv: any) => {
      const product = store.products.find((p: any) => p.id === inv.productId);
      const supplier = store.suppliers.find((s: any) => s.id === inv.supplierId);
      return (
        product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.barcode.includes(searchTerm) ||
        product?.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [store.purchaseInvoices, store.products, store.suppliers, searchTerm]);

  const searchedProducts = useMemo(() => {
    if (!productQuery) return [];
    return store.products.filter((p: any) => 
      p.name.toLowerCase().includes(productQuery.toLowerCase()) || 
      p.barcode.includes(productQuery) ||
      p.reference.toLowerCase().includes(productQuery.toLowerCase())
    ).slice(0, 5);
  }, [store.products, productQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && selectedInvoice) {
      store.updatePurchaseInvoice(selectedInvoice.id, {
        ...formData,
        totalAmount: formData.quantity * formData.purchasePrice
      });
    } else {
      store.addPurchaseInvoice(formData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ productId: '', supplierId: '', quantity: 1, purchasePrice: 0, sellingPrice: 0 });
    setProductQuery('');
    setIsEditMode(false);
    setSelectedInvoice(null);
  };

  const handleProductSelect = (p: any) => {
    setFormData({
      ...formData,
      productId: p.id,
      supplierId: p.supplierId,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice
    });
    setProductQuery(p.name);
    setShowProductDropdown(false);
  };

  const openDetails = (inv: any) => {
    setSelectedInvoice(inv);
    setIsDetailsOpen(true);
  };

  const openEdit = (inv: any) => {
    const product = store.products.find((p: any) => p.id === inv.productId);
    setSelectedInvoice(inv);
    setFormData({
      productId: inv.productId,
      supplierId: inv.supplierId,
      quantity: inv.quantity,
      purchasePrice: inv.purchasePrice,
      sellingPrice: inv.sellingPrice
    });
    setProductQuery(product?.name || '');
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      store.deletePurchaseInvoice(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.purchaseInvoices}</h2>
          <p className="text-slate-500 mt-1">{filteredInvoices.length} {t.purchaseCount}</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl shadow-xl shadow-indigo-100 transition-all font-bold"
        >
          <Plus size={20} />
          {t.add}
        </button>
      </div>

      <div className="relative group">
        <Search className={`absolute inset-y-0 ${isRTL ? 'right-4' : 'left-4'} my-auto text-slate-400`} size={20} />
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
                <th className="px-8 py-5">{t.name}</th>
                <th className="px-8 py-5">{t.supplier}</th>
                <th className="px-8 py-5">{t.quantity}</th>
                <th className="px-8 py-5">{t.total}</th>
                <th className="px-8 py-5 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv: any) => {
                const product = store.products.find((p: any) => p.id === inv.productId);
                const supplier = store.suppliers.find((s: any) => s.id === inv.supplierId);
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                        <Calendar size={14} className="text-slate-300" />
                        {new Date(inv.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-black text-slate-800">{product?.name || '---'}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase mt-0.5">{product?.brand} • {product?.reference}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-slate-600">{supplier?.fullName || '---'}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-black">
                        {inv.quantity}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-slate-800">
                      {inv.totalAmount.toLocaleString()} DZD
                    </td>
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openDetails(inv)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white border border-slate-100 rounded-xl shadow-sm">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openEdit(inv)} className="p-2 text-slate-400 hover:text-amber-600 transition-colors bg-white border border-slate-100 rounded-xl shadow-sm">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(inv.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors bg-white border border-slate-100 rounded-xl shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredInvoices.length === 0 && (
            <div className="py-24 text-center text-slate-300 italic font-medium">Aucune facture trouvée</div>
          )}
        </div>
      </div>

      {/* Invoice Form Modal (Add/Edit) */}
      <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{isEditMode ? 'Modifier la Facture' : 'Nouvelle Facture d\'Achat'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 relative">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Chercher un produit</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      required
                      type="text" 
                      autoComplete="off"
                      placeholder="Nom, Code-barres, Référence..."
                      value={productQuery}
                      onFocus={() => setShowProductDropdown(true)}
                      onChange={(e) => {
                        setProductQuery(e.target.value);
                        setShowProductDropdown(true);
                      }}
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all"
                    />
                    
                    {showProductDropdown && searchedProducts.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                        {searchedProducts.map(p => (
                          <button 
                            key={p.id}
                            type="button"
                            onClick={() => handleProductSelect(p)}
                            className="w-full flex items-center justify-between p-4 hover:bg-indigo-50 transition-colors text-left border-b last:border-0"
                          >
                            <div>
                              <p className="font-bold text-slate-800">{p.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.brand} • {p.reference}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-black text-indigo-600">{p.purchasePrice} DZD</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">{t.supplier}</label>
                  <select 
                    required
                    value={formData.supplierId}
                    onChange={e => setFormData({...formData, supplierId: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all"
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {store.suppliers.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">{t.quantity}</label>
                  <input 
                    required type="number" min="1"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">P.A Unit. (DZD)</label>
                  <input 
                    required type="number"
                    value={formData.purchasePrice}
                    onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">P.V Unit. (DZD)</label>
                  <input 
                    required type="number"
                    value={formData.sellingPrice}
                    onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold transition-all"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <div className="p-4 bg-indigo-900 rounded-2xl text-right shadow-lg shadow-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full -mr-4 -mt-4"></div>
                    <p className="text-[9px] text-indigo-200 font-black uppercase tracking-[0.3em] mb-1">Total Facture</p>
                    <p className="text-2xl font-black text-white">{(formData.quantity * formData.purchasePrice).toLocaleString()} <span className="text-sm font-medium">DZD</span></p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3.5 border border-slate-200 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-all text-sm uppercase tracking-widest">{t.cancel}</button>
                <button type="submit" className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all text-sm uppercase tracking-widest">{isEditMode ? t.save : t.add}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
      {isDetailsOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">Détails de la Facture</h3>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: {selectedInvoice.id.split('-')[0].toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="text-slate-300 hover:text-slate-600 transition-colors">
                <X size={28} />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.date}</p>
                   <p className="font-bold text-slate-800">{new Date(selectedInvoice.date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.supplier}</p>
                   <p className="font-bold text-slate-800">{store.suppliers.find((s:any) => s.id === selectedInvoice.supplierId)?.fullName || '---'}</p>
                </div>
                <div className="col-span-2 p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center gap-5">
                   <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                      <Package size={28} />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Produit</p>
                      <p className="font-black text-slate-800 text-lg leading-tight">{store.products.find((p:any) => p.id === selectedInvoice.productId)?.name || '---'}</p>
                      <p className="text-xs font-bold text-slate-400">{store.products.find((p:any) => p.id === selectedInvoice.productId)?.brand}</p>
                   </div>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.quantity}</p>
                   <p className="text-xl font-black text-slate-800">{selectedInvoice.quantity} <span className="text-xs font-medium text-slate-400 uppercase">Unités</span></p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Prix Achat Unit.</p>
                   <p className="text-xl font-black text-slate-800">{selectedInvoice.purchasePrice.toLocaleString()} <span className="text-xs font-medium text-slate-400">DZD</span></p>
                </div>
              </div>

              <div className="p-8 bg-indigo-900 rounded-[2rem] text-white flex justify-between items-center shadow-xl shadow-indigo-100">
                 <div>
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-1">Montant Total Règlement</p>
                    <p className="text-3xl font-black">{selectedInvoice.totalAmount.toLocaleString()} <span className="text-sm font-medium">DZD</span></p>
                 </div>
                 <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
                    <Info size={32} className="text-white/40" />
                 </div>
              </div>
            </div>
            
            <div className="p-8 border-t bg-slate-50/50 flex justify-end gap-3">
               <button onClick={() => { setIsDetailsOpen(false); openEdit(selectedInvoice); }} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">{t.edit}</button>
               <button onClick={() => setIsDetailsOpen(false)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all">Fermer</button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default PurchaseInvoicesView;
