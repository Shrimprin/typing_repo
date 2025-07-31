'use client';

import axios from 'axios';
import { CheckCircle, ChevronLeftIcon, File, Files, Github, LoaderCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WizardData } from '@/types';
import { axiosPost } from '@/utils/axios';
import RepositoryCard from '../common/RepositoryCard';

type CreationConfirmStepProps = {
  wizardData: WizardData;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onBack: () => void;
  onComplete: (repositoryId: string) => void;
};

export default function CreationConfirmStep({
  wizardData,
  isLoading,
  setIsLoading,
  onBack,
  onComplete,
}: CreationConfirmStepProps) {
  const [errorMessage, setErrorMessage] = useState<string>();
  const { data: session } = useSession();

  const handleCreate = async () => {
    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const accessToken = session?.user?.accessToken;
      const extensions = wizardData.repositoryPreview!.extensions.map((ext) => ({
        name: ext.name,
        is_active: wizardData.selectedExtensions.some((selectedExt) => selectedExt.name === ext.name),
      }));

      const response = await axiosPost('/api/repositories', accessToken, {
        repository: {
          url: wizardData.url,
          extensionsAttributes: extensions,
        },
      });

      onComplete(response.data.id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || 'An error occurred. Please try again.';
        setErrorMessage(message);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Github className="text-muted-foreground h-5 w-5" />
          <h3 className="text-lg font-semibold">Repository</h3>
        </div>
        <RepositoryCard repositoryPreview={wizardData.repositoryPreview!} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Files className="text-muted-foreground h-5 w-5" />
          <h3 className="text-lg font-semibold">Selected Extensions</h3>
        </div>
        <div
          className={`
            grid grid-cols-2 gap-3
            md:grid-cols-3
            lg:grid-cols-4
          `}
        >
          {wizardData.selectedExtensions.map((extension) => (
            <Card key={extension.name} className="p-3">
              <div className="flex items-center gap-2">
                <File className="text-muted-foreground h-4 w-4" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{extension.name}</div>
                  <div className="text-muted-foreground text-xs">{extension.fileCount} files</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="mb-4 flex items-center gap-3">
        <CheckCircle className="text-primary h-5 w-5" />
        <div>
          <p className="font-medium">Create repository?</p>
          <p className="text-muted-foreground text-sm">
            The repository will be created and you can start typing immediately.
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleCreate} variant="primary" disabled={isLoading}>
          {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Create
        </Button>
      </div>
    </div>
  );
}
