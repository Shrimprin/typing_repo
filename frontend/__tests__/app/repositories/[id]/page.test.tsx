import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

import RepositoryDetailPage from '@/app/repositories/[id]/page';
import { useParams } from 'next/navigation';
import { mockAuth, mockUseSession } from '../../../mocks/auth';
import { clickButton } from '../../../utils/testUtils';

describe('RepositoryDetailPage', () => {
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
    it('renders file tree with directories, files order both in alphabetical order', async () => {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/api/repositories/1`, {
        headers: {
          Authorization: 'Bearer token_1234567890',
          'Content-Type': 'application/json',
        },
      });

      const fileTreeItems = screen.getByTestId('file-tree').querySelectorAll('button');
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

    it('renders typing area with explanatory message', async () => {
      expect(screen.getByText('Select a file to start typing.')).toBeInTheDocument();
    });
  });

  describe('when directory is clicked', () => {
    it('renders children of directory', async () => {
      await clickButton('dir1');

      expect(screen.getByRole('button', { name: 'nested-file1.ts' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'nested-file2.ts' })).toBeInTheDocument();
    });
  });

  describe('when file is clicked', () => {
    it('renders full path, play button and file content', async () => {
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

    it('hides play button and render pause button and reset button', async () => {
      expect(screen.queryByRole('button', { name: 'PLAY' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'PAUSE' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'RESET' })).toBeInTheDocument();
    });

    it('renders green highlighted text when type correct characters', async () => {
      await userEvent.keyboard('console');

      const correctChars = document.querySelectorAll(`.${CORRECT_CHARS_COLOR}`);
      expect(correctChars.length).toBe(7);

      const typedText = Array.from(correctChars)
        .map((span) => span.textContent)
        .join('');
      expect(typedText).toBe('console');
    });

    it('renders red highlighted text when type incorrect character', async () => {
      await userEvent.keyboard('d');

      const incorrectChars = document.querySelectorAll(`.${INCORRECT_CHARS_COLOR}`);
      expect(incorrectChars.length).toBe(1);
      expect(incorrectChars[0].textContent).toBe('c');
    });

    it('deletes typed character when type backspace key', async () => {
      await userEvent.keyboard('con');
      await userEvent.keyboard('{Backspace}');

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

      await userEvent.keyboard('c');

      const correctChars = document.querySelectorAll(`.${CORRECT_CHARS_COLOR}`);
      expect(correctChars.length).toBe(0);
    });

    it('resumes typing when RESUME button is clicked', async () => {
      await clickButton('PAUSE');
      await clickButton('RESUME');

      await userEvent.keyboard('c');

      const correctChars = document.querySelectorAll(`.${CORRECT_CHARS_COLOR}`);
      expect(correctChars.length).toBeGreaterThan(0);
      expect(correctChars[0].textContent).toBe('c');
    });

    it('resets typing when RESET button is clicked', async () => {
      await userEvent.keyboard('con');

      await clickButton('RESET');

      expect(screen.getByRole('button', { name: 'PLAY' })).toBeInTheDocument();
      const correctChars = document.querySelectorAll(`.${CORRECT_CHARS_COLOR}`);
      expect(correctChars.length).toBe(0);
    });

    it('renders result when type all characters', async () => {
      const mockFileItems = [
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
              status: 'typed',
              fileItems: [],
            },
          ],
        },
      ];

      jest.spyOn(axios, 'patch').mockImplementation(() => {
        return Promise.resolve(mockFileItems);
      });

      await userEvent.keyboard('console.log("Hello, world!");');

      expect(screen.getByText('Completed!!')).toBeInTheDocument(); // TODO: 完了画面を作ったら修正する
    });
  });
});
