import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { loginUser } from '../../services/authService';
import Button from '../../components/common/Button';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      // Call backend service
      const result = await loginUser(formData.email, formData.password);

      if (result.success) {
        // Login successful
        // Store token if provided
        if (result.token) {
          localStorage.setItem('geep_token', result.token);
        }
        login(result.user);
        
        // Navigate based on role
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else if (result.user.role === 'teacher') {
          navigate('/teacher');
        } else {
          navigate('/lessons');
        }
      } else {
        // Login failed - show specific error message
        const errorMsg = result.error || 'Login failed. Please try again.';
        setError(errorMsg);
        
        // If account is pending or rejected, provide helpful message
        if (errorMsg.includes('awaiting approval') || errorMsg.includes('rejected')) {
          // Error message already set, no additional action needed
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-100 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🌿</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
          <p className="text-sm sm:text-base text-gray-600">Login to continue your eco-learning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="Enter your password"
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Register here
            </Link>
          </p>
        </div>

        {error && error.includes('not found') && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center mb-2">
              User not registered. Would you like to create an account?
            </p>
            <Link to="/register" className="block text-center">
              <Button variant="primary" size="sm" className="w-full">
                Go to Registration
              </Button>
            </Link>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default Login;

