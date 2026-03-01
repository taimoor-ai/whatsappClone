import { chatsData } from "./data";
import { getDB } from "./db";

export const createChatIfNotExists = async (chatData) => {
  const db = await getDB();

  // Check if chat already exists
  const existing = await db.getFirstAsync("SELECT * FROM chats WHERE id = ?;", [
    chatData.id,
  ]);

  if (!existing) {
    await db.runAsync(
      `INSERT INTO chats (id, name, avatarUrl, lastMessageText,lastMessageSenderId,lastMessageTime)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [chatData.id, chatData.name, chatData.avatar, "", "", 0],
    );

    console.log("Chat created!");
  }
};
export const insertChats = async () => {
  const db = await getDB();
  for (let chat of chatsData) {
    await db.execAsync(`
      INSERT OR REPLACE INTO chats
      (id, name, avatarUrl, lastMessageText,lastMessageSenderId,lastMessageTime)
      VALUES
      ('${chat.id}', '${chat.name}', '${chat.avatar}', '${chat.lastMessageText}', '${chat.lastMessageSenderId}', ${chat.lastMessageTime});
    `);
  }
  console.log("Chats inserted successfully!");
};
export const clearChatsTable = async () => {
  try {
    const db = await getDB();
    await db.execAsync(`DELETE FROM chats;`);
    console.log("Chats table cleared!");
  } catch (error) {
    console.error("Error clearing chats table:", error);
  }
};
export const getAllChats = async () => {
  const db = await getDB();

  const chats = await db.getAllAsync(`
    SELECT * FROM chats
    ORDER BY lastMessageTime DESC;
  `);

  return chats;
};
export const getChatById = async (id) => {
  try {
    const db = await getDB();

    const result = await db.getFirstAsync("SELECT * FROM chats WHERE id = ?;", [
      id,
    ]);

    // result will be: { id: '1', name: 'John', ... } OR null
    return result;
  } catch (error) {
    console.error("Error getting chat by ID:", error);
    return null;
  }
};

export const getChatByPhone = async (phone) => {
  const db = await getDB();
  return await db.getFirstAsync("SELECT * FROM chats WHERE id = ?;", [phone]);
};

export const setChatAsRead = async (chatId) => {
  const db = await getDB();
  await db.runAsync(`UPDATE chats SET unReadCount = 0 WHERE id = ?;`, [chatId]);
};
