import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export type AuthUser = {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
};

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}

export async function signInWithGoogle(): Promise<AuthUser | null> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return toAuthUser(result.user);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function watchAuth(cb: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (u) => cb(toAuthUser(u)));
}
