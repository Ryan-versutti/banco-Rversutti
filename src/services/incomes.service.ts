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
import { Income, IncomeInput } from "@/types/income";
import { getMonthRange } from "@/utils/date";

const COLLECTION = "incomes";

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Income {
  const data = snap.data();
  return {
    id: snap.id,
    name: data.name,
    amount: data.amount,
    receivedAt: (data.receivedAt as Timestamp).toDate(),
    isRecurring: !!data.isRecurring,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
  };
}

export async function createIncome(input: IncomeInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    name: input.name,
    amount: input.amount,
    receivedAt: Timestamp.fromDate(input.receivedAt),
    isRecurring: input.isRecurring,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateIncome(id: string, input: Partial<IncomeInput>): Promise<void> {
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (input.name !== undefined) payload.name = input.name;
  if (input.amount !== undefined) payload.amount = input.amount;
  if (input.receivedAt !== undefined) payload.receivedAt = Timestamp.fromDate(input.receivedAt);
  if (input.isRecurring !== undefined) payload.isRecurring = input.isRecurring;
  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function deleteIncome(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getIncome(id: string): Promise<Income | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return fromDoc(snap as QueryDocumentSnapshot<DocumentData>);
}

export async function listIncomesByMonth(year: number, month: number): Promise<Income[]> {
  const { start, end } = getMonthRange(year, month);
  const q = query(
    collection(db, COLLECTION),
    where("receivedAt", ">=", Timestamp.fromDate(start)),
    where("receivedAt", "<", Timestamp.fromDate(end)),
    orderBy("receivedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function listAllIncomes(): Promise<Income[]> {
  const q = query(collection(db, COLLECTION), orderBy("receivedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}
