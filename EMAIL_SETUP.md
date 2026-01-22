# Email Setup Guide for GEEP Platform

This guide explains how to configure email notifications for the GEEP Platform.

## Overview

The GEEP Platform sends automated emails to users for:
- **Registration**: Welcome email with account details when a new user registers
- **Task Completion**: Notification when a user completes a task
- **Achievements**: Notification when a user earns a badge/achievement
- **Profile Updates**: Confirmation email when a user updates their profile

## Email Configuration

The platform uses Gmail (maths99op@gmail.com) to send emails via Nodemailer.

### Step 1: Set Up Gmail App Password

Since Gmail requires app-specific passwords for third-party applications, you need to:

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable it if not already enabled)
3. Go to **App passwords** (you may need to search for it)
4. Select **Mail** and **Other (Custom name)** - enter "GEEP Platform"
5. Click **Generate**
6. Copy the 16-character app password (you'll need this for the `.env` file)

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory of your project (if it doesn't exist) and add:

```env
EMAIL_PASSWORD=your-16-character-app-password-here
JWT_SECRET=your-jwt-secret-key
MONGODB_URI=your-mongodb-connection-string
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Important**: 
- Replace `your-16-character-app-password-here` with the app password you generated from Gmail
- Never commit the `.env` file to version control (it should be in `.gitignore`)

### Step 3: Test Email Functionality

After setting up the environment variables:

1. Restart your server
2. Register a new user to test the registration email
3. Complete a task to test the task completion email
4. Update your profile to test the profile update email

## Email Templates

The platform includes beautifully designed HTML email templates for:

1. **Registration Email**: Welcome message with account details and login instructions
2. **Task Completion Email**: Celebration message with task details and points earned
3. **Achievement Email**: Badge unlock notification with achievement details
4. **Profile Update Email**: Confirmation of profile changes

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variables**: Ensure `EMAIL_PASSWORD` is set correctly in your `.env` file
2. **Check Gmail App Password**: Verify the app password is correct and not expired
3. **Check Server Logs**: Look for email-related errors in the console
4. **Check Gmail Security**: Ensure "Less secure app access" is not required (use App Password instead)

### Common Errors

- **"Invalid login"**: The app password is incorrect
- **"Connection timeout"**: Check your internet connection
- **"Email service not configured"**: `EMAIL_PASSWORD` is missing from `.env`

### Development Mode

If `EMAIL_PASSWORD` is not set, the system will:
- Log a warning message
- Continue normal operation (emails won't be sent)
- Log what email would have been sent to the console

This allows development without email configuration, but emails will not actually be sent.

## Email Sender

All emails are sent from: **maths99op@gmail.com** (GEEP Platform)

## Support

If you encounter issues with email setup, check:
1. Server console logs for detailed error messages
2. Gmail account security settings
3. Environment variable configuration
