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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category, CategoryInput } from "@/types/category";
import { slugify } from "@/utils/format";

const COLLECTION = "categories";

function fromDoc(snap: QueryDocumentSnapshot<DocumentData>): Category {
  const data = snap.data();
  return {
    id: snap.id,
    name: data.name,
    slug: data.slug,
    createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
  };
}

export async function createCategory(input: Pick<CategoryInput, "name">): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    name: input.name,
    slug: slugify(input.name),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCategory(
  id: string,
  input: Partial<Pick<CategoryInput, "name">>,
): Promise<void> {
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (input.name !== undefined) {
    payload.name = input.name;
    payload.slug = slugify(input.name);
  }
  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getCategory(id: string): Promise<Category | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return fromDoc(snap as QueryDocumentSnapshot<DocumentData>);
}

export async function listCategories(): Promise<Category[]> {
  const q = query(collection(db, COLLECTION), orderBy("name", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}
