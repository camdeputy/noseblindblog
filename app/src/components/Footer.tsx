export default function Footer() {
  return (
    <footer className="bg-tertiary/30 mt-auto">
      <div className="mx-6 py-6 text-center">
        <p className="font-display text-lg font-semibold text-primary mb-1">Noseblind</p>
        <p className="text-xs text-primary/40">&copy; {new Date().getFullYear()} All Rights Reserved.</p>
      </div>
    </footer>
  );
}
