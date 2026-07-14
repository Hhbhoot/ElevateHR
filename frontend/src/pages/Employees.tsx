import React, { useEffect, useState } from "react";
import { api } from "../utils/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import type { User } from "../context/AuthContext";
import { EmployeeModal } from "../components/EmployeeModal";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";

export const Employees: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalEmployees: 0,
  });

  // Query States
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | null>(
    null,
  );
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isHR = user?.role === "HR";

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        search,
        department,
        status,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: "8", // 8 items per page looks excellent in standard heights
      });

      const res = await api(`/employees?${queryParams.toString()}`);
      setEmployees(res.data);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err?.message || "Failed to retrieve employees");
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on debounce or page/filter change
  useEffect(() => {
    fetchEmployees();
  }, [page, department, status, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleteLoading(true);
    try {
      await api(`/employees/${deleteConfirmId}`, { method: "DELETE" });
      setDeleteConfirmId(null);
      toast.success("Employee deleted successfully");
      // If current page now becomes empty and page > 1, slide back
      if (employees.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchEmployees();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete employee");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openModal = (
    mode: "add" | "edit" | "view",
    employee: User | null = null,
  ) => {
    setSelectedEmployee(employee);
    setModalMode(mode);
  };

  const closeModal = (shouldRefresh = false) => {
    setModalMode(null);
    setSelectedEmployee(null);
    if (shouldRefresh) {
      fetchEmployees();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (empStatus: string) => {
    switch (empStatus) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Inactive":
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
      default: // Terminated
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Staff Roster
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Search, update, and audit corporate employees
          </p>
        </div>

        {isHR && (
          <button
            onClick={() => openModal("add")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-primary-600/20 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-dark-card border border-dark-border p-5 rounded-2xl">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl pl-9 pr-4 py-2.5 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-primary-500 transition-all cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>

          {/* Query Actions */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 text-slate-100 font-semibold text-xs border border-dark-border hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDepartment("");
                setStatus("");
                setSortBy("createdAt");
                setSortOrder("desc");
                setPage(1);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-dark-border text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 cursor-pointer"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Roster Table Content */}
      <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader className="w-8 h-8 animate-spin text-primary-500" />
            <span className="text-xs text-slate-400">
              Loading roster directory...
            </span>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-400 font-semibold">
            {error}
          </div>
        ) : employees.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            No employees match your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-border bg-slate-900/20 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Role & Dept</th>
                  <th className="px-6 py-4">
                    <button
                      onClick={() => handleSortChange("salary")}
                      className="flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      Salary
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4">
                    <button
                      onClick={() => handleSortChange("joiningDate")}
                      className="flex items-center gap-1 hover:text-white cursor-pointer"
                    >
                      Joining Date
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40 text-sm">
                {employees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="hover:bg-slate-900/10 transition-colors"
                  >
                    {/* Employee Profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-white truncate max-w-[150px]">
                            {emp.name}
                          </h4>
                          <p className="text-xs text-slate-400 truncate max-w-[180px] font-mono">
                            {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department / Designation */}
                    <td className="px-6 py-4">
                      <div>
                        <h4 className="font-semibold text-slate-200">
                          {emp.designation}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {emp.department}
                        </p>
                      </div>
                    </td>

                    {/* Salary */}
                    <td className="px-6 py-4 font-mono font-semibold text-slate-200">
                      {formatCurrency(emp.salary)}
                    </td>

                    {/* Joining Date */}
                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                      {new Date(emp.joiningDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getStatusBadge(emp.status)}`}
                      >
                        {emp.status}
                      </span>
                    </td>

                    {/* Actions block */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openModal("view", emp)}
                          className="p-2 rounded-lg border border-dark-border text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                          title="View Info"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isHR && (
                          <>
                            <button
                              onClick={() => openModal("edit", emp)}
                              className="p-2 rounded-lg border border-dark-border text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 cursor-pointer"
                              title="Edit Employee"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(emp._id)}
                              className="p-2 rounded-lg border border-dark-border text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {!loading && employees.length > 0 && (
          <div className="px-6 py-4 border-t border-dark-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/10 text-xs">
            <span className="text-slate-400">
              Showing page{" "}
              <strong className="text-slate-200">{pagination.page}</strong> of{" "}
              <strong className="text-slate-200">
                {pagination.totalPages}
              </strong>{" "}
              ({pagination.totalEmployees} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-dark-border text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-dark-border text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CRUD Modal Component */}
      {modalMode && (
        <EmployeeModal
          mode={modalMode}
          employee={selectedEmployee}
          onClose={closeModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border max-w-sm w-full p-6 rounded-3xl animate-scale-in text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Delete Employee?
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              This action is permanent and cannot be undone. All active sessions
              will be terminated.
            </p>
            <div className="flex gap-3">
              <button
                disabled={deleteLoading}
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl border border-dark-border text-sm font-semibold hover:bg-slate-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={deleteLoading}
                onClick={handleDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                {deleteLoading && <Loader className="w-4 h-4 animate-spin" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
