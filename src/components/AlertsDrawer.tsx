import React from 'react';
import { X, Bell, Check, CheckCheck, AlertTriangle, AlertCircle, ShoppingCart, CheckCircle2 } from 'lucide-react';
import { AlertNotification, Product } from '../types';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertNotification[];
  products: Product[];
  onAcknowledgeAlert: (id: string) => void;
  onAcknowledgeAll: () => void;
  onSelectProduct: (product: Product) => void;
  onRequestRestock: (product: Product) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  products,
  onAcknowledgeAlert,
  onAcknowledgeAll,
  onSelectProduct,
  onRequestRestock,
}) => {
  if (!isOpen) return null;

  const unacknowledged = alerts.filter((a) => !a.acknowledged);

  return (
    <div
      id="alerts-drawer-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="alerts-drawer-panel"
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Store Operational Alerts</h3>
              <p className="text-xs text-slate-400">Inventory threshold violations</p>
            </div>
          </div>
          <button
            id="btn-close-alerts-drawer"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">
            {unacknowledged.length} Pending Actions
          </span>
          {unacknowledged.length > 0 && (
            <button
              onClick={onAcknowledgeAll}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Dismiss All</span>
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
              <p className="text-sm font-bold text-white">No active inventory alerts</p>
              <p className="text-xs">All product lines are within target safety parameters.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const matchedProduct = products.find((p) => p.id === alert.productId);
              const isCritical = alert.type === 'critical';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all text-xs space-y-2.5 ${
                    alert.acknowledged
                      ? 'bg-slate-800/20 border-slate-800 opacity-60'
                      : isCritical
                      ? 'bg-rose-950/30 border-rose-800/60 shadow-xs'
                      : 'bg-amber-950/30 border-amber-800/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {isCritical ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider ${
                          isCritical ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {alert.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {alert.timestamp}
                    </span>
                  </div>

                  <p className="text-slate-200 leading-relaxed font-medium">
                    {alert.message}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    {matchedProduct ? (
                      <button
                        onClick={() => {
                          onClose();
                          onSelectProduct(matchedProduct);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
                      >
                        Inspect Product →
                      </button>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-2">
                      {matchedProduct && (
                        <button
                          onClick={() => {
                            onClose();
                            onRequestRestock(matchedProduct);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Restock</span>
                        </button>
                      )}

                      {!alert.acknowledged && (
                        <button
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Acknowledge alert"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
