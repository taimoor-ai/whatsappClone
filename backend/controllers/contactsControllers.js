
const User = require("../models/Users");

// @desc    Sync contacts
// @route   POST /api/contacts/sync
// @access  Private
const Async = async (req, res) => {
  console.log("Syncing contacts...");
  try {
    const { contacts } = req.body; // [{ phoneNumber, name }, ...]
    console.log(contacts)
    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ message: "Contacts must be an array" });
    }

    // Extract phone numbers
    const phoneNumbers = contacts.map(c => c.phoneNumber);

    // Find registered users in database
    const registeredUsers = await User.find({
      phoneNumber: { $in: phoneNumbers },
    }).select("name phoneNumber profilePic status about");

    // Merge with local contact name from phone
    const mergedUsers = registeredUsers.map(user => {
      const localContact = contacts.find(
        c => c.phoneNumber === user.phoneNumber
      );
      return {
        ...user.toObject(),
        contactName: localContact ? localContact.name : user.name, // local name or default name
      };
    });

    res.json({
      success: true,
      registeredUsers: mergedUsers,
    });
  } catch (error) {
    console.error("Contact Sync Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {Async};
