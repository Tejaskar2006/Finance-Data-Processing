/**
 * Dashboard Charts — Recharts-based visualizations
 * 1. MonthlyTrendChart — Bar chart: income vs expense by month
 * 2. CategoryPieChart — Pie chart: spending by category
 * 3. BalanceLine — Line chart: net balance over time
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
} from 'recharts';
import type { MonthlyTrendPoint, CategoryBreakdown } from '../../types';

// ─── Shared Tooltip Styles ─────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: '#12122b',
  border: '1px solid rgba(99,102,241,0.3)',
  borderRadius: '8px',
  color: '#f8fafc',
  fontSize: '12px',
};

const formatCurrency = (val: number | undefined) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(val ?? 0);

// ─── 1. Monthly Trend Bar Chart ────────────────────────────────────────────
interface MonthlyTrendChartProps {
  data: MonthlyTrendPoint[];
}

export const MonthlyTrendChart = ({ data }: MonthlyTrendChartProps) => {
  const chartData = data.map((d) => ({
    name: d.label,
    Income: d.income,
    Expense: d.expense,
    Net: d.net,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(val) => formatCurrency(val as number)}
          cursor={{ fill: 'rgba(99,102,241,0.05)' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
        />
        <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── 2. Category Pie Chart ─────────────────────────────────────────────────
interface CategoryPieChartProps {
  data: CategoryBreakdown;
  type: 'income' | 'expense';
}

const PIE_COLORS = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

export const CategoryPieChart = ({ data, type }: CategoryPieChartProps) => {
  const chartData = Object.entries(data)
    .map(([name, vals]) => ({ name, value: type === 'income' ? vals.income : vals.expense }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  if (chartData.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '2rem 1rem' }}>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(val) => formatCurrency(val as number)}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ─── 3. Net Balance Line Chart ─────────────────────────────────────────────
interface BalanceLineChartProps {
  data: MonthlyTrendPoint[];
}

export const BalanceLineChart = ({ data }: BalanceLineChartProps) => {
  const chartData = data.map((d) => ({
    name: d.label,
    'Net Balance': d.net,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatCurrency} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(val) => formatCurrency(val as number)} />
        <Line
          type="monotone"
          dataKey="Net Balance"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ fill: '#6366f1', r: 3 }}
          activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
