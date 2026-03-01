import { getDB } from "./db";

// Fetch all messages for a chat (ordered by time)
export const getMessagesByChatId = async (chatId) => {
  try {
    const db = await getDB();

    const result = await db.getAllAsync(
      `SELECT * FROM messages WHERE chat_id = ? ORDER BY sent_at ASC;`,
      [chatId],
    );

    return result; // array of message objects
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const insertMessage = async (message) => {
  const db = await getDB();

  await db.runAsync(
    `INSERT INTO messages (
      message_id,
      chat_id,
      sender_id,
      sender_phone,
      receiver_id,
      receiver_phone,
      content,
      message_type,
      sent_at,
      isMe,
      reply_to,
      media_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      message.message_id,
      message.chat_id,
      message.sender_id,
      message.sender_phone,
      message.receiver_id,
      message.receiver_phone,
      message.content,
      message.message_type,
      message.sent_at,
      message.isMe,
      message.reply_to,
      message.media_url,
    ],
  );

  // 🔥 Update chat preview
  await db.runAsync(
    `UPDATE chats 
   SET 
     lastMessageText = ?, 
     lastMessageTime = ?, 
     unReadCount = unReadCount + 1
   WHERE id = ?;`,
    [message.content, message.sent_at, message.chat_id],
  );
};
export const getAllMessages = async () => {
  try {
    const db = await getDB();

    const result = await db.getAllAsync(
      `SELECT * FROM messages ORDER BY sent_at ASC;`,
    );

    return result;
  } catch (error) {
    console.error("Error loading messages:", error);
    return [];
  }
};
