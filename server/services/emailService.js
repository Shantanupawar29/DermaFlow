const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendWelcomeEmail = async (email, name) => {
  const voucherCode = `WELCOME${Math.floor(Math.random() * 10000)}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🎉 Welcome to DermaFlow! Here\'s Your 15% Welcome Voucher',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .header { background: #4A0E2E; padding: 30px; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .voucher { background: #F5E6D3; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
          .voucher-code { font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #4A0E2E; font-family: monospace; }
          .btn { display: inline-block; background: #4A0E2E; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ DermaFlow ✨</h1>
          </div>
          <div class="content">
            <h2>Welcome ${name}!</h2>
            <p>Thank you for joining the DermaFlow family! We're excited to help you achieve your best skin yet.</p>
            
            <div class="voucher">
              <h3>🎁 Your Welcome Voucher 🎁</h3>
              <div class="voucher-code">${voucherCode}</div>
              <p style="font-size: 18px; font-weight: bold; color: #4A0E2E;">15% OFF on your first purchase!</p>
              <p style="color: #666;">Min. spend ₹999 | Valid for 30 days</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="btn">Shop Now →</a>
            </div>
          </div>
          <div class="footer">
            <p>Need help? Contact us at support@dermaflow.com</p>
            <p>© 2024 DermaFlow. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
  return voucherCode;
};

const sendOrderConfirmation = async (email, name, order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px;">${item.name}</td>
      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right;">₹${(item.price / 100).toFixed(2)}</td>
      <td style="padding: 10px; text-align: right;">₹${((item.price * item.quantity) / 100).toFixed(2)}</td>
    </tr>
  `).join('');
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `✅ Order Confirmed! #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .header { background: #4A0E2E; padding: 20px; text-align: center; color: white; }
          .content { padding: 30px; }
          .order-details { background: #f9f9f9; padding: 15px; border-radius: 10px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
          .total { font-size: 18px; font-weight: bold; color: #4A0E2E; }
          .btn { background: #4A0E2E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Order Confirmed! 🎉</h2>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for your order! We've received your order and will process it shortly.</p>
            
            <div class="order-details">
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Invoice Number:</strong> ${order.invoiceNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
              
              <table>
                <thead>
                  <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot>
                  <tr><td colspan="3"><strong>Grand Total</strong></td><td><strong>₹${(order.grandTotal / 100).toFixed(2)}</strong></td></tr>
                </tfoot>
              </table>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn">Track Your Order →</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail, sendOrderConfirmation };