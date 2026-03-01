// db.js
import * as SQLite from "expo-sqlite";

let dbInstance = null;

// Function to get database instance
export async function getDB() {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync("whatsApp2.db");
    console.log("Database opened");
  }
  return dbInstance;
}

export const closeDB = async () => {
  console.log("i am here");
  if (dbInstance) {
    console.log("i am inside");
    await dbInstance.closeAsync();
    dbInstance = null;
    console.log("Database closed");
  }
};
