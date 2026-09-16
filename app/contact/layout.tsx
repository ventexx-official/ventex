import type { Metadata } from "next";
import { OG_IMAGE_URL } from "@/lib/site";

export const metadata: Metadata = {
 title: "Contact Folenzo - Support, Partnerships & Press",
 description: "Reach the Folenzo team for support, bug reports, partnerships, press, and marketplace questions.",
 alternates: { canonical: "https://folenzo.com/contact" },
 openGraph: {
 title: "Contact Folenzo - Support, Partnerships & Press",
 description: "Reach the Folenzo team for support, bug reports, partnerships, press, and marketplace questions.",
 url: "https://folenzo.com/contact",
 type: "website",
 images: [OG_IMAGE_URL],
 },
 twitter: {
 card: "summary_large_image",
 title: "Contact Folenzo - Support, Partnerships & Press",
 description: "Reach the Folenzo team for support, bug reports, partnerships, press, and marketplace questions.",
 images: [OG_IMAGE_URL],
 },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
 return children;
}