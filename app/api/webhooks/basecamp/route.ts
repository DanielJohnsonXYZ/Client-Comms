import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST webhook from Basecamp
export async function POST(request: NextRequest) {
  try {
    const webhook = await request.json();

    console.log('Basecamp webhook received:', webhook);

    // Basecamp webhook structure:
    // {
    //   "kind": "message_created",
    //   "recording": { ... message data ... },
    //   "creator": { ... user info ... }
    // }

    // Only process message_created events
    if (webhook.kind !== 'message_created' && webhook.kind !== 'comment_created') {
      return NextResponse.json({ message: 'Event type not supported' }, { status: 200 });
    }

    const recording = webhook.recording;
    const creator = webhook.creator;

    // Extract message data
    const messageData = {
      client_email: 'spark@sparkshipping.com', // You can map this based on project
      from_email: creator.email_address || 'basecamp@sparkshipping.com',
      to_email: 'team@wescalestartups.com',
      subject: recording.title || 'Basecamp Message',
      body: recording.content || recording.body || '',
      body_snippet: (recording.content || recording.body || '').substring(0, 200),
      timestamp: recording.created_at,
      thread_id: `basecamp-${recording.bucket?.id || recording.id}`,
      message_id: `basecamp-${recording.id}`,
      source: 'basecamp',
      metadata: {
        basecamp_id: recording.id,
        project_id: recording.bucket?.id,
        project_name: recording.bucket?.name,
        url: recording.app_url,
        kind: webhook.kind,
      },
    };

    // Find or create client
    const { data: existingClient } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('email', messageData.client_email)
      .single();

    let clientId = existingClient?.id;

    if (!clientId) {
      // Create new client
      const { data: newClient, error: clientError } = await supabaseAdmin
        .from('clients')
        .insert({
          email: messageData.client_email,
          name: 'Spark Shipping',
          company: 'Spark Shipping',
        })
        .select()
        .single();

      if (clientError) throw clientError;
      clientId = newClient.id;
    }

    // Check if message already exists
    const { data: existingMessage } = await supabaseAdmin
      .from('messages')
      .select('id')
      .eq('message_id', messageData.message_id)
      .single();

    if (existingMessage) {
      return NextResponse.json({ message: 'Message already exists' }, { status: 200 });
    }

    // Insert message
    const { error: messageError } = await supabaseAdmin.from('messages').insert({
      client_id: clientId,
      from_email: messageData.from_email,
      to_email: messageData.to_email,
      subject: messageData.subject,
      body: messageData.body,
      body_snippet: messageData.body_snippet,
      timestamp: messageData.timestamp,
      thread_id: messageData.thread_id,
      message_id: messageData.message_id,
      source: messageData.source,
      is_from_client: true,
      metadata: messageData.metadata,
    });

    if (messageError) throw messageError;

    return NextResponse.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Error processing Basecamp webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'Basecamp webhook endpoint is ready',
    url: 'POST to this endpoint with Basecamp webhook data'
  });
}
