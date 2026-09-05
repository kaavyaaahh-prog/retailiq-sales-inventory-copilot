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
      className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="alerts-drawer-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Store Operational Alerts</h3>
              <p className="text-xs text-slate-500">Real-time inventory threshold violations</p>
            </div>
          </div>
          <button
            id="btn-close-alerts-drawer"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header */}
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">
            {unacknowledged.length} Pending Actions
          </span>
          {unacknowledged.length > 0 && (
            <button
              id="btn-acknowledge-all"
              onClick={onAcknowledgeAll}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Acknowledge All</span>
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="text-sm font-semibold text-slate-700">All alerts clear</p>
              <p className="text-xs text-slate-400">Inventory thresholds are healthy.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const product = products.find((p) => p.id === alert.productId);
              const isUrgent = alert.priority === 'urgent';
              const isHigh = alert.priority === 'high';
              const isWarning = alert.priority === 'warning';

              return (
                <div
                  key={alert.id}
                  id={`alert-item-${alert.id}`}
                  className={`p-4 rounded-2xl border transition-all ${
                    alert.acknowledged
                      ? 'bg-slate-50/70 border-slate-200 opacity-60'
                      : isUrgent
                      ? 'bg-rose-50/70 border-rose-200'
                      : isHigh
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-yellow-50/70 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="text-sm mt-0.5">
                        {isUrgent ? '🔴' : isHigh ? '🔴' : isWarning ? '🟡' : '🟠'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                              isUrgent
                                ? 'bg-rose-200 text-rose-900'
                                : isHigh
                                ? 'bg-amber-200 text-amber-900'
                                : 'bg-yellow-200 text-yellow-900'
                            }`}
                          >
                            {alert.priority}
                          </span>
                          <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">
                          {alert.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    {product ? (
                      <button
                        id={`btn-alert-review-${alert.id}`}
                        onClick={() => {
                          onSelectProduct(product);
                          onClose();
                        }}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                      >
                        Inspect Product
                      </button>
                    ) : (
                      <span></span>
                    )}

                    <div className="flex items-center gap-2">
                      {product && !alert.acknowledged && (
                        <button
                          id={`btn-alert-restock-${alert.id}`}
                          onClick={() => {
                            onRequestRestock(product);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 hover:bg-blue-600 text-white transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Restock</span>
                        </button>
                      )}

                      {!alert.acknowledged ? (
                        <button
                          id={`btn-acknowledge-${alert.id}`}
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Acknowledge</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500" /> Acknowledged
                        </span>
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
