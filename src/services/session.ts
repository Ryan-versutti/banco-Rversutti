import { auth } from "@/lib/firebase";

export function requireUserId(): string {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  return user.uid;
}
