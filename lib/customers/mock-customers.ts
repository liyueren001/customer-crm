export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

// Static placeholder data for the UI shell; replaced by real Supabase queries in a later milestone.
export const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Ava Thompson",
    email: "ava.thompson@example.com",
    phone: "+1 (555) 201-3344",
    createdAt: "2026-05-12",
  },
  {
    id: "2",
    name: "Marcus Chen",
    email: "marcus.chen@example.com",
    phone: "+1 (555) 478-9021",
    createdAt: "2026-06-01",
  },
  {
    id: "3",
    name: "Priya Nair",
    email: "priya.nair@example.com",
    phone: "+1 (555) 630-7712",
    createdAt: "2026-06-18",
  },
  {
    id: "4",
    name: "Diego Alvarez",
    email: "diego.alvarez@example.com",
    phone: "+1 (555) 902-4456",
    createdAt: "2026-07-03",
  },
  {
    id: "5",
    name: "Sofia Rossi",
    email: "sofia.rossi@example.com",
    phone: "+1 (555) 315-8890",
    createdAt: "2026-07-15",
  },
];
