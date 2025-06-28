import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

import NewRepositoryPage from '@/app/repositories/new/page';
import { mockUseSession } from '../../../mocks/auth';
import { clickButton } from '../../../utils/testUtils';

const inputRepositoryUrlAndSubmit = async (url: string) => {
  const repositoryUrlInput = screen.getByPlaceholderText('https://github.com/username/repository');

  if (url === '') {
    await userEvent.clear(repositoryUrlInput);
  } else {
    await userEvent.type(repositoryUrlInput, url);
  }
  await clickButton('Add Repository');
};

describe('NewRepositoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession();
  });

  it('renders title and description', () => {
    render(<NewRepositoryPage />);

    expect(screen.getByText('New Repository')).toBeInTheDocument();
    expect(screen.getByText('Enter the URL of the GitHub repository you want to type.')).toBeInTheDocument();
  });

  it('renders form', () => {
    render(<NewRepositoryPage />);

    expect(screen.getByPlaceholderText('https://github.com/username/repository')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Repository' })).toBeInTheDocument();
  });

  it('navigates to repository page when submit with valid url', async () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        id: 1,
        userId: 1,
        name: 'repository-name',
        lastTypedAt: null,
      },
    });

    render(<NewRepositoryPage />);

    await inputRepositoryUrlAndSubmit('https://github.com/username/repository');

    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    expect(axios.post).toHaveBeenCalledWith(
      `${BASE_URL}/api/repositories`,
      {
        repository: { url: 'https://github.com/username/repository' },
      },
      {
        headers: {
          Authorization: 'Bearer token_1234567890',
          'Content-Type': 'application/json',
        },
      },
    );

    expect(pushMock).toHaveBeenCalledWith('/repositories/1');
  });

  describe('form validation', () => {
    it('shows error message when submit invalid url', async () => {
      render(<NewRepositoryPage />);

      await inputRepositoryUrlAndSubmit('invalid-url');

      expect(screen.getByText('Enter a valid URL')).toBeInTheDocument();
    });

    it('shows error message when submit with empty url', async () => {
      render(<NewRepositoryPage />);

      await inputRepositoryUrlAndSubmit('');

      expect(screen.getByText('URL is required')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('shows error message when occur axios error', async () => {
      jest.spyOn(axios, 'post').mockRejectedValueOnce({
        message: 'Network Error',
        name: 'AxiosError',
        code: 'ERR_NETWORK',
        isAxiosError: true,
      } as AxiosError);

      render(<NewRepositoryPage />);

      await inputRepositoryUrlAndSubmit('https://github.com/username/repository');

      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });

    it('shows error message when occur server error', async () => {
      jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Server error'));
      render(<NewRepositoryPage />);

      await inputRepositoryUrlAndSubmit('https://github.com/username/repository');

      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
    });
  });
});
