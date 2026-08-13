import { redirect } from 'next/navigation';

export default function CreatorProductsRedirect() {
  redirect('/dashboard/products');
}
