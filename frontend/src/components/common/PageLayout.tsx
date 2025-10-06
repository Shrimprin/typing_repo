import Header from '@/components/common/Header';

type PageLayoutProps = {
  children: React.ReactNode;
  title?: string;
  moreComponent?: React.ReactNode;
  className?: string;
};

export default function PageLayout({
  title = '',
  children,
  moreComponent,
  className = 'flex min-h-screen flex-col',
}: PageLayoutProps) {
  return (
    <div className={className}>
      <Header title={title} moreComponent={moreComponent} />
      {children}
    </div>
  );
}
