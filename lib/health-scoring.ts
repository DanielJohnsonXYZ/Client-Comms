import type { Client, Message, Signal } from './types';

interface HealthFactors {
  recency: number; // Days since last contact
  frequency: number; // Messages per month
  sentiment: number; // Average sentiment
  responseTime: number | null; // Hours to respond
  riskSignals: number; // Count of unaddressed risk signals
  opportunitySignals: number; // Count of opportunity signals
}

export function calculateHealthScore(
  client: Client,
  recentMessages: Message[],
  signals: Signal[]
): number {
  const factors = extractHealthFactors(client, recentMessages, signals);

  // Weighted scoring system (0-100)
  let score = 50; // Start at neutral

  // Recency factor (0-30 points)
  if (factors.recency <= 7) {
    score += 30; // Very recent contact
  } else if (factors.recency <= 30) {
    score += 20; // Recent contact
  } else if (factors.recency <= 90) {
    score += 10; // Moderately recent
  } else if (factors.recency > 180) {
    score -= 20; // Very old - losing touch
  }

  // Sentiment factor (-20 to +20 points)
  score += factors.sentiment * 20;

  // Response time factor (-15 to +10 points)
  if (factors.responseTime !== null) {
    if (factors.responseTime < 4) {
      score += 10; // Very responsive
    } else if (factors.responseTime < 24) {
      score += 5; // Good response time
    } else if (factors.responseTime > 72) {
      score -= 15; // Slow response - possible disengagement
    }
  }

  // Risk signals factor (-30 points max)
  score -= factors.riskSignals * 10;

  // Opportunity signals factor (+15 points max)
  score += Math.min(factors.opportunitySignals * 5, 15);

  // Frequency factor (+10 points if active)
  if (factors.frequency > 4) {
    score += 10; // High engagement
  } else if (factors.frequency < 1) {
    score -= 10; // Low engagement
  }

  // Clamp between 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

function extractHealthFactors(
  client: Client,
  recentMessages: Message[],
  signals: Signal[]
): HealthFactors {
  const now = new Date();

  // Calculate recency (days since last contact)
  const recency = client.last_contact_date
    ? Math.floor(
        (now.getTime() - new Date(client.last_contact_date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 999;

  // Calculate frequency (messages per month over last 90 days)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const recentCount = recentMessages.filter(
    (m) => new Date(m.timestamp) > ninetyDaysAgo
  ).length;
  const frequency = (recentCount / 90) * 30; // Convert to per-month rate

  // Average sentiment
  const sentimentMessages = recentMessages.filter((m) => m.sentiment_score !== null);
  const sentiment =
    sentimentMessages.length > 0
      ? sentimentMessages.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) /
        sentimentMessages.length
      : 0;

  // Response time (use existing or null)
  const responseTime = client.response_time_avg;

  // Count unaddressed signals
  const riskSignals = signals.filter(
    (s) => s.signal_type === 'risk' && !s.addressed
  ).length;

  const opportunitySignals = signals.filter(
    (s) => s.signal_type === 'opportunity' && !s.addressed
  ).length;

  return {
    recency,
    frequency,
    sentiment,
    responseTime,
    riskSignals,
    opportunitySignals,
  };
}

export function determineClientStatus(
  healthScore: number,
  signals: Signal[]
): Client['status'] {
  // Check for risk signals first
  const hasHighSeverityRisk = signals.some(
    (s) => s.signal_type === 'risk' && s.severity >= 7 && !s.addressed
  );

  if (hasHighSeverityRisk || healthScore < 40) {
    return 'at_risk';
  }

  // Check for opportunities
  const hasOpportunity = signals.some(
    (s) => s.signal_type === 'opportunity' && !s.addressed
  );

  if (hasOpportunity && healthScore >= 60) {
    return 'opportunity';
  }

  // Otherwise, determine by health score
  if (healthScore >= 70) {
    return 'healthy';
  } else if (healthScore < 40) {
    return 'at_risk';
  } else {
    return 'healthy'; // Default to healthy for mid-range scores
  }
}

export function calculateResponseTime(messages: Message[]): number | null {
  // Find pairs of client message -> our response
  const responses: number[] = [];

  for (let i = 0; i < messages.length - 1; i++) {
    const current = messages[i];
    const next = messages[i + 1];

    // If client sent message and we responded
    if (current.is_from_client && !next.is_from_client) {
      const timeDiff =
        new Date(next.timestamp).getTime() - new Date(current.timestamp).getTime();
      const hours = timeDiff / (1000 * 60 * 60);
      responses.push(hours);
    }
  }

  if (responses.length === 0) return null;

  // Return median response time (more robust than average)
  responses.sort((a, b) => a - b);
  const mid = Math.floor(responses.length / 2);
  return responses.length % 2 === 0
    ? (responses[mid - 1] + responses[mid]) / 2
    : responses[mid];
}
