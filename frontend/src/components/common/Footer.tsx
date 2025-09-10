import { Github } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background border-border mt-auto border-t">
      <div className="container mx-auto px-8 py-6">
        <div className="text-md mb-4 flex items-center justify-center gap-8">
          <Link
            href="/terms"
            className={`
              text-muted-foreground decoration-primary/50 underline-offset-4 transition-colors duration-200
              hover:text-foreground hover:underline
            `}
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className={`
              text-muted-foreground decoration-primary/50 underline-offset-4 transition-colors duration-200
              hover:text-foreground hover:underline
            `}
          >
            Privacy Policy
          </Link>
          <Link
            href="https://github.com/Shrimprin/typing_repo"
            target="_blank"
            rel="noopener noreferrer"
            className={`
              text-muted-foreground decoration-primary/50 flex items-center gap-2 underline-offset-4 transition-colors
              duration-200
              hover:text-foreground hover:underline
            `}
          >
            <Github className="h-4 w-4" />
            GitHub
          </Link>
        </div>

        <div className="text-center">
          <span className="text-muted-foreground text-sm">2025 TypingRepo. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
