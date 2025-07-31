import { Card } from '@/components/ui/card';
import { RepositoryPreview } from '@/types';
import { Github } from 'lucide-react';

type RepositoryCardProps = {
  repositoryPreview: RepositoryPreview;
};

export default function RepositoryCard({ repositoryPreview }: RepositoryCardProps) {
  return (
    <Card className="p-4" variant="interactive">
      <a href={repositoryPreview.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3">
        <Github className="text-muted-foreground h-5 w-5" />
        <div>
          <span className="font-medium">{repositoryPreview.name}</span>
          <p className="text-muted-foreground text-sm">{repositoryPreview.url}</p>
        </div>
      </a>
    </Card>
  );
}
