export default function Features() {
  const features = [
    {
      emoji: "📄",
      title: "Receipt OCR",
      description: "Scan any receipt in seconds",
    },
    {
      emoji: "🤖",
      title: "AI Chatbot",
      description: "Ask your finances anything",
    },
    {
      emoji: "🔔",
      title: "Budget Alerts",
      description: "Never overspend again",
    },
    {
      emoji: "📊",
      title: "Analytics",
      description: "See where every rupee goes",
    },
  ];

  return (
    <section id="features" className="py-16 px-6 bg-yellow-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Label */}
        <div className="text-center mb-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-700">
            Features
          </p>
        </div>

        {/* Section Heading */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
          Everything you need to manage money
        </h2>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 cursor-pointer"
            >
              {/* Icon */}
              <div className="text-5xl mb-6">
                {feature.emoji}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
