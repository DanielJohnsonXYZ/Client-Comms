# Client Intelligence Platform

AI-powered relationship intelligence that monitors your client communications and spots risks, opportunities, and moments that matter before they slip through the cracks.

## Features

- **Gmail Integration**: Automatically syncs and analyzes email conversations with clients
- **AI Analysis**: Claude-powered sentiment analysis, risk detection, and opportunity spotting
- **Client Health Scoring**: Real-time health metrics based on communication patterns
- **Daily Digest**: Web-based morning report with top alerts and opportunities
- **Multi-Channel Support**: Ready to integrate Slack, Teams, and more
- **Privacy-First**: Your data stays in your own Supabase database

## Tech Stack

- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude 3.5 Sonnet
- **Email Integration**: Google Gmail API
- **Background Jobs**: Inngest
- **Hosting**: Vercel + Supabase Cloud + Inngest Cloud

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Anthropic API key
- Google Cloud project for Gmail API
- Inngest account (free tier)

### 1. Clone and Install

\`\`\`bash
cd client-intelligence-saas
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from \`supabase/schema.sql\`
3. Get your API keys from Settings > API

### 3. Set Up Google Cloud (Gmail API)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URI: \`http://localhost:3000/api/auth/google/callback\`
5. Copy Client ID and Client Secret

### 4. Set Up Anthropic

1. Get API key from [console.anthropic.com](https://console.anthropic.com)
2. Add credits to your account ($5-10 recommended)

### 5. Set Up Inngest

1. Create account at [inngest.com](https://inngest.com)
2. Create a new app
3. Get Event Key and Signing Key from dashboard

### 6. Environment Variables

Copy \`.env.example\` to \`.env.local\` and fill in:

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_key

# Google OAuth (for Gmail integration)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Inngest
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 7. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000)

### 8. Connect Gmail

1. Go to dashboard
2. Click "Connect Gmail" (or visit \`/api/auth/google\`)
3. Authorize the app
4. Your emails will start syncing automatically

### 9. Run Inngest Dev Server (Optional)

In a separate terminal:

\`\`\`bash
npx inngest-cli@latest dev
\`\`\`

This runs a local Inngest dashboard at [http://localhost:8288](http://localhost:8288)

## Usage

### Adding Clients

1. Go to **Dashboard**
2. Click **Add Client**
3. Enter client name, company, and email
4. System will automatically track communications with this email

### Viewing Client Health

The dashboard shows all clients with:
- Health score (0-100)
- Status (At Risk / Opportunity / Healthy)
- Recent signals and alerts
- Communication stats

### Daily Digest

1. Visit \`/digest\` to see today's intelligence report
2. Review alerts, opportunities, and check-ins
3. Mark items as addressed when handled
4. Digest refreshes daily at 6 AM

### Analyzing a Specific Client

1. Go to client detail page
2. Click "Run Analysis Now"
3. AI will analyze recent communications and detect signals
4. Health score and status will update automatically

## How It Works

### Message Ingestion

1. Gmail API syncs messages every 15 minutes via Inngest cron
2. Messages are parsed and stored in database
3. System identifies if message is from client or from you

### AI Analysis

1. Daily at 6 AM, Inngest triggers analysis for all clients
2. Claude analyzes last 30 messages per client
3. AI detects:
   - Sentiment score (-1 to +1)
   - Risk signals (frustration, delays, silence)
   - Opportunity signals (expansion, upsells)
   - Check-in suggestions
4. Results are stored as signals

### Health Scoring

Health score (0-100) is calculated based on:
- **Recency**: Days since last contact
- **Frequency**: Messages per month
- **Sentiment**: Average sentiment of communications
- **Response Time**: How fast you respond
- **Risk Signals**: Unaddressed risks lower score
- **Opportunities**: Boost score slightly

### Client Status

- **At Risk** (<40 health or high-severity risk signals)
- **Opportunity** (60+ health with opportunity signals)
- **Healthy** (70+ health, no major issues)
- **Unknown** (Insufficient data)

## API Routes

### Clients

- \`GET /api/clients\` - List all clients
- \`POST /api/clients\` - Create client
- \`GET /api/clients/[id]\` - Get client details with messages and signals
- \`PATCH /api/clients/[id]\` - Update client
- \`DELETE /api/clients/[id]\` - Delete client
- \`POST /api/clients/[id]/analyze\` - Trigger analysis for specific client

### Authentication

- \`GET /api/auth/google\` - Initiate Gmail OAuth
- \`GET /api/auth/google/callback\` - OAuth callback handler

### Webhooks

- \`POST /api/webhooks/gmail\` - Gmail Pub/Sub webhook (for real-time updates)

### Signals

- \`PATCH /api/signals/[id]\` - Mark signal as addressed

## Deployment

### Deploy to Vercel

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

Add all environment variables in Vercel dashboard under Settings > Environment Variables.

**Important**: Update \`GOOGLE_REDIRECT_URI\` and \`NEXT_PUBLIC_APP_URL\` to your production URL.

### Connect Inngest

1. In Inngest dashboard, set app URL to your Vercel URL
2. Set sync source: \`https://your-app.vercel.app/api/inngest\`
3. Inngest will automatically trigger your cron jobs

### Gmail Webhook (Optional)

For real-time email notifications:

1. Set up Google Cloud Pub/Sub
2. Create topic and subscription
3. Point webhook to: \`https://your-app.vercel.app/api/webhooks/gmail\`
4. Call \`setupGmailWebhook()\` from your app

## Architecture

\`\`\`
┌─────────────────────────────────────────┐
│           Gmail / Slack / Teams         │
│          (Communication Sources)        │
└──────────────┬──────────────────────────┘
               │ OAuth + Webhooks
               ▼
┌─────────────────────────────────────────┐
│        Next.js API Routes               │
│  - /api/auth/google                     │
│  - /api/webhooks/gmail                  │
│  - /api/clients                         │
│  - /api/clients/[id]/analyze            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Supabase Database               │
│  - clients                              │
│  - messages                             │
│  - signals                              │
│  - digests                              │
│  - oauth_tokens                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         AI Analysis Engine              │
│  (Anthropic Claude 3.5 Sonnet)          │
│  - Sentiment analysis                   │
│  - Risk detection                       │
│  - Opportunity spotting                 │
│  - Health scoring                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       Background Jobs (Inngest)         │
│  - Sync messages (every 15min)          │
│  - Daily analysis (6 AM)                │
│  - Generate digests                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        Dashboard & Digest UI            │
│  - Client health cards                  │
│  - Daily digest view                    │
│  - Signal management                    │
└─────────────────────────────────────────┘
\`\`\`

## Extending

### Adding Slack Integration

1. Create Slack app and get OAuth tokens
2. Add Slack API client to \`lib/slack.ts\`
3. Create webhook handler at \`/api/webhooks/slack\`
4. Store messages with \`source: 'slack'\`

### Adding Microsoft Teams

1. Register app in Azure AD
2. Add Teams API client to \`lib/teams.ts\`
3. Create webhook handler at \`/api/webhooks/teams\`
4. Store messages with \`source: 'teams'\`

### Custom Signal Types

1. Update \`SignalType\` in \`lib/types/index.ts\`
2. Update AI prompt in \`lib/ai-analysis.ts\`
3. Update database constraint in Supabase

## Cost Estimate

For 2-3 clients with moderate email volume:

| Service | Usage | Cost |
|---------|-------|------|
| Supabase | 500 MB DB, 2 GB bandwidth | $0 (Free tier) |
| Vercel | 100 GB bandwidth | $0 (Free tier) |
| Inngest | 1000 function runs/month | $0 (Free tier) |
| Claude API | ~50 analyses/month | $1-3 |
| **Total** | | **$1-3/month** |

## Troubleshooting

**Gmail not syncing:**
- Check OAuth tokens in database
- Verify Gmail API is enabled in Google Cloud
- Check Inngest dashboard for errors

**Analysis not running:**
- Verify Anthropic API key is valid
- Check Inngest cron jobs are active
- Look for errors in Vercel logs

**Client health seems wrong:**
- Run manual analysis via \`/api/clients/[id]/analyze\`
- Check if messages are being stored correctly
- Verify sentiment scores are being calculated

## Security

- All OAuth tokens encrypted at rest in Supabase
- API keys never exposed to client
- CORS enabled only for your domain
- Rate limiting recommended for production

## Support

For issues or questions:
1. Check this README
2. Review code comments
3. Check Inngest/Vercel logs
4. Open an issue

## License

MIT

---

Built with [Next.js](https://nextjs.org), [Supabase](https://supabase.com), [Claude](https://anthropic.com), and [Inngest](https://inngest.com).
