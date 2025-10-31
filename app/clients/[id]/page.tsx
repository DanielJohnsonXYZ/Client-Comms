'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Client, Message, Signal } from '@/lib/types';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadClient();
  }, [params.id]);

  async function loadClient() {
    try {
      const res = await fetch(`/api/clients/${params.id}`);
      const data = await res.json();

      setClient(data.client);
      setMessages(data.messages || []);
      setSignals(data.signals || []);
    } catch (error) {
      console.error('Error loading client:', error);
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    if (!client) return;

    setAnalyzing(true);
    try {
      const res = await fetch(`/api/clients/${client.id}/analyze`, {
        method: 'POST',
      });

      if (res.ok) {
        await loadClient(); // Reload data
        alert('Analysis complete!');
      } else {
        alert('Analysis failed');
      }
    } catch (error) {
      console.error('Error running analysis:', error);
      alert('Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  }

  async function deleteClient() {
    if (!client) return;

    if (!confirm(`Are you sure you want to delete ${client.name}?`)) return;

    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Client not found</p>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statusIcons = {
    at_risk: '⚠️',
    opportunity: '🚀',
    healthy: '✨',
    unknown: '❓',
  };

  const statusLabels = {
    at_risk: 'At Risk',
    opportunity: 'Opportunity',
    healthy: 'Healthy',
    unknown: 'Unknown',
  };

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← Back to Dashboard
            </Link>
            <div className="flex gap-3">
              <button
                onClick={runAnalysis}
                disabled={analyzing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? 'Analyzing...' : 'Run Analysis Now'}
              </button>
              <button
                onClick={deleteClient}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete Client
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Header */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
                <span className="text-4xl">{statusIcons[client.status]}</span>
              </div>
              <p className="text-lg text-gray-600">{client.company}</p>
              <p className="text-sm text-gray-500">{client.email}</p>
            </div>
            <div>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border status-${client.status}`}
              >
                {statusLabels[client.status]}
              </span>
            </div>
          </div>

          {/* Health Score */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Health Score</span>
              <span className={`text-2xl font-bold ${getHealthColor(client.health_score)}`}>
                {client.health_score}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  client.health_score >= 70
                    ? 'bg-green-500'
                    : client.health_score >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${client.health_score}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{client.total_messages}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Sentiment</p>
              <p className="text-2xl font-bold text-gray-900">
                {client.sentiment_avg !== null
                  ? (client.sentiment_avg * 100).toFixed(0)
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {client.response_time_avg !== null
                  ? `${Math.round(client.response_time_avg)}h`
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Contact</p>
              <p className="text-sm font-medium text-gray-900 mt-2">
                {client.last_contact_date
                  ? new Date(client.last_contact_date).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Signals */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Active Signals ({signals.length})
            </h2>

            {signals.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-gray-600">No signals detected</p>
              </div>
            ) : (
              <div className="space-y-4">
                {signals.map((signal) => (
                  <div
                    key={signal.id}
                    className={`bg-white rounded-lg shadow-sm border p-4 ${
                      signal.signal_type === 'risk'
                        ? 'border-red-200 bg-red-50'
                        : signal.signal_type === 'opportunity'
                        ? 'border-green-200 bg-green-50'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          signal.signal_type === 'risk'
                            ? 'bg-red-100 text-red-700'
                            : signal.signal_type === 'opportunity'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {signal.signal_type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-600">
                        Severity: {signal.severity}/10
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{signal.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{signal.description}</p>
                    {signal.context && (
                      <div className="text-xs text-gray-500 italic bg-white p-2 rounded">
                        "{signal.context}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recent Messages ({messages.length})
            </h2>

            {messages.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-gray-600">No messages yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Messages will appear here once Gmail sync is active
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              message.is_from_client
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {message.is_from_client ? 'FROM CLIENT' : 'FROM YOU'}
                          </span>
                          {message.sentiment_score !== null && (
                            <span className="text-xs text-gray-600">
                              Sentiment: {(message.sentiment_score * 100).toFixed(0)}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          {message.subject || '(no subject)'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      {message.body_snippet || message.body.substring(0, 200)}
                      {message.body.length > 200 && '...'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
