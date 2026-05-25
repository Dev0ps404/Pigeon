import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShield,
  FiUsers,
  FiMessageSquare,
  FiActivity,
  FiLock,
  FiUnlock,
  FiTrendingUp,
  FiSearch,
  FiRefreshCw,
} from "react-icons/fi";
import api from "../services/api";
import toast from "react-hot-toast";

const Admin = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalMessages: 0,
    totalChats: 0,
    activeUsersNow: 0,
    messageVolume: [],
  });

  const [users, setUsers] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const metricsRes = await api.get("/admin/metrics?simulated=true");
      setMetrics(metricsRes.data);

      const usersRes = await api.get("/admin/users");
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load administrative analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleBan = async (userId) => {
    try {
      setActionLoading(userId);
      const { data } = await api.put(`/admin/users/${userId}/ban`);

      // Update list
      setUsers(
        users.map((u) =>
          u._id === userId ? { ...u, verified: data.user.verified } : u,
        ),
      );
      toast.success(data.message || "User status updated");
    } catch (error) {
      toast.error("Failed to modify user access");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchVal.toLowerCase()) ||
      u.email.toLowerCase().includes(searchVal.toLowerCase()),
  );

  // SVG Chart configuration
  const chartHeight = 140;
  const chartWidth = 400;
  const padding = 25;
  const points = metrics.messageVolume || [];

  const maxVal =
    points.length > 0 ? Math.max(...points.map((p) => p.count), 10) : 10;

  const svgCoordinates = points.map((p, idx) => {
    const x =
      padding + (idx * (chartWidth - padding * 2)) / (points.length - 1 || 1);
    const y =
      chartHeight - padding - (p.count * (chartHeight - padding * 2)) / maxVal;
    return { x, y, label: p.day, value: p.count };
  });

  const pathD = svgCoordinates.reduce((acc, point, idx) => {
    return idx === 0
      ? `M ${point.x} ${point.y}`
      : `${acc} L ${point.x} ${point.y}`;
  }, "");

  const areaD =
    points.length > 0
      ? `${pathD} L ${svgCoordinates[svgCoordinates.length - 1].x} ${chartHeight - padding} L ${svgCoordinates[0].x} ${chartHeight - padding} Z`
      : "";

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f3f4f6] dark:bg-[#030712] overflow-hidden shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-t border-l border-white/50 dark:border-white/5 relative z-10 p-6 lg:p-8">
      {/* Top Banner Control */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shadow-sm">
            <FiShield size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Admin Dashboard
            </h2>
            <p className="text-xs text-gray-500">
              Real-time statistics & global user management
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-3 bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-bg text-gray-600 dark:text-gray-300 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm transition-all hover:rotate-180"
          title="Reload Metrics"
        >
          <FiRefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
          Loading metrics and logs...
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
          {/* Numerical Grid Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<FiUsers className="text-blue-500" />}
              title="Total Accounts"
              value={metrics.totalUsers}
              change="+4% this week"
            />
            <StatCard
              icon={<FiMessageSquare className="text-purple-500" />}
              title="Total Messages"
              value={metrics.totalMessages}
              change="+12% today"
            />
            <StatCard
              icon={<FiActivity className="text-green-500" />}
              title="Channels Active"
              value={metrics.totalChats}
              change="Healthy"
            />
            <StatCard
              icon={<FiTrendingUp className="text-indigo-500" />}
              title="Live Sockets"
              value={metrics.activeUsersNow}
              change="Connected"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Analytics Container */}
            <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Weekly Message Volumetrics
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Calculated from total server messaging index metrics
                </p>
              </div>

              {/* Dynamic Animated Chart */}
              <div className="w-full flex items-center justify-center py-4">
                {points.length > 0 ? (
                  <svg
                    className="w-full max-w-[450px] overflow-visible"
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  >
                    <defs>
                      <linearGradient
                        id="chartGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3b82f6"
                          stopOpacity="0.25"
                        />
                        <stop
                          offset="100%"
                          stopColor="#3b82f6"
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>

                    {/* horizontal grid helper lines */}
                    <line
                      x1={padding}
                      y1={chartHeight - padding}
                      x2={chartWidth - padding}
                      y2={chartHeight - padding}
                      stroke="#9ca3af"
                      strokeWidth="0.5"
                      strokeDasharray="3 3"
                      opacity="0.3"
                    />
                    <line
                      x1={padding}
                      y1={(chartHeight - padding) / 2}
                      x2={chartWidth - padding}
                      y2={(chartHeight - padding) / 2}
                      stroke="#9ca3af"
                      strokeWidth="0.5"
                      strokeDasharray="3 3"
                      opacity="0.3"
                    />

                    {/* Gradient Area Fill */}
                    <motion.path
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1 }}
                      d={areaD}
                      fill="url(#chartGrad)"
                    />

                    {/* Drawing Line Path */}
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, ease: "easeInOut" }}
                      d={pathD}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                    />

                    {/* Dynamic Data Points */}
                    {svgCoordinates.map((coord, i) => (
                      <g key={i}>
                        <circle
                          cx={coord.x}
                          cy={coord.y}
                          r="4"
                          className="fill-white stroke-blue-500 stroke-[2] cursor-pointer hover:r-[6] transition-all"
                        />
                        <text
                          x={coord.x}
                          y={chartHeight - 8}
                          textAnchor="middle"
                          className="text-[9px] fill-gray-400 font-semibold"
                        >
                          {coord.label}
                        </text>
                        <text
                          x={coord.x}
                          y={coord.y - 8}
                          textAnchor="middle"
                          className="text-[9px] fill-blue-600 dark:fill-blue-400 font-bold"
                        >
                          {coord.value}
                        </text>
                      </g>
                    ))}
                  </svg>
                ) : (
                  <p className="text-xs text-gray-400">
                    Loading chart paths...
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white text-base mb-4">
                Operations Center
              </h3>
              <div className="space-y-3">
                <OperationalTile
                  label="Server Latency"
                  value="24ms"
                  status="Excellent"
                />
                <OperationalTile
                  label="Database Operations"
                  value="MongoDB Atlas"
                  status="Online"
                />
                <OperationalTile
                  label="Socket Gateway"
                  value="Node/Express"
                  status="Active"
                />
                <OperationalTile
                  label="Storage Clusters"
                  value="Local Memory"
                  status="Healthy"
                />
              </div>
            </div>
          </div>

          {/* User Directory Manager */}
          <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  Account Directory Directory
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Toggle bans or examine account details instantly
                </p>
              </div>

              {/* Search user */}
              <div className="relative w-full md:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiSearch size={15} />
                </div>
                <input
                  type="text"
                  placeholder="Filter users..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.0.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* User Grid Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-border text-xs font-bold text-gray-400 uppercase">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50 dark:divide-dark-border/40 text-sm">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/25 transition-colors"
                    >
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          referrerPolicy="no-referrer"
                          src={u.profilePicture}
                          alt="Avatar"
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white block">
                            {u.username}
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            {u.customStatus || "No status"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-medium">
                        {u.email}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.verified
                              ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-450"
                          }`}
                        >
                          {u.verified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleBan(u._id)}
                          disabled={actionLoading === u._id}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ml-auto transition-all active:scale-95 ${
                            u.verified
                              ? "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                              : "bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-950/20 dark:text-green-400"
                          }`}
                        >
                          {u.verified ? (
                            <FiLock size={13} />
                          ) : (
                            <FiUnlock size={13} />
                          )}
                          <span>
                            {actionLoading === u._id
                              ? "Toggling..."
                              : u.verified
                                ? "Suspend / Ban"
                                : "Activate User"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, change }) => (
  <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <span className="text-gray-400 font-semibold text-xs tracking-wide uppercase">
        {title}
      </span>
      <div className="p-2 bg-gray-50 dark:bg-dark-bg rounded-xl shadow-inner">
        {icon}
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </span>
      <span className="text-[10px] text-green-500 font-semibold">{change}</span>
    </div>
  </div>
);

const OperationalTile = ({ label, value, status }) => (
  <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-dark-bg/40 border border-gray-100/50 dark:border-dark-border/40">
    <div>
      <span className="text-xs font-semibold text-gray-900 dark:text-white block">
        {label}
      </span>
      <span className="text-[10px] text-gray-400 block">{value}</span>
    </div>
    <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 rounded-full">
      {status}
    </span>
  </div>
);

export default Admin;
