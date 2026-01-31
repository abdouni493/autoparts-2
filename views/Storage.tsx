
import React, { useState, useMemo } from 'react';
import { translations } from '../translations';
import { FuelType } from '../types';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Users, X } from 'lucide-react';

const StorageView: React.FC<{ store: any }> = ({ store }) => {
  const t = translations[store.language];
  const isRTL = store.language === 'ar';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    reference: '',
    barcode: '',
    fuelType: FuelType.ESSENCE,
    supplierId: '',
    initialQuantity: 0,
    currentQuantity: 0,
    purchasePrice: 0,
    sellingPrice: 0
  });

  const filteredProducts = useMemo(() => {
    return store.products.filter((p: any) => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.includes(searchTerm) ||
      p.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [store.products, searchTerm]);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({ 
      name: product.name,
      brand: product.brand,
      reference: product.reference,
      barcode: product.barcode,
      fuelType: product.fuelType,
      supplierId: product.supplierId,
      initialQuantity: product.initialQuantity,
      currentQuantity: product.currentQuantity,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await store.updateProduct(editingProduct.id, formData);
    } else {
      await store.addProduct({
        ...formData,
        currentQuantity: formData.initialQuantity 
      });
    }
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '', brand: '', reference: '', barcode: '',
      fuelType: FuelType.ESSENCE, supplierId: '',
      initialQuantity: 0, currentQuantity: 0,
      purchasePrice: 0, sellingPrice: 0
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t.storage}</h2>
          <p className="text-slate-500 mt-1">{filteredProducts.length} {t.totalProducts}</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-100 transition-all font-semibold"
        >
          <Plus size={20} />
          {t.newProduct}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} my-auto text-slate-400`} size={20} />
          <input 
            type="text" 
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none shadow-sm`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((p: any) => {
          const isLowStock = p.currentQuantity <= p.initialQuantity * 0.3;
          const supplier = store.suppliers.find((s: any) => s.id === p.supplierId);
          
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{p.name}</h3>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">{p.brand} • {p.reference}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${p.fuelType === FuelType.ESSENCE ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                    {p.fuelType === FuelType.ESSENCE ? t.essence : t.diesel}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{t.currentQty}</p>
                    <p className={`text-lg font-bold ${isLowStock ? 'text-orange-600' : 'text-slate-700'}`}>
                      {p.currentQuantity} / {p.initialQuantity}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{t.sellingPrice}</p>
                    <p className="text-lg font-bold text-slate-700">{p.sellingPrice?.toLocaleString()} <span className="text-[10px]">DZD</span></p>
                  </div>
                </div>

                {isLowStock && (
                  <div className="mb-6 p-3 bg-orange-50 rounded-xl border border-orange-100 flex items-center gap-2 text-orange-700 text-xs font-medium">
                    <AlertTriangle size={16} />
                    {t.inventoryAlert}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users size={14} />
                    <span>{supplier?.fullName || '---'}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(p)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => { if(confirm(t.confirmDelete)) store.deleteProduct(p.id) }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">{editingProduct ? t.edit : t.newProduct}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.name}</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.brand}</label>
                  <input required type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.reference}</label>
                  <input required type="text" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.barcode}</label>
                  <input required type="text" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.fuelType}</label>
                  <select value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value as FuelType})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value={FuelType.ESSENCE}>{t.essence}</option>
                    <option value={FuelType.DIESEL}>{t.diesel}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.supplier}</label>
                  <select required value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">---</option>
                    {store.suppliers.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.initialQty}</label>
                  <input required type="number" value={formData.initialQuantity} onChange={e => setFormData({...formData, initialQuantity: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.purchasePrice} (DZD)</label>
                  <input required type="number" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t.sellingPrice} (DZD)</label>
                  <input required type="number" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="pt-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white py-4 z-10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-all">{t.cancel}</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageView;
