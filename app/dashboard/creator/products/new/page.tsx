import { redirect } from 'next/navigation';

export default function CreatorNewProductRedirect() {
  redirect('/dashboard/products?create=1');
}
