import { Link } from "react-router";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-800 py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img 
            src="/favicon.svg" 
            alt="Kiddobash Logo" 
            className="h-8 w-auto mr-2" 
          />
          <span className="font-bold text-2xl text-indigo-600 dark:text-indigo-400">Kiddobash</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/create-event" className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors">
            Create New Event
          </Link>
        </nav>
        <button 
          className="md:hidden text-gray-600 dark:text-gray-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800 py-4 px-6 flex flex-col gap-4">
          <Link 
            to="/create-event" 
            className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors text-center mt-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Create New Event
          </Link>
        </div>
      )}
    </header>
  );
} 