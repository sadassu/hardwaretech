# Email Configuration Examples

## Example 1: Gmail Setup

### Environment Variables (Production)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hardwaretech.store@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
EMAIL_FROM="Hardwaretech" <hardwaretech.store@gmail.com>
```

### How to Get Gmail App Password:
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "Hardwaretech Backend"
4. Click "Generate"
5. Copy the 16-character password (spaces will be removed automatically)
6. Use this as `SMTP_PASS`

---

## Example 2: Heroku Deployment

### Using Heroku CLI:
```bash
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=hardwaretech.store@gmail.com
heroku config:set SMTP_PASS=abcdefghijklmnop
heroku config:set EMAIL_FROM="Hardwaretech" <hardwaretech.store@gmail.com>
```

### Using Heroku Dashboard:
1. Go to your app → Settings
2. Click "Reveal Config Vars"
3. Add each variable:
   - Key: `SMTP_HOST`, Value: `smtp.gmail.com`
   - Key: `SMTP_PORT`, Value: `587`
   - Key: `SMTP_USER`, Value: `hardwaretech.store@gmail.com`
   - Key: `SMTP_PASS`, Value: `abcdefghijklmnop`
   - Key: `EMAIL_FROM`, Value: `"Hardwaretech" <hardwaretech.store@gmail.com>`

---

## Example 3: Railway Deployment

### Railway Dashboard:
1. Go to your project
2. Click "Variables" tab
3. Add variables:

| Variable Name | Value |
|--------------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `hardwaretech.store@gmail.com` |
| `SMTP_PASS` | `abcdefghijklmnop` |
| `EMAIL_FROM` | `"Hardwaretech" <hardwaretech.store@gmail.com>` |

---

## Example 4: Vercel Deployment

### Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add for Production, Preview, and Development:

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = hardwaretech.store@gmail.com
SMTP_PASS = abcdefghijklmnop
EMAIL_FROM = "Hardwaretech" <hardwaretech.store@gmail.com>
```

---

## Example 5: SendGrid Setup

### Environment Variables:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="Hardwaretech" <noreply@hardwaretech.com>
```

### How to Get SendGrid API Key:
1. Sign up at https://sendgrid.com
2. Go to Settings → API Keys
3. Create API Key with "Mail Send" permissions
4. Copy the API key (starts with `SG.`)
5. Use `apikey` as `SMTP_USER` and the API key as `SMTP_PASS`

---

## Example 6: Server Logs Output

### ✅ When Email is Configured Correctly:
```
Server listening on port: 5001

📧 Email Configuration Status:
   SMTP_HOST: ✅ Set
   SMTP_PORT: ✅ Set (587)
   SMTP_USER: ✅ Set
   SMTP_PASS: ✅ Set
   EMAIL_FROM: ✅ Set
✅ Email service is configured

✅ SMTP connection verified successfully
✅ Email sent successfully to user@example.com. Message ID: <abc123@mail.gmail.com>
```

### ❌ When Email is NOT Configured:
```
Server listening on port: 5001

📧 Email Configuration Status:
   SMTP_HOST: ❌ Missing
   SMTP_PORT: ❌ Missing
   SMTP_USER: ❌ Missing
   SMTP_PASS: ❌ Missing
   EMAIL_FROM: ⚠️ Using default
⚠️  Email service is NOT fully configured. Emails will fail.

📖 See backend/EMAIL_SETUP.md for configuration guide

❌ Email Error: Email configuration incomplete. Missing: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
```

---

## Example 7: Testing Email Locally

### Create `.env` file in `backend/` folder:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/hardwaretech

# Server
PORT=5001
CLIENT_URL=http://localhost:3000

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here
EMAIL_FROM="Hardwaretech" <your-email@gmail.com>
```

### Test by Registering a User:
1. Start backend: `npm run dev`
2. Check console for email config status
3. Register a new user via frontend
4. Check console for: `✅ Email sent successfully to...`
5. Check email inbox (and spam folder)

---

## Example 8: Error Messages and Solutions

### Error: "Email configuration incomplete"
```
❌ Email Error: Email configuration incomplete. Missing: SMTP_HOST, SMTP_PORT
```
**Solution:** Add missing environment variables in your deployment platform.

### Error: "Invalid SMTP_PORT"
```
❌ Email Error: Invalid SMTP_PORT: "587". Must be a number.
```
**Solution:** Make sure `SMTP_PORT` is set as a number, not a string with quotes.

### Error: "Authentication failed"
```
❌ Email sending failed: {
  error: 'Invalid login: 535-5.7.8 Username and Password not accepted',
  code: 'EAUTH'
}
```
**Solution:** 
- For Gmail: Use App Password, not regular password
- Check if 2FA is enabled
- Verify username and password are correct

### Error: "Connection timeout"
```
❌ Email sending failed: {
  error: 'Connection timeout',
  code: 'ETIMEDOUT'
}
```
**Solution:**
- Check if hosting provider blocks SMTP ports
- Try port 587 instead of 465
- Verify SMTP_HOST is correct

---

## Example 9: Complete Production Setup (Gmail)

### Step-by-Step:

1. **Create Gmail Account** (if you don't have one):
   - Email: `hardwaretech.store@gmail.com`
   - Enable 2-Factor Authentication

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Generate password: `abcd efgh ijkl mnop`

3. **Set Environment Variables** (Example for Heroku):
```bash
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_PORT=587
heroku config:set SMTP_USER=hardwaretech.store@gmail.com
heroku config:set SMTP_PASS=abcdefghijklmnop
heroku config:set EMAIL_FROM="Hardwaretech" <hardwaretech.store@gmail.com>
```

4. **Verify Configuration**:
```bash
heroku config
# Should show all SMTP variables
```

5. **Restart Server**:
```bash
heroku restart
```

6. **Check Logs**:
```bash
heroku logs --tail
# Look for "✅ Email service is configured"
```

7. **Test Email**:
   - Register a new user
   - Check logs for: `✅ Email sent successfully`
   - Check email inbox

---

## Example 10: Email Template Preview

When email is sent successfully, users will receive emails like:

**Subject:** `Reservation Created - Hardware Tech`

**Body:**
```
Hi John Doe,

Your reservation has been created successfully!

Reservation ID: 507f1f77bcf86cd799439011
Status: Pending
Date: January 15, 2025
Total: ₱5,000.00

Products:
- Product Name: Bulb
  Quantity: 2 pcs
  Size: 20W
  Price: ₱2,500.00

Thank you for your reservation!
```

---

## Quick Checklist

Before deploying, make sure:

- [ ] All 5 environment variables are set
- [ ] `SMTP_PORT` is a number (587 or 465)
- [ ] For Gmail: Using App Password, not regular password
- [ ] 2FA is enabled (for Gmail)
- [ ] Tested email sending locally
- [ ] Checked server logs for email config status
- [ ] Verified email arrives (check spam folder)

---

## Need Help?

If email still doesn't work:
1. Check server logs for specific error messages
2. Verify all environment variables are set correctly
3. Test SMTP credentials with an email client first
4. Contact your SMTP provider's support

