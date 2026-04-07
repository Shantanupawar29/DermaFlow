import { useState } from 'react';

const R = '#7B2D3C';

const DOCS = {
  tos: {
    title: 'Terms of Service',
    updated: '1 April 2026',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: `By accessing and using DermaFlow ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. These terms apply to all visitors, users, and others who access or use the service.`,
      },
      {
        heading: '2. Eligibility',
        body: `You must be at least 18 years of age to use DermaFlow. By using our platform, you represent and warrant that you meet this requirement and that you are not barred from receiving services under applicable law.`,
      },
      {
        heading: '3. User Accounts',
        body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access. DermaFlow will not be liable for any losses from unauthorized access to your account.`,
      },
      {
        heading: '4. Products & Orders',
        body: `All product descriptions, pricing, and availability are subject to change without notice. We reserve the right to refuse or cancel any order. In the event of a pricing error, we will contact you before processing your order.`,
      },
      {
        heading: '5. Payment',
        body: `All payments are processed securely through Razorpay. DermaFlow does not store your payment card details. By completing a purchase, you authorize us to charge the applicable amount. All prices are inclusive of GST at 18%.`,
      },
      {
        heading: '6. Returns & Refunds',
        body: `Unused products in original packaging may be returned within 30 days of delivery. Refunds are processed within 7-10 business days to the original payment method. For hygiene reasons, opened skincare products cannot be returned unless defective.`,
      },
      {
        heading: '7. Intellectual Property',
        body: `All content on this platform — including product formulations, images, text, and design — is owned by DermaFlow or its licensors. You may not reproduce, distribute, or create derivative works without express written permission.`,
      },
      {
        heading: '8. Limitation of Liability',
        body: `DermaFlow shall not be liable for indirect, incidental, or consequential damages arising from your use of the platform. Our liability is limited to the amount paid for the specific product or service giving rise to the claim.`,
      },
      {
        heading: '9. Governing Law',
        body: `These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra. The Indian Consumer Protection Act 2019 applies to all consumer transactions.`,
      },
      {
        heading: '10. Changes to Terms',
        body: `We reserve the right to modify these terms at any time. Changes take effect upon posting. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify registered users via email of significant changes.`,
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    updated: '1 April 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        body: `We collect information you provide (name, email, shipping address, phone), transaction data (order history, payment amounts — NOT card numbers), behavioral data (pages visited, quiz responses, products viewed), and technical data (IP address, device type, browser).`,
      },
      {
        heading: '2. How We Use Your Data',
        body: `Your data is used to: process and fulfill orders; personalize product recommendations based on your skin type; send order confirmations and delivery updates; analyze aggregate trends to improve the platform; prevent fraud and ensure security. We do NOT sell your personal data to third parties.`,
      },
      {
        heading: '3. Data Storage & Security',
        body: `All data is stored in MongoDB Atlas (encrypted at rest). Passwords are hashed using bcrypt (cost factor 12). API communications use HTTPS/TLS. JWT tokens expire after 7 days. We follow OWASP security guidelines and conduct quarterly security audits.`,
      },
      {
        heading: '4. Third-Party Services',
        body: `We share necessary data with: Razorpay (payment processing — governed by Razorpay's Privacy Policy); Delhivery/Blue Dart (delivery — name, address, phone only); Google Analytics (anonymized traffic data). These partners are contractually bound to protect your data.`,
      },
      {
        heading: '5. Your Rights (DPDP Act 2023)',
        body: `Under India's Digital Personal Data Protection Act 2023, you have the right to: access your personal data; correct inaccurate data; delete your account and data; withdraw consent for data processing; nominate a person to exercise your rights. Contact privacy@dermaflow.in to exercise these rights.`,
      },
      {
        heading: '6. Cookies',
        body: `We use essential cookies (session management, cart persistence), analytical cookies (Google Analytics — anonymized), and preference cookies (your skin type, routine). You can disable analytical cookies in your browser settings without affecting core functionality.`,
      },
      {
        heading: '7. Data Retention',
        body: `Order records are retained for 7 years as required by Indian tax law (GST). Account data is retained until you request deletion. Feedback/review data is retained for 3 years for quality improvement analysis. Anonymized analytics data may be retained indefinitely.`,
      },
      {
        heading: '8. Contact',
        body: `For privacy-related queries: privacy@dermaflow.in | DermaFlow, 4th Floor, Tech Hub, Bandra Kurla Complex, Mumbai 400051. Data Protection Officer: dpo@dermaflow.in`,
      },
    ],
  },
  cookie: {
    title: 'Cookie Policy',
    updated: '1 April 2026',
    sections: [
      {
        heading: 'Essential Cookies',
        body: `auth_token (7 days) — keeps you logged in. cart_data (30 days) — saves your shopping cart. session_id (session) — security session identifier. These cannot be disabled as the site will not function without them.`,
      },
      {
        heading: 'Analytics Cookies',
        body: `_ga, _gid (Google Analytics) — anonymized traffic analysis. These help us understand which pages are most useful and where improvements are needed. You may opt out via browser settings or the Google Opt-Out tool.`,
      },
      {
        heading: 'Preference Cookies',
        body: `skin_type_preference (90 days) — remembers your skin quiz results for personalized recommendations. currency_pref (30 days) — display currency. These improve your experience but are not required.`,
      },
    ],
  },
  refund: {
    title: 'Refund & Return Policy',
    updated: '1 April 2026',
    sections: [
      {
        heading: 'Return Eligibility',
        body: `Returns are accepted within 30 days of delivery. Items must be unused, in original packaging, and accompanied by the original invoice. Opened skincare products cannot be returned unless they are defective or caused an adverse reaction.`,
      },
      {
        heading: 'Refund Process',
        body: `Once we receive and inspect the return, we will notify you by email. Approved refunds are processed within 7-10 business days to the original payment method. For Razorpay payments, refunds appear in 5-7 business days. For COD, refunds are via bank transfer within 10 days.`,
      },
      {
        heading: 'Defective Products',
        body: `If you receive a damaged or defective product, contact us within 48 hours at support@dermaflow.in with your order number and photos. We will arrange a free replacement or full refund at our cost, including return shipping.`,
      },
      {
        heading: 'Non-Returnable Items',
        body: `Opened skincare/haircare products (hygiene), sale/clearance items, and digital products (AI quiz reports) are non-returnable. Gift cards and subscription credits are non-refundable.`,
      },
    ],
  },
};

