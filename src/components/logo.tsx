import { cn } from '@/lib/utils';
import { HeartPulse } from 'lucide-react';

export function Logo({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <HeartPulse className="size-8 text-primary" />
      <span className={cn('text-xl font-bold', textClassName)}>
        Empower<span className="text-accent">Her</span>
      </span>
    </div>
  );
}
