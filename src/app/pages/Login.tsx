import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        const storedUser = localStorage.getItem('cms_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          toast.success(`Welcome ${userData.name}!`);
          
          if (userData.role === 'admin') {
            navigate('/admin');
          } else if (userData.role === 'faculty') {
            navigate('/faculty');
          } else {
            navigate('/student');
          }
        }
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-[45%] bg-white flex flex-col justify-center px-8 sm:px-16 lg:px-20 relative">
        {/* Decorative corner */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-purple-200 rounded-tl-3xl m-6" />
        
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Login</h1>
          <p className="text-gray-500 mb-10">Enter your account details</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username Field */}
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b-2 border-purple-200 text-gray-800 placeholder-gray-400 py-3 px-0 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
            
            {/* Password Field */}
            <div className="space-y-2 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b-2 border-purple-200 text-gray-800 placeholder-gray-400 py-3 px-0 pr-10 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-3 text-gray-400 hover:text-purple-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <a href="#" className="text-purple-500 text-sm hover:text-purple-600 transition-colors">
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          
          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-sm text-gray-600 mb-3">Demo Credentials:</p>
            <div className="space-y-2 text-sm">
              <div 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-100 cursor-pointer transition-colors group"
                onClick={() => { setEmail('admin@college.edu'); setPassword('Admin@123'); }}
              >
                <span className="text-gray-700"><span className="text-purple-600 font-medium">Admin:</span> admin@college.edu</span>
                <span className="text-xs text-gray-400 group-hover:text-purple-500">Click</span>
              </div>
              <div 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-100 cursor-pointer transition-colors group"
                onClick={() => { setEmail('rajesh.kumar@college.edu'); setPassword('Faculty@123'); }}
              >
                <span className="text-gray-700"><span className="text-emerald-600 font-medium">Faculty:</span> rajesh.kumar@...</span>
                <span className="text-xs text-gray-400 group-hover:text-purple-500">Click</span>
              </div>
              <div 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-100 cursor-pointer transition-colors group"
                onClick={() => { setEmail('rahul.verma@student.college.edu'); setPassword('Student@123'); }}
              >
                <span className="text-gray-700"><span className="text-orange-500 font-medium">Student:</span> rahul.verma@...</span>
                <span className="text-xs text-gray-400 group-hover:text-purple-500">Click</span>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <span className="text-gray-500">Don't have an account?</span>
            <button onClick={() => alert('Sign up functionality coming soon!')} className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium rounded-lg transition-colors">
              Sign up
            </button>
          </div>
        </div>

        {/* Decorative corner bottom */}
        <div className="absolute bottom-0 left-0 w-full h-8 flex items-center justify-center">
          <div className="w-16 h-1 bg-purple-200 rounded-full" />
        </div>
      </div>

      {/* Right Side - Welcome Banner */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Decorative Blobs */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-purple-300/20 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-lg">
          <h2 className="text-5xl font-bold text-white mb-2">Welcome to</h2>
          <h3 className="text-5xl font-light text-purple-100 mb-4">student portal</h3>
          <p className="text-purple-200 text-lg">Login to access your account</p>
        </div>

        {/* Illustration */}
        <div className="relative z-10 mt-12">
          <svg viewBox="0 0 400 300" className="w-96 h-72">
            {/* Document/Form */}
            <rect x="120" y="80" width="160" height="180" rx="10" fill="white" stroke="#e0e0e0" strokeWidth="2"/>
            <rect x="140" y="120" width="100" height="8" rx="4" fill="#a855f7"/>
            <rect x="140" y="140" width="120" height="8" rx="4" fill="#e0e0e0"/>
            <rect x="140" y="160" width="80" height="8" rx="4" fill="#e0e0e0"/>
            <rect x="140" y="180" width="110" height="8" rx="4" fill="#e0e0e0"/>
            <rect x="140" y="200" width="90" height="8" rx="4" fill="#e0e0e0"/>
            {/* Lock Icon */}
            <circle cx="180" cy="230" r="20" fill="#f3e8ff" stroke="#a855f7" strokeWidth="2"/>
            <rect x="172" y="225" width="16" height="12" rx="2" fill="#a855f7"/>
            <path d="M175 225 v-5 a5 5 0 0 1 10 0 v5" fill="none" stroke="#a855f7" strokeWidth="2"/>
            {/* Person 1 - Standing */}
            <ellipse cx="80" cy="260" rx="25" ry="8" fill="#a855f7" opacity="0.3"/>
            <circle cx="80" cy="150" r="15" fill="#f5f5f5"/>
            <path d="M65 170 Q80 200 80 260" stroke="#f5f5f5" strokeWidth="20" fill="none" strokeLinecap="round"/>
            <path d="M70 190 L50 220" stroke="#f5f5f5" strokeWidth="8" strokeLinecap="round"/>
            <path d="M90 190 L115 170" stroke="#f5f5f5" strokeWidth="8" strokeLinecap="round"/>
            <circle cx="115" cy="165" r="5" fill="#a855f7"/>
            {/* Person 2 - Sitting */}
            <circle cx="320" cy="120" r="15" fill="#f5f5f5"/>
            <path d="M305 140 Q320 160 335 160" stroke="#f5f5f5" strokeWidth="18" fill="none" strokeLinecap="round"/>
            <path d="M335 160 L350 200" stroke="#f5f5f5" strokeWidth="8" strokeLinecap="round"/>
            <path d="M320 160 L300 200" stroke="#f5f5f5" strokeWidth="8" strokeLinecap="round"/>
            <rect x="280" y="140" width="50" height="35" rx="3" fill="#333" transform="rotate(-15 305 157)"/>
            <rect x="283" y="143" width="44" height="28" rx="2" fill="#4a5568" transform="rotate(-15 305 157)"/>
            {/* Plant */}
            <path d="M350 280 Q360 250 340 230" stroke="#a855f7" strokeWidth="3" fill="none"/>
            <ellipse cx="335" cy="225" rx="15" ry="20" fill="#c084fc" opacity="0.6"/>
            <path d="M350 280 Q340 260 360 240" stroke="#a855f7" strokeWidth="3" fill="none"/>
            <ellipse cx="365" cy="235" rx="12" ry="18" fill="#a855f7" opacity="0.4"/>
          </svg>
        </div>

        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-purple-300/30 rounded-br-3xl m-6" />
      </div>
    </div>
  );
};

export default Login;
