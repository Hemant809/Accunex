import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Target, Eye, Award, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">About Accunex</h1>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto">
            Built by Hemant Verma to simplify business management for small businesses
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">My Story</h2>
            <p className="text-gray-700 mb-4">
              I am a B.Tech Electronics Engineering student at MITS Gwalior and a professional accountant 
              with over 4 years of real-world experience. While working with business accounts in shops 
              and hospital labs, I realized how challenging it is for small businesses to manage billing, 
              stock, and accounting using complicated or expensive software.
            </p>
            <p className="text-gray-700 mb-4">
              With both accounting knowledge and technical skills in web development, I decided to create 
              a platform that solves real business problems in a simple way. Accunex is built from my 
              practical experience and understanding of daily business operations.
            </p>
            <p className="text-gray-700">
              My goal is to help local businesses, grocery stores, and small enterprises manage their 
              operations digitally without confusion or unnecessary complexity.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <Target className="text-teal-600 mb-3" size={40} />
              <h3 className="text-xl font-bold text-gray-900 mb-3">My Mission</h3>
              <p className="text-gray-700">
                My mission is to empower small business owners with simple and affordable digital tools 
                so they can focus more on growth and less on paperwork.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Eye className="text-teal-600 mb-3" size={40} />
              <h3 className="text-xl font-bold text-gray-900 mb-3">My Vision</h3>
              <p className="text-gray-700">
                My vision is to build one of India’s most trusted small business management platforms, 
                driven by real accounting experience and modern technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What I Believe In</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-teal-600" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quality</h3>
              <p className="text-gray-600">
                I focus on accuracy, reliability, and smooth performance in every feature I build.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-teal-600" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Customer First</h3>
              <p className="text-gray-600">
                Every feature is designed keeping real shop owners and business users in mind.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-teal-600" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Simple</h3>
              <p className="text-gray-600">
                I believe in keeping things simple — no unnecessary complexity, only practical tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}