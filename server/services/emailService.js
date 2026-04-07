const nodemailer = require('nodemailer');

// Create transporter with better configuration
const createTransporter = () => {
  // Check if email credentials exist
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️ Email credentials not configured. Emails will not be sent.');
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Add timeout and retry options
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  });
};
// Add this function to existing emailService.js
const sendStockAlert = async (supplierEmail, supplierName, product, alert) => {
  const transporter = createTransporter();
  if (!transporter) return false;
  
  const mailOptions = {
    from: `"DermaFlow SCM" <${process.env.EMAIL_USER}>`,
    to: supplierEmail,
    subject: `⚠️ URGENT: Stock Alert for ${product.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 20px; text-align: center; color: white;">
          <h2>⚠️ Critical Stock Alert</h2>
        </div>
        <div style="padding: 20px;">
          <h3>Dear ${supplierName},</h3>
          <p>The following product has reached critical stock level:</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Product:</strong> ${product.name}</p>
            <p><strong>Current Stock:</strong> ${alert.currentStock} units</p>
            <p><strong>Critical Threshold:</strong> ${alert.criticalThreshold} units</p>
            <p><strong>Recommended Reorder:</strong> ${alert.reorderQuantity} units</p>
            <p><strong>Sales Velocity:</strong> ${product.salesVelocity?.toFixed(1) || 'N/A'} units/day</p>
          </div>
          
          <p>Please restock this product at your earliest convenience.</p>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/admin/scm" style="background: #4A0E2E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Dashboard →
            </a>
          </div>
        </div>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Stock alert sent to ${supplierEmail}`);
    return true;
  } catch (error) {
    console.error('Stock alert email failed:', error);
    return false;
  }
};

// Send order confirmation email
const sendOrderConfirmation = async (email, name, order) => {
  console.log('Preparing order confirmation email for:', email);
  
  const transporter = createTransporter();
  if (!transporter) {
    console.log('Email service not configured');
    return false;
  }
  
  // Format items for email
  const itemsHtml = order.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px;">${item.name}</td>
      <td style="padding: 10px; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; text-align: right;">₹${(item.price).toFixed(2)}</td>
      <td style="padding: 10px; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');
  
  const mailOptions = {
    from: `"Derma Flow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Order Confirmed! #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .header { background: #4A0E2E; padding: 20px; text-align: center; color: white; }
          .content { padding: 30px; }
          .order-details { background: #f9f9f9; padding: 15px; border-radius: 10px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f5f5f5; padding: 10px; text-align: left; }
          .total { font-size: 18px; font-weight: bold; color: #4A0E2E; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; border-top: 1px solid #eee; }
          .btn { display: inline-block; background: #4A0E2E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✨ Derma Flow ✨</h2>
            <h3>Order Confirmed!</h3>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for your order! We've received your order and will process it shortly.</p>
            
            <div class="order-details">
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Invoice Number:</strong> ${order.invoiceNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
              
              <table style="margin-top: 15px;">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
               </table>
              
              <div style="margin-top: 20px; text-align: right;">
                <p><strong>Subtotal:</strong> ₹${(order.totalAmount).toFixed(2)}</p>
                <p><strong>Tax (18% GST):</strong> ₹${(order.taxAmount).toFixed(2)}</p>
                <p><strong>Shipping:</strong> ${order.shippingAmount === 0 ? 'Free' : `₹${(order.shippingAmount).toFixed(2)}`}</p>
                <p class="total"><strong>Grand Total:</strong> ₹${(order.grandTotal).toFixed(2)}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn">Track Your Order →</a>
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
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  console.log('Preparing welcome email for:', email);
  
  const transporter = createTransporter();
  if (!transporter) {
    console.log('Email service not configured');
    return null;
  }
  
  const voucherCode = `WELCOME${Math.floor(Math.random() * 10000)}`;
  
  const mailOptions = {
    from: `"Derma Flow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎉 Welcome to DermaFlow! Here\'s Your 15% Welcome Voucher',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4A0E2E; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to DermaFlow!</h1>
        </div>
        <div style="padding: 30px;">
          <h2>Hi ${name},</h2>
          <p>Thank you for joining the DermaFlow family! We're excited to help you achieve your best skin yet.</p>
          
          <div style="background: #F5E6D3; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #4A0E2E;">🎁 Your Welcome Voucher 🎁</h3>
            <div style="font-size: 28px; font-weight: bold; letter-spacing: 3px; color: #4A0E2E; margin: 15px 0;">${voucherCode}</div>
            <p style="font-size: 18px; font-weight: bold; color: #4A0E2E;">15% OFF on your first purchase!</p>
            <p style="color: #666;">Min. spend ₹999 | Valid for 30 days</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" style="background: #4A0E2E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">Shop Now →</a>
          </div>
        </div>
      </div>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return voucherCode;
  } catch (error) {
    console.error('❌ Welcome email failed:', error.message);
    return null;
  }
};


module.exports = { sendOrderConfirmation, sendWelcomeEmail, sendStockAlert };