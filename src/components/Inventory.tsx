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
  PlusCircle,
  Eye,
  ShoppingCart,
  SlidersHorizontal,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Product, Category, StockStatus, PriorityLevel } from '../types';
import { calculateStockStatus, calculatePriority, formatCurrency } from '../utils/analysis';

interface InventoryProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onRequestRestock: (product: Product) => void;
}

type SortField = 'sales' | 'stock' | 'priority' | 'name' | 'revenue';
type SortOrder = 'asc' | 'desc';

export const Inventory: React.FC<InventoryProps> = ({
  products,
  onSelectProduct,
  onRequestRestock,
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
    return products.filter((p) => {
      // Search
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

      // Status filter
      const status = calculateStockStatus(p);
      let matchesStatus = true;
      if (selectedStatus === 'critical') {
        matchesStatus = status === 'critical' || status === 'out_of_stock';
      } else if (selectedStatus === 'low') {
        matchesStatus = status === 'low' || status === 'critical' || status === 'out_of_stock';
      } else if (selectedStatus === 'normal') {
        matchesStatus = status === 'normal';
      } else if (selectedStatus === 'overstocked') {
        matchesStatus = status === 'overstocked';
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, selectedCategory, selectedStatus]);

  // Sorted products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    const priorityWeight: Record<PriorityLevel, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'sales') {
        comparison = a.unitsSold - b.unitsSold;
      } else if (sortField === 'stock') {
        comparison = a.currentStock - b.currentStock;
      } else if (sortField === 'revenue') {
        comparison = a.revenue - b.revenue;
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'priority') {
        const pA = priorityWeight[calculatePriority(a)];
        const pB = priorityWeight[calculatePriority(b)];
        comparison = pA - pB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [filteredProducts, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const renderStockBadge = (product: Product) => {
    const status = calculateStockStatus(product);
    if (status === 'out_of_stock') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          Out of Stock
        </span>
      );
    }
    if (status === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-500" />
          Critical ({product.currentStock})
        </span>
      );
    }
    if (status === 'low') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          Low Stock ({product.currentStock})
        </span>
      );
    }
    if (status === 'overstocked') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200">
          Overstocked ({product.currentStock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Healthy ({product.currentStock})
      </span>
    );
  };

  const renderPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-rose-600 text-white uppercase tracking-wider shadow-xs">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white uppercase tracking-wider">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-200 text-slate-700 uppercase tracking-wider">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 uppercase tracking-wider">
            Normal
          </span>
        );
    }
  };

  return (
    <div id="inventory-screen" className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Inventory Management
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor real-time stock levels, reorder thresholds, demand run-rates, and restock actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-xs">
            Total Catalog: {products.length} Products
          </span>
        </div>
      </div>

      {/* Control Bar: Search, Category Filters, Status Filters, and Sorting Buttons */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="inventory-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name or category (e.g. Cooking Oil, Rice, Snacks)..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="inventory-category-select" className="text-xs font-medium text-slate-500">Category:</label>
              <select
                id="inventory-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-semibold py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="inventory-status-select" className="text-xs font-medium text-slate-500">Status:</label>
              <select
                id="inventory-status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs font-semibold py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sorting Pills / Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Sort by:</span>
            <button
              id="sort-btn-priority"
              onClick={() => toggleSort('priority')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                sortField === 'priority'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Priority {sortField === 'priority' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              id="sort-btn-sales"
              onClick={() => toggleSort('sales')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                sortField === 'sales'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Sales Units {sortField === 'sales' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              id="sort-btn-stock"
              onClick={() => toggleSort('stock')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                sortField === 'stock'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Current Stock {sortField === 'stock' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button
              id="sort-btn-revenue"
              onClick={() => toggleSort('revenue')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                sortField === 'revenue'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Revenue {sortField === 'revenue' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Showing <span className="font-bold text-slate-700">{sortedProducts.length}</span> items
          </div>
        </div>
      </div>

      {/* Inventory Table (Exact columns requested: Product, Category, Price, Current Stock, Reorder Level, Units Sold, Revenue, Stock Status, Priority, Action) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table id="inventory-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3 text-right">Price</th>
                <th className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900" onClick={() => toggleSort('stock')}>
                  Current Stock
                </th>
                <th className="py-3.5 px-3 text-right">Reorder Level</th>
                <th className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900" onClick={() => toggleSort('sales')}>
                  Units Sold
                </th>
                <th className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-900" onClick={() => toggleSort('revenue')}>
                  Revenue
                </th>
                <th className="py-3.5 px-3 text-center">Stock Status</th>
                <th className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-900" onClick={() => toggleSort('priority')}>
                  Priority
                </th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600">No matching products found</p>
                    <p className="text-xs text-slate-400 mt-1">Try broadening your search term or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                sortedProducts.map((product) => {
                  const priority = calculatePriority(product);
                  const isLow = product.currentStock <= product.reorderLevel;

                  return (
                    <tr
                      key={product.id}
                      id={`inventory-row-${product.id}`}
                      className={`hover:bg-blue-50/50 transition-colors group cursor-pointer ${
                        isLow ? 'bg-amber-50/20' : ''
                      }`}
                      onClick={() => onSelectProduct(product)}
                    >
                      {/* Product Name */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </span>
                          {product.restockPending && (
                            <span className="text-[10px] font-medium bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                              PO Placed
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {product.supplier}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3 text-right font-semibold text-slate-800">
                        {formatCurrency(product.price)}
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-3 text-right font-bold">
                        <span
                          className={`${
                            product.currentStock === 0
                              ? 'text-rose-600 font-extrabold'
                              : product.currentStock <= product.reorderLevel
                              ? 'text-amber-600 font-bold'
                              : 'text-slate-800'
                          }`}
                        >
                          {product.currentStock}
                        </span>
                      </td>

                      {/* Reorder Level */}
                      <td className="py-3.5 px-3 text-right text-slate-500 font-mono">
                        {product.reorderLevel}
                      </td>

                      {/* Units Sold */}
                      <td className="py-3.5 px-3 text-right font-semibold text-slate-800">
                        {product.unitsSold}
                      </td>

                      {/* Revenue */}
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(product.revenue)}
                      </td>

                      {/* Stock Status */}
                      <td className="py-3.5 px-3 text-center">
                        {renderStockBadge(product)}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3 text-center">
                        {renderPriorityBadge(priority)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-analyze-${product.id}`}
                            onClick={() => onSelectProduct(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Open detailed product analysis"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-restock-table-${product.id}`}
                            onClick={() => onRequestRestock(product)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-blue-600 text-white transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                            title="Create Restock Request"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Restock</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
