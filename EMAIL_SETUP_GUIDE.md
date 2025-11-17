# Email Notification Setup Guide

## Overview

This guide walks you through setting up email notifications for Silvia's List using Resend. The system sends two types of emails:

1. **User Confirmation Email** - Sent to candidates after they submit their CV
2. **Admin Notification Email** - Sent to you when a new profile is submitted

## Prerequisites

- A domain name (e.g., `silviaslist.com`)
- Access to your domain's DNS settings
- 15-20 minutes for setup

---

## Part 1: Create Resend Account

### Step 1: Sign Up

1. Go to **https://resend.com**
2. Click **Sign Up**
3. Create account with your email
4. Verify your email address

### Step 2: Choose Plan

- **Free Tier**: 100 emails per day, 3,000 per month
- **Perfect for starting out**
- Can upgrade later if needed

---

## Part 2: Add and Verify Your Domain

### Step 3: Add Domain to Resend

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `silviaslist.com`
4. Click **Add**

### Step 4: Configure DNS Records

Resend will show you **3 DNS records** to add. You need to add these to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.).

**Example DNS Records:**

```
Type: TXT
Name: @ (or root/blank)
Value: v=spf1 include:_spf.resend.com ~all

Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKB... (long string)

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; pct=100; rua=mailto:dmarc@silviaslist.com
```

**How to Add DNS Records:**

**If using Cloudflare:**
1. Login to Cloudflare
2. Select your domain
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Select **TXT** type
6. Copy **Name** from Resend
7. Copy **Value** from Resend
8. Click **Save**
9. Repeat for all 3 records

**If using GoDaddy/Namecheap:**
1. Login to your domain registrar
2. Find **DNS Settings** or **Manage DNS**
3. Add **TXT records** as shown above
4. Save changes

### Step 5: Wait for Verification

- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually takes **5-15 minutes**
- Resend will automatically verify once DNS is updated
- You'll see a **green checkmark** when verified

---

## Part 3: Get Your API Key

