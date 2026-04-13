// emailService.js
const SibApiV3Sdk = require('sib-api-v3-sdk');
console.log('BREVO KEY:', process.env.BREVO_API_KEY?.slice(0, 8) + '...');
const B = '#4A0E2E';  // brand maroon
const URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Brevo API Client Setup
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const transactionalEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// Sender configuration - MUST be verified in Brevo dashboard
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'support@dermaflow.in';
const SENDER_NAME = 'DermaFlow';

// HTML shell template
const shell = (title, content) => `
<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f9fafb; margin: 0; }
  .wrap { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .header { background: ${B}; padding: 28px 32px; }
  .header h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
  .header p { color: rgba(255,255,255,0.65); margin: 4px 0 0; font-size: 13px; }
  .body { padding: 32px; color: #374151; }
  .body p { line-height: 1.7; margin: 0 0 16px; font-size: 14px; }
  .btn { display: inline-block; background: ${B}; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 8px; }
  .info-box { background: #f3f4f6; border-radius: 10px; padding: 20px 24px; margin: 20px 0; }
  .info-box p { margin: 6px 0; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: #f9fafb; padding: 10px 12px; text-align: left; font-size: 12px; color: #6b7280; border-bottom: 1px solid #e5e7eb; }
  td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
  .footer { background: #f9fafb; padding: 20px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
</style></head><body>
<div class="wrap">
  <div class="header"><h1>DermaFlow</h1><p>${title}</p></div>
  <div class="body">${content}</div>
  <div class="footer">DermaFlow · Premium Skincare · support@dermaflow.in<br>
  <a href="${URL}/dashboard" style="color: ${B}">Manage Preferences</a></div>
</div></body></html>`;

// Safe send function using Brevo API
const safeSend = async (to, subject, html, senderName = SENDER_NAME, senderEmail = SENDER_EMAIL) => {
  if (!process.env.BREVO_API_KEY) {
    console.log('⚠️ BREVO_API_KEY not configured. Email not sent.');
    return false;
  }

  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { name: senderName, email: senderEmail };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    const data = await transactionalEmailApi.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent to ${to}. Message ID: ${data.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    return false;
  }
};

// Low stock alert to staff
const sendLowStockAlertToStaff = async (adminEmail, product, currentStock, threshold) => {
  return await safeSend(
    adminEmail,
    `⚠️ LOW STOCK ALERT: ${product.name}`,
    shell('⚠️ Low Stock Alert - Action Required', `
      <p><strong>Immediate attention required!</strong></p>
      <div class="info-box" style="background:#fee2e2; border-color:#fecaca;">
        <p><strong>Product:</strong> ${product.name}</p>
        <p><strong>SKU:</strong> ${product.sku || 'N/A'}</p>
        <p><strong style="color:#dc2626;">Current Stock:</strong> ${currentStock} units</p>
        <p><strong>Critical Threshold:</strong> ${threshold} units</p>
        <p><strong>Recommended Action:</strong> Place reorder immediately</p>
      </div>
      <a href="${URL}/api/scm/dashboard" class="btn">Go to SCM Dashboard</a>
      <p style="margin-top:20px; font-size:12px; color:#6b7280;">This alert was triggered automatically by the stock monitoring system.</p>
    `),
    'DermaFlow SCM Alert'
  );
};

// Welcome email
const sendWelcomeEmail = async (email, name, voucherCode) => {
  const code = voucherCode || `WELCOME${Math.floor(Math.random() * 10000)}`;
  await safeSend(
    email,
    `Welcome to DermaFlow, ${name}!`,
    shell('Your skincare journey begins', `
      <p>Hi <strong>${name}</strong>,</p>
      <p>Welcome to DermaFlow! We're so excited to help you build a skincare routine that actually works for your skin.</p>
      <div class="info-box" style="background:#fef3c7; border: 1px solid #fde68a; text-align:center;">
        <p style="font-size:12px; color:#92400e; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px;">Your Welcome Gift</p>
        <p style="font-size:28px; font-weight:900; letter-spacing:0.15em; color:${B}; margin:0;">${code}</p>
        <p style="font-size:13px; color:#78350f; margin-top:6px; margin-bottom:0;">15% OFF your first order · Min spend ₹999 · Valid 30 days</p>
      </div>
      <p>Start by taking our free skin quiz — it takes just 2 minutes and recommends your perfect AM/PM routine.</p>
      <a href="${URL}/quiz" class="btn">Take the Skin Quiz</a>
    `)
  );
  return code;
};

