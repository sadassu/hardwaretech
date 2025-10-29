import { Link } from "react-router";
import ImageSlider from "../components/ImageSlider";

const HomePage = () => {
  const categories = [
    {
      title: "Hand Tools",
      desc: "Hammers, screwdrivers, wrenches",
    },
    {
      title: "Power Tools",
      desc: "Drills, saws, sanders & more",
    },
    {
      title: "Fasteners",
      desc: "Screws, bolts, nuts & washers",
    },
    {
      title: "Measuring",
      desc: "Levels, tape measures, squares",
    },
    {
      title: "Specialty Tools",
      desc: "Plumbing, electrical, HVAC",
    },
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Navigation */}

      <ImageSlider />
      {/* Hero Section */}
      <div className="hero min-h-[80vh]">
        <div className="hero-content text-center max-w-5xl">
          <div>
            <div className="flex justify-center mb-6">
              <img src="assets/logo.jpg" alt="" className="w-100 h-50" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-600 via-red-500 to-yellow-600 bg-clip-text text-transparent">
                Electrical Supply Co.
              </span>
            </h1>
            <p className="text-lg mb-8 opacity-80 max-w-3xl mx-auto">
              Reserve quality tools, hardware supplies, and equipment for your
              projects. From weekend DIY to commercial construction - we've got
              everything you need, when you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link
                to="/user/product-list"
                className="btn btn-warning btn-lg px-8"
              >
                Browse Products
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
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-20 bg-[#30475E] text-white">
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
                className="card border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 hover:scale-105"
              >
                <div className="card-body">
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <h3 className="card-title text-xl text-white">
                        {category.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm opacity-70 mb-4">{category.desc}</p>
                </div>
              </div>
            ))}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Same-Day Service</h3>
              <p className="text-sm opacity-70">
                Reserve and pickup the same day
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Quality Guaranteed</h3>
              <p className="text-sm opacity-70">
                All tools tested and maintained
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Best Prices</h3>
              <p className="text-sm opacity-70">
                Competitive rates and bulk discounts
              </p>
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

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-300 text-base-content">
        <aside>
          <p>Copyright © 2025 - Hardware Tech Tool</p>
        </aside>
      </footer>
    </div>
  );
};

export default HomePage;
