import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { analyzeClientCommunications } from '@/lib/ai-analysis';
import { calculateHealthScore, determineClientStatus } from '@/lib/health-scoring';
import type { Client, Message, Signal } from '@/lib/types';

// POST - Trigger analysis for all clients (called by n8n daily cron)
export async function POST(request: NextRequest) {
  try {
    // Optional: Verify request is from n8n using API key
    const apiKey = request.headers.get('x-api-key');
    if (process.env.N8N_API_KEY && apiKey !== process.env.N8N_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all clients
    const { data: clients, error } = await supabaseAdmin.from('clients').select('*');

    if (error || !clients) {
      throw new Error('Failed to fetch clients');
    }

    const results = [];

    for (const client of clients) {
      try {
        // Get recent messages (last 30)
        const { data: messages } = await supabaseAdmin
          .from('messages')
          .select('*')
          .eq('client_id', client.id)
          .order('timestamp', { ascending: false })
          .limit(30);

        if (!messages || messages.length === 0) {
          results.push({
            client_id: client.id,
            client_name: client.name,
            status: 'skipped',
            reason: 'No messages to analyze',
          });
          continue;
        }

        // Update total_messages count
        const { count } = await supabaseAdmin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id);

        // Run AI analysis
        const analysis = await analyzeClientCommunications({
          messages: messages as Message[],
          client: client as Client,
        });

        // Insert new signals
        if (analysis.signals.length > 0) {
          await supabaseAdmin.from('signals').insert(analysis.signals);
        }

        // Get all unaddressed signals for health calculation
        const { data: allSignals } = await supabaseAdmin
          .from('signals')
          .select('*')
          .eq('client_id', client.id)
          .eq('addressed', false);

        // Calculate health score
        const healthScore = calculateHealthScore(
          client as Client,
          messages as Message[],
          allSignals as Signal[]
        );

        // Determine status
        const status = determineClientStatus(healthScore, allSignals as Signal[]);

        // Update client
        await supabaseAdmin
          .from('clients')
          .update({
            health_score: healthScore,
            status,
            sentiment_avg: analysis.sentiment_score,
            total_messages: count || 0,
          })
          .eq('id', client.id);

        // Mark messages as analyzed
        await supabaseAdmin
          .from('messages')
          .update({ analyzed: true })
          .eq('client_id', client.id)
          .eq('analyzed', false);

        results.push({
          client_id: client.id,
          client_name: client.name,
          status: 'analyzed',
          health_score: healthScore,
          client_status: status,
          signals_created: analysis.signals.length,
          messages_analyzed: messages.length,
        });
      } catch (clientError) {
        console.error(`Error analyzing client ${client.id}:`, clientError);
        results.push({
          client_id: client.id,
          client_name: client.name,
          status: 'error',
          error: String(clientError),
        });
      }
    }

    return NextResponse.json({
      success: true,
      total_clients: clients.length,
      analyzed: results.filter((r) => r.status === 'analyzed').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
      errors: results.filter((r) => r.status === 'error').length,
      results,
    });
  } catch (error) {
    console.error('Error in analyze-all:', error);
    return NextResponse.json(
      { error: 'Failed to analyze clients', details: String(error) },
      { status: 500 }
    );
  }
}
