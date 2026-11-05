import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Hr,
} from '@react-email/components';

interface EmailLayoutProps {
  previewText: string;
  headline: React.ReactNode;
  children: React.ReactNode;
  unsubscribeUrl?: string;
  isEssential?: boolean;
}

export function EmailLayout({
  previewText,
  headline,
  children,
  unsubscribeUrl,
  isEssential = false,
}: EmailLayoutProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hireroom.com';

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Link href={siteUrl} style={logoLinkStyle}>
              <Text style={logoTextStyle}>
                Hire<span style={{ color: '#E11D48', fontStyle: 'italic' }}>Room</span>
              </Text>
            </Link>
          </Section>

          {/* Content Card */}
          <Section style={cardStyle}>
            <Heading style={headingStyle}>{headline}</Heading>
            <div style={contentStyle}>{children}</div>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              HireRoom • Hire by proof, not by resume. Zero external links.
            </Text>
            <Text style={footerSubtextStyle}>
              Need help? Reach our team at{' '}
              <Link href="mailto:hello@hireroom.com" style={footerLinkStyle}>
                hello@hireroom.com
              </Link>
            </Text>
            {!isEssential && unsubscribeUrl && (
              <Text style={unsubscribeTextStyle}>
                Don&apos;t want these notifications?{' '}
                <Link href={unsubscribeUrl} style={footerLinkStyle}>
                  Unsubscribe
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Brand token styles
const mainStyle: React.CSSProperties = {
  backgroundColor: '#FAF8F9',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif',
  padding: '40px 16px',
  color: '#1B1420',
};

const containerStyle: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
};

const headerStyle: React.CSSProperties = {
  marginBottom: '24px',
  textAlign: 'center',
};

const logoLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '26px',
  fontWeight: 'bold',
  color: '#1B1420',
  letterSpacing: '-0.5px',
  margin: 0,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '20px',
  border: '1px solid #E6DFE4',
  padding: '36px 32px',
  boxShadow: '0 4px 20px -2px rgba(27, 20, 32, 0.05)',
};

const headingStyle: React.CSSProperties = {
  fontFamily: 'Georgia, "Instrument Serif", serif',
  fontSize: '26px',
  fontWeight: 'normal',
  color: '#1B1420',
  letterSpacing: '-0.4px',
  margin: '0 0 20px 0',
  lineHeight: '1.25',
};

const contentStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#1B1420',
};

const footerStyle: React.CSSProperties = {
  marginTop: '28px',
  textAlign: 'center',
  padding: '0 16px',
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#5C5464',
  margin: '0 0 6px 0',
};

const footerSubtextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#9A92A0',
  margin: '0 0 6px 0',
};

const footerLinkStyle: React.CSSProperties = {
  color: '#E11D48',
  textDecoration: 'underline',
};

const unsubscribeTextStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#9A92A0',
  margin: '12px 0 0 0',
};

export const buttonPrimaryStyle: React.CSSProperties = {
  backgroundColor: '#1B1420',
  color: '#FFFFFF',
  borderRadius: '9999px',
  padding: '12px 28px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
  textAlign: 'center',
  boxShadow: '0 2px 8px rgba(27, 20, 32, 0.1)',
};
