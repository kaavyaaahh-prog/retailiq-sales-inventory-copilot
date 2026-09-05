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
  TrendingUp
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
    <div id="smart-recommendations-screen" className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Lightbulb className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Smart Recommendations
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Algorithmic inventory rules continuously evaluating velocity, threshold gaps, and stockout hazards.
          </p>
        </div>

        {/* Action Counters */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            {restockNowCount} Urgent
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {restockSoonCount} Reorder Soon
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            {monitorCount} Overstocked
          </span>
        </div>
      </div>

      {/* Rules Engine Explanation Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-200 p-5 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Rules-Based Decision Engine Active
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Algorithm v2.4</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="font-mono text-rose-400 font-bold block text-[11px]">RULE 1: stock = 0</span>
            <span className="text-slate-300">→ OUT OF STOCK (Urgent Restock)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="font-mono text-amber-400 font-bold block text-[11px]">RULE 2: stock &lt;= reorder + high sales</span>
            <span className="text-slate-300">→ HIGH PRIORITY RESTOCK</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="font-mono text-yellow-400 font-bold block text-[11px]">RULE 3: stock &gt; reorder + low sales</span>
            <span className="text-slate-300">→ OVERSTOCK / MONITOR</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="font-mono text-emerald-400 font-bold block text-[11px]">RULE 4: regular buffer</span>
            <span className="text-slate-300">→ NORMAL SAFE STATUS</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-semibold text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        <button
          id="rec-filter-all"
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filterType === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All ({recommendations.length})
        </button>
        <button
          id="rec-filter-restock-now"
          onClick={() => setFilterType('RESTOCK NOW')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            filterType === 'RESTOCK NOW'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <span>🔴 Restock Now</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px]">
            {restockNowCount}
          </span>
        </button>
        <button
          id="rec-filter-restock-soon"
          onClick={() => setFilterType('RESTOCK SOON')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            filterType === 'RESTOCK SOON'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <span>🟠 Restock Soon</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
            {restockSoonCount}
          </span>
        </button>
        <button
          id="rec-filter-monitor"
          onClick={() => setFilterType('MONITOR')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            filterType === 'MONITOR'
              ? 'bg-yellow-600 text-white shadow-xs'
              : 'bg-white text-yellow-800 hover:bg-yellow-50 border border-yellow-200'
          }`}
        >
          <span>🟡 Monitor</span>
          <span className="px-1.5 py-0.2 rounded-full bg-yellow-100 text-yellow-800 text-[10px]">
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
              className={`rounded-2xl border bg-white p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                isUrgent
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isSoon
                  ? 'border-amber-300'
                  : 'border-yellow-200 bg-yellow-50/20'
              }`}
            >
              <div>
                {/* Urgency Badge (Matches Prompt: 🔴 RESTOCK NOW, 🟠 RESTOCK SOON, 🟡 MONITOR) */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {isUrgent ? '🔴' : isSoon ? '🟠' : '🟡'}
                    </span>
                    <span
                      className={`text-xs font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-md ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isSoon
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
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
                  className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {card.product.name}
                </h3>

                {/* Stock Stats */}
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-xs font-semibold text-slate-800">
                    {card.product.currentStock === 0 ? (
                      <span className="text-rose-600 font-bold">0 units remaining</span>
                    ) : (
                      <span>Only {card.product.currentStock} units remaining.</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600">
                    {card.product.unitsSold} units sold.
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Reorder threshold: {card.product.reorderLevel} units
                  </div>
                </div>

                {/* Reason Section */}
                <div className="mt-4 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Reason:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {card.reason}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  id={`btn-rec-details-${card.product.id}`}
                  onClick={() => onSelectProduct(card.product)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  View Health
                </button>

                {isMonitor ? (
                  <button
                    id={`btn-rec-action-${card.product.id}`}
                    onClick={() => onSelectProduct(card.product)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-yellow-600 hover:bg-yellow-700 text-white transition-colors cursor-pointer"
                  >
                    MONITOR
                  </button>
                ) : (
                  <button
                    id={`btn-rec-action-${card.product.id}`}
                    onClick={() => onRequestRestock(card.product, card.suggestedQty)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ${
                      isUrgent
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-amber-600 hover:bg-amber-700'
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
