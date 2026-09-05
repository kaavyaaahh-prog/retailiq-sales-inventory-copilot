import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sparkles, Bot, Play, ChevronRight, Store, ShieldCheck } from 'lucide-react';
import { STORE_INFO } from '../data/mockData';
import { Product } from '../types';

interface HeaderProps {
  products: Product[];
  unacknowledgedAlertsCount: number;
  onOpenAlerts: () => void;
  onSelectProduct: (product: Product) => void;
  onStartDemoFlow: () => void;
  currentDemoStep?: string | null;
  onToggleCopilotPanel: () => void;
  isCopilotPanelOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  products,
  unacknowledgedAlertsCount,
  onOpenAlerts,
  onSelectProduct,
  onStartDemoFlow,
  currentDemoStep,
  onToggleCopilotPanel,
  isCopilotPanelOpen = false,
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
        .slice(0, 6)
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
      className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-lg shadow-black/20"
    >
      {/* Left: Brand & Store Identification */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white tracking-tight">
                Retail<span className="text-cyan-400">IQ</span>
              </span>
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                PRO COPILOT
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
              {STORE_INFO.branch} · {STORE_INFO.storeId}
            </span>
          </div>
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
            placeholder="Search inventory, products, categories (e.g. Cooking Oil, Rice)..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-800/60 border border-slate-700/60 rounded-xl text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 focus:bg-slate-900 transition-all"
          />
          <kbd className="hidden lg:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
            /
          </kbd>
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Matching Inventory</span>
              <span className="text-cyan-400 font-mono">{searchResults.length} items</span>
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
                className="w-full px-3.5 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between group transition-colors cursor-pointer border-b border-slate-800/40 last:border-0"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {product.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {product.category} · Stock: <strong className="text-slate-200">{product.currentStock}</strong> · Sold: {product.unitsSold}
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    product.currentStock === 0
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                      : product.currentStock <= product.reorderLevel
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  }`}
                >
                  {product.currentStock === 0
                    ? 'Out of Stock'
                    : product.currentStock <= product.reorderLevel
                    ? 'Low Stock'
                    : 'Healthy'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Actions: AI Copilot Toggle, Notifications & Manager Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hackathon Demo Flow Quick Launcher */}
        <button
          id="btn-hackathon-demo-flow"
          onClick={onStartDemoFlow}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-xs"
          title="Play through the interactive Hackathon manager demo workflow"
        >
          <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
          <span>Demo Flow</span>
          {currentDemoStep && (
            <span className="px-1.5 py-0.2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 rounded text-[9px] font-mono">
              Active
            </span>
          )}
        </button>

        {/* AI Copilot Button (Direct Header Trigger requested by user) */}
        <button
          id="btn-header-ai-copilot"
          onClick={onToggleCopilotPanel}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
            isCopilotPanelOpen
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 ring-2 ring-cyan-400/30'
              : 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-cyan-300 border border-cyan-500/40'
          }`}
          title="Toggle AI Copilot Panel"
        >
          <Bot className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span className="hidden sm:inline">AI Copilot</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400"></span>
        </button>

        {/* Notifications Alert Icon */}
        <button
          id="btn-notifications-icon"
          onClick={onOpenAlerts}
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
          aria-label="View store alerts"
        >
          <Bell className="w-4 h-4" />
          {unacknowledgedAlertsCount > 0 && (
            <span
              id="header-alert-count-badge"
              className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm shadow-rose-500/50"
            >
              {unacknowledgedAlertsCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-slate-800"></div>

        {/* Manager Profile Card */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-600 text-cyan-400 text-xs font-extrabold flex items-center justify-center shadow-md">
              {STORE_INFO.manager.avatar}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-tight">
              {STORE_INFO.manager.name}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              {STORE_INFO.manager.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
