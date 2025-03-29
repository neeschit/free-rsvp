type Feature = {
  title: string;
  description: string;
  icon: string;
};

export function FeatureGrid() {
  const features: Feature[] = [
    {
      title: "Custom Themes",
      description: "Unicorns, dinosaurs, spaceships. Find the perfect theme your kiddo loves.",
      icon: "🎨"
    },
    {
      title: "RSVP Tracking",
      description: "No more chasing replies. Know exactly who's coming",
      icon: "📋"
    },
    {
      title: "SMS Invites",
      description: "Instantly deliver invites via SMS",
      icon: "📱"
    },
    {
      title: "Party Management",
      description: "Communicate with guests easily",
      icon: "🎁"
    }
  ];

  return (
    <section className="py-16 px-6 md:px-12 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-gray-100">Make Birthday Dreams Come True—Effortlessly!</h2>
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