import React from 'react';
import { Link, usePathname, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppLegalFooter } from '@/components/AppLegalFooter';
import { BrandLogo } from '@/components/BrandLogo';
import { Text } from '@/components/Themed';

type PublicAction = {
  href: Href;
  label: string;
  variant?: 'primary' | 'secondary';
};

type PublicSiteLayoutProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: PublicAction[];
  children: React.ReactNode;
};

const NAV_ITEMS: { href: Href; path: string; label: string }[] = [
  { href: '/', path: '/', label: 'Home' },
  { href: '/faq', path: '/faq', label: 'FAQ' },
  { href: '/help-support', path: '/help-support', label: 'Support' },
  { href: '/privacy', path: '/privacy', label: 'Privacy' },
  { href: '/terms', path: '/terms', label: 'Terms' },
];

function isActivePath(currentPath: string, href: string) {
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function PublicSiteLayout({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PublicSiteLayoutProps) {
  const pathname = usePathname() || '/';

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.shell}>
        <View style={styles.header}>
          <Link href="/" asChild>
            <Pressable style={styles.brandLink}>
              <BrandLogo size="md" />
            </Pressable>
          </Link>

          <View style={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.path);
              return (
                <Link key={item.path} href={item.href} asChild>
                  <Pressable style={[styles.navLink, active && styles.navLinkActive]}>
                    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        </View>

        <View style={styles.hero}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {actions?.length ? (
            <View style={styles.actions}>
              {actions.map((action) => (
                <Link key={`${action.href}:${action.label}`} href={action.href} asChild>
                  <Pressable
                    style={[
                      styles.actionButton,
                      action.variant === 'secondary' ? styles.actionSecondary : styles.actionPrimary,
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionLabel,
                        action.variant === 'secondary' ? styles.actionSecondaryLabel : styles.actionPrimaryLabel,
                      ]}
                    >
                      {action.label}
                    </Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.body}>{children}</View>

        <View style={styles.footer}>
          <AppLegalFooter style={styles.footerText} />
          <Text style={styles.footerNote}>
            Mobile release is in progress. This site is the public home for support, policies, and launch information.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

export function PublicCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {description ? <Text style={styles.cardDescription}>{description}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F6F8FF',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  shell: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 8,
  },
  brandLink: {
    alignSelf: 'flex-start',
  },
  nav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 10,
  },
  navLink: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navLinkActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  navLabelActive: {
    color: '#FFFFFF',
  },
  hero: {
    marginTop: 28,
    padding: 28,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5FF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '900',
    color: '#0F172A',
    maxWidth: 760,
  },
  description: {
    marginTop: 14,
    fontSize: 18,
    lineHeight: 28,
    color: '#475569',
    maxWidth: 760,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionPrimary: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  actionSecondary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  actionPrimaryLabel: {
    color: '#FFFFFF',
  },
  actionSecondaryLabel: {
    color: '#0F172A',
  },
  body: {
    marginTop: 18,
    gap: 16,
  },
  card: {
    padding: 22,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  cardDescription: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  footer: {
    marginTop: 24,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
  },
  footerNote: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 760,
  },
});
