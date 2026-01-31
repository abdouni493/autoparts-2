
export type Language = 'fr' | 'ar';

export enum Role {
  ADMIN = 'ADMIN',
  WORKER = 'WORKER'
}

export enum FuelType {
  DIESEL = 'DIESEL',
  ESSENCE = 'ESSENCE'
}

export enum PaymentType {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY'
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: Role;
  fullName: string;
  phone?: string;
  address?: string;
  paymentType?: PaymentType;
  paymentAmount?: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  reference: string;
  barcode: string;
  fuelType: FuelType;
  supplierId: string;
  initialQuantity: number;
  currentQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface PurchaseInvoice {
  id: string;
  productId: string;
  supplierId: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  totalAmount: number;
  date: string;
}

export interface SalesInvoice {
  id: string;
  clientName?: string;
  clientPhone?: string;
  items: SalesItem[];
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  date: string;
  paymentHistory: PaymentHistory[];
}

export interface SalesItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface PaymentHistory {
  date: string;
  amount: number;
}

export interface WorkerPayment {
  id: string;
  workerId: string;
  amount: number;
  date: string;
  period: string;
}
