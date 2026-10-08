const generateOtpTemplate = (title, message, otp) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 28px;">LG Enterprises</h1>
      </div>
      
      <div style="padding: 20px; background-color: #f8fafc; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">${title}</h2>
        <p style="color: #475569; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
          ${message}
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 15px 30px; background-color: #ffffff; border: 2px dashed #cbd5e1; border-radius: 8px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">${otp}</span>
          </div>
        </div>
        
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 0;">
          This code will expire in <strong>10 minutes</strong>.
        </p>
      </div>
      
      <div style="text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
          If you didn't request this code, you can safely ignore this email.<br>
          Someone else might have typed your email address by mistake.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #cbd5e1; font-size: 12px;">
          &copy; ${new Date().getFullYear()} LG Enterprises. All rights reserved.
        </p>
      </div>
    </div>
  `;
};

module.exports = {
  generateOtpTemplate
};
