import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-tertiary/30 mt-auto">
      <div className="mx-6 py-6 text-center">
        <p className="font-display text-lg font-semibold text-primary mb-1">Noseblind</p>
        <p className="text-xs text-primary/40">&copy; {new Date().getFullYear()} Noseblind. All Rights Reserved.</p>
        <div className="flex items-center justify-center gap-3 mt-1">
          <Link
            href="/privacy"
            className="text-xs text-primary/40 hover:text-primary/70 transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-primary/20 text-xs">·</span>
          <Link
            href="/terms"
            className="text-xs text-primary/40 hover:text-primary/70 transition-colors"
          >
            Terms of Use
          </Link>
        </div>
      </div>
    </footer>
  );
}
