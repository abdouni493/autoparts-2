
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from './store';
import { translations } from './translations';
import { Role } from './types';
import { 
  LayoutDashboard, Package, Users, FileText, 
  ShoppingCart, ReceiptText, UserCircle, Settings, LogOut,
  Plus, Search, Menu, X, Bell, Globe, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

// View Components
import DashboardView from './views/Dashboard';
import StorageView from './views/Storage';
import SuppliersView from './views/Suppliers';
import PurchaseInvoicesView from './views/PurchaseInvoices';
import POSView from './views/POS';
import SalesInvoicesView from './views/SalesInvoices';
import WorkersView from './views/Workers';
import ReportsView from './views/Reports';
import SettingsView from './views/Settings';
import LoginView from './views/Login';

const App: React.FC = () => {
  const store = useStore();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isCollapsed, setIsCollapsed] = useState(false); 
  
  const t = translations[store.language];
  const isRTL = store.language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = store.language;
  }, [store.language, isRTL]);

  if (store.isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Chargement des données Cloud...</p>
      </div>
    );
  }

  if (!store.currentUser) {
    return <LoginView store={store} />;
  }

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, roles: [Role.ADMIN, Role.WORKER] },
    { id: 'storage', label: t.storage, icon: Package, roles: [Role.ADMIN, Role.WORKER] },
    { id: 'pos', label: t.pos, icon: ShoppingCart, roles: [Role.ADMIN, Role.WORKER] },
    { id: 'suppliers', label: t.suppliers, icon: Users, roles: [Role.ADMIN] },
    { id: 'purchaseInvoices', label: t.purchaseInvoices, icon: FileText, roles: [Role.ADMIN] },
    { id: 'salesInvoices', label: t.salesInvoices, icon: ReceiptText, roles: [Role.ADMIN, Role.WORKER] },
    { id: 'workers', label: t.workers, icon: UserCircle, roles: [Role.ADMIN] },
    { id: 'reports', label: t.reports, icon: FileText, roles: [Role.ADMIN] },
    { id: 'settings', label: t.settings, icon: Settings, roles: [Role.ADMIN, Role.WORKER] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(store.currentUser!.role));

  const renderView = () => {
    const ViewComponent = {
      dashboard: DashboardView,
      storage: StorageView,
      suppliers: SuppliersView,
      purchaseInvoices: PurchaseInvoicesView,
      pos: POSView,
      salesInvoices: SalesInvoicesView,
      workers: WorkersView,
      reports: ReportsView,
      settings: SettingsView
    }[currentView] || DashboardView;

    return (
      <motion.div
        key={currentView}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <ViewComponent store={store} />
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen bg-[#f8fafc] flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <aside 
        className={`fixed inset-y-0 ${isRTL ? 'right-0 border-l shadow-l' : 'left-0 border-r shadow-r'} z-50 bg-white/80 backdrop-blur-xl transition-all duration-300 transform 
          ${isSidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')} 
          lg:relative lg:translate-x-0 overflow-hidden shadow-2xl lg:shadow-none
          ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        <div className="h-full flex flex-col">
          <div className={`p-6 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                  <Package size={22} />
                </div>
                <div className="whitespace-nowrap">
                  <span className="font-extrabold text-lg tracking-tight text-slate-800 block">AutoPro</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block -mt-1">Manager</span>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white shadow-lg">
                <Package size={22} />
              </div>
            )}
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto overflow-x-hidden">
            {filteredMenuItems.map((item) => (
              <button
                key={item.id}
                title={isCollapsed ? item.label : ""}
                onClick={() => {
                  setCurrentView(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-3.5 py-3 rounded-xl transition-all duration-200 group
                  ${currentView === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <item.icon size={isCollapsed ? 24 : 20} className={`${currentView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                {!isCollapsed && <span className="text-[14px] font-semibold whitespace-nowrap">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto space-y-3">
             <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`hidden lg:flex w-full items-center justify-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all font-bold text-xs`}
              >
                {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                {!isCollapsed && <span>{isRTL ? 'تصغير' : 'Réduire'}</span>}
              </button>

            {!isCollapsed && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                    <UserCircle size={18} />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 truncate">{store.currentUser.fullName}</p>
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{store.currentUser.role}</p>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => store.logout()}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all font-bold text-sm ${isCollapsed ? 'px-0' : ''}`}
            >
              <LogOut size={isCollapsed ? 22 : 18} />
              {!isCollapsed && <span>{t.logout}</span>}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen transition-all duration-300">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Menu size={20} />
          </button>

          <div className="hidden lg:flex items-center gap-2">
             <h1 className="text-base font-bold text-slate-800">
                {menuItems.find(m => m.id === currentView)?.label}
             </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => store.setLanguage(store.language === 'fr' ? 'ar' : 'fr')}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 rounded-lg transition-all flex items-center gap-2 font-bold text-xs"
            >
              <Globe size={14} />
              <span className="uppercase">{store.language}</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {renderView()}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
