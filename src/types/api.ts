/**
 * @fileoverview TypeScript Type Definitions for the Admin API
 *
 * These types model the REAL Motzklist domain as defined by the backend and
 * database (`school -> grade -> requirement(equipment, quantity)`, plus parent
 * users and immutable order history). Keep them aligned with the backend
 * contract documented in the plan — do not add fields the system does not store.
 *
 * @module types/api
 */

// =============================================================================
// Authentication
// =============================================================================

export type AdminRole = 'admin' | 'superadmin';

/** Credentials required for admin authentication */
export interface LoginCredentials {
  username: string;
  password: string;
}

/** Response from a successful login */
export interface LoginResponse {
  userid: string;
  username: string;
  role?: AdminRole;
}

/** Current authentication status */
export interface AuthStatusResponse {
  authenticated: boolean;
  userid?: string;
  username?: string;
  role?: AdminRole;
}

/** The signed-in admin operating this panel */
export interface User {
  userid: string;
  username: string;
  role: AdminRole;
}

// =============================================================================
// Domain entities
// =============================================================================

/**
 * A school — `school(sid, sname, sname_he)`.
 * `name` is the default (English) name; `nameHe` is the optional Hebrew
 * translation (empty/absent when not yet translated).
 */
export interface School {
  id: string;
  name: string;
  nameHe?: string;
}

/** A grade within a school — `grade(gid, sid, gname, gname_he)` */
export interface Grade {
  id: string;
  schoolId: string;
  name: string;
  nameHe?: string;
}

/**
 * A catalog equipment item — `equipment(eid, ename, ename_he, price)`.
 * `price` is in ILS (₪). `nameHe` is the optional Hebrew translation.
 */
export interface Equipment {
  id: string;
  name: string;
  nameHe?: string;
  price: number;
}

/**
 * One line of a grade's required-equipment list — a `requirement(gid, eid, quantity)`
 * row joined with its equipment for display.
 */
export interface RequirementItem {
  equipmentId: string;
  name: string;
  price: number;
  quantity: number;
}

/** The full required-equipment list for a grade (what parents see) */
export interface GradeRequirements {
  gradeId: string;
  schoolId?: string;
  items: RequirementItem[];
}

/** A parent account managed by the admin — `users(uid, uname)` (password never exposed) */
export interface ParentUser {
  id: string;
  username: string;
}

// =============================================================================
// Orders (immutable purchase history)
// =============================================================================

/** A purchased line — `order_item(eid, quantity, price_at_purchase)` */
export interface OrderItem {
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  priceAtPurchase: number;
}

/** A completed order — `orders(oid, uid, gid, purchase_date, total_amount)` */
export interface Order {
  id: string;
  userId: string;
  username?: string;
  schoolId?: string;
  schoolName?: string;
  gradeId: string;
  gradeName?: string;
  purchaseDate: string;
  totalAmount: number;
  items: OrderItem[];
}

/** Filters accepted by the orders listing */
export interface OrderFilters {
  schoolId?: string;
  gradeId?: string;
  userId?: string;
  from?: string;
  to?: string;
}

// =============================================================================
// Analytics
// =============================================================================

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  activeCarts: number;
  catalogSize: number;
  revenueByMonth: { month: string; revenue: number }[];
  topEquipment: { equipmentId: string; name: string; quantity: number; revenue: number }[];
  spendBySchool: { schoolId: string; schoolName: string; revenue: number }[];
}

// =============================================================================
// Payments (Stripe)
// =============================================================================

/** A Stripe charge as shown in the admin payments view. Amounts are in major units (₪). */
export interface StripePayment {
  id: string;
  paymentIntent?: string;
  amount: number;
  amountRefunded: number;
  currency: string;
  /** Stripe charge status, e.g. "succeeded", "pending", "failed". */
  status: string;
  refunded: boolean;
  email?: string;
  description?: string;
  receiptUrl?: string;
  /** ISO timestamp. */
  created: string;
  /** Deep link to this payment in the Stripe Dashboard. */
  dashboardUrl?: string;
}

/**
 * Payments listing. `configured` is false when the backend has no Stripe key yet,
 * so the UI can show a "connect Stripe" state instead of an error.
 */
export interface PaymentsResponse {
  configured: boolean;
  payments: StripePayment[];
}

export interface StripeBalanceItem {
  amount: number;
  currency: string;
}

export interface BalanceResponse {
  configured: boolean;
  available: StripeBalanceItem[];
  pending: StripeBalanceItem[];
}

export interface RefundResult {
  id: string;
  status: string;
  amount: number;
}

// =============================================================================
// CSV import
// =============================================================================

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: ImportRowError[];
}

// =============================================================================
// Write payloads
// =============================================================================

export interface SchoolPayload {
  name: string;
  /** Optional Hebrew translation of the name. */
  nameHe?: string;
}

export interface GradePayload {
  schoolId: string;
  name: string;
  /** Optional Hebrew translation of the name. */
  nameHe?: string;
}

export interface EquipmentPayload {
  name: string;
  price: number;
  /** Optional Hebrew translation of the name. */
  nameHe?: string;
}

/** Replace-all body for a grade's requirement list */
export interface RequirementsUpdatePayload {
  items: { equipmentId: string; quantity: number }[];
}

export interface ParentUserPayload {
  username: string;
  password: string;
}

export interface ParentUserUpdatePayload {
  username?: string;
  password?: string;
}

// =============================================================================
// API response wrappers
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
