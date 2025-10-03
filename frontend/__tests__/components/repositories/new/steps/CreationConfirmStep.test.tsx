import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

import CreationConfirmStep from '@/components/repositories/new/steps/CreationConfirmStep';
import { Extension, RepositoryPreview, WizardData } from '@/types';
import { clickButton } from '../../../../helpers/interactions';
import { mockUseSession } from '../../../../mocks/auth';

describe('CreationConfirmStep', () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const mockRepositoryPreview: RepositoryPreview = {
    name: 'test-repository',
    url: 'https://github.com/test-username/test-repository',
    extensions: [
      { name: '.tsx', fileCount: 10, isActive: true },
      { name: '.css', fileCount: 5, isActive: true },
      { name: 'no extension', fileCount: 1, isActive: true },
    ],
  };

  const mockSelectedExtensions: Extension[] = [
    { name: '.tsx', fileCount: 10, isActive: true },
    { name: '.css', fileCount: 5, isActive: true },
  ];

  const mockWizardData: WizardData = {
    url: 'https://github.com/test-username/test-repository',
    repositoryPreview: mockRepositoryPreview,
    selectedExtensions: mockSelectedExtensions,
  };

  const setup = (wizardData: WizardData = mockWizardData, isLoading: boolean = false) => {
    const setIsLoading = jest.fn();
    const onBack = jest.fn();
    const onComplete = jest.fn();

    render(
      <CreationConfirmStep
        wizardData={wizardData}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onBack={onBack}
        onComplete={onComplete}
      />,
    );

    return { setIsLoading, onBack, onComplete };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession();
  });

  it('renders repository information', () => {
    setup();

    expect(screen.getByText('Repository')).toBeInTheDocument();
    expect(screen.getByText('test-repository', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('https://github.com/test-username/test-repository')).toBeInTheDocument();
  });

  it('renders selected extensions', () => {
    setup();

    expect(screen.getByText('Selected Extensions')).toBeInTheDocument();
    expect(screen.getByText('.tsx')).toBeInTheDocument();
    expect(screen.getByText('10 files')).toBeInTheDocument();
    expect(screen.getByText('.css')).toBeInTheDocument();
    expect(screen.getByText('5 files')).toBeInTheDocument();
  });

  it('renders confirmation message and action buttons', () => {
    setup();

    expect(screen.getByText('Create repository?')).toBeInTheDocument();
    expect(
      screen.getByText('The repository will be created and you can start typing immediately.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('calls onBack when Back button is clicked', async () => {
    const { onBack } = setup();

    await clickButton('Back');

    expect(onBack).toHaveBeenCalled();
  });

  describe('when loading', () => {
    beforeEach(() => {
      setup(mockWizardData, true);
    });

    it('disables buttons', () => {
      expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
    });

    it('shows loading spinner', () => {
      expect(screen.getByRole('button', { name: 'Create' })).toContainElement(document.querySelector('.animate-spin')!);
    });
  });

  describe('when Create button is clicked with valid data', () => {
    it('calls api and onComplete', async () => {
      jest.spyOn(axios, 'post').mockResolvedValueOnce({
        data: { id: '10', name: 'test-repository' },
      });
      const { setIsLoading, onComplete } = setup();

      await clickButton('Create');

      expect(setIsLoading).toHaveBeenCalledWith(true);
      expect(axios.post).toHaveBeenCalledWith(
        `${BASE_URL}/api/repositories`,
        {
          repository: {
            url: 'https://github.com/test-username/test-repository',
            extensionsAttributes: [
              { name: '.tsx', isActive: true },
              { name: '.css', isActive: true },
              { name: 'no extension', isActive: false },
            ],
          },
        },
        {
          headers: {
            Authorization: 'Bearer token_1234567890',
            'Content-Type': 'application/json',
          },
        },
      );

      expect(onComplete).toHaveBeenCalledWith('10');
    });
  });

  describe('when error occurs', () => {
    it('shows error message', async () => {
      jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Server error'));
      const { setIsLoading } = setup();

      await clickButton('Create');

      expect(setIsLoading).toHaveBeenCalledWith(true);

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });

      expect(setIsLoading).toHaveBeenCalledWith(false);
    });
  });
});
