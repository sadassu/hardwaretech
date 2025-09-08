import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar";
import AdminNavbar from "../components/AdminNavbar";

const AdminLayout = () => {
  return (
    <div className="flex">
      <SideBar />

      {/* Main Content Area */}
      <div className="ml-64 w-full flex flex-col min-h-screen bg-base-100">
        {/* Navbar */}
        <AdminNavbar />

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
