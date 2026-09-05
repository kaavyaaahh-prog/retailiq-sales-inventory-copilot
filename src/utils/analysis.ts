import { Product, ProductAnalysis, RecommendationCard, PriorityLevel, StockStatus } from '../types';

export function calculateStockStatus(product: Product): StockStatus {
  if (product.currentStock === 0) return 'out_of_stock';
  if (product.currentStock <= product.reorderLevel * 0.4) return 'critical';
  if (product.currentStock <= product.reorderLevel) return 'low';
  if (product.currentStock > product.reorderLevel * 2.5 && product.unitsSold < 50) return 'overstocked';
  return 'normal';
}

export function calculatePriority(product: Product): PriorityLevel {
  if (product.currentStock === 0) return 'urgent';
  if (product.currentStock <= product.reorderLevel && product.unitsSold >= 90) return 'urgent';
  if (product.currentStock <= product.reorderLevel) return 'high';
  if (product.currentStock <= product.reorderLevel * 1.5) return 'medium';
  return 'low';
}

export function analyzeProduct(product: Product): ProductAnalysis {
  let stockHealth: ProductAnalysis['stockHealth'];
  let salesPerformance: ProductAnalysis['salesPerformance'];
  let restockPriority: ProductAnalysis['restockPriority'];
  let recommendation: string;

  // Sales performance determination
  if (product.unitsSold >= 100) {
    salesPerformance = 'HIGH DEMAND';
  } else if (product.unitsSold >= 70) {
    salesPerformance = 'STEADY';
  } else if (product.unitsSold >= 35) {
    salesPerformance = 'MODERATE';
  } else {
    salesPerformance = 'SLOW MOVING';
  }

  // Stock health determination
  if (product.currentStock === 0) {
    stockHealth = 'OUT OF STOCK';
  } else if (product.currentStock <= product.reorderLevel * 0.4) {
    stockHealth = 'CRITICAL';
  } else if (product.currentStock <= product.reorderLevel) {
    stockHealth = 'LOW';
  } else if (product.currentStock > product.reorderLevel * 2.5 && product.unitsSold < 50) {
    stockHealth = 'OVERSTOCK';
  } else {
    stockHealth = 'HEALTHY';
  }

  // Restock Priority & Recommendation Logic (as per prompt specification)
  if (product.currentStock === 0) {
    restockPriority = 'URGENT';
    recommendation = `Restock ${product.name} immediately. Item is completely out of stock with strong demand history.`;
  } else if (product.currentStock <= product.reorderLevel && salesPerformance === 'HIGH DEMAND') {
    restockPriority = 'URGENT';
    recommendation = `Restock ${product.name} immediately because inventory is below the reorder level while sales are high.`;
  } else if (product.currentStock <= product.reorderLevel) {
    restockPriority = 'HIGH';
    recommendation = `Reorder ${product.name} soon. Current stock (${product.currentStock}) is below safe reorder threshold of ${product.reorderLevel}.`;
  } else if (stockHealth === 'OVERSTOCK') {
    restockPriority = 'MONITOR';
    recommendation = `Monitor ${product.name}. Inventory is high (${product.currentStock} units) relative to recent sales (${product.unitsSold} units). Consider promotional bundling.`;
  } else {
    restockPriority = 'LOW';
    recommendation = `Stock levels for ${product.name} are optimal. Continue regular monitoring.`;
  }

  const daysOfInventoryLeft = product.salesVelocityPerDay > 0
    ? Math.max(0, Math.round(product.currentStock / product.salesVelocityPerDay))
    : 99;

  // Suggested reorder quantity = (30 days * daily velocity) or 3x reorder level
  const recommendedOrderQty = Math.max(
    product.reorderLevel * 2,
    Math.round(product.salesVelocityPerDay * 14) - product.currentStock
  );

  return {
    product,
    stockHealth,
    salesPerformance,
    restockPriority,
    recommendation,
    daysOfInventoryLeft,
    recommendedOrderQty: Math.max(10, recommendedOrderQty),
  };
}

export function generateSmartRecommendations(products: Product[]): RecommendationCard[] {
  const cards: RecommendationCard[] = [];

  for (const product of products) {
    const analysis = analyzeProduct(product);

    if (product.currentStock === 0) {
      cards.push({
        id: `rec-${product.id}`,
        type: 'RESTOCK NOW',
        badgeColor: 'red',
        product,
        headline: `${product.name} is Out of Stock`,
        reason: `0 units remaining · ${product.unitsSold} units sold recently. Lost revenue daily.`,
        actionText: 'RESTOCK NOW',
        suggestedQty: analysis.recommendedOrderQty,
      });
    } else if (product.currentStock <= product.reorderLevel && analysis.salesPerformance === 'HIGH DEMAND') {
      cards.push({
        id: `rec-${product.id}`,
        type: 'RESTOCK NOW',
        badgeColor: 'red',
        product,
        headline: product.name,
        reason: `High demand + low inventory (Only ${product.currentStock} units remaining, ${product.unitsSold} units sold).`,
        actionText: 'RESTOCK',
        suggestedQty: analysis.recommendedOrderQty,
      });
    } else if (product.currentStock <= product.reorderLevel) {
      cards.push({
        id: `rec-${product.id}`,
        type: 'RESTOCK SOON',
        badgeColor: 'orange',
        product,
        headline: product.name,
        reason: `${product.currentStock} units remaining (below reorder level of ${product.reorderLevel}). ${product.unitsSold} sold.`,
        actionText: 'ORDER STOCK',
        suggestedQty: analysis.recommendedOrderQty,
      });
    } else if (analysis.stockHealth === 'OVERSTOCK') {
      cards.push({
        id: `rec-${product.id}`,
        type: 'MONITOR',
        badgeColor: 'yellow',
        product,
        headline: product.name,
        reason: `Inventory is relatively high (${product.currentStock} units available) compared with sales (${product.unitsSold} sold).`,
        actionText: 'MONITOR',
        suggestedQty: 0,
      });
    }
  }

  // Sort: RESTOCK NOW first, then RESTOCK SOON, then MONITOR
  return cards.sort((a, b) => {
    const rank = { 'RESTOCK NOW': 0, 'RESTOCK SOON': 1, 'MONITOR': 2, 'HEALTHY': 3 };
    return rank[a.type] - rank[b.type];
  });
}

export function formatCurrency(num: number): string {
  return `₹${num.toLocaleString('en-IN')}`;
}
