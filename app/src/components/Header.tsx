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
    <header className="bg-tertiary/30">
      <div className="mx-6 py-5">
        <nav className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/" className="font-display text-2xl font-semibold text-primary">
            Noseblind
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-10">
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
        </nav>
      </div>
    </header>
  );
}
