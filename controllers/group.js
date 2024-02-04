const Group = require("../models/group");
const GroupMember = require("../models/member");

// Controller to create a new group
const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    const userId = req.user.id;

    // We Create the group with a name;
    const group = await Group.create({ name, userId });

    // Add the group creator as a group member
    await GroupMember.create({ groupId: group.id, userId, isAdmin: true });

    res.status(201).json({
      message: "Group created successfully",
      msg: "You are the creator of the group",
      // group,
      groupId: group.id,
      name: group.name,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getCreatedGroup = async (req, res) => {
  try {
    const userId = req.user.id;

    //First: Find all groups
    const groups = await Group.findAll();

    //Second: Whoever is joined in the group filter them based on the group-user association (Filter groups based on user's association)
    const userGroups = await Promise.all(
      groups.map(async (group) => {
        const isMember = await GroupMember.findOne({
          where: { groupId: group.id, userId },
        });
        if (isMember) {
          return {
            name: group.name,
            groupId: group.id,
          };
        }
      })
    );

    // if there is any undefined values remove from the array by using the filter method
    const filteredGroups = userGroups.filter((group) => group);

    res.status(200).json({
      message: "Groups fetched successfully",
      groups: filteredGroups,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createGroup, getCreatedGroup };
