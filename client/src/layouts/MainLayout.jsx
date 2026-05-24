import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';

const MainLayout = () => {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 h-full flex flex-col relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
