import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="flex items-center mb-4">
              <img 
                src="/favicon-96x96.png" 
                alt="Kiddobash Logo" 
                className="h-10 w-auto mr-2" 
              />
              <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">Kiddobash</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Making event planning simple.</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="flex gap-8 mb-4">
              <Link to="/my-events" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">My Events</Link>
              <Link to="/create-event" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Create Event</Link>
              <Link to="/terms" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 