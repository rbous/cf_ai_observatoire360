import { Outlet } from "react-router-dom";
import Navbar from "@/app/components/marketing/Navbar";
import Footer from "@/app/components/marketing/Footer";

export default function MarketingLayout() {
    return (
        <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(to bottom, #B3E5FC, #FFFFFF)" }}>
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
