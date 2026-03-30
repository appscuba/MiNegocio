/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Percent, 
  Trash2, 
  ArrowRightLeft,
  Info,
  Package,
  BarChart3,
  Plus,
  X,
  ShoppingCart,
  Layers,
  Settings as SettingsIcon,
  Globe,
  Coins,
  User,
  PieChart as PieChartIcon,
  Lock,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

// --- Types ---

interface Product {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  unitProfit: number;
  margin: number;
  initialStock: number;
  currentStock: number;
  minStock: number;
  unitsSold: number;
  totalProfit: number;
  date: string;
  unit: string;
}

interface SaleRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  profit: number;
  totalSale: number;
  timestamp: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'seller';
}

interface AppSettings {
  language: 'es' | 'en';
  currency: string;
  distributionPercent: number;
  userName: string;
}

// --- Translations ---

const translations = {
  es: {
    calc: 'Calculadora',
    inventory: 'Inventario',
    balance: 'Balance',
    settings: 'Ajustes',
    purchasePrice: 'Precio de Compra',
    salePrice: 'Precio de Venta',
    initialStock: 'Existencia Inicial',
    minStock: 'Stock Mínimo',
    minStockDesc: 'Aviso de stock bajo',
    unitAnalysis: 'Análisis Unitario',
    addToInventory: 'Añadir al Inventario',
    profitPerUnit: 'Ganancia/Unidad',
    margin: 'Margen',
    inventoryTitle: 'Existencias y Ventas',
    emptyInventory: 'Inventario vacío',
    finalStock: 'EXISTENCIA FINAL',
    units: 'unidades',
    realProfit: 'Ganancia Real',
    sold: 'vendidas',
    sell: 'Vender',
    restock: 'Reabastecer',
    edit: 'Editar',
    search: 'Buscar producto...',
    filterAll: 'Todos',
    filterLow: 'Bajo Stock',
    businessSummary: 'Resumen de Negocio',
    accumulatedProfit: 'Ganancia Acumulada',
    stockValue: 'Valor en Stock',
    profitByProduct: 'Ganancias por Producto',
    totalSold: 'Total Unidades Vendidas',
    distribution: 'Distribución (X%)',
    distributionDesc: 'Cálculo basado en el {percent}% configurado',
    recentSales: 'Ventas Recientes',
    saveProduct: 'Registrar Producto',
    productName: 'Nombre del Producto',
    category: 'Categoría',
    unitType: 'Unidad (uds, kg, etc)',
    confirmSave: 'Confirmar Registro',
    personalAdjustments: 'Ajustes Personalizados',
    language: 'Idioma',
    currency: 'Moneda',
    userName: 'Tu Nombre',
    distPercent: 'Porcentaje de Distribución',
    distPercentDesc: 'Para impuestos, ahorros o comisiones',
    saveSettings: 'Guardar Ajustes',
    dbActive: 'Gestión de Inventario',
    resetData: 'Borrar Todos los Datos',
    resetConfirm: '¿Estás seguro? Esta acción no se puede deshacer.',
    resetSuccess: 'Datos borrados correctamente',
    exportData: 'Exportar Datos (JSON)',
    importData: 'Importar Datos',
    importSuccess: 'Datos importados con éxito',
    importError: 'Error al importar datos',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    logout: 'Cerrar Sesión',
    noAccount: '¿No tienes cuenta?',
    hasAccount: '¿Ya tienes cuenta?',
    role: 'Rol',
    admin: 'Administrador',
    seller: 'Vendedor',
    manager: 'Gerente',
    editProduct: 'Editar Producto',
    updateProduct: 'Actualizar Producto'
  },
  en: {
    calc: 'Calculator',
    inventory: 'Inventory',
    balance: 'Balance',
    settings: 'Settings',
    purchasePrice: 'Purchase Price',
    salePrice: 'Sale Price',
    initialStock: 'Initial Stock',
    minStock: 'Min Stock',
    minStockDesc: 'Low stock alert',
    unitAnalysis: 'Unit Analysis',
    addToInventory: 'Add to Inventory',
    profitPerUnit: 'Profit/Unit',
    margin: 'Margin',
    inventoryTitle: 'Stock and Sales',
    emptyInventory: 'Empty Inventory',
    finalStock: 'FINAL STOCK',
    units: 'units',
    realProfit: 'Real Profit',
    sold: 'sold',
    sell: 'Sell',
    restock: 'Restock',
    edit: 'Edit',
    search: 'Search product...',
    filterAll: 'All',
    filterLow: 'Low Stock',
    businessSummary: 'Business Summary',
    accumulatedProfit: 'Accumulated Profit',
    stockValue: 'Stock Value',
    profitByProduct: 'Profit by Product',
    totalSold: 'Total Units Sold',
    distribution: 'Distribution (X%)',
    distributionDesc: 'Calculation based on {percent}% set',
    recentSales: 'Recent Sales',
    saveProduct: 'Register Product',
    productName: 'Product Name',
    category: 'Category',
    unitType: 'Unit (pcs, kg, etc)',
    confirmSave: 'Confirm Registration',
    personalAdjustments: 'Personal Adjustments',
    language: 'Language',
    currency: 'Currency',
    userName: 'Your Name',
    distPercent: 'Distribution Percentage',
    distPercentDesc: 'For taxes, savings or commissions',
    saveSettings: 'Save Settings',
    dbActive: 'Inventory Management',
    resetData: 'Reset All Data',
    resetConfirm: 'Are you sure? This action cannot be undone.',
    resetSuccess: 'Data reset successfully',
    exportData: 'Export Data (JSON)',
    importData: 'Import Data',
    importSuccess: 'Data imported successfully',
    importError: 'Error importing data',
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    logout: 'Logout',
    noAccount: 'No account?',
    hasAccount: 'Already have an account?',
    role: 'Role',
    admin: 'Admin',
    seller: 'Seller',
    manager: 'Manager',
    editProduct: 'Edit Product',
    updateProduct: 'Update Product'
  }
};

