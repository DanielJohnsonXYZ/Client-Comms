# Deploy to Vercel - Complete Guide

This guide shows you how to deploy your Client Intelligence platform to Vercel and connect it with n8n.

## Prerequisites

- GitHub account (you're already set up!)
- Vercel account (free tier works)
- Supabase project (free tier)
- Anthropic API key
- n8n account (your Starter plan)

## Step 1: Push to GitHub (Already Done! ✅)

Your code is at: https://github.com/DanielJohnsonXYZ/Client-Comms

## Step 2: Deploy to Vercel (5 minutes)

### Connect GitHub Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** > **"Project"**
3. Click **"Import Git Repository"**
4. Find **"Client-Comms"** in your repository list
5. Click **"Import"**

### Configure Project

**Framework Preset:** Next.js (auto-detected)
**Root Directory:** `./`
**Build Command:** `npm run build`
**Output Directory:** `.next`

Click **"Deploy"** (it will fail first time - that's OK! We need to add environment variables)

### Add Environment Variables

After the first deploy (even if it fails), go to:
**Project Settings** > **Environment Variables**

Add these variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-...

# n8n Integration
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App URL (IMPORTANT - use your Vercel URL)
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

💡 **Tip**: Add all variables to **Production**, **Preview**, and **Development** environments

### Redeploy

1. Go to **Deployments** tab
2. Click **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Wait 1-2 minutes
5. ✅ Deployment should succeed!

## Step 3: Update n8n Workflows (2 minutes)

Now that your app is deployed, update n8n to use the production URL:

### Update n8n Environment Variables

In your n8n instance, go to **Settings** > **Environment Variables**:

**Change:**
```bash
APP_URL=http://localhost:3000  ❌
```

**To:**
```bash
APP_URL=https://your-project.vercel.app  ✅
```

Keep `N8N_API_KEY` the same.

### Update Workflows (Optional)

Your imported workflows should automatically use the `APP_URL` environment variable. No changes needed!

But if you hardcoded the URL in workflows:
1. Open **Gmail Sync** workflow
2. Click **HTTP Request** node
3. Update URL to: `={{$env.APP_URL}}/api/messages`
4. Save

Repeat for **Daily Analysis** workflow.

## Step 4: Test Production Deployment (3 minutes)

### Test the App

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. You should see the landing page ✅
3. Go to `/dashboard`
4. Add a test client

### Test n8n Integration

1. In n8n, open **Gmail Sync** workflow
2. Click **"Execute Workflow"**
3. Check execution log - should show success ✅
4. Go to your app's `/dashboard`
5. Messages should appear from your Gmail!

### Test Analysis

1. In n8n, open **Daily Analysis** workflow
2. Click **"Execute Workflow"**
3. Should complete successfully ✅
4. Go to `/digest` on your app
5. Signals should be generated!

## Step 5: Set Up Custom Domain (Optional)

### Add Custom Domain in Vercel

1. Go to **Project Settings** > **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `client-intel.yourdomain.com`)
4. Follow DNS setup instructions
5. Wait for DNS to propagate (5-30 minutes)

### Update Environment Variables

Once domain is active:
1. Go to **Project Settings** > **Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` to your custom domain:
   ```bash
   NEXT_PUBLIC_APP_URL=https://client-intel.yourdomain.com
   ```
3. Redeploy

### Update n8n

In n8n Environment Variables:
```bash
APP_URL=https://client-intel.yourdomain.com
```

## Step 6: Automatic Deployments (Already Enabled! ✅)

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update client analysis logic"
git push
```

→ Vercel automatically builds and deploys! 🎉

**Monitor deployments**:
- Vercel dashboard shows build status
- You'll get email notifications
- Check logs for any errors

## Architecture - Production

```
┌─────────────────────────────────────────┐
│         n8n Cloud (Your Starter)        │
│  - Gmail Sync (every 15 min)            │
│  - Daily Analysis (6 AM)                │
└──────────────┬──────────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────────┐
│    Vercel (your-project.vercel.app)     │
│  - Next.js App                          │
│  - API Routes                           │
│  - Edge Functions                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Supabase + Claude AI            │
│  - PostgreSQL Database                  │
│  - AI Analysis                          │
└─────────────────────────────────────────┘
```

## Monitoring & Logs

### Vercel Logs

View real-time logs:
1. Go to your project in Vercel
2. Click **"Logs"** tab
3. Filter by:
   - Runtime logs (API errors)
   - Build logs (deployment issues)
   - Static logs (page loads)

### n8n Execution Logs

1. In n8n, go to **Executions** tab
2. See all workflow runs
3. Click any execution for detailed logs
4. Check for failed executions

### Supabase Logs

1. In Supabase dashboard
2. Go to **Logs** section
3. View database queries
4. Check API usage

## Troubleshooting

### Deployment Fails

**Error**: Build fails with environment variable errors

**Solution**:
- Verify all env vars are set in Vercel
- Check for typos in variable names
- Ensure values don't have extra spaces
- Redeploy after adding variables

### n8n Can't Reach App

**Error**: n8n workflows timeout or fail

**Solution**:
1. Verify `APP_URL` in n8n matches your Vercel URL
2. Check Vercel deployment is successful
3. Test API endpoint directly:
   ```bash
   curl https://your-project.vercel.app/api/messages \
     -H "Content-Type: application/json" \
     -d '{"client_email":"test@example.com","from_email":"test@example.com","to_email":"you@example.com","subject":"Test","body":"Test"}'
   ```
4. Check Vercel logs for errors

### Database Errors

**Error**: Can't connect to Supabase

**Solution**:
- Verify Supabase keys are correct in Vercel
- Check Supabase project is active (not paused)
- Verify database schema was applied
- Test connection from local first

### API Timeout

**Error**: Functions timeout after 10 seconds

**Solution**:
- Vercel free tier has 10s timeout (Hobby plan: 60s)
- Optimize AI analysis to be faster
- Consider upgrading Vercel plan if needed
- Cache frequently accessed data

## Performance Optimization

### Enable Edge Functions

In `next.config.ts`, add:
```typescript
export const runtime = 'edge';
```

For specific API routes that can run on the edge.

### Database Indexing

Already optimized in schema! See `supabase/schema.sql`:
- Indexed on `client_id`
- Indexed on `timestamp`
- Indexed on `addressed` status

### Caching

Vercel automatically caches:
- Static pages (landing page)
- Static assets (CSS, JS)
- API responses with `Cache-Control` headers

## Security Best Practices

### Environment Variables

✅ **Do**:
- Store all secrets in Vercel environment variables
- Use different keys for dev/staging/production
- Rotate API keys periodically

❌ **Don't**:
- Commit `.env.local` to git (already in `.gitignore`)
- Share API keys in public
- Use same keys across multiple projects

### API Security

The `/api/analyze-all` endpoint requires `x-api-key` header:
```typescript
const apiKey = request.headers.get('x-api-key');
if (process.env.N8N_API_KEY && apiKey !== process.env.N8N_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

This prevents unauthorized access!

## Cost Estimate - Production

| Service | Tier | Cost |
|---------|------|------|
| **Vercel** | Hobby | $0/month |
| **Supabase** | Free | $0/month |
| **n8n** | Starter | Included! |
| **Anthropic** | Pay-as-you-go | $1-5/month |
| **Domain** (optional) | | ~$12/year |

**Total: ~$1-5/month** (+ optional domain)

### When to Upgrade

**Vercel Pro ($20/month)** if you need:
- 60s function timeout (vs 10s)
- More bandwidth
- Team collaboration
- Advanced analytics

**Supabase Pro ($25/month)** if you need:
- More database storage (8GB+)
- More bandwidth
- Daily backups
- Advanced features

**n8n** - You're already on Starter plan! ✅

## Scaling Up

### Adding Team Members

1. In Vercel: Invite to project
2. They can view deployments, logs
3. Give GitHub repo access for code changes

### Multiple Environments

Create separate Vercel projects:
- `client-comms-dev` (development)
- `client-comms-staging` (testing)
- `client-comms-prod` (production)

Each with its own environment variables.

### Geographic Distribution

Vercel automatically serves from global CDN:
- Fastest edge location serves users
- No extra configuration needed
- Works out of the box!

## Maintenance

### Updating Dependencies

```bash
npm outdated  # Check for updates
npm update    # Update packages
npm run build # Test build
git push      # Auto-deploys to Vercel
```

### Monitoring Uptime

Use free services:
- [UptimeRobot](https://uptimerobot.com) - Free monitoring
- [BetterStack](https://betterstack.com) - Advanced monitoring
- Vercel Analytics (built-in)

### Database Backups

Supabase automatically backs up daily:
- Go to Supabase dashboard
- Database > Backups
- Restore any backup if needed

## Support

**Deployment Issues:**
- Check Vercel logs first
- Review n8n execution logs
- Test API endpoints directly

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- n8n Docs: https://docs.n8n.io
- This repo's issues: https://github.com/DanielJohnsonXYZ/Client-Comms/issues

---

## Quick Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and connected
- [ ] All environment variables added to Vercel
- [ ] First deployment successful
- [ ] n8n `APP_URL` updated to production URL
- [ ] Gmail Sync workflow tested
- [ ] Daily Analysis workflow tested
- [ ] Can access app at Vercel URL
- [ ] Dashboard loads and works
- [ ] Messages syncing from Gmail
- [ ] Analysis generating signals

---

**Congratulations!** 🎉

Your Client Intelligence platform is now live on Vercel and integrated with n8n!

Visit: `https://your-project.vercel.app`
