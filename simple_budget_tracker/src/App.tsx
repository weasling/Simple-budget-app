import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';

import { analyticsService } from './services/analyticsService';
// --- Constants & Config ---
const BASE_URL = import.meta.env.DEV ? '/api' : 'https://williamtf92xy.lastapp.dev';
const APP_ID = '76efa9de-8130-4316-80d0-7ef758902073';

// --- Types ---
interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const CATEGORIES = [
  { name: 'Food', color: '#10B981' },
  { name: 'Transport', color: '#3B82F6' },
  { name: 'Utilities', color: '#F59E0B' },
  { name: 'Entertainment', color: '#8B5CF6' },
  { name: 'Health', color: '#EF4444' },
  { name: 'Shopping', color: '#EC4899' },
  { name: 'Other', color: '#64748B' },
];

// --- Custom Hooks ---
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// --- Helper Functions ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// --- Components ---

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isSplash = location.pathname === '/';

  if (isSplash) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      {/* Desktop Navigation */}
      <header className="hidden md:block sticky top-0 z-50 glass-panel border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <i className="fa fa-wallet"></i>
            </div>
            <h1 className="font-bold text-xl tracking-tight">Budget Tracker</h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/dashboard" className={`font-medium transition-colors hover:text-cyan-500 dark:hover:text-cyan-400 ${location.pathname === '/dashboard' ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-300'}`}>
              Dashboard
            </Link>
            <Link to="/expenses" className={`font-medium transition-colors hover:text-cyan-500 dark:hover:text-cyan-400 ${location.pathname === '/expenses' ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-300'}`}>
              Expenses
            </Link>
            <Link to="/chart" className={`font-medium transition-colors hover:text-cyan-500 dark:hover:text-cyan-400 ${location.pathname === '/chart' ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-300'}`}>
              Charts
            </Link>
            <Link to="/add" className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              <i className="fa fa-plus mr-2"></i> Add
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-screen-xl mx-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-slate-200 dark:border-slate-800 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16 px-2">
          <Link to="/dashboard" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/dashboard' ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`}>
            <i className="fa fa-home text-xl"></i>
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/expenses" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/expenses' ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`}>
            <i className="fa fa-list text-xl"></i>
            <span className="text-[10px] font-medium">List</span>
          </Link>
          <div className="relative -top-5 flex justify-center w-full">
            <Link to="/add" className="bg-cyan-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/40 border-4 border-slate-50 dark:border-slate-950 transition-transform active:scale-95">
              <i className="fa fa-plus text-xl"></i>
            </Link>
          </div>
          <Link to="/chart" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/chart' ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`}>
            <i className="fa fa-chart-pie text-xl"></i>
            <span className="text-[10px] font-medium">Chart</span>
          </Link>
          <Link to="/add?type=income" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.search.includes('type=income') ? 'text-cyan-500 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'}`}>
            <i className="fa fa-arrow-down text-xl"></i>
            <span className="text-[10px] font-medium">Income</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
      <div className="animate-bounce mb-6 w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-cyan-500/40">
        <i className="fa fa-wallet text-5xl text-white"></i>
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight animate-pulse">
        Simple Budget Tracker
      </h1>
    </div>
  );
};

const Dashboard = ({ income, expenses }: { income: number, expenses: Expense[] }) => {
  const navigate = useNavigate();
  
  const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  const balance = income - totalExpenses;
  const isPositive = balance >= 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h2>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Balance Card */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <i className="fa fa-coins text-6xl text-cyan-500"></i>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Remaining Balance</p>
          <h3 className={`text-4xl font-bold tracking-tight ${isPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
            {formatCurrency(balance)}
          </h3>
        </div>

        {/* Income Card */}
        <div 
          onClick={() => navigate('/add?type=income')}
          className="glass-panel rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <i className="fa fa-arrow-down text-6xl text-emerald-500"></i>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Monthly Income</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(income)}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-500 transition-colors">
              <i className="fa fa-pen text-xs"></i>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="glass-panel rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <i className="fa fa-arrow-up text-6xl text-rose-500"></i>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Expenses</p>
          <h3 className="text-3xl font-bold text-rose-500 dark:text-rose-400 tracking-tight">
            {formatCurrency(totalExpenses)}
          </h3>
        </div>
      </div>

      {/* Quick Actions (Desktop only, mobile has bottom nav) */}
      <div className="hidden md:grid grid-cols-2 gap-4 mt-8">
        <button 
          onClick={() => navigate('/add')}
          className="flex items-center justify-center gap-3 bg-cyan-500 hover:bg-cyan-600 text-white p-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
        >
          <i className="fa fa-plus-circle text-xl"></i>
          Add New Expense
        </button>
        <button 
          onClick={() => navigate('/chart')}
          className="flex items-center justify-center gap-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 p-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
        >
          <i className="fa fa-chart-pie text-xl text-cyan-500"></i>
          View Spending Chart
        </button>
      </div>

      {/* Recent Expenses Preview */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Expenses</h3>
          <button onClick={() => navigate('/expenses')} className="text-sm font-medium text-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400">
            View All <i className="fa fa-chevron-right ml-1 text-xs"></i>
          </button>
        </div>
        
        <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                <i className="fa fa-receipt text-2xl text-slate-400"></i>
              </div>
              <p>No expenses yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {expenses.slice(0, 5).map(exp => {
                const catColor = CATEGORIES.find(c => c.name === exp.category)?.color || '#64748B';
                return (
                  <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: catColor }}>
                        <i className={`fa ${getCategoryIcon(exp.category)}`}></i>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{exp.category}</p>
                        {exp.description && <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px] md:max-w-xs">{exp.description}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(exp.amount)}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Food': return 'fa-utensils';
    case 'Transport': return 'fa-car';
    case 'Utilities': return 'fa-bolt';
    case 'Entertainment': return 'fa-film';
    case 'Health': return 'fa-heartbeat';
    case 'Shopping': return 'fa-shopping-bag';
    default: return 'fa-tag';
  }
};

const AddExpense = ({ 
  income, 
  setIncome, 
  expenses, 
  setExpenses 
}: { 
  income: number, 
  setIncome: (val: number) => void,
  expenses: Expense[],
  setExpenses: (val: Expense[]) => void
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isIncome = searchParams.get('type') === 'income';
  const editId = searchParams.get('edit');
  
  const existingExpense = editId ? expenses.find(e => e.id === editId) : null;

  const [amount, setAmount] = useState(isIncome ? income.toString() : (existingExpense?.amount.toString() || ''));
  const [category, setCategory] = useState(existingExpense?.category || CATEGORIES[0].name);
  const [description, setDescription] = useState(existingExpense?.description || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (isIncome) {
      setIncome(numAmount);
    } else {
      if (existingExpense) {
        setExpenses(expenses.map(e => e.id === editId ? { ...e, amount: numAmount, category, description } : e));
      } else {
        const newExpense: Expense = {
          id: Date.now().toString(),
          amount: numAmount,
          category,
          description,
          date: new Date().toISOString()
        };
        setExpenses([newExpense, ...expenses]);
      }
    }
    navigate(-1);
  };

  return (
    <div className="max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mr-4">
          <i className="fa fa-arrow-left"></i>
        </button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isIncome ? 'Edit Monthly Income' : (existingExpense ? 'Edit Expense' : 'Add New Expense')}
        </h2>
      </div>

      <div className="glass-panel rounded-2xl p-6 shadow-sm">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
            <i className="fa fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Amount</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fa fa-dollar-sign text-slate-400"></i>
              </div>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white text-lg font-medium"
                placeholder="0.00"
              />
            </div>
          </div>

          {!isIncome && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa fa-list text-slate-400"></i>
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white appearance-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <i className="fa fa-chevron-down text-slate-400 text-sm"></i>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 pt-3.5 pointer-events-none">
                <i className="fa fa-comment text-slate-400"></i>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white resize-none"
                placeholder="What was this for?"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
            >
              <i className="fa fa-times mr-2"></i> Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3.5 px-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <i className="fa fa-check mr-2"></i> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExpensesList = ({ expenses, setExpenses }: { expenses: Expense[], setExpenses: (val: Expense[]) => void }) => {
  const navigate = useNavigate();
  const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => navigate('/dashboard')} className="md:hidden w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 mr-3">
            <i className="fa fa-arrow-left"></i>
          </button>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">All Expenses</h2>
        </div>
        <button onClick={() => navigate('/add')} className="hidden md:flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <i className="fa fa-plus"></i> Add New
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-6 shadow-sm mb-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Expenses</p>
        <h3 className="text-3xl font-bold text-rose-500 dark:text-rose-400 tracking-tight">
          {formatCurrency(totalExpenses)}
        </h3>
      </div>

      {expenses.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <i className="fa fa-box-open text-3xl text-slate-400"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No expenses found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">You haven't added any expenses yet.</p>
          <button onClick={() => navigate('/add')} className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md">
            Add Your First Expense
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenses.map(exp => {
            const catColor = CATEGORIES.find(c => c.name === exp.category)?.color || '#64748B';
            return (
              <div key={exp.id} className="glass-panel rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: catColor }}>
                      <i className={`fa ${getCategoryIcon(exp.category)} text-lg`}></i>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-lg">{exp.category}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xl">{formatCurrency(exp.amount)}</h4>
                </div>
                
                {exp.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                    {exp.description}
                  </p>
                )}
                
                <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/50">
                  <button 
                    onClick={() => navigate(`/add?edit=${exp.id}`)}
                    className="flex-1 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fa fa-edit"></i> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(exp.id)}
                    className="flex-1 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fa fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SpendingChart = ({ expenses }: { expenses: Expense[] }) => {
  const navigate = useNavigate();
  
  const { categoryTotals, total, chartData } = useMemo(() => {
    const totals: Record<string, number> = {};
    let sum = 0;
    
    expenses.forEach(exp => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
      sum += exp.amount;
    });

    const data = CATEGORIES.map(cat => ({
      ...cat,
      amount: totals[cat.name] || 0,
      percentage: sum > 0 ? ((totals[cat.name] || 0) / sum) * 100 : 0
    })).filter(d => d.amount > 0).sort((a, b) => b.amount - a.amount);

    return { categoryTotals: totals, total: sum, chartData: data };
  }, [expenses]);

  // Generate conic gradient string for CSS pie chart
  const conicGradient = useMemo(() => {
    if (total === 0) return 'conic-gradient(#e2e8f0 0% 100%)';
    
    let currentPercent = 0;
    const stops = chartData.map(item => {
      const start = currentPercent;
      currentPercent += item.percentage;
      return `${item.color} ${start}% ${currentPercent}%`;
    });
    
    return `conic-gradient(${stops.join(', ')})`;
  }, [chartData, total]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/dashboard')} className="md:hidden w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 mr-3">
          <i className="fa fa-arrow-left"></i>
        </button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Spending by Category</h2>
      </div>

      {total === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <i className="fa fa-chart-pie text-3xl text-slate-400"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No data to display</h3>
          <p className="text-slate-500 dark:text-slate-400">Add some expenses to see your spending breakdown.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Area */}
          <div className="glass-panel rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full shadow-inner border-4 border-white dark:border-slate-800 transition-transform hover:scale-105 duration-500" style={{ background: conicGradient }}>
              {/* Inner circle for donut effect */}
              <div className="absolute inset-0 m-auto w-3/5 h-3/5 bg-white dark:bg-slate-900 rounded-full shadow-sm flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total</p>
                <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          {/* Legend Area */}
          <div className="glass-panel rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">Category Breakdown</h3>
            <div className="space-y-4">
              {chartData.map(item => (
                <div key={item.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(item.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  // Analytics initialization (runs once)
  useEffect(() => {
    try {
      analyticsService.initialize();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }, []);

  const [income, setIncome] = useLocalStorage('budget_income', 0);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('budget_expenses', []);
  const [userId, setUserId] = useLocalStorage<string | null>('budget_user_id', null);

  // Initialize anonymous user via API as requested
  useEffect(() => {
    const initUser = async () => {
      if (!userId) {
        try {
          const response = await fetch(`${BASE_URL}/data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              app_id: APP_ID,
              table_name: 'users',
              data: { provider: 'anonymous' }
            })
          });
          if (response.ok) {
            const data = await response.json();
            if (data.id) {
              setUserId(data.id);
            }
          }
        } catch (error) {
          console.error('Failed to initialize anonymous user:', error);
        }
      }
    };
    initUser();
  }, [userId, setUserId]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/dashboard" element={<Dashboard income={income} expenses={expenses} />} />
        <Route path="/add" element={<AddExpense income={income} setIncome={setIncome} expenses={expenses} setExpenses={setExpenses} />} />
        <Route path="/expenses" element={<ExpensesList expenses={expenses} setExpenses={setExpenses} />} />
        <Route path="/chart" element={<SpendingChart expenses={expenses} />} />
        <Route path="*" element={<Dashboard income={income} expenses={expenses} />} />
      </Routes>
    </Layout>
  );
}