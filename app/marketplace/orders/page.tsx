import { redirect } from 'next/navigation';

export default function MarketplaceOrdersRedirect() {
  redirect('/orders');
}