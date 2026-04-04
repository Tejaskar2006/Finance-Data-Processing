/**
 * Dashboard Page
 * Main analytics view. Data shown depends on user role:
 *   - Admin/Analyst: Full charts, category breakdown, monthly trends
 *   - Viewer: KPI summary + 5 recent transactions only
 */
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MonthlyTrendChart, CategoryPieChart, BalanceLineChart } from '../components/charts/DashboardCharts';
import type { DashboardData } from '../types';
import { format } from 'date-fns';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pieType, setPieType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await dashboardAPI.get();
        setData(res.data.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!data) return <div className="page-wrapper"><p>Failed to load dashboard.</p></div>;

  const { summary } = data;

  const kpiCards = [
    { key: 'income', label: 'Total Income', value: summary.income, count: `${summary.incomeCount} transactions`, icon: <TrendingUp size={22} /> },
    { key: 'expense', label: 'Total Expenses', value: summary.expense, count: `${summary.expenseCount} transactions`, icon: <TrendingDown size={22} /> },
    { key: 'balance', label: 'Net Balance', value: summary.netBalance, count: summary.netBalance >= 0 ? '↑ Positive' : '↓ Negative', icon: <DollarSign size={22} /> },
    { key: 'total', label: 'Total Records', value: summary.totalTransactions, count: 'all time', icon: <Activity size={22} />, isCount: true },
  ];

  return (
    <div className="page-wrapper animate-fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>
          Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> ·{' '}
          <span className={`role-badge ${user?.role}`}>{user?.role}</span>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiCards.map((c) => (
          <div key={c.key} className={`kpi-card ${c.key}`}>
            <div className="kpi-icon-wrap">{c.icon}</div>
            <div className="kpi-label">{c.label}</div>
            <div className="kpi-value">
              {c.isCount ? summary.totalTransactions : formatCurrency(c.value as number)}
            </div>
            <div className="kpi-count">{c.count}</div>
          </div>
        ))}
      </div>

      {/* Charts — Admin and Analyst only */}
      {hasRole('Admin', 'Analyst') && data.monthlyTrend && data.categoryBreakdown && (
        <>
          <div className="charts-grid">
            {/* Bar Chart */}
            <div className="chart-card">
              <div className="chart-title">📊 Monthly Income vs Expense</div>
              {data.monthlyTrend.length > 0
                ? <MonthlyTrendChart data={data.monthlyTrend} />
                : <div className="empty-state"><p>No trend data yet</p></div>
              }
            </div>

            {/* Pie Chart */}
            <div className="chart-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span className="chart-title" style={{ marginBottom: 0 }}>🍩 Category Breakdown</span>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button className={`btn btn-sm ${pieType === 'expense' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPieType('expense')}>Expense</button>
                  <button className={`btn btn-sm ${pieType === 'income' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPieType('income')}>Income</button>
                </div>
              </div>
              <CategoryPieChart data={data.categoryBreakdown} type={pieType} />
            </div>
          </div>

          {/* Line Chart */}
          <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
            <div className="chart-title">📈 Net Balance Over Time</div>
            {data.monthlyTrend.length > 0
              ? <BalanceLineChart data={data.monthlyTrend} />
              : <div className="empty-state" style={{ padding: '2rem' }}><p>No data yet</p></div>
            }
          </div>
        </>
      )}

      {/* Viewer limited notice */}
      {hasRole('Viewer') && (
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--warning)' }}>
            ⚠️ <strong>Viewer mode:</strong> You see a summary view. Contact an Admin to upgrade your access for full analytics.
          </p>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="table-container">
        <div className="table-header-bar">
          <span className="table-title">🕐 Recent Transactions</span>
        </div>
        {data.recentTransactions.length === 0 ? (
          <div className="empty-state"><p>No transactions yet</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((t) => (
                <tr key={t._id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {format(new Date(t.date), 'MMM d, yyyy')}
                  </td>
                  <td>
                    <span className={`badge badge-${t.type}`}>
                      {t.type === 'income' ? '↑' : '↓'} {t.type}
                    </span>
                  </td>
                  <td>{t.category}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', maxWidth: 200 }}>
                    {t.notes ?? '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: t.type === 'income' ? 'var(--success)' : 'var(--danger)' }}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