// Order confirmation
const sendOrderConfirmation = async (email, name, order) => {
  const rows = (order.items || []).map(i => `
    <tr>
      <td style="padding: 10px 12px;">${i.name}</td>
      <td style="padding: 10px 12px; text-align:center">${i.quantity}</td>
      <td style="padding: 10px 12px; text-align:right">₹${(i.price || 0).toLocaleString('en-IN')}</td>
      <td style="padding: 10px 12px; text-align:right; font-weight:600">₹${((i.price || 0) * i.quantity).toLocaleString('en-IN')}</td>
    </tr>`).join('');
  
  await safeSend(
    email,
    `Order Confirmed — #${order.orderNumber}`,
    shell('Your order is confirmed', `
      <p>Hi <strong>${name}</strong>, your order has been placed successfully!</p>
      <div class="info-box">
        <p><strong>Order:</strong> ${order.orderNumber}</p>
        <p><strong>Date:</strong> ${new Date(order.orderDate || Date.now()).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
      </div>
      <table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="info-box" style="text-align:right">
        <p><strong>Subtotal:</strong> ₹${(order.totalAmount || 0).toLocaleString('en-IN')}</p>
        <p><strong>GST (18%):</strong> ₹${(order.taxAmount || 0).toLocaleString('en-IN')}</p>
        <p><strong>Shipping:</strong> ${order.shippingAmount === 0 ? 'Free' : '₹' + (order.shippingAmount || 0).toLocaleString('en-IN')}</p>
        <p style="font-size:16px;"><strong>Grand Total:</strong> ₹${(order.grandTotal || 0).toLocaleString('en-IN')}</p>
      </div>
      <a href="${URL}/dashboard" class="btn">Track Your Order</a>
    `)
  );
  return true;
};

// Order shipped
const sendOrderShipped = async (email, name, order, trackingNumber) => {
  await safeSend(
    email,
    `Your order #${order.orderNumber} has shipped!`,
    shell('Your order is on its way', `
      <p>Hi <strong>${name}</strong>, great news — your order has been dispatched!</p>
      <div class="info-box">
        <p><strong>Order:</strong> ${order.orderNumber}</p>
        ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
        <p><strong>Estimated Delivery:</strong> 3–5 business days</p>
      </div>
      <a href="${URL}/dashboard" class="btn">View Order Details</a>
    `)
  );
  return true;
};

// Order delivered + review request
const sendOrderDelivered = async (email, name, order) => {
  const productLinks = (order.items || []).map(i =>
    `<p style="margin:8px 0;"><a href="${URL}/product/${i.product}?review=1" style="color:${B}; font-weight:600; text-decoration:none;">${i.name} — Write a Review</a></p>`
  ).join('');
  
  await safeSend(
    email,
    `Order delivered! How are your products?`,
    shell('Your order has been delivered', `
      <p>Hi <strong>${name}</strong>, your order #${order.orderNumber} has been delivered!</p>
      <p>We hope you love your products. Your honest review helps thousands of other customers — and you earn <strong>25 Glow Points</strong> for every review you write.</p>
      <div class="info-box">
        <p style="font-weight:700; margin-bottom:12px; font-size:13px; text-transform:uppercase; letter-spacing:0.04em; color:#6b7280;">Review your products</p>
        ${productLinks}
      </div>
      <a href="${URL}/dashboard" class="btn">Go to Dashboard</a>
    `)
  );
  return true;
};

// Loyalty tier upgrade
const sendTierUpgrade = async (email, name, newTier, points) => {
  const TIER_MSG = {
    silver:   'You now get free shipping on all orders above ₹499, plus early access to new launches.',
    gold:     'You now get priority support, exclusive member pricing, and a free birthday gift.',
    platinum: 'The highest tier! Enjoy VIP support, maximum discounts, and an exclusive welcome kit.',
  };
  
  await safeSend(
    email,
    `You've reached ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} status!`,
    shell(`Congratulations — ${newTier.toUpperCase()} Member`, `
      <p>Hi <strong>${name}</strong>, you've unlocked a new loyalty tier!</p>
      <div class="info-box" style="text-align:center; background: #fef3c7; border:1px solid #fde68a;">
        <p style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:#92400e; margin-bottom:4px;">New Tier</p>
        <p style="font-size:28px; font-weight:900; color:${B}; margin:0 0 6px; text-transform:uppercase;">${newTier}</p>
        <p style="font-size:13px; color:#78350f; margin:0;">${points.toLocaleString('en-IN')} Glow Points</p>
      </div>
      <p>${TIER_MSG[newTier] || 'Keep shopping to unlock more rewards!'}</p>
      <a href="${URL}/dashboard" class="btn">View Your Rewards</a>
    `)
  );
  return true;
};

