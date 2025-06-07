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

const clickButton = async (buttonName: string) => {
  const button = screen.getByRole('button', { name: buttonName });
  await act(async () => {
    fireEvent.click(button);
  });
};

describe('RepositoryDetailPage', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockAuth();
    mockUseSession();
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    jest.spyOn(axios, 'get').mockImplementation((url) => {
      if (url.includes('/file_items/')) {
        return Promise.resolve(mockFileItem);
      }
      return Promise.resolve(mockRepository);
    });
    const repositoryDetailPage = await RepositoryDetailPage({ params: Promise.resolve({ id: '1' }) });
    render(repositoryDetailPage);
  });

  describe('initial state', () => {
    it('render file tree with directories, files order both in alphabetical order', async () => {
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
      expect(screen.getByText('タイピングするファイルを選んでください。')).toBeInTheDocument();
    });
  });

  describe('when directory is clicked', () => {
    it('render children of directory', async () => {
      await clickButton('dir1');

      expect(screen.getByRole('button', { name: 'nested-file1.ts' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'nested-file2.ts' })).toBeInTheDocument();
    });
  });

  describe('when file is clicked', () => {
    it('render full path, play button and file content', async () => {
      await clickButton('dir1');
      await clickButton('nested-file1.ts');

      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/api/repositories/1/file_items/4`, {
        headers: {
          Authorization: 'Bearer token_1234567890',
          'Content-Type': 'application/json',
        },
      });

      expect(screen.getByText('dir1/nested-file1.ts')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'PLAY' })).toBeInTheDocument();
      expect(screen.getByText('console.log("Hello, world!");')).toBeInTheDocument();
    });
  });

  describe('start typing', () => {
    const CORRECT_CHARS_COLOR = 'bg-green-100';
    const INCORRECT_CHARS_COLOR = 'bg-red-100';

    beforeEach(async () => {
      await clickButton('dir1');
      await clickButton('nested-file1.ts');
      await clickButton('PLAY');
    });

    it('hide play button and render pause button and reset button', async () => {
      expect(screen.queryByRole('button', { name: 'PLAY' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'PAUSE' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'RESET' })).toBeInTheDocument();
    });

    it('render green highlighted text when type correct characters', async () => {
      const charsToType = 'console';
      for (const char of charsToType) {
        await act(async () => {
          fireEvent.keyDown(document, { key: char });
        });
      }

      const correctChars = document.querySelectorAll(`.${CORRECT_CHARS_COLOR}`);
      expect(correctChars.length).toBe(7);

      const typedText = Array.from(correctChars)
        .map((span) => span.textContent)
        .join('');
      expect(typedText).toBe('console');
    });

    it('render red highlighted text when type incorrect character', async () => {
      await act(async () => {
        fireEvent.keyDown(document, { key: 'd' });
      });

      const incorrectChars = document.querySelectorAll(`.${INCORRECT_CHARS_COLOR}`);
      expect(incorrectChars.length).toBe(1);
      expect(incorrectChars[0].textContent).toBe('c');
    });

    it('delete typed character when type backspace key', async () => {
      const charsToType = 'con';
      for (const char of charsToType) {
        await act(async () => {
          fireEvent.keyDown(document, { key: char });
        });
      }

      await act(async () => {
        fireEvent.keyDown(document, { key: 'Backspace' });
      });

      const correctChars = document.querySelectorAll(`.${CORRECT_CHARS_COLOR}`);
      expect(correctChars.length).toBe(2);

      const typedText = Array.from(correctChars)
        .map((span) => span.textContent)
        .join('');
      expect(typedText).toBe('co');
    });

    it('pauses typing when PAUSE button is clicked', async () => {
      await clickButton('PAUSE');

      expect(screen.getByRole('button', { name: 'RESUME' })).toBeInTheDocument();

      await act(async () => {
        fireEvent.keyDown(document, { key: 'c' });
      });

      const correctChars = document.querySelectorAll(`.${CORRECT_CHARS_COLOR}`);
      expect(correctChars.length).toBe(0);
    });

    it('resumes typing when RESUME button is clicked', async () => {
      await clickButton('PAUSE');
      await clickButton('RESUME');

      await act(async () => {
        fireEvent.keyDown(document, { key: 'c' });
      });

      const correctChars = document.querySelectorAll(`.${CORRECT_CHARS_COLOR}`);
      expect(correctChars.length).toBeGreaterThan(0);
      expect(correctChars[0].textContent).toBe('c');
    });

    it('resets typing when RESET button is clicked', async () => {
      const charsToType = 'con';
      for (const char of charsToType) {
        await act(async () => {
          fireEvent.keyDown(document, { key: char });
        });
      }

      await clickButton('RESET');

      expect(screen.getByRole('button', { name: 'PLAY' })).toBeInTheDocument();
      const correctChars = document.querySelectorAll(`.${CORRECT_CHARS_COLOR}`);
      expect(correctChars.length).toBe(0);
    });

    it('render result when type all characters', async () => {
      const content = 'console.log("Hello, world!");';
      for (const char of content) {
        await act(async () => {
          fireEvent.keyDown(document, { key: char });
        });
      }

      expect(screen.getByText('Completed!!')).toBeInTheDocument(); // TODO: 完了画面を作ったら修正する
    });
  });
});
