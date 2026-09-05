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
  ShieldAlert
} from 'lucide-react';
import { Product } from '../types';
import { analyzeProduct, formatCurrency } from '../utils/analysis';

interface ProductAnalysisModalProps {
  product: Product | null;
  onClose: () => void;
  onCreateRestockRequest: (product: Product) => void;
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
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'LOW':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'OVERSTOCK':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'HEALTHY':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const getDemandBadge = (demand: typeof analysis.salesPerformance) => {
    switch (demand) {
      case 'HIGH DEMAND':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'STEADY':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'MODERATE':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'SLOW MOVING':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const getPriorityBadge = (priority: typeof analysis.restockPriority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-600 text-white shadow-xs';
      case 'HIGH':
        return 'bg-amber-500 text-white';
      case 'MEDIUM':
        return 'bg-slate-300 text-slate-800';
      case 'MONITOR':
        return 'bg-yellow-500 text-white';
      case 'LOW':
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div
      id="product-analysis-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="product-analysis-modal"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {product.category}
              </span>
              <span className="text-xs text-slate-400">ID: {product.id}</span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mt-1">
              {product.name}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Automated Inventory Health & Velocity Diagnostic
            </p>
          </div>
          <button
            id="btn-close-analysis-modal"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Key Metric Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Price
              </span>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {formatCurrency(product.price)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Current Inventory
              </span>
              <div
                className={`text-lg font-bold mt-1 ${
                  product.currentStock <= product.reorderLevel ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {product.currentStock} units
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Reorder Level
              </span>
              <div className="text-lg font-bold text-slate-700 mt-1 font-mono">
                {product.reorderLevel} units
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Units Sold
              </span>
              <div className="text-lg font-bold text-indigo-700 mt-1">
                {product.unitsSold} units
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="text-lg font-bold text-emerald-700 mt-1">
                {formatCurrency(product.revenue)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Run-Rate Buffer
              </span>
              <div className="text-lg font-bold text-slate-800 mt-1">
                ~{analysis.daysOfInventoryLeft} days left
              </div>
            </div>
          </div>

          {/* Core Calculations Section */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Algorithmic Diagnostic
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Stock Health */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Stock Health</span>
                <span
                  id="diag-stock-health"
                  className={`mt-2 inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-black tracking-wide border ${getHealthBadge(
                    analysis.stockHealth
                  )}`}
                >
                  {analysis.stockHealth}
                </span>
              </div>

              {/* Sales Performance */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Sales Performance</span>
                <span
                  id="diag-sales-performance"
                  className={`mt-2 inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-black tracking-wide border ${getDemandBadge(
                    analysis.salesPerformance
                  )}`}
                >
                  {analysis.salesPerformance}
                </span>
              </div>

              {/* Restock Priority */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Restock Priority</span>
                <span
                  id="diag-restock-priority"
                  className={`mt-2 inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-black tracking-wide ${getPriorityBadge(
                    analysis.restockPriority
                  )}`}
                >
                  {analysis.restockPriority}
                </span>
              </div>
            </div>
          </div>

          {/* AI Recommendation Box */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-slate-900 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Copilot Recommendation</span>
            </div>
            <p id="analysis-recommendation-text" className="text-sm font-semibold text-slate-800 leading-relaxed">
              "{analysis.recommendation}"
            </p>
            <div className="text-xs text-blue-700 pt-1 flex items-center gap-2">
              <span>Primary Supplier: <strong>{product.supplier}</strong></span>
              <span>·</span>
              <span>Suggested Order Qty: <strong>{analysis.recommendedOrderQty} units</strong></span>
            </div>
          </div>

          {/* Restock Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="btn-cancel-analysis"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              id="btn-create-restock-request"
              onClick={() => {
                onCreateRestockRequest(product);
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Create Restock Request</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
