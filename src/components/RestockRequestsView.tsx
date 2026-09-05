import React, { useState } from 'react';
import {
  ClipboardList,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Search,
  ShoppingCart
} from 'lucide-react';
import { RestockRequest, Product } from '../types';
import { formatCurrency } from '../utils/analysis';

interface RestockRequestsViewProps {
  requests: RestockRequest[];
  products: Product[];
  onRequestRestock: (product: Product, suggestedQty?: number) => void;
  onUpdateStatus: (id: string, status: 'Pending' | 'Approved' | 'Completed') => void;
}

export const RestockRequestsView: React.FC<RestockRequestsViewProps> = ({
  requests,
  products,
  onRequestRestock,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'Pending' | 'Approved' | 'Completed'>('ALL');
  const [search, setSearch] = useState('');

  const filteredRequests = requests.filter((r) => {
    const matchesFilter = filter === 'ALL' || r.status === filter;
    const matchesSearch =
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.supplier.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;
  const completedCount = requests.filter((r) => r.status === 'Completed').length;
  const totalValue = requests.reduce((acc, r) => acc + (r.estimatedCost || 0), 0);

  return (
    <div id="restock-requests-screen" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ClipboardList className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Restock Purchase Orders
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track, dispatch, and approve replenishment orders with distributor networks.
          </p>
        </div>

        <button
          onClick={() => onRequestRestock(products[0])}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Restock Request</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total PO Volume</span>
          <div className="text-xl font-extrabold text-white mt-1">{requests.length} Orders</div>
          <span className="text-[11px] text-slate-500">Value: {formatCurrency(totalValue)}</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl">
          <span className="text-[11px] font-bold uppercase text-amber-400">Pending Review</span>
          <div className="text-xl font-extrabold text-amber-400 mt-1">{pendingCount} Orders</div>
          <span className="text-[11px] text-slate-500">Awaiting manager signoff</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl">
          <span className="text-[11px] font-bold uppercase text-cyan-400">Approved & En Route</span>
          <div className="text-xl font-extrabold text-cyan-400 mt-1">{approvedCount} Orders</div>
          <span className="text-[11px] text-slate-500">Supplier dispatch confirmed</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl">
          <span className="text-[11px] font-bold uppercase text-emerald-400">Completed / Received</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">{completedCount} Orders</div>
          <span className="text-[11px] text-slate-500">Restocked into inventory</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'Pending', 'Approved', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab === 'ALL' ? `All Requests (${requests.length})` : `${tab} (${requests.filter((r) => r.status === tab).length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PO number, item, supplier..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">PO Number</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Order Quantity</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Request Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                    {req.id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    <div>{req.productName}</div>
                    <span className="text-[10px] text-slate-400 font-normal">{req.category}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {req.currentStock} units
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {req.quantity} units
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        req.priority === 'urgent'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          : req.priority === 'high'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {req.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {req.supplier}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {req.createdAt}
                  </td>
                  <td className="py-3.5 px-4">
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
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {req.status === 'Pending' && (
                      <button
                        onClick={() => onUpdateStatus(req.id, 'Approved')}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors cursor-pointer"
                      >
                        Approve PO
                      </button>
                    )}
                    {req.status === 'Approved' && (
                      <button
                        onClick={() => onUpdateStatus(req.id, 'Completed')}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                      >
                        Mark Received
                      </button>
                    )}
                    {req.status === 'Completed' && (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Stocked
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
