import Sale from '../models/Sale.js';
import Purchase from '../models/Purchase.js';
import Supplier from '../models/Supplier.js';
import Customer from '../models/Customer.js';

export const getFinanceSummary = async (req, res) => {
  try {
    const pharmacyId = req.pharmacyId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Current month revenue from completed sales
    const monthlySales = await Sale.find({
      pharmacy: pharmacyId,
      status: 'completed',
      createdAt: { $gte: startOfMonth }
    });
    const totalRevenue = monthlySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);

    // Current month expenses from received purchases
    const monthlyPurchases = await Purchase.find({
      pharmacy: pharmacyId,
      status: { $in: ['received', 'partially_received'] },
      createdAt: { $gte: startOfMonth }
    });
    const totalExpenses = monthlyPurchases.reduce((sum, p) => sum + (p.grandTotal || 0), 0);

    const netProfit = totalRevenue - totalExpenses;

    // Accounts receivable (customer credit balances)
    const customers = await Customer.find({ pharmacy: pharmacyId });
    const accountsReceivable = customers.reduce((sum, c) => sum + (c.creditBalance || 0), 0);

    // Accounts payable (supplier balances)
    const suppliers = await Supplier.find({ pharmacy: pharmacyId });
    const accountsPayable = suppliers.reduce((sum, s) => sum + (s.balancePayable || 0), 0);

    const cashInHand = Math.max(0, totalRevenue - accountsPayable + accountsReceivable);

    // Last 6 months revenue & expenses
    const revenueByMonth = [];
    const expensesByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'short' });

      const mSales = await Sale.find({
        pharmacy: pharmacyId, status: 'completed',
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      const mPurchases = await Purchase.find({
        pharmacy: pharmacyId, status: { $in: ['received', 'partially_received'] },
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });

      revenueByMonth.push({ month: monthLabel, amount: Math.round(mSales.reduce((s, v) => s + (v.grandTotal || 0), 0)) });
      expensesByMonth.push({ month: monthLabel, amount: Math.round(mPurchases.reduce((s, v) => s + (v.grandTotal || 0), 0)) });
    }

    // Recent transactions (last 20 sales + purchases merged)
    const recentSales = await Sale.find({ pharmacy: pharmacyId })
      .sort({ createdAt: -1 }).limit(10).lean();
    const recentPurchases = await Purchase.find({ pharmacy: pharmacyId })
      .sort({ createdAt: -1 }).limit(10).lean();

    const recentTransactions = [
      ...recentSales.map(s => ({ type: 'sale', ref: s.invoiceNumber, amount: s.grandTotal, date: s.createdAt })),
      ...recentPurchases.map(p => ({ type: 'purchase', ref: p.purchaseOrderNumber, amount: p.grandTotal, date: p.createdAt }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);

    res.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      accountsReceivable: Math.round(accountsReceivable * 100) / 100,
      accountsPayable: Math.round(accountsPayable * 100) / 100,
      cashInHand: Math.round(cashInHand * 100) / 100,
      revenueByMonth,
      expensesByMonth,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
