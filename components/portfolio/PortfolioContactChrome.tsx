'use client';

export type PortfolioContactKind = 'address' | 'phone' | 'email';

export type PortfolioContactEntry = {
  id: string;
  value: string;
};

export type PortfolioContactLists = {
  addresses: PortfolioContactEntry[];
  phones: PortfolioContactEntry[];
  emails: PortfolioContactEntry[];
};
