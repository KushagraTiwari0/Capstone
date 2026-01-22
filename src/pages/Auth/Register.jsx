import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { registerUser, checkUserExists } from '../../services/authService';
import Button from '../../components/common/Button';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  // Check if email exists when user types
  useEffect(() => {
    const checkEmail = async () => {
      if (formData.email && formData.email.includes('@')) {
        try {
          const exists = await checkUserExists(formData.email);
          setEmailExists(exists);
          if (exists) {
            setError('This email is already registered. Please login instead.');
          } else {
            setError('');
          }
        } catch (error) {
          console.error('Error checking email:', error);
        }
      } else {
        setEmailExists(false);
      }
    };

    // Debounce email check
    const timeoutId = setTimeout(() => {
      checkEmail();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    // Check if user already exists
    const emailExists = await checkUserExists(formData.email);
    if (emailExists) {
      setError('User with this email already exists. Please login instead.');
      setIsLoading(false);
      return;
    }

    try {
      // Call backend service
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (result.success) {
        // Registration successful
        setSuccess(result.message || 'Registration successful!');
        
        // If user requires approval, don't auto-login
        if (result.requiresApproval) {
          // Show success message and redirect to login after delay
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          // Auto-login for approved users (admins)
          if (result.token) {
            localStorage.setItem('geep_token', result.token);
          }
          login(result.user);
          setTimeout(() => {
            navigate('/lessons');
          }, 1000);
        }
      } else {
        // Registration failed
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-100 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🌿</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Join GEEP Platform</h1>
          <p className="text-sm sm:text-base text-gray-600">Start your eco-learning journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
              {error.includes('already exists') && (
                <div className="mt-2">
                  <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold underline">
                    Go to Login Page
                  </Link>
                </div>
              )}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          {emailExists && !error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
              This email is already registered. <Link to="/login" className="font-semibold underline">Login here</Link>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="John Doe"
              required
            />
          </div>

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
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              I am a
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
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
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="Confirm your password"
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={isLoading || emailExists}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Login here
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center mb-2">
            💡 Tip: Add "teacher" or "admin" in email to get respective roles
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

