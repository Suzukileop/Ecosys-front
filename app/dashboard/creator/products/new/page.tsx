import { redirect } from 'next/navigation';

export default function CreatorNewProductRedirect() {
  redirect('/marketplace/my-products?create=1');
}
