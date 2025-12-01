import {Outlet, Link, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";
import {signOut} from "firebase/auth";
import {auth} from "../config/firebase";
import {LayoutDashboard, Users, FileText, BookOpen, Activity, LogOut} from "lucide-react";

export default function Layout() {
  const {user} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const navItems = [
    {path: "/dashboard", label: "Dashboard", icon: LayoutDashboard},
    {path: "/users", label: "Users", icon: Users},
    {path: "/assessments", label: "Assessments", icon: FileText},
    {path: "/articles", label: "Articles", icon: BookOpen},
    {path: "/ml-monitor", label: "ML Monitor", icon: Activity},
  ];

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">EmpowerHer Admin</h1>
        </div>
        <nav className="px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

