import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme, toggleProfileSidebar } from "../../redux/slices/uiSlice";
import { logout } from "../../redux/slices/authSlice";
import {
  FiMoon,
  FiSun,
  FiBell,
  FiSettings,
  FiLogOut,
  FiInfo,
  FiSearch,
  FiUsers,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import PigeonLogo from "../Logo";

const RightNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { theme } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  const { activeChat } = useSelector((state) => state.chat);

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

  const topActions = [
    {
      icon: <FiBell size={18} />,
      label: "Notifications",
      onClick: () => navigate("/notifications"),
      active: location.pathname === "/notifications",
    },
    {
      icon: <FiSearch size={18} />,
      label: "Search",
      onClick: () => {},
      active: false,
    },
    {
      icon: <FiUsers size={18} />,
      label: "Friends",
      onClick: () => navigate("/friends"),
      active: location.pathname === "/friends",
    },
  ];

  const bottomActions = [
    {
      icon:
        theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />,
      label: theme === "dark" ? "Light Mode" : "Dark Mode",
      onClick: () => dispatch(toggleTheme()),
    },
    {
      icon: <FiSettings size={18} />,
      label: "Settings",
      onClick: () => navigate("/settings"),
      active: location.pathname === "/settings",
    },
  ];

  return (
    <aside className="hidden md:flex flex-col items-center h-full w-[68px] min-w-[68px] bg-[#0b0f19]/80 border-l border-white/[0.04] py-5 select-none z-20 backdrop-blur-xl">
      {/* ── User Avatar at Top ── */}
      <div className="mb-6 relative group">
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer"
          onClick={() => navigate("/settings")}
        >
          <img
            src={
              user?.profilePicture ||
              "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
            }
            alt="Profile"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-lg shadow-blue-500/10 ring-2 ring-transparent group-hover:ring-sky-500/40 transition-all duration-300"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-[#0b0f19] shadow-[0_0_8px_rgba(34,197,94,0.6)]">
            <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
          </span>
        </motion.div>
        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#111827] border border-white/10 text-white text-xs font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 backdrop-blur-md">
          {user?.username || "Profile"}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="w-8 h-px bg-white/[0.06] mb-4" />

      {/* ── Top Actions ── */}
      <div className="flex flex-col items-center gap-1.5">
        {topActions.map((action, idx) => (
          <NavAction key={idx} {...action} />
        ))}
      </div>

      {/* ── Profile Info Toggle (only when active chat exists) ── */}
      {activeChat && (
        <>
          <div className="w-8 h-px bg-white/[0.06] my-4" />
          <NavAction
            icon={<FiInfo size={18} />}
            label="Chat Info"
            onClick={() => dispatch(toggleProfileSidebar())}
            active={false}
          />
        </>
      )}

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Bottom Actions ── */}
      <div className="flex flex-col items-center gap-1.5">
        {user?.role === "admin" && (
          <NavAction
            icon={<FiShield size={18} />}
            label="Admin"
            onClick={() => navigate("/admin")}
            active={location.pathname === "/admin"}
          />
        )}
        {bottomActions.map((action, idx) => (
          <NavAction key={idx} {...action} />
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="w-8 h-px bg-white/[0.06] my-4" />

      {/* ── Logout ── */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-white/[0.06] bg-[#161f38]/30 hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all duration-200 group mb-2"
        title="Logout"
      >
        <FiLogOut
          size={17}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#111827] border border-white/10 text-white text-xs font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 backdrop-blur-md">
          Logout
        </div>
      </motion.button>

      {/* ── Pigeon Mini Logo ── */}
      <div className="mt-1 opacity-40 hover:opacity-70 transition-opacity duration-300">
        <PigeonLogo className="w-6 h-6" variant="gradient" />
      </div>
    </aside>
  );
};

/* ── Single Nav Action Button ── */
const NavAction = ({ icon, label, onClick, active }) => (
  <motion.button
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group
      ${
        active
          ? "bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 text-white border border-white/[0.08] shadow-lg shadow-blue-500/10"
          : "text-slate-400 hover:text-white border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
      }
    `}
    title={label}
  >
    {/* Active glow indicator */}
    {active && (
      <motion.span
        layoutId="right-nav-active"
        className="absolute right-0 top-2 bottom-2 w-[3px] rounded-l-full bg-gradient-to-b from-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      />
    )}
    {icon}
    {/* Tooltip */}
    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#111827] border border-white/10 text-white text-xs font-bold rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 backdrop-blur-md">
      {label}
    </div>
  </motion.button>
);

export default RightNavbar;
