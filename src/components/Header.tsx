import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  Bot,
  Play,
  LogOut,
  X,
  Layers,
  Package,
  AlertTriangle,
  CheckCircle2,
  ShoppingCart,
  ArrowRight,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { STORE_INFO } from '../data/mockData';
import { Product, ActiveSection, UserProfile, StoreLocationProfile } from '../types';
import { calculateStockStatus, formatCurrency } from '../utils/analysis';

interface HeaderProps {
  products: Product[];
  userProfile?: UserProfile;
  storeProfile?: StoreLocationProfile;
  unacknowledgedAlertsCount: number;
  onOpenAlerts: () => void;
  onSelectProduct: (product: Product) => void;
  onStartDemoFlow: () => void;
  currentDemoStep?: string | null;
  onToggleCopilotPanel: () => void;
  isCopilotPanelOpen?: boolean;
  onLogout?: () => void;
  onNavigateToSection?: (section: ActiveSection) => void;
  onRequestRestock?: (product: Product, suggestedQty?: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  products,
  userProfile,
  storeProfile,
  unacknowledgedAlertsCount,
  onOpenAlerts,
  onSelectProduct,
  onStartDemoFlow,
  currentDemoStep,
  onToggleCopilotPanel,
  isCopilotPanelOpen = false,
  onLogout,
  onNavigateToSection,
  onRequestRestock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Extract distinct categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return cats;
  }, [products]);

  // Filter products for quick search
  const { matchedProducts, matchedCategories } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return { matchedProducts: [], matchedCategories: [] };
    }

    const mCats = categories.filter((cat) => cat.toLowerCase().includes(q));

    const mProds = products.filter((p) => {
      const status = calculateStockStatus(p);
      const isLowStock = status === 'low' || status === 'critical' || status === 'out_of_stock';

      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchSupplier = p.supplier.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      const matchPrice = p.price.toString().includes(q);
      const matchStockKeyword =
        (q === 'low' && isLowStock) ||
        (q === 'critical' && status === 'critical') ||
        (q === 'alert' && isLowStock) ||
        (q === 'healthy' && status === 'normal') ||
        (q === 'out' && status === 'out_of_stock');

      return matchName || matchCat || matchSupplier || matchId || matchPrice || matchStockKeyword;
    });

    return { matchedProducts: mProds, matchedCategories: mCats };
  }, [products, categories, searchQuery]);

  // Suggested quick picks (e.g. low stock products that need attention)
  const prioritySuggestions = useMemo(() => {
    return products
      .filter((p) => p.currentStock <= p.reorderLevel)
      .slice(0, 3);
  }, [products]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setIsMobileSearchActive(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut: pressing '/' or 'Cmd+K' / 'Ctrl+K' focuses search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        setIsSearchOpen(true);
        setIsMobileSearchActive(true);
        setTimeout(() => {
          inputRef.current?.focus();
          mobileInputRef.current?.focus();
        }, 50);
      }

      // Escape closes dropdown
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileSearchActive(false);
        inputRef.current?.blur();
        mobileInputRef.current?.blur();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle keyboard navigation inside search results
  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (!isSearchOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const maxLen = searchQuery.trim() ? matchedProducts.length : prioritySuggestions.length;
      if (maxLen > 0) {
        setSelectedIndex((prev) => (prev + 1 >= maxLen ? 0 : prev + 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const maxLen = searchQuery.trim() ? matchedProducts.length : prioritySuggestions.length;
      if (maxLen > 0) {
        setSelectedIndex((prev) => (prev - 1 < 0 ? maxLen - 1 : prev - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const list = searchQuery.trim() ? matchedProducts : prioritySuggestions;
      if (selectedIndex >= 0 && selectedIndex < list.length) {
        handleSelectProduct(list[selectedIndex]);
      } else if (list.length > 0) {
        handleSelectProduct(list[0]);
      }
    }
  };

  const handleSelectProduct = (product: Product) => {
    onSelectProduct(product);
    setIsSearchOpen(false);
    setIsMobileSearchActive(false);
    setSearchQuery('');
    setSelectedIndex(-1);
  };

  const handleCategoryFilterClick = (cat: string) => {
    setSearchQuery(cat);
    setIsSearchOpen(true);
    inputRef.current?.focus();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <header
      id="main-header"
      className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30 shadow-lg shadow-black/20"
    >
      {/* Left: Brand & Store Identification */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm font-extrabold text-white tracking-tight">
                Retail<span className="text-cyan-400">IQ</span>
              </span>
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                PRO COPILOT
              </span>
            </div>
            <span id="header-store-location-badge" className="text-[11px] text-slate-400 hidden lg:inline truncate">
              {storeProfile ? `${storeProfile.branchName} · ${storeProfile.storeId}` : `${STORE_INFO.branch} · ${STORE_INFO.storeId}`}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search Bar (Interactive, Clickable, Real-time filtering) */}
      <div ref={searchRef} className="relative flex-1 max-w-lg mx-1 sm:mx-2">
        {/* Desktop / Standard View Search Input */}
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
              setSelectedIndex(-1);
            }}
            onClick={() => setIsSearchOpen(true)}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleKeyDownInInput}
            placeholder="Search products, categories, stock alerts (e.g. Cooking Oil, Dairy)..."
            className="w-full pl-9 pr-16 py-1.5 sm:py-2 text-xs bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 focus:bg-slate-950 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all cursor-text font-medium"
          />

          {/* Right controls inside input: Clear (X) or '/' key hint */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery ? (
              <button
                type="button"
                id="btn-clear-search"
                onClick={handleClearSearch}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Search Results / Quick Suggestions Dropdown */}
        {isSearchOpen && (
          <div
            id="search-dropdown-menu"
            className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 backdrop-blur-2xl border border-slate-700/90 rounded-2xl shadow-2xl py-3 z-50 overflow-hidden animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto"
          >
            {/* If Query is empty: Show Quick Department Filters & Urgent Stock Items */}
            {!searchQuery.trim() ? (
              <div className="space-y-3 px-2">
                {/* Department Categories Quick Chips */}
                <div>
                  <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-cyan-400" />
                    <span>Filter by Category</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryFilterClick(cat)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-800/60 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>{cat}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ({products.filter((p) => p.category === cat).length})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority / Low Stock Suggestions */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Low Stock Alert Items</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Click to inspect</span>
                  </div>
                  <div className="space-y-1">
                    {prioritySuggestions.map((product, idx) => (
                      <div
                        key={product.id}
                        id={`search-suggest-${product.id}`}
                        onClick={() => handleSelectProduct(product)}
                        className={`px-3 py-2 rounded-xl text-left hover:bg-slate-900 flex items-center justify-between group transition-colors cursor-pointer border border-transparent hover:border-slate-800 ${
                          selectedIndex === idx ? 'bg-slate-900 border-cyan-500/40' : ''
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2 truncate">
                            <span>{product.name}</span>
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                              {product.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{product.category}</span>
                            <span>•</span>
                            <span className="text-amber-400 font-mono font-bold">
                              {product.currentStock} left
                            </span>
                            <span className="text-slate-500">({product.reorderLevel} min)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-extrabold text-cyan-300">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800/60">
                            Restock
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-3 pt-1 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Type any product name, category, or status</span>
                  <span className="font-mono">Esc to close</span>
                </div>
              </div>
            ) : matchedProducts.length > 0 || matchedCategories.length > 0 ? (
              /* If Query has results */
              <div className="space-y-2">
                {/* Matching Category Header Pills if any match query */}
                {matchedCategories.length > 0 && (
                  <div className="px-3 pb-2 border-b border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Matched Categories
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchedCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            if (onNavigateToSection) {
                              onNavigateToSection('products');
                            }
                            handleCategoryFilterClick(cat);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/70 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Layers className="w-3 h-3 text-cyan-400" />
                          <span>View {cat} Products</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching Products List */}
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3 h-3 text-cyan-400" />
                    <span>Matching Inventory Items</span>
                  </span>
                  <span className="text-cyan-400 font-mono">{matchedProducts.length} items found</span>
                </div>

                <div className="divide-y divide-slate-800/60 max-h-[55vh] overflow-y-auto">
                  {matchedProducts.map((product, idx) => {
                    const status = calculateStockStatus(product);
                    const isCritical = status === 'critical' || status === 'out_of_stock';
                    const isLow = status === 'low';
                    const isSelected = selectedIndex === idx;

                    return (
                      <div
                        key={product.id}
                        id={`search-result-${product.id}`}
                        className={`w-full px-3.5 py-2.5 text-left hover:bg-slate-900/90 flex items-center justify-between group transition-colors cursor-pointer ${
                          isSelected ? 'bg-slate-900 ring-1 ring-cyan-400/40' : ''
                        }`}
                        onClick={() => handleSelectProduct(product)}
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                              {product.name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 shrink-0">
                              {product.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 truncate">
                            <span className="text-slate-300 font-medium">{product.category}</span>
                            <span>•</span>
                            <span>
                              Stock:{' '}
                              <strong
                                className={
                                  isCritical
                                    ? 'text-rose-400 font-mono'
                                    : isLow
                                    ? 'text-amber-400 font-mono'
                                    : 'text-slate-200 font-mono'
                                }
                              >
                                {product.currentStock}
                              </strong>{' '}
                              / {product.reorderLevel} min
                            </span>
                            <span>•</span>
                            <span className="text-slate-500">Supplier: {product.supplier}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-mono font-extrabold text-cyan-300">
                              {formatCurrency(product.price)}
                            </div>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block mt-0.5 ${
                                isCritical
                                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                                  : isLow
                                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                              }`}
                            >
                              {isCritical
                                ? 'Critical Stock'
                                : isLow
                                ? 'Low Stock'
                                : 'Healthy Stock'}
                            </span>
                          </div>

                          {/* Quick Restock Action Button */}
                          {onRequestRestock && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsSearchOpen(false);
                                onRequestRestock(
                                  product,
                                  Math.max(product.reorderLevel * 2 - product.currentStock, 20)
                                );
                              }}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 hover:border-cyan-500 shadow-sm"
                              title="Create Restock Request"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* If No Results */
              <div className="p-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">No items found</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    No products or categories matched &quot;<span className="text-cyan-300">{searchQuery}</span>&quot;
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  >
                    Clear Search
                  </button>
                  {onNavigateToSection && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        onNavigateToSection('products');
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
                    >
                      Browse All Products
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions: AI Copilot Toggle, Notifications & Manager Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Hackathon Demo Flow Quick Launcher */}
        <button
          id="btn-hackathon-demo-flow"
          onClick={onStartDemoFlow}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-xs"
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

        {/* AI Copilot Button */}
        <button
          id="btn-header-ai-copilot"
          onClick={onToggleCopilotPanel}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
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

        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

        {/* Manager Profile Card */}
        <div
          id="header-user-profile-badge"
          className="flex items-center gap-2 pl-1 cursor-default group"
          title={`${userProfile?.name || STORE_INFO.manager.name} • ${userProfile?.email || 'Store Node Session'}`}
        >
          <div className="relative">
            <div
              id="header-user-avatar"
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600/30 via-slate-800 to-blue-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-extrabold flex items-center justify-center shadow-md shadow-cyan-950/40 tracking-wider"
            >
              {userProfile?.initials || STORE_INFO.manager.avatar}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span id="header-user-name" className="text-xs font-bold text-white leading-tight">
              {userProfile?.name || STORE_INFO.manager.name}
            </span>
            <span id="header-user-role" className="text-[10px] text-slate-400 leading-tight">
              {userProfile?.role || STORE_INFO.manager.role}
            </span>
          </div>
        </div>

        {/* Logout Action */}
        {onLogout && (
          <button
            id="btn-header-logout"
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-700 ml-0.5 sm:ml-1"
            title="Sign out of store session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
