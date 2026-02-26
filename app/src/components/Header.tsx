'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: '/posts', label: 'Posts' },
    { href: '/scent-library', label: 'Scent Library' },
    { href: '/about', label: 'About' },
  ];

  const isActive = (href: string) => {
    if (href === '/posts') return pathname.startsWith('/posts');
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-tertiary/30 elevated-header">
      <div className="mx-6 py-5">
        <nav className="flex items-center justify-between md:justify-start md:gap-12">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-2xl font-semibold text-primary"
            onClick={() => setMenuOpen(false)}
          >
            Noseblind
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  text-base tracking-wide
                  transition-colors duration-200
                  ${isActive(item.href)
                    ? 'text-primary font-medium'
                    : 'text-primary/50 hover:text-primary'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-primary/60 hover:text-primary transition-colors"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </nav>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-secondary/10 bg-tertiary/60 backdrop-blur-sm">
          <div className="px-6 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`
                  block py-3.5 text-base tracking-wide border-b border-secondary/10 last:border-b-0
                  transition-colors duration-200
                  ${isActive(item.href)
                    ? 'text-primary font-medium'
                    : 'text-primary/50'
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
