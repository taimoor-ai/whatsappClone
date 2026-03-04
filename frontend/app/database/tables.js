import { getDB } from "./db";

export const createTables = async () => {
  try {
    const db = await getDB();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS chats (
          id TEXT PRIMARY KEY,
  message_type TEXT,
  name TEXT,
  avatarUrl TEXT,
  lastMessageText TEXT,
  lastMessageSenderId TEXT,
  lastMessageTime INTEGER,
  unReadCount INTEGER
        
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        message_id TEXT PRIMARY KEY,
        chat_id TEXT,
        sender_id TEXT,
        sender_phone TEXT,
        receiver_id TEXT,
        receiver_phone TEXT,
        content TEXT,
        message_type TEXT,
        sent_at INTEGER,
        isMe BOOLEAN,
        reply_to TEXT,
        media_url TEXT
      );
    `);

    console.log("Tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};
