"use client";

import { useState, useEffect } from "react";
import Footer from "@/app/components/footer";
import CodeDefinitionsIcon from "@/app/components/CodeDefinitionsIcon";
import TermsModal from "@/app/components/TermsModal";

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

const AppLayout = ({ children, activeTab }: AppLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("isSidebarCollapsed") || "true");
    }
    return true;
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const newState = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("isSidebarCollapsed", JSON.stringify(newState));
      }
      return newState;
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = JSON.parse(localStorage.getItem("isSidebarCollapsed") || "true");
      setIsSidebarCollapsed(savedState);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content Container */}
      <div className="flex flex-grow">
        {/* Page Content (no SideNav) */}
        <main
          className="flex-grow transition-all duration-300 ease-in-out px-6 py-8 ml-0"
        >
          <div
            className="w-full max-w-[1400px] mx-auto"
          >
            {children}
          </div>
        </main>
      </div>

      {/* Code Definitions Icon */}
      <CodeDefinitionsIcon />

      {/* Terms and Conditions Modal */}
      <TermsModal />

      {/* Footer */}
      <Footer />

      <div id="datepicker-portal" style={{ zIndex: 3000 }} />
    </div>
  );
};

export default AppLayout;
