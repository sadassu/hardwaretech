# Gmail SMTP Setup Guide

This guide will help you configure Gmail SMTP for the Hardwaretech system.

## ⚠️ Important: Gmail Authentication Requirements

Gmail **requires** App Passwords for SMTP authentication. You **cannot** use your regular Gmail password.

## Step-by-Step Setup

### Step 1: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", find **2-Step Verification**
4. Click **Get Started** and follow the prompts
5. Complete the setup (you'll need your phone)

### Step 2: Generate an App Password

1. Go to: https://myaccount.google.com/apppasswords
   - Or navigate: Google Account → Security → 2-Step Verification → App passwords
2. You may need to sign in again
3. Under "Select app", choose **Mail**
4. Under "Select device", choose **Other (Custom name)**
5. Type: **Hardwaretech SMTP** (or any name you prefer)
6. Click **Generate**
7. Google will show you a **16-character password** (looks like: `abcd efgh ijkl mnop`)
8. **Copy this password** - you won't see it again!

### Step 3: Configure Environment Variables

Add these to your deployment platform (Railway, Heroku, Vercel, etc.):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
EMAIL_FROM="Hardwaretech" <your-email@gmail.com>
```

**Important Notes:**
- `SMTP_USER`: Your **full Gmail address** (e.g., `john.doe@gmail.com`)
- `SMTP_PASS`: The **16-character App Password** (remove spaces if any)
- `EMAIL_FROM`: Optional, but recommended for better deliverability

### Step 4: Verify Configuration

After deploying, check your server logs. You should see:

```
📧 Email Configuration Status:
   SMTP_HOST: ✅ Set
   SMTP_PORT: ✅ Set (587)
   SMTP_USER: ✅ Set
   SMTP_PASS: ✅ Set
   EMAIL_FROM: ✅ Set
✅ Email service is configured
```

## Common Errors and Solutions

### Error: "535-5.7.8 Username and Password not accepted"

**This means:**
- ❌ You're using your regular Gmail password
- ❌ The App Password is incorrect
- ❌ 2-Factor Authentication is not enabled
- ❌ The App Password was revoked/deleted

**Solution:**
1. Make sure 2FA is enabled: https://myaccount.google.com/security
2. Generate a new App Password: https://myaccount.google.com/apppasswords
3. Copy the **exact** 16-character password (no spaces)
4. Update `SMTP_PASS` in your environment variables
5. Redeploy your application

### Error: "Invalid login" or "BadCredentials"

**Same as above** - you need to use an App Password, not your regular password.

### Error: "App passwords are not available for this account"

**This means:**
- Your Google account doesn't support App Passwords
- This can happen with:
  - Google Workspace accounts (may need admin approval)
  - Accounts with certain security restrictions
  - Accounts that haven't completed 2FA setup

**Solution:**
1. Complete 2-Factor Authentication setup
2. Wait a few minutes after enabling 2FA
3. Try generating the App Password again
4. If still not working, contact your Google Workspace admin

### Error: "Connection timeout"

**This means:**
- Your hosting provider might be blocking SMTP ports
- Firewall is blocking the connection

**Solution:**
1. Try port 465 instead of 587:
   ```env
   SMTP_PORT=465
   ```
2. Check if your hosting provider allows SMTP connections
3. Consider using a different email service (SendGrid, Mailgun)

## Testing Your Configuration

### Option 1: Test on Server Startup

Add this environment variable:
```env
TEST_EMAIL=true
```

This will test the SMTP connection when your server starts.

### Option 2: Test by Registering a User

1. Try registering a new user
2. Check server logs for email status
3. Check the user's email inbox (and spam folder)

### Option 3: Check Server Logs

Look for these messages:
- ✅ `SMTP connection verified successfully`
- ✅ `Email sent successfully to...`
- ❌ `Gmail authentication error` (means you need App Password)

## Security Best Practices

1. **Never commit App Passwords** to version control
2. **Use environment variables** for all credentials
3. **Rotate App Passwords** regularly (every 90 days recommended)
4. **Use separate App Passwords** for different applications
5. **Monitor your Google Account** for suspicious activity

## Alternative: Use a Different Email Service

If Gmail continues to cause issues, consider using:

### SendGrid (Recommended for Production)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

These services are designed for sending transactional emails and are more reliable than Gmail for production use.

## Troubleshooting Checklist

- [ ] 2-Factor Authentication is enabled
- [ ] App Password was generated (16 characters)
- [ ] App Password is copied correctly (no spaces)
- [ ] `SMTP_USER` is your full Gmail address
- [ ] `SMTP_PASS` is the App Password (not regular password)
- [ ] Environment variables are set in deployment platform
- [ ] Application was redeployed after adding variables
- [ ] Server logs show email configuration is set
- [ ] No firewall blocking SMTP ports

## Still Having Issues?

1. **Double-check the App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Delete the old App Password
   - Generate a new one
   - Copy it exactly (no spaces)

2. **Verify Environment Variables:**
   - Check that all variables are set correctly
   - Make sure there are no extra spaces
   - Verify the email address is correct

3. **Check Server Logs:**
   - Look for specific error messages
   - Check if authentication is failing
   - Verify connection is being established

4. **Try a Different Port:**
   - Switch from 587 to 465 (or vice versa)
   - Some networks block specific ports

5. **Contact Support:**
   - If using Google Workspace, contact your admin
   - Check Google's status page for service issues

