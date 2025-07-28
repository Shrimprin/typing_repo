import { LoaderCircle } from 'lucide-react';

type LoadingProps = {
  text?: string;
  className?: string;
};

export default function Loading({ text = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
      <LoaderCircle className="animate-spin" />
      <span>{text}</span>
    </div>
  );
}
