import Header from "@/components/Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-primary/10">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
}
