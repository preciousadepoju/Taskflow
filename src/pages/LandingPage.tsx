import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Zap,
  Users,
  Shield,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg flex items-center justify-center">
                <Zap className="text-white size-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">TaskFlow</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Product</a>
              <Link to="/signup" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</Link>
              <Link to="/signup" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Resources</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors">
                Login
              </Link>
              <Link to="/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-sm">
                Sign Up
              </Link>
              <button
                className="md:hidden p-2 text-slate-600"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4">
            <a href="#features" className="block text-sm font-medium text-slate-600">Product</a>
            <Link to="/signup" className="block text-sm font-medium text-slate-600">Pricing</Link>
            <Link to="/signup" className="block text-sm font-medium text-slate-600">Resources</Link>
            <Link to="/login" className="block text-sm font-medium text-slate-600">Login</Link>
            <Link to="/signup" className="block text-sm font-semibold text-indigo-600">Sign Up</Link>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto mb-12"
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
                Organize your work, <span className="text-indigo-600">effortlessly</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10">
                The all-in-one task manager designed to help teams move faster, stay synchronized, and hit every deadline with confidence.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  Get Started for Free <ArrowRight className="size-5" />
                </Link>
                <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-lg hover:bg-slate-50 transition-all">
                  View Demo
                </Link>
              </div>
            </motion.div>

            {/* Hero Image Placeholder */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mt-16 group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-[2rem] blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl overflow-hidden">
                <div className="aspect-[16/9] w-full rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
                  <div className="relative z-10 w-full h-full flex flex-col p-6 space-y-4">
                    <div className="h-8 w-1/4 bg-slate-200 rounded-md"></div>
                    <div className="grid grid-cols-3 gap-4 flex-1">
                      <div className="space-y-4">
                        <div className="h-32 bg-slate-100 rounded-lg"></div>
                        <div className="h-24 bg-slate-100 rounded-lg"></div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-48 bg-slate-100 rounded-lg"></div>
                        <div className="h-20 bg-slate-100 rounded-lg"></div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-28 bg-indigo-50 rounded-lg border border-indigo-100"></div>
                        <div className="h-40 bg-slate-100 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-base font-bold text-indigo-600 uppercase tracking-widest mb-3">Powerful Features</h2>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Everything you need to ship faster</h3>
              <p className="text-slate-600">TaskFlow combines powerful enterprise features with a simple interface to keep your team aligned and focused.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<LayoutDashboard className="text-indigo-600" />}
                title="Intuitive Dashboard"
                description="Get a bird's-eye view of all your projects with our clean and customizable interface. Tailor your workspace to your team's specific needs."
              />
              <FeatureCard
                icon={<Zap className="text-indigo-600" />}
                title="Smart Scheduling"
                description="Let our AI-driven engine prioritize your tasks and optimize your daily calendar automatically based on deadlines and team bandwidth."
              />
              <FeatureCard
                icon={<Users className="text-indigo-600" />}
                title="Team Collaboration"
                description="Work together in real-time with built-in comments, file sharing, and instant notifications. Keep everyone on the same page, always."
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-[#f6f6f8]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-indigo-600 rounded-[2.5rem] p-12 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 size-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-64 bg-indigo-900/20 rounded-full blur-3xl"></div>

              <div className="relative z-10 text-center flex flex-col items-center">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to transform your workflow?</h2>
                <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl">
                  Join over 10,000+ teams who use TaskFlow to stay organized every single day. Start your journey today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup" className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl text-lg hover:bg-slate-50 transition-colors shadow-lg">
                    Start Your Free Trial
                  </Link>
                  <a href="mailto:sales@taskflow.com" className="px-8 py-4 bg-indigo-700 border border-indigo-500 text-white font-bold rounded-xl text-lg hover:bg-indigo-800 transition-colors">
                    Contact Sales
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-indigo-600 p-1.5 rounded-lg flex items-center justify-center">
                  <Zap className="text-white size-5" />
                </div>
                <span className="text-lg font-bold text-slate-900">TaskFlow</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs">
                Making team productivity simple and accessible for everyone. Built with love for the modern worker.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 mb-4">Product</h5>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Features</a></li>
                <li><Link to="/signup" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Integrations</Link></li>
                <li><Link to="/signup" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 mb-4">Company</h5>
              <ul className="space-y-3">
                <li><Link to="/signup" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">About Us</Link></li>
                <li><Link to="/signup" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Careers</Link></li>
                <li><Link to="/signup" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 mb-4">Support</h5>
              <ul className="space-y-3">
                <li><Link to="/signup" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Documentation</Link></li>
                <li><Link to="/signup" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/signup" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">© 2024 TaskFlow Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link to="/signup" className="text-slate-400 hover:text-indigo-600 transition-colors">
                <Shield className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl border border-slate-200 bg-[#f6f6f8] hover:shadow-xl transition-all group">
      <div className="size-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
        {/* Clone icon to change color on hover */}
        {Object.assign({}, icon, { props: { ...icon.props, className: cn(icon.props.className, "group-hover:text-white transition-colors") } })}
      </div>
      <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
