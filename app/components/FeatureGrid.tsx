type Feature = {
  title: string;
  description: string;
  icon: string;
};

export function FeatureGrid() {
  const features: Feature[] = [
    {
      title: "Beautiful Invitation Themes",
      description: "Gorgeous, playful themes without the premium price tags found elsewhere. Perfect for kids' parties.",
      icon: "🎨"
    },
    {
      title: "Totally Free RSVP Tracking",
      description: "Unlike Evite or Paperless Post, our real-time RSVP tracking is completely free and simple. See guest responses instantly.",
      icon: "📋"
    },
    {
      title: "Easy Guest Management",
      description: "Effortlessly manage guests with optional anonymous RSVPs",
      icon: "👥"
    },
    {
      title: "Simple Party Coordination",
      description: "Optional features to manage food, gifts, and activities, making party planning straightforward.",
      icon: "🎈"
    }
  ];

  return (
    <section className="py-16 px-6 md:px-12 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-gray-100">Free & Simple Party Planning Features</h2>
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