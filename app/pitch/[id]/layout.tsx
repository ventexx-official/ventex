import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
 const { data: pitch } = await supabase
 .from('pitches')
 .select('title, tagline, short_description')
 .eq('id', params.id)
 .maybeSingle();

 const title = pitch?.title ? `${pitch.title} â€” Pitch on Folenzo` : 'Pitch on Folenzo';
 const description = pitch?.tagline || pitch?.short_description || 'View this startup pitch on Folenzo.';

 return {
 title,
 description,
 openGraph: {
 title,
 description,
 images: ['https://folenzo.com/og-image.png'],
 url: `https://folenzo.com/pitch/${params.id}`,
 },
 twitter: {
 card: 'summary_large_image',
 title,
 description,
 images: ['https://folenzo.com/og-image.png'],
 }
 };
}

export default function PitchLayout({ children }: { children: React.ReactNode }) {
 return <>{children}</>;
}