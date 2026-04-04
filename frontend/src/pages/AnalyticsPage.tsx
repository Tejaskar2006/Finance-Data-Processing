/**
 * Analytics Page — Admin and Analyst only
 * Deep-dive charts with toggling and data export awareness.
 */
import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { MonthlyTrendChart, CategoryPieChart, BalanceLineChart } from '../components/charts/DashboardCharts';
import type { DashboardData } from '../types';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const AnalyticsPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pieType, setPieType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    dashboardAPI.get().then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!data) return <div className="page-wrapper"><p>Failed to load analytics.</p></div>;

  const { summary, categoryBreakdown = {}, monthlyTrend = [] } = data;

  // Top categories by expense
  const topCategories = Object.entries(categoryBreakdown)
    .map(([name, vals]) => ({ name, expense: vals.expense, income: vals.income }))
    .filter(c => c.expense + c.income > 0)
    .sort((a, b) => b.expense - a.expense)
    .slice(0, 8);

  return (
    <div className="page-wrapper animate-fade-in">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Deep financial insights and trend analysis</p>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Income', value: summary.income, color: 'var(--success)' },
          { label: 'Total Expense', value: summary.expense, color: 'var(--danger)' },
          { label: 'Net Balance', value: summary.netBalance, color: summary.netBalance >= 0 ? 'var(--primary)' : 'var(--danger)' },
        ].map(c => (
          <div key={c.label} className="card">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              {c.label}
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: c.color, fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(c.value)}
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="chart-card">
          <div className="chart-title">📊 Monthly Income vs Expense</div>
          <MonthlyTrendChart data={monthlyTrend} />
        </div>
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span className="chart-title" style={{ marginBottom: 0 }}>🍩 Category Breakdown</span>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <button className={`btn btn-sm ${pieType === 'expense' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPieType('expense')}>Expense</button>
              <button className={`btn btn-sm ${pieType === 'income' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPieType('income')}>Income</button>
            </div>
          </div>
          <CategoryPieChart data={categoryBreakdown} type={pieType} />
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
        <div className="chart-title">📈 Net Balance Trend</div>
        <BalanceLineChart data={monthlyTrend} />
      </div>

      {/* Category breakdown table */}
      {topCategories.length > 0 && (
        <div className="table-container">
          <div className="table-header-bar">
            <span className="table-title">📋 Category Breakdown</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Income</th>
                <th style={{ textAlign: 'right' }}>Expense</th>
                <th style={{ textAlign: 'right' }}>Net</th>
              </tr>
            </thead>
            <tbody>
              {topCategories.map(c => (
                <tr key={c.name}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ textAlign: 'right', color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
                    {c.income > 0 ? formatCurrency(c.income) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>
                    {c.expense > 0 ? formatCurrency(c.expense) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: c.income - c.expense >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {formatCurrency(c.income - c.expense)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
