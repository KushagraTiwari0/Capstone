import { Link } from "react-router-dom";
import Button from "../components/common/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="text-9xl font-bold text-primary-600 mb-4">404</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/lessons">
            <Button variant="primary" size="lg">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
