import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import ExtensionSelectionStep from '@/components/repositories/new/steps/ExtensionSelectionStep';
import { Extension, RepositoryPreview } from '@/types';
import { clickButton, clickCheckboxByText, getCheckboxByText } from '../../../../helpers/interactions';

describe('ExtensionSelectionStep', () => {
  const mockRepositoryPreview: RepositoryPreview = {
    name: 'repository-name',
    url: 'https://github.com/test-username/test-repository',
    extensions: [
      { name: '.tsx', fileCount: 10, isActive: true },
      { name: '.css', fileCount: 5, isActive: true },
      { name: 'no extension', fileCount: 1, isActive: true },
    ],
  };

  const setup = (
    repositoryPreview: RepositoryPreview = mockRepositoryPreview,
    initialSelectedExtensions: Extension[] = mockRepositoryPreview.extensions,
  ) => {
    const onNext = jest.fn();
    const onBack = jest.fn();

    render(
      <ExtensionSelectionStep
        repositoryPreview={repositoryPreview}
        initialSelectedExtensions={initialSelectedExtensions}
        onNext={onNext}
        onBack={onBack}
      />,
    );
    return { onNext, onBack };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders repository name and url', () => {
    setup();

    expect(screen.getByText('repository-name')).toBeInTheDocument();
    expect(screen.getByText('https://github.com/test-username/test-repository')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Select All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deselect All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('renders selected extension counts', () => {
    setup();

    expect(screen.getByText('3 / 3 extensions selected (16 / 16 files)')).toBeInTheDocument();
  });

  it('renders extension checkboxes', () => {
    setup();

    expect(getCheckboxByText('.tsx')).toBeChecked();
    expect(getCheckboxByText('.css')).toBeChecked();
    expect(getCheckboxByText('no extension')).toBeChecked();
  });

  it('selects all and updates counts, enabling Next', async () => {
    setup(mockRepositoryPreview, []);

    expect(screen.getByText('0 / 3 extensions selected (0 / 16 files)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await clickButton('Select All');

    expect(screen.getByText('3 / 3 extensions selected (16 / 16 files)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('deselects all and updates counts, disabling Next', async () => {
    setup();

    expect(screen.getByText('3 / 3 extensions selected (16 / 16 files)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();

    await clickButton('Deselect All');

    expect(screen.getByText('0 / 3 extensions selected (0 / 16 files)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('toggles an extension by clicking the checkbox', async () => {
    setup(mockRepositoryPreview, []);

    await clickCheckboxByText('.tsx');
    expect(screen.getByText('1 / 3 extensions selected (10 / 16 files)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();

    await clickCheckboxByText('.tsx');
    expect(screen.getByText('0 / 3 extensions selected (0 / 16 files)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('calls onBack when Back is clicked', async () => {
    const { onBack } = setup();

    await clickButton('Back');

    expect(onBack).toHaveBeenCalled();
  });

  it('calls onNext with selected extensions when Next is clicked', async () => {
    const { onNext } = setup(mockRepositoryPreview, []);

    await clickCheckboxByText('.tsx');
    await clickCheckboxByText('.css');
    await clickButton('Next');

    expect(onNext).toHaveBeenCalledWith({
      selectedExtensions: [
        { name: '.tsx', fileCount: 10, isActive: true },
        { name: '.css', fileCount: 5, isActive: true },
      ],
    });
  });

  it('shows empty state when no extensions in repository', () => {
    setup({ name: 'repo', url: 'url', extensions: [] } as RepositoryPreview, []);
    expect(screen.getByText('No files found')).toBeInTheDocument();
    expect(screen.getByText('This repository has no files.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
