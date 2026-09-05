import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Grid3X3,
  List,
  Eye,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  DollarSign,
  Layers,
  Package,
  Check
} from 'lucide-react';
import { Product, Category } from '../types';
import { formatCurrency } from '../utils/analysis';

interface ProductsViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onOpenAddProduct?: () => void;
  onRequestRestock: (product: Product, suggestedQty?: number) => void;
}

type SortField = 'name' | 'price' | 'category' | 'revenue' | 'unitsSold';
type SortOrder = 'asc' | 'desc';

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onSelectProduct,
  onOpenAddProduct,
  onRequestRestock,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under100' | '100to300' | 'above300'>('all');

  const categories: { label: string; value: string }[] = [
    { label: 'All Categories', value: 'All' },
    { label: 'Grocery', value: 'Grocery' },
    { label: 'Dairy', value: 'Dairy' },
    { label: 'Snacks', value: 'Snacks' },
    { label: 'Personal Care', value: 'Personal Care' },
    { label: 'Beverages', value: 'Beverages' },
    { label: 'Household', value: 'Household' },
  ];

  // Category Color Palette
  const categoryThemes: Record<string, { bg: string; text: string; border: string }> = {
    Grocery: { bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-800/70' },
    Dairy: { bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-800/70' },
    Snacks: { bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-800/70' },
    'Personal Care': { bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-800/70' },
    Beverages: { bg: 'bg-cyan-950/80', text: 'text-cyan-300', border: 'border-cyan-800/70' },
    Household: { bg: 'bg-rose-950/80', text: 'text-rose-300', border: 'border-rose-800/70' },
  };

  // Filter and sort catalog
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.category.toLowerCase().includes(search.toLowerCase()) ||
          product.supplier.toLowerCase().includes(search.toLowerCase()) ||
          product.id.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

        let matchesPrice = true;
        if (priceFilter === 'under100') matchesPrice = product.price < 100;
        else if (priceFilter === '100to300') matchesPrice = product.price >= 100 && product.price <= 300;
        else if (priceFilter === 'above300') matchesPrice = product.price > 300;

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'name') comp = a.name.localeCompare(b.name);
        else if (sortField === 'price') comp = a.price - b.price;
        else if (sortField === 'category') comp = a.category.localeCompare(b.category);
        else if (sortField === 'revenue') comp = a.revenue - b.revenue;
        else if (sortField === 'unitsSold') comp = a.unitsSold - b.unitsSold;

        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [products, search, selectedCategory, priceFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
    }
  };

  // Pricing statistics
  const avgPrice = Math.round(
    products.reduce((acc, curr) => acc + curr.price, 0) / (products.length || 1)
  );
  const minPrice = Math.min(...products.map((p) => p.price));
  const maxPrice = Math.max(...products.map((p) => p.price));
  const uniqueCategoriesCount = new Set(products.map((p) => p.category)).size;

  return (
    <div id="products-catalog-screen" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10">
              <Boxes className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Product Catalog
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Master product database showing item names, retail pricing, department categories, and SKU definitions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-slate-400">
            <button
              id="btn-view-mode-table"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              id="btn-view-mode-grid"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'hover:text-white'
              }`}
              title="Grid Card View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>

          {onOpenAddProduct && (
            <button
              id="btn-catalog-add-product"
              onClick={onOpenAddProduct}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/30 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Catalog KPI Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Catalog Size</span>
          <div className="text-2xl font-extrabold text-white mt-1.5 tracking-tight">
            {products.length} <span className="text-xs font-medium text-slate-400">SKUs</span>
          </div>
          <span className="text-[11px] text-cyan-400 font-medium">100% active in store</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Categories</span>
          <div className="text-2xl font-extrabold text-white mt-1.5 tracking-tight">
            {uniqueCategoriesCount} <span className="text-xs font-medium text-slate-400">Depts</span>
          </div>
          <span className="text-[11px] text-slate-500">Across retail aisles</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Price</span>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1.5 tracking-tight font-mono">
            {formatCurrency(avgPrice)}
          </div>
          <span className="text-[11px] text-slate-500">Retail MSRP benchmark</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Price Spread</span>
          <div className="text-xl font-extrabold text-white mt-1.5 tracking-tight font-mono">
            {formatCurrency(minPrice)} – {formatCurrency(maxPrice)}
          </div>
          <span className="text-[11px] text-slate-500">Lowest to highest</span>
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.value;
          const count =
            cat.value === 'All'
              ? products.length
              : products.filter((p) => p.category === cat.value).length;
          return (
            <button
              key={cat.value}
              id={`filter-cat-${cat.value.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-cyan-400 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="input-search-products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, category, or supplier..."
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400"
            />
          </div>

          {/* Price Range Filter */}
          <div className="relative">
            <select
              id="select-price-range"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 font-semibold"
            >
              <option value="all">Price: All Price Ranges</option>
              <option value="under100">Under ₹100 (Affordable)</option>
              <option value="100to300">₹100 to ₹300 (Mid Tier)</option>
              <option value="above300">Above ₹300 (Premium)</option>
            </select>
          </div>

          {/* Sort Selection */}
          <div className="relative">
            <select
              id="select-product-sort"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="w-full py-2.5 px-3 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400 font-semibold"
            >
              <option value="name">Sort by: Product Name (A - Z)</option>
              <option value="price">Sort by: Retail Price</option>
              <option value="category">Sort by: Category</option>
              <option value="revenue">Sort by: Total Revenue</option>
              <option value="unitsSold">Sort by: Units Sold</option>
            </select>
          </div>
        </div>

        {/* Sort Order and Quick Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" /> Sort Direction:
            </span>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              {sortOrder === 'asc' ? (
                <>
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Ascending ({sortField === 'price' ? 'Lowest first' : 'A to Z'})</span>
                </>
              ) : (
                <>
                  <ArrowDown className="w-3.5 h-3.5" />
                  <span>Descending ({sortField === 'price' ? 'Highest first' : 'Z to A'})</span>
                </>
              )}
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Showing <strong className="text-white">{filteredProducts.length}</strong> of {products.length} products
          </span>
        </div>
      </div>

      {/* VIEW MODE: TABLE OR GRID */}
      {viewMode === 'table' ? (
        /* TABLE VIEW FOR PRODUCT CATALOG */
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Product Name</span>
                      {sortField === 'name' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      {sortField === 'category' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Retail Price (₹)</span>
                      {sortField === 'price' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Supplier / Brand</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('unitsSold')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Units Sold</span>
                      {sortField === 'unitsSold' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('revenue')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Total Revenue</span>
                      {sortField === 'revenue' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredProducts.map((product) => {
                  const theme = categoryThemes[product.category] || {
                    bg: 'bg-slate-800',
                    text: 'text-slate-300',
                    border: 'border-slate-700',
                  };

                  return (
                    <tr
                      key={product.id}
                      id={`product-catalog-row-${product.id}`}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* 1. Product Name */}
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div
                          onClick={() => onSelectProduct(product)}
                          className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <span className="text-sm font-extrabold">{product.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-mono">
                            {product.id}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal">
                          Added to catalog • Daily velocity ~{product.salesVelocityPerDay} units
                        </span>
                      </td>

                      {/* 2. Category */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border inline-flex items-center gap-1.5 ${theme.bg} ${theme.text} ${theme.border}`}
                        >
                          <Layers className="w-3 h-3" />
                          <span>{product.category}</span>
                        </span>
                      </td>

                      {/* 3. Retail Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-sm font-extrabold text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1 rounded-xl inline-block shadow-inner">
                          {formatCurrency(product.price)}
                        </div>
                      </td>

                      {/* 4. Supplier */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="font-medium text-slate-200">{product.supplier}</div>
                        <span className="text-[10px] text-slate-500">Verified Partner</span>
                      </td>

                      {/* 5. Units Sold */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                        {product.unitsSold} units
                      </td>

                      {/* 6. Total Revenue */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {formatCurrency(product.revenue)}
                      </td>

                      {/* 7. Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectProduct(product)}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
                            title="View Product Analysis"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRequestRestock(product)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-600/90 hover:bg-cyan-500 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/20"
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
      ) : (
        /* GRID VIEW FOR PRODUCT CATALOG */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const theme = categoryThemes[product.category] || {
              bg: 'bg-slate-800',
              text: 'text-slate-300',
              border: 'border-slate-700',
            };

            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 hover:border-cyan-500/40 transition-all shadow-xl group flex flex-col justify-between"
              >
                <div>
                  {/* Category Pill and SKU */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border inline-flex items-center gap-1.5 ${theme.bg} ${theme.text} ${theme.border}`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>{product.category}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {product.id}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h3
                    onClick={() => onSelectProduct(product)}
                    className="text-lg font-extrabold text-white group-hover:text-cyan-400 transition-colors cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Supplied by <span className="text-slate-300 font-medium">{product.supplier}</span>
                  </p>

                  {/* Price Banner */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                        Retail Price
                      </span>
                      <div className="text-xl font-extrabold text-cyan-300 font-mono tracking-tight">
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                        Revenue
                      </span>
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        {formatCurrency(product.revenue)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>

                  <button
                    onClick={() => onRequestRestock(product)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Restock</span>
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
