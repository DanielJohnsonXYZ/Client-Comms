# Client Intelligence Platform - Setup Guide (n8n Version)

Complete setup instructions to get your Client Intelligence platform running in **15 minutes** using n8n.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- A Supabase account (free tier works)
- An Anthropic API key
- An n8n account (Starter plan or self-hosted)

## Architecture Overview

```
n8n (Gmail/Slack/Teams) → API Routes → Supabase → Claude AI → Dashboard
```

**Why n8n?**
- ✅ No complex OAuth setup
- ✅ Visual workflow editor
- ✅ Built-in integrations (Gmail, Slack, Teams)
- ✅ You already have it!
- ✅ Easy to add more channels later

## Step 1: Install Dependencies (1 min)

```bash
cd client-intelligence-saas
npm install
```

## Step 2: Set Up Supabase (5 min)

### Create Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - Name: `client-intelligence`
   - Database Password: (generate a strong password and save it)
   - Region: Choose closest to you
4. Wait 2-3 minutes for project to initialize

### Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" (bottom right)
6. You should see "Success. No rows returned"

### Get API Keys

1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Scroll down to **Service Role**
4. Copy **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Set Up Anthropic (2 min)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create account
3. Go to **API Keys**
4. Click "Create Key"
5. Name it "Client Intelligence"
6. Copy the API key
7. Add credits: Go to **Billing** and add $10 (should last months)

## Step 4: Configure Environment Variables (1 min)

1. In the project root, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Open `.env.local` and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# n8n Integration (optional - for securing API endpoints)
N8N_API_KEY=your_random_secret_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate N8N_API_KEY:**
```bash
openssl rand -hex 32
```

## Step 5: Start the Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the landing page! 🎉

## Step 6: Add Your First Client (1 min)

1. Go to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
2. Click "Add Client" button
3. Fill in:
   - Name: e.g., "John Doe"
   - Company: e.g., "Acme Corp"
   - Email: The actual email address of your client
4. Click "Add Client"

## Step 7: Set Up n8n Workflows (5 min)

### Import Workflows

1. Open your n8n instance
2. Go to **Workflows** tab
3. Click **"Import from File"**
4. Import both workflow files from `n8n-workflows/` folder:
   - `1-gmail-sync.json` (syncs Gmail every 15 min)
   - `2-daily-analysis.json` (runs AI analysis daily at 6 AM)

### Configure Environment Variables in n8n

Add these environment variables to your n8n instance:

```bash
APP_URL=http://localhost:3000
N8N_API_KEY=your_random_secret_key_here
```

**How to set:**
- **n8n Cloud**: Settings > Environment Variables
- **Self-hosted**: Add to `.env` file or docker-compose

### Connect Gmail to n8n

1. Open the **Gmail Sync** workflow
2. Click on the **Gmail** node
3. Click **"Create New Credential"**
4. Click **"Connect my account"**
5. Authorize n8n to access your Gmail
6. Save credentials

### Activate Workflows

1. Open **Gmail Sync** workflow
2. Toggle **"Active"** (top right)
3. Open **Daily Analysis** workflow
4. Toggle **"Active"** (top right)

✅ Workflows are now running automatically!

## Step 8: Test It Works (2 min)

### Test Gmail Sync

1. In n8n, open the **Gmail Sync** workflow
2. Click **"Execute Workflow"** to run it manually
3. Check your dashboard - you should see messages appearing!

### Test Daily Analysis

1. In n8n, open the **Daily Analysis** workflow
2. Click **"Execute Workflow"** to run it manually
3. Check the execution log for results
4. Go to `/digest` to see newly generated signals

## Verification Checklist

- [ ] Dashboard loads at `/dashboard`
- [ ] Can add a new client
- [ ] n8n Gmail Sync workflow is active
- [ ] n8n Daily Analysis workflow is active
- [ ] Messages appear in client detail pages
- [ ] Can view digest page at `/digest`
- [ ] Landing page loads at `/`

## What Happens Next?

### Automatic Message Sync

- Gmail messages sync every 15 minutes (via n8n)
- Messages from your client emails are automatically imported
- You can adjust the frequency in n8n's Gmail Sync workflow

### Daily Analysis

- Every morning at 6 AM, all clients are analyzed
- AI detects sentiment, risks, and opportunities
- Health scores and statuses are updated
- Check `/digest` each morning for your intelligence report

### Manual Analysis

Trigger analysis anytime:
1. Go to a client's detail page
2. Click "Run Analysis Now"
3. Wait a few seconds
4. Page refreshes with new insights

## Adding More Channels

### Slack Integration

1. In n8n, duplicate the Gmail Sync workflow
2. Replace **Gmail** node with **Slack** node
3. Connect your Slack workspace
4. In the HTTP Request node, change:
   ```json
   "source": "slack"
   ```
5. Activate workflow!

### Microsoft Teams Integration

1. In n8n, duplicate the Gmail Sync workflow
2. Replace **Gmail** node with **Microsoft Teams** node
3. Connect your Teams account
4. In the HTTP Request node, change:
   ```json
   "source": "teams"
   ```
5. Activate workflow!

## Troubleshooting

### No messages syncing

**Problem**: Gmail Sync runs but no messages appear

**Solutions**:
1. Check n8n execution logs for errors
2. Verify client email in dashboard matches Gmail emails
3. Test `/api/messages` endpoint with curl:
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "client_email": "client@example.com",
    "from_email": "client@example.com",
    "to_email": "you@example.com",
    "subject": "Test",
    "body": "Test message"
  }'
```

### Analysis fails

**Problem**: Daily Analysis workflow errors

**Solutions**:
1. Check Anthropic API key has credits
2. Verify `N8N_API_KEY` matches in both n8n and `.env.local`
3. Check execution log in n8n for detailed error
4. Ensure clients have messages to analyze

### n8n can't reach localhost

**Problem**: Workflows fail with connection errors

**Solutions**:
1. **For n8n Cloud**: Deploy your app to Vercel first, then update `APP_URL`
2. **For self-hosted n8n**: Use `host.docker.internal` instead of `localhost`
3. **Alternative**: Use ngrok to expose local server

### Duplicate messages

**Problem**: Same email imported multiple times

**Solutions**:
- API automatically checks for duplicates using `message_id`
- Check n8n Gmail node returns unique IDs
- Verify `metadata.external_id` in database

## Deploy to Production

### 1. Deploy Next.js App to Vercel

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard (same as `.env.local`).

### 2. Update n8n Environment Variables

In n8n, change `APP_URL`:
```bash
APP_URL=https://your-app.vercel.app
```

### 3. Workflows Continue Running

That's it! n8n will now call your production API automatically.

## Cost Summary

For 2-3 clients with moderate email volume:

- **Supabase**: $0/month (free tier)
- **Vercel**: $0/month (free tier)
- **n8n**: $0/month (included in your Starter plan)
- **Anthropic**: $1-3/month (pay-as-you-go)

**Total: ~$1-3/month**

## Next Steps

1. **Add more clients** - Go to `/clients/new`
2. **Customize workflows** - Adjust sync frequency in n8n
3. **Add Slack** - Import Slack messages using n8n Slack node
4. **View daily digest** - Check `/digest` each morning
5. **Deploy to production** - Follow Vercel deployment steps above

---

Congratulations! Your Client Intelligence platform with n8n is ready! 🎉

**Need help?** See `n8n-workflows/README.md` for detailed workflow documentation.
