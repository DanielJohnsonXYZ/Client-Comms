'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to waitlist
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="text-xl font-bold text-gray-900">
                Relationship Intelligence
              </div>
              <div className="hidden md:flex gap-6">
                <a href="#features" className="text-gray-600 hover:text-gray-900">
                  Features
                </a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">
                  How It Works
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </a>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              ✨ AI-Powered Relationship Intelligence
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Never Let a
            <br />
            <span className="text-blue-600">Client Slip Away</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI that reads your conversations like you do — spotting risks, opportunities,
            and moments that matter before they slip through the cracks.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Get Early Access →
            </Link>
            <button className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors font-medium text-lg">
              Watch Demo
            </button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div>✓ No credit card required</div>
            <div>✓ Privacy-first</div>
            <div>✓ Your data stays yours</div>
          </div>
        </div>
      </section>

      {/* Live Dashboard Preview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
              <h3 className="font-semibold">Live Dashboard</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Mock client cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">Acme Corp</h4>
                      <p className="text-sm text-red-600 font-medium">At Risk</p>
                    </div>
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Response time doubled in 2 weeks
                  </p>
                </div>

                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">TechStart Inc</h4>
                      <p className="text-sm text-green-600 font-medium">Opportunity</p>
                    </div>
                    <span className="text-2xl">🚀</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Expanding to 3 new markets
                  </p>
                </div>

                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">Global Partners</h4>
                      <p className="text-sm text-blue-600 font-medium">Healthy</p>
                    </div>
                    <span className="text-2xl">✨</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Positive sentiment, on track
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {[
              { label: 'Client retention rate', value: '94%' },
              { label: 'More opportunities spotted', value: '3.2x' },
              { label: 'Saved per week', value: '12hrs' },
              { label: 'Revenue protected', value: '$2.4M' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The Problem</h2>
            <p className="text-xl text-gray-600">
              You're drowning in messages. Missing what matters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Message Overload
              </h3>
              <p className="text-gray-600">
                Hundreds of emails, Slacks, and comments every day. Critical signals
                buried in noise.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🔇</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Silent Red Flags
              </h3>
              <p className="text-gray-600">
                A client goes quiet. Tone shifts. By the time you notice, it's too late.
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">💸</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Lost Opportunities
              </h3>
              <p className="text-gray-600">
                Upsell hints and expansion signals slip by unnoticed in daily
                conversations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The Solution</h2>
            <p className="text-xl text-gray-600">Your AI Chief-of-Staff</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Who's Happy or At Risk
              </h3>
              <p className="text-gray-600 mb-6">
                Know which relationships are thriving and which need attention — before
                they become problems.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Where There's Tension
              </h3>
              <p className="text-gray-600 mb-6">
                Surface warning signs like delayed responses, tonal shifts, or sudden
                communication drops.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Emerging Opportunities
              </h3>
              <p className="text-gray-600">
                Spot upsells, renewals, and new project hints hidden in everyday
                conversations.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">
                Multi-Channel Integration
              </h4>
              <div className="space-y-3">
                {['Gmail', 'Slack', 'Microsoft Teams', 'ClickUp', 'Basecamp'].map(
                  (platform) => (
                    <div
                      key={platform}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold">
                        {platform[0]}
                      </div>
                      <span className="text-gray-900 font-medium">{platform}</span>
                      <span className="ml-auto text-green-600 text-sm">✓ Connected</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Stop Letting Relationships
            <br />
            Slip Away
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the waitlist and be among the first to turn communication noise into
            relationship clarity.
          </p>

          {submitted ? (
            <div className="bg-green-500 text-white px-6 py-4 rounded-lg inline-block">
              ✓ Thanks! We'll be in touch soon.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-lg text-gray-900"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
              >
                Get Early Access
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
            <div>✓ No credit card required</div>
            <div>✓ Cancel anytime</div>
            <div>✓ Your data stays yours</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#">Integrations</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#">Documentation</a>
                </li>
                <li>
                  <a href="#">Help Center</a>
                </li>
                <li>
                  <a href="#">Community</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Service</a>
                </li>
                <li>
                  <a href="#">Security</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            © 2025 Relationship Intelligence. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