export default function LegalDashboard() {
  const [active, setActive] = useState('tos');
  const doc = DOCS[active];

  const tabStyle = (k) => ({
    padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 600, textAlign: 'left',
    background: active === k ? R : 'transparent',
    color: active === k ? '#fff' : '#374151',
  });

  return (
    <div className="overflow-x-auto">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>Legal & Policy Documents</h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.3rem' }}>
          All legal documents governing DermaFlow's operations, data handling, and user rights.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Doc list */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {Object.entries(DOCS).map(([k, v]) => (
            <button key={k} onClick={() => setActive(k)} style={tabStyle(k)}>{v.title}</button>
          ))}
        </div>

        {/* Document viewer */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f3f4f6', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#1f2937', margin: 0 }}>DermaFlow — {doc.title}</h2>
              <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: '0.3rem 0 0' }}>Last updated: {doc.updated}</p>
            </div>
            <button onClick={() => window.print()}
              style={{ background: R, color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
              🖨️ Print
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {doc.sections.map((s, i) => (
              <div key={i}>
                <h3 style={{ fontWeight: 700, color: R, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{s.heading}</h3>
                <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.7, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6 }}>
            <strong>DermaFlow Private Limited</strong> · CIN: U74999MH2026PTC000001 · GST: 27AABCD1234E1Z5 ·
            Registered Office: 4th Floor, Tech Hub, Bandra Kurla Complex, Mumbai 400051, Maharashtra, India ·
            support@dermaflow.in · 1800-DERMAFLOW (toll-free)
          </div>
        </div>
      </div>
    </div>
  );
}