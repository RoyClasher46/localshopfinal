import { Outlet } from "react-router-dom";

import Navbar from "../components/navigation/Navbar";
import Footer from "../components/navigation/Footer";
import LocationModal from "../components/LocationModal";

function PublicLayout() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
      <LocationModal />
    </div>
  );
}

export default PublicLayout;
