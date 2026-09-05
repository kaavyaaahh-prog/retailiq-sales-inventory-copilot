import React from 'react';
import {
  TrendingUp,
  Package,
  CreditCard,
  Award,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  AlertCircle,
  Eye,
  ShoppingCart
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Product, DailySalesRecord } from '../types';
import { STORE_INFO } from '../data/mockData';
import { formatCurrency } from '../utils/analysis';

interface SalesAnalyticsProps {
  products: Product[];
  salesTrend: DailySalesRecord[];
  onSelectProduct: (product: Product) => void;
  onRequestRestock: (product: Product) => void;
}

const CATEGORY_COLORS = ['#06b6d4', '#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({
  products,
  salesTrend,
  onSelectProduct,
  onRequestRestock,
}) => {
  // Best sellers list sorted by units sold
  const sortedByUnits = [...products].sort((a, b) => b.unitsSold - a.unitsSold);
  const bestSeller = sortedByUnits[0];

  // Specific 5 best sellers list from prompt specification:
  // 1. Cooking Oil - 110 units
  // 2. Rice - 120 units
  // 3. Milk - 95 units
  // 4. Biscuits - 40 units
  // 5. Soap - 25 units
  const bestSellersSpecified = [
    products.find((p) => p.name.toLowerCase().includes('cooking oil')),
    products.find((p) => p.name.toLowerCase().includes('rice') && !p.name.includes('Basmati')),
    products.find((p) => p.name.toLowerCase().includes('milk') && !p.name.includes('Almond')),
    products.find((p) => p.name.toLowerCase().includes('biscuits')),
    products.find((p) => p.name.toLowerCase().includes('soap')),
  ].filter(Boolean) as Product[];

  // Prepare category sales breakdown
  const categoryMap = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.revenue;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }));

  // Top 6 products for velocity comparison bar chart
  const topSixProducts = sortedByUnits.slice(0, 6).map((p) => ({
    name: p.name.length > 15 ? `${p.name.slice(0, 13)}...` : p.name,
    units: p.unitsSold,
    revenue: p.revenue,
    stock: p.currentStock,
  }));

  // Slow moving products (units sold < 30 and stock > 20)
  const slowMoving = products
    .filter((p) => p.unitsSold <= 40 && p.currentStock >= 30)
    .sort((a, b) => a.unitsSold - b.unitsSold);

  return (
    <div id="sales-analytics-screen" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Sales & Demand Analytics
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Revenue trends, product velocity distributions, and cross-category demand patterns.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>7-Day Audited Period</span>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {STORE_INFO.kpis.todayRevenue}
          </div>
          <div className="mt-2 text-xs text-emerald-400 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% week-on-week
          </div>
        </div>

        {/* Total Units Sold */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Units Sold</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {STORE_INFO.kpis.unitsSold}
          </div>
          <div className="mt-2 text-xs text-emerald-400 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +8.5% volume surge
          </div>
        </div>

        {/* Average Order Value */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Average Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {STORE_INFO.kpis.averageOrderValue}
          </div>
          <div className="mt-2 text-xs text-slate-400 font-medium">
            Across 1,210 supermarket checkouts
          </div>
        </div>

        {/* Best Selling Product */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-slate-400">Top Velocity Item</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-extrabold text-white truncate">
            {bestSeller?.name || 'Rice'}
          </div>
          <div className="mt-2 text-xs text-amber-300 font-bold">
            {bestSeller?.unitsSold} units · {formatCurrency(bestSeller?.revenue || 0)}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-white">Daily Revenue & Order Volume</h3>
              <p className="text-xs text-slate-400">Weekly sales pacing Monday through Sunday</p>
            </div>
            <span className="text-xs font-bold text-cyan-400 font-mono">Live Sync</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailySalesRecord;
                      return (
                        <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/40 text-xs shadow-xl space-y-1">
                          <p className="font-bold text-white">{data.day}</p>
                          <p className="text-cyan-300 font-bold">Revenue: {formatCurrency(data.revenue)}</p>
                          <p className="text-slate-300">Units Sold: {data.units}</p>
                          <p className="text-slate-300">Orders: {data.orders}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Distribution Donut */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-extrabold text-white">Category Sales</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Revenue breakdown across store aisles</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        return (
                          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 text-xs shadow-xl">
                            <span className="font-bold text-white block">{item.name}</span>
                            <span className="text-cyan-300 font-mono">{formatCurrency(item.value as number)}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-800">
            {categoryChartData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                ></span>
                <span className="text-slate-300 truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Sales Velocity Bar Chart */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">Product Sales Comparison (Top 6)</h3>
            <p className="text-xs text-slate-400">Comparing units sold against remaining stock buffer</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">Volume Benchmark</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topSixProducts} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/40 text-xs shadow-xl space-y-1">
                        <p className="font-bold text-white">{data.name}</p>
                        <p className="text-cyan-300 font-bold">Units Sold: {data.units}</p>
                        <p className="text-amber-400 font-bold">Current Stock: {data.stock}</p>
                        <p className="text-slate-300">Revenue: {formatCurrency(data.revenue)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="units" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Units Sold" />
              <Bar dataKey="stock" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Stock Remaining" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Best Sellers Table & Slow Moving Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BEST SELLERS TABLE */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white">Best Sellers Leaderboard</h3>
              <p className="text-xs text-slate-400">Core staple products with highest turnover</p>
            </div>
            <Award className="w-5 h-5 text-amber-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Product</th>
                  <th className="py-2.5 px-3">Units Sold</th>
                  <th className="py-2.5 px-3">Revenue</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bestSellersSpecified.map((item, i) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <div>
                          <span>{item.name}</span>
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Stock: {item.currentStock} units left
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                      {item.unitsSold} units
                    </td>
                    <td className="py-3 px-3 font-mono text-white">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectProduct(item)}
                        className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SLOW MOVING INVENTORY (Answers question: "What products are not selling?") */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white">Slow-Moving Inventory</h3>
              <p className="text-xs text-slate-400">High inventory but sluggish turnover rate</p>
            </div>
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          </div>

          <div className="space-y-3">
            {slowMoving.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-2xl bg-yellow-950/20 border border-yellow-800/40 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white">{p.name}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Stock: <strong className="text-yellow-300">{p.currentStock}</strong> · Sold: {p.unitsSold}
                  </div>
                </div>
                <button
                  onClick={() => onSelectProduct(p)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-300 border border-yellow-600/50 transition-colors cursor-pointer"
                >
                  Monitor Action
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
