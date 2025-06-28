import '@testing-library/jest-dom';

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

// jestではサーバコンポーネントがクライアントコンポーネントとして扱われ、
// 非同期関数が使えないとエラーになるためモックする
// https://nextjs.org/docs/app/guides/testing/jest
jest.mock('@/components/common/UserButton', () => {
  return function MockUserButton() {
    return;
  };
});
