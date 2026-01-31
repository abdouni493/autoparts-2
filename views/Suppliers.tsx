
import React, { useState, useMemo } from 'react';
import { translations } from '../translations';
import { Plus, Search, User, Phone, MapPin, History, Edit2, Trash2, X } from 'lucide-react';

const SuppliersView: React.FC<{ store: any }> = ({ store }) => {
  const t = translations[store.language];
  const isRTL = store.language === 'ar';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: ''
  });

  const filteredSuppliers = useMemo(() => {
    return store.suppliers.filter((s: any) => 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm)
    );
  }, [store.suppliers, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSupplier && !isHistoryOpen) {
      store.updateSupplier(selectedSupplier.id, formData);
    } else {
      store.addSupplier(formData);
    }
    setIsModalOpen(false);
    setSelectedSupplier(null);
    setFormData({ fullName: '', phone: '', address: '' });
  };

  const handleEdit = (s: any) => {
    setSelectedSupplier(s);
    setFormData({ fullName: s.fullName, phone: s.phone, address: s.address });
    setIsModalOpen(true);
  };

  const viewHistory = (s: any) => {
    setSelectedSupplier(s);
    setIsHistoryOpen(true);
  };

  const supplierHistory = useMemo(() => {
    if (!selectedSupplier) return [];
    return store.purchaseInvoices.filter((inv: any) => inv.supplierId === selectedSupplier.id);
  }, [selectedSupplier, store.purchaseInvoices]);

  const totalSpent = useMemo(() => {
    return supplierHistory.reduce((acc: number, inv: any) => acc + inv.totalAmount, 0);
  }, [supplierHistory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t.suppliers}</h2>
          <p className="text-slate-500 mt-1">{filteredSuppliers.length} {t.totalSuppliers}</p>
        </div>
        <button 
          onClick={() => { setSelectedSupplier(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-100 transition-all font-semibold"
        >
          <Plus size={20} />
          {t.newSupplier}
        </button>
      </div>

      <div className="relative">
        <Search className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} my-auto text-slate-400`} size={20} />
        <input 
          type="text" 
          placeholder={t.search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((s: any) => (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{s.fullName}</h3>
                <p className="text-xs text-slate-400 font-medium">Fournisseur Partenaire</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Phone size={16} className="text-slate-400" />
                <span>{s.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <MapPin size={16} className="text-slate-400" />
                <span className="line-clamp-1">{s.address}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <button 
                onClick={() => viewHistory(s)}
                className="flex items-center gap-2 text-indigo-600 text-xs font-bold hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
              >
                <History size={14} />
                {t.history}
              </button>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(s)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => store.deleteSupplier(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">{selectedSupplier ? t.edit : t.newSupplier}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.name}</label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.phone}</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">{t.address}</label>
                <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-all">{t.cancel}</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedSupplier.fullName}</h3>
                <p className="text-sm text-slate-500">{t.history}</p>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="mb-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex justify-between items-center">
                <span className="text-indigo-700 font-bold">{t.total}:</span>
                <span className="text-indigo-700 text-xl font-bold">{totalSpent.toLocaleString()} DZD</span>
              </div>

              <div className="space-y-4">
                {supplierHistory.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 italic">Aucun historique d'achat</div>
                ) : (
                  supplierHistory.map((inv: any) => {
                    const product = store.products.find((p: any) => p.id === inv.productId);
                    return (
                      <div key={inv.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{product?.name || 'Produit supprimé'}</p>
                          <p className="text-xs text-slate-400">{new Date(inv.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-indigo-600">+{inv.quantity} <span className="text-[10px] text-slate-400">UNITÉS</span></p>
                          <p className="text-xs font-medium text-slate-500">{inv.totalAmount.toLocaleString()} DZD</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersView;
