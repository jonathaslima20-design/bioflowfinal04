import Link from 'next/link';
import { isLightColor } from '@/lib/color';

export function BioflowzyBadge({ bgColor, className = '' }: { bgColor?: string; className?: string }) {
  const light = isLightColor(bgColor);
  const textColor = light ? '#000000' : '#FFFFFF';
  const badgeBg = light ? '#000000' : '#FFFFFF';
  const badgeText = light ? '#FFFFFF' : '#000000';

  return (
    <div className={`mt-10 mb-4 text-center ${className}`}>
      <Link
        href="/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-[11px] font-bold tracking-tight"
        style={{ color: textColor, fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif' }}
      >
        <span>feito com</span>
        <span
          className="px-1.5 py-0.5"
          style={{ backgroundColor: badgeBg, color: badgeText }}
        >
          BioFlowzy
        </span>
      </Link>
    </div>
  );
}
