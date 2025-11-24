import Link from 'next/link';
import { Logo } from './logo';

export function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-4">
            <Logo />
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Empower AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
            Disclaimer: This assessment is not a diagnosis. Please consult a healthcare professional for clinical advice.
        </p>
      </div>
    </footer>
  );
}
