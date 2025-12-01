# Brevo Email Setup Guide

This guide will help you set up Brevo API for email sending in your Hardware Tech application.

## ✅ Why Brevo API?

- **No SMTP port blocking** - Uses HTTPS API instead of SMTP ports (587/465)
- **Works reliably on Railway** - No more `ETIMEDOUT` connection errors
- **Better deliverability** - Professional email service with good inbox rates
- **Free tier available** - 300 emails/day free

---

## Step 1: Create Brevo Account & Get API Key

### 1.1 Sign Up / Log In

1. Go to **https://www.brevo.com**
2. Click **Sign up** (or **Log in** if you already have an account)
3. Complete the registration process

### 1.2 Get Your API Key

1. After logging in, click your **profile/account icon** (top right)
2. Go to **SMTP & API** → **API keys (v3)**
3. Click **Create a new API key**
4. Give it a name (e.g., `hardwaretech-production`)
5. Click **Generate**
6. **Copy the API key immediately** (you won't see it again!)

> ⚠️ **Important:** Save this API key somewhere safe. You'll need it for your environment variables.

---

## Step 2: Verify Your Domain (Recommended for Production)

### 2.1 Add Domain in Brevo

1. In Brevo dashboard, go to **Senders & IP** → **Domains** (or **Settings** → **Your Senders**)
2. Click **Add a domain**
3. Enter your domain (e.g., `hardware-tech.shop`)
4. Click **Add**

### 2.2 Add DNS Records

Brevo will show you several DNS records to add. You need to add these in your **domain's DNS provider** (where you manage DNS for `hardware-tech.shop`):

**Common DNS Providers:**
- **Namecheap**: Domains → Manage → Advanced DNS
- **Cloudflare**: DNS → Records
- **GoDaddy**: DNS Management
- **Google Domains**: DNS → Custom records

**Example DNS Records (copy exact values from Brevo):**

```
Type: TXT
Name: @
Value: v=spf1 include:spf.brevo.com ~all

Type: TXT
Name: brevo._domainkey
Value: k=rsa; p=...long-key...

Type: CNAME
Name: brevo1._domainkey
Value: brevo1._domainkey.brevo.com
```

### 2.3 Verify Domain

1. After adding DNS records, wait **5-15 minutes** for DNS to propagate
2. Go back to Brevo → **Domains**
3. Click **Verify** next to your domain
4. Status should change to **"Verified"** ✅

### 2.4 Use Your Domain for Sending

Once verified, you can use emails like:
- `no-reply@hardware-tech.shop`
- `noreply@hardware-tech.shop`
- `support@hardware-tech.shop`

---

## Step 3: Configure Environment Variables

### 3.1 Local Development (`backend/.env`)

Add these to your `backend/.env` file:

```env
# Brevo API Configuration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_FROM_EMAIL=no-reply@hardware-tech.shop
BREVO_FROM_NAME=Hardware Tech
```

**If domain not verified yet, use Brevo's test domain:**
```env
BREVO_API_KEY=your_brevo_api_key_here
BREVO_FROM_EMAIL=onboarding@resend.dev
BREVO_FROM_NAME=Hardware Tech
```

### 3.2 Production (Railway)

1. Go to **Railway** → Your project → **Backend service**
2. Click **Variables** tab
3. Add these environment variables:

```env
BREVO_API_KEY=your_brevo_api_key_here
BREVO_FROM_EMAIL=no-reply@hardware-tech.shop
BREVO_FROM_NAME=Hardware Tech
```

4. Click **Deploy** or restart your service

---

## Step 4: Test Email Sending

### 4.1 Test Locally

1. Make sure your `backend/.env` has `BREVO_API_KEY` set
2. Restart your backend: `npm start` (from `backend` folder)
3. Check console output - you should see:
   ```
   📧 Email Configuration Status (Brevo API):
      BREVO_API_KEY: ✅ Set
      BREVO_FROM_EMAIL: no-reply@hardware-tech.shop
      BREVO_FROM_NAME: Hardware Tech
   ✅ Email service is configured (Brevo API)
   ```

4. Trigger an action that sends an email (e.g., create a reservation)
5. Check console for: `✅ Email sent successfully to ...`
6. Check your email inbox (and spam folder)

### 4.2 Test in Production

1. After deploying to Railway with the env vars set
2. Check Railway logs for the same success messages
3. Trigger an email action
4. Verify email is received

### 4.3 Enable Connection Test (Optional)

To test the API connection on startup, add to your env vars:

```env
TEST_EMAIL=true
```

This will test the Brevo API connection when the server starts.

---

## Step 5: Monitor Email Delivery

### 5.1 Brevo Dashboard

1. Go to **Brevo Dashboard** → **Statistics** → **Email**
2. You can see:
   - Emails sent
   - Delivery rate
   - Open rate
   - Click rate
   - Bounce rate

### 5.2 Check Logs

Your backend logs will show:
- ✅ Successful sends: `✅ Email sent successfully to ...`
- ❌ Failed sends: `❌ Email sending failed...` (with error details)

---

## Troubleshooting

### ❌ Error: "BREVO_API_KEY is missing"

**Solution:** Make sure `BREVO_API_KEY` is set in your environment variables (both local `.env` and Railway)

### ❌ Error: "unauthorized" or Status 401

**Solution:** 
- Your API key is invalid or expired
- Generate a new API key in Brevo dashboard
- Update `BREVO_API_KEY` in your env vars

### ❌ Error: "invalid_parameter" or Status 400

**Solution:**
- Your sender email domain is not verified in Brevo
- Verify your domain in Brevo dashboard (Step 2)
- Or use Brevo's test domain temporarily: `onboarding@resend.dev`

### ❌ Emails going to spam

**Solution:**
- Verify your domain in Brevo (Step 2)
- Use your own domain for `BREVO_FROM_EMAIL` (not `@resend.dev`)
- Make sure SPF/DKIM records are correctly added to DNS

### ❌ Still getting connection errors

**Solution:**
- Brevo API uses HTTPS (port 443), not SMTP ports
- Railway should not block HTTPS connections
- If still failing, check Railway logs for specific error messages

---

## Free Tier Limits

Brevo free tier includes:
- **300 emails/day**
- **Unlimited contacts**
- **Email API access**

If you need more, upgrade to a paid plan in Brevo dashboard.

---

## Support

- **Brevo Documentation**: https://developers.brevo.com/
- **Brevo Support**: https://help.brevo.com/
- **API Reference**: https://developers.brevo.com/reference

---

## Migration from SMTP

If you were using SMTP before:
- ✅ **No code changes needed** - The `sendEmail()` function works the same
- ✅ **Just update env vars** - Replace `SMTP_*` vars with `BREVO_*` vars
- ✅ **Remove nodemailer dependency** (optional, not required)

---

## Next Steps

1. ✅ Set up Brevo account and get API key
2. ✅ Add env vars to local `.env` and Railway
3. ✅ Verify your domain (recommended for production)
4. ✅ Test email sending
5. ✅ Monitor email delivery in Brevo dashboard

**You're all set!** 🎉

