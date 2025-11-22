# Email Configuration Guide

This guide explains how to configure email functionality for the Hardwaretech system in production.

## Required Environment Variables

Add these environment variables to your production deployment platform (Heroku, Railway, Vercel, etc.):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="Hardwaretech" <your-email@gmail.com>
```

## Common SMTP Providers

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
```

**Important for Gmail:**
1. Enable 2-Factor Authentication
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (16 characters) as `SMTP_PASS`

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid
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

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587  # or 465 for SSL
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Port Configuration

- **Port 587**: STARTTLS (recommended for most providers)
- **Port 465**: SSL/TLS (secure connection)
- **Port 25**: Usually blocked by hosting providers

## Deployment Platform Setup

### Heroku
```bash
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=your-email@gmail.com
heroku config:set SMTP_PASS=your-app-password
heroku config:set EMAIL_FROM="Hardwaretech" <your-email@gmail.com>
```

### Railway
Add environment variables in Railway dashboard:
1. Go to your project
2. Click on "Variables" tab
3. Add each environment variable

### Vercel
Add environment variables in Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production, Preview, and Development

### DigitalOcean App Platform
Add environment variables in App Spec or Dashboard:
```yaml
envs:
  - key: SMTP_HOST
    value: smtp.gmail.com
  - key: SMTP_PORT
    value: "587"
  - key: SMTP_USER
    value: your-email@gmail.com
  - key: SMTP_PASS
    value: your-app-password
```

## Testing Email Configuration

### Option 1: Enable SMTP Verification (Development)
Add to your `.env` file:
```env
VERIFY_SMTP=true
```

This will verify the SMTP connection on startup.

### Option 2: Test via API
The system will automatically test email when:
- User registers
- User changes password
- Reservation status changes

Check your server logs for:
- ✅ `SMTP connection verified successfully`
- ✅ `Email sent successfully to...`
- ❌ Error messages if configuration is wrong

## Common Issues and Solutions

### Issue: "Email configuration incomplete"
**Solution:** Make sure all required environment variables are set in your deployment platform.

### Issue: "Invalid SMTP_PORT"
**Solution:** Ensure `SMTP_PORT` is a number (587 or 465), not a string.

### Issue: "Authentication failed"
**Solution:** 
- For Gmail: Use App Password, not regular password
- Check if 2FA is enabled (required for Gmail App Passwords)
- Verify username and password are correct

### Issue: "Connection timeout"
**Solution:**
- Check if your hosting provider blocks SMTP ports
- Try using port 587 instead of 465
- Verify SMTP_HOST is correct
- Check firewall settings

### Issue: "Self-signed certificate"
**Solution:** The code already handles this with `rejectUnauthorized: false`. If issues persist, contact your SMTP provider.

### Issue: Emails go to spam
**Solution:**
- Use a proper `EMAIL_FROM` with your domain
- Set up SPF, DKIM, and DMARC records for your domain
- Use a reputable email service (SendGrid, Mailgun, etc.)

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use App Passwords** for Gmail (not regular passwords)
3. **Rotate passwords** regularly
4. **Use environment-specific** email addresses for testing
5. **Monitor email logs** for suspicious activity

## Troubleshooting

### Check Environment Variables
```bash
# In your deployment platform, verify variables are set:
echo $SMTP_HOST
echo $SMTP_PORT
echo $SMTP_USER
# SMTP_PASS should not be echoed for security
```

### View Server Logs
Check your deployment platform's logs for email-related errors:
- Look for "❌ Email Error:" messages
- Check for connection timeouts
- Verify authentication errors

### Test Connection Locally
Before deploying, test your SMTP configuration locally:
1. Create a `.env` file with your SMTP credentials
2. Run the backend server
3. Try registering a new user
4. Check console logs for email status

## Support

If email still doesn't work after following this guide:
1. Check server logs for specific error messages
2. Verify all environment variables are set correctly
3. Test SMTP credentials with a tool like `telnet` or `openssl`
4. Contact your SMTP provider's support if authentication fails

