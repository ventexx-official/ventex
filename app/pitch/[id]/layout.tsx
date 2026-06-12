import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
 const { data: pitch } = await supabase
 .from('pitches')
 .select('title, tagline, short_description')
 .eq('id', params.id)
 .maybeSingle();

 const title = pitch?.title ? `${pitch.title} â€” Pitch on Ventex` : 'Pitch on Ventex';
 const description = pitch?.tagline || pitch?.short_description || 'View this startup pitch on Ventex.';

 return {
 title,
 description,
 openGraph: {
 title,
 description,
 images: ['https://ventexx.com/og-image.png'],
 url: `https://ventexx.com/pitch/${params.id}`,
 },
 twitter: {
 card: 'summary_large_image',
 title,
 description,
 images: ['https://ventexx.com/og-image.png'],
 }
 };
}

export default function PitchLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}