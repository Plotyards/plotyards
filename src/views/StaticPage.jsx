"use client";

import { useState } from 'react';
import { apiRequest } from '../lib/api';

const pageContent = {
  about: {
    title: 'About Plotyards',
    intro: 'Plotyards helps buyers, sellers, and brokers work through plot and land decisions with clearer listings, cleaner communication, and fewer blind spots.',
    sections: [
      {
        heading: 'What We Do',
        body: 'We bring plot listings, broker details, location context, and buyer enquiries into one place so people can compare opportunities without chasing scattered information.'
      },
      {
        heading: 'Our Approach',
        body: 'Land buying is a serious decision. We focus on practical listing details, direct contact, verification signals, and a calmer search experience that helps users ask better questions before they visit a site.'
      }
    ]
  },
  privacy: {
    title: 'Privacy Policy - Plotyards',
    intro: 'Welcome to Plotyards. Your privacy matters to us. This policy explains how we collect, use, store, and protect information when you use our website, services, or interact with our platform.',
    updated: 'Last updated: May 21, 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        body: 'We may collect your name, phone number, email address, property details, listing information, location and device information, messages, inquiries, communication records, and payment or business-related details where they apply.'
      },
      {
        heading: '2. How We Use Your Information',
        body: 'We use information to provide and improve our real estate services, connect buyers, sellers, and brokers, verify listings, maintain platform security, send updates or support responses, and improve user experience and marketing.'
      },
      {
        heading: '3. Property Listings and User Content',
        body: 'Any property listing, image, description, or uploaded content remains the responsibility of the user, broker, seller, or property owner who provides it. Users must make sure shared information is accurate, lawful, and valid.'
      },
      {
        heading: '4. Data Protection',
        body: 'We use reasonable security measures to protect personal information from unauthorized access, misuse, or disclosure. No online platform can promise perfect security, so we also encourage users to share only information that is necessary.'
      },
      {
        heading: '5. Sharing of Information',
        body: 'We do not sell personal information. We may share information with verified buyers, brokers, partners, or service providers for business purposes, when required by law, or when needed to prevent fraud, abuse, or security issues.'
      },
      {
        heading: '6. Cookies and Analytics',
        body: 'Our website may use cookies and analytics tools to understand user behavior, improve performance, remember preferences, and provide a better browsing experience.'
      },
      {
        heading: '7. Third-Party Links',
        body: 'Plotyards may contain links to third-party websites or services. Their privacy practices and content are controlled by those third parties, not by Plotyards.'
      },
      {
        heading: '8. User Rights',
        body: 'You may ask us to access your personal data, update or correct information, remove listings or account details, or respond to privacy concerns. We will handle reasonable requests in line with applicable law and platform safety needs.'
      },
      {
        heading: '9. Policy Updates',
        body: 'We may update this Privacy Policy from time to time. Any changes will be reflected on this page with the latest update date.'
      },
      {
        heading: '10. Contact Us',
        body: 'For privacy questions or support, contact the Plotyards Support Team at info@plotyards.com. By using Plotyards, you agree to the terms described in this Privacy Policy.'
      }
    ]
  },
  terms: {
    title: 'Terms of Service - Plotyards',
    intro: 'These terms explain the basic rules for using Plotyards. We wrote them in plain language because property decisions already have enough paperwork.',
    updated: 'Last updated: May 21, 2026',
    sections: [
      {
        heading: 'Use the Platform Honestly',
        body: 'You agree to share accurate information, avoid fake enquiries or misleading listings, and use Plotyards only for lawful property discovery, listing, broker communication, and related services.'
      },
      {
        heading: 'Listings Belong to Their Submitters',
        body: 'Brokers, sellers, and property owners are responsible for the listings, images, prices, approval claims, documents, and descriptions they submit. Plotyards may review, edit visibility, reject, or remove listings that appear incomplete, misleading, abusive, or unlawful.'
      },
      {
        heading: 'Verification Is a Helpful Signal, Not a Legal Guarantee',
        body: 'We try to improve listing quality, but users should independently check title, approvals, RERA status, ownership, zoning, access roads, dues, and local rules before making a payment or signing an agreement.'
      },
      {
        heading: 'Broker and Buyer Communication',
        body: 'When you contact a broker or submit an enquiry, you allow Plotyards to share relevant contact and enquiry details so the conversation can move forward. Users should communicate respectfully and avoid spam, harassment, or pressure tactics.'
      },
      {
        heading: 'Accounts and Security',
        body: 'You are responsible for keeping your login details safe and for activity under your account. If you believe your account has been misused, contact us quickly at info@plotyards.com.'
      },
      {
        heading: 'Payments and Third-Party Services',
        body: 'Some services may involve payments, subscriptions, site visits, or third-party tools. Any payment terms shown at checkout or in a service agreement will apply along with these terms.'
      },
      {
        heading: 'Limitation of Responsibility',
        body: 'Plotyards provides a platform for discovery and communication. We are not a substitute for legal, financial, or property due diligence, and we are not responsible for private deals made outside the platform.'
      },
      {
        heading: 'Changes to These Terms',
        body: 'We may update these terms as the platform grows. Continued use of Plotyards after changes are posted means you accept the updated terms.'
      }
    ]
  },
  refund: {
    title: 'Refund Policy - Plotyards',
    intro: 'This Refund Policy explains how refunds, cancellations, and payment issues are handled for paid broker subscriptions and promotional services on Plotyards.',
    updated: 'Last updated: May 23, 2026',
    sections: [
      {
        heading: '1. Broker Subscription Payments',
        body: 'Premium Plan payments, including the Rs. 5,100 plan for 3 months, are generally non-refundable once the plan is activated, broker approval is granted, or promotional work such as featured visibility, reels, leads support, or social promotion has started.'
      },
      {
        heading: '2. Duplicate or Failed Payments',
        body: 'If you are charged twice, charged after a failed payment, or payment is captured but your Premium Plan is not activated, contact us within 7 days with your registered phone or email and payment details. After verification, eligible refunds will be processed.'
      },
      {
        heading: '3. Cancellation of Active Plans',
        body: 'You may stop using a paid plan at any time, but active subscription fees are not refunded on a partial or prorated basis for the remaining days of the current plan period.'
      },
      {
        heading: '4. Service Delivery Issues',
        body: 'If a paid promotional service is not delivered because of an issue from Plotyards, we may offer a correction, replacement service, plan extension, wallet credit, or refund depending on the situation and internal verification.'
      },
      {
        heading: '5. Non-Refundable Cases',
        body: 'Refunds are not provided for fake listings, misleading property details, policy violations, account suspension caused by user activity, buyer response differences, personal change of mind, or deals made outside the Plotyards platform.'
      },
      {
        heading: '6. Refund Processing Time',
        body: 'Approved refunds are sent to the original payment method and usually take 7 to 10 business days after approval, depending on the bank, payment gateway, or card issuer.'
      },
      {
        heading: '7. Contact for Refund Requests',
        body: 'For refund or payment support, email info@plotyards.com with your registered name, phone number, payment ID, plan name, payment date, and a short explanation of the issue.'
      }
    ]
  },
  faq: {
    title: 'Frequently Asked Questions',
    intro: 'Quick answers for buyers, brokers, and anyone comparing land opportunities on Plotyards.',
    sections: [
      {
        heading: 'How do I search for plots?',
        body: 'Use the search bar to enter a city, locality, project name, approval keyword, or property type. You can also use homepage city cards and listing filters to narrow results.'
      },
      {
        heading: 'Are all listings verified?',
        body: 'We highlight verification signals where available and review listings for quality, but buyers should still verify ownership, approvals, title documents, road access, and local rules before committing.'
      },
      {
        heading: 'How do I contact a broker?',
        body: 'Open a listing and send an enquiry or use the available contact option. The broker receives your details so they can respond with site visit, pricing, and document information.'
      },
      {
        heading: 'Can brokers post properties?',
        body: 'Yes. Brokers can register, submit their profile details, and post properties after the account is approved by the admin team.'
      },
      {
        heading: 'Why is my broker account pending?',
        body: 'Broker approvals help keep the marketplace trustworthy. The admin team may review company details, contact information, and listing behavior before approval.'
      },
      {
        heading: 'Can I save listings?',
        body: 'Yes. Logged-in users can save favourites and revisit previously viewed properties from their account area.'
      },
      {
        heading: 'Who should I email for help?',
        body: 'For help, inquiries, listings, or privacy questions, email the Plotyards support team at info@plotyards.com.'
      }
    ]
  }
};

