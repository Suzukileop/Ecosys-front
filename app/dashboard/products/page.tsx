import { redirect } from 'next/navigation';

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MyProductsRedirectPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') qs.set(key, value);
    else if (Array.isArray(value)) value.forEach((item) => qs.append(key, item));
  }
  const suffix = qs.toString();
  redirect(suffix ? `/marketplace/my-products?${suffix}` : '/marketplace/my-products');
}
