import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
 const { data: product } = await supabase
 .from('products')
 .select('name, description, category')
 .eq('id', params.id)
 .maybeSingle();

 const title = product?.name ? `${product.name} â€” Ventex Marketplace` : 'Product on Ventex Marketplace';
 const description = product?.description || `Explore ${product?.category || 'premium'} startup assets, tools, and services.`;

 return {
 title,
 description,
 openGraph: {
 title,
 description,
 images: ['https://ventexx.com/og-image.png'],
 url: `https://ventexx.com/marketplace/${params.id}`,
 },
 twitter: {
 card: 'summary_large_image',
 title,
 description,
 images: ['https://ventexx.com/og-image.png'],
 }
 };
}

export default function MarketplaceItemLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}