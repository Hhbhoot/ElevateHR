import React, { useState, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Employees } from "./pages/Employees";
import { Profile } from "./pages/Profile";
import { Loader } from "lucide-react";

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState("dashboard");

  const prevUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (user) {
      const prevUserId = prevUserRef.current;
      const currentUserId = user._id;

      // Only redirect on initial login / session change
      if (prevUserId !== currentUserId) {
        if (user.role === "Employee") {
          setCurrentTab("profile");
        } else {
          setCurrentTab("dashboard");
        }
      }
      prevUserRef.current = currentUserId;
    } else {
      prevUserRef.current = null;
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-4">
        <Loader className="w-12 h-12 animate-spin text-primary-500" />
        <span className="text-sm text-slate-400 font-medium">
          Booting management portal...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout currentTab={currentTab} onTabChange={setCurrentTab}>
      {currentTab === "dashboard" &&
        (user.role === "HR" || user.role === "Manager") && <Dashboard />}

      {currentTab === "employees" &&
        (user.role === "HR" || user.role === "Manager") && <Employees />}

      {currentTab === "profile" && <Profile />}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#151b2c",
            color: "#f1f5f9",
            border: "1px solid #222d44",
          },
        }}
      />
      <AppContent />
    </AuthProvider>
  );
};

export default App;
