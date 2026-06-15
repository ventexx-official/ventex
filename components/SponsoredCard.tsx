import Link from 'next/link';

interface SponsoredCardProps {
  id: string;
  type: string;
  title: string;
  description: string;
  linkUrl: string;
  imageUrl?: string;
}

export default function SponsoredCard({ title, description, linkUrl, imageUrl }: SponsoredCardProps) {
  return (
    <div className="group relative bg-neutral-900 border border-neutral-700/80 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 shadow-lg shadow-black/20">
      <div className="absolute top-3 right-3 z-10">
        <span className="bg-neutral-800/80 backdrop-blur-sm text-neutral-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-neutral-700">
          Sponsored
        </span>
      </div>
      
      <Link href={linkUrl} target="_blank" rel="noopener noreferrer" className="block h-full flex flex-col">
        {imageUrl ? (
          <div className="h-40 w-full overflow-hidden bg-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        ) : (
          <div className="h-40 w-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center border-b border-neutral-800">
            <span className="text-4xl">🚀</span>
          </div>
        )}
        
        <div className="p-5 flex-1 flex flex-col bg-gradient-to-b from-transparent to-blue-900/5">
          <h3 className="font-bold text-lg text-neutral-100 mb-2 group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-neutral-400 flex-1 line-clamp-3">
            {description}
          </p>
          <div className="mt-4 pt-4 border-t border-neutral-800/50 flex items-center justify-between text-blue-400 text-sm font-medium">
            <span>Learn more</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
