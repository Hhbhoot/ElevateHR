import React from "react";
import { useAuth } from "../context/AuthContext";
import { EmployeeModal } from "../components/EmployeeModal";
import { User as UserIcon, Calendar, Briefcase } from "lucide-react";

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-wide">
          Account Settings
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage profile credentials and information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview Card */}
        <div className="bg-dark-card border border-dark-border p-6 rounded-2xl relative overflow-hidden text-center flex flex-col items-center justify-center">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary-600/5 blur-2xl pointer-events-none"></div>
          {user.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-primary-500/30 mb-4 shadow-lg shadow-primary-500/5"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-primary-500/30 flex items-center justify-center font-bold text-2xl text-primary-400 mb-4 shadow-lg shadow-primary-500/5">
              {user.name.charAt(0)}
            </div>
          )}
          <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
          <p className="text-xs text-primary-400 font-semibold tracking-wider uppercase bg-primary-500/10 px-3 py-0.5 rounded-full border border-primary-500/20">
            {user.role} Member
          </p>

          <div className="w-full mt-6 space-y-3.5 border-t border-dark-border/40 pt-6 text-sm text-left">
            <div className="flex items-center gap-3 text-slate-300">
              <Briefcase className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">
                  Designation & Dept
                </p>
                <p className="font-semibold text-slate-200">
                  {user.designation} ({user.department})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Calendar className="w-4.5 h-4.5 text-slate-500" />
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">
                  Corporate Joining Date
                </p>
                <p className="font-semibold text-slate-200">
                  {new Date(user.joiningDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile editor panel */}
        <div className="bg-dark-card border border-dark-border rounded-2xl lg:col-span-2 overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-border/60 bg-slate-900/10 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary-400" />
            <h3 className="font-bold text-white">Modify Credentials</h3>
          </div>

          <div className="p-6">
            <EmployeeModal
              mode="edit"
              employee={user}
              isInline={true}
              onClose={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
