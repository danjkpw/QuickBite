
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const SideNavbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed left-0 top-0 h-full w-16 md:w-64 bg-white shadow-md flex flex-col py-8">
      <div className="mb-6 px-4 hidden md:block">
        <h1 className="text-lg font-bold text-[#F97316]">QuickBite</h1>
      </div>
      
      <nav className="flex flex-col flex-1">
        <Link 
          to="/home" 
          className={cn(
            "flex items-center px-4 py-3 mb-2 transition-colors",
            isActive('/home') 
              ? "text-[#F97316] bg-orange-50" 
              : "text-gray-500 hover:bg-gray-100"
          )}
        >
          <Home size={24} />
          <span className="ml-4 hidden md:block">Home</span>
        </Link>
        
        <Link 
          to="/search" 
          className={cn(
            "flex items-center px-4 py-3 mb-2 transition-colors",
            isActive('/search') 
              ? "text-[#F97316] bg-orange-50" 
              : "text-gray-500 hover:bg-gray-100"
          )}
        >
          <Search size={24} />
          <span className="ml-4 hidden md:block">Search</span>
        </Link>
        
        <Link 
          to="/favorites" 
          className={cn(
            "flex items-center px-4 py-3 mb-2 transition-colors",
            isActive('/favorites') 
              ? "text-[#F97316] bg-orange-50" 
              : "text-gray-500 hover:bg-gray-100"
          )}
        >
          <Heart size={24} />
          <span className="ml-4 hidden md:block">Hot</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={cn(
            "flex items-center px-4 py-3 mb-2 transition-colors",
            isActive('/profile') 
              ? "text-[#F97316] bg-orange-50" 
              : "text-gray-500 hover:bg-gray-100"
          )}
        >
          <User size={24} />
          <span className="ml-4 hidden md:block">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default SideNavbar;
