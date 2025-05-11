import { useSession } from 'next-auth/react';

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000; // 1日のミリ秒数

export const mockUseSession = () => {
  const sessionMock = {
    data: {
      expires: new Date(Date.now() + MILLISECONDS_IN_DAY).toISOString(),
      user: {
        accessToken: 'token_1234567890',
        email: 'test@example.com',
        image: 'https://avatars.githubusercontent.com/u/123456789?v=4',
        name: 'Test User',
      },
    },
    status: 'authenticated',
  };

  (useSession as jest.Mock).mockReturnValue(sessionMock);

  return sessionMock;
};
