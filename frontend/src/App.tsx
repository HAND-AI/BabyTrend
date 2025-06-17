import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { getUser, isAuthenticated, isAdmin } from './utils/token';
import authService from './services/auth';

const App: React.FC = () => {
  const location = useLocation();
  const user = getUser();
  const authenticated = isAuthenticated();
  const userIsAdmin = isAdmin();

  const handleLogout = () => {
    authService.logout();
  };

  // Don't show navigation on auth pages
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {authenticated && !isAuthPage && (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-900">
                  📦 Packing List System
                </Link>
                <div className="ml-8 flex space-x-4">
                  {userIsAdmin ? (
                    <Link
                      to="/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === '/admin'
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Admin Panel
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === '/dashboard'
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Dashboard
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user?.username}
                  {userIsAdmin && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className={isAuthPage ? '' : 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'}>
        <Outlet />
      </main>
    </div>
  );
};

export default App; 