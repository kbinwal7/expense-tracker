import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";
import TaglineSection from "./TaglineSection";
import Login from "./Login";
import Dashboard from "./Dashboard";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [page, setPage] = useState("home"); // "home" | "dashboard"
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "FOOD",
    transaction_time: "",
  });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchTransactions(token);
  }, [token]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const filteredTransactions = useMemo(() => {
    const q = filter.toLowerCase();
    return transactions.filter(
      (t) =>
        String(t.id).includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [transactions, filter]);

  const handleLogin = (newToken) => {
    setToken(newToken);
    fetchTransactions(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setTransactions([]);
    setPage("home");
  };

  const fetchTransactions = async (currentToken) => {
    setLoading(true);
    try {
      const res = await api.get("/transactions/", {
        headers: { Authorization: `Bearer ${currentToken || token}` },
      });
      setTransactions(Array.isArray(res.data) ? res.data : []);
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setError("Failed to fetch transactions");
      }
    }
    setLoading(false);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ name: "", amount: "", category: "FOOD", transaction_time: "" });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        name: form.name,
        amount: Number(form.amount),
        category: form.category,
        transaction_time: form.transaction_time + ":00",
      };
      if (editId) {
        await api.put(`/transactions/${editId}/`, payload);
        setMessage("Transaction updated successfully");
      } else {
        await api.post("/transactions/", payload);
        setMessage("Transaction added successfully");
      }
      resetForm();
      fetchTransactions(token);
    } catch (err) {
      setError(
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : JSON.stringify(err.response?.data?.detail),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    setForm({
      name: transaction.name,
      amount: transaction.amount,
      category: transaction.category,
      transaction_time: transaction.transaction_time.slice(0, 16),
    });
    setEditId(transaction.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    setLoading(true);
    try {
      await api.delete(`/transactions/${id}/`);
      setMessage("Transaction deleted successfully");
      fetchTransactions(token);
    } catch (err) {
      setError("Delete failed");
    }
    setLoading(false);
  };

  // Show login if not authenticated
  if (!token) return <Login onLogin={handleLogin} />;

  // Show dashboard page
  if (page === "dashboard") return <Dashboard onBack={() => setPage("home")} />;

  return (
    <div className="app-bg">
      <div className="container">
        <header className="topbar">
          <div className="brand">
            <span className="brand-badge">🐿️</span>
            <h1>SaveSavvy</h1>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="btn btn-light"
              onClick={() => setPage("dashboard")}
            >
              Analytics
            </button>
            <button
              className="btn btn-light"
              onClick={() => fetchTransactions(token)}
            >
              Refresh
            </button>
            <button className="btn btn-light" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </header>

        <div className="stats">
          <input
            type="text"
            placeholder="Search by ID, name, or category..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="content-grid">
          <div className="card form-card">
            <h2>{editId ? "Edit Transaction" : "Add Transaction"}</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <input
                type="text"
                name="name"
                placeholder="Transaction Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount (₹)"
                value={form.amount}
                onChange={handleChange}
                required
              />
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="FOOD">Food</option>
                <option value="TRANSPORT">Transport</option>
                <option value="SHOPPING">Shopping</option>
                <option value="BILLS">Bills</option>
                <option value="HEALTH">Health</option>
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="EDUCATION">Education</option>
                <option value="FITNESS">Fitness</option>
                <option value="BEAUTY">Beauty</option>
                <option value="TRAVEL">Travel</option>
                <option value="SUBSCRIPTIONS">Subscriptions</option>
                <option value="PERSONAL">Personal</option>
                <option value="HOME">Home</option>
                <option value="OTHER">Other</option>
              </select>
              <input
                type="datetime-local"
                name="transaction_time"
                value={form.transaction_time}
                onChange={handleChange}
                required
              />
              <div className="form-actions">
                <button className="btn" type="submit">
                  {editId ? "Update" : "Add"}
                </button>
                {editId && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            {message && <div className="success-msg">{message}</div>}
            {error && <div className="error-msg">{error}</div>}
          </div>

          <div className="card list-card">
            <h2>Recent History</h2>
            {loading ? (
              <div className="loader">Updating dashboard...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Date & Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((t) => (
                      <tr key={t.id}>
                        <td>{t.name}</td>
                        <td>₹{t.amount}</td>
                        <td>{t.category}</td>
                        <td>{new Date(t.transaction_time).toLocaleString()}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="btn btn-edit"
                              onClick={() => handleEdit(t)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-delete"
                              onClick={() => handleDelete(t.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="tagline-wrapper">
          <TaglineSection />
        </div>
      </div>
    </div>
  );
}

export default App;
