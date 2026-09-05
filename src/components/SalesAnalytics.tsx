import React from 'react';
import {
  TrendingUp,
  Package,
  CreditCard,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  AlertCircle
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

const CATEGORY_COLORS = ['#2563eb', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

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

  // Slowest moving products (Answers purpose question: "What products are not selling?")
  const slowMovers = [...products]
    .filter((p) => p.currentStock > 0)
    .sort((a, b) => a.unitsSold - b.unitsSold)
    .slice(0, 4);

  // Category sales breakdown
  const categorySalesMap: Record<string, { units: number; revenue: number }> = {};
  products.forEach((p) => {
    if (!categorySalesMap[p.category]) {
      categorySalesMap[p.category] = { units: 0, revenue: 0 };
    }
    categorySalesMap[p.category].units += p.unitsSold;
    categorySalesMap[p.category].revenue += p.revenue;
  });

  const categoryData = Object.entries(categorySalesMap).map(([name, data]) => ({
    name,
    value: data.revenue,
    units: data.units,
  }));

  // Top products for bar chart
  const topProductsChartData = sortedByUnits.slice(0, 6).map((p) => ({
    name: p.name.length > 14 ? p.name.substring(0, 14) + '…' : p.name,
    units: p.unitsSold,
    revenue: p.revenue,
  }));

  return (
    <div id="sales-analytics-screen" className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sales & Demand Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Deep dive into revenue drivers, category distribution, product velocity, and slow-moving stock.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-xs self-start sm:self-auto">
          Current Period: Last 7 Days
        </span>
      </div>

      {/* Top 4 Metric Cards (Show: Total Revenue, Total Units Sold, Average Order Value, Best Selling Product) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {STORE_INFO.kpis.totalRevenue}
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% weekly growth
            </p>
          </div>
        </div>

        {/* Total Units Sold */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Units Sold
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {STORE_INFO.kpis.unitsSold}
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8.5% volume run-rate
            </p>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Order Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {STORE_INFO.kpis.averageOrderValue}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              ~2.8 items per customer cart
            </p>
          </div>
        </div>

        {/* Best Selling Product */}
        <div
          onClick={() => bestSeller && onSelectProduct(bestSeller)}
          className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-300 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Best Selling Product
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 tracking-tight truncate">
              {bestSeller ? bestSeller.name : 'Rice'}
            </div>
            <p className="text-xs text-amber-700 font-semibold mt-1">
              {bestSeller ? `${bestSeller.unitsSold} units (${formatCurrency(bestSeller.revenue)})` : '120 units'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section: Daily Sales + Product Sales + Category Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Sales Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Sales Trend</h3>
              <p className="text-xs text-slate-500">Gross revenue distribution by day of week.</p>
            </div>
            <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              Peak: Saturday
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailySalesRecord;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs space-y-1">
                          <p className="font-bold">{data.day}</p>
                          <p className="text-blue-300">Revenue: {formatCurrency(data.revenue)}</p>
                          <p className="text-slate-300">Units: {data.units} sold</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Sales Distribution */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Category Sales Revenue</h3>
            <p className="text-xs text-slate-500 mt-0.5">Share of turnover across store departments.</p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {categoryData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                ></span>
                <span className="text-slate-600 truncate">{cat.name}</span>
                <span className="font-bold text-slate-900 ml-auto">
                  {formatCurrency(cat.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Sales Volume Comparison Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Product Sales Volume (Top 6 Performers)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Unit sales velocity comparison showing market demand distribution.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProductsChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#334155' }} width={120} />
              <Tooltip
                formatter={(val: number) => [`${val} units`, 'Units Sold']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="units" fill="#4f46e5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Tables: Best Sellers (From Prompt) + Slow-Moving / Dead Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Best Sellers Table (Exact items requested: Cooking Oil, Rice, Milk, Biscuits, Soap) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Best Sellers Leaderboard</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Core performance ranking highlighted in prompt specification.
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
              High Velocity
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Rank & Product</th>
                  <th className="py-2.5 px-3 text-right">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-center">Stock Level</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bestSellersSpecified.map((item, index) => {
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => onSelectProduct(item)}
                    >
                      <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            index === 0
                              ? 'bg-amber-100 text-amber-800'
                              : index === 1
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span>{item.name}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {item.unitsSold} units
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.currentStock <= item.reorderLevel
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {item.currentStock} left
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`btn-analytics-restock-${item.id}`}
                          onClick={() => onRequestRestock(item)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Restock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slow-Moving / What Products are Not Selling? (Answering Purpose Question #4) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Slow-Moving Inventory</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Items tying up capital with low inventory turnover.
                </p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                Monitor
              </span>
            </div>

            <div className="space-y-3">
              {slowMovers.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectProduct(item)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{item.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {item.category} · In stock: <strong>{item.currentStock}</strong> · Sold only:{' '}
                      <strong className="text-amber-700">{item.unitsSold}</strong>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-200 shrink-0">
                    High Stock / Low Sales
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 text-slate-700 text-xs mt-4">
            💡 <strong>Manager Recommendation:</strong> Apply discount bundles or reposition near checkout aisles to accelerate sell-through.
          </div>
        </div>
      </div>
    </div>
  );
};
