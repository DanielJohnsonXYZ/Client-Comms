import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisResult, Message, Client, SignalType } from './types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface AnalysisInput {
  messages: Message[];
  client: Client;
}

export async function analyzeClientCommunications(
  input: AnalysisInput
): Promise<AnalysisResult> {
  const { messages, client } = input;

  // Sort messages by timestamp (oldest first)
  const sortedMessages = messages.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Build conversation context
  const conversationContext = sortedMessages
    .map((msg) => {
      const direction = msg.is_from_client ? 'CLIENT' : 'YOU';
      return `[${new Date(msg.timestamp).toLocaleDateString()}] ${direction}: ${msg.subject}
${msg.body_snippet || msg.body.substring(0, 300)}...`;
    })
    .join('\n\n');

  const prompt = `You are an AI relationship intelligence system analyzing client communications.

CLIENT INFORMATION:
- Name: ${client.name}
- Company: ${client.company}
- Current Status: ${client.status}
- Total Messages: ${client.total_messages}
- Average Response Time: ${client.response_time_avg ? `${client.response_time_avg} hours` : 'Unknown'}

RECENT CONVERSATION HISTORY (last ${sortedMessages.length} messages):
${conversationContext}

ANALYSIS TASKS:

1. **Sentiment Score**: Rate the overall sentiment of the client in recent communications from -1 (very negative) to +1 (very positive). Consider tone, word choice, enthusiasm, and responsiveness.

2. **Detect Signals**: Identify any of these signal types:
   - RISK: Warning signs (frustration, delays mentioned, going silent, negative tone, concerns about timeline/budget/quality)
   - OPPORTUNITY: Expansion hints (new projects mentioned, scaling up, positive results, referrals, upsell potential)
   - CHECK_IN: Long silence or need for proactive outreach
   - POSITIVE: Strong positive feedback, praise, gratitude
   - NEGATIVE: Direct complaints or issues raised

3. **Client Status**: Classify as:
   - at_risk: Shows concerning patterns (needs immediate attention)
   - opportunity: Shows potential for expansion/upsell
   - healthy: Positive, stable relationship
   - unknown: Not enough data

4. **Health Score**: Rate relationship health from 0-100 considering:
   - Communication frequency and recency
   - Sentiment and tone
   - Response times
   - Issues vs positive signals

Respond ONLY with valid JSON in this exact format:
{
  "sentiment_score": -0.2,
  "client_status": "at_risk",
  "health_score": 65,
  "reasoning": "Brief explanation of your assessment",
  "signals": [
    {
      "signal_type": "risk",
      "severity": 7,
      "title": "Short title",
      "description": "What you detected and why it matters",
      "context": "Quote or reference from messages"
    }
  ]
}

IMPORTANT:
- Only include signals that have clear evidence in the messages
- Be specific about what you detected and where
- Severity should match the urgency (1=low, 10=critical)
- If no signals detected, return empty signals array
- Be conservative with risk signals - only flag real concerns
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response
    const analysis = JSON.parse(content.text);

    // Validate and structure the response
    const result: AnalysisResult = {
      sentiment_score: analysis.sentiment_score,
      client_status: analysis.client_status,
      health_score: analysis.health_score,
      reasoning: analysis.reasoning,
      signals: analysis.signals.map((signal: any) => ({
        client_id: client.id,
        message_id: null, // Can be refined to link to specific message
        signal_type: signal.signal_type as SignalType,
        severity: signal.severity,
        title: signal.title,
        description: signal.description,
        context: signal.context || null,
        addressed: false,
      })),
    };

    return result;
  } catch (error) {
    console.error('AI Analysis Error:', error);

    // Return safe defaults if AI fails
    return {
      sentiment_score: 0,
      client_status: 'unknown',
      health_score: 50,
      reasoning: 'Analysis failed - manual review needed',
      signals: [],
    };
  }
}

// Analyze a single message for quick sentiment scoring
export async function analyzeMessage(message: Message): Promise<number> {
  const prompt = `Analyze the sentiment of this message and respond with ONLY a number between -1 and 1:

Subject: ${message.subject}
Body: ${message.body_snippet || message.body}

Sentiment score (-1 = very negative, 0 = neutral, 1 = very positive):`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return 0;
    }

    const score = parseFloat(content.text.trim());
    return isNaN(score) ? 0 : Math.max(-1, Math.min(1, score));
  } catch (error) {
    console.error('Message sentiment analysis error:', error);
    return 0;
  }
}
