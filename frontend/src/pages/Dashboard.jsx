import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import EmptyState from '../components/ui/EmptyState.jsx';
import Loader from '../components/ui/Loader.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getDashboard } from '../services/dashboardService.js';
import { priorityLabels } from '../utils/priorityLabels.js';
import { statusLabels } from '../utils/statusLabels.js';

const chartColors = ['#7c3aed', '#22c55e', '#38bdf8', '#f59e0b', '#ef4444', '#a78bfa'];

function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const data = await getDashboard();
        setDashboard(data);
      } catch (err) {
        setError(err.response?.data?.message ?? 'Não foi possível carregar o dashboard.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    if (!dashboard) return [];

    const baseMetrics = [
      { label: 'Total de chamados', value: dashboard.totalTickets },
      { label: 'Abertos', value: dashboard.openTickets },
      { label: 'Em andamento', value: dashboard.inProgressTickets },
      { label: 'Resolvidos', value: dashboard.resolvedTickets },
      { label: 'Fechados', value: dashboard.closedTickets },
      { label: 'Criticos', value: dashboard.criticalTickets },
      { label: 'Tempo medio', value: `${dashboard.averageResolutionHours}h` },
    ];

    if (user?.role === 'Admin') {
      baseMetrics.splice(
        6,
        0,
        { label: 'Usuarios', value: dashboard.totalUsers },
        { label: 'Tecnicos', value: dashboard.totalTechnicians },
      );
    }

    return baseMetrics;
  }, [dashboard, user?.role]);

  const priorityData = useMemo(
    () => translateLabels(dashboard?.ticketsByPriority ?? [], priorityLabels),
    [dashboard],
  );

  const statusData = useMemo(
    () => translateLabels(dashboard?.ticketsByStatus ?? [], statusLabels),
    [dashboard],
  );

  if (loading) {
    return (
      <div className="centered-state">
        <Loader label="Carregando dashboard" />
      </div>
    );
  }

  if (error) {
    return <p className="alert alert-error">{error}</p>;
  }

  return (
    <section className="content-section dashboard-page">
      <div className="page-heading">
        <div>
          <p className="header-eyebrow">Dashboard</p>
          <h2>Visão analítica</h2>
        </div>
        <span className="dashboard-scope">{scopeLabel(user?.role)}</span>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <div className="charts-grid">
        <ChartPanel title="Chamados por status" data={statusData}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData} barCategoryGap="32%">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis allowDecimals={false} stroke="#9ca3af" domain={[0, (max) => Math.max(max, 3)]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} maxBarSize={72} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Chamados por prioridade" data={priorityData}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="label" outerRadius={96} label>
                {priorityData.map((entry, index) => (
                  <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Chamados por categoria" data={dashboard.ticketsByCategory}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboard.ticketsByCategory} barCategoryGap="32%">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis allowDecimals={false} stroke="#9ca3af" domain={[0, (max) => Math.max(max, 3)]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={72} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Chamados por técnico" data={dashboard.ticketsByTechnician}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboard.ticketsByTechnician} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" allowDecimals={false} stroke="#9ca3af" domain={[0, (max) => Math.max(max, 3)]} />
              <YAxis dataKey="label" type="category" width={110} stroke="#9ca3af" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#38bdf8" radius={[0, 6, 6, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Tecnicos mais ativos" data={dashboard.activeTechnicians}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboard.activeTechnicians} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" allowDecimals={false} stroke="#9ca3af" domain={[0, (max) => Math.max(max, 3)]} />
              <YAxis dataKey="label" type="category" width={110} stroke="#9ca3af" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#f59e0b" radius={[0, 6, 6, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Resolvidos por técnico" data={dashboard.resolvedTicketsByTechnician}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboard.resolvedTicketsByTechnician} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" allowDecimals={false} stroke="#9ca3af" domain={[0, (max) => Math.max(max, 3)]} />
              <YAxis dataKey="label" type="category" width={110} stroke="#9ca3af" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#22c55e" radius={[0, 6, 6, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Chamados por mes" data={dashboard.ticketsByMonth}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboard.ticketsByMonth} barCategoryGap="32%">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis allowDecimals={false} stroke="#9ca3af" domain={[0, (max) => Math.max(max, 3)]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={72} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </section>
  );
}

function ChartPanel({ title, data, children }) {
  return (
    <article className="chart-panel">
      <h3>{title}</h3>
      {data.length === 0 ? (
        <EmptyState title="Sem dados" description="Os graficos serao preenchidos quando houver chamados." />
      ) : (
        children
      )}
    </article>
  );
}

function translateLabels(items, labels) {
  return items.map((item) => ({
    ...item,
    label: labels[item.label] ?? item.label,
  }));
}

function scopeLabel(role) {
  if (role === 'Admin') return 'Visão geral da operação';
  if (role === 'Technician') return 'Seus chamados atribuidos';
  return 'Seus chamados';
}

const tooltipStyle = {
  background: '#1f2937',
  border: '1px solid #374151',
  borderRadius: 8,
  color: '#f9fafb',
};

export default Dashboard;
