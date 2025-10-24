import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function RepositoryFooter() {
  return (
    <footer className="bg-background sticky bottom-0 w-full border-t py-4">
      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/repositories/new">
            <Plus /> Add Repository
          </Link>
        </Button>
      </div>
    </footer>
  );
}
