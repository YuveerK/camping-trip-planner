// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

// ─── Trip ────────────────────────────────────────────────────────────────────

export interface Trip {
  id: string;
  name: string;
  campsiteName?: string | null;
  location?: string | null;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  description?: string | null;
  bookingReference?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  members: TripMember[];
  _count?: {
    packingItems: number;
    tasks: number;
    meals: number;
    expenses: number;
  };
}

// ─── Member ──────────────────────────────────────────────────────────────────

export type MemberRole = 'OWNER' | 'MEMBER';

export interface TripMember {
  id: string;
  tripId: string;
  userId?: string | null;
  user?: Pick<User, 'id' | 'name' | 'email'> | null;
  invitedName?: string | null;
  invitedEmail?: string | null;
  isPending: boolean;
  role: MemberRole;
  checklistIsPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Packing ─────────────────────────────────────────────────────────────────

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PackingCategory {
  id: string;
  tripId: string;
  name: string;
  isCustom: boolean;
  sortOrder: number;
  items?: PackingItem[];
}

export interface PackingItem {
  id: string;
  tripId: string;
  categoryId?: string | null;
  category?: PackingCategory | null;
  name: string;
  description?: string | null;
  requiredQuantity: number;
  unit?: string | null;
  priority: Priority;
  isSharedItem: boolean;
  createdById: string;
  createdBy?: Pick<User, 'id' | 'name'>;
  createdAt: string;
  updatedAt: string;
  claims: ItemClaim[];
}

export interface ItemClaim {
  id: string;
  packingItemId: string;
  memberId: string;
  member: TripMember & { user?: Pick<User, 'id' | 'name' | 'email'> | null };
  claimedQuantity: number;
  isPacked: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Task ────────────────────────────────────────────────────────────────────

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  tripId: string;
  title: string;
  description?: string | null;
  assignedToMemberId?: string | null;
  assignedTo?: TripMember | null;
  dueDate?: string | null;
  status: TaskStatus;
  createdById: string;
  createdBy?: Pick<User, 'id' | 'name'>;
  createdAt: string;
  updatedAt: string;
}

// ─── Meal ────────────────────────────────────────────────────────────────────

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface Meal {
  id: string;
  tripId: string;
  mealDate: string;
  mealType: MealType;
  title: string;
  description?: string | null;
  assignedToMemberId?: string | null;
  assignedTo?: TripMember | null;
  createdById: string;
  createdBy?: Pick<User, 'id' | 'name'>;
  createdAt: string;
  updatedAt: string;
}

// ─── Expense ─────────────────────────────────────────────────────────────────

export type SplitType = 'EQUAL' | 'CUSTOM';

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number | string;
  paidByMemberId: string;
  paidBy: TripMember;
  splitType: SplitType;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MemberBalance {
  memberId: string;
  name: string;
  paid: number;
  owes: number;
  net: number;
}

export interface ExpenseSummary {
  expenses: Expense[];
  totalAmount: number;
  perMemberBalance: MemberBalance[];
}

// ─── Checklist ───────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  memberId: string;
  categoryId?: string | null;
  text: string;
  isChecked: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistCategory {
  id: string;
  memberId: string;
  name: string;
  sortOrder: number;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistData {
  categories: ChecklistCategory[];
  uncategorized: ChecklistItem[];
}

export interface OwnerChecklistData {
  isPublic: boolean;
  ownerName: string;
  categories: ChecklistCategory[];
  uncategorized: ChecklistItem[];
}

// ─── API Response ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}
