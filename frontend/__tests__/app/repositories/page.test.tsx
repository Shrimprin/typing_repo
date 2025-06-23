import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosError } from 'axios';

import RepositoriesPage from '@/app/repositories/page';
import { mockAuth } from '../../mocks/auth';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

describe('RepositoriesPage', () => {
  const mockRepositories = [
    {
      id: '1',
      name: 'test-repo-1',
      url: 'https://github.com/test/test-repo-1',
      lastTypedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1日前
      progress: 75.55,
    },
    {
      id: '2',
      name: 'test-repo-2',
      url: 'https://github.com/test/test-repo-2',
      lastTypedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5分前
      progress: 30.54,
    },
    {
      id: '3',
      name: 'test-repo-3',
      url: 'https://github.com/test/test-repo-3',
      lastTypedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1時間前
      progress: 10.0,
    },
    {
      id: '4',
      name: 'test-repo-4',
      url: 'https://github.com/test/test-repo-4',
      lastTypedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1週間前
      progress: 5.0,
    },
    {
      id: '5',
      name: 'test-repo-5',
      url: 'https://github.com/test/test-repo-5',
      lastTypedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1カ月前
      progress: 0.0,
    },
    {
      id: '6',
      name: 'test-repo-6',
      url: 'https://github.com/test/test-repo-6',
      lastTypedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1年前
      progress: 15.0,
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    mockAuth();
    jest.spyOn(axios, 'get').mockResolvedValue({ data: mockRepositories });

    const repositoriesPage = await RepositoriesPage();
    render(repositoriesPage);
  });

  describe('when repositories exists', () => {
    it('calls api', async () => {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/api/repositories`, {
        headers: {
          Authorization: 'Bearer token_1234567890',
          'Content-Type': 'application/json',
        },
      });
    });

    it('renders repositories in descending order of lastTypedAt', async () => {
      const repositoryLinks = screen.getAllByRole('link');

      expect(repositoryLinks.length).toBe(7); // リポジトリ数:6 + 追加ボタン:1
      expect(repositoryLinks[0]).toHaveTextContent('test-repo-2'); // 5分前（最新）
      expect(repositoryLinks[1]).toHaveTextContent('test-repo-3'); // 1時間前
      expect(repositoryLinks[2]).toHaveTextContent('test-repo-1'); // 1日前
      expect(repositoryLinks[3]).toHaveTextContent('test-repo-4'); // 1週間前
      expect(repositoryLinks[4]).toHaveTextContent('test-repo-5'); // 1カ月前
      expect(repositoryLinks[5]).toHaveTextContent('test-repo-6'); // 1年前
    });

    it('renders repository-links with correct href', async () => {
      const repositoryLinks = screen.getAllByRole('link');
      expect(repositoryLinks[0]).toHaveAttribute('href', '/repositories/2');
      expect(repositoryLinks[1]).toHaveAttribute('href', '/repositories/3');
      expect(repositoryLinks[2]).toHaveAttribute('href', '/repositories/1');
      expect(repositoryLinks[3]).toHaveAttribute('href', '/repositories/4');
      expect(repositoryLinks[4]).toHaveAttribute('href', '/repositories/5');
      expect(repositoryLinks[5]).toHaveAttribute('href', '/repositories/6');
    });

    it('renders modal when more-button is clicked', async () => {
      const moreButtons = screen.getAllByRole('button', { name: 'リポジトリの設定メニュー' });
      const firstMoreButton = moreButtons[0];

      await userEvent.click(firstMoreButton);

      expect(screen.getByText('TODO: 設定メニューを開く')).toBeInTheDocument();
    });
  });

  describe('when repositories does not exist', () => {
    // TODO: リポジトリが存在しない場合のテストを追加する
  });
  it('renders repository-add-button in footer', async () => {
    const repositoryAddButton = screen.getByRole('link', { name: 'リポジトリを追加' });

    expect(repositoryAddButton).toBeInTheDocument();
    expect(repositoryAddButton).toHaveAttribute('href', '/repositories/new');
  });

  describe('error handling', () => {
    it('shows error message when occur axios error', async () => {
      jest.spyOn(axios, 'get').mockRejectedValueOnce(new AxiosError('Network Error'));
      const repositoriesPage = await RepositoriesPage();
      render(repositoriesPage);

      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });

    it('shows error message when occur server error', async () => {
      jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Server error'));
      const repositoriesPage = await RepositoriesPage();
      render(repositoriesPage);

      expect(screen.getByText('エラーが発生しました。再度お試しください。')).toBeInTheDocument();
    });
  });
});
