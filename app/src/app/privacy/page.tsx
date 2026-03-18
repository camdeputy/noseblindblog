import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Noseblind.',
};

const EFFECTIVE_DATE = 'March 18, 2026';

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-primary mb-2">Privacy Policy</h1>
      <p className="text-xs text-primary/50 mb-12">Effective {EFFECTIVE_DATE}</p>

      <Section title="Overview">
        <p>
          Noseblind ("we", "us", or "our") operates noseblindblog.com (the "Site") as a fragrance
          blog and catalog. This policy explains what information is collected when you visit, how
          it is used, your rights regarding that information, and the legal basis on which we
          process it. We do not sell your personal information.
        </p>
        <p className="mt-4">
          <strong>Data Controller:</strong> Noseblind is the data controller for personal
          information collected through this Site. You can reach us at{' '}
          <a
            href="mailto:anosmic@noseblindblog.com"
            className="text-secondary underline hover:text-primary transition-colors"
          >
            anosmic@noseblindblog.com
          </a>
          .
        </p>
      </Section>

      <Section title="Information We Collect">
        <p>
          When you use the contact form on this Site, we collect the name, email address, and
          message content you provide. This information is transmitted via{' '}
          <strong>EmailJS</strong> directly to our inbox and is not stored in any database. It
          is used solely to respond to your inquiry.
        </p>
        <p className="mt-4">
          We use <strong>Vercel Analytics</strong> and <strong>Vercel Speed Insights</strong>,
          services provided by Vercel, Inc., our hosting provider. These tools collect:
        </p>
        <ul className="list-disc list-inside mt-3 space-y-1 text-primary/80">
          <li>Pages visited and navigation paths</li>
          <li>Referring website that brought you here</li>
          <li>Country derived from IP address (IP address is not stored)</li>
          <li>Browser type, operating system, and device category</li>
          <li>Core Web Vitals and page load performance metrics (Speed Insights only)</li>
        </ul>
        <p className="mt-4">
          Vercel Analytics and Speed Insights are <strong>cookieless</strong> — they do not place
          any cookies in your browser. Your IP address is used only to derive a country-level
          location and is not retained. This data is aggregated and used solely to understand site
          traffic patterns and identify performance issues.
        </p>
        <p className="mt-4">
          For security purposes, your IP address is temporarily processed when you submit a request
          to our login endpoint. This is used solely to enforce rate limiting and protect the site
          against automated login attempts. Your IP address is not linked to any browsing activity
          or content you view on the Site.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          This Site does not use tracking or analytics cookies. No cookies are placed in your
          browser for advertising, retargeting, or identification purposes.
        </p>
        <p className="mt-4">
          Vercel Analytics and Speed Insights are cookieless and do not require consent under the
          ePrivacy Directive.
        </p>
        <p className="mt-4">
          A session cookie is used solely for the admin area of this Site and is never set for
          ordinary visitors.
        </p>
      </Section>

      <Section title="Legal Basis for Processing (EU/EEA Visitors)">
        <p>
          If you are located in the European Union or European Economic Area, we process your
          personal data under the following legal bases as defined in Article 6 of the General
          Data Protection Regulation (GDPR):
        </p>
        <ul className="list-disc list-inside mt-3 space-y-3 text-primary/80">
          <li>
            <strong>Legitimate Interests (Article 6(1)(f))</strong> — We use Vercel Analytics to
            understand how visitors use the Site, identify technical issues, and improve content.
            As these tools are cookieless and do not retain IP addresses or create individual
            profiles, we have assessed that this use does not override your rights and freedoms.
            You have the right to object to this processing at any time (see "Your GDPR Rights"
            below).
          </li>
          <li>
            <strong>Contract Performance (Article 6(1)(b))</strong> — When you submit the contact
            form, we process the information you provide in order to respond to your inquiry.
          </li>
        </ul>
      </Section>

      <Section title="How Your Information Is Used">
        <p>Information collected through this Site is used exclusively to:</p>
        <ul className="list-disc list-inside mt-3 space-y-1 text-primary/80">
          <li>Respond to inquiries submitted through the contact form</li>
          <li>Understand which content is most valuable to readers</li>
          <li>Identify technical issues such as broken pages</li>
          <li>Improve the overall experience of the site</li>
        </ul>
        <p className="mt-4">
          We do not use any data collected for advertising, retargeting, or any form of profiling.
        </p>
      </Section>

      <Section title="Third-Party Data Processors">
        <p>We work with the following third-party services that may receive data about you:</p>
        <ul className="list-disc list-inside mt-3 space-y-3 text-primary/80">
          <li>
            <strong>Vercel, Inc.</strong> — hosts this Site and provides Vercel Analytics and
            Speed Insights. As our hosting provider, all web traffic passes through Vercel's
            infrastructure. Vercel Analytics collects cookieless, aggregated page-view data;
            Speed Insights collects Core Web Vitals performance metrics. Neither service stores
            your IP address or places cookies. Vercel is headquartered in the United States; for
            transfers from the EU/EEA, Vercel relies on Standard Contractual Clauses as an
            approved transfer mechanism under GDPR Article 46. Vercel's privacy policy is
            available at{' '}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline hover:text-primary transition-colors"
            >
              vercel.com/legal/privacy-policy
            </a>
            .
          </li>
          <li>
            <strong>EmailJS</strong> — processes contact form submissions to deliver your message
            to our inbox. EmailJS does not retain your message content after delivery. Their
            privacy policy is available at{' '}
            <a
              href="https://www.emailjs.com/legal/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline hover:text-primary transition-colors"
            >
              emailjs.com/legal/privacy-policy
            </a>
            .
          </li>
          <li>
            <strong>Upstash, Inc.</strong> — provides a serverless Redis database used exclusively
            for rate limiting on our login endpoint. When a login attempt is made, your IP address
            is transmitted to Upstash and stored for up to 15 minutes to enforce request limits.
            No other personal data is sent to Upstash, and this data is never linked to your
            browsing activity on the Site. Upstash is headquartered in the United States; for
            transfers from the EU/EEA, Upstash relies on Standard Contractual Clauses as an
            approved transfer mechanism under GDPR Article 46. Their privacy policy is available
            at{' '}
            <a
              href="https://upstash.com/static/trust/privacy.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline hover:text-primary transition-colors"
            >
              upstash.com/trust/privacy
            </a>
            .
          </li>
        </ul>
      </Section>

      <Section title="EU/EEA Residents – Your GDPR Rights">
        <p>
          If you are located in the European Union or European Economic Area, the General Data
          Protection Regulation (GDPR) grants you the following rights with respect to your
          personal data:
        </p>
        <ul className="list-disc list-inside mt-3 space-y-3 text-primary/80">
          <li>
            <strong>Right of Access (Article 15)</strong> — You may request a copy of the personal
            data we hold about you and information about how it is processed.
          </li>
          <li>
            <strong>Right to Rectification (Article 16)</strong> — You may request correction of
            inaccurate personal data.
          </li>
          <li>
            <strong>Right to Erasure / "Right to Be Forgotten" (Article 17)</strong> — You may
            request deletion of your personal data where there is no compelling reason for its
            continued processing. Contact form data is not retained by us beyond email delivery.
          </li>
          <li>
            <strong>Right to Restriction of Processing (Article 18)</strong> — You may request
            that we restrict how we use your data in certain circumstances.
          </li>
          <li>
            <strong>Right to Data Portability (Article 20)</strong> — Where processing is based on
            consent or contract, you may request your data in a structured, commonly used,
            machine-readable format.
          </li>
          <li>
            <strong>Right to Object (Article 21)</strong> — You have the right to object at any
            time to processing of your personal data based on our legitimate interests, including
            analytics tracking. To exercise this right, contact us directly.
          </li>
          <li>
            <strong>Right Not to Be Subject to Automated Decision-Making (Article 22)</strong> —
            We do not make any automated decisions about you, including profiling, that produce
            legal or similarly significant effects.
          </li>
        </ul>
        <p className="mt-4">
          To exercise any of the above rights, please contact us at{' '}
          <a
            href="mailto:anosmic@noseblindblog.com"
            className="text-secondary underline hover:text-primary transition-colors"
          >
            anosmic@noseblindblog.com
          </a>
          . We will respond within 30 days. You will not be charged for making a request.
        </p>
        <p className="mt-4">
          <strong>Right to Lodge a Complaint:</strong> If you believe we have not handled your
          personal data in accordance with the GDPR, you have the right to lodge a complaint with
          your local data protection supervisory authority. A list of EU supervisory authorities
          is available at{' '}
          <a
            href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary underline hover:text-primary transition-colors"
          >
            edpb.europa.eu
          </a>
          .
        </p>
      </Section>

      <Section title="California Residents (CCPA)">
        <p>
          If you are a California resident, the California Consumer Privacy Act (CCPA) grants you
          specific rights regarding your personal information:
        </p>
        <ul className="list-disc list-inside mt-3 space-y-1 text-primary/80">
          <li>
            <strong>Right to Know</strong> — You may request details about the categories of
            personal information we collect and how it is used.
          </li>
          <li>
            <strong>Right to Delete</strong> — You may request deletion of personal information
            we have collected. Contact form submissions are not retained by us beyond email
            delivery.
          </li>
          <li>
            <strong>Right to Opt Out of Sale</strong> — We do not sell personal information.
            There is nothing to opt out of.
          </li>
          <li>
            <strong>Right to Non-Discrimination</strong> — Exercising any of the above rights will
            not affect your access to this site.
          </li>
        </ul>
      </Section>

      <Section title="Data Retention">
        <p>
          Contact form messages are received directly in our inbox and are retained only as long
          as reasonably necessary to respond to your inquiry. We do not store them in any separate
          database.
        </p>
        <p className="mt-4">
          IP addresses processed for rate limiting purposes are retained for a maximum of 15
          minutes, after which they are automatically deleted by Upstash.
        </p>
      </Section>

      <Section title="Children's Privacy">
        <p>
          This site is not directed at children under 16 (or under 13 where applicable law permits
          a lower age). We do not knowingly collect any information from children. If you believe
          a child has provided information through this site, please contact us at{' '}
          <a
            href="mailto:anosmic@noseblindblog.com"
            className="text-secondary underline hover:text-primary transition-colors"
          >
            anosmic@noseblindblog.com
          </a>{' '}
          so we can address it promptly.
        </p>
      </Section>

      <Section title="Changes to This Policy">
        <p>
          We may update this policy as the site evolves or as legal requirements change. When we
          do, the effective date at the top of this page will be updated. Material changes will be
          noted here. Continued use of the site after any change constitutes acceptance of the
          updated policy.
        </p>
      </Section>

      <Section title="Contact Us">
        <p>
          If you have questions or concerns about this privacy policy, would like to exercise any
          of your rights, or have a complaint about how we handle your data, please contact us at{' '}
          <a
            href="mailto:anosmic@noseblindblog.com"
            className="text-secondary underline hover:text-primary transition-colors"
          >
            anosmic@noseblindblog.com
          </a>
          . We will respond within 30 days.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl font-semibold text-primary mb-3 pb-2 border-b border-secondary/15">
        {title}
      </h2>
      <div className="text-primary/75 leading-relaxed text-sm">{children}</div>
    </section>
  );
}
