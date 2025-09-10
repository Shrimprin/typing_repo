import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import Home from '@/app/page';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // テストではnext/imageの最適化は不要なため、eslintの警告を無効化
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('Home', () => {
  beforeEach(() => {
    render(<Home />);
  });

  describe('Hero section', () => {
    it('renders the main title', () => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Practice Typing Through Real Code',
        }),
      ).toBeInTheDocument();
    });

    it('renders the subtitle', () => {
      expect(screen.getByText('Import code from GitHub repository and practice typing it.')).toBeInTheDocument();
    });

    it('renders the GitHub sign-in button', () => {
      expect(screen.getByRole('button', { name: 'Sign in with GitHub to Start' })).toBeInTheDocument();
    });
  });

  describe('How to Use section', () => {
    it('renders the "How to Use TypingRepo" section', () => {
      expect(screen.getByRole('heading', { level: 2, name: 'How to Use TypingRepo' })).toBeInTheDocument();
    });

    it('renders the section description', () => {
      expect(
        screen.getByText('Get started with just 2 simple steps to improve your typing skills.'),
      ).toBeInTheDocument();
    });

    it('renders both step explanations', () => {
      expect(screen.getByRole('heading', { level: 3, name: 'Import GitHub Repository' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: 'Start Typing Practice' })).toBeInTheDocument();
    });

    it('renders step images with correct sources', () => {
      // サムネイル画像の確認
      const thumbnail1 = screen.getByAltText('Import GitHub Repository demonstration thumbnail');
      const thumbnail2 = screen.getByAltText('Typing practice demonstration thumbnail');

      expect(thumbnail1).toHaveAttribute('src', '/videos/step1_thumbnail.png');
      expect(thumbnail2).toHaveAttribute('src', '/videos/step2_thumbnail.png');
    });

    it('renders GIF images for hover effect', () => {
      const gif1 = screen.getByAltText('Import GitHub Repository demonstration GIF');
      const gif2 = screen.getByAltText('Typing practice demonstration GIF');

      expect(gif1).toHaveAttribute('src', '/videos/step1_import-repository.gif');
      expect(gif2).toHaveAttribute('src', '/videos/step2_typing.gif');
    });
  });
});
