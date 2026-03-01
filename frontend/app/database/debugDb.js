import { getDB } from "./db";

export const debugDatabase = async () => {
  try {
    const db = await getDB();

    console.log("========== DATABASE DEBUG START ==========");

    // 1️⃣ Show all tables
    const tables = await db.getAllAsync(
      "SELECT name FROM sqlite_master WHERE type='table';",
    );
    console.log("📂 Tables:", tables);

    // 2️⃣ Show chats
    try {
      const chats = await db.getAllAsync("SELECT * FROM chats;");
      console.log("💬 Chats:", chats);
    } catch (err) {
      console.log("Chats table not found");
    }

    // 3️⃣ Show messages
    try {
      const messages = await db.getAllAsync("SELECT * FROM messages;");
      console.log("📨 Messages:", messages);
    } catch (err) {
      console.log("Messages table not found");
    }

    // 4️⃣ Show undelivered messages
    try {
      const undelivered = await db.getAllAsync(
        "SELECT * FROM undelivered_messages;",
      );
      console.log("📦 Undelivered:", undelivered);
    } catch (err) {
      console.log("Undelivered table not found");
    }

    console.log("=========== DATABASE DEBUG END ===========");
  } catch (error) {
    console.log("❌ Database debug error:", error);
  }
};
