// components/Loading.jsx
const Loading = ({
  message = "Loading...",
  size = "loading-lg",
  className = "",
}) => {
  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <div className="flex flex-col items-center justify-center py-16">
        <span className={`loading loading-spinner ${size} text-primary`}></span>
        <p className="mt-4 text-lg text-base-content/70">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
