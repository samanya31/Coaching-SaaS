import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import folkDancer from '../assets/fold dancer.png';
import foldDancer2 from '../assets/fold dancer 2.png';
import nsdLogo from '../assets/NSDLOGO.png';
import bgmind from '../assets/bgmind.png';
import akamLogo from '../assets/Azadi-Ka-Amrit-Mahotsav-Logo.png';
import nsdVideo from '../assets/nsd-1.mp4';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoEnded, setVideoEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted
  const videoRef = useRef<HTMLVideoElement>(null);

  const { loginWithGoogle, loginWithPassword } = useAuth();
  const navigate = useNavigate();

  // Auto-play video when component mounts
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('Video autoplay failed:', error);
        // If autoplay fails, show image immediately
        setVideoEnded(true);
      });
    }
  }, []);

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithPassword(email, password);
      navigate('/dashboard/personal-details');
    } catch (err: any) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Video that transitions to Image (42%) */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden shadow-[10px_0_30px_rgba(0,0,0,0.2)] z-10">
        {!videoEnded ? (
          <>
            <video
              ref={videoRef}
              src={nsdVideo}
              onEnded={handleVideoEnd}
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Unmute Button */}
            {isMuted && (
              <button
                onClick={handleMute}
                className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm z-20 flex items-center gap-2 group"
                aria-label="Unmute video"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                  />
                </svg>
                <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity max-w-0 group-hover:max-w-xs overflow-hidden whitespace-nowrap">
                  Click to unmute
                </span>
              </button>
            )}
          </>
        ) : (
          <img
            src={folkDancer}
            alt="Folk Dancer"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      {/* Right Side - Form Section (58%) */}
      <div className="w-full lg:w-[58%] flex flex-col items-center lg:justify-center bg-nsd-beige relative overflow-hidden">
        {/* Mobile Top Image - Relative Block */}
        <div className="w-full h-72 lg:hidden relative shrink-0">
          <img src={foldDancer2} alt="Folk Dancer" className="w-full h-full object-cover opacity-60 min-[742px]:hidden" />
          <img src={folkDancer} alt="Folk Dancer" className="w-full h-full object-cover opacity-60 hidden min-[742px]:block" />
          {/* Gradient Overlay for smooth transition */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-nsd-beige to-transparent"></div>
        </div>

        {/* Left Side Logo - Absolute Position (Desktop) */}
        <div className="hidden lg:block absolute left-4 top-4">
          <img src={bgmind} alt="Government Emblem" className="w-24 h-28 object-contain opacity-90" />
        </div>

        {/* Right Side Logo - Absolute Position (Desktop) */}
        <div className="hidden lg:block absolute right-4 top-2">
          <img src={akamLogo} alt="Azadi Ka Amrit Mahotsav" className="w-28 h-32 object-contain opacity-90" />
        </div>

        {/* Center Content - Form Area */}
        <div className="w-full max-w-lg flex flex-col items-center p-4 lg:p-0 relative z-10 -mt-8 lg:mt-12">
          {/* NSD Logo Above Form */}
          <div className="text-center mb-6">
            <img src={nsdLogo} alt="NSD Logo" className="w-20 h-20 object-contain mx-auto mb-2" />

            {/* National School of Drama - Dramatic Font */}
            <h1 className="text-2xl font-bold text-[#0d1b3e] mb-1 uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
              National School of Drama
            </h1>

            {/* Start your journey here */}
            <p className="text-[#d84315] font-semibold text-base" style={{ fontFamily: "'Cinzel', serif" }}>
              Start your journey here
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-sans">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Welcome Back</h2>

            <div>
              <label className="block text-sm font-bold text-[#d84315] mb-2 font-sans">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nsd-orange focus:border-transparent outline-none bg-white font-sans"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#d84315] mb-2 font-sans">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nsd-orange focus:border-transparent outline-none bg-white font-sans"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d84315] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#bf360c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-sans"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-nsd-beige px-2 text-sm text-gray-500 font-sans">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors font-sans"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <p className="text-center text-sm text-gray-600 mt-6 font-sans">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-[#d84315] font-semibold hover:underline font-sans"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
