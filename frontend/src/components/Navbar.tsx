import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/upload"); // navigate to the UploadPage route
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4">
      <h1 className="text-4xl font-extrabold text-purple-700">
        LexAI <span className="text-gray-900">Simplify</span>
      </h1>

      <button
        onClick={handleGetStarted}
        className="font-bold ml-4 px-5 py-2 bg-purple-600 text-white rounded-full shadow hover:bg-purple-700 transition cursor-pointer"
      >
        Get Started
      </button>
    </nav>
  );
};

export default Navbar;

