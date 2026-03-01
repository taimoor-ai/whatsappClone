import * as SQLite from "expo-sqlite";
import { closeDB, getDB } from "./db";
export const deleteDatabase = async () => {
  try {
    await closeDB(); // 🔥 Close first
    await SQLite.deleteDatabaseAsync("whatsApp2.db");
    console.log("Database deleted successfully!");
  } catch (error) {
    console.error("Error deleting database:", error);
  }
};

export const clearDatabase = async () => {
  const db = await getDB();

  await db.execAsync(`
    DELETE FROM messages;
    DELETE FROM chats;
  `);

  console.log("Database cleared");
};
