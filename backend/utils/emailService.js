import nodemailer from 'nodemailer';

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Must be false for port 587
    auth: {
      user: 'maths99op@gmail.com',
      pass: process.env.EMAIL_PASSWORD || '' 
    },
    tls: {
      rejectUnauthorized: false // Prevents connection drops on cloud providers like Render
    }
  });
};

// 🌟 REAL LINKS CONFIGURATION
const FRONTEND_URL = 'https://capstone-gray-alpha.vercel.app';

// Email templates
const emailTemplates = {
  registration: (user) => ({
    subject: 'Welcome to GEEP Platform - Registration Successful!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #43A047 0%, #1B5E20 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #43A047; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; color: #555; }
          .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #43A047; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌿 Welcome to GEEP Platform! 🌿</h1>
            <p>Your account has been successfully created</p>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            <p>Welcome to GEEP (Green Eco Education Platform)! We're excited to have you join our community.</p>
            
            <div class="info-box">
              <h3>Your Account Details:</h3>
              <div class="info-row"><span class="label">Name:</span> ${user.name}</div>
              <div class="info-row"><span class="label">Email:</span> ${user.email}</div>
              <div class="info-row"><span class="label">Role:</span> ${user.role}</div>
            </div>

            <div style="text-align: center;">
              <a href="${FRONTEND_URL}/login" class="button">Go to Login</a>
            </div>

            <div class="footer">
              <p>Best regards,<br>The GEEP Platform Team</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  taskCompletion: (user, task) => ({
    subject: `🎉 Task Completed! - ${task.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #11998e; }
          .points { font-size: 24px; color: #f39c12; font-weight: bold; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Task Completed Successfully!</h1>
            <p>Great job, ${user.name}!</p>
          </div>
          <div class="content">
            <div class="task-box">
              <h3>${task.icon || '✅'} ${task.title}</h3>
              <p>You earned <strong>${task.points || 0} points!</strong></p>
            </div>
            <p>Check your progress on the leaderboard at ${FRONTEND_URL}/leaderboard</p>
            <div class="footer">
              <p>Best regards,<br>The GEEP Platform Team</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  achievement: (user, badge) => ({
    subject: `🏆 Achievement Unlocked! - ${badge.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .badge-box { background: white; padding: 30px; margin: 20px 0; border-radius: 8px; text-align: center; border: 3px solid #f5576c; }
          .badge-icon { font-size: 80px; margin: 20px 0; }
          .badge-name { font-size: 28px; font-weight: bold; color: #f5576c; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Achievement Unlocked!</h1>
            <p>Congratulations, ${user.name}!</p>
          </div>
          <div class="content">
            <div class="badge-box">
              <div class="badge-icon">${badge.icon || '🏆'}</div>
              <div class="badge-name">${badge.name}</div>
              <p>${badge.description || 'Well done!'}</p>
            </div>
            <p>View your badges at: ${FRONTEND_URL}/profile</p>
            <div class="footer">
              <p>Best regards,<br>The GEEP Platform Team</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  profileUpdate: (user, updates) => ({
    subject: 'Profile Updated - GEEP Platform',
    html: `
      <!DOCTYPE html>
      <html>
      <body>
        <div style="font-family: Arial; padding: 20px;">
          <h2>📝 Profile Updated</h2>
          <p>Dear ${user.name}, your GEEP profile was successfully updated on ${new Date().toLocaleString()}.</p>
          <p>If you did not authorize this change, please contact support.</p>
        </div>
      </body>
      </html>
    `
  }),

  approval: (data) => ({
    subject: 'Your Account Has Been Approved',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .button { display: inline-block; padding: 12px 30px; background: #38ef7d; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        </style>
      </head>
      <body style="font-family: Arial; padding: 20px;">
        <h1 style="color: #11998e;">✅ Account Approved!</h1>
        <p>Hello ${data.name}, your registration as a ${data.role} has been approved.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${FRONTEND_URL}/login" class="button">Login to Dashboard</a>
        </div>
        <p>Best regards,<br>The GEEP Platform Team</p>
      </body>
      </html>
    `
  }),

  rejection: (data) => ({
    subject: 'Your Registration Request Was Rejected',
    html: `
      <body style="font-family: Arial; padding: 20px;">
        <h1 style="color: #f5576c;">❌ Registration Rejected</h1>
        <p>Hello ${data.name}, we regret to inform you that your registration request has been rejected.</p>
        <p>Please contact support if you believe this was a mistake.</p>
      </body>
    `
  })
};

// Send email function
export const sendEmail = async (to, templateName, data) => {
  try {
    if (!process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ EMAIL_PASSWORD not set. Skipping email send.');
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = createTransporter();
    const template = emailTemplates[templateName];
    
    if (!template) throw new Error(`Template '${templateName}' not found`);

    const emailContent = template(data);
    
    const mailOptions = {
      from: '"GEEP Platform" <maths99op@gmail.com>',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email service error:', error);
    return { success: false, error: error.message };
  }
};

export default { sendEmail, emailTemplates };