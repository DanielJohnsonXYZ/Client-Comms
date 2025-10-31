# Quick Start Checklist

Your n8n API key is already configured! ✅

## What You Still Need (10 minutes total)

### 1. Supabase Setup (5 min)

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In SQL Editor, run the schema from `supabase/schema.sql`
3. Get your API keys from Settings > API
4. Update `.env.local` with:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

### 2. Anthropic API Key (2 min)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add $5-10 credits
4. Update `.env.local` with:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-...
   ```

### 3. Set Environment Variables in n8n (2 min)

In your n8n instance, add these environment variables:

**Settings > Environment Variables:**
```bash
APP_URL=http://localhost:3000
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0YzJjZjUzYS04MzI5LTRiYWItOTVkYy01ODBlYWU2NGQ4Y2EiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYxODg3OTE1LCJleHAiOjE3Njk2NDQ4MDB9.c3wCV5fPImFzZdweogPJ01kYL--wHzaNp6RiLfOeWy4
```

💡 **Tip**: Copy the exact same key from your `.env.local` file

### 4. Import n8n Workflows (3 min)

1. Open your n8n instance
2. Click **"Import from File"**
3. Import these files:
   - `n8n-workflows/1-gmail-sync.json`
   - `n8n-workflows/2-daily-analysis.json`
4. In Gmail Sync workflow:
   - Click Gmail node
   - Connect your Gmail account
   - Save
5. Activate both workflows (toggle in top right)

### 5. Start the App (1 min)

```bash
cd /Users/clive/client-intelligence-saas
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Add Your First Client (1 min)

1. Go to `/dashboard`
2. Click "Add Client"
3. Enter:
   - Name: Your client's name
   - Company: Their company
   - Email: Their actual email address
4. Save

### 7. Test It Works (2 min)

**Test Gmail Sync:**
1. In n8n, open "Gmail Sync" workflow
2. Click "Execute Workflow"
3. Check your dashboard - messages should appear!

**Test Analysis:**
1. In n8n, open "Daily Analysis" workflow
2. Click "Execute Workflow"
3. Go to `/digest` - signals should be generated!

---

## Current Status

✅ **Configured**:
- n8n API key (in `.env.local`)
- Project structure
- Dependencies installed
- Build tested

⏳ **Still needed**:
- [ ] Supabase credentials
- [ ] Anthropic API key
- [ ] n8n environment variables
- [ ] n8n workflows imported
- [ ] Gmail connected in n8n

---

## Next Steps After Setup

1. **Check daily digest** - Visit `/digest` each morning
2. **Add more clients** - Go to `/clients/new`
3. **Customize workflows** - Adjust sync frequency in n8n
4. **Add Slack** - Duplicate Gmail workflow, replace with Slack node
5. **Deploy to production** - Follow deployment guide in `README.md`

---

## Troubleshooting

**Can't connect to Supabase?**
- Verify URL and keys in `.env.local`
- Make sure schema was applied in Supabase SQL Editor

**Analysis not working?**
- Check Anthropic API key has credits
- Verify key starts with `sk-ant-`

**n8n can't reach localhost?**
- For n8n Cloud: Deploy to Vercel first, update `APP_URL`
- For self-hosted: Use `host.docker.internal:3000` instead

**Need help?**
- See `SETUP.md` for detailed guide
- See `n8n-workflows/README.md` for workflow help
- Check n8n execution logs for errors

---

Ready to continue? Just fill in your Supabase and Anthropic keys in `.env.local` and you're good to go! 🚀
