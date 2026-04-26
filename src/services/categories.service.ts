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
import { Category, CategoryInput } from "@/types/category";
import { slugify } from "@/utils/format";
import { requireUserId } from "./session";

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

async function ensureOwned(id: string): Promise<void> {
  const uid = requireUserId();
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists() || snap.data().userId !== uid) {
    throw new Error("Categoria não encontrada");
  }
}

export async function createCategory(input: Pick<CategoryInput, "name">): Promise<string> {
  const uid = requireUserId();
  const ref = await addDoc(collection(db, COLLECTION), {
    userId: uid,
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
  await ensureOwned(id);
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (input.name !== undefined) {
    payload.name = input.name;
    payload.slug = slugify(input.name);
  }
  await updateDoc(doc(db, COLLECTION, id), payload);
}

export async function deleteCategory(id: string): Promise<void> {
  await ensureOwned(id);
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getCategory(id: string): Promise<Category | null> {
  const uid = requireUserId();
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists() || snap.data().userId !== uid) return null;
  return fromDoc(snap as QueryDocumentSnapshot<DocumentData>);
}

export async function listCategories(): Promise<Category[]> {
  const uid = requireUserId();
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", uid),
    orderBy("name", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(fromDoc);
}
