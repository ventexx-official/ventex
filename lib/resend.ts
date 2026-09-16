import { Resend } from 'resend';
import { BASE_URL } from './site';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = 'Folenzo <noreply@folenzo.com>';
export const FOLENZO_URL = BASE_URL;
