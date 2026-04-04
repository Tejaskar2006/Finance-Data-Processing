/**
 * Dashboard Controller
 * Uses MongoDB Aggregation Pipelines for analytics:
 *   - Total income/expense/net balance
 *   - Category breakdown
 *   - Monthly trends (last 12 months)
 *   - Recent transactions
 */
const FinancialRecord = require('../models/FinancialRecord');

// ─── GET /api/dashboard ───────────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const role = req.user.role;
    // Date 12 months back for trend analysis
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // ── Pipeline 1: Summary totals (income / expense / balance) ──────────────
    const summaryPipeline = [
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ];

    // ── Pipeline 2: Category breakdown ───────────────────────────────────────
    const categoryPipeline = [
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ];

    // ── Pipeline 3: Monthly trend (last 12 months) ────────────────────────────
    const monthlyTrendPipeline = [
      {
        $match: {
          isDeleted: false,
          date: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $group: {
          _id: { year: '$_id.year', month: '$_id.month' },
          entries: {
            $push: { type: '$_id.type', total: '$total', count: '$count' },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ];

    // ── Pipeline 4: Recent transactions ───────────────────────────────────────
    const recentTransactionsPipeline = [
      { $match: { isDeleted: false } },
      { $sort: { date: -1 } },
      { $limit: role === 'Viewer' ? 5 : 10 },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [{ $project: { name: 1, email: 1 } }],
        },
      },
      { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
    ];

    // Run all pipelines concurrently
    const [summaryRaw, categoryRaw, monthlyRaw, recentTransactions] = await Promise.all([
      FinancialRecord.aggregate(summaryPipeline),
      // Analysts and Admins get full category breakdown; Viewers get summary only
      role !== 'Viewer' ? FinancialRecord.aggregate(categoryPipeline) : Promise.resolve([]),
      role !== 'Viewer' ? FinancialRecord.aggregate(monthlyTrendPipeline) : Promise.resolve([]),
      FinancialRecord.aggregate(recentTransactionsPipeline),
    ]);

    // ── Transform summary data ─────────────────────────────────────────────────
    const summary = { income: 0, incomeCount: 0, expense: 0, expenseCount: 0 };
    summaryRaw.forEach(({ _id, total, count }) => {
      if (_id === 'income') { summary.income = total; summary.incomeCount = count; }
      if (_id === 'expense') { summary.expense = total; summary.expenseCount = count; }
    });
    summary.netBalance = summary.income - summary.expense;
    summary.totalTransactions = summary.incomeCount + summary.expenseCount;

    // ── Transform category data ────────────────────────────────────────────────
    const categories = {};
    categoryRaw.forEach(({ _id, total, count }) => {
      if (!categories[_id.category]) {
        categories[_id.category] = { income: 0, expense: 0, incomeCount: 0, expenseCount: 0 };
      }
      if (_id.type === 'income') {
        categories[_id.category].income = total;
        categories[_id.category].incomeCount = count;
      } else {
        categories[_id.category].expense = total;
        categories[_id.category].expenseCount = count;
      }
    });

    // ── Transform monthly trend data ──────────────────────────────────────────
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyTrend = monthlyRaw.map(({ _id, entries }) => {
      const result = {
        year: _id.year,
        month: _id.month,
        label: `${monthNames[_id.month - 1]} ${_id.year}`,
        income: 0,
        expense: 0,
      };
      entries.forEach(({ type, total }) => {
        if (type === 'income') result.income = total;
        if (type === 'expense') result.expense = total;
      });
      result.net = result.income - result.expense;
      return result;
    });

    res.status(200).json({
      success: true,
      data: {
        summary,
        ...(role !== 'Viewer' && {
          categoryBreakdown: categories,
          monthlyTrend,
        }),
        recentTransactions,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
