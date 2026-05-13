import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";
import TaglineSection from "./TaglineSection";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

function App() {
  const [transactions, setTransactions] = useState([]);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "MAKEUP",
    transaction_time: "",
  });

  const [editId, setEditId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch transactions");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      amount: "",
      category: "MAKEUP",
      transaction_time: "",
    });

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
        await api.put(`/transactions/${editId}`, payload);

        setMessage("Transaction updated successfully");
      } else {
        await api.post("/transactions", payload);

        setMessage("Transaction added successfully");
      }

      resetForm();

      fetchTransactions();
    } catch (err) {
      console.log(err);

      setError(
        typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : JSON.stringify(err.response?.data?.detail),
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Edit transaction
  // =========================
  const handleEdit = (transaction) => {
    setForm({
      name: transaction.name,
      amount: transaction.amount,
      category: transaction.category,
      transaction_time: transaction.transaction_time.slice(0, 16),
    });
    setEditId(transaction.id);
  };

  // =========================
  // Delete transaction
  // =========================
  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this transaction?");
    if (!ok) return;

    setLoading(true);
    try {
      await api.delete(`/transactions/${id}`);
      setMessage("Transaction deleted successfully");
      fetchTransactions();
    } catch (err) {
      setError("Delete failed");
    }
    setLoading(false);
  };

  return (
    <div className="app-bg">
      <div className="container">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="brand">
            <span className="brand-badge">🐿️</span>
            <h1>SaveSavvy</h1>
          </div>
          <button className="btn btn-light" onClick={fetchTransactions}>
            Refresh Data
          </button>
        </header>

        {/* STATS CONTROL BAR */}
        <div className="stats">
          <div className="chip">Total Transactions: {transactions.length}</div>
          <input
            type="text"
            placeholder="Search by ID, name, or category..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {/* MAIN DASHBOARD CONTENT GRID */}
        <div className="content-grid">
          {/* LEFT: MANAGEMENT FORM CARD */}
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
                <option value="MAKEUP">Makeup</option>
                <option value="SKINCARE">Skincare</option>
                <option value="DINE OUT">Dine Out</option>
                <option value="TAKEAWAY">Takeaway</option>
                <option value="SHOPPING">Shopping</option>
                <option value="FITNESS">Fitness</option>
                <option value="PRODUCTIVITY">Productivity</option>
                <option value="STUDY">Study</option>
                <option value="ENTERTAINMENT">Entertainment</option>
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

          {/* RIGHT: LIVE RECORDS TABLE CARD */}
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

        {/* FOOTER SECTION */}
        <div className="tagline-wrapper">
          <TaglineSection />
        </div>
      </div>
    </div>
  );
}

export default App;
