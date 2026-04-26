import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Expense, ExpenseInput } from "@/types/expense";
import { getMonthRange } from "@/utils/date";

const COLLECTION = "expenses";

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Expense {
  const data = snap.data();
  return {
    id: snap.id,
    name: data.name,
    amount: data.amount,
    categoryId: data.categoryId,
    categoryName: data.categoryName,
    spentAt: (data.spentAt as Timestamp).toDate(),
    paymentMethod: data.paymentMethod,
    isRecurring: !!data.isRecurring,
    notes: data.notes ?? undefined,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
  };
}

export async function createExpense(input: ExpenseInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    name: input.name,
    amount: input.amount,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    spentAt: Timestamp.fromDate(input.spentAt),
    paymentMethod: input.paymentMethod,
    isRecurring: input.isRecurring,
    notes: input.notes ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateExpense(id: string, input: Partial<ExpenseInput>): Promise<void> {
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (input.name !== undefined) payload.name = input.name;
  if (input.amount !== undefined) payload.amount = input.amount;
  if (input.categoryId !== undefined) payload.categoryId = input.categoryId;
  if (input.categoryName !== undefined) payload.categoryName = input.categoryName;
  if (input.spentAt !== undefined) payload.spentAt = Timestamp.fromDate(input.spentAt);
  if (input.paymentMethod !== undefined) payload.paymentMethod = input.paymentMethod;
  if (input.isRecurring !== undefined) payload.isRecurring = input.isRecurring;
  if (input.notes !== undefined) payload.notes = input.notes ?? null;
  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function deleteExpense(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getExpense(id: string): Promise<Expense | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return fromDoc(snap as QueryDocumentSnapshot<DocumentData>);
}

export async function listExpensesByMonth(year: number, month: number): Promise<Expense[]> {
  const { start, end } = getMonthRange(year, month);
  const q = query(
    collection(db, COLLECTION),
    where("spentAt", ">=", Timestamp.fromDate(start)),
    where("spentAt", "<", Timestamp.fromDate(end)),
    orderBy("spentAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function listExpensesByCategory(
  categoryId: string,
  year?: number,
  month?: number,
): Promise<Expense[]> {
  const constraints = [where("categoryId", "==", categoryId)];
  if (year !== undefined && month !== undefined) {
    const { start, end } = getMonthRange(year, month);
    constraints.push(where("spentAt", ">=", Timestamp.fromDate(start)));
    constraints.push(where("spentAt", "<", Timestamp.fromDate(end)));
  }
  const q = query(collection(db, COLLECTION), ...constraints, orderBy("spentAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function listAllExpenses(): Promise<Expense[]> {
  const q = query(collection(db, COLLECTION), orderBy("spentAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}
