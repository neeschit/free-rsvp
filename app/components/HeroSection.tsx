import { Link } from "react-router";

export function HeroSection() {
  return (
    <section className="py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 space-y-6">
          <h1 
            className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100"
            style={{ minHeight: '3.5rem' }}
          >
            Effortless Kids Party Planning & Invites 🎉
          </h1>
          <p 
            className="text-lg text-gray-600 dark:text-gray-300"
            style={{ minHeight: '3rem' }}
          >
            Skip the complex setups of Evite or Punchbowl. Kiddobash offers beautiful kids' party invites and completely free RSVP tracking for a stress-free celebration.
          </p>
          <div className="flex gap-4 pt-4">
            <Link 
              to="/create-event" 
              className="bg-indigo-600 text-white px-6 py-3 rounded-full text-lg font-medium hover:bg-indigo-700 transition-colors"
              prefetch="intent"
            >
              Get Started
            </Link>
          </div>
        </div>
{/*         <div className="md:w-1/2">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-xl h-80 flex items-center justify-center">
            <p className="text-indigo-500 dark:text-indigo-400 text-lg font-medium">Theme Preview Carousel</p>
          </div>
        </div> */}
      </div>
    </section>
  );
} 