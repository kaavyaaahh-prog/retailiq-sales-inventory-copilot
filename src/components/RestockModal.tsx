import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, CheckCircle2, AlertTriangle, Truck, ShieldCheck, DollarSign } from 'lucide-react';
import { Product, PriorityLevel, Category } from '../types';
import { formatCurrency } from '../utils/analysis';

interface RestockModalProps {
  product: Product | null;
  suggestedQty?: number;
  onClose: () => void;
  onSubmitRestock: (details: {
    productId: string;
    productName: string;
    category?: Category;
    currentStock: number;
    quantity: number;
    priority: PriorityLevel;
    supplier: string;
    estimatedCost?: number;
  }) => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  product,
  suggestedQty,
  onClose,
  onSubmitRestock,
}) => {
  if (!product) return null;

  const defaultQty = suggestedQty || (product.name.includes('Cooking Oil') ? 50 : Math.max(20, product.reorderLevel * 2));
  const [quantity, setQuantity] = useState<number>(defaultQty);
  const [priority, setPriority] = useState<PriorityLevel>(
    product.currentStock <= product.reorderLevel * 0.4 ? 'urgent' : 'high'
  );
  const [supplier, setSupplier] = useState<string>(product.supplier || 'Primary Supplier');
  const [notes, setNotes] = useState<string>('Standard morning replenishment run.');

  useEffect(() => {
    if (suggestedQty) {
      setQuantity(suggestedQty);
    }
  }, [suggestedQty]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRestock({
      productId: product.id,
      productName: product.name,
      category: product.category,
      currentStock: product.currentStock,
      quantity,
      priority,
      supplier,
      estimatedCost: quantity * product.price,
    });
  };

  const estimatedTotalCost = quantity * product.price;

  return (
    <div
      id="restock-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="restock-modal-card"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden text-slate-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Create Purchase Order</h3>
              <p className="text-xs text-slate-400">Step 5: Manager Dispatches Replenishment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Product Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-sm">{product.name}</span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {product.category}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Current In-Store:</span>
              <strong
                className={`font-mono ${
                  product.currentStock <= product.reorderLevel ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {product.currentStock} units
              </strong>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Reorder Baseline:</span>
              <span className="font-mono">{product.reorderLevel} units</span>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-300 uppercase tracking-wider">
                Restock Quantity (Units)
              </label>
              {suggestedQty && (
                <span className="text-[10px] font-bold text-cyan-400 font-mono">
                  ★ AI Suggested: {suggestedQty}
                </span>
              )}
            </div>
            <input
              type="number"
              min="1"
              max="500"
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 text-sm font-mono"
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Priority Urgency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['urgent', 'high', 'medium'] as PriorityLevel[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                    priority === p
                      ? p === 'urgent'
                        ? 'bg-rose-600 text-white shadow-md'
                        : p === 'high'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Supplier Input */}
          <div>
            <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1">
              Distributor / Vendor
            </label>
            <div className="relative">
              <Truck className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 text-xs font-medium"
              />
            </div>
          </div>

          {/* Financial Calculation */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Estimated PO Value:</span>
            <span className="text-base font-extrabold text-cyan-300 font-mono">
              {formatCurrency(estimatedTotalCost)}
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Dispatch PO</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
