const socket = io("http://localhost:3000");

socket.on("connect", () => {
  // console.log(socket);
  console.log("A user connected to the server");
  console.log("Id of the socket: ", socket.id);
});

// let groups = JSON.parse(localStorage.getItem("groups")) || [];
let groups = [];
const storedGroups = localStorage.getItem("groups");
if (storedGroups) {
  try {
    groups = JSON.parse(storedGroups);
  } catch (error) {
    console.error("Error parsing stored groups:", error);
  }
}

// Function to fetch the created group from the database
async function getCreatedGroup() {
  try {
    const token = JSON.parse(localStorage.getItem("userDetails"));

    const response = await axios.get(`http://localhost:3000/api/group/get`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response);
    console.log(response.data);
    console.log(response.data.groups);

    localStorage.setItem("groups", JSON.stringify(response.data.groups));
    displayGroups();
  } catch (error) {
    console.log(error);
  }
}

// Function to create a group
async function createGroup(event) {
  event.preventDefault();
  let group = document.getElementById("group").value;
  document.getElementById("group").value = "";

  let groupName = {
    name: group,
  };

  try {
    const token = JSON.parse(localStorage.getItem("userDetails"));

    const response = await axios.post(
      `http://localhost:3000/api/group/create`,
      groupName,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    groups.push({ GroupName: group, groupId: response.data.groupId });

    localStorage.setItem("groups", JSON.stringify(groups));

    console.log(response);
    // console.log(response.data.groupId);
    // console.log(response.data.id);
    alert(response.data.message); // Alert that the group was created successfully
    alert(response.data.msg);
    displayGroups();
  } catch (error) {
    console.log(error);
    alert(error.response.data.error);
  }
}

function displayGroups() {
  const container = document.getElementById("container");
  container.innerHTML = "";

  groups.forEach((group) => {
    const addElement = document.createElement("div");
    addElement.id = "addGroup";

    const groupIdElement = document.createElement("span");
    groupIdElement.textContent = `Id: ${group.groupId} ➡️ `;
    addElement.appendChild(groupIdElement);

    const groupNameElement = document.createElement("span");
    groupNameElement.textContent = group.name;
    addElement.appendChild(groupNameElement);

    const openButton = document.createElement("button");
    openButton.textContent = "Open";
    openButton.addEventListener("click", () =>
      openGroup(group.groupId, group.name)
    );

    addElement.appendChild(openButton);
    container.appendChild(addElement);
  });
}

function openGroup(groupId, groupName) {
  console.log("Opened group ID:", groupId);

  let replaceGroup = document.getElementById("create");
  replaceGroup.style.display = "none";

  const chatWindow = document.getElementById("chatWindow");
  chatWindow.innerHTML = "";

  const header = document.createElement("h2");
  header.id = "groupName";
  header.textContent = groupName;

  const addUserButton = document.createElement("button");
  addUserButton.textContent = "Add User 🙎";
  addUserButton.id = "addUser";
  addUserButton.addEventListener("click", () => showAddUserForm());

  const inputField2 = document.createElement("input");
  inputField2.type = "file";
  inputField2.id = "file-input";
  inputField2.addEventListener("change", () => uploadFile(groupId));

  const bodyWindow = document.createElement("div");
  bodyWindow.id = "chatBox";

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.id = "groupChat";
  inputField.placeholder = "Type your message";

  const sendButton = document.createElement("button");
  sendButton.textContent = "Send";
  sendButton.id = "sendButton";
  sendButton.addEventListener("click", () => sendMessageToGroup(groupId));

  const backButton = document.createElement("span");
  backButton.textContent = "🔙";
  backButton.style.cursor = "pointer";
  backButton.addEventListener("click", () => goBack());

  const showAllUsersButton = document.createElement("button");
  showAllUsersButton.textContent = "GroupMembers 🙎";
  // showAllUsersButton.id = "groupMembers";
  showAllUsersButton.addEventListener("click", () => getAllMembers(groupId));

  const groupMembersList = document.createElement("p");
  groupMembersList.id = "groupMembers";

  // bodyWindow.appendChild(header);
  chatWindow.appendChild(backButton);
  chatWindow.appendChild(addUserButton);
  chatWindow.appendChild(showAllUsersButton);
  chatWindow.appendChild(inputField2);

  chatWindow.appendChild(groupMembersList);

  chatWindow.appendChild(header);
  chatWindow.appendChild(bodyWindow);

  chatWindow.appendChild(inputField);

  chatWindow.appendChild(sendButton);

  function showAddUserForm() {
    // chatWindow.removeChild(addUserButton);

    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.id = "userInput";
    inputField.placeholder = "Enter User EmailId";

    const submitButton = document.createElement("button");
    submitButton.textContent = "Submit";
    submitButton.addEventListener("click", () => {
      addUserToGroup(groupId);
      chatWindow.removeChild(inputField);
      chatWindow.removeChild(submitButton);
    });

    chatWindow.appendChild(inputField);
    chatWindow.appendChild(submitButton);
  }

  async function addUserToGroup(groupId) {
    const emailId = document.getElementById("userInput").value;
    document.getElementById("userInput").value = "";

    const user = {
      emailId: emailId,
    };

    try {
      const token = JSON.parse(localStorage.getItem("userDetails"));

      const response = await axios.post(
        `http://localhost:3000/api/member/add/${groupId}`,
        user,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      alert(response.data.message);
    } catch (error) {
      console.log(error);
      alert(error.response.data.error);
    }
  }
  async function getAllMembers(groupId) {
    try {
      const token = JSON.parse(localStorage.getItem("userDetails"));

      const response = await axios.get(
        `http://localhost:3000/api/member/get/${groupId}`,
        // user,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response);
      // console.log(response.data.members);

      const members = response.data.members;
      // console.log(members);
      displayMembers(members);
      // console.log(response.data.members.id);
      // alert(response.data.message);
    } catch (error) {
      console.log(error);
      alert(error.response.data.error);
    }
  }

  function displayMembers(members) {
    // Assuming there is a container element to display the members
    const membersContainer = document.getElementById("groupMembers");
    membersContainer.textContent = "";

    members.forEach((member) => {
      console.log(member);
      const isAdmin = member.isAdmin ? "Admin" : "Not an Admin";

      const memberElement = document.createElement("li");
      memberElement.textContent = `${member.userId} -- ${member.user.name} -- ${isAdmin}🙎`;

      const adminButton = document.createElement("button");
      adminButton.textContent = member.isAdmin ? "Remove Admin" : "Make Admin";
      adminButton.addEventListener("click", async () => {
        try {
          const token = JSON.parse(localStorage.getItem("userDetails"));
          const endpoint = member.isAdmin ? `removeAdmin` : `makeAdmin`;

          const response = await axios.post(
            `http://localhost:3000/api/member/${endpoint}/${member.groupId}/${member.userId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log(response);
          alert(response.data.message);
        } catch (error) {
          console.log(error);
          alert(error.response.data.error);
        }
      });
      memberElement.appendChild(adminButton);

      const removeButton = document.createElement("button");
      removeButton.textContent = "❎";
      removeButton.addEventListener("click", async () => {
        try {
          const token = JSON.parse(localStorage.getItem("userDetails"));

          const deleteResponse = await axios.delete(
            `http://localhost:3000/api/member/groupId/${member.groupId}/userId/${member.userId}`,
            // user,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log(deleteResponse);
          alert(deleteResponse.data.message);
        } catch (error) {
          console.log(error);
          alert(error.response.data.error);
        }
      });
      memberElement.appendChild(removeButton);
      membersContainer.appendChild(memberElement);
    });

    membersContainer.addEventListener("click", function () {
      membersContainer.textContent = ""; // Clear the content
    });
  }

  let lastDisplayedMessageId = null;
  // Function to display messages in the chatbox
  async function displayMessages() {
    try {
      const token = JSON.parse(localStorage.getItem("userDetails"));

      const response = await axios.get(
        `http://localhost:3000/api/chat/get/${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log(response);
      // console.log(response.data.messages);

      const messages = response.data.messages;
      const chatBox = document.getElementById("chatBox");

      messages.forEach((message) => {
        // console.log(messageId);
        if (message.id > lastDisplayedMessageId) {
          const messageElement = document.createElement("p");
          messageElement.textContent = ` 💬 ${message.content}   `;
          chatBox.appendChild(messageElement);
        }
      });

      if (messages.length > 0) {
        lastDisplayedMessageId = messages[messages.length - 1].id;
      }
    } catch (error) {
      console.log(error);
    }
  }
  displayMessages();

  // setInterval(() => displayMessages(), 1000);
}

socket.on("message", (message) => {
  console.log(message);
  // Append the new message to the chatbox
  const chatBox = document.getElementById("chatBox");
  const messageElement = document.createElement("p");
  messageElement.textContent = `💬 ${message.content}   `;
  chatBox.appendChild(messageElement);
});

function goBack() {
  const createSection = document.getElementById("create");
  createSection.style.display = "block";

  const chatWindow = document.getElementById("chatWindow");
  chatWindow.innerHTML = "";
}

async function uploadFile(groupId) {
  const fileInput = document.getElementById("file-input");
  const file = fileInput.files[0];

  if (file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = JSON.parse(localStorage.getItem("userDetails"));

      const response = await axios.post(
        `http://localhost:3000/api/chat/upload/${groupId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const mediaUrl = response.data.message.content;

      // Append the image to the chat window
      const chatBox = document.getElementById("chatBox");
      const imageElement = document.createElement("img");
      imageElement.src = mediaUrl; // Set the src attribute to the image URL
      chatBox.appendChild(imageElement);

      // Reset file input
      fileInput.value = ""; // Reset file input
    } catch (error) {
      console.log(error);
      alert(error.response.data.error);
    }
  } else {
    alert("Please select a file to upload.");
  }
}

async function sendMessageToGroup(groupId) {
  let input = document.getElementById("groupChat").value;
  document.getElementById("groupChat").value = "";

  const message = {
    content: input,
  };

  try {
    const token = JSON.parse(localStorage.getItem("userDetails"));

    const response = await axios.post(
      `http://localhost:3000/api/chat/create/${groupId}`,
      message,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    socket.emit("sendMessage", message);

    console.log(response);
    // console.log(response.data.message.content);
  } catch (error) {
    console.log(error);
    // console.log(error.response.data.error);
    alert(error.response.data.error);
  }
}

// Function to log out
function logOut(e) {
  e.preventDefault();
  localStorage.removeItem("userDetails");
  window.location.href = "./SignIn.html";
}

// Event listener for creating a group
document.getElementById("groupName").addEventListener("click", createGroup);

// Event listener for logging out
document.getElementById("logout").addEventListener("click", logOut);

// Call the getCreatedGroup function to fetch and display the created group
getCreatedGroup();
