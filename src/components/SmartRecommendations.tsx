import React, { useState } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Filter,
  ShoppingCart,
  TrendingUp,
  Eye
} from 'lucide-react';
import { Product, RecommendationCard } from '../types';
import { generateSmartRecommendations, formatCurrency } from '../utils/analysis';

interface SmartRecommendationsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onRequestRestock: (product: Product, suggestedQty?: number) => void;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  products,
  onSelectProduct,
  onRequestRestock,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'RESTOCK NOW' | 'RESTOCK SOON' | 'MONITOR'>('ALL');

  const recommendations = generateSmartRecommendations(products);

  const filteredRecs = filterType === 'ALL'
    ? recommendations
    : recommendations.filter((r) => r.type === filterType);

  const restockNowCount = recommendations.filter((r) => r.type === 'RESTOCK NOW').length;
  const restockSoonCount = recommendations.filter((r) => r.type === 'RESTOCK SOON').length;
  const monitorCount = recommendations.filter((r) => r.type === 'MONITOR').length;

  return (
    <div id="smart-recommendations-screen" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Lightbulb className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Smart Recommendations
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rule-based decision intelligence continuously calculating demand surges and stockout risks.
          </p>
        </div>

        {/* Action Counters */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1.5 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-800/60 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            {restockNowCount} Urgent
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            {restockSoonCount} Reorder Soon
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-yellow-950/80 text-yellow-300 border border-yellow-800/60 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            {monitorCount} Overstocked
          </span>
        </div>
      </div>

      {/* Rules Engine Explanation Banner */}
      <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/90 to-indigo-950/50 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Rule-Based Decision Logic Matrix
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">RetailIQ Rule Engine v2.4</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="font-mono text-rose-400 font-bold block text-[11px]">RULE 1: stock = 0</span>
            <span className="text-slate-300 text-[11px]">→ OUT OF STOCK (Urgent Restock)</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="font-mono text-amber-400 font-bold block text-[11px]">RULE 2: stock &lt;= reorder + high sales</span>
            <span className="text-slate-300 text-[11px]">→ HIGH PRIORITY RESTOCK</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="font-mono text-yellow-400 font-bold block text-[11px]">RULE 3: stock &gt; reorder + low sales</span>
            <span className="text-slate-300 text-[11px]">→ OVERSTOCK / MONITOR</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="font-mono text-emerald-400 font-bold block text-[11px]">RULE 4: regular buffer</span>
            <span className="text-slate-300 text-[11px]">→ NORMAL SAFE STATUS</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
        </span>
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            filterType === 'ALL'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
              : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
          }`}
        >
          All ({recommendations.length})
        </button>
        <button
          onClick={() => setFilterType('RESTOCK NOW')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            filterType === 'RESTOCK NOW'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-800/80 text-rose-300 hover:bg-rose-950/40 border border-rose-900/60'
          }`}
        >
          <span>🔴 Restock Now</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 text-[10px]">
            {restockNowCount}
          </span>
        </button>
        <button
          onClick={() => setFilterType('RESTOCK SOON')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            filterType === 'RESTOCK SOON'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-800/80 text-amber-300 hover:bg-amber-950/40 border border-amber-900/60'
          }`}
        >
          <span>🟠 Restock Soon</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 text-[10px]">
            {restockSoonCount}
          </span>
        </button>
        <button
          onClick={() => setFilterType('MONITOR')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            filterType === 'MONITOR'
              ? 'bg-yellow-600 text-white shadow-sm'
              : 'bg-slate-800/80 text-yellow-300 hover:bg-yellow-950/40 border border-yellow-900/60'
          }`}
        >
          <span>🟡 Monitor</span>
          <span className="px-1.5 py-0.2 rounded-full bg-yellow-950 text-yellow-300 text-[10px]">
            {monitorCount}
          </span>
        </button>
      </div>

      {/* Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecs.map((card) => {
          const isUrgent = card.type === 'RESTOCK NOW';
          const isSoon = card.type === 'RESTOCK SOON';
          const isMonitor = card.type === 'MONITOR';

          return (
            <div
              key={card.id}
              id={`rec-card-${card.product.id}`}
              className={`rounded-3xl border bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between transition-all hover:scale-[1.01] ${
                isUrgent
                  ? 'border-rose-500/40 shadow-rose-500/5'
                  : isSoon
                  ? 'border-amber-500/40 shadow-amber-500/5'
                  : 'border-yellow-500/30 shadow-yellow-500/5'
              }`}
            >
              <div>
                {/* Urgency Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {isUrgent ? '🔴' : isSoon ? '🟠' : '🟡'}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md ${
                        isUrgent
                          ? 'bg-rose-950/90 text-rose-300 border border-rose-800/80'
                          : isSoon
                          ? 'bg-amber-950/90 text-amber-300 border border-amber-800/80'
                          : 'bg-yellow-950/90 text-yellow-300 border border-yellow-800/80'
                      }`}
                    >
                      {card.type}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {card.product.category}
                  </span>
                </div>

                {/* Product Title */}
                <h3
                  onClick={() => onSelectProduct(card.product)}
                  className="text-lg font-bold text-white hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {card.product.name}
                </h3>

                {/* Stock Stats */}
                <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
                  <div className="font-bold text-white">
                    {card.product.currentStock === 0 ? (
                      <span className="text-rose-400 font-extrabold">0 units remaining</span>
                    ) : (
                      <span>Only {card.product.currentStock} units remaining.</span>
                    )}
                  </div>
                  <div className="text-slate-300">
                    {card.product.unitsSold} units sold.
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Reorder threshold: {card.product.reorderLevel} units · Price: {formatCurrency(card.product.price)}
                  </div>
                </div>

                {/* Reason Section */}
                <div className="mt-4 space-y-1 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Reason:
                  </span>
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {card.reason}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => onSelectProduct(card.product)}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Health</span>
                </button>

                {isMonitor ? (
                  <button
                    onClick={() => onSelectProduct(card.product)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-300 border border-yellow-600/50 transition-colors cursor-pointer"
                  >
                    MONITOR
                  </button>
                ) : (
                  <button
                    onClick={() => onRequestRestock(card.product, card.suggestedQty)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                      isUrgent
                        ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                        : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{card.actionText}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
