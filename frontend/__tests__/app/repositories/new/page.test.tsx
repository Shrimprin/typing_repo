import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

import NewRepositoryPage from '@/app/repositories/new/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    ...actualAxios,
    post: jest.fn(),
  };
});

const axiosMock = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('NewRepositoryPage', () => {
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

    axiosMock.post.mockResolvedValueOnce({
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

    const repositoryUrlInput = screen.getByPlaceholderText('https://github.com/username/repository');
    const addButton = screen.getByRole('button', { name: '追加' });

    await act(async () => {
      fireEvent.change(repositoryUrlInput, { target: { value: 'https://github.com/username/repository' } });
      fireEvent.click(addButton);
    });

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

    const repositoryUrlInput = screen.getByPlaceholderText('https://github.com/username/repository');
    const addButton = screen.getByRole('button', { name: '追加' });

    await act(async () => {
      fireEvent.change(repositoryUrlInput, { target: { value: '' } });
      fireEvent.click(addButton);
    });

    expect(screen.getByText('URLは必須です')).toBeInTheDocument();
  });

  it('show error message when occur axios error', async () => {
    axiosMock.post.mockRejectedValueOnce({
      message: 'Network Error',
      name: 'AxiosError',
      code: 'ERR_NETWORK',
      isAxiosError: true,
    } as AxiosError);

    render(<NewRepositoryPage />);

    const repositoryUrlInput = screen.getByPlaceholderText('https://github.com/username/repository');
    const addButton = screen.getByRole('button', { name: '追加' });

    await act(async () => {
      fireEvent.change(repositoryUrlInput, { target: { value: 'https://github.com/username/repository' } });
      fireEvent.click(addButton);
    });

    expect(screen.getByText('Network Error')).toBeInTheDocument();
  });

  it('show error message when occur server error', async () => {
    axiosMock.post.mockRejectedValueOnce(new Error('Server error'));

    render(<NewRepositoryPage />);

    const repositoryUrlInput = screen.getByPlaceholderText('https://github.com/username/repository');
    const addButton = screen.getByRole('button', { name: '追加' });

    await act(async () => {
      fireEvent.change(repositoryUrlInput, { target: { value: 'https://github.com/username/repository' } });
      fireEvent.click(addButton);
    });

    expect(screen.getByText('サーバーエラーが発生しました。')).toBeInTheDocument();
  });
});
