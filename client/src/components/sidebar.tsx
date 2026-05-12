import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FileText, 
  UserCheck, 
  BarChart3, 
  Settings,
  Trash2,
  Plus
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Submit Report", href: "/submit-report", icon: Plus },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Citizens", href: "/citizens", icon: UserCheck },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar transition-transform">
      <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
        {/* Logo/Brand */}
        <div className="mb-8 flex items-center space-x-3">
          <motion.div 
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="h-6 w-6 text-sidebar-primary-foreground" />
          </motion.div>
          <span className="text-xl font-bold text-sidebar-foreground">EcoTech</span>
        </div>
        
        {/* Navigation Menu */}
        <nav className="space-y-2 font-medium">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  className={`sidebar-nav-item group flex items-center rounded-lg p-2 ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-gray-300 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  <item.icon className={`h-5 w-5 transition duration-75 ${
                    isActive ? "text-sidebar-accent-foreground" : "text-gray-400 group-hover:text-sidebar-foreground"
                  }`} />
                  <span className="ml-3">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
