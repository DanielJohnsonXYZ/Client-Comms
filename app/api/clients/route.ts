import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET all clients
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('health_score', { ascending: true }); // Show at-risk first

    if (error) throw error;

    return NextResponse.json({ clients: data });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST create new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({
        name: body.name,
        company: body.company,
        email: body.email,
        status: 'unknown',
        health_score: 50,
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ client: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
