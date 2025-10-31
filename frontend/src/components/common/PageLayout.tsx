import Header from './Header';

type PageLayoutProps = {
  children: React.ReactNode;
  title?: string;
  moreComponent?: React.ReactNode;
  backHref?: string;
  className?: string;
};

export default function PageLayout({
  title = '',
  children,
  moreComponent,
  backHref,
  className = 'flex min-h-screen flex-col',
}: PageLayoutProps) {
  return (
    <div className={className}>
      <Header title={title} moreComponent={moreComponent} backHref={backHref} />
      {children}
    </div>
  );
}
