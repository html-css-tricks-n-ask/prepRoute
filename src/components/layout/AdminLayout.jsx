import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { FiLayout, FiEdit, FiClock, FiMenu, FiX, FiBell, FiChevronDown, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ConfirmationModal from '../modal/ConfirmationModal';

export default function AdminLayout() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const dropdownRef = useRef(null);
  const currentPath = location.pathname;

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    // Simulate a brief loading states for security clears
    setTimeout(() => {
      dispatch(logout());
      sessionStorage.clear();
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      setIsDropdownOpen(false);
      toast.success('Logged out successfully.');
      navigate('/login');
    }, 800);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Drawer Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo-container">
          <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => { navigate('/'); setIsSidebarOpen(false); }}>
            <svg width="150" height="42" viewBox="0 0 150 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
              <path d="M6 22 Q 22 2, 42 12 T 95 10" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <circle cx="6" cy="22" r="3" fill="#5B5CEB" stroke="#111827" strokeWidth="1.5" />
              <circle cx="95" cy="10" r="3" fill="#5B5CEB" stroke="#111827" strokeWidth="1.5" />
              <text x="5" y="32" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="800" className="logo-text-nodes">
                <tspan fill="#5B5CEB">Prep</tspan>
                <tspan fill="#111827">Route</tspan>
              </text>
            </svg>
            
            {/* Logo Icon only for tablet collapsed state */}
            <svg width="32" height="32" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-icon-only">
              <path d="M6 22 Q 22 2, 42 12" stroke="#5B5CEB" strokeWidth="3" strokeLinecap="round" fill="none" />
              <circle cx="6" cy="22" r="4" fill="#5B5CEB" />
            </svg>
          </div>

          {/* Close menu button on mobile drawer */}
          <button 
            className="sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <nav className="sidebar-menu">
          <div 
            className={`sidebar-item ${currentPath === '/' ? 'active' : ''}`}
            onClick={() => { navigate('/'); setIsSidebarOpen(false); }}
            title="Dashboard"
          >
            <FiLayout className="sidebar-item-icon" />
            <span className="sidebar-item-label">Dashboard</span>
          </div>

          <div 
            className={`sidebar-item ${currentPath.startsWith('/test/') ? 'active' : ''}`}
            onClick={() => { navigate('/test/create'); setIsSidebarOpen(false); }}
            title="Test Creation"
          >
            <FiEdit className="sidebar-item-icon" />
            <span className="sidebar-item-label">Test Creation</span>
          </div>

          <div 
            className="sidebar-item"
            onClick={() => alert("Test Tracking module is under development.")}
            title="Test Tracking"
          >
            <FiClock className="sidebar-item-icon" />
            <span className="sidebar-item-label">Test Tracking</span>
          </div>
        </nav>
      </aside>

      {/* Right Main Panel */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          {/* Hamburger toggle for mobile/tablet */}
          <button 
            className="hamburger-btn" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isSidebarOpen}
          >
            <FiMenu size={24} />
          </button>

          {/* Mobile Header Logo */}
          <div className="mobile-header-logo" onClick={() => navigate('/')}>
            <span style={{ fontWeight: 800, color: '#5B5CEB' }}>Prep</span>
            <span style={{ fontWeight: 800, color: '#111827' }}>Route</span>
          </div>

          <div className="topbar-right">
            {/* Notification bell */}
            <button className="notification-bell-btn" aria-label="View notifications">
              <span className="notification-badge"></span>
              <FiBell size={20} style={{ color: 'var(--primary)' }} />
            </button>

            {/* Profile Dropdown Wrapper */}
            <div className="profile-dropdown-wrapper" ref={dropdownRef}>
              <div 
                className="profile-section" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                title="Profile Menu"
                role="button" 
                tabIndex={0} 
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setIsDropdownOpen(!isDropdownOpen); e.preventDefault(); } }}
              >
                <div className="profile-info">
                  <span className="profile-name">
                    {user?.userId === 'admin' ? 'Alex Wando' : user?.userId || 'Alex Wando'}
                  </span>
                  <span className="profile-role">Admin</span>
                </div>
                
                {/* Avatar */}
                <div className="profile-avatar">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" fill="#fed7aa" />
                    <path d="M12 18 C 12 12, 28 12, 28 18 C 28 16, 28 14, 25 13 C 22 12, 18 12, 15 13 C 12 14, 12 16, 12 18 Z" fill="#7c2d12" />
                    <circle cx="20" cy="20" r="7" fill="#ffedd5" />
                    <path d="M16 18 Q18 17 19 18" stroke="#7c2d12" strokeWidth="1.2" fill="none" />
                    <path d="M21 18 Q22 17 24 18" stroke="#7c2d12" strokeWidth="1.2" fill="none" />
                    <circle cx="18" cy="20" r="1.2" fill="#1e2937" />
                    <circle cx="22" cy="20" r="1.2" fill="#1e2937" />
                    <path d="M18.5 23 Q20 25 21.5 23" stroke="#7c2d12" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    <path d="M8 35 C 8 28, 32 28, 32 35 Z" fill="#ea580c" />
                  </svg>
                </div>
                
                <FiChevronDown size={14} className="profile-chevron" style={{ color: '#6b7280' }} />
              </div>

              {/* Dropdown Menu Option List */}
              {isDropdownOpen && (
                <div className="profile-dropdown">
                  <button 
                    className="profile-dropdown-item" 
                    onClick={() => { alert("Profile configuration is under development."); setIsDropdownOpen(false); }}
                  >
                    <FiUser size={16} />
                    <span>My Profile</span>
                  </button>
                  <button 
                    className="profile-dropdown-item" 
                    onClick={() => { alert("Settings panel is under development."); setIsDropdownOpen(false); }}
                  >
                    <FiSettings size={16} />
                    <span>Settings</span>
                  </button>
                  <div className="profile-dropdown-divider"></div>
                  <button 
                    className="profile-dropdown-item" 
                    onClick={() => { setIsLogoutModalOpen(true); }}
                    style={{ color: '#ef4444' }}
                  >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Workspace content */}
        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Logout"
        message={`Are you sure you want to sign out of your account?\n\nYou will need to sign in again to access your dashboard.`}
        confirmText="Logout"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isLoggingOut}
      />
    </div>
  );
}
