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
    { icon: <FiMessageSquare size={18} />, label: "Chats", subLabel: "Messages", to: "/" },
    { icon: <FiUsers size={18} />, label: "Friends", subLabel: "Connections", to: "/friends" },
    { icon: <FiPhoneCall size={18} />, label: "Calls", subLabel: "History", to: "/calls" },
    { icon: <FiSettings size={18} />, label: "Settings", subLabel: "Account", to: "/settings" },
  ];

  return (
    <motion.aside
      animate={{
        width: leftNavSidebarCollapsed ? 80 : 270,
        minWidth: leftNavSidebarCollapsed ? 80 : 270,
      }}
      transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
      className="hidden md:flex flex-col h-full bg-[#0b0f19] border-r border-white/[0.04] z-20 overflow-y-auto overflow-x-hidden select-none scrollbar-none"
    >
      {/* ── Branding ── */}
      <div
        className={`pt-8 pb-5 ${leftNavSidebarCollapsed ? "px-0 flex justify-center" : "px-6"}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => dispatch(toggleLeftNavSidebar())}
            >
              <PigeonLogo
                className="w-10 h-10 shadow-lg shadow-blue-500/10"
                variant="gradient"
              />
            </div>
            {/* Pulse green dot over Pigeon Logo */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-[#0b0f19] shadow-[0_0_8px_rgba(34,197,94,0.6)]">
              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
            </span>
          </div>
          {!leftNavSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col leading-tight text-left cursor-pointer"
              onClick={() => dispatch(toggleLeftNavSidebar())}
            >
              <span className="text-lg font-black text-white tracking-wide">
                Pigeon
              </span>
              <span className="text-[9px] font-bold text-sky-400 uppercase tracking-[0.15em] mt-0.5">
                Smart Messaging
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── User Profile Card ── */}
      {!leftNavSidebarCollapsed ? (
        <div className="mx-4 mb-5 p-4 rounded-2xl bg-[#141b30]/60 border border-white/[0.05] shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img
                src={
                  user?.profilePicture ||
                  "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                }
                alt="Profile"
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-xl object-cover border border-white/10"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-[#141b30] shadow-[0_0_8px_rgba(34,197,94,0.6)]">
                <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
              </span>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[13px] font-bold text-white uppercase tracking-wide truncate">
                {user?.username || "DEVANSH AGARWAL"}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {user?.email || "devansh.agarwal_cs24@gla.ac.in"}
              </p>
            </div>
          </div>
          <div className="border-t border-white/[0.06] mt-3 pt-3 flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              SESSION STATUS
            </span>
            <span className="text-[10px] font-extrabold text-sky-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              0.08ms | ACTIVE
            </span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center mb-5">
          <div 
            className="relative flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" 
            onClick={() => navigate("/settings")}
          >
            <img
              src={
                user?.profilePicture ||
                "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
              }
              alt="Profile"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border border-white/10"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-[#0b0f19] shadow-[0_0_8px_rgba(34,197,94,0.6)]">
              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
            </span>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex-1 flex flex-col gap-1 mt-2">
        {!leftNavSidebarCollapsed && (
          <div className="px-6 py-2 flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              MENU
            </span>
            <button
              onClick={() => navigate("/friends", { state: { openAddModal: true } })}
              className="text-slate-400 hover:text-sky-400 transition-colors p-1"
              title="Add New Friend"
            >
              <FiUserPlus size={15} />
            </button>
          </div>
        )}
        
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
              subLabel={item.subLabel}
              to={item.to}
              active={isActive}
              collapsed={leftNavSidebarCollapsed}
            />
          );
        })}
      </div>

      {/* ── Premium Call-to-Action ── */}
      {!leftNavSidebarCollapsed && (
        <div className="mx-4 my-4 p-4 rounded-2xl bg-gradient-to-tr from-blue-600/95 via-indigo-650/95 to-purple-650/95 text-white shadow-lg shadow-blue-500/15 relative overflow-hidden group">
          {/* Subtle Ambient Shapes */}
          <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-white/10 blur-xl group-hover:scale-125 transition-transform duration-500" />
          <div className="absolute -left-4 -top-4 w-12 h-12 rounded-full bg-sky-400/20 blur-xl group-hover:scale-125 transition-transform duration-500" />
          
          <div className="relative z-10 text-left">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-sky-200">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Insight
            </span>
            <p className="text-[11px] font-bold leading-relaxed mt-2 text-white/95 text-pretty">
              Experience the future of messaging. Connect securely with high-definition audio & video calls.
            </p>
          </div>
        </div>
      )}

      {/* ── Logout Button ── */}
      <div className={`mt-auto ${leftNavSidebarCollapsed ? "px-3 flex justify-center py-4" : "px-4 py-4"}`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className={`flex items-center justify-center border border-white/[0.08] hover:border-red-500/30 bg-[#161f38]/30 hover:bg-red-500/10 text-slate-300 hover:text-red-400 rounded-xl transition-all duration-200 group relative ${
            leftNavSidebarCollapsed
              ? "w-11 h-11"
              : "w-full py-2.5 px-4 gap-2 text-sm font-semibold shadow-sm"
          }`}
          title="Logout"
        >
          <FiLogOut
            size={18}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
          {!leftNavSidebarCollapsed && <span className="text-[13px] font-semibold">Logout</span>}

          {leftNavSidebarCollapsed && (
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#111827] border border-white/10 text-white text-xs font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 backdrop-blur-md">
              Logout
            </div>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
};

/* ── Nav Item Component ── */
const NavItem = ({ icon, label, subLabel, active, to, collapsed }) => (
  <Link
    to={to}
    className={`relative flex items-center transition-all duration-300 rounded-2xl group
      ${collapsed ? "justify-center mx-3 my-1.5 p-3" : "gap-3.5 px-4 py-3 mx-4 my-1"}
      ${
        active
          ? "bg-[#182343]/60 border border-white/[0.05] text-white shadow-lg"
          : "text-slate-400 hover:text-white border border-transparent hover:bg-white/[0.02]"
      }
    `}
  >
    {/* Sliding active pill indicator */}
    {active && (
      <motion.span
        layoutId="sidebar-active-indicator"
        className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-gradient-to-b from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      />
    )}
    
    {/* Icon Container */}
    <div
      className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300
        ${
          active
            ? "bg-gradient-to-tr from-blue-600 to-indigo-650 text-white shadow-md shadow-blue-500/10"
            : "bg-white/5 border border-white/[0.03] text-slate-400 group-hover:bg-white/10 group-hover:text-white"
        }
      `}
    >
      {icon}
    </div>

    {!collapsed && (
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[13px] font-bold text-white truncate leading-tight">
          {label}
        </p>
        <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
          {subLabel}
        </p>
      </div>
    )}

    {!collapsed && active && (
      <FiChevronRight size={14} className="text-blue-400 shrink-0 animate-pulse" />
    )}

    {collapsed && (
      <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#111827] border border-white/10 text-white text-xs font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 backdrop-blur-md">
        {label}
      </div>
    )}
  </Link>
);

export default Sidebar;
