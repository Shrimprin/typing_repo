import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';

import axios from 'axios';

import RepositoryDetailPage from '@/app/repositories/[id]/page';
import { useParams } from 'next/navigation';
import { mockAuth, mockUseSession } from '../../../mocks/auth';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

const mockRepository = {
  data: {
    id: 1,
    name: 'test-repo',
    lastTypedAt: null,
    userId: 1,
    fileItems: [
      {
        id: 1,
        name: 'file1.ts',
        type: 'file',
        status: 'untyped',
        fileItems: [],
      },
      {
        id: 2,
        name: 'file2.ts',
        type: 'file',
        status: 'typed',
        fileItems: [],
      },
      {
        id: 3,
        name: 'dir1',
        type: 'dir',
        status: 'untyped',
        fileItems: [
          {
            id: 4,
            name: 'nested-file1.ts',
            type: 'file',
            status: 'untyped',
            fileItems: [],
          },
          {
            id: 5,
            name: 'nested-file2.ts',
            type: 'file',
            status: 'untyped',
            fileItems: [],
          },
        ],
      },
      {
        id: 6,
        name: 'dir2',
        type: 'dir',
        status: 'untyped',
        fileItems: [
          {
            id: 7,
            name: 'nested-file3.ts',
            type: 'file',
            status: 'untyped',
            fileItems: [],
          },
        ],
      },
      {
        id: 8,
        name: 'file3.ts',
        type: 'file',
        status: 'untyped',
        fileItems: [],
      },
    ],
  },
};

const mockFileItem = {
  data: {
    id: 4,
    name: 'nested-file1.ts',
    type: 'file',
    status: 'untyped',
    content: 'console.log("Hello, world!");',
    fullPath: 'dir1/nested-file1.ts',
  },
};

describe('RepositoryDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth();
    mockUseSession();
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
  });

  describe('initial state', () => {
    it('render file tree with directories, files order both in alphabetical order', async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce(mockRepository);

      const repositoryDetailPage = await RepositoryDetailPage({ params: { id: '1' } });
      render(repositoryDetailPage);

      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/api/repositories/1`, {
        headers: {
          Authorization: 'Bearer token_1234567890',
          'Content-Type': 'application/json',
        },
      });

      const fileTreeItems = screen.getAllByRole('button');
      expect(fileTreeItems.length).toBe(5);

      expect(fileTreeItems[0].textContent).toContain('dir1');
      expect(fileTreeItems[1].textContent).toContain('dir2');

      expect(fileTreeItems[2].textContent).toContain('file1.ts');
      expect(fileTreeItems[3].textContent).toContain('file2.ts');
      expect(fileTreeItems[4].textContent).toContain('file3.ts');

      expect(screen.queryByRole('button', { name: 'nested-file1.txt' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'nested-file2.txt' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'nested-file3.txt' })).not.toBeInTheDocument();
    });

    it('render typing area with explanatory message', async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce(mockRepository);

      const repositoryDetailPage = await RepositoryDetailPage({ params: { id: '1' } });
      render(repositoryDetailPage);

      expect(screen.getByText('タイピングするファイルを選んでください。')).toBeInTheDocument();
    });
  });

  describe('when directory is clicked', () => {
    it('render children of directory', async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce(mockRepository);

      const repositoryDetailPage = await RepositoryDetailPage({ params: { id: '1' } });
      render(repositoryDetailPage);

      const dir1 = screen.getByRole('button', { name: 'dir1' });
      await act(async () => {
        fireEvent.click(dir1);
      });

      expect(screen.getByRole('button', { name: 'nested-file1.ts' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'nested-file2.ts' })).toBeInTheDocument();
    });
  });

  describe('when file is clicked', () => {
    it('render file content and full path', async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce(mockRepository);

      const repositoryDetailPage = await RepositoryDetailPage({ params: { id: '1' } });
      render(repositoryDetailPage);

      const dir1 = screen.getByRole('button', { name: 'dir1' });
      await act(async () => {
        fireEvent.click(dir1);
      });

      jest.spyOn(axios, 'get').mockResolvedValueOnce(mockFileItem);

      const nestedFile1 = screen.getByRole('button', { name: 'nested-file1.ts' });
      await act(async () => {
        fireEvent.click(nestedFile1);
      });

      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/api/repositories/1/file_items/4`, {
        headers: {
          Authorization: 'Bearer token_1234567890',
          'Content-Type': 'application/json',
        },
      });

      expect(screen.getByText('dir1/nested-file1.ts')).toBeInTheDocument();
      expect(screen.getByText('console.log("Hello, world!");')).toBeInTheDocument();
    });
  });
});
