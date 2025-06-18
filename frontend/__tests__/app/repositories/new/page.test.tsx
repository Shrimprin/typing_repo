import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

import NewRepositoryPage from '@/app/repositories/new/page';
import { mockUseSession } from '../../../mocks/auth';
import { clickButton } from '../../../utils/testUtils';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

const inputRepositoryUrlAndSubmit = async (url: string) => {
  const repositoryUrlInput = screen.getByPlaceholderText('https://github.com/username/repository');

  if (url === '') {
    await userEvent.clear(repositoryUrlInput);
  } else {
    await userEvent.type(repositoryUrlInput, url);
  }
  await clickButton('追加');
};

describe('NewRepositoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession();
  });

  it('renders title and description', () => {
    render(<NewRepositoryPage />);

    expect(screen.getByText('リポジトリを追加')).toBeInTheDocument();
    expect(screen.getByText('タイピングしたいGitHubリポジトリのURLを入力してください。')).toBeInTheDocument();
  });

  it('renders form', () => {
    render(<NewRepositoryPage />);

    expect(screen.getByPlaceholderText('https://github.com/username/repository')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
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

      expect(screen.getByText('有効なURLを入力してください')).toBeInTheDocument();
    });

    it('shows error message when submit with empty url', async () => {
      render(<NewRepositoryPage />);

      await inputRepositoryUrlAndSubmit('');

      expect(screen.getByText('URLは必須です')).toBeInTheDocument();
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

      expect(screen.getByText('サーバーエラーが発生しました。')).toBeInTheDocument();
    });
  });
});
