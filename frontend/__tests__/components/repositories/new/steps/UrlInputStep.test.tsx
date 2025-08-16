import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosError } from 'axios';

import UrlInputStep from '@/components/repositories/new/steps/UrlInputStep';
import { RepositoryPreview } from '@/types/repository-creation';
import { mockUseSession } from '../../../../mocks/auth';
import { clickButton } from '../../../../utils/testUtils';

describe('UrlInputStep', () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const setup = (isLoading: boolean = false) => {
    const onNext = jest.fn();
    const setIsLoading = jest.fn();
    render(
      <UrlInputStep
        initialUrl="https://github.com/username/repository"
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onNext={onNext}
      />,
    );
    return { onNext, setIsLoading };
  };

  const typeUrlAndSubmit = async (value: string) => {
    const input = screen.getByPlaceholderText('https://github.com/username/repository');
    await userEvent.clear(input);
    if (value) {
      await userEvent.type(input, value);
    }
    await clickButton('Next');
  };

  const mockRepositoryPreview: RepositoryPreview = {
    name: 'repository-name',
    url: 'https://github.com/test-username/test-repository',
    extensions: [
      { name: '.tsx', fileCount: 10, isActive: true },
      { name: '.css', fileCount: 5, isActive: true },
      { name: 'no extension', fileCount: 1, isActive: false },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession();
  });

  it('renders label, input and submit button', () => {
    setup();
    expect(screen.getByText('GitHub Repository URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://github.com/username/repository')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  describe('when loading', () => {
    beforeEach(() => {
      setup(true);
    });

    it('disables buttons', () => {
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    });

    it('shows loading spinner', () => {
      expect(screen.getByRole('button', { name: 'Next' })).toContainElement(document.querySelector('.animate-spin')!);
    });
  });
  describe('when submit with valid url', () => {
    it('calls api and onNext with repository preview', async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockRepositoryPreview });
      const { onNext, setIsLoading } = setup();

      await typeUrlAndSubmit('https://github.com/test-username/test-repository');

      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/api/repositories/preview`, {
        headers: {
          Authorization: 'Bearer token_1234567890',
          'Content-Type': 'application/json',
        },
        params: { repository_preview: { url: 'https://github.com/test-username/test-repository' } },
      });

      expect(setIsLoading).toHaveBeenCalledWith(true);

      await waitFor(() => {
        expect(onNext).toHaveBeenCalledWith({
          url: 'https://github.com/test-username/test-repository',
          repositoryPreview: mockRepositoryPreview,
          selectedExtensions: mockRepositoryPreview.extensions,
        });
      });

      expect(setIsLoading).toHaveBeenCalledWith(false);
    });
  });
  describe('form validation', () => {
    it('shows error when url is empty', async () => {
      setup();
      await typeUrlAndSubmit('');
      expect(screen.getByText('URL is required')).toBeInTheDocument();
    });

    it('shows error when url is invalid format', async () => {
      setup();
      await typeUrlAndSubmit('invalid-url');
      expect(screen.getByText('Enter a valid URL')).toBeInTheDocument();
    });

    it('shows error when url is not a valid GitHub repository URL', async () => {
      setup();
      await typeUrlAndSubmit('https://example.com/user/repo');
      expect(screen.getByText('Enter a valid GitHub repository URL')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('shows error message when occur axios error', async () => {
      jest.spyOn(axios, 'get').mockRejectedValueOnce({
        message: 'Network Error',
        name: 'AxiosError',
        code: 'ERR_NETWORK',
        isAxiosError: true,
      } as AxiosError);

      const { setIsLoading } = setup();

      await typeUrlAndSubmit('https://github.com/test-username/test-repository');

      expect(setIsLoading).toHaveBeenCalledWith(true);

      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeInTheDocument();
      });

      expect(setIsLoading).toHaveBeenCalledWith(false);
    });

    it('shows error message when occur server error', async () => {
      jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Server error'));
      const { setIsLoading } = setup();

      await typeUrlAndSubmit('https://github.com/test-username/test-repository');

      expect(setIsLoading).toHaveBeenCalledWith(true);

      await waitFor(() => {
        expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
      });

      expect(setIsLoading).toHaveBeenCalledWith(false);
    });
  });
});
