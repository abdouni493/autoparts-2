
import React, { useState, useMemo } from 'react';
import { translations } from '../translations';
import { Filter, Calendar, TrendingUp, TrendingDown, DollarSign, Download, Printer, PieChart as PieIcon } from 'lucide-react';

const ReportsView: React.FC<{ store: any }> = ({ store }) => {
  const t = translations[store.language];
  const isRTL = store.language === 'ar';
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [reportType, setReportType] = useState('all');

  const stats = useMemo(() => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);

    const filteredSales = store.salesInvoices.filter((inv: any) => {
      const d = new Date(inv.date);
      return d >= start && d <= end;
    });

    const filteredPurchases = store.purchaseInvoices.filter((inv: any) => {
      const d = new Date(inv.date);
      return d >= start && d <= end;
    });

    const totalSales = filteredSales.reduce((acc: number, inv: any) => acc + inv.totalAmount, 0);
    const totalPurchases = filteredPurchases.reduce((acc: number, inv: any) => acc + inv.totalAmount, 0);
    const totalEarnings = totalSales - totalPurchases;

    return {
      totalSales,
      totalPurchases,
      totalEarnings,
      salesCount: filteredSales.length,
      purchaseCount: filteredPurchases.length,
      debtCreated: filteredSales.reduce((acc: number, inv: any) => acc + inv.debtAmount, 0),
    };
  }, [store.salesInvoices, store.purchaseInvoices, dateRange]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{t.reports}</h2>
          <p className="text-slate-500 mt-1">Générez des rapports financiers et d'inventaire</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} />
            Exporter CSV
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <Printer size={18} />
            {t.print}
          </button>
        </div>
      </div>

      {/* Date Filtering */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-end gap-6">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.startDate}</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="date" 
              value={dateRange.start}
              onChange={e => setDateRange({...dateRange, start: e.target.value})}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.endDate}</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="date" 
              value={dateRange.end}
              onChange={e => setDateRange({...dateRange, end: e.target.value})}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>
        <button className="px-8 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center gap-2">
          <Filter size={18} />
          {t.apply}
        </button>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 border-b-4 border-b-emerald-500">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total des Ventes</p>
            <p className="text-3xl font-black text-slate-800">{stats.totalSales.toLocaleString()} <span className="text-xs font-medium text-slate-400">DZD</span></p>
          </div>
          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">FACTURES:</span>
            <span className="text-slate-800">{stats.salesCount}</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4 border-b-4 border-b-rose-500">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total des Achats</p>
            <p className="text-3xl font-black text-slate-800">{stats.totalPurchases.toLocaleString()} <span className="text-xs font-medium text-slate-400">DZD</span></p>
          </div>
          <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">COMMANDES:</span>
            <span className="text-slate-800">{stats.purchaseCount}</span>
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-3xl text-white space-y-4 shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-10 -mt-10"></div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest">Gains Estimés</p>
            <p className="text-3xl font-black">{stats.totalEarnings.toLocaleString()} <span className="text-xs font-medium text-indigo-200">DZD</span></p>
          </div>
          <p className="text-xs font-medium text-indigo-200 pt-4 border-t border-white/10">
            Calculé sur la période sélectionnée (Ventes - Achats)
          </p>
        </div>
      </div>

      {/* Summary Table or Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center gap-2">
          <PieIcon className="text-indigo-600" size={20} />
          <h3 className="font-bold text-slate-800">Détails de la Période</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dettes Créées</p>
              <p className="text-xl font-bold text-rose-600">{stats.debtCreated.toLocaleString()} DZD</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Moyenne / Vente</p>
              <p className="text-xl font-bold text-slate-800">{(stats.salesCount > 0 ? Math.round(stats.totalSales / stats.salesCount) : 0).toLocaleString()} DZD</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ROI (Retour Invest.)</p>
              <p className="text-xl font-bold text-emerald-600">
                {stats.totalPurchases > 0 ? Math.round((stats.totalEarnings / stats.totalPurchases) * 100) : 0}%
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Flux Trésorerie</p>
              <p className="text-xl font-bold text-indigo-600">{(stats.totalSales - stats.debtCreated).toLocaleString()} DZD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
