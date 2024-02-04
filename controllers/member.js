const GroupMember = require("../models/member");
const Group = require("../models/group");
const User = require("../models/User");

// Add a user to a group
const addUserToGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if the user exists in the database
    const user = await User.findOne({ where: { emailId: req.body.emailId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is an admin
    const isAdmin = await GroupMember.findOne({
      where: { groupId: group.id, userId: req.user.id, isAdmin: true },
    });

    if (!isAdmin) {
      return res.status(400).json({ error: "You are not an admin" });
    }

    // Check if the user already exists in the group
    const existingMember = await GroupMember.findOne({
      where: { groupId: group.id, userId: user.id },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ error: "User already exists in the group" });
    }

    // Add the user to the group, and initially user is not admin, he cannot add or remove other members.
    await GroupMember.create({
      groupId: group.id,
      userId: user.id,
      isAdmin: false,
    });

    res.status(200).json({ message: "User added to group successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to add user to group" });
  }
};

const makeAdmin = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if the user exists in the database
    const user = await User.findByPk(req.params.userId);
    // console.log(user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is an admin
    const isAdmin = await GroupMember.findOne({
      where: { groupId: group.id, userId: req.user.id, isAdmin: true },
    });

    if (!isAdmin) {
      return res.status(400).json({ error: "You are not an admin" });
    }

    // Check if the user already exists in the group
    const existingMember = await GroupMember.findOne({
      where: { groupId: group.id, userId: user.id },
    });

    if (!existingMember) {
      return res
        .status(400)
        .json({ error: "User is not the member of the group" });
    }

    existingMember.isAdmin = true;
    await existingMember.save();

    res.status(200).json({ message: "User is now Admin of the group" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to add user to group" });
  }
};

const removeAdmin = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if the user exists in the database
    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is an admin
    const isAdmin = await GroupMember.findOne({
      where: { groupId: group.id, userId: req.user.id, isAdmin: true },
    });

    if (!isAdmin) {
      return res.status(400).json({ error: "You are not an admin" });
    }

    // Check if the user already exists in the group
    const existingMember = await GroupMember.findOne({
      where: { groupId: group.id, userId: user.id },
    });

    if (!existingMember) {
      return res
        .status(400)
        .json({ error: "User is not the member of the group" });
    }

    // Check if the user being removed is the creator of the group
    if (existingMember.userId === group.userId) {
      return res
        .status(400)
        .json({ error: "Cannot remove the group creator from admin" });
    }

    existingMember.isAdmin = false;
    await existingMember.save();

    res
      .status(200)
      .json({ message: "User is no longer an admin of the group" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to add user to group" });
  }
};

const removeGroupMember = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if the user exists in the database
    const user = await User.findByPk(req.params.userId);
    // console.log("This is the details: ", user);

    // if there is no user in the database then throw an error
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is an admin
    const isAdmin = await GroupMember.findOne({
      where: { groupId: group.id, userId: req.user.id, isAdmin: true },
    });

    if (!isAdmin) {
      return res.status(400).json({ error: "You are not an admin" });
    }

    // Check if the user already exists in the group
    const existingMember = await GroupMember.findOne({
      where: { groupId: group.id, userId: user.id },
    });

    if (!existingMember) {
      return res
        .status(400)
        .json({ error: "User is not the member of the group" });
    }

    if (existingMember.userId === group.userId) {
      return res.status(400).json({ error: "Cannot remove the group creator" });
    }

    await existingMember.destroy();

    res
      .status(200)
      .json({ message: "User deleted from the group successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to add user to group" });
  }
};

const getUserGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    // const userId = req.params.id;
    const members = await GroupMember.findAll({
      where: { groupId },
      include: [{ model: User, attributes: ["id", "name", "emailId"] }],
    });
    res.status(200).json({ members });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  addUserToGroup,
  getUserGroup,
  removeGroupMember,
  makeAdmin,
  removeAdmin,
};
