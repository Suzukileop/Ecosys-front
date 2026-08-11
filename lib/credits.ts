import api from '@/lib/api';
import type { CreditBalanceResponse } from '@/types/credits';

export async function getMyCreditBalance(): Promise<number> {
  const res = await api.get<CreditBalanceResponse>('/api/credits/balance');
  return res.data.balance;
}
