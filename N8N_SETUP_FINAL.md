# n8n Final Setup - Connect to Production

Your app is live at: **https://client-comms.vercel.app/**

Now let's connect n8n to your production deployment!

---

## Step 1: Configure n8n Environment Variables (2 minutes)

### In Your n8n Instance

1. Go to your n8n dashboard
2. Click **Settings** (gear icon) or your profile
3. Click **Environment Variables**
4. Add these two variables:

**Variable 1:**
```
Name: APP_URL
Value: https://client-comms.vercel.app
```

**Variable 2:**
```
Name: N8N_API_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0YzJjZjUzYS04MzI5LTRiYWItOTVkYy01ODBlYWU2NGQ4Y2EiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYxODg3OTE1LCJleHAiOjE3Njk2NDQ4MDB9.c3wCV5fPImFzZdweogPJ01kYL--wHzaNp6RiLfOeWy4
```

5. **Save** the variables

---

## Step 2: Import n8n Workflows (3 minutes)

### Workflow Files Location

You have 2 workflow JSON files in your project:
- `/Users/clive/client-intelligence-saas/n8n-workflows/1-gmail-sync.json`
- `/Users/clive/client-intelligence-saas/n8n-workflows/2-daily-analysis.json`

Also available on GitHub:
- https://github.com/DanielJohnsonXYZ/Client-Comms/blob/main/n8n-workflows/1-gmail-sync.json
- https://github.com/DanielJohnsonXYZ/Client-Comms/blob/main/n8n-workflows/2-daily-analysis.json

### Import Workflow 1: Gmail Sync

1. In n8n, click **Workflows** (left sidebar)
2. Click **"+ Add workflow"** or **"Import from File"**
3. Select `1-gmail-sync.json` from your computer
   - Or copy from GitHub and use "Import from URL"
4. The workflow will open

### Configure Gmail Node

1. Click on the **Gmail** node in the workflow
2. Click **"Credential to connect with"**
3. Click **"Create New Credential"**
4. Click **"Connect my account"**
5. Sign in with your Gmail account
6. Grant permissions
7. Click **"Save"**

### Save & Activate

1. Click **"Save"** (top right)
2. Toggle **"Active"** switch (top right)
3. Workflow is now running every 15 minutes!

### Import Workflow 2: Daily Analysis

1. Click **Workflows** again
2. Click **"+ Add workflow"** or **"Import from File"**
3. Select `2-daily-analysis.json`
4. The workflow will open
5. Click **"Save"**
6. Toggle **"Active"** switch
7. Workflow will run daily at 6 AM!

---

## Step 3: Test the Workflows (3 minutes)

### Test Gmail Sync

1. Open the **"Client Intelligence - Gmail Sync"** workflow
2. Click **"Execute Workflow"** button (or **"Test Workflow"**)
3. Wait 5-10 seconds
4. Check the execution log:
   - ✅ Should show "Successfully executed"
   - ✅ Should show messages sent to API
5. Go to **https://client-comms.vercel.app/dashboard**
6. Check if any clients or messages appeared!

### Test Daily Analysis

1. Open the **"Client Intelligence - Daily Analysis"** workflow
2. Click **"Execute Workflow"**
3. Wait 10-20 seconds (this one takes longer - AI analysis!)
4. Check the execution log:
   - ✅ Should show success
   - ✅ Should show number of clients analyzed
5. Go to **https://client-comms.vercel.app/digest**
6. You should see signals generated!

---

## Step 4: Add Your First Client (2 minutes)

### In Your App

1. Go to **https://client-comms.vercel.app/dashboard**
2. Click **"Add Client"**
3. Fill in:
   - **Name**: Your client's name (e.g., "John Smith")
   - **Company**: Their company (e.g., "Acme Corp")
   - **Email**: Their actual email address
4. Click **"Add Client"**

### Trigger Gmail Sync

1. Go back to n8n
2. Open **Gmail Sync** workflow
3. Click **"Execute Workflow"** to sync immediately
4. Go back to your app dashboard
5. You should see messages from that client appear!

---

## Step 5: Verify Everything Works (5 minutes)

### Checklist

Go through these to make sure everything is working:

**App:**
- [ ] Landing page loads: https://client-comms.vercel.app/
- [ ] Dashboard loads: https://client-comms.vercel.app/dashboard
- [ ] Can add a new client
- [ ] Client appears on dashboard
- [ ] Can view client detail page
- [ ] Digest page loads: https://client-comms.vercel.app/digest

**n8n:**
- [ ] Environment variables set (APP_URL, N8N_API_KEY)
- [ ] Gmail Sync workflow imported and active
- [ ] Daily Analysis workflow imported and active
- [ ] Gmail credentials connected
- [ ] Test execution of Gmail Sync succeeds
- [ ] Test execution of Daily Analysis succeeds

**Integration:**
- [ ] Messages appear in dashboard after Gmail sync
- [ ] Signals appear in digest after analysis
- [ ] No errors in Vercel logs
- [ ] No errors in n8n execution logs

