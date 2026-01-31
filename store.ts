
import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  Product, Supplier, PurchaseInvoice, SalesInvoice, 
  User, Language, Role, WorkerPayment, FuelType, PaymentType 
} from './types';

// Utilitaires de mapping pour éviter les erreurs de colonnes Supabase
const toSnake = (obj: any) => {
  const snakeObj: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    snakeObj[snakeKey] = obj[key];
  }
  return snakeObj;
};

const toCamel = (obj: any) => {
  if (!obj) return null;
  const camelObj: any = {};
  for (const key in obj) {
    if (key === 'paymentHistory' || key === 'items') {
      camelObj[key] = obj[key];
      continue;
    }
    const camelKey = key.replace(/(_\w)/g, m => m[1].toUpperCase());
    camelObj[camelKey] = obj[key];
  }
  return camelObj;
};

export const useStore = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [salesInvoices, setSalesInvoices] = useState<SalesInvoice[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [workerPayments, setWorkerPayments] = useState<WorkerPayment[]>([]);
  const [language, setLanguage] = useState<Language>('fr');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user && !currentUser) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .maybeSingle();
        
        if (userProfile) {
          setCurrentUser(toCamel(userProfile));
        }
      }

      const [
        { data: prodData, error: prodErr },
        { data: supData },
        { data: purData },
        { data: salesData },
        { data: workData },
        { data: payData }
      ] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('suppliers').select('*').order('created_at', { ascending: false }),
        supabase.from('purchase_invoices').select('*').order('date', { ascending: false }),
        supabase.from('sales_invoices').select('*, paymentHistory:sales_payments(*), items:sales_items(*)').order('date', { ascending: false }),
        supabase.from('users').select('*'),
        supabase.from('worker_payments').select('*').order('date', { ascending: false })
      ]);

      if (prodData) setProducts(prodData.map(toCamel));
      if (supData) setSuppliers(supData.map(toCamel));
      if (purData) setPurchaseInvoices(purData.map(toCamel));
      if (salesData) setSalesInvoices(salesData.map(s => ({
        ...toCamel(s),
        paymentHistory: s.paymentHistory?.map(toCamel) || [],
        items: s.items?.map(toCamel) || []
      })));
      if (workData) {
        const mappedUsers = workData.map(toCamel);
        setWorkers(mappedUsers.filter((u: any) => u.role === Role.WORKER));
      }
      if (payData) setWorkerPayments(payData.map(toCamel));

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<{success: boolean, error?: string}> => {
    const emailInput = usernameOrEmail.trim();
    const passInput = password.trim();

    if (emailInput === 'admin@auto.com' && passInput === 'admin123') {
      const staticUser: User = {
        id: 'static-admin-id',
        username: 'admin',
        email: 'admin@auto.com',
        role: Role.ADMIN,
        fullName: 'Administrateur Système'
      };
      setCurrentUser(staticUser);
      return { success: true };
    }

    let email = emailInput;
    if (!email.includes('@')) {
      const { data: profile } = await supabase
        .from('users')
        .select('email')
        .eq('username', email)
        .maybeSingle();
      
      if (profile?.email) {
        email = profile.email;
      } else {
        email = `${usernameOrEmail}@autopro.com`;
      }
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: passInput
    });

    if (error) return { success: false, error: "Identifiants invalides." };

    await fetchData();
    return { success: true };
  };

  const signUp = async (username: string, email: string, password: string): Promise<{success: boolean, error?: string}> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) return { success: false, error: error.message };

    const role = username.toLowerCase().includes('admin') || email.includes('admin') ? Role.ADMIN : Role.WORKER;
    
    await supabase
      .from('users')
      .upsert([toSnake({ 
        email: email, 
        username: username,
        role: role,
        fullName: username
      })], { onConflict: 'email' });

    if (data.session) {
      await fetchData();
      return { success: true };
    } else {
      return { success: false, error: "Compte créé ! Connectez-vous avec admin@auto.com ou confirmez votre email." };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  // PRODUCTS
  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    const payload = toSnake(product);
    const { data, error } = await supabase.from('products').insert([payload]).select().single();
    if (error) console.error("Error adding product:", error);
    if (data) setProducts(prev => [toCamel(data), ...prev]);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const payload = toSnake(updates);
    const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
    if (error) console.error("Error updating product:", error);
    if (data) setProducts(prev => prev.map(p => p.id === id ? toCamel(data) : p));
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(prev => prev.filter(p => p.id !== id));
  };

  // SUPPLIERS
  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt'>) => {
    const payload = toSnake(supplier);
    const { data, error } = await supabase.from('suppliers').insert([payload]).select().single();
    if (error) console.error("Error adding supplier:", error);
    if (data) setSuppliers(prev => [toCamel(data), ...prev]);
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    const payload = toSnake(updates);
    const { data, error } = await supabase.from('suppliers').update(payload).eq('id', id).select().single();
    if (error) console.error("Error updating supplier:", error);
    if (data) setSuppliers(prev => prev.map(s => s.id === id ? toCamel(data) : s));
  };

  const deleteSupplier = async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (!error) setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // PURCHASE INVOICES
  const addPurchaseInvoice = async (invoice: Omit<PurchaseInvoice, 'id' | 'date' | 'totalAmount'>) => {
    const totalAmount = invoice.quantity * invoice.purchasePrice;
    const payload = toSnake({ ...invoice, totalAmount });
    const { data, error } = await supabase.from('purchase_invoices').insert([payload]).select().single();
    
    if (!error && data) {
      // Mise à jour du stock
      const product = products.find(p => p.id === invoice.productId);
      if (product) {
        await updateProduct(product.id, { 
          currentQuantity: product.currentQuantity + invoice.quantity,
          purchasePrice: invoice.purchasePrice,
          sellingPrice: invoice.sellingPrice
        });
      }
      fetchData();
    }
  };

  const deletePurchaseInvoice = async (id: string) => {
    const { error } = await supabase.from('purchase_invoices').delete().eq('id', id);
    if (!error) fetchData();
  };

  // SALES INVOICES
  const addSalesInvoice = async (sale: Omit<SalesInvoice, 'id' | 'date' | 'paymentHistory'>) => {
    const payload = toSnake({
      clientName: sale.clientName,
      clientPhone: sale.clientPhone,
      totalAmount: sale.totalAmount,
      paidAmount: sale.paidAmount,
      debtAmount: sale.debtAmount
    });
    
    const { data: inv, error: invErr } = await supabase.from('sales_invoices').insert([payload]).select().single();

    if (inv && !invErr) {
      // Items
      const itemsToInsert = sale.items.map(item => toSnake({
        invoiceId: inv.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price
      }));
      await supabase.from('sales_items').insert(itemsToInsert);
      
      // Initial Payment
      await supabase.from('sales_payments').insert([toSnake({ invoiceId: inv.id, amount: sale.paidAmount })]);
      
      // Update Stocks
      for (const item of sale.items) {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          await updateProduct(prod.id, { currentQuantity: Math.max(0, prod.currentQuantity - item.quantity) });
        }
      }
      fetchData();
    }
  };

  const deleteSalesInvoice = async (id: string) => {
    const { error } = await supabase.from('sales_invoices').delete().eq('id', id);
    if (!error) fetchData();
  };

  const payDebt = async (invoiceId: string, amount: number) => {
    const { error: payErr } = await supabase.from('sales_payments').insert([toSnake({ invoiceId, amount })]);
    if (!payErr) {
      const inv = salesInvoices.find(i => i.id === invoiceId);
      if (inv) {
        await supabase.from('sales_invoices').update(toSnake({
          paidAmount: inv.paidAmount + amount,
          debtAmount: Math.max(0, inv.debtAmount - amount)
        })).eq('id', invoiceId);
        fetchData();
      }
    }
  };

  // WORKERS
  const addWorker = async (worker: Omit<User, 'id' | 'role'>) => {
    const payload = toSnake({ ...worker, role: Role.WORKER });
    const { data, error } = await supabase.from('users').insert([payload]).select().single();
    if (error) console.error("Error adding worker:", error);
    if (data) setWorkers(prev => [toCamel(data), ...prev]);
  };

  const updateWorker = async (id: string, updates: Partial<User>) => {
    const payload = toSnake(updates);
    const { data, error } = await supabase.from('users').update(payload).eq('id', id).select().single();
    if (data) setWorkers(prev => prev.map(w => w.id === id ? toCamel(data) : w));
  };

  const deleteWorker = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) setWorkers(prev => prev.filter(w => w.id !== id));
  };

  const registerWorkerPayment = async (payment: Omit<WorkerPayment, 'id' | 'date'>) => {
    const payload = toSnake(payment);
    const { data, error } = await supabase.from('worker_payments').insert([payload]).select().single();
    if (data) setWorkerPayments(prev => [toCamel(data), ...prev]);
  };

  const backupData = () => {
    const blob = new Blob([JSON.stringify({ products, suppliers, purchaseInvoices, salesInvoices, workers, workerPayments, language })], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `autoparts_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return {
    products, suppliers, purchaseInvoices, salesInvoices, workers, workerPayments, language, currentUser, isLoading,
    setLanguage, login, signUp, logout, addProduct, updateProduct, deleteProduct, addSupplier, updateSupplier, deleteSupplier,
    addPurchaseInvoice, deletePurchaseInvoice, addSalesInvoice, deleteSalesInvoice, payDebt, addWorker, updateWorker, deleteWorker, registerWorkerPayment,
    backupData, setCurrentUser
  };
};
