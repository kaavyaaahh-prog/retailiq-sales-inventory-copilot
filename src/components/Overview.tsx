import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ShoppingCart,
  Plus,
  BarChart3,
  Bot,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  ClipboardList
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
import { Product, DailySalesRecord, RestockRequest, ActiveSection } from '../types';
import { STORE_INFO } from '../data/mockData';
import { formatCurrency, analyzeProduct } from '../utils/analysis';

interface OverviewProps {
  products: Product[];
  salesTrend: DailySalesRecord[];
  restockRequests: RestockRequest[];
  onSelectProduct: (product: Product) => void;
  onNavigateToSection: (section: ActiveSection) => void;
  onRequestRestock: (product: Product, suggestedQty?: number) => void;
  onOpenAddProduct: () => void;
  onUpdateRestockStatus: (id: string, status: 'Pending' | 'Approved' | 'Completed') => void;
}

export const Overview: React.FC<OverviewProps> = ({
  products,
  salesTrend,
  restockRequests,
  onSelectProduct,
  onNavigateToSection,
  onRequestRestock,
  onOpenAddProduct,
  onUpdateRestockStatus,
}) => {
  const [chartMetric, setChartMetric] = useState<'revenue' | 'units' | 'orders'>('revenue');

  // Key KPI products
  const cookingOil = products.find((p) => p.name.toLowerCase().includes('cooking oil')) || products[0];
  const bread = products.find((p) => p.name.toLowerCase().includes('bread')) || products[products.length - 1];
  const rice = products.find((p) => p.name.toLowerCase().includes('rice') && !p.name.includes('Basmati')) || products[1];

  // Top selling products sorted by units sold
  const topSellers = [...products].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);
  const maxUnitsSold = Math.max(...topSellers.map((p) => p.unitsSold), 1);

  // Filter products for Inventory Alerts section (Critical, Low, Normal)
  const alertProducts = products
    .filter((p) => p.currentStock <= p.reorderLevel * 1.5 || p.currentStock === 0)
    .slice(0, 6);

  const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.reorderLevel).length;
  const outOfStockCount = products.filter((p) => p.currentStock === 0).length;

  return (
    <div id="overview-dashboard" className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. HACKATHON WORKFLOW STORYLINE BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/90 to-cyan-950/40 border border-cyan-500/20 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                Decision Intelligence Pipeline
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-white">
                Hackathon Operational Storyline
              </h2>
            </div>
          </div>

          {/* Stepper indicator */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              1. Sales Data
            </span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/60 font-medium">
              2. Risk Detected
            </span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-medium">
              3. AI Diagnosis
            </span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-medium">
              4. Recommendation
            </span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              5. Restock Request
            </span>
          </div>
        </div>
      </div>

      {/* 2. TOP WELCOME & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Store Manager Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Analyzing {products.length} product lines, velocity spikes, and automated replenishment recommendations.
          </p>
        </div>

        {/* 8. QUICK ACTIONS (Attractive buttons requested in Prompt #8) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-quick-add-product"
            onClick={onOpenAddProduct}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Product</span>
          </button>

          <button
            id="btn-quick-create-restock"
            onClick={() => onRequestRestock(cookingOil, 50)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Create Restock Request</span>
          </button>

          <button
            id="btn-quick-view-sales"
            onClick={() => onNavigateToSection('sales')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span>View Sales</span>
          </button>

          <button
            id="btn-quick-ask-copilot"
            onClick={() => onNavigateToSection('copilot')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-950/80 hover:bg-indigo-900/80 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ask AI Copilot</span>
          </button>
        </div>
      </div>

      {/* 3. KPI CARDS (Prompt #3: Today's Revenue, Total Sales, Units Sold, Low Stock Items, Out of Stock Items) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Today's Revenue */}
        <div
          id="kpi-todays-revenue"
          className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Today's Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {STORE_INFO.kpis.todayRevenue}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2%
            </span>
            <span className="text-slate-500">vs yesterday</span>
          </div>
        </div>

        {/* Card 2: Total Sales */}
        <div
          id="kpi-total-sales"
          className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 hover:border-blue-500/40 transition-all duration-300 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Sales
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {STORE_INFO.kpis.totalSales}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +11.8%
            </span>
            <span className="text-slate-500">7-day pacing</span>
          </div>
        </div>

        {/* Card 3: Units Sold */}
        <div
          id="kpi-units-sold"
          className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Units Sold
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {STORE_INFO.kpis.unitsSold}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +8.5%
            </span>
            <span className="text-slate-500">24h volume</span>
          </div>
        </div>

        {/* Card 4: Low Stock Items */}
        <div
          id="kpi-low-stock-items"
          className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 shadow-lg group cursor-pointer"
          onClick={() => onNavigateToSection('inventory')}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Low Stock Items
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 tracking-tight">
            {lowStockCount || STORE_INFO.kpis.lowStockItems}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span className="font-bold text-amber-400 flex items-center gap-0.5">
              Action Required
            </span>
            <span className="text-slate-500">near reorder mark</span>
          </div>
        </div>

        {/* Card 5: Out of Stock Items */}
        <div
          id="kpi-out-of-stock-items"
          className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 hover:border-rose-500/40 transition-all duration-300 shadow-lg group cursor-pointer"
          onClick={() => onNavigateToSection('inventory')}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Out of Stock
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 tracking-tight">
            {outOfStockCount || STORE_INFO.kpis.outOfStockItems}
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span className="font-bold text-rose-400 flex items-center gap-0.5">
              Stockout Hazard
            </span>
            <span className="text-slate-500">immediate replenishment</span>
          </div>
        </div>
      </div>

      {/* 4 & 6: LARGE SALES ANALYTICS CHART & AI INSIGHTS CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 4. SALES ANALYTICS (Interactive Chart: 7-Day Revenue, Trend, Hover Tooltip, Cyan/Blue Gradient) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  7-Day Sales Analytics
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Hover over days to inspect volume velocity and order density.
              </p>
            </div>

            {/* Metric Selector Tabs */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
              <button
                id="btn-metric-revenue"
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartMetric === 'revenue'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Revenue
              </button>
              <button
                id="btn-metric-units"
                onClick={() => setChartMetric('units')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartMetric === 'units'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Units Sold
              </button>
              <button
                id="btn-metric-orders"
                onClick={() => setChartMetric('orders')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  chartMetric === 'orders'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          {/* Area Chart with Cyan/Blue Gradient */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanBlueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(val) => (chartMetric === 'revenue' ? `₹${val / 1000}k` : `${val}`)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailySalesRecord;
                      return (
                        <div className="p-3.5 bg-slate-900/95 backdrop-blur-md rounded-xl border border-cyan-500/40 shadow-2xl text-xs space-y-1">
                          <p className="font-extrabold text-white border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
                            <span>{data.day} Analytics</span>
                            <span className="text-cyan-400 font-mono">Live</span>
                          </p>
                          <div className="text-slate-300 flex justify-between gap-4 pt-1">
                            <span>Revenue:</span>
                            <strong className="text-cyan-300 font-bold">{formatCurrency(data.revenue)}</strong>
                          </div>
                          <div className="text-slate-300 flex justify-between gap-4">
                            <span>Units Sold:</span>
                            <strong className="text-white font-bold">{data.units} units</strong>
                          </div>
                          <div className="text-slate-300 flex justify-between gap-4">
                            <span>Store Orders:</span>
                            <strong className="text-white font-bold">{data.orders}</strong>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={chartMetric}
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#cyanBlueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Peak Sales Window: <strong>Saturday Evening (₹23,800)</strong>
            </span>
            <button
              onClick={() => onNavigateToSection('sales')}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed Breakdown</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6. AI INSIGHTS CARD (Prompt #6: Attractive card, recommendation, expected demand, order qty, buttons) */}
        <div
          id="card-ai-insights"
          className="p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/90 to-indigo-950/40 backdrop-blur-xl border border-cyan-500/30 shadow-xl flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            {/* Header with AI indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider">
                    AI Inventory Insight
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">Continuous Velocity Scan</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                High Confidence
              </span>
            </div>

            {/* Example prompt insight: "Whole Wheat Bread is selling 23% faster than usual." */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3 mb-4">
              <div className="text-sm font-extrabold text-white leading-snug">
                "{bread.name} is selling <span className="text-cyan-400">23% faster</span> than normal run-rate."
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Increased breakfast grocery shopping trends indicate stockout risk within 18 hours unless replenished.
              </p>
            </div>

            {/* Metrics: Expected Demand & Recommended Order Quantity */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Expected Demand
                </span>
                <span className="text-base font-extrabold text-cyan-300">
                  +110 units
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">through weekend</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Recommended Order
                </span>
                <span className="text-base font-extrabold text-emerald-400">
                  50 units
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">Supplier: {bread.supplier}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: [ Create Restock Request ] [ View Details ] */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <button
              id="btn-ai-insight-create-restock"
              onClick={() => onRequestRestock(bread, 50)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Create Restock Request</span>
            </button>
            <button
              id="btn-ai-insight-view-details"
              onClick={() => onSelectProduct(bread)}
              className="w-full py-2 px-4 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/60"
            >
              <span>View Product Details</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. INVENTORY ALERTS (Prominent section requested in Prompt #5) */}
      <div className="p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Inventory Alerts
              </h3>
              <p className="text-xs text-slate-400">
                Products nearing or past safe inventory buffer limits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800/60 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> RED = Critical / Restock Now
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800/60 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> ORANGE = Low Stock
            </span>
          </div>
        </div>

        {/* Alerts Grid / Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Product Name</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4">Status Badge</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {alertProducts.map((product) => {
                const analysis = analyzeProduct(product);
                const isCritical = product.currentStock === 0 || product.currentStock <= product.reorderLevel * 0.4;
                const isLow = !isCritical && product.currentStock <= product.reorderLevel;

                return (
                  <tr
                    key={product.id}
                    id={`inventory-alert-row-${product.id}`}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {isCritical ? '🔴' : isLow ? '🟠' : '🟢'}
                        </span>
                        <div>
                          <div
                            onClick={() => onSelectProduct(product)}
                            className="hover:text-cyan-400 transition-colors cursor-pointer"
                          >
                            {product.name}
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {product.category} · {formatCurrency(product.price)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`font-bold ${
                          product.currentStock === 0
                            ? 'text-rose-400'
                            : product.currentStock <= product.reorderLevel
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {product.currentStock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {product.reorderLevel} units
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {product.unitsSold}
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Exact badges: RED = Critical / Restock Now, ORANGE = Low Stock, GREEN = Healthy */}
                      {isCritical ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-rose-950/90 text-rose-300 border border-rose-800/80">
                          Critical / Restock Now
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-amber-950/90 text-amber-300 border border-amber-800/80">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-800/80">
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isCritical ? (
                        <button
                          id={`btn-restock-now-${product.id}`}
                          onClick={() => onRequestRestock(product, Math.max(30, product.reorderLevel * 2))}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Restock Now</span>
                        </button>
                      ) : (
                        <button
                          id={`btn-inspect-alert-${product.id}`}
                          onClick={() => onSelectProduct(product)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7 & 10: TOP SELLING PRODUCTS & RESTOCK REQUEST STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7. TOP SELLING PRODUCTS (Product name, Units sold, Revenue, Sales percentage/progress bar) */}
        <div className="p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Top Selling Products
              </h3>
            </div>
            <button
              onClick={() => onNavigateToSection('sales')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View Leaderboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {topSellers.map((item, index) => {
              const percentage = Math.round((item.unitsSold / maxUnitsSold) * 100);
              return (
                <div
                  key={item.id}
                  id={`top-seller-${item.id}`}
                  className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 font-mono text-[10px] font-bold flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <span
                        onClick={() => onSelectProduct(item)}
                        className="font-bold text-white hover:text-cyan-400 transition-colors cursor-pointer"
                      >
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400">({item.category})</span>
                    </div>
                    <div className="text-right font-mono">
                      <strong className="text-cyan-400">{item.unitsSold} sold</strong>
                      <span className="text-slate-400 text-[11px] ml-2 font-normal">
                        ({formatCurrency(item.revenue)})
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 10. RESTOCK REQUEST STATUS (Recent requests: Product, Quantity, Request date, Status with Badges: Pending/Approved/Completed) */}
        <div className="p-6 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ClipboardList className="w-4 h-4" />
              </span>
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Restock Request Status
              </h3>
            </div>
            <button
              onClick={() => onNavigateToSection('restock_requests')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All ({restockRequests.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table / List */}
          <div className="space-y-3">
            {restockRequests.slice(0, 4).map((req) => (
              <div
                key={req.id}
                id={`restock-status-card-${req.id}`}
                className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{req.productName}</span>
                    <span className="text-[10px] font-mono text-slate-400">PO: {req.id}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Qty: <strong className="text-cyan-300">{req.quantity} units</strong> · {req.createdAt}
                  </div>
                </div>

                {/* Status Badges: Pending / Approved / Completed */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                      req.status === 'Pending'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : req.status === 'Approved'
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    }`}
                  >
                    {req.status}
                  </span>

                  {/* Interactive toggle for hackathon demo */}
                  {req.status === 'Pending' && (
                    <button
                      onClick={() => onUpdateRestockStatus(req.id, 'Approved')}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
                    >
                      Approve
                    </button>
                  )}
                  {req.status === 'Approved' && (
                    <button
                      onClick={() => onUpdateRestockStatus(req.id, 'Completed')}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
