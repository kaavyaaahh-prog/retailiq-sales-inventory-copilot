import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Overview } from './components/Overview';
import { Inventory } from './components/Inventory';
import { SalesAnalytics } from './components/SalesAnalytics';
import { SmartRecommendations } from './components/SmartRecommendations';
import { AICopilot } from './components/AICopilot';
import { FloatingCopilotPanel } from './components/FloatingCopilotPanel';
import { RestockRequestsView } from './components/RestockRequestsView';
import { SettingsView } from './components/SettingsView';
import { ProductAnalysisModal } from './components/ProductAnalysisModal';
import { RestockModal } from './components/RestockModal';
import { AddProductModal } from './components/AddProductModal';
import { AlertsDrawer } from './components/AlertsDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { HackathonDemoGuide, DEMO_STEPS } from './components/HackathonDemoGuide';
import { INITIAL_PRODUCTS, SALES_TREND_DAYS, INITIAL_ALERTS, INITIAL_RESTOCK_REQUESTS } from './data/mockData';
import { Product, AlertNotification, PriorityLevel, RestockRequest, ActiveSection, Category } from './types';
import { generateSmartRecommendations } from './utils/analysis';
import { Bot } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>(INITIAL_RESTOCK_REQUESTS);
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');

  // Modals & Drawers
  const [selectedProductForAnalysis, setSelectedProductForAnalysis] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [suggestedRestockQty, setSuggestedRestockQty] = useState<number | undefined>(undefined);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState<boolean>(false);
  const [isCopilotPanelOpen, setIsCopilotPanelOpen] = useState<boolean>(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);

  // Notifications Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hackathon Demo Flow State
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [demoStepIndex, setDemoStepIndex] = useState<number>(0);

  // Show toast utility
  const showToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      description,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Restock action trigger
  const handleOpenRestockModal = (product: Product, suggestedQty?: number) => {
    setRestockProduct(product);
    setSuggestedRestockQty(suggestedQty);
  };

  // Submit Restock Request (Matches prompt specification: "Restock request created successfully.")
  const handleSubmitRestockRequest = (details: {
    productId: string;
    productName: string;
    category?: Category;
    currentStock: number;
    quantity: number;
    priority: PriorityLevel;
    supplier: string;
    estimatedCost?: number;
  }) => {
    // Update product to mark restock pending
    setProducts((prev) =>
      prev.map((p) =>
        p.id === details.productId
          ? { ...p, restockPending: true }
          : p
      )
    );

    // Create new restock request PO record
    const newPO: RestockRequest = {
      id: `PO-${1000 + restockRequests.length + 1}`,
      productId: details.productId,
      productName: details.productName,
      category: details.category || 'Grocery',
      currentStock: details.currentStock,
      quantity: details.quantity,
      priority: details.priority,
      supplier: details.supplier,
      status: 'Pending',
      createdAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedCost: details.estimatedCost || details.quantity * 100,
    };

    setRestockRequests((prev) => [newPO, ...prev]);

    // Close restock modal & product analysis modal if open
    setRestockProduct(null);
    setSelectedProductForAnalysis(null);

    // Show the exact specified success toast
    showToast(
      'Restock request created successfully.',
      `Purchase Order #${newPO.id} for ${details.quantity} units of ${details.productName} dispatched to ${details.supplier}.`,
      'success'
    );

    // Acknowledge any active alert for this product
    setAlerts((prev) =>
      prev.map((alt) =>
        alt.productId === details.productId ? { ...alt, acknowledged: true } : alt
      )
    );

    // If in demo flow, advance step
    if (isDemoActive && (demoStepIndex === 2 || demoStepIndex === 5 || demoStepIndex === 6)) {
      setDemoStepIndex(DEMO_STEPS.length - 1);
    }
  };

  // Update PO status
  const handleUpdateRestockStatus = (id: string, newStatus: 'Pending' | 'Approved' | 'Completed') => {
    setRestockRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, status: newStatus };
        }
        return r;
      })
    );

    if (newStatus === 'Completed') {
      const targetReq = restockRequests.find((r) => r.id === id);
      if (targetReq) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === targetReq.productId
              ? {
                  ...p,
                  currentStock: p.currentStock + targetReq.quantity,
                  restockPending: false,
                  lastRestockedDate: new Date().toISOString().split('T')[0],
                }
              : p
          )
        );
      }
      showToast('Inventory Received', `PO #${id} goods checked into warehouse shelves.`, 'success');
    } else {
      showToast(`PO #${id} ${newStatus}`, `Restock order marked as ${newStatus}.`, 'info');
    }
  };

  // Add Product Handler
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast('Product Added', `${newProduct.name} catalog line created successfully.`, 'success');
  };

  // Acknowledge Alert Handlers
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    showToast('Alert Acknowledged', 'Logged in manager shift records.', 'info');
  };

  const handleAcknowledgeAllAlerts = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    showToast('All Alerts Acknowledged', 'Store operational register updated.', 'info');
  };

  // Demo Flow step advancement
  const handleNextDemoStep = () => {
    const nextIdx = demoStepIndex + 1;
    if (nextIdx >= DEMO_STEPS.length) {
      setIsDemoActive(false);
      setDemoStepIndex(0);
      showToast('Hackathon Demo Complete', 'All 7 key workflow scenarios demonstrated successfully.', 'info');
      return;
    }

    setDemoStepIndex(nextIdx);
    const step = DEMO_STEPS[nextIdx];

    if (step.targetSection) {
      setActiveSection(step.targetSection);
    }

    if (step.targetProductId) {
      const target = products.find((p) => p.id === step.targetProductId);
      if (target) {
        if (nextIdx === 2 || nextIdx === 3) {
          setSelectedProductForAnalysis(target);
        } else if (nextIdx === 5) {
          handleOpenRestockModal(target, 50);
        }
      }
    }
  };

  const handleStartDemoFlow = () => {
    setIsDemoActive(true);
    setDemoStepIndex(0);
    setActiveSection('overview');
    showToast('Hackathon Demo Started', 'Follow the top banner to demonstrate the end-to-end manager workflow.', 'info');
  };

  // Counts for Badges
  const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.reorderLevel).length;
  const recommendations = generateSmartRecommendations(products);
  const urgentRecsCount = recommendations.filter((r) => r.type === 'RESTOCK NOW').length;
  const unacknowledgedAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        lowStockCount={lowStockCount}
        urgentRecsCount={urgentRecsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-gradient-to-br from-[#070b14] via-[#091024] to-[#0a142e]">
        {/* Top Header */}
        <Header
          products={products}
          unacknowledgedAlertsCount={unacknowledgedAlertsCount}
          onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
          onOpenCopilotPanel={() => setIsCopilotPanelOpen(true)}
          onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
          onStartDemoFlow={handleStartDemoFlow}
          currentDemoStep={isDemoActive ? DEMO_STEPS[demoStepIndex]?.title : null}
        />

        {/* Hackathon Interactive Demo Guide Banner */}
        <HackathonDemoGuide
          currentStepIndex={demoStepIndex}
          isActive={isDemoActive}
          onNextStep={handleNextDemoStep}
          onClose={() => setIsDemoActive(false)}
          onJumpToStep={(s) => setDemoStepIndex(s)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto">
          {activeSection === 'overview' && (
            <Overview
              products={products}
              salesTrend={SALES_TREND_DAYS}
              restockRequests={restockRequests}
              onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
              onNavigateToSection={(s) => setActiveSection(s)}
              onRequestRestock={(p, qty) => handleOpenRestockModal(p, qty)}
              onOpenAddProduct={() => setIsAddProductOpen(true)}
              onUpdateRestockStatus={handleUpdateRestockStatus}
            />
          )}

          {(activeSection === 'inventory' || activeSection === 'products') && (
            <Inventory
              products={products}
              onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
              onRequestRestock={(p) => handleOpenRestockModal(p)}
              onOpenAddProduct={() => setIsAddProductOpen(true)}
            />
          )}

          {activeSection === 'sales' && (
            <SalesAnalytics
              products={products}
              salesTrend={SALES_TREND_DAYS}
              onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
              onRequestRestock={(p) => handleOpenRestockModal(p)}
            />
          )}

          {activeSection === 'recommendations' && (
            <SmartRecommendations
              products={products}
              onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
              onRequestRestock={(p, qty) => handleOpenRestockModal(p, qty)}
            />
          )}

          {activeSection === 'restock_requests' && (
            <RestockRequestsView
              requests={restockRequests}
              products={products}
              onRequestRestock={(p, qty) => handleOpenRestockModal(p, qty)}
              onUpdateStatus={handleUpdateRestockStatus}
            />
          )}

          {activeSection === 'copilot' && (
            <AICopilot
              products={products}
              onRequestRestock={(p, qty) => handleOpenRestockModal(p, qty)}
              onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
            />
          )}

          {activeSection === 'settings' && (
            <SettingsView onShowToast={showToast} />
          )}
        </main>
      </div>

      {/* Floating Copilot Launcher Button */}
      <button
        id="btn-floating-copilot-launcher"
        onClick={() => setIsCopilotPanelOpen(true)}
        className="fixed bottom-5 right-5 z-40 p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25 flex items-center gap-2 font-bold text-xs transition-all hover:scale-105 cursor-pointer border border-cyan-400/30"
        title="Open RetailIQ AI Copilot"
      >
        <Bot className="w-5 h-5" />
        <span className="hidden sm:inline">Ask Copilot</span>
        <span className="w-2 h-2 rounded-full bg-cyan-200 animate-ping"></span>
      </button>

      {/* Floating Copilot Drawer Panel */}
      <FloatingCopilotPanel
        isOpen={isCopilotPanelOpen}
        onClose={() => setIsCopilotPanelOpen(false)}
        products={products}
        onRequestRestock={(p, qty) => handleOpenRestockModal(p, qty)}
        onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
      />

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Product Analysis Detailed Modal */}
      <ProductAnalysisModal
        product={selectedProductForAnalysis}
        onClose={() => setSelectedProductForAnalysis(null)}
        onCreateRestockRequest={(p, qty) => {
          setSelectedProductForAnalysis(null);
          handleOpenRestockModal(p, qty);
        }}
      />

      {/* Restock Request Modal */}
      <RestockModal
        product={restockProduct}
        suggestedQty={suggestedRestockQty}
        onClose={() => setRestockProduct(null)}
        onSubmitRestock={handleSubmitRestockRequest}
      />

      {/* Alerts Slide-Over Drawer */}
      <AlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        products={products}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onAcknowledgeAll={handleAcknowledgeAllAlerts}
        onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
        onRequestRestock={(p) => handleOpenRestockModal(p)}
      />

      {/* Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
