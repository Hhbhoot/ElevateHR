import React, { useState, useEffect, useRef } from "react";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import type { User } from "../context/AuthContext";
import { X, Loader, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface EmployeeModalProps {
  mode: "add" | "edit" | "view";
  employee: User | null;
  onClose: (shouldRefresh?: boolean) => void;
  isInline?: boolean;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  mode,
  employee,
  onClose,
  isInline = false,
}) => {
  const { user: currentUser, setUser: setCurrentUserInContext } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Photo Upload States & Refs
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Terminated">(
    "Active",
  );
  const [role, setRole] = useState<"HR" | "Manager" | "Employee">("Employee");

  const isHR = currentUser?.role === "HR";
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const canEditAdminFields = isHR;

  useEffect(() => {
    resetForm();
  }, [employee]);

  const resetForm = () => {
    if (employee) {
      setName(employee.name);
      setEmail(employee.email);
      setDepartment(employee.department);
      setDesignation(employee.designation);
      setSalary(employee.salary.toString());
      setRole(employee.role);
      setStatus(employee.status);
      setPassword("");
      setProfilePhotoUrl(employee.profilePhoto || "");

      if (employee.joiningDate) {
        setJoiningDate(
          new Date(employee.joiningDate).toISOString().split("T")[0],
        );
      }
    }
  };

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employee) return;

    setPhotoLoading(true);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await api(`/employees/${employee._id}/photo`, {
        method: "PATCH",
        body: formData,
      });

      const updatedEmp = res.data;
      setProfilePhotoUrl(updatedEmp.profilePhoto);

      // Sync local context if updating self profile
      if (currentUser?._id === employee._id) {
        setCurrentUserInContext(updatedEmp);
        localStorage.setItem("currentUser", JSON.stringify(updatedEmp));
      }

      toast.success("Profile photo uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload photo");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const parsedSalary = parseFloat(salary);
    if (isNaN(parsedSalary) || parsedSalary < 0) {
      setError("Salary must be a valid positive number");
      setLoading(false);
      return;
    }

    try {
      const payload: any = {};

      if (isAdd) {
        payload.name = name;
        payload.email = email;
        payload.password = password;
        payload.department = department;
        payload.designation = designation;
        payload.salary = parsedSalary;
        payload.role = role;
        payload.status = status;
        if (joiningDate) payload.joiningDate = joiningDate;

        await api("/employees", {
          method: "POST",
          body: payload,
        });
      } else if (isEdit && employee) {
        payload.name = name;
        payload.email = email;
        if (password) payload.password = password;

        if (canEditAdminFields) {
          payload.department = department;
          payload.designation = designation;
          payload.salary = parsedSalary;
          payload.role = role;
          payload.status = status;
          if (joiningDate) payload.joiningDate = joiningDate;
        }

        const response = await api(`/employees/${employee._id}`, {
          method: "PATCH",
          body: payload,
        });

        if (currentUser?._id === employee._id) {
          const updatedUser = response.data;
          setCurrentUserInContext(updatedUser);
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        }
      }

      toast.success(
        isAdd
          ? "Employee created successfully!"
          : "Profile updated successfully!",
      );
      onClose(true);
    } catch (err: any) {
      setError(err?.message || "Operation failed. Please try again.");
      toast.error(err?.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (isView) return "Employee Details";
    if (isAdd) return "Add New Employee";
    return "Edit Employee Profile";
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Profile Photo Upload Section */}
      {(mode === "edit" || mode === "view") && employee && (
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative group">
            {profilePhotoUrl ? (
              <img
                src={profilePhotoUrl}
                alt={name}
                className="w-24 h-24 rounded-full object-cover border-2 border-primary-500/30 shadow-lg shadow-primary-500/5"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-3xl text-primary-400">
                {name.charAt(0)}
              </div>
            )}

            {mode === "edit" && (isHR || currentUser?._id === employee._id) && (
              <button
                type="button"
                onClick={handlePhotoUploadClick}
                disabled={photoLoading}
                className={`absolute inset-0 bg-black/60 rounded-full flex items-center justify-center transition-opacity duration-200 cursor-pointer ${
                  photoLoading
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {photoLoading ? (
                  <Loader className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                    Upload
                  </span>
                )}
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            accept="image/*"
            className="hidden"
          />
          {mode === "edit" && (isHR || currentUser?._id === employee._id) && (
            <p className="text-[10px] text-slate-500 mt-2">
              JPG, PNG or WEBP. Max size 5MB.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isView || loading}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50"
            placeholder="Jane Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isView || loading}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50 font-mono"
            placeholder="jane.doe@company.com"
          />
        </div>

        {/* Password */}
        {!isView && (
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Password{" "}
              {isEdit && (
                <span className="text-[10px] text-slate-500">
                  (Leave blank to keep current)
                </span>
              )}
            </label>
            <input
              type="password"
              required={isAdd}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
        )}

        {/* Role */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Organizational Role
          </label>
          <select
            value={role}
            onChange={(e: any) => setRole(e.target.value)}
            disabled={isView || !canEditAdminFields || loading}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="HR">HR Lead</option>
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Department
          </label>
          {isView || !canEditAdminFields ? (
            <input
              type="text"
              value={department}
              disabled
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-slate-400 text-sm disabled:opacity-50"
            />
          ) : (
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              disabled={loading}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          )}
        </div>

        {/* Designation */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Designation
          </label>
          <input
            type="text"
            required
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            disabled={isView || !canEditAdminFields || loading}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50"
            placeholder="Software Engineer"
          />
        </div>

        {/* Salary */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Salary (USD)
          </label>
          <input
            type="number"
            required
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            disabled={isView || !canEditAdminFields || loading}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50 font-mono"
            placeholder="60000"
          />
        </div>

        {/* Joining Date */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Joining Date
          </label>
          <input
            type="date"
            required
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            disabled={isView || !canEditAdminFields || loading}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50 font-mono"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Staff Status
          </label>
          <select
            value={status}
            onChange={(e: any) => setStatus(e.target.value)}
            disabled={isView || !canEditAdminFields || loading}
            className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2.5 text-slate-300 text-sm focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t border-dark-border/60 flex justify-end gap-3">
        {!isInline ? (
          <button
            type="button"
            onClick={() => onClose(false)}
            className="py-2.5 px-5 rounded-xl border border-dark-border text-slate-300 hover:bg-slate-800 transition-colors text-sm font-semibold cursor-pointer"
          >
            {isView ? "Close" : "Cancel"}
          </button>
        ) : (
          !isView && (
            <button
              type="button"
              onClick={resetForm}
              className="py-2.5 px-5 rounded-xl border border-dark-border text-slate-300 hover:bg-slate-800 transition-colors text-sm font-semibold cursor-pointer"
            >
              Reset
            </button>
          )
        )}
        {!isView && (
          <button
            type="submit"
            disabled={loading}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-primary-600/10 flex items-center gap-2 cursor-pointer"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {isAdd ? "Create Employee" : "Save Changes"}
          </button>
        )}
      </div>
    </form>
  );

  if (isInline) {
    return <div className="bg-dark-card overflow-hidden">{formContent}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-dark-card border border-dark-border max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl animate-scale-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-border/60 bg-slate-900/10">
          <h3 className="text-lg font-bold text-white tracking-wide">
            {getTitle()}
          </h3>
          <button
            onClick={() => onClose(false)}
            className="p-1 rounded-lg border border-dark-border hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {formContent}
      </div>
    </div>
  );
};
