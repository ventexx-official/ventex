import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // @ts-ignore
  apiVersion: '2024-04-10', // Use the latest API version or your preferred one
  appInfo: {
    name: 'Ventex',
    version: '0.1.0',
  },
});
