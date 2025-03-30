/**
 * Tailwind CSS utility patterns for consistent styling across the app
 * Use these as references when applying styles to maintain consistency
 */

// Container patterns
export const container = "container mx-auto px-4 md:px-6 lg:px-8";

// Background patterns
export const bgLight = "bg-white dark:bg-gray-900";
export const bgSecondary = "bg-gray-50 dark:bg-gray-800";
export const bgCard = "bg-white dark:bg-gray-800 rounded-lg shadow-md";

// Text patterns
export const textPrimary = "text-gray-900 dark:text-white";
export const textSecondary = "text-gray-600 dark:text-gray-300";
export const textMuted = "text-gray-500 dark:text-gray-400";

// Form elements
export const input = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100";

// Button styles
export const buttonPrimary = "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900";
export const buttonSecondary = "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900";
export const buttonOutline = "px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900";

// Card and section patterns
export const card = "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6";
export const section = "py-12 px-4 md:px-6";

// Status indicators
export const statusSuccess = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
export const statusWarning = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
export const statusError = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";

// Borders
export const borderLight = "border border-gray-200 dark:border-gray-700";
export const borderTop = "border-t border-gray-200 dark:border-gray-700";
export const borderBottom = "border-b border-gray-200 dark:border-gray-700";

// Responsive grid layouts
export const gridCols2 = "grid grid-cols-1 md:grid-cols-2 gap-6";
export const gridCols3 = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

// Spacing
export const spacingY = "space-y-6";
export const spacingX = "space-x-4";

// Util patterns for use in specific components 
export const formSection = "space-y-6"; 