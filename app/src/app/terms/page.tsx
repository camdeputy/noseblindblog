import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for Noseblind.',
};

const EFFECTIVE_DATE = 'February 28, 2026';

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl font-semibold text-primary mb-2">Terms of Use</h1>
      <p className="text-xs text-primary/50 mb-12">Effective {EFFECTIVE_DATE}</p>

      <Section title="Acceptance of Terms">
        <p>
          By accessing or using noseblindblog.com (the "Site"), you agree to be bound by these
          Terms of Use. If you do not agree, please do not use the Site.
        </p>
      </Section>

      <Section title="Intellectual Property">
        <p>
          All content on this Site — including fragrance reviews, editorial writing, photographs,
          and original descriptions — is the property of Noseblind and is protected by copyright.
          You may not reproduce, copy, distribute, or create derivative works from any Site content
          without prior written permission.
        </p>
        <p className="mt-4">
          You may share links to individual pages or quote brief excerpts for commentary, criticism,
          or educational purposes, provided you give clear attribution and a link back to the
          original page.
        </p>
      </Section>

      <Section title="Accuracy of Information">
        <p>
          Fragrance reviews, ratings, and descriptions on this Site represent editorial opinions
          and are not professional or scientific assessments. Fragrance pricing, availability, and
          formulations may change without notice. Noseblind makes no representations or warranties
          regarding the accuracy, completeness, or timeliness of any information on this Site.
        </p>
      </Section>

      <Section title="Affiliate Links">
        <p>
          Some pages on this Site may contain affiliate links — links to third-party retailers
          through which Noseblind may earn a commission if you make a purchase, at no additional
          cost to you. All affiliate relationships will be clearly disclosed on pages where they
          appear.
        </p>
      </Section>

      <Section title="Third-Party Links">
        <p>
          This Site may link to external websites operated by fragrance brands, retailers, or other
          third parties. Noseblind is not responsible for the content, accuracy, or privacy
          practices of any linked third-party sites. Visiting external links is at your own
          discretion and risk.
        </p>
      </Section>

      <Section title="Contact Form">
        <p>
          If you use the contact form on this Site, you must use it only for legitimate inquiries.
          You may not use the contact form to submit spam, commercial solicitations, harmful
          content, or any communications that violate applicable law.
        </p>
      </Section>

      <Section title="Disclaimer of Warranties">
        <p>
          This Site is provided on an "as is" and "as available" basis, without warranties of any
          kind, express or implied. Noseblind does not warrant that the Site will be uninterrupted,
          error-free, or free of viruses or other harmful components.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          To the fullest extent permitted by applicable law, Noseblind shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages arising from your
          use of, or inability to use, this Site or its content — including any reliance on
          fragrance information, pricing, or editorial opinions published here.
        </p>
      </Section>

      <Section title="Changes to These Terms">
        <p>
          We may update these Terms of Use at any time. Changes become effective when posted to
          this page, and the effective date above will be updated accordingly. Your continued use
          of the Site after any update constitutes your acceptance of the revised terms.
        </p>
      </Section>

      <Section title="EU/EEA Residents – GDPR">
        <p>
          Nothing in these Terms of Use limits or waives any rights you have under the General
          Data Protection Regulation (GDPR) or other applicable EU/EEA data protection law. If
          you are located in the European Union or European Economic Area, your data protection
          rights — including rights of access, erasure, restriction, portability, and the right
          to object — are governed by our{' '}
          <a href="/privacy" className="text-secondary underline hover:text-primary transition-colors">
            Privacy Policy
          </a>{' '}
          and applicable law, not by these Terms of Use.
        </p>
      </Section>

      <Section title="Governing Law">
        <p>
          These Terms of Use are governed by the laws of the State of California, without regard
          to its conflict of law provisions. Any disputes arising under these terms shall be
          subject to the jurisdiction of the courts located in California.
        </p>
        <p className="mt-4">
          If you are located in the European Union or European Economic Area, you may also have
          the right to seek remedies under the laws of your country of residence. These Terms do
          not limit any mandatory consumer protection rights afforded to you by applicable EU/EEA
          law.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          If you have questions about these Terms of Use, please contact us at{' '}
          <a
            href="mailto:anosmic@noseblindblog.com"
            className="text-secondary underline hover:text-primary transition-colors"
          >
            anosmic@noseblindblog.com
          </a>
          .
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
