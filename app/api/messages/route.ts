import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { analyzeMessage } from '@/lib/ai-analysis';

// POST - Ingest message from n8n (Gmail, Slack, Teams, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.client_email || !body.from_email || !body.subject) {
      return NextResponse.json(
        { error: 'Missing required fields: client_email, from_email, subject' },
        { status: 400 }
      );
    }

    // Find or create client
    let client = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('email', body.client_email)
      .single();

    if (!client.data) {
      // Auto-create client if they don't exist
      const { data: newClient, error } = await supabaseAdmin
        .from('clients')
        .insert({
          name: body.client_name || extractNameFromEmail(body.client_email),
          company: body.company || 'Unknown',
          email: body.client_email,
          status: 'unknown',
          health_score: 50,
        })
        .select()
        .single();

      if (error) throw error;
      client.data = newClient;
    }

    const clientId = client.data.id;
    const isFromClient = body.from_email === body.client_email;

    // Check if message already exists (prevent duplicates)
    const messageId = body.message_id || generateMessageId(body);
    const { data: existing } = await supabaseAdmin
      .from('messages')
      .select('id')
      .eq('metadata->>external_id', messageId)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Message already exists',
        duplicate: true,
      });
    }

    // Analyze sentiment with AI (optional, can be done async)
    let sentimentScore = null;
    if (body.body || body.body_snippet) {
      try {
        sentimentScore = await analyzeMessage({
          id: '',
          client_id: clientId,
          thread_id: body.thread_id || null,
          from_email: body.from_email,
          to_email: body.to_email || '',
          subject: body.subject,
          body: body.body || body.body_snippet || '',
          body_snippet: body.body_snippet || body.body?.substring(0, 200) || '',
          timestamp: body.timestamp || new Date().toISOString(),
          source: body.source || 'gmail',
          sentiment_score: null,
          is_from_client: isFromClient,
          analyzed: false,
          metadata: {},
          created_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Sentiment analysis failed:', error);
        // Continue without sentiment
      }
    }

    // Insert message
    const { data: message, error: insertError } = await supabaseAdmin
      .from('messages')
      .insert({
        client_id: clientId,
        thread_id: body.thread_id || null,
        from_email: body.from_email,
        to_email: body.to_email || '',
        subject: body.subject,
        body: body.body || body.body_snippet || '',
        body_snippet: body.body_snippet || body.body?.substring(0, 200) || '',
        timestamp: body.timestamp || new Date().toISOString(),
        source: body.source || 'gmail',
        sentiment_score: sentimentScore,
        is_from_client: isFromClient,
        analyzed: false,
        metadata: {
          external_id: messageId,
          ...body.metadata,
        },
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update client last contact date
    await supabaseAdmin
      .from('clients')
      .update({
        last_contact_date: body.timestamp || new Date().toISOString(),
      })
      .eq('id', clientId);

    return NextResponse.json({
      success: true,
      message_id: message.id,
      client_id: clientId,
    });
  } catch (error) {
    console.error('Error ingesting message:', error);
    return NextResponse.json(
      { error: 'Failed to ingest message', details: String(error) },
      { status: 500 }
    );
  }
}

// Helper functions
function extractNameFromEmail(email: string): string {
  const username = email.split('@')[0];
  return username
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function generateMessageId(body: any): string {
  // Generate a unique ID based on message properties
  return `${body.from_email}-${body.timestamp}-${body.subject}`.replace(/\s/g, '-');
}
