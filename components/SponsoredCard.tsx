import Link from 'next/link';

interface SponsoredCardProps {
  id?: string;
  type?: string;
  title: string;
  description: string;
  linkUrl: string;
  imageUrl?: string;
}

export default function SponsoredCard({ title, description, linkUrl, imageUrl }: SponsoredCardProps) {
  // Fallback so a missing linkUrl never causes a broken href
  const href = linkUrl || '#';

  return (
    <div className="group relative bg-[var(--card-bg)] border border-[var(--border)] rounded-[16px] overflow-hidden hover:border-violet-500/40 hover:shadow-lg transition-all duration-300">
      {/* Sponsored badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="bg-[var(--bg)]/80 backdrop-blur-sm text-[var(--text2)] text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-[var(--border)]">
          Sponsored
        </span>
      </div>

      <Link href={href} target="_blank" rel="noopener noreferrer" className="block h-full flex flex-col">
        {/* Image or placeholder */}
        {imageUrl ? (
          <div className="h-40 w-full overflow-hidden bg-[var(--bg)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="h-40 w-full bg-gradient-to-br from-violet-500/10 to-indigo-500/5 flex items-center justify-center border-b border-[var(--border)]">
            <span className="text-4xl">🚀</span>
          </div>
        )}

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-[var(--text)] mb-2 group-hover:text-violet-400 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-[var(--text2)] flex-1 line-clamp-3">
            {description}
          </p>
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between text-violet-400 text-sm font-medium">
            <span>Learn more</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
