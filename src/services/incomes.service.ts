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
import { requireUserId } from "./session";

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

async function ensureOwned(id: string): Promise<void> {
  const uid = requireUserId();
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists() || snap.data().userId !== uid) {
    throw new Error("Receita não encontrada");
  }
}

export async function createIncome(input: IncomeInput): Promise<string> {
  const uid = requireUserId();
  const ref = await addDoc(collection(db, COLLECTION), {
    userId: uid,
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
  await ensureOwned(id);
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (input.name !== undefined) payload.name = input.name;
  if (input.amount !== undefined) payload.amount = input.amount;
  if (input.receivedAt !== undefined) payload.receivedAt = Timestamp.fromDate(input.receivedAt);
  if (input.isRecurring !== undefined) payload.isRecurring = input.isRecurring;
  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function deleteIncome(id: string): Promise<void> {
  await ensureOwned(id);
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getIncome(id: string): Promise<Income | null> {
  const uid = requireUserId();
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists() || snap.data().userId !== uid) return null;
  return fromDoc(snap as QueryDocumentSnapshot<DocumentData>);
}

export async function listIncomesByMonth(year: number, month: number): Promise<Income[]> {
  const uid = requireUserId();
  const { start, end } = getMonthRange(year, month);
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", uid),
    where("receivedAt", ">=", Timestamp.fromDate(start)),
    where("receivedAt", "<", Timestamp.fromDate(end)),
    orderBy("receivedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}

export async function listAllIncomes(): Promise<Income[]> {
  const uid = requireUserId();
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", uid),
    orderBy("receivedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}
