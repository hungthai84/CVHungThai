import { db } from './index';
import { users } from './schema';

export async function getOrCreateUser(uid: string, email: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Failed to get or create user in Database:", error);
    throw new Error("Failed to sync user with SQL database", { cause: error });
  }
}
