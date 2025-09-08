import { Outlet } from "react-router";
import NavBar from "../components/NavBar";

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-base-100">
      <NavBar />
      <Outlet />
    </div>
  );
};

export default PublicLayout;
