type Feature = {
  title: string;
  description: string;
  icon: string;
};

export function FeatureGrid() {
  const features: Feature[] = [
    {
      title: "Beautiful Invitation Themes",
      description: "Choose from playful themes or customize your own for the perfect kids' party invite.",
      icon: "🎨"
    },
    {
      title: "Simple RSVP Tracking",
      description: "Easily track guest responses (Going, Not Going, Maybe) in real-time. No more chasing replies!",
      icon: "📋"
    },
    {
      title: "Easy Guest Management",
      description: "Manage your guest list effortlessly, including anonymous RSVP options for privacy.",
      icon: "👥"
    },
    {
      title: "Party Coordination Tools",
      description: "Optional features to manage food, gifts, and activities, making party planning simple.",
      icon: "🎈"
    }
  ];

  return (
    <section className="py-16 px-6 md:px-12 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-gray-100">Core Features for Stress-Free Party Planning</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md hover:scale-105 transition-transform">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{feature.icon}</span>
                <h3 className="text-xl font-semibold dark:text-gray-100">{feature.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 