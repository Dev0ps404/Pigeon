import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme, toggleLeftNavSidebar } from "../../redux/slices/uiSlice";
import { logout } from "../../redux/slices/authSlice";
import {
  FiMessageSquare,
  FiUsers,
  FiPhoneCall,
  FiSettings,
  FiMoon,
  FiSun,
  FiLogOut,
  FiBell,
  FiHome,
  FiMoreHorizontal,
  FiUserCheck,
  FiShield,
  FiUserPlus,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import PigeonLogo from "../Logo";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { leftNavSidebarCollapsed } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      dispatch(logout());
      toast.success("Successfully logged out!");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const navItems = [
    { icon: <FiMessageSquare size={20} />, label: "Chats", to: "/" },
    { icon: <FiUsers size={20} />, label: "Friends", to: "/friends" },
    { icon: <FiPhoneCall size={20} />, label: "Calls", to: "/calls" },
    { icon: <FiSettings size={20} />, label: "Settings", to: "/settings" },
  ];

  return (
    <motion.aside
      animate={{
        width: leftNavSidebarCollapsed ? 76 : 220,
        minWidth: leftNavSidebarCollapsed ? 76 : 220,
      }}
      transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
      className="hidden md:flex flex-col h-full bg-[#111827]/40 dark:bg-[#0c1226]/40 border-r border-white/5 z-20 overflow-hidden backdrop-blur-3xl"
    >
      {/* ── Branding ── */}
      <div
        className={`pt-8 pb-6 ${leftNavSidebarCollapsed ? "px-0 flex justify-center" : "px-6"}`}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => dispatch(toggleLeftNavSidebar())}
          >
            <PigeonLogo className="w-10 h-10 shadow-lg shadow-blue-500/10" variant="gradient" />
          </div>
          {!leftNavSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col leading-tight"
            >
              <span className="text-[17px] font-extrabold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Pigeon
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Terminal
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Add Friend Button ── */}
      <div
        className={`mb-5 ${leftNavSidebarCollapsed ? "px-3 flex justify-center" : "px-5"}`}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            navigate("/friends", { state: { openAddModal: true } })
          }
          className={`flex items-center justify-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-2xl transition-all shadow-lg active:scale-[0.98] relative group ${
            leftNavSidebarCollapsed
              ? "w-11 h-11 p-0"
              : "w-full py-3 gap-2.5 text-sm font-bold tracking-wide"
          }`}
        >
          <FiUserPlus size={16} className="shrink-0" />
          {!leftNavSidebarCollapsed && <span>Add New Friend</span>}

          {leftNavSidebarCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#111827] border border-white/10 text-white text-xs font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 backdrop-blur-md">
              Add New Friend
            </div>
          )}
        </motion.button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 flex flex-col gap-1 mt-2">
        {navItems.map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);

          return (
            <NavItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              active={isActive}
              collapsed={leftNavSidebarCollapsed}
            />
          );
        })}
      </nav>

      {/* ── Action Buttons ── */}
      <div className="mt-auto flex flex-col gap-1 pb-3">
        {/* ── Logout Button ── */}
        <div
          className={
            leftNavSidebarCollapsed ? "px-3 flex justify-center" : "px-5"
          }
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={`flex items-center text-gray-400 hover:text-red-400 dark:text-gray-400 dark:hover:text-red-400 rounded-2xl hover:bg-red-500/10 border border-transparent hover:border-red-500/10 transition-all group relative ${
              leftNavSidebarCollapsed
                ? "w-11 h-11 justify-center"
                : "w-full py-3 px-4 gap-3.5"
            }`}
            title="Logout"
          >
            <FiLogOut size={20} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            {!leftNavSidebarCollapsed && (
              <span className="text-sm font-bold tracking-wide">Logout</span>
            )}

            {leftNavSidebarCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#111827] border border-white/10 text-white text-xs font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 backdrop-blur-md">
                Logout
              </div>
            )}
          </motion.button>
        </div>

        {/* ── Toggle Sidebar Button ── */}
        <div
          className={
            leftNavSidebarCollapsed ? "px-3 flex justify-center" : "px-5"
          }
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch(toggleLeftNavSidebar())}
            className={`flex items-center text-gray-400 hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-400 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group relative ${
              leftNavSidebarCollapsed
                ? "w-11 h-11 justify-center"
                : "w-full py-3 px-4 gap-3.5"
            }`}
            title={
              leftNavSidebarCollapsed
                ? "Expand Navigation"
                : "Collapse Navigation"
            }
          >
            {leftNavSidebarCollapsed ? (
              <FiChevronRight size={20} />
            ) : (
              <FiChevronLeft size={20} />
            )}
            {!leftNavSidebarCollapsed && (
              <span className="text-sm font-bold tracking-wide">Collapse Nav</span>
            )}
            {leftNavSidebarCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#111827] border border-white/10 text-white text-xs font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 backdrop-blur-md">
                Expand Navigation
              </div>
            )}
          </motion.button>
        </div>
      </div>

      {/* ── User Profile Capsule ── */}
      <div
        className={`pb-6 pt-2 ${leftNavSidebarCollapsed ? "px-3 flex justify-center" : "px-5"}`}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/settings")}
          className={`flex items-center rounded-2xl cursor-pointer bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all ${
            leftNavSidebarCollapsed ? "p-2 justify-center" : "p-3 gap-3.5 w-full"
          }`}
        >
          <div className="relative flex-shrink-0">
            <img
              src={
                user?.profilePicture ||
                "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
              }
              alt="Profile"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
            {/* Pulsing online green status indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-[#0f172a]">
              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
            </span>
          </div>
          {!leftNavSidebarCollapsed && (
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[14px] font-bold text-white truncate leading-tight">
                {user?.username || "User"}
              </p>
              <p className="text-[11px] font-semibold text-green-400 mt-0.5 tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Online
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.aside>
  );
};

/* ── Nav Item Component ── */
const NavItem = ({ icon, label, active, to, collapsed }) => (
  <Link
    to={to}
    className={`relative flex items-center transition-all duration-300 rounded-2xl group
      ${collapsed ? "justify-center mx-3 my-0.5 p-3" : "gap-3.5 px-4 py-3 mx-3 my-0.5 text-sm font-bold tracking-wide"}
      ${
        active
          ? "bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 text-blue-400 border border-white/5 shadow-[0_0_15px_rgba(59,130,246,0.08)]"
          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
      }
    `}
  >
    {/* Sliding active bar indicator */}
    {active && (
      <motion.span
        layoutId="sidebar-active-indicator"
        className="absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-r-full bg-gradient-to-b from-blue-400 to-indigo-400"
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      />
    )}
    <span className={`shrink-0 transition-transform duration-300 group-hover:scale-115 ${active ? "text-blue-400" : "text-gray-400 group-hover:text-white"}`}>
      {icon}
    </span>
    {!collapsed && <span>{label}</span>}

    {collapsed && (
      <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#111827] border border-white/10 text-white text-xs font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 backdrop-blur-md">
        {label}
      </div>
    )}
  </Link>
);

export default Sidebar;
