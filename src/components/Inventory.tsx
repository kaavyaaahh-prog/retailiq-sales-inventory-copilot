import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  ShoppingCart,
  SlidersHorizontal,
  Package,
  Boxes
} from 'lucide-react';
import { Product, Category, StockStatus, PriorityLevel } from '../types';
import { calculateStockStatus, calculatePriority, formatCurrency } from '../utils/analysis';

interface InventoryProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onRequestRestock: (product: Product) => void;
  onOpenAddProduct?: () => void;
}

type SortField = 'sales' | 'stock' | 'priority' | 'name' | 'revenue';
type SortOrder = 'asc' | 'desc';

export const Inventory: React.FC<InventoryProps> = ({
  products,
  onSelectProduct,
  onRequestRestock,
  onOpenAddProduct,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Categories list
  const categories: string[] = ['All', 'Grocery', 'Dairy', 'Snacks', 'Personal Care', 'Beverages', 'Household'];

  // Statuses list
  const statuses = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Critical / Out of Stock', value: 'critical' },
    { label: 'Low Stock', value: 'low' },
    { label: 'Normal / Healthy', value: 'normal' },
    { label: 'Overstocked', value: 'overstocked' },
  ];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase()) ||
          p.supplier.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

        const status = calculateStockStatus(p);
        let matchesStatus = true;
        if (selectedStatus === 'critical') {
          matchesStatus = status === 'critical' || status === 'out_of_stock';
        } else if (selectedStatus === 'low') {
          matchesStatus = status === 'low';
        } else if (selectedStatus === 'normal') {
          matchesStatus = status === 'normal';
        } else if (selectedStatus === 'overstocked') {
          matchesStatus = status === 'overstocked';
        }

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'sales') comp = a.unitsSold - b.unitsSold;
        else if (sortField === 'stock') comp = a.currentStock - b.currentStock;
        else if (sortField === 'revenue') comp = a.revenue - b.revenue;
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
  }, [products, search, selectedCategory, selectedStatus, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const criticalCount = products.filter((p) => p.currentStock === 0 || p.currentStock <= p.reorderLevel * 0.4).length;
  const lowCount = products.filter((p) => p.currentStock > p.reorderLevel * 0.4 && p.currentStock <= p.reorderLevel).length;
  const healthyCount = products.filter((p) => p.currentStock > p.reorderLevel).length;

  return (
    <div id="inventory-management-screen" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Inventory Management
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time stock audit, safety buffers, velocity ratios, and replenishment actions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenAddProduct && (
            <button
              onClick={onOpenAddProduct}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Stock Health Badges Header */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Catalog Size</span>
          <div className="text-xl font-extrabold text-white mt-1">{products.length} Products</div>
          <span className="text-[11px] text-slate-500">6 Active Departments</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl">
          <span className="text-[11px] font-bold text-rose-400 uppercase">Critical Restock</span>
          <div className="text-xl font-extrabold text-rose-400 mt-1">{criticalCount} Items</div>
          <span className="text-[11px] text-slate-500">Immediate action needed</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl">
          <span className="text-[11px] font-bold text-amber-400 uppercase">Low Stock</span>
          <div className="text-xl font-extrabold text-amber-400 mt-1">{lowCount} Items</div>
          <span className="text-[11px] text-slate-500">Below reorder mark</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl">
          <span className="text-[11px] font-bold text-emerald-400 uppercase">Healthy Inventory</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">{healthyCount} Items</div>
          <span className="text-[11px] text-slate-500">Adequate coverage</span>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product, category, or supplier..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 font-semibold"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 font-semibold"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  Status: {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
          <span className="text-[11px] font-bold uppercase text-slate-500 mr-1 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-cyan-400" /> Sort By:
          </span>

          {[
            { id: 'priority', label: 'Priority Urgency' },
            { id: 'sales', label: 'Units Sold' },
            { id: 'stock', label: 'Current Stock' },
            { id: 'revenue', label: 'Revenue' },
            { id: 'name', label: 'Product Name' },
          ].map((s) => {
            const isSelected = sortField === s.id;
            return (
              <button
                key={s.id}
                onClick={() => toggleSort(s.id as SortField)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{s.label}</span>
                {isSelected && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
              </button>
            );
          })}
        </div>
      </div>

      {/* 10-COLUMN INVENTORY TABLE */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Reorder Level</th>
                <th className="py-3.5 px-4">Units Sold</th>
                <th className="py-3.5 px-4">Revenue</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((product) => {
                const status = calculateStockStatus(product);
                const priority = calculatePriority(product);
                const isCritical = status === 'critical' || status === 'out_of_stock';
                const isLow = status === 'low';

                return (
                  <tr
                    key={product.id}
                    id={`inventory-row-${product.id}`}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* 1. Product */}
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div
                        onClick={() => onSelectProduct(product)}
                        className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <span>{product.name}</span>
                        {product.restockPending && (
                          <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-mono">
                            PO Pending
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Supplier: {product.supplier}
                      </span>
                    </td>

                    {/* 2. Category */}
                    <td className="py-3.5 px-4 text-slate-300">{product.category}</td>

                    {/* 3. Price */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">{formatCurrency(product.price)}</td>

                    {/* 4. Current Stock */}
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span
                        className={
                          product.currentStock === 0
                            ? 'text-rose-400'
                            : product.currentStock <= product.reorderLevel
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {product.currentStock} units
                      </span>
                    </td>

                    {/* 5. Reorder Level */}
                    <td className="py-3.5 px-4 font-mono text-slate-400">{product.reorderLevel}</td>

                    {/* 6. Units Sold */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">{product.unitsSold}</td>

                    {/* 7. Revenue */}
                    <td className="py-3.5 px-4 font-mono text-cyan-400 font-semibold">
                      {formatCurrency(product.revenue)}
                    </td>

                    {/* 8. Stock Status */}
                    <td className="py-3.5 px-4">
                      {isCritical ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-rose-950/90 text-rose-300 border border-rose-800/80">
                          Critical
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-amber-950/90 text-amber-300 border border-amber-800/80">
                          Low Stock
                        </span>
                      ) : status === 'overstocked' ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-yellow-950/90 text-yellow-300 border border-yellow-800/80">
                          Overstocked
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-800/80">
                          Healthy
                        </span>
                      )}
                    </td>

                    {/* 9. Priority */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                          priority === 'urgent'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                            : priority === 'high'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                            : priority === 'medium'
                            ? 'bg-yellow-950/80 text-yellow-300 border border-yellow-800/60'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {priority}
                      </span>
                    </td>

                    {/* 10. Action */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectProduct(product)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Inspect Product Analytics"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onRequestRestock(product)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <ShoppingCart className="w-3 h-3" />
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
