import { useEffect } from 'react';

export default function Login() {
  useEffect(() => {
    // Redirect to actual E-commerce application registration
    window.location.href = 'https://accunex-3deb.vercel.app/login';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-600 to-teal-800">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
        <p className="text-xl">Redirecting to registration...</p>
      </div>
    </div>
  );
}
