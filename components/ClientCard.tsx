'use client';

import Link from 'next/link';
import type { Client, Signal } from '@/lib/types';

interface ClientCardProps {
  client: Client;
  signals?: Signal[];
}

export default function ClientCard({ client, signals = [] }: ClientCardProps) {
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

  const topSignal = signals.sort((a, b) => b.severity - a.severity)[0];

  const getHealthColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Link href={`/clients/${client.id}`}>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{client.name}</h3>
            <p className="text-sm text-gray-600">{client.company}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{statusIcons[client.status]}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border status-${client.status}`}
          >
            {statusLabels[client.status]}
          </span>
        </div>

        {/* Health Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Health Score</span>
            <span className="text-sm font-bold text-gray-900">
              {client.health_score}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getHealthColor(client.health_score)}`}
              style={{ width: `${client.health_score}%` }}
            />
          </div>
        </div>

        {/* Top Signal */}
        {topSignal && (
          <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
            <p className="text-sm font-medium text-gray-900 mb-1">
              {topSignal.title}
            </p>
            <p className="text-xs text-gray-600 line-clamp-2">
              {topSignal.description}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium">{client.total_messages}</span> messages
          </div>
          {client.last_contact_date && (
            <div>
              Last contact:{' '}
              {new Date(client.last_contact_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
