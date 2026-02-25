import { useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  writeBatch,
} from "firebase/firestore";

const COLLECTIONS = [
  "transactions",
  "categories",
  "accounts",
  "goals",
  "userRules",
];

export const useBackup = () => {
  const { user } = useAuth();

  /**
   * Queries all owned collections and triggers a JSON file download.
   * Document IDs are preserved so the file can be used for a full restore.
   */
  const exportData = useCallback(async () => {
    if (!user?.id) return;

    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      userId: user.id,
      data: {},
    };

    for (const col of COLLECTIONS) {
      const q = query(collection(db, col), where("userId", "==", user.id));
      const snapshot = await getDocs(q);
      backup.data[col] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    }

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financedash-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [user?.id]);

  /**
   * Reads a JSON backup file and writes all documents back to Firestore.
   * Uses the original document IDs (setDoc), so re-importing overwrites
   * existing documents rather than creating duplicates.
   * Ownership is re-stamped with the current user to prevent data hijacking.
   *
   * @param {File} file  The .json backup file selected by the user
   */
  const importData = useCallback(
    async (file) => {
      if (!user?.id) return { success: false, error: "Not authenticated" };

      try {
        const text = await file.text();
        const backup = JSON.parse(text);

        if (!backup?.data || backup.version !== 1) {
          return { success: false, error: "invalid_format" };
        }

        let batch = writeBatch(db);
        let opCount = 0;

        const flush = async () => {
          await batch.commit();
          batch = writeBatch(db);
          opCount = 0;
        };

        for (const col of COLLECTIONS) {
          const docs = backup.data[col] ?? [];
          for (const { id, ...data } of docs) {
            const docRef = doc(db, col, id);
            // Re-stamp ownership so imported docs belong to the current user
            batch.set(docRef, {
              ...data,
              userId: user.id,
              allowedUsers: [user.id],
            });
            opCount++;
            if (opCount >= 490) await flush();
          }
        }

        if (opCount > 0) await flush();

        return { success: true };
      } catch (error) {
        console.error("Import error:", error);
        return { success: false, error: error.message };
      }
    },
    [user?.id]
  );

  return { exportData, importData };
};
