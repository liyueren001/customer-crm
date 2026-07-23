export interface CustomerFormValues {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export interface CustomerInsertValues {
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
}

export type CustomerFieldErrors = Partial<Record<keyof CustomerFormValues, string>>;

export type CustomerValidationResult =
  | { success: true; values: CustomerInsertValues }
  | { success: false; fieldErrors: CustomerFieldErrors };

export interface CustomerFormState {
  error: string | null;
  fieldErrors: CustomerFieldErrors;
  values: CustomerFormValues;
}

export const initialCustomerFormState: CustomerFormState = {
  error: null,
  fieldErrors: {},
  values: { name: "", email: "", phone: "", notes: "" },
};

const NAME_MAX_LENGTH = 200;
const EMAIL_MAX_LENGTH = 254;
const PHONE_MAX_LENGTH = 30;
const NOTES_MAX_LENGTH = 2000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const CUSTOMER_SEARCH_MAX_LENGTH = 100;

// searchParams may hand back a single string, an array (repeated ?q=), or
// undefined; only a single trimmed, length-capped string is ever used as a
// search term.
export function readCustomerSearchQuery(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, CUSTOMER_SEARCH_MAX_LENGTH);
}

// Conservative ceiling for a small per-user CRM: at 10 rows/page this covers
// 10,000 records, far beyond any realistic customer list. Anything beyond
// this is treated as invalid rather than clamped, so it never reaches a
// range calculation as a huge (if bounded) offset.
const MAX_CUSTOMER_PAGE_NUMBER = 1000;

const PAGE_NUMBER_PATTERN = /^[0-9]+$/;

// Only a single, well-formed positive integer is accepted. Repeated ?page=
// params are ambiguous (which one did the caller mean?), so they default to
// page 1 rather than silently picking the first or last value.
export function readCustomerPageNumber(raw: string | string[] | undefined): number {
  if (Array.isArray(raw) || typeof raw !== "string") {
    return 1;
  }

  if (!PAGE_NUMBER_PATTERN.test(raw)) {
    return 1;
  }

  const parsed = Number(raw);

  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > MAX_CUSTOMER_PAGE_NUMBER) {
    return 1;
  }

  return parsed;
}

// The only place that turns sanitized state back into a URL, so a link can
// never carry anything beyond the known-good `q` and `page` parameters.
export function buildCustomersUrl(params: { query?: string; page?: number }): string {
  const searchParams = new URLSearchParams();

  if (params.query) {
    searchParams.set("q", params.query);
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const queryString = searchParams.toString();
  return queryString ? `/dashboard/customers?${queryString}` : "/dashboard/customers";
}

// A customer id can arrive from a route param or a submitted form, both of
// which are untrusted; malformed ids are rejected before ever reaching a query.
export function isValidCustomerId(id: string): boolean {
  return UUID_PATTERN.test(id);
}

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function readCustomerFormValues(formData: FormData): CustomerFormValues {
  return {
    name: readField(formData, "name"),
    email: readField(formData, "email"),
    phone: readField(formData, "phone"),
    notes: readField(formData, "notes"),
  };
}

function toNullable(value: string): string | null {
  return value.length > 0 ? value : null;
}

// Authoritative validation: client-side attributes (required, maxLength, type=email)
// are UX only and must not be trusted as the actual guarantee.
export function validateCustomerFormValues(
  values: CustomerFormValues,
): CustomerValidationResult {
  const fieldErrors: CustomerFieldErrors = {};

  if (!values.name) {
    fieldErrors.name = "Name is required.";
  } else if (values.name.length > NAME_MAX_LENGTH) {
    fieldErrors.name = `Name must be ${NAME_MAX_LENGTH} characters or fewer.`;
  }

  if (values.email) {
    if (values.email.length > EMAIL_MAX_LENGTH) {
      fieldErrors.email = `Email must be ${EMAIL_MAX_LENGTH} characters or fewer.`;
    } else if (!EMAIL_PATTERN.test(values.email)) {
      fieldErrors.email = "Enter a valid email address.";
    }
  }

  if (values.phone.length > PHONE_MAX_LENGTH) {
    fieldErrors.phone = `Phone must be ${PHONE_MAX_LENGTH} characters or fewer.`;
  }

  if (values.notes.length > NOTES_MAX_LENGTH) {
    fieldErrors.notes = `Notes must be ${NOTES_MAX_LENGTH} characters or fewer.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    values: {
      name: values.name,
      email: toNullable(values.email),
      phone: toNullable(values.phone),
      notes: toNullable(values.notes),
    },
  };
}
