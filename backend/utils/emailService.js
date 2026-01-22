import nodemailer from 'nodemailer';

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'maths99op@gmail.com',
      pass: process.env.EMAIL_PASSWORD || '' // You'll need to set this in .env file
    }
  });
};

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
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; color: #555; }
          .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
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
            <p>Welcome to the GEEP (Green Energy Education Platform)! We're excited to have you join our community of environmental enthusiasts.</p>
            
            <div class="info-box">
              <h3>Your Account Details:</h3>
              <div class="info-row">
                <span class="label">Name:</span> ${user.name}
              </div>
              <div class="info-row">
                <span class="label">Email:</span> ${user.email}
              </div>
              <div class="info-row">
                <span class="label">Role:</span> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
              <div class="info-row">
                <span class="label">Account Created:</span> ${new Date().toLocaleDateString()}
              </div>
            </div>

            <h3>Getting Started:</h3>
            <ul>
              <li>Log in using your email: <strong>${user.email}</strong></li>
              <li>Start exploring lessons and complete tasks to earn points</li>
              <li>Track your progress and unlock achievements</li>
              <li>Join the leaderboard and compete with other users</li>
            </ul>

            <p>If you have any questions or need assistance, feel free to reach out to us.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Log In Now</a>
            </div>

            <div class="footer">
              <p>Best regards,<br>The GEEP Platform Team</p>
              <p>This is an automated email. Please do not reply to this message.</p>
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
            <p>Congratulations! You have successfully completed a task on the GEEP Platform.</p>
            
            <div class="task-box">
              <h3>${task.icon || '✅'} ${task.title}</h3>
              <p><strong>Category:</strong> ${task.category || 'General'}</p>
              <p><strong>Difficulty:</strong> ${task.difficulty || 'N/A'}</p>
              ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
            </div>

            <div class="points">
              ⭐ You earned ${task.points || 0} points! ⭐
            </div>

            <p>Keep up the excellent work! Continue completing tasks to earn more points and unlock achievements.</p>
            
            <p>Your total points: <strong>${user.points || 0}</strong></p>

            <div class="footer">
              <p>Best regards,<br>The GEEP Platform Team</p>
              <p>This is an automated email. Please do not reply to this message.</p>
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
            <p>Amazing work! You've just earned a new achievement badge on the GEEP Platform.</p>
            
            <div class="badge-box">
              <div class="badge-icon">${badge.icon || '🏆'}</div>
              <div class="badge-name">${badge.name}</div>
              <p style="color: #666; margin-top: 10px;">${badge.description || 'Well done!'}</p>
              ${badge.points ? `<p style="margin-top: 15px;"><strong>Points Awarded:</strong> ${badge.points}</p>` : ''}
            </div>

            <p>Your dedication to environmental education and action is truly inspiring. Keep up the great work!</p>
            
            <p>Total badges earned: <strong>${user.badges?.length || 0}</strong></p>
            <p>Total points: <strong>${user.points || 0}</strong></p>

            <div class="footer">
              <p>Best regards,<br>The GEEP Platform Team</p>
              <p>This is an automated email. Please do not reply to this message.</p>
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
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4facfe; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; color: #555; }
          .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Profile Updated</h1>
            <p>Your profile has been successfully updated</p>
          </div>
          <div class="content">
            <p>Dear ${user.name},</p>
            <p>This is to confirm that your profile on the GEEP Platform has been successfully updated.</p>
            
            <div class="info-box">
              <h3>Updated Information:</h3>
              ${updates.name ? `<div class="info-row"><span class="label">Name:</span> ${updates.name}</div>` : ''}
              ${updates.avatar ? `<div class="info-row"><span class="label">Avatar:</span> ${updates.avatar}</div>` : ''}
              <div class="info-row">
                <span class="label">Updated On:</span> ${new Date().toLocaleString()}
              </div>
            </div>

            <p>If you did not make these changes, please contact us immediately.</p>

            <div class="footer">
              <p>Best regards,<br>The GEEP Platform Team</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #38ef7d; text-align: center; }
          .button { display: inline-block; padding: 12px 30px; background: #38ef7d; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Account Approved!</h1>
            <p>Welcome to GEEP Platform</p>
          </div>
          <div class="content">
            <p>Hello ${data.name},</p>
            <p>Great news! Your registration as a ${data.role} has been approved.</p>
            
            <div class="success-box">
              <h3>🎉 You can now log in and access your dashboard!</h3>
            </div>

            <p>You now have full access to all features of the GEEP Platform. Start exploring lessons, complete tasks, and earn points!</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">Log In Now</a>
            </div>

            <div class="footer">
              <p>Best regards,<br>The GEEP Platform Team</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  rejection: (data) => ({
    subject: 'Your Registration Request Was Rejected',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f5576c; }
          .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Registration Rejected</h1>
            <p>We're sorry to inform you</p>
          </div>
          <div class="content">
            <p>Hello ${data.name},</p>
            <p>We regret to inform you that your registration request has been rejected.</p>
            
            <div class="info-box">
              <p><strong>Please contact support if this was a mistake.</strong></p>
              <p>If you believe this was an error, please reach out to our support team for assistance.</p>
            </div>

            <p>Thank you for your interest in the GEEP Platform.</p>

            <div class="footer">
              <p>Best regards,<br>The GEEP Platform Team</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
export const sendEmail = async (to, templateName, data) => {
  try {
    // Check if email password is configured
    if (!process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ EMAIL_PASSWORD not set in environment variables. Email will not be sent.');
      console.warn('⚠️ Email that would have been sent:', {
        to,
        template: templateName,
        subject: emailTemplates[templateName](data).subject
      });
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = createTransporter();
    const template = emailTemplates[templateName];
    
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const emailContent = template(data);
    
    const mailOptions = {
      from: '"GEEP Platform" <maths99op@gmail.com>',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export default { sendEmail, emailTemplates };
