import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function RepositoryFooter() {
  return (
    <footer className="sticky bottom-0 w-full border-t bg-white py-4">
      <div className="flex justify-center font-mono">
        <Button variant="outline" asChild>
          <Link href="/repositories/new">
            <Plus /> Add Repository
          </Link>
        </Button>
      </div>
    </footer>
  );
}
