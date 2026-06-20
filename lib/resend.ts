import { Resend } from 'resend';
import { BASE_URL } from './site';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = 'Ventex <noreply@ventexx.com>';
export const VENTEX_URL = BASE_URL;
