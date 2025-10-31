# n8n Workflows for Client Intelligence

This folder contains importable n8n workflows for the Client Intelligence platform.

## Workflows Included

### 1. Gmail Sync (`1-gmail-sync.json`)
- **Trigger**: Every 15 minutes
- **What it does**:
  - Polls Gmail for new messages
  - Filters valid emails
  - Sends them to `/api/messages` endpoint
  - Auto-creates clients if they don't exist

### 2. Daily Analysis (`2-daily-analysis.json`)
- **Trigger**: Daily at 6 AM (cron: `0 6 * * *`)
- **What it does**:
  - Triggers full AI analysis for all clients
  - Updates health scores and statuses
  - Creates new signals (risks/opportunities)

## How to Import

### Step 1: Download Workflows

The JSON files are already in this folder:
- `1-gmail-sync.json`
- `2-daily-analysis.json`

### Step 2: Import to n8n

1. Open your n8n instance
2. Click **"+"** (New Workflow)
3. Click the **three dots menu** (⋮) in the top right
4. Select **"Import from File"**
5. Choose `1-gmail-sync.json`
6. Repeat for `2-daily-analysis.json`

### Step 3: Configure Credentials

#### For Gmail Sync Workflow:

1. Open the **Gmail** node
2. Click **"Create New Credential"**
3. Follow n8n's Gmail OAuth setup:
   - Click "Connect my account"
   - Authorize n8n to access Gmail
   - Save credentials

#### For Daily Analysis Workflow:

No special credentials needed! Just make sure your environment variables are set (see below).

### Step 4: Set Environment Variables in n8n

In your n8n settings, add these environment variables:

```bash
APP_URL=https://your-app.vercel.app
N8N_API_KEY=your-secret-api-key-here
```

**How to set in n8n:**
- **Self-hosted**: Add to your `.env` file or docker-compose
- **n8n Cloud**: Go to Settings > Environment Variables

### Step 5: Configure the API URL

In each workflow, replace the `APP_URL` with your actual deployment URL:

**For local testing:**
```
http://localhost:3000
```

**For production:**
```
https://your-app.vercel.app
```

### Step 6: Activate Workflows

1. Open each workflow
2. Click **"Active"** toggle in the top right
3. Workflows will now run automatically!

## Testing Workflows

### Test Gmail Sync

1. Open the Gmail Sync workflow
2. Click **"Test Workflow"** button
3. It will immediately check Gmail and sync new messages
4. Check your dashboard to see if clients/messages appear

### Test Daily Analysis

1. Open the Daily Analysis workflow
2. Click **"Execute Workflow"** button (manually trigger)
3. Check the execution log to see results
4. Go to `/digest` to see if new signals were created

## Customizing Workflows

### Change Gmail Sync Frequency

In the Gmail Sync workflow:
1. Click the **"Every 15 Minutes"** node
2. Change interval (e.g., 30 minutes, 1 hour)
3. Save

### Change Analysis Time

In the Daily Analysis workflow:
1. Click the **"Every Day at 6 AM"** node
2. Change cron expression:
   - `0 8 * * *` = 8 AM
   - `0 18 * * *` = 6 PM
   - `0 9 * * 1-5` = 9 AM weekdays only
3. Save

### Add Slack Integration

You can create a new workflow:
1. Duplicate Gmail Sync workflow
2. Replace Gmail node with Slack node
3. Update the JSON body to include:
   ```json
   {
     "source": "slack",
     "client_email": "...",
     ...
   }
   ```

## Monitoring

### View Execution History

1. In n8n, go to **Executions** tab
2. See all workflow runs
3. Click any execution to see detailed logs
4. Check for errors or failures

### Email Alerts on Failure

Add an **Email** or **Slack** node after each workflow to get notified on errors:

1. Add **"Filter"** node to check for errors
2. Connect **"Send Email"** or **"Send Slack Message"** node
3. Configure alert message

## Troubleshooting

### Gmail Sync Not Working

**Problem**: No messages syncing

**Solutions**:
- Check Gmail credentials are valid (reconnect if needed)
- Verify API endpoint URL is correct
- Check execution logs for errors
- Test the `/api/messages` endpoint directly

### Daily Analysis Fails

**Problem**: Analysis workflow errors

**Solutions**:
- Verify `N8N_API_KEY` matches in both n8n and your app
- Check Anthropic API key has credits
- Look at error details in execution log
- Test `/api/analyze-all` endpoint with curl/Postman

### Duplicate Messages

**Problem**: Same email imported multiple times

**Solutions**:
- The API checks for duplicates using `message_id`
- Ensure Gmail node returns consistent IDs
- Check database `messages` table for duplicates

## Advanced: Webhook Triggers

For real-time message syncing (instead of polling every 15 min):

### Gmail Webhook

1. Set up Gmail Push Notifications (Google Pub/Sub)
2. In n8n, use **Webhook** trigger instead of Schedule
3. Point Gmail webhook to n8n webhook URL
4. Much faster, no polling needed!

### Slack Webhook

1. In n8n, use **Slack** trigger node
2. Select "On New Message"
3. Real-time Slack message syncing!

## Support

If workflows aren't working:
1. Check execution logs in n8n
2. Test API endpoints directly
3. Verify environment variables
4. Check n8n documentation: https://docs.n8n.io

---

**You're all set!** Your workflows will now automatically sync messages and analyze clients daily. 🎉