// --- Utility Components ---

const Card = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <div {...props} className={`bg-white rounded-[28px] p-6 shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

const ResultCard = ({ title, value, icon: Icon, colorClass, subtitle }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex flex-col p-4 rounded-2xl ${colorClass} bg-opacity-10 border border-opacity-20 border-current`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium uppercase tracking-wider opacity-70">{title}</span>
      <Icon size={18} className="opacity-70" />
    </div>
    <div className="text-2xl font-bold truncate">
      {value}
    </div>
    {subtitle && <div className="text-[10px] mt-1 opacity-60 font-medium">{subtitle}</div>}
  </motion.div>
);

const InputField = ({ label, value, onChange, icon: Icon, placeholder, type = "number", helper }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-medium text-slate-600 ml-1 flex items-center gap-2">
      <Icon size={14} />
      {label}
    </label>
    <div className="relative group">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3.5 outline-none transition-all duration-200 text-slate-800 font-medium placeholder:text-slate-400 group-hover:bg-slate-100"
      />
    </div>
    {helper && <p className="text-[10px] text-slate-400 ml-1">{helper}</p>}
  </div>
);

// --- Main Application ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [activeTab, setActiveTab] = useState<'calc' | 'inventory' | 'stats' | 'settings'>('calc');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [initialStock, setInitialStock] = useState<string>('1');
  const [minStock, setMinStock] = useState<string>('2');
  const [productName, setProductName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [unit, setUnit] = useState<string>('uds');
  const [inventory, setInventory] = useState<Product[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low'>('all');
  
  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    language: 'es',
    currency: 'EUR',
    distributionPercent: 20,
    userName: ''
  });

  const t = translations[settings.language];

  // Load data from "database"
  useEffect(() => {
    const savedToken = localStorage.getItem('profit_token');
    const savedUser = localStorage.getItem('profit_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    const savedSettings = localStorage.getItem('profit_settings');
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  useEffect(() => {
    if (token) {
      fetchInventory();
      fetchSales();
    }
  }, [token]);

  const fetchInventory = async () => {
    const res = await fetch('/api/inventory', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setInventory(await res.json());
  };

  const fetchSales = async () => {
    const res = await fetch('/api/sales', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setSalesHistory(await res.json());
  };

  const handleLogin = async () => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('profit_token', data.token);
      localStorage.setItem('profit_user', JSON.stringify(data.user));
    } else {
      alert('Login failed');
    }
  };

  const handleRegister = async () => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    if (res.ok) {
      alert('Registration successful, please login');
      setAuthMode('login');
    } else {
      alert('Registration failed');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('profit_token');
    localStorage.removeItem('profit_user');
  };

  // Save Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('profit_settings', JSON.stringify(updated));
  };

  // Save to "database"
  const saveToInventory = async () => {
    if (!purchasePrice || !salePrice || !initialStock) return;
    
    const p = parseFloat(purchasePrice);
    const s = parseFloat(salePrice);
    const stock = parseInt(initialStock);
    const min = parseInt(minStock);
    const unitProfit = s - p;
    const margin = p > 0 ? (unitProfit / p) * 100 : 0;

    const productData = {
      name: productName || `${t.productName} ${inventory.length + 1}`,
      category: category || 'General',
      purchasePrice: p,
      salePrice: s,
      unitProfit,
      margin,
      initialStock: stock,
      currentStock: editingProduct ? editingProduct.currentStock : stock,
      minStock: min,
      unitsSold: editingProduct ? editingProduct.unitsSold : 0,
      totalProfit: editingProduct ? editingProduct.unitsSold * unitProfit : 0,
      date: editingProduct ? editingProduct.date : new Date().toLocaleDateString(),
      unit: unit || 'uds'
    };

    let res;
    if (editingProduct) {
      res = await fetch(`/api/inventory/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
    } else {
      res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
    }

    if (res.ok) {
      fetchInventory();
      clearFields();
      setShowSaveModal(false);
      setEditingProduct(null);
      if (!editingProduct) setActiveTab('inventory');
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setCategory(product.category);
    setPurchasePrice(product.purchasePrice.toString());
    setSalePrice(product.salePrice.toString());
    setInitialStock(product.initialStock.toString());
    setMinStock(product.minStock.toString());
    setUnit(product.unit);
    setShowSaveModal(true);
  };

  const recordSale = async (id: string) => {
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId: id })
    });

    if (res.ok) {
      fetchInventory();
      fetchSales();
    }
  };

  const restockProduct = async (id: string, amount: number) => {
    const product = inventory.find(p => p.id === id);
    if (!product) return;

    const res = await fetch(`/api/inventory/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        currentStock: product.currentStock + amount,
        initialStock: product.initialStock + amount
      })
    });

    if (res.ok) fetchInventory();
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm(settings.language === 'es' ? '¿Borrar producto?' : 'Delete product?')) return;
    const res = await fetch(`/api/inventory/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchInventory();
  };

  const exportData = () => {
    const data = { inventory, salesHistory, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profitmaster_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.inventory) setInventory(data.inventory);
        if (data.salesHistory) setSalesHistory(data.salesHistory);
        if (data.settings) setSettings(data.settings);
        alert(t.importSuccess);
      } catch (err) {
        alert(t.importError);
      }
    };
    reader.readAsText(file);
  };

  // Formatter for currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(settings.language === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: settings.currency,
    }).format(val);
  };

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || item.currentStock <= item.minStock;
      return matchesSearch && matchesFilter;
    });
  }, [inventory, searchQuery, filter]);

  // Calculations for current view
  const currentResults = useMemo(() => {
    const p = parseFloat(purchasePrice) || 0;
    const s = parseFloat(salePrice) || 0;
    const profit = s - p;
    const marginPercent = p > 0 ? (profit / p) * 100 : 0;

    return { profit, marginPercent, isValid: p > 0 && s > 0 };
  }, [purchasePrice, salePrice]);

  // Stats Calculations
  const stats = useMemo(() => {
    const totalEarned = inventory.reduce((acc, curr) => acc + curr.totalProfit, 0);
    const totalUnitsSold = inventory.reduce((acc, curr) => acc + curr.unitsSold, 0);
    const totalStockValue = inventory.reduce((acc, curr) => acc + (curr.currentStock * curr.purchasePrice), 0);
    const distributionValue = (totalEarned * settings.distributionPercent) / 100;
    
    const chartData = inventory.slice(0, 7).map(item => ({
      name: item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name,
      profit: item.totalProfit,
    })).reverse();

    return { totalEarned, totalUnitsSold, totalStockValue, distributionValue, chartData };
  }, [inventory, settings.distributionPercent]);

  const clearFields = () => {
    setPurchasePrice('');
    setSalePrice('');
    setInitialStock('1');
    setMinStock('2');
    setProductName('');
    setCategory('');
    setUnit('uds');
    setEditingProduct(null);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] text-slate-900 font-sans flex justify-center items-center p-4">
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="bg-indigo-600 p-4 rounded-[32px] shadow-xl shadow-indigo-200">
              <Layers className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">ProfitMaster</h1>
            <p className="text-slate-500 font-medium">{authMode === 'login' ? t.login : t.register}</p>
          </div>

          <Card className="flex flex-col gap-5">
            {authMode === 'register' && (
              <InputField label={t.userName} value={name} onChange={setName} icon={User} placeholder="Nombre" type="text" />
            )}
            <InputField label={t.email} value={email} onChange={setEmail} icon={Globe} placeholder="email@example.com" type="email" />
            <InputField label={t.password} value={password} onChange={setPassword} icon={Lock} placeholder="••••••••" type="password" />
            
            <button 
              onClick={authMode === 'login' ? handleLogin : handleRegister}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 mt-2"
            >
              {authMode === 'login' ? t.login : t.register}
            </button>
          </Card>

          <button 
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            className="text-indigo-600 font-bold text-sm hover:underline"
          >
            {authMode === 'login' ? t.noAccount : t.hasAccount}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-slate-900 font-sans pb-24 flex justify-center items-start">
      <div className="w-full max-w-md flex flex-col gap-6 p-4 md:p-8">
        
        {/* Header */}
        <header className="flex items-center justify-between px-2 pt-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
              <Layers className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {user ? `Hola, ${user.name}` : 'ProfitMaster'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {user ? `${t.role}: ${t[user.role]}` : t.dbActive}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'calc' && (
              <button onClick={clearFields} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={handleLogout} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'calc' && (
            <motion.div key="calc" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-6">
              <Card className="flex flex-col gap-5">
                <InputField label={t.purchasePrice} value={purchasePrice} onChange={setPurchasePrice} icon={ShoppingBag} placeholder="0.00" />
                <InputField label={t.salePrice} value={salePrice} onChange={setSalePrice} icon={DollarSign} placeholder="0.00" />
                <div className="h-px bg-slate-100 my-1" />
                <InputField label={t.initialStock} value={initialStock} onChange={setInitialStock} icon={Package} placeholder="Cantidad" />
              </Card>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.unitAnalysis}</h2>
                  {currentResults.isValid && (
                    <button onClick={() => setShowSaveModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                      <Plus size={16} />
                      {t.addToInventory}
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <ResultCard title={t.profitPerUnit} value={formatCurrency(currentResults.profit)} icon={TrendingUp} colorClass={currentResults.profit >= 0 ? "text-emerald-600 bg-emerald-600" : "text-rose-600 bg-rose-600"} />
                  <ResultCard title={t.margin} value={`${currentResults.marginPercent.toFixed(1)}%`} icon={ArrowRightLeft} colorClass="text-indigo-600 bg-indigo-600" />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div key="inventory" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 px-2">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t.inventoryTitle}</h2>
                
                {/* Search and Filters */}
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder={t.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 pl-10 outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                    />
                    <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setFilter('all')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                    >
                      {t.filterAll}
                    </button>
                    <button 
                      onClick={() => setFilter('low')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${filter === 'low' ? 'bg-rose-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
                    >
                      {t.filterLow}
                    </button>
                  </div>
                </div>
              </div>

              {filteredInventory.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Package size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">{t.emptyInventory}</p>
                </Card>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredInventory.map((item) => (
                    <Card key={item.id} className="!p-5 flex flex-col gap-4 group relative overflow-hidden">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-slate-800">{item.name}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">{item.category}</span>
                          </div>
                          <span className="text-xs text-slate-400 font-medium">{t.purchasePrice}: {formatCurrency(item.purchasePrice)} • {t.salePrice}: {formatCurrency(item.salePrice)}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => startEditProduct(item)} className="p-2 text-slate-300 hover:text-indigo-500 transition-all">
                            <SettingsIcon size={18} />
                          </button>
                          <button onClick={() => deleteProduct(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-500">{t.finalStock}</span>
                          <span className={item.currentStock <= item.minStock ? 'text-rose-500' : 'text-indigo-600'}>
                            {item.currentStock} / {item.initialStock} {item.unit}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (item.currentStock / item.initialStock) * 100)}%` }}
                            className={`h-full ${item.currentStock <= item.minStock ? 'bg-rose-500' : 'bg-indigo-600'}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{t.realProfit}</span>
                          <span className="text-lg font-black text-emerald-600">{formatCurrency(item.totalProfit)}</span>
                          <span className="text-[10px] text-slate-400">{item.unitsSold} {t.sold}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const amount = window.prompt(t.restock, '10');
                              if (amount) restockProduct(item.id, parseInt(amount));
                            }}
                            className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
                            title={t.restock}
                          >
                            <Package size={18} />
                          </button>
                          <button 
                            onClick={() => recordSale(item.id)}
                            disabled={item.currentStock === 0}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all active:scale-95 ${
                              item.currentStock > 0 
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Plus size={18} />
                            {t.sell}
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">{t.businessSummary}</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="!p-4 bg-emerald-50 border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{t.accumulatedProfit}</span>
                  <div className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(stats.totalEarned)}</div>
                </Card>
                <Card className="!p-4 bg-indigo-50 border-indigo-100">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{t.stockValue}</span>
                  <div className="text-xl font-bold text-indigo-700 mt-1">{formatCurrency(stats.totalStockValue)}</div>
                </Card>
              </div>

              {/* Distribution Calculation Card */}
              <Card className="bg-slate-900 !border-none !shadow-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-xl">
                      <PieChartIcon className="text-white" size={20} />
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">{t.distribution}</span>
                  </div>
                  <span className="bg-indigo-500 text-white text-[10px] font-black px-2 py-1 rounded-md">
                    {settings.distributionPercent}%
                  </span>
                </div>
                <div className="text-3xl font-black text-white mb-1">
                  {formatCurrency(stats.distributionValue)}
                </div>
                <p className="text-xs text-white/60 font-medium">
                  {t.distributionDesc.replace('{percent}', settings.distributionPercent.toString())}
                </p>
              </Card>

              <Card className="!p-4 h-64">
                <span className="text-xs font-bold text-slate-400 uppercase mb-4 block">{t.profitByProduct}</span>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis hide />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}} />
                    <Bar dataKey="profit" radius={[6, 6, 0, 0]} fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase">{t.totalSold}</span>
                  <p className="text-2xl font-black text-slate-800 mt-1">{stats.totalUnitsSold}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <ShoppingCart className="text-slate-400" size={32} />
                </div>
              </Card>

              {/* Recent Sales History */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">{t.recentSales}</h3>
                {salesHistory.length === 0 ? (
                  <Card className="text-center py-8 text-slate-400 text-sm italic">No hay ventas registradas</Card>
                ) : (
                  <div className="flex flex-col gap-2">
                    {salesHistory.slice(0, 10).map(sale => (
                      <div key={sale.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm">{sale.productName}</span>
                          <span className="text-[10px] text-slate-400">{new Date(sale.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-600 font-bold text-sm">+{formatCurrency(sale.profit)}</div>
                          <div className="text-[10px] text-slate-400">{formatCurrency(sale.totalSale)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">{t.personalAdjustments}</h2>
              
              <Card className="flex flex-col gap-6">
                <InputField 
                  label={t.userName} 
                  value={settings.userName} 
                  onChange={(val: string) => updateSettings({ userName: val })} 
                  icon={User} 
                  placeholder="Ej: Juan" 
                  type="text" 
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-600 ml-1 flex items-center gap-2">
                    <Globe size={14} />
                    {t.language}
                  </label>
                  <div className="flex gap-2">
                    {['es', 'en'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => updateSettings({ language: lang as 'es' | 'en' })}
                        className={`flex-1 py-3 rounded-2xl font-bold transition-all ${
                          settings.language === lang 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                          : 'bg-slate-50 text-slate-400'
                        }`}
                      >
                        {lang === 'es' ? 'Español' : 'English'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-600 ml-1 flex items-center gap-2">
                    <Coins size={14} />
                    {t.currency}
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSettings({ currency: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-4 py-3.5 outline-none transition-all duration-200 text-slate-800 font-bold"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="MXN">MXN ($)</option>
                    <option value="COP">COP ($)</option>
                    <option value="ARS">ARS ($)</option>
                  </select>
                </div>

                <InputField 
                  label={t.distPercent} 
                  value={settings.distributionPercent.toString()} 
                  onChange={(val: string) => updateSettings({ distributionPercent: parseFloat(val) || 0 })} 
                  icon={Percent} 
                  placeholder="20" 
                  helper={t.distPercentDesc}
                />
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={exportData}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-indigo-600 bg-indigo-50 border-2 border-indigo-100 hover:bg-indigo-100 transition-all"
                >
                  <Package size={18} />
                  {t.exportData}
                </button>
                <label className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-slate-600 bg-slate-50 border-2 border-slate-100 hover:bg-slate-100 transition-all cursor-pointer">
                  <ArrowRightLeft size={18} />
                  {t.importData}
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>

              <button 
                onClick={() => {
                  if (window.confirm(t.resetConfirm)) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-rose-600 bg-rose-50 border-2 border-rose-100 hover:bg-rose-100 transition-all"
              >
                <Trash2 size={18} />
                {t.resetData}
              </button>

              <div className="bg-indigo-50 p-6 rounded-[28px] border border-indigo-100">
                <h4 className="font-bold text-indigo-700 mb-2">ProfitMaster Pro Tips</h4>
                <p className="text-xs text-indigo-600 leading-relaxed">
                  Usa el porcentaje de distribución para separar automáticamente tus impuestos o el dinero que quieres reinvertir en el negocio.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[32px] p-2 flex items-center justify-around shadow-2xl shadow-indigo-100 z-50">
          <NavButton active={activeTab === 'calc'} onClick={() => setActiveTab('calc')} icon={Calculator} label={t.calc} />
          <NavButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={Package} label={t.inventory} />
          <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={BarChart3} label={t.balance} />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={SettingsIcon} label={t.settings} />
        </nav>

        {/* Save Modal */}
        <AnimatePresence>
          {showSaveModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSaveModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-800">{editingProduct ? t.editProduct : t.saveProduct}</h3>
                  <button onClick={() => { setShowSaveModal(false); setEditingProduct(null); }} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="flex flex-col gap-4">
                  <InputField label={t.productName} value={productName} onChange={setProductName} icon={ShoppingBag} placeholder="Ej: Zapatos Cuero" type="text" />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label={t.purchasePrice} value={purchasePrice} onChange={setPurchasePrice} icon={ShoppingBag} placeholder="0.00" />
                    <InputField label={t.salePrice} value={salePrice} onChange={setSalePrice} icon={DollarSign} placeholder="0.00" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label={t.category} value={category} onChange={setCategory} icon={Layers} placeholder="General" type="text" />
                    <InputField label={t.unitType} value={unit} onChange={setUnit} icon={Package} placeholder="uds" type="text" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label={t.initialStock} value={initialStock} onChange={setInitialStock} icon={Package} placeholder="Cantidad" />
                    <InputField label={t.minStock} value={minStock} onChange={setMinStock} icon={Info} placeholder="2" helper={t.minStockDesc} />
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-2xl">
                    <p className="text-xs font-bold text-indigo-400 uppercase">Resumen</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-indigo-700">{t.initialStock}:</span>
                      <span className="text-sm font-bold text-indigo-700">{initialStock} {unit}</span>
                    </div>
                  </div>
                </div>
                <button onClick={saveToInventory} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl mt-8 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
                  {editingProduct ? t.updateProduct : t.confirmSave}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 ${active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
    <Icon size={20} className={active ? 'scale-110' : ''} />
    <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);
