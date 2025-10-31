import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { analyzeClientCommunications } from '@/lib/ai-analysis';
import { calculateHealthScore, determineClientStatus } from '@/lib/health-scoring';
import type { Client, Message, Signal } from '@/lib/types';

// POST trigger analysis for a specific client
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get client
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get recent messages (last 30)
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('client_id', id)
      .order('timestamp', { ascending: false })
      .limit(30);

    if (messagesError) throw messagesError;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages to analyze' },
        { status: 400 }
      );
    }

    // Run AI analysis
    const analysis = await analyzeClientCommunications({
      messages: messages as Message[],
      client: client as Client,
    });

    // Insert new signals
    if (analysis.signals.length > 0) {
      await supabaseAdmin.from('signals').insert(analysis.signals);
    }

    // Get all signals for health calculation
    const { data: allSignals } = await supabaseAdmin
      .from('signals')
      .select('*')
      .eq('client_id', id)
      .eq('addressed', false);

    // Calculate health score
    const healthScore = calculateHealthScore(
      client as Client,
      messages as Message[],
      allSignals as Signal[]
    );

    // Determine status
    const status = determineClientStatus(healthScore, allSignals as Signal[]);

    // Update client with analysis results
    const { data: updatedClient, error: updateError } = await supabaseAdmin
      .from('clients')
      .update({
        health_score: healthScore,
        status,
        sentiment_avg: analysis.sentiment_score,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Mark messages as analyzed
    await supabaseAdmin
      .from('messages')
      .update({ analyzed: true })
      .eq('client_id', id)
      .eq('analyzed', false);

    return NextResponse.json({
      client: updatedClient,
      analysis: {
        ...analysis,
        signals_created: analysis.signals.length,
      },
    });
  } catch (error) {
    console.error('Error analyzing client:', error);
    return NextResponse.json(
      { error: 'Failed to analyze client' },
      { status: 500 }
    );
  }
}