---

## Troubleshooting

### Gmail Sync Not Working

**Problem**: Workflow runs but no messages appear

**Check:**
1. Verify client email in dashboard matches Gmail emails
2. Check n8n execution log for errors
3. Go to Vercel logs (vercel.com → your project → Logs)
4. Look for API calls to `/api/messages`
5. Check if Gmail node is returning messages

**Solution:**
- Re-authenticate Gmail in n8n
- Check Gmail filters/labels
- Verify APP_URL is correct

### Daily Analysis Fails

**Problem**: Analysis workflow errors

**Check:**
1. n8n execution log for error details
2. Vercel logs for `/api/analyze-all` endpoint
3. Check Anthropic API key in Vercel env vars
4. Verify clients have messages to analyze

**Solution:**
- Make sure clients exist in database
- Ensure messages exist for those clients
- Check Anthropic API has credits
- Verify N8N_API_KEY matches in n8n and Vercel

### Vercel API Timeout

**Problem**: Requests timeout after 10 seconds

**Note**: Vercel Hobby plan has 10s timeout for serverless functions.

**Solution:**
- Anthropic API is usually fast (<5s)
- If it's consistently slow, consider:
  - Analyzing fewer messages at once
  - Upgrading to Vercel Pro (60s timeout)
  - Optimizing AI prompts

### 401 Unauthorized Error

**Problem**: n8n gets "Unauthorized" from API

**Check:**
1. N8N_API_KEY in n8n environment variables
2. N8N_API_KEY in Vercel environment variables
3. Both should match exactly

**Solution:**
- Copy the key directly from one place to the other
- Ensure no extra spaces or line breaks
- Redeploy Vercel after changing env var

---

## What Happens Now?

### Automatic Operations

**Every 15 minutes:**
- n8n checks Gmail for new messages
- New messages are sent to your API
- Messages are stored in Supabase
- Client last contact dates are updated

**Every day at 6 AM:**
- n8n triggers full analysis
- Claude analyzes all client communications
- Health scores are updated
- Signals (risks/opportunities) are generated
- You can check the digest!

### Manual Operations

**Anytime you want:**
- Add new clients in dashboard
- View client detail pages
- Check daily digest
- Run analysis manually (click "Run Analysis Now" on client page)
- Execute workflows manually in n8n

---

## Next Steps

### Customize Workflows

**Change Gmail sync frequency:**
1. Open Gmail Sync workflow
2. Click the **Schedule Trigger** node
3. Change "15 minutes" to whatever you want (30min, 1hr, etc.)
4. Save

**Change analysis time:**
1. Open Daily Analysis workflow
2. Click the **Cron Trigger** node
3. Change `0 6 * * *` to different time:
   - `0 9 * * *` = 9 AM
   - `0 18 * * *` = 6 PM
   - `0 9 * * 1-5` = 9 AM weekdays only
4. Save

### Add Slack Integration

1. Duplicate the Gmail Sync workflow
2. Replace **Gmail** node with **Slack** node
3. Connect your Slack workspace
4. In HTTP Request node, change `"source": "gmail"` to `"source": "slack"`
5. Activate workflow!

### Add Microsoft Teams

1. Duplicate the Gmail Sync workflow
2. Replace **Gmail** node with **Microsoft Teams** node
3. Connect your Teams account
4. In HTTP Request node, change `"source": "gmail"` to `"source": "teams"`
5. Activate workflow!

---

## Monitoring

### Check n8n Executions

1. Go to **Executions** tab in n8n
2. See all workflow runs
3. Click any to see detailed logs
4. Filter by workflow or status

### Check Vercel Logs

1. Go to vercel.com → Your project
2. Click **Logs** tab
3. Filter by:
   - Function: `/api/messages` or `/api/analyze-all`
   - Status: Errors only
   - Time range

### Check Supabase Database

1. Go to Supabase dashboard
2. Click **Table Editor**
3. Browse:
   - **clients** - Your client list
   - **messages** - All synced messages
   - **signals** - Detected risks/opportunities
4. See data in real-time!

---

## You're Done! 🎉

Your Client Intelligence Platform is:
- ✅ Live on Vercel
- ✅ Connected to Supabase
- ✅ Powered by Claude AI
- ✅ Automated with n8n
- ✅ Syncing Gmail every 15 minutes
- ✅ Analyzing clients daily at 6 AM

**What to do next:**
1. Add your real clients
2. Let it sync overnight
3. Check your digest tomorrow morning
4. Never let a client slip away again!

---

**Need help?** Check the docs:
- [README.md](../README.md) - Full documentation
- [VERCEL_DEPLOYMENT.md](../VERCEL_DEPLOYMENT.md) - Deployment guide
- [n8n-workflows/README.md](./README.md) - Workflow details

**Your live app**: https://client-comms.vercel.app/

Enjoy! 🚀
