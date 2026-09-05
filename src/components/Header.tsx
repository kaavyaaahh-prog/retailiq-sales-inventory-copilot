import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Store, ChevronDown, CheckCircle2, AlertTriangle, Sparkles, Play } from 'lucide-react';
import { STORE_INFO } from '../data/mockData';
import { Product } from '../types';

interface HeaderProps {
  products: Product[];
  unacknowledgedAlertsCount: number;
  onOpenAlerts: () => void;
  onSelectProduct: (product: Product) => void;
  onStartDemoFlow: () => void;
  currentDemoStep?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  products,
  unacknowledgedAlertsCount,
  onOpenAlerts,
  onSelectProduct,
  onStartDemoFlow,
  currentDemoStep,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter products for quick search
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="main-header"
      className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-30"
    >
      {/* Left: Store Identification */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              {STORE_INFO.name}
            </span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {STORE_INFO.branch}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Daily Operations Dashboard & Copilot
          </span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search products, categories (e.g. Cooking Oil, Rice)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-3 py-1 text-[11px] font-semibold uppercase text-slate-400">
              Products Found
            </div>
            {searchResults.map((product) => (
              <button
                key={product.id}
                id={`search-result-${product.id}`}
                onClick={() => {
                  onSelectProduct(product);
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center justify-between group transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-700">
                    {product.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {product.category} · Stock: {product.currentStock} units · Sold: {product.unitsSold}
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    product.currentStock <= product.reorderLevel
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {product.currentStock <= product.reorderLevel ? 'Low Stock' : 'In Stock'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Actions: Demo Guide, Notification & Manager Profile */}
      <div className="flex items-center gap-3">
        {/* Hackathon Demo Flow Quick Launcher */}
        <button
          id="btn-hackathon-demo-flow"
          onClick={onStartDemoFlow}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
          title="Play through the 8-step Hackathon manager demo workflow"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Demo Flow</span>
          {currentDemoStep && (
            <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded text-[10px]">
              Step Active
            </span>
          )}
        </button>

        {/* Notifications Alert Icon */}
        <button
          id="btn-notifications-icon"
          onClick={onOpenAlerts}
          className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="View store alerts"
        >
          <Bell className="w-5 h-5" />
          {unacknowledgedAlertsCount > 0 && (
            <span
              id="header-alert-count-badge"
              className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse"
            >
              {unacknowledgedAlertsCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* Manager Profile Card */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white text-xs font-bold flex items-center justify-center shadow-sm">
            {STORE_INFO.manager.avatar}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {STORE_INFO.manager.name}
            </span>
            <span className="text-[11px] text-slate-500 leading-tight">
              {STORE_INFO.manager.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
