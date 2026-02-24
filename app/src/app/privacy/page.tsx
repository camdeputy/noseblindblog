import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Noseblind.',
};

const EFFECTIVE_DATE = 'February 24, 2026';

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-primary mb-2">Privacy Policy</h1>
      <p className="text-xs text-primary/50 mb-12">Effective {EFFECTIVE_DATE}</p>

      <Section title="Overview">
        <p>
          Noseblind ("we", "us", or "our") operates this website as a fragrance blog and catalog.
          This policy explains what information is collected when you visit, how it is used, and
          your rights regarding that information. We do not sell your personal information.
        </p>
      </Section>

      <Section title="Information We Collect">
        <p>
          We do not collect any personal information you provide directly — there are no account
          registrations, comment forms, or newsletter sign-ups on this site.
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
          You can opt out of GA4 tracking at any time by installing the{' '}
          <a
            href="https://tools.google.com/dlpage/gaoptout"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary underline hover:text-primary transition-colors"
          >
            Google Analytics Opt-out Browser Add-on
          </a>
          , or by disabling cookies in your browser settings.
        </p>
      </Section>

      <Section title="How Your Information Is Used">
        <p>The analytics data collected is used exclusively to:</p>
        <ul className="list-disc list-inside mt-3 space-y-1 text-primary/80">
          <li>Understand which content is most valuable to readers</li>
          <li>Identify technical issues such as broken pages</li>
          <li>Improve the overall experience of the site</li>
        </ul>
        <p className="mt-4">
          We do not use this data for advertising, retargeting, or any form of profiling.
        </p>
      </Section>

      <Section title="Third-Party Data Processors">
        <p>
          The only third party that receives data about your visit is <strong>Google LLC</strong>,
          which processes analytics data on our behalf under its own privacy policy. Google may
          transfer and store this data on servers located outside your country of residence.
        </p>
        <p className="mt-4">
          Google's privacy policy is available at{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary underline hover:text-primary transition-colors"
          >
            policies.google.com/privacy
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
            we have collected. Note that analytics data held by Google is subject to Google's own
            retention and deletion policies.
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
      </Section>

      <Section title="Children's Privacy">
        <p>
          This site is not directed at children under 13. We do not knowingly collect any
          information from children. If you believe a child has provided information through this
          site, please contact us so we can address it promptly.
        </p>
      </Section>

      <Section title="Changes to This Policy">
        <p>
          We may update this policy as the site evolves. When we do, the effective date at the
          top of this page will be updated. Material changes will be noted here. Continued use
          of the site after any change constitutes acceptance of the updated policy.
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
