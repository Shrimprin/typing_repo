import { auth } from '@/auth';
import { useSession } from 'next-auth/react';

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000; // 1日のミリ秒数
const MOCK_AUTH = {
  expires: new Date(Date.now() + MILLISECONDS_IN_DAY).toISOString(),
  user: {
    accessToken: 'token_1234567890',
    email: 'test@example.com',
    image: 'https://avatars.githubusercontent.com/u/123456789?v=4',
    name: 'Test User',
  },
};

export const mockUseSession = () => {
  const sessionMock = {
    data: MOCK_AUTH,
  };

  (useSession as jest.Mock).mockReturnValue(sessionMock);
};

export const mockAuth = () => {
  (auth as jest.Mock).mockResolvedValue(MOCK_AUTH);
};
