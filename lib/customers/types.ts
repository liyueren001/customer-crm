export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
}

export interface CustomerDetail extends Customer {
  notes: string | null;
}
