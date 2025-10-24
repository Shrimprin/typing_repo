import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import NewRepositoryPage from '@/app/repositories/new/page';
import { clickButton, getCheckboxByText } from '@test/helpers/interactions';
import { mockUseSession } from '@test/mocks/auth';

describe('NewRepositoryPage', () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const mockRepositoryPreview = {
    data: {
      name: 'test-repository',
      url: 'https://github.com/test-username/test-repository',
      extensions: [
        {
          name: '.tsx',
          fileCount: 10,
          isActive: true,
        },
        {
          name: '.css',
          fileCount: 5,
          isActive: true,
        },
        {
          name: 'no extension',
          fileCount: 1,
          isActive: true,
        },
        {
          name: '.gitignore',
          fileCount: 1,
          isActive: true,
        },
      ],
    },
  };

  const inputRepositoryUrlAndClickNext = async (url: string) => {
    const repositoryUrlInput = screen.getByPlaceholderText('https://github.com/username/repository');

    if (url === '') {
      await userEvent.clear(repositoryUrlInput);
    } else {
      await userEvent.type(repositoryUrlInput, url);
    }
    await clickButton('Next');
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession();
  });

  it('renders title and description', () => {
    render(<NewRepositoryPage />);

    expect(screen.getByText('New Repository')).toBeInTheDocument();
    expect(screen.getByText('Import a GitHub repository to start typing practice.')).toBeInTheDocument();
  });

  describe('url input step', () => {
    beforeEach(() => {
      render(<NewRepositoryPage />);
    });

    it('renders title, description and progress', () => {
      expect(screen.getByText('Step 1: Repository URL')).toBeInTheDocument();
      expect(screen.getByText('Enter the GitHub repository URL.')).toBeInTheDocument();
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('renders extension selection step when click Next with valid url', async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce(mockRepositoryPreview);

      await inputRepositoryUrlAndClickNext('https://github.com/test-username/test-repository');

      expect(screen.getByText('Step 2: Extensions')).toBeInTheDocument();
      expect(screen.getByText('test-repository')).toBeInTheDocument();
      expect(getCheckboxByText('.tsx')).toBeChecked();
      expect(getCheckboxByText('.css')).toBeChecked();
      expect(getCheckboxByText('no extension')).toBeChecked();
      expect(getCheckboxByText('.gitignore')).toBeChecked();
    });
  });

  describe('extension selection step', () => {
    beforeEach(async () => {
      jest.spyOn(axios, 'get').mockResolvedValueOnce(mockRepositoryPreview);
      render(<NewRepositoryPage />);

      await inputRepositoryUrlAndClickNext('https://github.com/test-username/test-repository');
    });

    it('renders title, description and progress', () => {
      expect(screen.getByText('Step 2: Extensions')).toBeInTheDocument();
      expect(screen.getByText('Select the extensions you want to type.')).toBeInTheDocument();
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('renders creation confirm step when click Next', async () => {
      await clickButton('Next');

      expect(screen.getByText('Step 3: Confirm & Create')).toBeInTheDocument();
      expect(screen.getByText('test-repository')).toBeInTheDocument();
      expect(screen.getByText('.tsx')).toBeInTheDocument();
      expect(screen.getByText('.css')).toBeInTheDocument();
      expect(screen.getByText('no extension')).toBeInTheDocument();
      expect(screen.getByText('.gitignore')).toBeInTheDocument();
    });
  });

  describe('creation confirm step', () => {
    beforeEach(async () => {
      (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
      jest.spyOn(axios, 'get').mockResolvedValueOnce(mockRepositoryPreview);
      jest.spyOn(axios, 'post').mockResolvedValueOnce({
        data: {
          id: 10,
          name: 'test-repository',
          lastTypedAt: null,
        },
      });

      render(<NewRepositoryPage />);

      await inputRepositoryUrlAndClickNext('https://github.com/test-username/test-repository');
      await clickButton('Next');
    });

    it('renders title, description and progress', () => {
      expect(screen.getByText('Step 3: Confirm & Create')).toBeInTheDocument();
      expect(screen.getByText('Review the settings and create the repository.')).toBeInTheDocument();
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });

    it('calls api and navigates to repository page when click Create', async () => {
      await clickButton('Create');

      expect(axios.post).toHaveBeenCalledWith(
        `${BASE_URL}/api/repositories`,
        {
          repository: {
            url: 'https://github.com/test-username/test-repository',
            extensionsAttributes: [
              {
                name: '.tsx',
                isActive: true,
              },
              {
                name: '.css',
                isActive: true,
              },
              {
                name: 'no extension',
                isActive: true,
              },
              {
                name: '.gitignore',
                isActive: true,
              },
            ],
          },
        },
        {
          headers: {
            Authorization: 'Bearer token_1234567890',
            'Content-Type': 'application/json',
          },
        },
      );

      const router = useRouter();
      expect(router.push).toHaveBeenCalledWith('/repositories/10');
    });
  });
});
