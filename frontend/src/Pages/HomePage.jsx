import { useState } from "react";
import ImageSlider from "../components/ImageSlider";

const HomePage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Mike Thompson",
      role: "General Contractor",
      text: "Reserved all my construction tools for the Johnson project. Saved me thousands in equipment costs.",
    },
    {
      name: "Sarah Martinez",
      role: "DIY Homeowner",
      text: "Perfect for weekend projects! Got a full tool set for my deck renovation without buying everything.",
    },
    {
      name: "Bob's Construction Co.",
      role: "Construction Company",
      text: "Reliable equipment and flexible rental periods. Our go-to for seasonal tool needs.",
    },
  ];

  const categories = [
    {
      icon: "🔨",
      title: "Hand Tools",
      desc: "Hammers, screwdrivers, wrenches",
      count: "500+",
    },
    {
      icon: "⚡",
      title: "Power Tools",
      desc: "Drills, saws, sanders & more",
      count: "300+",
    },
    {
      icon: "🔩",
      title: "Fasteners",
      desc: "Screws, bolts, nuts & washers",
      count: "1000+",
    },
    {
      icon: "📏",
      title: "Measuring",
      desc: "Levels, tape measures, squares",
      count: "150+",
    },
    {
      icon: "🪜",
      title: "Ladders & Lifts",
      desc: "Step ladders, extension ladders",
      count: "80+",
    },
    {
      icon: "🔧",
      title: "Specialty Tools",
      desc: "Plumbing, electrical, HVAC",
      count: "400+",
    },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Navigation */}

      <ImageSlider />
      {/* Hero Section */}
      <div className="hero min-h-[80vh] bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        <div className="hero-content text-center max-w-5xl">
          <div>
            <div className="flex justify-center mb-6">
              <div className="text-6xl">🔨</div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-600 via-red-500 to-yellow-600 bg-clip-text text-transparent">
                Hardware Tech
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 font-semibold text-orange-800">
              Your Professional Tool & Hardware Reservation Center
            </p>
            <p className="text-lg mb-8 opacity-80 max-w-3xl mx-auto">
              Reserve quality tools, hardware supplies, and equipment for your
              projects. From weekend DIY to commercial construction - we've got
              everything you need, when you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button className="btn btn-warning btn-lg px-8">
                Browse Tools
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </button>
              <button className="btn btn-outline btn-lg px-8 border-orange-500 text-orange-600 hover:bg-orange-500">
                Get Quote
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="stats stats-horizontal shadow bg-white/80 backdrop-blur-sm">
              <div className="stat">
                <div className="stat-value text-orange-600">2500+</div>
                <div className="stat-desc">Tools & Supplies</div>
              </div>
              <div className="stat">
                <div className="stat-value text-red-600">24/7</div>
                <div className="stat-desc">Pickup Available</div>
              </div>
              <div className="stat">
                <div className="stat-value text-yellow-600">Same Day</div>
                <div className="stat-desc">Reservations</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-20 bg-base-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Tool & Hardware Categories
            </h2>
            <p className="text-lg opacity-70 max-w-2xl mx-auto">
              Professional-grade tools and hardware supplies for every project
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="card bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="card-body">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{category.icon}</div>
                    <div>
                      <h3 className="card-title text-xl text-orange-800">
                        {category.title}
                      </h3>
                      <div className="badge badge-warning">
                        {category.count} items
                      </div>
                    </div>
                  </div>
                  <p className="text-sm opacity-70 mb-4">{category.desc}</p>
                  <div className="card-actions">
                    <button className="btn btn-sm btn-outline btn-warning w-full">
                      Browse Category
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Tools */}
      <div className="py-20 bg-base-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Popular Tool Rentals</h2>
            <p className="text-lg opacity-70">
              Most requested tools currently available for reservation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <figure className="px-6 pt-6">
                <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center border-2 border-orange-200">
                  <div className="text-6xl">🔨</div>
                </div>
              </figure>
              <div className="card-body">
                <h3 className="card-title">DeWalt 20V Max Drill Kit</h3>
                <p className="text-sm opacity-70">
                  Cordless drill with 2 batteries and charger
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div className="badge badge-success">Available</div>
                  <div className="text-lg font-bold">$25/day</div>
                </div>
                <div className="card-actions mt-4">
                  <button className="btn btn-warning w-full">
                    Reserve Now
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <figure className="px-6 pt-6">
                <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center border-2 border-orange-200">
                  <div className="text-6xl">⚡</div>
                </div>
              </figure>
              <div className="card-body">
                <h3 className="card-title">Circular Saw 7¼"</h3>
                <p className="text-sm opacity-70">
                  Professional grade circular saw with blade
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div className="badge badge-warning">Limited</div>
                  <div className="text-lg font-bold">$35/day</div>
                </div>
                <div className="card-actions mt-4">
                  <button className="btn btn-warning w-full">
                    Reserve Now
                  </button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <figure className="px-6 pt-6">
                <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center border-2 border-orange-200">
                  <div className="text-6xl">🪜</div>
                </div>
              </figure>
              <div className="card-body">
                <h3 className="card-title">8ft Step Ladder</h3>
                <p className="text-sm opacity-70">
                  Heavy-duty aluminum step ladder
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div className="badge badge-success">Available</div>
                  <div className="text-lg font-bold">$20/day</div>
                </div>
                <div className="card-actions mt-4">
                  <button className="btn btn-warning w-full">
                    Reserve Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-base-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose Hardware Tech?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Same-Day Service</h3>
              <p className="text-sm opacity-70">
                Reserve and pickup the same day
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">Quality Guaranteed</h3>
              <p className="text-sm opacity-70">
                All tools tested and maintained
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Best Prices</h3>
              <p className="text-sm opacity-70">
                Competitive rates and bulk discounts
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🚛</div>
              <h3 className="text-xl font-bold mb-2">Free Delivery</h3>
              <p className="text-sm opacity-70">On orders over $100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Types */}
      <div className="py-20 bg-orange-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Perfect for Any Project</h2>
            <p className="text-lg opacity-70">
              From small repairs to major renovations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-white shadow-lg">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-xl font-bold mb-2">Home DIY</h3>
                <p className="text-sm opacity-70">
                  Weekend projects, repairs, and improvements
                </p>
              </div>
            </div>
            <div className="card bg-white shadow-lg">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">🏗️</div>
                <h3 className="text-xl font-bold mb-2">Construction</h3>
                <p className="text-sm opacity-70">
                  Commercial and residential construction projects
                </p>
              </div>
            </div>
            <div className="card bg-white shadow-lg">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="text-xl font-bold mb-2">Professional Trade</h3>
                <p className="text-sm opacity-70">
                  Plumbing, electrical, and HVAC work
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
          </div>

          <div className="card bg-white text-base-content shadow-xl">
            <div className="card-body text-center p-12">
              <div className="text-2xl mb-6">
                "{testimonials[currentTestimonial].text}"
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="avatar">
                  <div className="w-12 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </div>
                </div>
                <div>
                  <div className="font-semibold">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-sm opacity-60">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-8 gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentTestimonial
                        ? "bg-orange-600"
                        : "bg-base-300"
                    }`}
                    onClick={() => setCurrentTestimonial(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Get the tools you need without the investment. Reserve online or
            call us for expert advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn btn-lg bg-white text-orange-600 hover:bg-gray-100 border-none px-8">
              Browse All Tools
            </button>
            <button className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-orange-600 px-8">
              Call: (555) 123-TOOL
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-300 text-base-content">
        <nav className="grid grid-flow-col gap-4">
          <a className="link link-hover">Tool Catalog</a>
          <a className="link link-hover">Rental Terms</a>
          <a className="link link-hover">Store Locations</a>
          <a className="link link-hover">Contact Us</a>
        </nav>
        <nav>
          <div className="grid grid-flow-col gap-4 text-2xl">
            <a className="hover:text-orange-500 transition-colors">📧</a>
            <a className="hover:text-orange-500 transition-colors">📞</a>
            <a className="hover:text-orange-500 transition-colors">🏪</a>
          </div>
        </nav>
        <aside>
          <p>Copyright © 2024 - Hardware Tech Tool & Supply Rental</p>
          <p className="text-sm opacity-60">
            Your trusted partner for quality tools since 1995
          </p>
        </aside>
      </footer>
    </div>
  );
};

export default HomePage;
