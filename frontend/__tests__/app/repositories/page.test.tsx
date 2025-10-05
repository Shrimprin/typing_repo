import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import axios from 'axios';

import RepositoriesPage from '@/app/repositories/page';
import { mockAuth } from '../../mocks/auth';

const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}));

describe('RepositoriesPage', () => {
  const mockRepositoriesData = [
    {
      id: '1',
      name: 'test-repo-1',
      url: 'https://github.com/test/test-repo-1',
      fileItems: [],
      lastTypedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1日前
      progress: 75.55,
    },
    {
      id: '2',
      name: 'test-repo-2',
      url: 'https://github.com/test/test-repo-2',
      fileItems: [],
      lastTypedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5分前
      progress: 30.54,
    },
    {
      id: '3',
      name: 'test-repo-3',
      url: 'https://github.com/test/test-repo-3',
      fileItems: [],
      lastTypedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1時間前
      progress: 10.0,
    },
    {
      id: '4',
      name: 'test-repo-4',
      url: 'https://github.com/test/test-repo-4',
      fileItems: [],
      lastTypedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1週間前
      progress: 5.0,
    },
    {
      id: '5',
      name: 'test-repo-5',
      url: 'https://github.com/test/test-repo-5',
      fileItems: [],
      lastTypedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1カ月前
      progress: 0.0,
    },
    {
      id: '6',
      name: 'test-repo-6',
      url: 'https://github.com/test/test-repo-6',
      fileItems: [],
      lastTypedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1年前
      progress: 15.0,
    },
  ];

  const renderRepositoriesPage = async (searchParams = {}) => {
    const repositoriesPage = await RepositoriesPage({ searchParams: Promise.resolve(searchParams) });
    render(repositoriesPage);
  };

  const getRepositoryLinks = () => {
    const allLinks = screen.getAllByRole('link');
    return allLinks.filter(
      (link) => link.getAttribute('href')?.startsWith('/repositories/') && !link.getAttribute('href')?.includes('new'),
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth();
  });

  describe('when repositories exist', () => {
    beforeEach(async () => {
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: mockRepositoriesData,
        headers: {
          'current-page': '1',
          'total-pages': '1',
          'total-count': '6',
          'page-items': '10',
        },
      });
      await renderRepositoriesPage();
    });

    it('calls api with correct URL for first page', async () => {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/api/repositories?page=1`, {
        headers: {
          Authorization: 'Bearer token_1234567890',
          'Content-Type': 'application/json',
        },
      });
    });

    it('renders repositories in descending order of lastTypedAt', async () => {
      const repositoryLinks = getRepositoryLinks();

      expect(repositoryLinks.length).toBe(6);
      expect(repositoryLinks[0]).toHaveTextContent('test-repo-2'); // 5分前（最新）
      expect(repositoryLinks[1]).toHaveTextContent('test-repo-3'); // 1時間前
      expect(repositoryLinks[2]).toHaveTextContent('test-repo-1'); // 1日前
      expect(repositoryLinks[3]).toHaveTextContent('test-repo-4'); // 1週間前
      expect(repositoryLinks[4]).toHaveTextContent('test-repo-5'); // 1カ月前
      expect(repositoryLinks[5]).toHaveTextContent('test-repo-6'); // 1年前
    });

    it('renders repository-links with correct href', async () => {
      const repositoryLinks = getRepositoryLinks();

      expect(repositoryLinks[0]).toHaveAttribute('href', '/repositories/2');
      expect(repositoryLinks[1]).toHaveAttribute('href', '/repositories/3');
      expect(repositoryLinks[2]).toHaveAttribute('href', '/repositories/1');
      expect(repositoryLinks[3]).toHaveAttribute('href', '/repositories/4');
      expect(repositoryLinks[4]).toHaveAttribute('href', '/repositories/5');
      expect(repositoryLinks[5]).toHaveAttribute('href', '/repositories/6');
    });

    it('renders more-menu-buttons', async () => {
      const Buttons = screen.getAllByLabelText('more-menu');
      expect(Buttons.length).toBe(6);
    });
  });

  describe('when multiple pages exist', () => {
    const generateMockRepositories = (count: number) => {
      return Array.from({ length: count }, (_, index) => ({
        id: String(index + 1),
        name: `test-repo-${index + 1}`,
        url: `https://github.com/test/test-repo-${index + 1}`,
        fileItems: [],
        lastTypedAt: null,
        progress: 0,
      }));
    };

    beforeEach(async () => {
      const firstPageMockRepositoriesData = generateMockRepositories(10);
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: firstPageMockRepositoriesData,
        headers: {
          'current-page': '1',
          'total-pages': '2',
          'total-count': '15',
          'page-items': '10',
        },
      });
      await renderRepositoriesPage({ page: '1' });
    });

    it('renders pagination UI when multiple pages exist', () => {
      const paginationContainer = screen.getByRole('navigation', { name: 'pagination' });
      expect(paginationContainer).toBeInTheDocument();
    });

    it('renders page number links correctly', () => {
      const page1Link = screen.getByRole('link', { name: '1' });
      const page2Link = screen.getByRole('link', { name: '2' });

      expect(page1Link).toHaveAttribute('href', '/repositories?page=1');
      expect(page2Link).toHaveAttribute('href', '/repositories?page=2');
    });

    it('renders navigation buttons', () => {
      const nextButton = screen.getByLabelText('Go to next page');
      expect(nextButton).toHaveAttribute('href', '/repositories?page=2');
      expect(nextButton).not.toHaveClass('pointer-events-none');

      const prevButton = screen.getByLabelText('Go to previous page');
      expect(prevButton).toHaveAttribute('href', '#');
      expect(prevButton).toHaveClass('pointer-events-none');
    });
  });

  describe('when repositories does not exist', () => {
    beforeEach(async () => {
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: [],
        headers: {
          'current-page': '1',
          'total-pages': '1',
          'total-count': '0',
          'page-items': '10',
        },
      });
      await renderRepositoriesPage();
    });

    it('renders empty state', async () => {
      expect(screen.getByRole('heading', { level: 3, name: 'No repositories' })).toBeInTheDocument();
      expect(screen.getByText('Add a repository to start typing.')).toBeInTheDocument();
      const repositoryAddLinks = screen.getAllByRole('link', { name: 'Add Repository' });
      expect(repositoryAddLinks.length).toBe(2); // リポジトリ0件の表示: 1 + フッター: 1
      expect(repositoryAddLinks[0]).toHaveAttribute('href', '/repositories/new');
    });

    it('does not render pagination UI', () => {
      expect(screen.queryByRole('navigation', { name: 'pagination' })).not.toBeInTheDocument();
    });
  });

  it('renders repository-add-button in footer', async () => {
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: mockRepositoriesData,
      headers: {
        'current-page': '1',
        'total-pages': '2',
        'total-count': '15',
        'page-items': '10',
      },
    });
    await renderRepositoriesPage();

    const repositoryAddButton = screen.getByRole('link', { name: 'Add Repository' });

    expect(repositoryAddButton).toBeInTheDocument();
    expect(repositoryAddButton).toHaveAttribute('href', '/repositories/new');
  });

  describe('when error occurs', () => {
    it('shows error message', async () => {
      jest.spyOn(axios, 'get').mockRejectedValueOnce(new Error('Server error'));
      await renderRepositoriesPage();

      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });
});
