import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const slides = [
    {
      background: "url(/assets/carousel/c-1.jpeg) center/cover no-repeat",
      title: "Welcome to BABA",
      subtitle: "Experience the future of digital innovation",
      buttonText: "Get Started",
      buttonLink: "#",
    },
    {
      background: "url(/assets/carousel/c-2.jpg) center/cover no-repeat",
      title: "Create a Account",
      // subtitle: "Crafted with attention to every detail",
      buttonText: "Create here",
      buttonLink: "/register",
    },
    {
      background: "url(/assets/carousel/c-3.jpg) center/cover no-repeat",
      title: "Easy to Use",
      subtitle: "Get up and running in minutes",
      buttonText: "Browse Products",
      buttonLink: "/user/product-list",
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

  // Auto-slide every 5 seconds, unless paused
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [currentSlide, paused]);

  return (
    <div
      className="relative w-full h-[500px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
            <div className="flex items-center justify-center h-full px-8 bg-black/50">
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

      {/* Bottom Navigation Section */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center gap-6 bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          className="bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Dots Navigation */}
        <div className="flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all rounded-full ${
                index === currentSlide
                  ? "bg-white w-10 h-3"
                  : "bg-white/50 w-3 h-3 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-all"
          aria-label="Next slide"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}
