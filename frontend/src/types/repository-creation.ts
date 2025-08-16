import { Extension } from './extension';

export type RepositoryPreview = {
  name: string;
  url: string;
  extensions: Extension[];
};

export type WizardStep = 'url' | 'extension' | 'confirm';

export type WizardData = {
  url: string;
  repositoryPreview?: RepositoryPreview;
  selectedExtensions: Extension[];
};
