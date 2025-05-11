import UserButton from '@/components/common/UserButton';

export default function Header() {
  return (
    <div className="fixed flex h-16 w-screen items-center justify-between border-b border-gray-300 bg-gray-200 px-8">
      <h1 className="text-2xl font-bold">Typing on GitHub</h1>
      <div className="flex gap-3">
        <UserButton />
      </div>
    </div>
  );
}
