const Message = require("../models/message");
const Group = require("../models/group");
const User = require("../models/User");
const GroupMember = require("../models/member");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEYID,
  secretAccessKey: process.env.SECRET_KEYID,
  region: process.env.REGION,
});

let upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET,
    acl: "public-read",
    key: function (req, file, cb) {
      cb(null, file.originalname);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
});

// Create a new message
const createMessage = async (req, res) => {
  try {
    const { content } = req.body;

    const groupId = req.params.id;
    // Check if the group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if the user exists
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is a member of the group
    const isMember = await GroupMember.findOne({
      where: { groupId: group.id, userId: user.id },
    });
    if (!isMember) {
      return res
        .status(403)
        .json({ error: "User is not a member of the group" });
    }

    // Create the message
    const message = await Message.create({
      content,
      userId: user.id,
      groupId: group.id,
    });

    res.status(200).json({ message: "Message sent successfully", message });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

const uploadFile = async (req, res) => {
  try {
    const groupId = req.params.id;
    // Check if the group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if the user exists
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    //  if the user is a member of the group
    const isMember = await GroupMember.findOne({
      where: { groupId: group.id, userId: user.id },
    });
    if (!isMember) {
      return res
        .status(403)
        .json({ error: "User is not a member of the group" });
    }

    // Upload the file
    upload.single("file")(req, res, async function (err) {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(500).json({ error: "Failed to upload file" });
      }

      //We Get the file URL
      const fileUrl = req.file.location;
      console.log("File URL: " + fileUrl);

      // Update the content message with the file URL
      const message = await Message.create({
        content: fileUrl,
        userId: user.id,
        groupId: group.id,
      });

      res.status(200).json({ message: "File uploaded successfully", message });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

const getMessage = async (req, res) => {
  try {
    const groupId = req.params.id;
    const messages = await Message.findAll({
      where: { groupId },
    });
    res.status(200).json({
      messages,
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createMessage, getMessage, uploadFile };
