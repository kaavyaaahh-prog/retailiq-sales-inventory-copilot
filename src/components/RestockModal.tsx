import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, CheckCircle2, AlertTriangle, Truck, ShieldCheck } from 'lucide-react';
import { Product, PriorityLevel } from '../types';
import { formatCurrency } from '../utils/analysis';

interface RestockModalProps {
  product: Product | null;
  suggestedQty?: number;
  onClose: () => void;
  onSubmitRestock: (details: {
    productId: string;
    productName: string;
    currentStock: number;
    quantity: number;
    priority: PriorityLevel;
    supplier: string;
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
      currentStock: product.currentStock,
      quantity,
      priority,
      supplier,
    });
  };

  const estimatedTotalCost = quantity * product.price;

  return (
    <div
      id="restock-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="restock-modal-card"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Restock Request</h3>
              <p className="text-xs text-slate-400">Official Purchase Order Dispatch</p>
            </div>
          </div>
          <button
            id="btn-close-restock-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Exact requested fields: Product, Current Stock, Recommended Quantity, Priority) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Product
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-900">{product.name}</span>
                <span className="block text-xs text-slate-500">
                  {product.category} · Unit Price: {formatCurrency(product.price)}
                </span>
              </div>
              <span className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                {product.id}
              </span>
            </div>
          </div>

          {/* Current Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Current Stock
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span
                  id="restock-current-stock"
                  className={`text-base font-extrabold ${
                    product.currentStock <= product.reorderLevel ? 'text-rose-600' : 'text-slate-800'
                  }`}
                >
                  {product.currentStock} units
                </span>
                <span className="block text-[11px] text-slate-400">
                  Reorder mark: {product.reorderLevel}
                </span>
              </div>
            </div>

            {/* Recommended Quantity (Editable) */}
            <div>
              <label htmlFor="restock-quantity-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Recommended Quantity
              </label>
              <div className="relative">
                <input
                  id="restock-quantity-input"
                  type="number"
                  min="1"
                  max="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full p-2.5 text-base font-bold bg-white border border-blue-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  units
                </span>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="restock-priority-select" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Priority
            </label>
            <select
              id="restock-priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full p-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="urgent">🔴 Urgent (Same-day dispatch)</option>
              <option value="high">🟠 High (Next morning delivery)</option>
              <option value="medium">🟡 Medium (Standard 48hr cycle)</option>
              <option value="low">🟢 Low (Routine stock top-up)</option>
            </select>
          </div>

          {/* Supplier Info */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Supplier & Distributor
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <Truck className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold">{supplier}</span>
            </div>
          </div>

          {/* Cost Preview */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs flex items-center justify-between">
            <span className="text-slate-600 font-medium">Estimated PO Value:</span>
            <span className="text-sm font-extrabold text-blue-700">
              {formatCurrency(estimatedTotalCost)}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              id="btn-cancel-restock"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-submit-restock"
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Restock Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
