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
  const { theme, leftNavSidebarCollapsed } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      dispatch(logout());
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const navItems = [
    { icon: <FiMessageSquare size={20} />, label: "Chats", to: "/" },
    { icon: <FiUsers size={20} />, label: "Groups", to: "/groups" },
    { icon: <FiPhoneCall size={20} />, label: "Calls", to: "/calls" },
    { icon: <FiUserCheck size={20} />, label: "Contacts", to: "/friends" },
    { icon: <FiSettings size={20} />, label: "Settings", to: "/settings" },
  ];

  return (
    <motion.aside
      animate={{
        width: leftNavSidebarCollapsed ? 72 : 200,
        minWidth: leftNavSidebarCollapsed ? 72 : 200,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-20 overflow-hidden"
    >
      {/* ── Branding ── */}
      <div
        className={`pt-7 pb-6 ${leftNavSidebarCollapsed ? "px-0 flex justify-center" : "px-5"}`}
      >
        <div className="flex items-center gap-3">
          {/* Bird / phone icon in a blue circle */}
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => dispatch(toggleLeftNavSidebar())}
          >
            <PigeonLogo className="w-10 h-10" variant="gradient" />
          </div>
          {!leftNavSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col leading-tight"
            >
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                Pigeon
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 -mt-0.5">
                Messaging
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* â”€â”€ Add Friend Button â”€â”€ */}
      <div
        className={`mb-4 ${leftNavSidebarCollapsed ? "px-2 flex justify-center" : "px-4"}`}
      >
        <button
          onClick={() =>
            navigate("/friends", { state: { openAddModal: true } })
          }
          className={`flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm active:scale-[0.98] relative group ${
            leftNavSidebarCollapsed
              ? "w-10 h-10 p-0"
              : "w-full py-2.5 gap-2 text-sm font-semibold"
          }`}
        >
          <FiUserPlus size={16} className="shrink-0" />
          {!leftNavSidebarCollapsed && <span>Add New Friend</span>}

          {leftNavSidebarCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50">
              Add New Friend
            </div>
          )}
        </button>
      </div>

      {/* â”€â”€ Navigation â”€â”€ */}
      <nav className="flex-1 flex flex-col gap-0.5 mt-1">
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

      {/* â”€â”€ Action Buttons â”€â”€ */}
      <div className="mt-auto flex flex-col gap-1 pb-2">
        {/* â”€â”€ Logout Button â”€â”€ */}
        <div
          className={
            leftNavSidebarCollapsed ? "px-2 flex justify-center" : "px-4"
          }
        >
          <button
            onClick={handleLogout}
            className={`flex items-center text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group relative ${
              leftNavSidebarCollapsed
                ? "w-10 h-10 justify-center"
                : "w-full py-2.5 px-3 gap-2"
            }`}
            title="Logout"
          >
            <FiLogOut size={20} />
            {!leftNavSidebarCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}

            {leftNavSidebarCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>

        {/* â”€â”€ Toggle Sidebar Button â”€â”€ */}
        <div
          className={
            leftNavSidebarCollapsed ? "px-2 flex justify-center" : "px-4"
          }
        >
          <button
            onClick={() => dispatch(toggleLeftNavSidebar())}
            className={`flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group relative ${
              leftNavSidebarCollapsed
                ? "w-10 h-10 justify-center"
                : "w-full py-2.5 px-3 gap-2"
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
              <span className="text-sm font-medium">Collapse Nav</span>
            )}
            {leftNavSidebarCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50">
                Expand Navigation
              </div>
            )}
          </button>
        </div>
      </div>

      {/* â”€â”€ User profile â”€â”€ */}
      <div
        className={`pb-5 ${leftNavSidebarCollapsed ? "px-2 flex justify-center" : "px-4"}`}
      >
        <div
          onClick={() => navigate("/settings")}
          className={`flex items-center rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
            leftNavSidebarCollapsed ? "p-1" : "p-2 gap-3"
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
              className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
          </div>
          {!leftNavSidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Online</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

/* â”€â”€ Nav Item â”€â”€ */
const NavItem = ({ icon, label, active, to, collapsed }) => (
  <Link
    to={to}
    className={`relative flex items-center transition-all duration-150 rounded-xl group
      ${collapsed ? "justify-center mx-2 my-0.5 p-3" : "gap-3 px-5 py-2.5 mx-2 my-0.5 text-sm font-medium"}
      ${
        active
          ? "bg-blue-50/70 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
          : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/40"
      }
    `}
  >
    {/* Active indicator */}
    {active && (
      <motion.span
        layoutId="sidebar-active-indicator"
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-blue-600 dark:bg-blue-400"
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />
    )}
    <span className="shrink-0">{icon}</span>
    {!collapsed && <span>{label}</span>}

    {collapsed && (
      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </Link>
);

export default Sidebar;
