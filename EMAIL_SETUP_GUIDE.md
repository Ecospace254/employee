# Email Setup Guide for Password Reset

## 🚨 Current Status

The password reset email feature requires email configuration. Without it:
- ✅ **Change Password** works (when logged in)
- ❌ **Forgot Password** doesn't work (needs email)
- ❌ **Reset Password** doesn't work (needs email link)

---

## 📧 Option 1: Setup Gmail (Recommended for Development)

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow steps to enable it

### Step 2: Create App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: **Ecospace Employee Portal**
5. Click **Generate**
6. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### Step 3: Add to .env File

Create/edit `.env` file in project root:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
APP_URL=http://localhost:5000
```

**Important:** Use the App Password, NOT your regular Gmail password!

### Step 4: Restart Server

```bash
npm run dev
```

---

## 📧 Option 2: Use Other Email Services

### SendGrid (Production-Ready)

```env
# In server/email.ts, change:
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});
```

Then in `.env`:
```env
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Mailgun

```env
# In server/email.ts, change:
const transporter = nodemailer.createTransport({
  host: "smtp.mailgun.org",
  port: 587,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASS,
  },
});
```

### Outlook/Office 365

```env
# In server/email.ts, change service to "hotmail"
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
```

---

## 🧪 Testing Without Email Setup

If you don't want to set up email right now, you can still test password changes:

### Method 1: Use "Change Password" (When Logged In)
1. Login to your account
2. Go to Settings → Password tab
3. Enter current password
4. Enter new password
5. Confirm new password
6. Click "Change Password"

### Method 2: Manual Token Testing (Advanced)
1. Request password reset (it will fail to send email)
2. Check server logs for the generated token
3. Manually visit: `http://localhost:5000/reset-password?token=YOUR_TOKEN`
4. Enter new password

---

## ✅ Verify Email is Working

After setup, test the forgot password flow:

1. Go to Settings → Password tab
2. Click "Forgot your password?"
3. Enter your email address
4. Click "Send Reset Link"
5. Check your email inbox
6. Click the reset link
7. Enter new password

**Success message:** "Password reset link has been sent to your email address."

**Error messages you might see:**
- "Email address not found" - User doesn't exist with that email
- "Email service is not configured" - Need to add EMAIL_USER and EMAIL_PASS to .env

---

## 🔒 Security Notes

1. **Never commit .env file** - It's already in `.gitignore`
2. **Use App Passwords** - Not your real Gmail password
3. **Rotate credentials regularly** - Generate new App Password every few months
4. **Use environment-specific configs** - Different credentials for dev/staging/prod

---

## 🐛 Troubleshooting

### "Missing credentials for PLAIN"
- `.env` file not loaded or EMAIL_USER/EMAIL_PASS empty
- Restart server after adding credentials

### "Invalid login"
- Using regular Gmail password instead of App Password
- 2-Step Verification not enabled

### "Connection timeout"
- Firewall blocking SMTP (port 587 or 465)
- VPN interfering with connection

### Email not received
- Check spam/junk folder
- Verify EMAIL_USER is correct
- Check Gmail "Less secure app access" (if not using App Password)

---

## 📝 Current Implementation

- **Token expiry:** 10 minutes
- **Token format:** 64-character hex string
- **One token per user:** Old tokens deleted when new one created
- **One-time use:** Token deleted after successful reset
- **Password hashing:** Scrypt (same as login)

---

## 🚀 Production Deployment

For production, use professional email service:

1. **SendGrid** - 100 emails/day free
2. **Mailgun** - 5,000 emails/month free
3. **AWS SES** - Pay as you go, very cheap
4. **Postmark** - Developer-friendly, reliable

Don't use Gmail for production - it has daily sending limits!