const contactEmails = [
  ['Plotyards Help & Support', 'info@plotyards.com']
];

const StaticPage = ({ type }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const isContact = type === 'contact';
  const content = pageContent[type] || pageContent.about;

  const submitContact = async (event) => {
    event.preventDefault();
    setSuccess('');
    setError('');
    try {
      await apiRequest('/service/contact', { method: 'POST', body: form });
      setSuccess('Your message has been sent successfully. Our team will contact you soon.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError(err?.message || 'Failed to send message. Please try again or contact info@plotyards.com directly.');
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-32 pb-12">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="rounded-[2rem] border border-border bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold text-text">{isContact ? 'Contact Plotyards' : content.title}</h1>
          {!isContact && content.updated && <p className="mt-2 text-xs font-bold uppercase tracking-wide text-primary">{content.updated}</p>}
          <p className="mt-4 text-sm font-medium leading-7 text-muted">
            {isContact ? 'Tell us what you need. We can help with listings, broker onboarding, visits, approvals, and account questions.' : content.intro}
          </p>

          {isContact ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
              <form onSubmit={submitContact} className="grid gap-4">
                {success && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm font-bold text-rose-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    {error}
                  </div>
                )}
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="rounded-xl border border-gray-200 bg-surface px-4 py-3.5 text-text placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-sm"
                  placeholder="Name"
                  required
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="rounded-xl border border-gray-200 bg-surface px-4 py-3.5 text-text placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-sm"
                  placeholder="Email (optional)"
                />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  className="rounded-xl border border-gray-200 bg-surface px-4 py-3.5 text-text placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-sm"
                  placeholder="Phone"
                  required
                />
                <textarea
                  value={form.message}
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  className="min-h-32 rounded-xl border border-gray-200 bg-surface px-4 py-3.5 text-text placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-sm"
                  placeholder="Message"
                  required
                />
                <button className="rounded-xl bg-primary hover:bg-rose-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-primary/10 hover:shadow-xl transition-all active:scale-95 text-sm">
                  Send Message
                </button>
              </form>
              <div className="rounded-2xl bg-surface p-5">
                <h2 className="text-lg font-extrabold text-text">Email Us</h2>
                <div className="mt-4 grid gap-4">
                  {contactEmails.map(([label, email]) => (
                    <div key={email}>
                      <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
                      <a href={`mailto:${email}`} className="text-sm font-extrabold text-secondary hover:text-primary">{email}</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid gap-5">
              {content.sections.map((section) => (
                <section key={section.heading} className="rounded-2xl border border-border bg-surface p-5">
                  <h2 className="text-lg font-extrabold text-text">{section.heading}</h2>
                  <p className="mt-2 text-sm font-medium leading-7 text-muted">{section.body}</p>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
