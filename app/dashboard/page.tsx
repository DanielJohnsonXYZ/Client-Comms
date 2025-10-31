'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ClientCard from '@/components/ClientCard';
import type { Client, Signal, DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [signals, setSignals] = useState<Record<string, Signal[]>>({});
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'at_risk' | 'opportunity' | 'healthy'>(
    'all'
  );

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      // Fetch clients
      const clientsRes = await fetch('/api/clients');
      const clientsData = await clientsRes.json();
      const allClients = clientsData.clients || [];

      setClients(allClients);

      // Fetch signals for each client
      const signalsMap: Record<string, Signal[]> = {};
      for (const client of allClients) {
        const signalsRes = await fetch(`/api/clients/${client.id}`);
        const data = await signalsRes.json();
        signalsMap[client.id] = data.signals || [];
      }
      setSignals(signalsMap);

      // Calculate stats
      const dashboardStats: DashboardStats = {
        total_clients: allClients.length,
        at_risk_count: allClients.filter((c: Client) => c.status === 'at_risk').length,
        opportunity_count: allClients.filter((c: Client) => c.status === 'opportunity')
          .length,
        healthy_count: allClients.filter((c: Client) => c.status === 'healthy').length,
        avg_health_score:
          allClients.reduce((sum: number, c: Client) => sum + c.health_score, 0) /
          allClients.length,
        unread_signals: Object.values(signalsMap)
          .flat()
          .filter((s) => !s.addressed).length,
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredClients =
    filter === 'all' ? clients : clients.filter((c) => c.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Relationship Intelligence
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                AI-powered client monitoring
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/clients/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Client
              </Link>
              <Link
                href="/digest"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                View Digest
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_clients}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-red-200">
              <p className="text-sm text-red-600 mb-1">At Risk</p>
              <p className="text-3xl font-bold text-red-700">{stats.at_risk_count}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-green-200">
              <p className="text-sm text-green-600 mb-1">Opportunities</p>
              <p className="text-3xl font-bold text-green-700">
                {stats.opportunity_count}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Avg Health</p>
              <p className="text-3xl font-bold text-blue-700">
                {Math.round(stats.avg_health_score)}%
              </p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All' },
            { key: 'at_risk', label: 'At Risk' },
            { key: 'opportunity', label: 'Opportunities' },
            { key: 'healthy', label: 'Healthy' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Client Grid */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <p className="text-gray-600 mb-4">No clients found</p>
            <Link
              href="/clients/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Your First Client
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                signals={signals[client.id]}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
