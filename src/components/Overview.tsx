import React from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Product, DailySalesRecord } from '../types';
import { STORE_INFO } from '../data/mockData';
import { formatCurrency } from '../utils/analysis';

interface OverviewProps {
  products: Product[];
  salesTrend: DailySalesRecord[];
  onSelectProduct: (product: Product) => void;
  onNavigateToInventory: () => void;
  onNavigateToRecommendations: () => void;
  onNavigateToCopilot: () => void;
  onRequestRestock: (product: Product) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  products,
  salesTrend,
  onSelectProduct,
  onNavigateToInventory,
  onNavigateToRecommendations,
  onNavigateToCopilot,
  onRequestRestock,
}) => {
  // Find key priority products
  const cookingOil = products.find((p) => p.name.toLowerCase().includes('cooking oil')) || products[0];
  const rice = products.find((p) => p.name.toLowerCase().includes('rice') && !p.name.includes('Basmati')) || products[1];
  const biscuits = products.find((p) => p.name.toLowerCase().includes('biscuits')) || products[3];

  // Top selling products sorted by units sold
  const topSellers = [...products].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);

  const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.reorderLevel).length;
  const outOfStockCount = products.filter((p) => p.currentStock === 0).length;

  return (
    <div id="overview-dashboard" className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome & Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Store Performance Overview
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time sales velocity, inventory depletion buffers, and automated daily priorities.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Today's Shift: 08:00 - 17:00</span>
          </div>
          <button
            id="overview-btn-ask-copilot"
            onClick={onNavigateToCopilot}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div
          id="kpi-total-revenue"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
        >
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
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
              </span>
              <span className="text-xs text-slate-400">vs last week</span>
            </div>
          </div>
        </div>

        {/* Units Sold */}
        <div
          id="kpi-units-sold"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Units Sold
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {STORE_INFO.kpis.unitsSold}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                <ArrowUpRight className="w-3.5 h-3.5" /> +8.5%
              </span>
              <span className="text-xs text-slate-400">vs previous cycle</span>
            </div>
          </div>
        </div>

        {/* Low Stock Items */}
        <div
          id="kpi-low-stock"
          onClick={onNavigateToInventory}
          className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Low Stock Items
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-900 tracking-tight">
              {lowStockCount || STORE_INFO.kpis.lowStockItems}
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-amber-600 font-medium">Below reorder limit</span>
              <span className="text-xs text-amber-700 font-semibold group-hover:underline flex items-center gap-0.5">
                Review <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Out of Stock */}
        <div
          id="kpi-out-of-stock"
          onClick={onNavigateToInventory}
          className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs flex flex-col justify-between hover:border-rose-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Out of Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-900 tracking-tight">
              {outOfStockCount || STORE_INFO.kpis.outOfStockItems}
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-rose-600 font-medium">Immediate revenue loss</span>
              <span className="text-xs text-rose-700 font-semibold group-hover:underline flex items-center gap-0.5">
                Restock <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Weekly Sales Trend (Monday – Sunday)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gross revenue fluctuations with peak weekend volume on Saturday (₹23,800).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span>Revenue (₹)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-400"></span>
              <span>Units Sold</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrend} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DailySalesRecord;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-slate-200">{data.day}</p>
                        <p className="text-blue-300">Revenue: {formatCurrency(data.revenue)}</p>
                        <p className="text-indigo-300">Units Sold: {data.units} items</p>
                        <p className="text-slate-400">Customer Orders: {data.orders}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Section: Today's Priorities + Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Priorities (Specified in prompt) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
                <h3 className="text-base font-bold text-slate-900">Today's Priorities</h3>
              </div>
              <button
                id="overview-btn-view-all-recommendations"
                onClick={onNavigateToRecommendations}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Smart Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Automated manager directives derived from live stock depletion velocities.
            </p>

            <div className="space-y-3.5">
              {/* 🔴 URGENT: Oil needs immediate restocking */}
              <div
                id="priority-item-oil"
                className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 flex items-start justify-between gap-3 group transition-all hover:bg-rose-50"
              >
                <div className="flex items-start gap-3">
                  <span className="text-sm mt-0.5">🔴</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-rose-700">
                        URGENT
                      </span>
                      <span className="text-[11px] font-medium text-rose-600 bg-rose-100/80 px-1.5 py-0.2 rounded">
                        5 units left
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      Oil needs immediate restocking.
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      High sales (110 sold) + only 5 remaining. Stockout projected before evening rush.
                    </p>
                  </div>
                </div>
                <button
                  id="btn-priority-restock-oil"
                  onClick={() => onRequestRestock(cookingOil)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Restock
                </button>
              </div>

              {/* 🟠 HIGH: Rice stock is below reorder level */}
              <div
                id="priority-item-rice"
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start justify-between gap-3 group transition-all hover:bg-amber-50"
              >
                <div className="flex items-start gap-3">
                  <span className="text-sm mt-0.5">🟠</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-amber-700">
                        HIGH
                      </span>
                      <span className="text-[11px] font-medium text-amber-600 bg-amber-100/80 px-1.5 py-0.2 rounded">
                        8 units (limit: 20)
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      Rice stock is below reorder level.
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Strong demand (120 sold). Reorder today to avoid supplier lead time lag.
                    </p>
                  </div>
                </div>
                <button
                  id="btn-priority-restock-rice"
                  onClick={() => onRequestRestock(rice)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Reorder
                </button>
              </div>

              {/* 🟡 WARNING: Biscuits have unusually high inventory */}
              <div
                id="priority-item-biscuits"
                className="p-4 rounded-xl border border-yellow-200 bg-yellow-50/60 flex items-start justify-between gap-3 group transition-all hover:bg-yellow-50"
              >
                <div className="flex items-start gap-3">
                  <span className="text-sm mt-0.5">🟡</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wide text-yellow-800">
                        WARNING
                      </span>
                      <span className="text-[11px] font-medium text-yellow-700 bg-yellow-100/80 px-1.5 py-0.2 rounded">
                        60 units in stock
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      Biscuits have unusually high inventory.
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      60 available vs 40 sold. Excess capital tied up. Consider breakfast combo promo.
                    </p>
                  </div>
                </div>
                <button
                  id="btn-priority-analyze-biscuits"
                  onClick={() => onSelectProduct(biscuits)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Analyze
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Top Selling Products</h3>
              <button
                id="overview-btn-view-inventory"
                onClick={onNavigateToInventory}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Full Inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Highest velocity catalog lines driving store revenue and customer footfall.
            </p>

            <div className="divide-y divide-slate-100">
              {topSellers.map((product, idx) => (
                <div
                  key={product.id}
                  id={`top-seller-row-${product.id}`}
                  onClick={() => onSelectProduct(product)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        {product.name}
                        {product.currentStock <= product.reorderLevel && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                            Low Stock
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {product.category} · {formatCurrency(product.price)} each
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      {product.unitsSold} units
                    </div>
                    <div className="text-xs font-medium text-emerald-600">
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
