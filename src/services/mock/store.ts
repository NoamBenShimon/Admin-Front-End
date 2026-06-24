/**
 * @fileoverview In-memory mock store
 *
 * A stateful, client-side singleton that stands in for the backend while its
 * admin endpoints don't exist yet. It owns a {@link MockDb} (seeded from
 * `seed.ts`), exposes CRUD operations that return the same DTOs the real API
 * will return, and persists the admin session flag in `localStorage` so a page
 * refresh keeps you signed in. Swapping to the real backend is a single env flag
 * (`NEXT_PUBLIC_USE_MOCKS=false`) — see `services/api.ts`.
 */

import type {
  AnalyticsSummary,
  BalanceResponse,
  Equipment,
  Grade,
  GradeRequirements,
  ImportResult,
  ImportRowError,
  LoginResponse,
  Order,
  OrderFilters,
  ParentUser,
  PaymentsResponse,
  RefundResult,
  RequirementItem,
  School,
} from '@/types/api';
import {
  createSeed,
  MOCK_ADMINS,
  type MockDb,
} from './seed';

const SESSION_KEY = 'motzklist_mock_admin';

class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ValidationError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class AuthError extends Error {
  statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/** Simulate a little network latency so loading states are exercised. */
function delay<T>(value: T, ms = 140): Promise<T> {
  if (typeof window === 'undefined') return Promise.resolve(value);
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextId(records: { id: string }[]): string {
  const max = records.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0);
  return String(max + 1);
}

/** Normalize an optional Hebrew name: trim, treating blank as "no translation". */
function cleanHe(nameHe?: string): string | undefined {
  const trimmed = nameHe?.trim();
  return trimmed ? trimmed : undefined;
}

class MockStore {
  private db: MockDb = createSeed();

  /** Reset everything back to the seed (handy for tests / a "reset demo" action). */
  reset(): void {
    this.db = createSeed();
  }

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  login(username: string, password: string): Promise<LoginResponse> {
    const admin = MOCK_ADMINS.find(
      (a) => a.username === username && a.password === password,
    );
    if (!admin) {
      throw new AuthError('Invalid username or password');
    }
    const session: LoginResponse = {
      userid: admin.userid,
      username: admin.username,
      role: admin.role,
    };
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    return delay(session);
  }

  logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_KEY);
    }
    return delay(undefined);
  }

  authStatus(): Promise<LoginResponse | null> {
    if (typeof window === 'undefined') return Promise.resolve(null);
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return Promise.resolve(null);
    try {
      return Promise.resolve(JSON.parse(raw) as LoginResponse);
    } catch {
      return Promise.resolve(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Schools
  // ---------------------------------------------------------------------------

  listSchools(): Promise<School[]> {
    return delay(this.db.schools.map((s) => ({ ...s })));
  }

  getSchool(id: string): Promise<School | null> {
    const s = this.db.schools.find((x) => x.id === id);
    return delay(s ? { ...s } : null);
  }

  createSchool(name: string, nameHe?: string): Promise<School> {
    const trimmed = name.trim();
    if (!trimmed) throw new ValidationError('School name is required');
    const school = { id: nextId(this.db.schools), name: trimmed, nameHe: cleanHe(nameHe) };
    this.db.schools.push(school);
    return delay({ ...school });
  }

  updateSchool(id: string, name: string, nameHe?: string): Promise<School> {
    const school = this.db.schools.find((x) => x.id === id);
    if (!school) throw new NotFoundError(`School ${id} not found`);
    const trimmed = name.trim();
    if (!trimmed) throw new ValidationError('School name is required');
    school.name = trimmed;
    if (nameHe !== undefined) school.nameHe = cleanHe(nameHe);
    return delay({ ...school });
  }

  deleteSchool(id: string): Promise<void> {
    const exists = this.db.schools.some((x) => x.id === id);
    if (!exists) throw new NotFoundError(`School ${id} not found`);
    const gradeIds = new Set(
      this.db.grades.filter((g) => g.schoolId === id).map((g) => g.id),
    );
    this.db.schools = this.db.schools.filter((x) => x.id !== id);
    this.db.grades = this.db.grades.filter((g) => g.schoolId !== id);
    this.db.requirements = this.db.requirements.filter(
      (r) => !gradeIds.has(r.gradeId),
    );
    this.db.carts = this.db.carts.filter((c) => !gradeIds.has(c.gradeId));
    this.db.orders = this.db.orders.filter((o) => !gradeIds.has(o.gradeId));
    return delay(undefined);
  }

  // ---------------------------------------------------------------------------
  // Grades
  // ---------------------------------------------------------------------------

  listGradesBySchool(schoolId: string): Promise<Grade[]> {
    return delay(
      this.db.grades.filter((g) => g.schoolId === schoolId).map((g) => ({ ...g })),
    );
  }

  getGrade(id: string): Promise<Grade | null> {
    const g = this.db.grades.find((x) => x.id === id);
    return delay(g ? { ...g } : null);
  }

  createGrade(schoolId: string, name: string, nameHe?: string): Promise<Grade> {
    if (!this.db.schools.some((s) => s.id === schoolId)) {
      throw new NotFoundError(`School ${schoolId} not found`);
    }
    const trimmed = name.trim();
    if (!trimmed) throw new ValidationError('Grade name is required');
    const grade = { id: nextId(this.db.grades), schoolId, name: trimmed, nameHe: cleanHe(nameHe) };
    this.db.grades.push(grade);
    return delay({ ...grade });
  }

  updateGrade(id: string, name: string, nameHe?: string): Promise<Grade> {
    const grade = this.db.grades.find((x) => x.id === id);
    if (!grade) throw new NotFoundError(`Grade ${id} not found`);
    const trimmed = name.trim();
    if (!trimmed) throw new ValidationError('Grade name is required');
    grade.name = trimmed;
    if (nameHe !== undefined) grade.nameHe = cleanHe(nameHe);
    return delay({ ...grade });
  }

  deleteGrade(id: string): Promise<void> {
    const exists = this.db.grades.some((x) => x.id === id);
    if (!exists) throw new NotFoundError(`Grade ${id} not found`);
    this.db.grades = this.db.grades.filter((x) => x.id !== id);
    this.db.requirements = this.db.requirements.filter((r) => r.gradeId !== id);
    this.db.carts = this.db.carts.filter((c) => c.gradeId !== id);
    this.db.orders = this.db.orders.filter((o) => o.gradeId !== id);
    return delay(undefined);
  }

  // ---------------------------------------------------------------------------
  // Equipment catalog
  // ---------------------------------------------------------------------------

  listEquipment(): Promise<Equipment[]> {
    return delay(this.db.equipment.map((e) => ({ ...e })));
  }

  getEquipmentItem(id: string): Promise<Equipment | null> {
    const e = this.db.equipment.find((x) => x.id === id);
    return delay(e ? { ...e } : null);
  }

  createEquipment(name: string, price: number, nameHe?: string): Promise<Equipment> {
    const trimmed = name.trim();
    if (!trimmed) throw new ValidationError('Equipment name is required');
    if (!(price >= 0)) throw new ValidationError('Price must be zero or greater');
    const item = { id: nextId(this.db.equipment), name: trimmed, nameHe: cleanHe(nameHe), price };
    this.db.equipment.push(item);
    return delay({ ...item });
  }

  updateEquipment(
    id: string,
    updates: { name?: string; price?: number; nameHe?: string },
  ): Promise<Equipment> {
    const item = this.db.equipment.find((x) => x.id === id);
    if (!item) throw new NotFoundError(`Equipment ${id} not found`);
    if (updates.name !== undefined) {
      const trimmed = updates.name.trim();
      if (!trimmed) throw new ValidationError('Equipment name is required');
      item.name = trimmed;
    }
    if (updates.nameHe !== undefined) item.nameHe = cleanHe(updates.nameHe);
    if (updates.price !== undefined) {
      if (!(updates.price >= 0)) {
        throw new ValidationError('Price must be zero or greater');
      }
      item.price = updates.price;
    }
    return delay({ ...item });
  }

  deleteEquipment(id: string): Promise<void> {
    const exists = this.db.equipment.some((x) => x.id === id);
    if (!exists) throw new NotFoundError(`Equipment ${id} not found`);
    this.db.equipment = this.db.equipment.filter((x) => x.id !== id);
    this.db.requirements = this.db.requirements.filter(
      (r) => r.equipmentId !== id,
    );
    return delay(undefined);
  }

  // ---------------------------------------------------------------------------
  // Requirements (a grade's equipment list)
  // ---------------------------------------------------------------------------

  private joinRequirement(gradeId: string): GradeRequirements {
    const grade = this.db.grades.find((g) => g.id === gradeId);
    const items: RequirementItem[] = this.db.requirements
      .filter((r) => r.gradeId === gradeId)
      .map((r) => {
        const eq = this.db.equipment.find((e) => e.id === r.equipmentId);
        return {
          equipmentId: r.equipmentId,
          name: eq?.name ?? 'Unknown item',
          price: eq?.price ?? 0,
          quantity: r.quantity,
        };
      });
    return { gradeId, schoolId: grade?.schoolId, items };
  }

  getGradeRequirements(gradeId: string): Promise<GradeRequirements> {
    if (!this.db.grades.some((g) => g.id === gradeId)) {
      throw new NotFoundError(`Grade ${gradeId} not found`);
    }
    return delay(this.joinRequirement(gradeId));
  }

  setGradeRequirements(
    gradeId: string,
    items: { equipmentId: string; quantity: number }[],
  ): Promise<GradeRequirements> {
    if (!this.db.grades.some((g) => g.id === gradeId)) {
      throw new NotFoundError(`Grade ${gradeId} not found`);
    }
    for (const item of items) {
      if (!this.db.equipment.some((e) => e.id === item.equipmentId)) {
        throw new ValidationError(`Unknown equipment ${item.equipmentId}`);
      }
      if (!(item.quantity > 0)) {
        throw new ValidationError('Quantity must be greater than zero');
      }
    }
    this.db.requirements = this.db.requirements.filter(
      (r) => r.gradeId !== gradeId,
    );
    // Collapse duplicates by equipmentId (last one wins).
    const byEquipment = new Map<string, number>();
    for (const item of items) byEquipment.set(item.equipmentId, item.quantity);
    for (const [equipmentId, quantity] of byEquipment) {
      this.db.requirements.push({ gradeId, equipmentId, quantity });
    }
    return delay(this.joinRequirement(gradeId));
  }

  // ---------------------------------------------------------------------------
  // Parent users
  // ---------------------------------------------------------------------------

  listParents(): Promise<ParentUser[]> {
    return delay(
      this.db.parents.map((p) => ({ id: p.id, username: p.username })),
    );
  }

  createParent(username: string, password: string): Promise<ParentUser> {
    const trimmed = username.trim();
    if (!trimmed) throw new ValidationError('Username is required');
    if (!password) throw new ValidationError('Password is required');
    if (this.db.parents.some((p) => p.username === trimmed)) {
      throw new ValidationError('A user with that username already exists');
    }
    const parent = { id: nextId(this.db.parents), username: trimmed, password };
    this.db.parents.push(parent);
    return delay({ id: parent.id, username: parent.username });
  }

  updateParent(
    id: string,
    updates: { username?: string; password?: string },
  ): Promise<ParentUser> {
    const parent = this.db.parents.find((p) => p.id === id);
    if (!parent) throw new NotFoundError(`User ${id} not found`);
    if (updates.username !== undefined) {
      const trimmed = updates.username.trim();
      if (!trimmed) throw new ValidationError('Username is required');
      if (this.db.parents.some((p) => p.username === trimmed && p.id !== id)) {
        throw new ValidationError('A user with that username already exists');
      }
      parent.username = trimmed;
    }
    if (updates.password) parent.password = updates.password;
    return delay({ id: parent.id, username: parent.username });
  }

  deleteParent(id: string): Promise<void> {
    const exists = this.db.parents.some((p) => p.id === id);
    if (!exists) throw new NotFoundError(`User ${id} not found`);
    this.db.parents = this.db.parents.filter((p) => p.id !== id);
    this.db.carts = this.db.carts.filter((c) => c.userId !== id);
    this.db.orders = this.db.orders.filter((o) => o.userId !== id);
    return delay(undefined);
  }

  // ---------------------------------------------------------------------------
  // Orders
  // ---------------------------------------------------------------------------

  private joinOrder(o: MockDb['orders'][number]): Order {
    const parent = this.db.parents.find((p) => p.id === o.userId);
    const grade = this.db.grades.find((g) => g.id === o.gradeId);
    const school = grade
      ? this.db.schools.find((s) => s.id === grade.schoolId)
      : undefined;
    const items = o.items.map((it) => {
      const eq = this.db.equipment.find((e) => e.id === it.equipmentId);
      return {
        equipmentId: it.equipmentId,
        equipmentName: eq?.name ?? 'Unknown item',
        quantity: it.quantity,
        priceAtPurchase: it.priceAtPurchase,
      };
    });
    const totalAmount = items.reduce(
      (sum, it) => sum + it.quantity * it.priceAtPurchase,
      0,
    );
    return {
      id: o.id,
      userId: o.userId,
      username: parent?.username,
      schoolId: grade?.schoolId,
      schoolName: school?.name,
      gradeId: o.gradeId,
      gradeName: grade?.name,
      purchaseDate: o.purchaseDate,
      totalAmount,
      items,
    };
  }

  listOrders(filters: OrderFilters = {}): Promise<Order[]> {
    let orders = this.db.orders.map((o) => this.joinOrder(o));
    if (filters.schoolId) {
      orders = orders.filter((o) => o.schoolId === filters.schoolId);
    }
    if (filters.gradeId) {
      orders = orders.filter((o) => o.gradeId === filters.gradeId);
    }
    if (filters.userId) {
      orders = orders.filter((o) => o.userId === filters.userId);
    }
    if (filters.from) {
      orders = orders.filter((o) => o.purchaseDate >= filters.from!);
    }
    if (filters.to) {
      orders = orders.filter((o) => o.purchaseDate <= filters.to!);
    }
    orders.sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate));
    return delay(orders);
  }

  getOrder(id: string): Promise<Order | null> {
    const o = this.db.orders.find((x) => x.id === id);
    return delay(o ? this.joinOrder(o) : null);
  }

  // ---------------------------------------------------------------------------
  // Analytics
  // ---------------------------------------------------------------------------

  analyticsSummary(): Promise<AnalyticsSummary> {
    const orders = this.db.orders.map((o) => this.joinOrder(o));
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    const monthMap = new Map<string, number>();
    for (const o of orders) {
      const month = o.purchaseDate.slice(0, 7); // YYYY-MM
      monthMap.set(month, (monthMap.get(month) ?? 0) + o.totalAmount);
    }
    const revenueByMonth = [...monthMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, revenue]) => ({ month, revenue }));

    const equipMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const o of orders) {
      for (const it of o.items) {
        const prev = equipMap.get(it.equipmentId) ?? {
          name: it.equipmentName,
          quantity: 0,
          revenue: 0,
        };
        prev.quantity += it.quantity;
        prev.revenue += it.quantity * it.priceAtPurchase;
        equipMap.set(it.equipmentId, prev);
      }
    }
    const topEquipment = [...equipMap.entries()]
      .map(([equipmentId, v]) => ({ equipmentId, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const schoolMap = new Map<string, { schoolName: string; revenue: number }>();
    for (const o of orders) {
      if (!o.schoolId) continue;
      const prev = schoolMap.get(o.schoolId) ?? {
        schoolName: o.schoolName ?? o.schoolId,
        revenue: 0,
      };
      prev.revenue += o.totalAmount;
      schoolMap.set(o.schoolId, prev);
    }
    const spendBySchool = [...schoolMap.entries()]
      .map(([schoolId, v]) => ({ schoolId, ...v }))
      .sort((a, b) => b.revenue - a.revenue);

    return delay({
      totalRevenue,
      totalOrders: orders.length,
      activeCarts: this.db.carts.length,
      catalogSize: this.db.equipment.length,
      revenueByMonth,
      topEquipment,
      spendBySchool,
    });
  }

  // ---------------------------------------------------------------------------
  // Payments (Stripe) — mock-mode stand-ins
  // ---------------------------------------------------------------------------

  listPayments(): Promise<PaymentsResponse> {
    return delay({
      configured: true,
      payments: this.db.payments.map((p) => ({ ...p })),
    });
  }

  stripeBalance(): Promise<BalanceResponse> {
    const available = this.db.payments
      .filter((p) => !p.refunded)
      .reduce((sum, p) => sum + (p.amount - p.amountRefunded), 0);
    return delay({
      configured: true,
      available: [{ amount: Number(available.toFixed(2)), currency: 'ils' }],
      pending: [{ amount: 0, currency: 'ils' }],
    });
  }

  refundPayment(id: string): Promise<RefundResult> {
    const payment = this.db.payments.find((p) => p.id === id);
    if (!payment) throw new NotFoundError(`Payment ${id} not found`);
    if (payment.refunded) throw new ValidationError('Payment is already refunded');
    payment.refunded = true;
    payment.amountRefunded = payment.amount;
    payment.status = 'refunded';
    return delay({ id: `re_mock_${id}`, status: 'succeeded', amount: payment.amount });
  }

  // ---------------------------------------------------------------------------
  // CSV import
  // ---------------------------------------------------------------------------

  /**
   * Import a requirements CSV with columns: `school,grade,equipment,price,quantity`.
   * Schools / grades / equipment are created on demand; each row upserts one
   * requirement line. Header row (if present) is detected and skipped.
   */
  importCsv(text: string): Promise<ImportResult> {
    const errors: ImportRowError[] = [];
    let created = 0;
    let updated = 0;

    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let startIndex = 0;
    if (lines.length > 0 && /school/i.test(lines[0]) && /equipment/i.test(lines[0])) {
      startIndex = 1; // skip header
    }

    for (let i = startIndex; i < lines.length; i++) {
      const rowNumber = i + 1;
      const cols = lines[i].split(',').map((c) => c.trim());
      if (cols.length < 5) {
        errors.push({ row: rowNumber, message: 'Expected 5 columns: school,grade,equipment,price,quantity' });
        continue;
      }
      const [schoolName, gradeName, equipmentName, priceRaw, quantityRaw] = cols;
      const price = Number(priceRaw);
      const quantity = Number(quantityRaw);
      if (!schoolName || !gradeName || !equipmentName) {
        errors.push({ row: rowNumber, message: 'School, grade and equipment are required' });
        continue;
      }
      if (!Number.isFinite(price) || price < 0) {
        errors.push({ row: rowNumber, message: `Invalid price "${priceRaw}"` });
        continue;
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        errors.push({ row: rowNumber, message: `Invalid quantity "${quantityRaw}"` });
        continue;
      }

      let school = this.db.schools.find((s) => s.name === schoolName);
      if (!school) {
        school = { id: nextId(this.db.schools), name: schoolName };
        this.db.schools.push(school);
      }
      let grade = this.db.grades.find(
        (g) => g.schoolId === school!.id && g.name === gradeName,
      );
      if (!grade) {
        grade = { id: nextId(this.db.grades), schoolId: school.id, name: gradeName };
        this.db.grades.push(grade);
      }
      let equipment = this.db.equipment.find((e) => e.name === equipmentName);
      if (!equipment) {
        equipment = { id: nextId(this.db.equipment), name: equipmentName, price };
        this.db.equipment.push(equipment);
      } else if (equipment.price !== price) {
        equipment.price = price; // keep catalog price in sync with the sheet
      }

      const existing = this.db.requirements.find(
        (r) => r.gradeId === grade!.id && r.equipmentId === equipment!.id,
      );
      if (existing) {
        existing.quantity = quantity;
        updated++;
      } else {
        this.db.requirements.push({
          gradeId: grade.id,
          equipmentId: equipment.id,
          quantity,
        });
        created++;
      }
    }

    return delay({ created, updated, skipped: errors.length, errors });
  }
}

/** Shared singleton — module-level state persists for the browser session. */
export const mockStore = new MockStore();
