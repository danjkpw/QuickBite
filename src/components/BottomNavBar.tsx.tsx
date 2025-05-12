
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, User, Heart } from "lucide-react";

const BottomNavbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? "text-[#F97316]" : "text-gray-500";
  };

  return (
    <nav className="bottom-navbar">
      <Link to="/home" className={`flex flex-col items-center ${isActive('/home')}`}>
        <Home size={24} />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link to="/search" className={`flex flex-col items-center ${isActive('/search')}`}>
        <Search size={24} />
        <span className="text-xs mt-1">Search</span>
      </Link>
      <Link to="/favorites" className={`flex flex-col items-center ${isActive('/favorites')}`}>
        <Heart size={24} />
        <span className="text-xs mt-1">Hot</span>
      </Link>
      <Link to="/profile" className={`flex flex-col items-center ${isActive('/profile')}`}>
        <User size={24} />
        <span className="text-xs mt-1">Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNavbar;
