// Core types for the Client Intelligence platform

export type ClientStatus = 'at_risk' | 'opportunity' | 'healthy' | 'unknown';
export type SignalType = 'risk' | 'opportunity' | 'check_in' | 'positive' | 'negative';
export type MessageSource = 'gmail' | 'slack' | 'teams' | 'manual';

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  status: ClientStatus;
  health_score: number; // 0-100
  last_contact_date: string | null;
  total_messages: number;
  response_time_avg: number | null; // in hours
  sentiment_avg: number | null; // -1 to 1
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  client_id: string;
  thread_id: string | null;
  from_email: string;
  to_email: string;
  subject: string;
  body: string;
  body_snippet: string;
  timestamp: string;
  source: MessageSource;
  sentiment_score: number | null; // -1 to 1
  is_from_client: boolean;
  analyzed: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Signal {
  id: string;
  client_id: string;
  message_id: string | null;
  signal_type: SignalType;
  severity: number; // 1-10
  title: string;
  description: string;
  context: string | null;
  addressed: boolean;
  created_at: string;
}

export interface Digest {
  id: string;
  generated_at: string;
  period_start: string;
  period_end: string;
  summary: string;
  alerts: Signal[];
  opportunities: Signal[];
  check_ins: Signal[];
  viewed: boolean;
  created_at: string;
}

export interface AnalysisResult {
  sentiment_score: number;
  signals: Omit<Signal, 'id' | 'created_at'>[];
  client_status: ClientStatus;
  health_score: number;
  reasoning: string;
}

export interface DashboardStats {
  total_clients: number;
  at_risk_count: number;
  opportunity_count: number;
  healthy_count: number;
  avg_health_score: number;
  unread_signals: number;
}
