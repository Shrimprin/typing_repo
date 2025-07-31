'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { WizardData, WizardStep } from '@/types';
import CreationConfirmStep from './steps/CreationConfirmStep';
import ExtensionSelectionStep from './steps/ExtensionSelectionStep';
import UrlInputStep from './steps/UrlInputStep';

const stepsInfo: { key: WizardStep; title: string; description: string }[] = [
  {
    key: 'url',
    title: 'Step 1: Repository URL',
    description: 'Enter the GitHub repository URL.',
  },
  {
    key: 'extension',
    title: 'Step 2: Extensions',
    description: 'Select the extensions you want to type.',
  },
  {
    key: 'confirm',
    title: 'Step 3: Confirm & Create',
    description: 'Review the settings and create the repository.',
  },
];

export default function RepositoryCreationWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('url');
  const [wizardData, setWizardData] = useState<WizardData>({
    url: '',
    selectedExtensions: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getCurrentStepIndex = () => stepsInfo.findIndex((stepInfo) => stepInfo.key === currentStep);

  const handleNext = (data: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));

    const currentStepIndex = getCurrentStepIndex();
    if (currentStepIndex < stepsInfo.length - 1) {
      setCurrentStep(stepsInfo[currentStepIndex + 1].key);
    }
  };

  const handleBack = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(stepsInfo[currentIndex - 1].key);
    }
  };

  const handleComplete = async (repositoryId: string) => {
    router.push(`/repositories/${repositoryId}`);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'url':
        return (
          <UrlInputStep
            initialUrl={wizardData.url}
            onNext={handleNext}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
      case 'extension':
        return (
          <ExtensionSelectionStep
            repositoryPreview={wizardData.repositoryPreview!}
            initialSelectedExtensions={wizardData.selectedExtensions}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 'confirm':
        return (
          <CreationConfirmStep
            wizardData={wizardData}
            onBack={handleBack}
            onComplete={handleComplete}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        );
      default:
        return null;
    }
  };

  const currentStepIndex = getCurrentStepIndex();
  const currentStepInfo = stepsInfo[currentStepIndex];
  const progress = ((currentStepIndex + 1) / stepsInfo.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentStepInfo.title}</CardTitle>
              <CardDescription>{currentStepInfo.description}</CardDescription>
            </div>
            <div className="text-muted-foreground text-sm">
              {currentStepIndex + 1} / {stepsInfo.length}
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>{renderCurrentStep()}</CardContent>
      </Card>
    </div>
  );
}