### Step 6: Create API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it: `Silvia's List Production`
4. Select permissions: **Sending access**
5. Click **Create**
6. **IMPORTANT**: Copy the key immediately (it won't be shown again)
   - Format: `re_123abc456def...`

---

## Part 4: Configure Your Application

### Step 7: Add Environment Variables

Create or update your `.env.local` file:

```bash
# Email Service (Resend)
RESEND_API_KEY=re_paste_your_actual_key_here
FROM_EMAIL=noreply@silviaslist.com
ADMIN_EMAIL=your-email@gmail.com  # Where YOU want to receive notifications
```

**Important Notes:**
- `FROM_EMAIL` must use your verified domain
- `ADMIN_EMAIL` can be any email address (Gmail, Outlook, etc.)
- Never commit `.env.local` to git (it's already in `.gitignore`)

### Step 8: Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Part 5: Testing

### Step 9: Test Email Sending

1. Open your application: `http://localhost:3000`
2. Fill out the talent pool form with:
   - **Your email** as the candidate email
   - A test CV
   - All required fields
3. Submit the form
4. Check your inbox (both emails):
   - **Candidate email** → Should receive confirmation
   - **Admin email** → Should receive notification

### Step 10: Verify in Resend Dashboard

1. Go to **Logs** in Resend dashboard
2. You should see 2 emails sent
3. Click each to see delivery status
4. Check for any errors

---

## Part 6: Production Deployment (Netlify)

### Step 11: Add Environment Variables to Netlify

1. Login to **Netlify**
2. Go to your site
3. Navigate to **Site configuration** → **Environment variables**
4. Click **Add a variable**
5. Add these three variables:

```
Key: RESEND_API_KEY
Value: re_paste_your_actual_key_here

Key: FROM_EMAIL
Value: noreply@silviaslist.com

Key: ADMIN_EMAIL
Value: your-email@gmail.com
```

6. Click **Save**
7. Trigger a new deployment (or push to git)

### Step 12: Test in Production

1. Visit your live site
2. Submit a test profile
3. Verify both emails arrive
4. Check Resend logs for delivery confirmation

---

## Troubleshooting

### Problem: "RESEND_API_KEY environment variable is not set"

**Solution:**
- Check `.env.local` exists in project root
- Verify variable name is exactly `RESEND_API_KEY`
- Restart dev server after adding variables

### Problem: Emails not sending

**Possible causes:**
1. **Domain not verified**
   - Check Resend dashboard for verification status
   - DNS records can take up to 48 hours (usually 5-15 minutes)

2. **Wrong FROM_EMAIL**
   - Must use your verified domain
   - ✅ Good: `noreply@silviaslist.com`
   - ❌ Bad: `noreply@gmail.com`

3. **Invalid API key**
   - Copy/paste errors
   - Regenerate key in Resend dashboard

### Problem: Emails go to spam

**Solutions:**
1. **Warm up your domain**
   - Send a few test emails first
   - Gradually increase volume

2. **Check DNS records**
   - Ensure all 3 records are added correctly
   - Verify SPF, DKIM, and DMARC

3. **Improve email content**
   - Avoid spam trigger words
   - Include unsubscribe link (optional)
   - Add physical address (optional)

### Problem: Only one email sends

**Check server logs:**
```bash
# Look for these messages
[Email Success] User confirmation sent: ...
[Email Success] Admin notification sent: ...

# Or errors
Failed to send user confirmation email: ...
Failed to send admin notification email: ...
```

**Solution:**
- Both emails send asynchronously
- Even if one fails, the other should work
- Check console for specific error messages

---

## Email Monitoring

### View Email Logs

1. Login to **Resend dashboard**
2. Go to **Logs**
3. See all sent emails with:
   - Delivery status
   - Opens (if tracking enabled)
   - Clicks
   - Bounces
   - Errors

### Email Rate Limits

**Free Tier:**
- 100 emails per day
- 3,000 emails per month

**If you exceed limits:**
- Emails will queue or fail
- Upgrade to paid plan ($20/month for 50,000 emails)

---

## Advanced Configuration (Optional)

### Custom Email Templates

Email templates are in `/emails/` directory:
- `UserConfirmation.tsx` - Candidate confirmation
- `AdminNotification.tsx` - Admin alert

**To customize:**
1. Edit the React components
2. Styles are inline (for email compatibility)
3. Test with Resend preview tool

### Add Reply-To Address

Currently set to: `contact@silviaslist.com`

**To change:**
Edit `/lib/email/sendUserConfirmation.ts`:
```typescript
replyTo: 'your-custom-email@silviaslist.com',
```

### Track Email Opens

**To enable:**
```typescript
const { data } = await resend.emails.send({
  // ... other options
  tags: [
    { name: 'category', value: 'talent_pool' },
  ],
  headers: {
    'X-Entity-Ref-ID': profile.id,
  },
});
```

Then view analytics in Resend dashboard.

---

## Security Best Practices

### 1. Protect Your API Key

✅ **DO:**
- Store in `.env.local` (never commit)
- Use environment variables in production
- Regenerate if accidentally exposed

❌ **DON'T:**
- Commit to git
- Share in public channels
- Hardcode in source files

### 2. Validate Email Addresses

Already implemented:
- Email validation in form schema
- Resend validates on send

### 3. Rate Limiting

**Consider adding** (for production):
- Limit form submissions per IP
- CAPTCHA for spam prevention
- Honeypot fields

---

## Cost Estimation

### Free Tier (Current)
- **Cost**: $0/month
- **Limit**: 100 emails/day, 3,000/month
- **Good for**: Testing, early stage

### If you get 10 submissions/day
- 20 emails/day (2 per submission)
- 600 emails/month
- **Still free** ✅

### If you get 50 submissions/day
- 100 emails/day
- 3,000 emails/month
- **Still free** ✅ (right at limit)

### If you get 100+ submissions/day
- 200+ emails/day
- 6,000+ emails/month
- **Need paid plan**: $20/month for 50,000 emails

---

## Testing Checklist

Before going live, test:

- [ ] User confirmation email arrives
- [ ] Admin notification email arrives
- [ ] Emails display correctly on desktop
- [ ] Emails display correctly on mobile
- [ ] Links work (contact email, terms page)
- [ ] Candidate data shows correctly in admin email
- [ ] Emails don't go to spam
- [ ] Form still works if email fails (graceful degradation)
- [ ] Console logs show success/error messages
- [ ] Resend dashboard shows delivery

---

## Support Resources

### Resend Documentation
- **Main docs**: https://resend.com/docs
- **React Email**: https://react.email/docs
- **API Reference**: https://resend.com/docs/api-reference

### Common Issues
- **DNS help**: https://resend.com/docs/dashboard/domains/introduction
- **Email best practices**: https://resend.com/docs/knowledge-base

### Get Help
- **Resend support**: support@resend.com
- **Discord**: https://resend.com/discord

---

## Quick Reference Commands

```bash
# Start dev server
npm run dev

# Check environment variables
cat .env.local

# View server logs
# (Check terminal where npm run dev is running)

# Test email sending (in browser console)
# Submit form and check Network tab for /api/talent-pool/submit
```

---

## Summary

**What you've built:**
- ✅ Professional email notifications
- ✅ Automatic user confirmations
- ✅ Real-time admin alerts
- ✅ Beautiful branded templates
- ✅ Production-ready code

**Time to set up:**
- Account creation: 2 minutes
- DNS configuration: 5 minutes
- DNS propagation: 5-15 minutes
- Testing: 5 minutes
- **Total: ~30 minutes**

**Monthly cost:**
- Free tier sufficient for most early-stage use
- Only upgrade if exceeding 3,000 emails/month

---

## Next Steps After Email Setup

1. **Complete deployment blockers**
   - Run database migration
   - Rotate security credentials
   - Deploy to Netlify

2. **Build admin dashboard**
   - View submitted profiles
   - Search and filter candidates
   - Export data

3. **Add job types/industries fields**
   - Complete preference collection
   - Better candidate matching

---

**Questions?** Check the troubleshooting section or Resend documentation.

**Ready to set up?** Follow Part 1 above when you have your domain ready.
