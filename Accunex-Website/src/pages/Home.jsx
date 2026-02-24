import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BarChart3, Package, Users, TrendingUp, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Manage Your Business Easily
            </h1>
            <p className="text-xl text-teal-100 mb-8">
              Simple and powerful business management software for small and medium businesses
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600">
              All the tools to manage your business in one place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<TrendingUp size={32} />}
              title="Sales Tracking"
              description="Keep track of all your sales and revenue"
            />
            <FeatureCard
              icon={<Package size={32} />}
              title="Inventory Management"
              description="Manage your stock and get low stock alerts"
            />
            <FeatureCard
              icon={<Users size={32} />}
              title="Staff Management"
              description="Add and manage your team members"
            />
            <FeatureCard
              icon={<BarChart3 size={32} />}
              title="Reports"
              description="Get detailed reports of your business"
            />
            <FeatureCard
              icon={<Shield size={32} />}
              title="Secure"
              description="Your data is safe and encrypted"
            />
            <FeatureCard
              icon={<Zap size={32} />}
              title="Fast"
              description="Quick and easy to use"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Accunex?
              </h2>
              <div className="space-y-3">
                <BenefitItem text="Easy to use - no training needed" />
                <BenefitItem text="Works on any device" />
                <BenefitItem text="Affordable pricing" />
                <BenefitItem text="24/7 support" />
                <BenefitItem text="Regular updates" />
                <BenefitItem text="Trusted by 1000+ businesses" />
              </div>
            </div>
            <div className="bg-teal-50 rounded-lg p-8">
              <div className="text-center space-y-6">
                <div>
                  <p className="text-5xl font-bold text-teal-700">1000+</p>
                  <p className="text-gray-700">Happy Customers</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-2xl font-bold text-teal-700">99.9%</p>
                    <p className="text-sm text-gray-600">Uptime</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-2xl font-bold text-teal-700">24/7</p>
                    <p className="text-sm text-gray-600">Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Join thousands of businesses using Accunex
          </p>
          <Link
            to="/login"
            className="inline-block bg-white text-teal-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="text-teal-600 mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function BenefitItem({ text }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="text-teal-600" size={18} />
      <p className="text-gray-700">{text}</p>
    </div>
  );
}
