import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./Dashboard.css";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

const COLORS = [
  "#2d7d86",
  "#4da3ad",
  "#e07a9b",
  "#f4a261",
  "#a8dadc",
  "#457b9d",
  "#e9c46a",
  "#8ecae6",
  "#95d5b2",
  "#b7e4c7",
  "#cdb4db",
  "#ffc8dd",
  "#ffafcc",
  "#bde0fe",
];

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function Dashboard({ onBack }) {
  const [summary, setSummary] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [topSpend, setTopSpend] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [summaryRes, trendRes, categoryRes, topRes, recentRes] =
        await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/dashboard/monthly-trend"),
          api.get("/dashboard/category-breakdown"),
          api.get("/dashboard/top-spend"),
          api.get("/dashboard/recent-transactions"),
        ]);
      setSummary(summaryRes.data);
      setMonthlyTrend(trendRes.data);
      setCategoryBreakdown(categoryRes.data);
      setTopSpend(topRes.data);
      setRecentTransactions(recentRes.data);
    } catch (err) {
      setError("Failed to load Dashboard. Please try again.");
    }
    setLoading(false);
  };

  const formatCurrency = (val) =>
    "₹" + Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const formatMonth = (str) => {
    if (!str) return "";
    const [year, month] = str.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleString("default", { month: "short", year: "2-digit" });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="dashboard-bg">
        <div className="dashboard-loader">
          <div className="loader-spinner"></div>
          <p>Loading your insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-bg">
      <div className="container">
        {/* Header */}
        <header className="topbar">
          <div className="brand">
            <span className="brand-badge"></span>
            <h1>Dashboard</h1>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-light" onClick={fetchAll}>
              Refresh
            </button>
            <button className="btn btn-light" onClick={onBack}>
              ← Back
            </button>
          </div>
        </header>

        {error && (
          <div className="error-msg" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {/* Summary Stats */}
        {summary && (
          <div className="stats-grid">
            <StatCard
              icon=""
              label="Total Spent"
              value={formatCurrency(summary.total_spend)}
            />
            <StatCard
              icon=""
              label="Transactions"
              value={summary.transaction_count}
            />
            <StatCard
              icon=""
              label="Avg per Transaction"
              value={formatCurrency(summary.average_spend)}
            />
            {topSpend && (
              <StatCard
                icon=""
                label="Top Category"
                value={topSpend.category}
                sub={formatCurrency(topSpend.total)}
              />
            )}
          </div>
        )}

        {/* Charts Row */}
        <div className="charts-grid">
          {/* Monthly Trend */}
          <div className="card chart-card">
            <h2>Monthly Spending</h2>
            {monthlyTrend.length === 0 ? (
              <div className="empty-chart">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={monthlyTrend}
                  margin={{ top: 10, right: 10, left: 1, bottom: 1}}
                >
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2d7d86" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2d7d86" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.05)"
                  />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonth}
                    tick={{ fill: "#708a8c", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => "₹" + (v / 1000).toFixed(0) + "k"}
                    tick={{ fill: "#708a8c", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#2d7d86"
                    strokeWidth={2.5}
                    fill="url(#tealGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category Pie */}
          <div className="card chart-card">
            <h2>By Category</h2>
            {categoryBreakdown.length === 0 ? (
              <div className="empty-chart">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    formatter={(val) => (
                      <span style={{ color: "#2c3e40", fontSize: "8px" }}>
                        {val}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card chart-card wide-chart">
          <h2>Spending by Category</h2>
          {categoryBreakdown.length === 0 ? (
            <div className="empty-chart">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={categoryBreakdown}
                margin={{ top: 10, right: 10, left: 1, bottom: 1}}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0,0,0,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "#708a8c", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => "₹" + (v / 1000).toFixed(0) + "k"}
                  tick={{ fill: "#708a8c", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {categoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="card list-card" style={{ marginTop: "28px" }}>
          <h2>Recent Transactions</h2>
          {recentTransactions.length === 0 ? (
            <div className="empty-chart">No transactions yet</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.name}</td>
                      <td>₹{t.amount}</td>
                      <td>{t.category}</td>
                      <td>{new Date(t.transaction_time).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
