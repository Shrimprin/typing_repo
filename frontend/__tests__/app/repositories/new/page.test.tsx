import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

import NewRepositoryPage from '@/app/repositories/new/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  post: jest.fn(),
}));

describe('NewRepositoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('render title and description', () => {
    render(<NewRepositoryPage />);

    expect(screen.getByText('リポジトリを追加')).toBeInTheDocument();
    expect(screen.getByText('タイピングしたいGitHubリポジトリのURLを入力してください。')).toBeInTheDocument();
  });

  it('render form', () => {
    render(<NewRepositoryPage />);

    expect(screen.getByPlaceholderText('https://github.com/username/repository')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
  });

  it('navigate to repository page when submit with valid url', async () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    jest.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        repository: {
          id: 1,
          user_id: 1,
          name: 'repository-name',
          last_typed_at: null,
        },
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
          Authorization: 'Bearer token_1234567890', // TODO: 仮。userのJWTを入れる
          'Content-Type': 'application/json',
        },
      },
    );

    expect(pushMock).toHaveBeenCalledWith('/repositories/1');
  });

  describe('form validation', () => {
    it('show error message when submit invalid url', async () => {
      render(<NewRepositoryPage />);

      const repositoryUrlInput = screen.getByPlaceholderText('https://github.com/username/repository');
      const addButton = screen.getByRole('button', { name: '追加' });

      await act(async () => {
        fireEvent.change(repositoryUrlInput, { target: { value: 'invalid-url' } });
        fireEvent.click(addButton);
      });

      expect(screen.getByText('有効なURLを入力してください')).toBeInTheDocument();
    });

    it('show error message when submit with empty url', async () => {
      render(<NewRepositoryPage />);

      await inputRepositoryUrlAndSubmit('');
      expect(screen.getByText('URLは必須です')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('show error message when occur axios error', async () => {
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

    it('show error message when occur server error', async () => {
      jest.spyOn(axios, 'post').mockRejectedValueOnce(new Error('Server error'));

      render(<NewRepositoryPage />);

      await inputRepositoryUrlAndSubmit('https://github.com/username/repository');
      expect(screen.getByText('サーバーエラーが発生しました。')).toBeInTheDocument();
    });
  });
});

const inputRepositoryUrlAndSubmit = async (url: string) => {
  const repositoryUrlInput = screen.getByPlaceholderText('https://github.com/username/repository');
  const addButton = screen.getByRole('button', { name: '追加' });

  await act(async () => {
    fireEvent.change(repositoryUrlInput, { target: { value: url } });
    fireEvent.click(addButton);
  });
};
