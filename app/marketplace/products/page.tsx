import { redirect } from 'next/navigation';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function MarketplaceProductsRedirect({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') params.set(key, value);
    else if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
  });
  const qs = params.toString();
  redirect(qs ? `/marketplace?${qs}` : '/marketplace');
}
