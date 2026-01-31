
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { translations } from '../translations';
import { Package, Users, FileText, ShoppingCart, DollarSign, TrendingDown, AlertCircle, ChevronRight, ArrowUpRight } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

const DashboardView: React.FC<{ store: any }> = ({ store }) => {
  const t = translations[store.language];
  const isRTL = store.language === 'ar';

  const stats = useMemo(() => {
    const totalEarnings = store.salesInvoices.reduce((acc: number, inv: any) => acc + inv.paidAmount, 0);
    const lowStockCount = store.products.filter((p: any) => p.currentQuantity <= p.initialQuantity * 0.3).length;

    return [
      { label: t.totalEarnings, value: `${totalEarnings.toLocaleString()} DZD`, icon: DollarSign, color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-100' },
      { label: t.totalProducts, value: store.products.length, icon: Package, color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-100' },
      { label: t.lowStock, value: lowStockCount, icon: AlertCircle, color: 'from-orange-400 to-orange-600', shadow: 'shadow-orange-100' },
      { label: t.salesCount, value: store.salesInvoices.length, icon: ShoppingCart, color: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-100' },
    ];
  }, [store, t]);

  const salesData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return days.map(date => ({
      name: date.split('-').slice(1).reverse().join('/'),
      sales: store.salesInvoices.filter((inv: any) => inv.date.startsWith(date)).reduce((acc: number, inv: any) => acc + inv.totalAmount, 0),
      purchases: store.purchaseInvoices.filter((inv: any) => inv.date.startsWith(date)).reduce((acc: number, inv: any) => acc + inv.totalAmount, 0)
    }));
  }, [store.salesInvoices, store.purchaseInvoices]);

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e'];

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-indigo-900 rounded-[2.5rem] p-10 lg:p-14 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] -mr-40 -mt-40 opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] -ml-20 -mb-20 opacity-20"></div>
        
        <div className="relative z-10 max-w-2xl">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4"
          >
            {isRTL ? 'لوحة التحكم الذكية' : 'Tableau de bord intelligent'}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-indigo-100 text-lg lg:text-xl font-medium opacity-80"
          >
            {isRTL ? 'إليك نظرة سريعة على أداء عملك اليوم' : 'Voici un aperçu de la performance de votre entreprise aujourd\'hui.'}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex gap-4"
          >
             <button className="px-8 py-3.5 bg-white text-indigo-900 rounded-2xl font-bold text-sm shadow-xl shadow-black/10 hover:bg-indigo-50 transition-all active:scale-95">
               {isRTL ? 'عرض التقارير' : 'Voir les rapports'}
             </button>
             <button className="px-8 py-3.5 bg-indigo-500/30 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-sm hover:bg-indigo-500/50 transition-all active:scale-95">
               {isRTL ? 'إضافة منتج' : 'Ajouter un produit'}
             </button>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:shadow-indigo-100 hover:border-indigo-100 transition-all duration-300 relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-[0.03] rounded-bl-full`}></div>
            <div className="flex flex-col gap-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon size={26} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
               <h3 className="text-xl font-black text-slate-800 tracking-tight">{t.stats}</h3>
               <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">7 Derniers Jours</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ventes</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Achats</span>
               </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px'}}
                />
                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="purchases" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorPurchases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity / Low Stock */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{isRTL ? 'تنبيهات' : 'Alertes'}</h3>
            <button className="text-indigo-600 hover:text-indigo-700 transition-colors">
              <ArrowUpRight size={20} />
            </button>
          </div>
          
          <div className="flex-1 space-y-4">
            {store.products.filter((p:any) => p.currentQuantity <= p.initialQuantity * 0.3).slice(0, 5).map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-orange-50/50 border border-orange-100 rounded-2xl group hover:bg-orange-50 transition-all cursor-default">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform">
                  <AlertCircle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-0.5">Stock Critique: {p.currentQuantity}</p>
                </div>
              </div>
            ))}
            {store.products.filter((p:any) => p.currentQuantity <= p.initialQuantity * 0.3).length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-40 py-20">
                  <Package size={48} />
                  <p className="text-sm font-bold uppercase tracking-widest italic">Aucune alerte</p>
               </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
             <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                <span>Capacité Stock</span>
                <span className="text-slate-800">74%</span>
             </div>
             <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{width: '74%'}}></div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardView;
