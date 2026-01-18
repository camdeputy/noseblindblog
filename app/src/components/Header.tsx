'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/posts', label: 'Posts' },
    { href: '/scent-library', label: 'Scent Library' },
    { href: '/about', label: 'About' },
  ];

  const isActive = (href: string) => {
    if (href === '/posts') return pathname === '/' || pathname.startsWith('/posts');
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white border-b border-tertiary/50">
      <div className="max-w-6xl mx-auto px-6 py-5">
        <nav className="flex items-center gap-12">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="relative">
              <svg
                viewBox="0 0 32 32"
                className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-105"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 4C12 4 9 8 9 13C9 18 12 22 16 28C20 22 23 18 23 13C23 8 20 4 16 4Z" />
                <circle cx="16" cy="13" r="3" />
              </svg>
            </div>
            <span className="text-2xl font-display font-semibold tracking-tight text-primary">
              Noseblind
            </span>
          </Link>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative py-1 text-sm font-medium tracking-wide uppercase
                  transition-colors duration-200
                  ${isActive(item.href)
                    ? 'text-primary'
                    : 'text-primary/50 hover:text-primary'
                  }
                `}
              >
                {item.label}
                <span
                  className={`
                    absolute -bottom-1 left-0 h-0.5 bg-secondary
                    transition-all duration-300 ease-out
                    ${isActive(item.href) ? 'w-full' : 'w-0'}
                  `}
                />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