// Post-purchase feedback (7 days after delivery)
const sendFeedbackRequest = async (email, name, products) => {
  const productList = products.map(p => `<li style="margin:6px 0; font-size:13px;">${p}</li>`).join('');
  
  await safeSend(
    email,
    `How is your skin feeling? We'd love to know`,
    shell('A week in — how are things going?', `
      <p>Hi <strong>${name}</strong>, it's been about a week since your DermaFlow products arrived.</p>
      <p>We'd love to hear how your skin is responding. Your feedback helps us improve and helps other customers make better choices.</p>
      <div class="info-box">
        <p style="font-weight:700; font-size:12px; text-transform:uppercase; color:#6b7280; margin-bottom:8px;">Your recent products</p>
        <ul style="margin:0; padding-left:20px;">${productList}</ul>
      </div>
      <a href="${URL}/dashboard" class="btn">Write a Review</a>
    `)
  );
  return true;
};

// Stock alert to supplier
const sendStockAlert = async (supplierEmail, supplierName, product, alert) => {
  await safeSend(
    supplierEmail,
    `Stock Alert — ${product.name} needs restocking`,
    shell('Critical Stock Alert', `
      <p>Dear <strong>${supplierName}</strong>,</p>
      <p>The following product has reached a critical stock level and requires restocking:</p>
      <div class="info-box">
        <p><strong>Product:</strong> ${product.name}</p>
        <p><strong>SKU:</strong> ${product.sku || 'N/A'}</p>
        <p><strong>Current Stock:</strong> ${alert.currentStock} units</p>
        <p><strong>Critical Threshold:</strong> ${alert.criticalThreshold} units</p>
        <p><strong>Recommended Reorder Qty:</strong> ${alert.reorderQuantity} units</p>
      </div>
      <a href="${URL}/admin/scm" class="btn">View SCM Dashboard</a>
    `),
    'DermaFlow SCM'
  );
  return true;
};

// Spin-the-wheel voucher won
const sendSpinVoucher = async (email, name, voucherCode, discount) => {
  await safeSend(
    email,
    `You won ${discount}% OFF — your spin reward is here!`,
    shell('You spun and won!', `
      <p>Hi <strong>${name}</strong>, congratulations — you won a reward from the DermaFlow spin wheel!</p>
      <div class="info-box" style="background:#fef3c7; border:1px solid #fde68a; text-align:center;">
        <p style="font-size:12px; color:#92400e; font-weight:700; text-transform:uppercase; margin-bottom:8px;">Your Prize</p>
        <p style="font-size:30px; font-weight:900; letter-spacing:0.15em; color:${B}; margin:0;">${voucherCode}</p>
        <p style="font-size:14px; font-weight:700; color:#78350f; margin-top:6px;">${discount}% OFF any order</p>
        <p style="font-size:12px; color:#9ca3af; margin-bottom:0;">Valid for 7 days · Min spend ₹499</p>
      </div>
      <a href="${URL}/products" class="btn">Shop Now</a>
    `)
  );
  return true;
};

// Birthday offer
const sendBirthdayOffer = async (email, name) => {
  const code = `BDAY${Math.floor(Math.random() * 9000) + 1000}`;
  
  await safeSend(
    email,
    `Happy Birthday ${name}! Your special gift inside`,
    shell('Happy Birthday from DermaFlow!', `
      <p>Hi <strong>${name}</strong>, wishing you a wonderful birthday!</p>
      <p>As a special gift from us, here's an exclusive birthday discount just for you:</p>
      <div class="info-box" style="background:#fef3c7;border:1px solid #fde68a;text-align:center;">
        <p style="font-size:12px;color:#92400e;font-weight:700;text-transform:uppercase;margin-bottom:8px;">Your Birthday Gift</p>
        <p style="font-size:28px;font-weight:900;letter-spacing:0.15em;color:${B};margin:0;">${code}</p>
        <p style="font-size:13px;color:#78350f;margin-top:6px;">20% OFF any order · Valid for 7 days</p>
      </div>
      <a href="${URL}/products" class="btn">Treat Yourself</a>
    `)
  );
  return code;
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendOrderShipped,
  sendOrderDelivered,
  sendTierUpgrade,
  sendFeedbackRequest,
  sendStockAlert,
  sendSpinVoucher,
  sendLowStockAlertToStaff,
  sendBirthdayOffer,
};