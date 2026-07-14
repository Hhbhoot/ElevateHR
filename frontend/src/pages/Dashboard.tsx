import React, { useEffect, useState } from "react";
import { api } from "../utils/api";
import {
  Users,
  UserCheck,
  DollarSign,
  UserPlus,
  TrendingUp,
  Award,
  Loader,
  RefreshCw,
} from "lucide-react";

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  departmentWiseCount: { department: string; count: number }[];
  averageSalary: number;
  highestPaidEmployee: {
    name: string;
    email: string;
    department: string;
    designation: string;
    salary: number;
    status: string;
  } | null;
  employeesJoinedThisMonth: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api("/dashboard");
      setStats(res.data);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Loader className="w-10 h-10 animate-spin text-primary-500" />
        <span className="text-sm text-slate-400">
          Loading analytics dashboard...
        </span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 border border-rose-500/20 bg-rose-500/10 rounded-2xl text-center max-w-xl mx-auto">
        <p className="text-rose-400 font-semibold mb-4">
          {error || "Something went wrong"}
        </p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Find max count of employees in a department to compute percentage widths
  const maxDeptCount = Math.max(
    ...stats.departmentWiseCount.map((d) => d.count),
    1,
  );

  return (
    <div className="space-y-8">
      {/* Welcome & Refresh Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Enterprise Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time metric breakdowns and organizational overview
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 border border-dark-border rounded-xl text-xs font-semibold hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-500/5 blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Headcount
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {stats.totalEmployees}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-blue-400 font-semibold">100%</span>
            <span>registered staff members</span>
          </div>
        </div>

        {/* Active Employees */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Staff
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {stats.activeEmployees}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">
              {stats.totalEmployees > 0
                ? Math.round(
                    (stats.activeEmployees / stats.totalEmployees) * 100,
                  )
                : 0}
              %
            </span>
            <span>of total staff active</span>
          </div>
        </div>

        {/* Average Salary */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-500/5 blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Average Salary
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {formatCurrency(stats.averageSalary)}
              </h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>company-wide standard mean</span>
          </div>
        </div>

        {/* Joined This Month */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-amber-500/5 blur-2xl pointer-events-none"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                New Hires
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {stats.employeesJoinedThisMonth}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-amber-400 font-semibold">Joined</span>
            <span>during this calendar month</span>
          </div>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department-wise Bar Chart */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-2xl lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">
              Department Headcounts
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Staff distribution by departmental units
            </p>
          </div>

          <div className="space-y-4">
            {stats.departmentWiseCount.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No department data available
              </p>
            ) : (
              stats.departmentWiseCount.map((dept, idx) => {
                const percent = Math.round((dept.count / maxDeptCount) * 100);
                const colors = [
                  "bg-blue-500 shadow-blue-500/20",
                  "bg-purple-500 shadow-purple-500/20",
                  "bg-rose-500 shadow-rose-500/20",
                  "bg-amber-500 shadow-amber-500/20",
                  "bg-cyan-500 shadow-cyan-500/20",
                ];
                const activeColor = colors[idx % colors.length];

                return (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-300">
                        {dept.department}
                      </span>
                      <span className="text-xs font-bold text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-dark-border">
                        {dept.count} {dept.count === 1 ? "member" : "members"}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-dark-border/40">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${activeColor}`}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Highest Paid Employee Panel */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none group-hover:bg-indigo-500/15 transition-all"></div>
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h3 className="text-lg font-bold text-white">Top Earner</h3>
            </div>

            {stats.highestPaidEmployee ? (
              <div className="space-y-6">
                {/* Employee Info Card */}
                <div className="flex items-center gap-4 bg-slate-900/30 border border-dark-border/40 p-4 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center font-black text-white text-lg">
                    {stats.highestPaidEmployee.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-200 truncate">
                      {stats.highestPaidEmployee.name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      {stats.highestPaidEmployee.designation}
                    </p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center py-1.5 border-b border-dark-border/30">
                    <span className="text-slate-400">Department</span>
                    <span className="font-semibold text-slate-200">
                      {stats.highestPaidEmployee.department}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-dark-border/30">
                    <span className="text-slate-400">Status</span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {stats.highestPaidEmployee.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-dark-border/30">
                    <span className="text-slate-400">Email</span>
                    <span className="text-slate-300 font-mono text-xs truncate max-w-[160px]">
                      {stats.highestPaidEmployee.email}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No employee records found
              </p>
            )}
          </div>

          {stats.highestPaidEmployee && (
            <div className="mt-8 pt-6 border-t border-dark-border/40 text-center">
              <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">
                Annual Compensation Value
              </span>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {formatCurrency(stats.highestPaidEmployee.salary)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
