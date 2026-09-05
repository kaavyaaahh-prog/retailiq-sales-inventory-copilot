import React from 'react';
import {
  X,
  AlertTriangle,
  TrendingUp,
  Package,
  CheckCircle2,
  DollarSign,
  Truck,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ShoppingCart
} from 'lucide-react';
import { Product } from '../types';
import { analyzeProduct, formatCurrency } from '../utils/analysis';

interface ProductAnalysisModalProps {
  product: Product | null;
  onClose: () => void;
  onCreateRestockRequest: (product: Product, suggestedQty?: number) => void;
}

export const ProductAnalysisModal: React.FC<ProductAnalysisModalProps> = ({
  product,
  onClose,
  onCreateRestockRequest,
}) => {
  if (!product) return null;

  const analysis = analyzeProduct(product);

  const getHealthBadge = (health: typeof analysis.stockHealth) => {
    switch (health) {
      case 'CRITICAL':
      case 'OUT OF STOCK':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/80';
      case 'LOW':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'OVERSTOCK':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-800/80';
      case 'HEALTHY':
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
    }
  };

  const getDemandBadge = (demand: typeof analysis.salesPerformance) => {
    switch (demand) {
      case 'HIGH DEMAND':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80';
      case 'STEADY':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'MODERATE':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'SLOW MOVING':
      default:
        return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
    }
  };

  return (
    <div
      id="product-analysis-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="product-analysis-modal-card"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden text-slate-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                {product.category}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] font-mono text-slate-400">ID: {product.id}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold border ${getHealthBadge(
                analysis.stockHealth
              )}`}
            >
              Stock Status: {analysis.stockHealth}
            </span>
            <span
              className={`px-3 py-1 rounded-lg text-xs font-bold border ${getDemandBadge(
                analysis.salesPerformance
              )}`}
            >
              Velocity: {analysis.salesPerformance}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              Priority: {analysis.restockPriority}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Current Stock</span>
              <span className="text-base font-extrabold text-white font-mono">{product.currentStock} units</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Reorder Mark</span>
              <span className="text-base font-extrabold text-slate-300 font-mono">{product.reorderLevel} units</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Units Sold</span>
              <span className="text-base font-extrabold text-cyan-300 font-mono">{product.unitsSold} units</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Sales Revenue</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">{formatCurrency(product.revenue)}</span>
            </div>
          </div>

          {/* AI Diagnosis */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/20 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>AI Inventory Assessment</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {analysis.recommendation}
            </p>
          </div>

          {/* Supplier Info */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-400" />
              <span>Distributor: <strong className="text-white">{product.supplier}</strong></span>
            </div>
            <span className="text-slate-400 font-mono">Last restock: {product.lastRestockedDate}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onCreateRestockRequest(product, analysis.recommendedOrderQty);
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Create Restock ({analysis.recommendedOrderQty} units)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
