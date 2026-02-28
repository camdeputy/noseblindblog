import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Noseblind.',
};

const EFFECTIVE_DATE = 'February 28, 2026';

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
          We use <strong>Google Analytics 4</strong> (GA4), a web analytics service provided by
          Google LLC. When you visit this site, GA4 automatically collects:
        </p>
        <ul className="list-disc list-inside mt-3 space-y-1 text-primary/80">
          <li>Pages visited and time spent on each page</li>
          <li>Referring website or search query that brought you here</li>
          <li>General geographic location (country and city, derived from IP address)</li>
          <li>Browser type, operating system, and device category</li>
          <li>A randomly assigned, anonymized identifier stored in a cookie</li>
        </ul>
        <p className="mt-4">
          This data is aggregated and used solely to understand how visitors interact with the site
          (e.g., which pages are most read). We do not use it to identify individual people.
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
            <strong>Legitimate Interests (Article 6(1)(f))</strong> — We use Google Analytics to
            understand how visitors use the Site, identify technical issues, and improve content.
            We have assessed that this use does not override your rights and freedoms, as the data
            is aggregated and anonymized. You have the right to object to this processing at any
            time (see "Your GDPR Rights" below).
          </li>
          <li>
            <strong>Contract Performance (Article 6(1)(b))</strong> — When you submit the contact
            form, we process the information you provide in order to respond to your inquiry.
          </li>
        </ul>
      </Section>

      <Section title="Cookies">
        <p>
          GA4 places first-party cookies in your browser to distinguish sessions and measure
          returning visits. These cookies do not contain your name, email, or any directly
          identifying information. Cookie names used by GA4 typically include{' '}
          <code className="text-sm bg-tertiary/60 px-1 rounded">_ga</code>,{' '}
          <code className="text-sm bg-tertiary/60 px-1 rounded">_ga_*</code>, and{' '}
          <code className="text-sm bg-tertiary/60 px-1 rounded">_gid</code>.
        </p>
        <p className="mt-4">
          <strong>EU/EEA visitors:</strong> Under the GDPR and the ePrivacy Directive, analytics
          cookies are considered non-essential and, in many EU member states, require your prior
          consent before being placed. We process analytics data under our legitimate interests as
          described above. You have the right to object to this processing at any time by using any
          of the opt-out methods below, and we will honor that objection.
        </p>
        <p className="mt-4">
          You can opt out of GA4 tracking at any time by:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-primary/80">
          <li>
            Installing the{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline hover:text-primary transition-colors"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
          </li>
          <li>Disabling cookies in your browser settings</li>
          <li>Using your browser's private / incognito mode</li>
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
            <strong>Google LLC</strong> — processes analytics data on our behalf. Google may
            transfer and store this data on servers in the United States and other countries outside
            the EU/EEA. For transfers from the EU/EEA to the United States, Google relies on the{' '}
            <strong>EU–US Data Privacy Framework</strong> and{' '}
            <strong>Standard Contractual Clauses</strong> as approved transfer mechanisms under
            GDPR Article 46. Google's privacy policy is available at{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline hover:text-primary transition-colors"
            >
              policies.google.com/privacy
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
            Analytics data held by Google is subject to Google's own retention and deletion
            policies; you may use Google's data deletion tools at{' '}
            <a
              href="https://myaccount.google.com/data-and-privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline hover:text-primary transition-colors"
            >
              myaccount.google.com/data-and-privacy
            </a>
            .
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
            analytics tracking. To exercise this right, use the opt-out methods described in the
            Cookies section above, or contact us directly.
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
            delivery. Analytics data held by Google is subject to Google's own retention and
            deletion policies.
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
        <p className="mt-4">
          To exercise your rights, you may opt out of analytics tracking using the Google
          Analytics Opt-out Add-on linked in the Cookies section above. Google's data deletion
          tools are available at{' '}
          <a
            href="https://myaccount.google.com/data-and-privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary underline hover:text-primary transition-colors"
          >
            myaccount.google.com/data-and-privacy
          </a>
          .
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          Analytics data in GA4 is retained for 14 months by default, after which it is
          automatically deleted by Google. We do not store analytics data independently on our
          own servers.
        </p>
        <p className="mt-4">
          Contact form messages are received directly in our inbox and are retained only as long
          as reasonably necessary to respond to your inquiry. We do not store them in any separate
          database.
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
