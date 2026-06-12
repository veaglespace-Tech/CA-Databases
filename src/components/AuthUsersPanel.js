"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield, Plus, Pencil, Trash2, X, Check, Eye, EyeOff,
  UserCheck, UserX, RefreshCw, Key, Mail, User, Crown
} from "lucide-react";

function RoleBadge({ role }) {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700 ring-1 ring-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:ring-purple-900">
        <Crown size={12} /> Admin
      </span>
    );
  }
  if (role === "manager") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-900">
        Manager
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
      Viewer
    </span>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <p className="font-semibold text-slate-900 dark:text-white">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function UserFormModal({ user, onClose, onSave }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "viewer",
    is_active: user?.is_active ?? 1,
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? (checked ? 1 : 0) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      let res, data;
      if (isEdit) {
        const body = { username: form.username, email: form.email, role: form.role, is_active: form.is_active };
        if (form.password) body.password = form.password;
        res = await fetch(`/api/auth/users/${user.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
        data = await res.json();
      } else {
        res = await fetch("/api/auth/users", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        });
        data = await res.json();
      }
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
      onSave();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        {/* header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
              <Key size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEdit ? "Edit Auth User" : "New Auth User"}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-900 dark:hover:text-slate-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* username */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="username" value={form.username} onChange={handleChange} required placeholder="johndoe"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-brand-500" />
            </div>
          </div>

          {/* email */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="user@example.com"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-brand-500" />
            </div>
          </div>

          {/* password */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isEdit ? "New Password (leave blank to keep current)" : "Password"}
            </label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="password" type={showPass ? "text" : "password"} value={form.password} onChange={handleChange}
                required={!isEdit} placeholder={isEdit ? "••••••••" : "Min 8 characters"}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-brand-500" />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300">
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {/* role */}
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Role</label>
            <select name="role" value={form.role} onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-brand-500">
              <option value="viewer">Viewer</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* active toggle (edit only) */}
          {isEdit && (
            <label className="flex cursor-pointer items-center gap-3 py-2">
              <input type="checkbox" name="is_active" checked={Boolean(form.is_active)} onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:checked:bg-brand-600" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Account is active</span>
            </label>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70">
              {saving ? "Saving…" : <><Check size={16} /> {isEdit ? "Update User" : "Create User"}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AuthUsersPanel({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // null | "create" | {user object}
  const [deleting, setDeleting] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const executeDelete = async (id) => {
    setDeleting(id);
    setConfirmDelete(null);
    try {
      await fetch(`/api/auth/users/${id}`, { method: "DELETE" });
      fetchUsers();
    } finally { setDeleting(null); }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.is_active ? 0 : 1;
      await fetch(`/api/auth/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newStatus }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalClose = () => setModal(null);
  const handleModalSave = () => { setModal(null); fetchUsers(); };

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Auth Users</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Manage dashboard access credentials</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchUsers}
            className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
            <RefreshCw size={15} /> Refresh
          </button>
          {isAdmin && (
            <button onClick={() => setModal("create")}
              className="flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-brand-700">
              <Plus size={16} /> New User
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-sm font-bold text-slate-500">Loading users…</div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                {["ID","Username","Email","Role","Status","Last Login","Actions"].map(h => (
                  <th key={h} className="border-b border-slate-200 px-4 py-3 font-bold text-slate-700 dark:border-slate-800 dark:text-slate-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-500">#{u.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
                        {u.username[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => isAdmin && handleToggleStatus(u)}
                      disabled={!isAdmin}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 transition-colors ${
                        u.is_active
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900 dark:hover:bg-emerald-900"
                          : "bg-red-50 text-red-700 ring-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:ring-red-900 dark:hover:bg-red-900"
                      } ${!isAdmin && "cursor-default"}`}
                      title={isAdmin ? "Click to toggle status" : ""}
                    >
                      {u.is_active ? <><UserCheck size={12} /> Active</> : <><UserX size={12} /> Inactive</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {u.last_login ? new Date(u.last_login).toLocaleString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setModal(u)}
                          className="flex h-8 items-center gap-1.5 rounded-md bg-indigo-50 px-3 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900">
                          <Pencil size={13} /> Edit
                        </button>
                        <button onClick={() => setConfirmDelete(u)} disabled={deleting===u.id || u.id===currentUser?.id}
                          className="flex h-8 items-center gap-1.5 rounded-md bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900">
                          <Trash2 size={13} /> {deleting===u.id?"…":"Delete"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm font-medium text-slate-500">No auth users found. Create the first one!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <UserFormModal
          user={modal === "create" ? null : modal}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          message={`Delete auth user #${confirmDelete.id} (${confirmDelete.username})? This cannot be undone.`}
          onConfirm={() => executeDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
