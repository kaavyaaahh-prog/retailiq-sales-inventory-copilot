import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  ShoppingCart,
  ShieldAlert,
  Gauge,
  SlidersHorizontal,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Product, PriorityLevel } from '../types';
import { calculateStockStatus, calculatePriority, formatCurrency } from '../utils/analysis';

interface InventoryProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onRequestRestock: (product: Product, suggestedQty?: number) => void;
  onOpenAddProduct?: () => void;
}

type SortField = 'stock' | 'reorderLevel' | 'thresholdGap' | 'priority' | 'name';
type SortOrder = 'asc' | 'desc';

export const Inventory: React.FC<InventoryProps> = ({
  products,
  onSelectProduct,
  onRequestRestock,
  onOpenAddProduct,
}) => {
  const [search, setSearch] = useState('');
  const [selectedAlertFilter, setSelectedAlertFilter] = useState<'all' | 'alerts_only' | 'critical' | 'low' | 'healthy'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('thresholdGap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc'); // asc shows lowest stock / highest deficit first

  const categories: string[] = ['All', 'Grocery', 'Dairy', 'Snacks', 'Personal Care', 'Beverages', 'Household'];

  // Categorize alert counts
  const criticalItems = products.filter(
    (p) => p.currentStock === 0 || p.currentStock <= p.reorderLevel * 0.4
  );
  const lowStockItems = products.filter(
    (p) => p.currentStock > p.reorderLevel * 0.4 && p.currentStock <= p.reorderLevel
  );
  const totalAlertItems = criticalItems.length + lowStockItems.length;
  const healthyItems = products.filter((p) => p.currentStock > p.reorderLevel);
  const totalUnitsOnShelf = products.reduce((acc, curr) => acc + curr.currentStock, 0);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.category.toLowerCase().includes(search.toLowerCase()) ||
          product.supplier.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

        const isCritical = product.currentStock === 0 || product.currentStock <= product.reorderLevel * 0.4;
        const isLow = !isCritical && product.currentStock <= product.reorderLevel;

        let matchesAlert = true;
        if (selectedAlertFilter === 'alerts_only') {
          matchesAlert = isCritical || isLow;
        } else if (selectedAlertFilter === 'critical') {
          matchesAlert = isCritical;
        } else if (selectedAlertFilter === 'low') {
          matchesAlert = isLow;
        } else if (selectedAlertFilter === 'healthy') {
          matchesAlert = !isCritical && !isLow;
        }

        return matchesSearch && matchesCategory && matchesAlert;
      })
      .sort((a, b) => {
        let comp = 0;
        const gapA = a.currentStock - a.reorderLevel;
        const gapB = b.currentStock - b.reorderLevel;

        if (sortField === 'thresholdGap') comp = gapA - gapB;
        else if (sortField === 'stock') comp = a.currentStock - b.currentStock;
        else if (sortField === 'reorderLevel') comp = a.reorderLevel - b.reorderLevel;
        else if (sortField === 'name') comp = a.name.localeCompare(b.name);
        else if (sortField === 'priority') {
          const priorityScore: Record<PriorityLevel, number> = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          comp = priorityScore[calculatePriority(a)] - priorityScore[calculatePriority(b)];
        }

        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [products, search, selectedCategory, selectedAlertFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'thresholdGap' ? 'asc' : 'desc');
    }
  };

  return (
    <div id="inventory-stock-screen" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/10">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Inventory & Stock Levels
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Real-time stock audits, low stock alerts, and automated reorder threshold monitoring.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenAddProduct && (
            <button
              onClick={onOpenAddProduct}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Add Stock Line</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. URGENT LOW STOCK ALERTS CALLOUT BANNER */}
      {totalAlertItems > 0 && (
        <div
          id="inventory-low-stock-alert-banner"
          className="p-5 rounded-3xl bg-gradient-to-r from-rose-950/70 via-slate-900/90 to-amber-950/70 border border-rose-500/40 shadow-xl backdrop-blur-xl relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-rose-500 text-slate-950 tracking-wider">
                    ACTION REQUIRED
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    {totalAlertItems} Products at or below Reorder Threshold
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Cooking Oil (5 left, threshold 15) and Basmati Rice (8 left, threshold 20) are critically low. Restock now to prevent stockouts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                id="btn-filter-alerts-only"
                onClick={() => setSelectedAlertFilter('alerts_only')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>View {totalAlertItems} Alerts</span>
              </button>

              {criticalItems.length > 0 && (
                <button
                  id="btn-quick-restock-critical"
                  onClick={() => onRequestRestock(criticalItems[0], 50)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white shadow-lg shadow-rose-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Restock {criticalItems[0].name}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. INVENTORY & THRESHOLD STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Stock on Hand */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Total Stock on Hand
          </span>
          <div className="text-2xl font-extrabold text-white mt-1.5 tracking-tight font-mono">
            {totalUnitsOnShelf} <span className="text-xs font-normal text-slate-400">units</span>
          </div>
          <span className="text-[11px] text-slate-500">Across {products.length} product lines</span>
        </div>

        {/* Critical Depletion */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl shadow-lg">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Critical Alerts
          </span>
          <div className="text-2xl font-extrabold text-rose-400 mt-1.5 tracking-tight font-mono">
            {criticalItems.length} <span className="text-xs font-normal text-rose-300">items</span>
          </div>
          <span className="text-[11px] text-rose-400/80 font-medium">≤ 40% reorder threshold</span>
        </div>

        {/* Low Stock Threshold */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl shadow-lg">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alerts
          </span>
          <div className="text-2xl font-extrabold text-amber-400 mt-1.5 tracking-tight font-mono">
            {lowStockItems.length} <span className="text-xs font-normal text-amber-300">items</span>
          </div>
          <span className="text-[11px] text-slate-500">Approaching threshold</span>
        </div>

        {/* Healthy Buffer */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl shadow-lg">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Healthy Threshold
          </span>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1.5 tracking-tight font-mono">
            {healthyItems.length} <span className="text-xs font-normal text-emerald-300">items</span>
          </div>
          <span className="text-[11px] text-slate-500">Above reorder safety buffer</span>
        </div>
      </div>

      {/* 3. SEARCH & ALERT FILTER CONTROLS */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="input-search-inventory"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stock lines, suppliers, thresholds..."
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
            />
          </div>

          {/* Stock Alert Filter */}
          <div className="relative">
            <select
              id="select-alert-filter"
              value={selectedAlertFilter}
              onChange={(e) => setSelectedAlertFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-semibold"
            >
              <option value="all">Stock Filter: All Items ({products.length})</option>
              <option value="alerts_only">⚠️ Low Stock Alerts Only ({totalAlertItems})</option>
              <option value="critical">🔴 Critical Depletion ({criticalItems.length})</option>
              <option value="low">🟠 Low Stock ({lowStockItems.length})</option>
              <option value="healthy">🟢 Healthy Stock ({healthyItems.length})</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              id="select-inventory-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 font-semibold"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Department: {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" /> Sort By:
            </span>

            {[
              { id: 'thresholdGap', label: 'Reorder Deficit (Urgent First)' },
              { id: 'stock', label: 'Stock Level' },
              { id: 'reorderLevel', label: 'Reorder Threshold' },
              { id: 'priority', label: 'Priority' },
              { id: 'name', label: 'Item Name' },
            ].map((s) => {
              const isSelected = sortField === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSort(s.id as SortField)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{s.label}</span>
                  {isSelected && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-slate-400">
            Showing <strong className="text-white">{filteredProducts.length}</strong> items
          </span>
        </div>
      </div>

      {/* 4. STOCK LEVELS & REORDER THRESHOLDS TABLE */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Item & Department</th>
                <th className="py-3.5 px-4">Current Stock Level</th>
                <th className="py-3.5 px-4">Reorder Threshold</th>
                <th className="py-3.5 px-4">Threshold Variance</th>
                <th className="py-3.5 px-4">Estimated Run-out</th>
                <th className="py-3.5 px-4">Stock Alert Status</th>
                <th className="py-3.5 px-4 text-right">Replenishment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredProducts.map((product) => {
                const status = calculateStockStatus(product);
                const isCritical = status === 'critical' || status === 'out_of_stock';
                const isLow = status === 'low';
                const variance = product.currentStock - product.reorderLevel;
                const daysRemaining =
                  product.salesVelocityPerDay > 0
                    ? Math.round(product.currentStock / product.salesVelocityPerDay)
                    : 99;

                // Max capacity representation for meter
                const maxCapacity = Math.max(product.reorderLevel * 2.5, product.currentStock + 20, 50);
                const percent = Math.min(Math.round((product.currentStock / maxCapacity) * 100), 100);
                const thresholdPercent = Math.min(Math.round((product.reorderLevel / maxCapacity) * 100), 100);

                return (
                  <tr
                    key={product.id}
                    id={`inventory-stock-row-${product.id}`}
                    className={`hover:bg-slate-800/40 transition-colors group ${
                      isCritical ? 'bg-rose-950/15' : isLow ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    {/* 1. Item & Dept */}
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div
                        onClick={() => onSelectProduct(product)}
                        className="hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <span className="text-sm font-extrabold">{product.name}</span>
                        {product.restockPending && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-mono">
                            PO In Transit
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-normal mt-0.5">
                        <span className="text-slate-300">{product.category}</span>
                        <span>•</span>
                        <span className="text-slate-500">Supplier: {product.supplier}</span>
                      </div>
                    </td>

                    {/* 2. Current Stock Level with Visual Meter */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`font-mono text-sm font-extrabold ${
                              isCritical
                                ? 'text-rose-400'
                                : isLow
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {product.currentStock} units
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {percent}% cap
                          </span>
                        </div>
                        {/* Progress Bar with Reorder Threshold Marker */}
                        <div className="w-36 h-2 bg-slate-950 rounded-full overflow-hidden relative border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isCritical
                                ? 'bg-rose-500'
                                : isLow
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* 3. Reorder Threshold */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="p-1 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono">
                          {product.reorderLevel}
                        </span>
                        <span className="text-[11px] text-slate-400">units min</span>
                      </div>
                    </td>

                    {/* 4. Threshold Variance */}
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {variance < 0 ? (
                        <span className="px-2 py-0.5 rounded-md font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80 inline-flex items-center gap-1">
                          <span>{variance}</span>
                          <span className="text-[10px] uppercase font-sans">Deficit</span>
                        </span>
                      ) : variance === 0 ? (
                        <span className="px-2 py-0.5 rounded-md font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80 inline-flex items-center gap-1">
                          <span>0</span>
                          <span className="text-[10px] uppercase font-sans">At Limit</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 inline-flex items-center gap-1">
                          <span>+{variance}</span>
                          <span className="text-[10px] uppercase font-sans">Buffer</span>
                        </span>
                      )}
                    </td>

                    {/* 5. Estimated Run-out Days */}
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <span
                        className={
                          daysRemaining <= 1
                            ? 'text-rose-400 font-bold'
                            : daysRemaining <= 3
                            ? 'text-amber-400 font-bold'
                            : 'text-slate-300'
                        }
                      >
                        ~{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                      </span>
                      <span className="block text-[10px] text-slate-500 font-sans">
                        @{product.salesVelocityPerDay} units/day
                      </span>
                    </td>

                    {/* 6. Stock Alert Status Badge */}
                    <td className="py-3.5 px-4">
                      {isCritical ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-rose-950 text-rose-300 border border-rose-800/90 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                          <span>Critical Alert</span>
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-amber-950 text-amber-300 border border-amber-800/90 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          <span>Low Stock Alert</span>
                        </span>
                      ) : status === 'overstocked' ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-yellow-950 text-yellow-300 border border-yellow-800/90 inline-flex items-center gap-1">
                          <span>Overstocked</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800/90 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Healthy</span>
                        </span>
                      )}
                    </td>

                    {/* 7. Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectProduct(product)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View Stock Diagnostics"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          id={`btn-restock-${product.id}`}
                          onClick={() => onRequestRestock(product, Math.max(product.reorderLevel * 2 - product.currentStock, 20))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                            isCritical
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                              : isLow
                              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                              : 'bg-cyan-600/90 hover:bg-cyan-500 text-white shadow-cyan-600/20'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Restock</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
