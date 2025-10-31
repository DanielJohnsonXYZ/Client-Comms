'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Signal, Client } from '@/lib/types';

interface DigestData {
  generated_at: string;
  alerts: (Signal & { client: Client })[];
  opportunities: (Signal & { client: Client })[];
  check_ins: (Signal & { client: Client })[];
}

export default function DigestPage() {
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDigest();
  }, []);

  async function loadDigest() {
    try {
      // Fetch all clients
      const clientsRes = await fetch('/api/clients');
      const { clients } = await clientsRes.json();

      // Fetch signals for each client
      const allAlerts: (Signal & { client: Client })[] = [];
      const allOpportunities: (Signal & { client: Client })[] = [];
      const allCheckIns: (Signal & { client: Client })[] = [];

      for (const client of clients) {
        const res = await fetch(`/api/clients/${client.id}`);
        const data = await res.json();

        const signals = data.signals || [];

        signals.forEach((signal: Signal) => {
          const signalWithClient = { ...signal, client };

          if (signal.signal_type === 'risk' && !signal.addressed) {
            allAlerts.push(signalWithClient);
          } else if (signal.signal_type === 'opportunity' && !signal.addressed) {
            allOpportunities.push(signalWithClient);
          } else if (signal.signal_type === 'check_in' && !signal.addressed) {
            allCheckIns.push(signalWithClient);
          }
        });
      }

      // Sort by severity
      allAlerts.sort((a, b) => b.severity - a.severity);
      allOpportunities.sort((a, b) => b.severity - a.severity);

      setDigest({
        generated_at: new Date().toISOString(),
        alerts: allAlerts,
        opportunities: allOpportunities,
        check_ins: allCheckIns,
      });
    } catch (error) {
      console.error('Error loading digest:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAddressed(signalId: string) {
    try {
      await fetch(`/api/signals/${signalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressed: true }),
      });
      loadDigest(); // Reload
    } catch (error) {
      console.error('Error marking signal as addressed:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating digest...</p>
        </div>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Failed to load digest</p>
      </div>
    );
  }

  const totalItems =
    digest.alerts.length + digest.opportunities.length + digest.check_ins.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Today's Digest</h1>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(digest.generated_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {' • '}
                {new Date(digest.generated_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Summary</h2>
          <p className="text-gray-600">
            {digest.alerts.length} alerts • {digest.opportunities.length} opportunities
            • {digest.check_ins.length} check-ins
          </p>
        </div>

        {totalItems === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All Clear!
            </h3>
            <p className="text-gray-600">
              No new signals detected. All your clients are looking good.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Alerts */}
            {digest.alerts.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-red-700 mb-4">
                  ⚠️ Clients Need Your Attention ({digest.alerts.length})
                </h2>
                <div className="space-y-4">
                  {digest.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="bg-white rounded-lg shadow-sm border border-red-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Link
                            href={`/clients/${alert.client_id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {alert.client.name}
                          </Link>
                          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Severity: {alert.severity}/10
                          </span>
                        </div>
                        <button
                          onClick={() => markAddressed(alert.id)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Mark as addressed
                        </button>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {alert.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{alert.description}</p>
                      {alert.context && (
                        <div className="bg-gray-50 rounded p-3 text-sm text-gray-600 border-l-4 border-red-400">
                          "{alert.context}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Opportunities */}
            {digest.opportunities.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-green-700 mb-4">
                  🚀 Opportunities to Pursue ({digest.opportunities.length})
                </h2>
                <div className="space-y-4">
                  {digest.opportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="bg-white rounded-lg shadow-sm border border-green-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Link
                            href={`/clients/${opp.client_id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {opp.client.name}
                          </Link>
                          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Priority: {opp.severity}/10
                          </span>
                        </div>
                        <button
                          onClick={() => markAddressed(opp.id)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Mark as addressed
                        </button>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-2">{opp.title}</h3>
                      <p className="text-gray-600 mb-3">{opp.description}</p>
                      {opp.context && (
                        <div className="bg-gray-50 rounded p-3 text-sm text-gray-600 border-l-4 border-green-400">
                          "{opp.context}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Check-ins */}
            {digest.check_ins.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-blue-700 mb-4">
                  💬 Suggested Check-ins ({digest.check_ins.length})
                </h2>
                <div className="space-y-4">
                  {digest.check_ins.map((checkIn) => (
                    <div
                      key={checkIn.id}
                      className="bg-white rounded-lg shadow-sm border border-blue-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Link
                          href={`/clients/${checkIn.client_id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {checkIn.client.name}
                        </Link>
                        <button
                          onClick={() => markAddressed(checkIn.id)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Mark as done
                        </button>
                      </div>
                      <p className="text-gray-600">{checkIn.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
