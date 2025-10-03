import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
export default function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Define your slides here - customize backgrounds, text, and buttons
  const slides = [
    {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      title: "Welcome to Our Platform",
      subtitle: "Experience the future of digital innovation",
      buttonText: "Get Started",
      buttonLink: "#",
    },
    {
      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      title: "Beautiful Design",
      subtitle: "Crafted with attention to every detail",
      buttonText: "Learn More",
      buttonLink: "#",
    },
    {
      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      title: "Easy to Use",
      subtitle: "Get up and running in minutes",
      buttonText: "Try It Now",
      buttonLink: "#",
    },
    {
      background: "url(/assets/background-shadow.webp) center/cover no-repeat",
      title: "Join Our Community",
      subtitle: "Connect with thousands of users worldwide",
      buttonText: "Sign Up Free",
      buttonLink: "#",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? "opacity-100 translate-x-0"
                : index < currentSlide
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            }`}
            style={{ background: slide.background }}
          >
            <div className="flex items-center justify-center h-full px-8">
              <div className="text-center text-white max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90">
                  {slide.subtitle}
                </p>
                <button
                  onClick={() => (window.location.href = slide.buttonLink)}
                  className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-opacity-90 transition-all hover:scale-105 shadow-lg"
                >
                  {slide.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full transition-all backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full transition-all backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight size={32} />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
              index === currentSlide
                ? "bg-white w-12 h-3"
                : "bg-white bg-opacity-50 w-3 h-3 hover:bg-opacity-75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
