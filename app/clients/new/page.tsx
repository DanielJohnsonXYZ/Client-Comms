'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewClientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const { client } = await res.json();
        router.push(`/clients/${client.id}`);
      } else {
        const error = await res.json();
        alert(`Failed to create client: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Client</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Client Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            {/* Company */}
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Company *
              </label>
              <input
                type="text"
                id="company"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Acme Corp"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@acmecorp.com"
              />
              <p className="text-sm text-gray-500 mt-2">
                The system will automatically track all communications with this email
                address.
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                What happens next?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Gmail will sync messages with this client automatically</li>
                <li>• AI will analyze communication patterns and sentiment</li>
                <li>• Health score and signals will appear on the dashboard</li>
                <li>• You'll get daily digest updates about this relationship</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Add Client'}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Getting Started Tips
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold">1.</span>
              <div>
                <strong>Connect Gmail first</strong> - Make sure you've connected your
                Gmail account in the dashboard to start syncing messages.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <div>
                <strong>Wait for sync</strong> - It may take 15-30 minutes for the first
                messages to appear as the system syncs your inbox.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <div>
                <strong>Run manual analysis</strong> - Once messages appear, click "Run
                Analysis Now" on the client page to immediately generate insights.
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600 font-bold">4.</span>
              <div>
                <strong>Check daily digests</strong> - Visit the digest page each morning
                to see all important signals across your clients.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
