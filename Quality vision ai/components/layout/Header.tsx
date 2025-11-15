import { ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              QualityVision AI
            </h1>
          </div>
          {/* Future actions/user menu can go here */}
        </div>
      </div>
    </header>
  );
}
