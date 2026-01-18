import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-1 text-white/80">
          <span>Made with</span>
          <Heart className="w-4 h-4 text-secondary fill-secondary" />
          <span>by Noseblind</span>
        </div>
      </div>
    </footer>
  );
}
