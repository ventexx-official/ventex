import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = 'Ventex <onboarding@resend.dev>';
export const VENTEX_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ventex.co';
