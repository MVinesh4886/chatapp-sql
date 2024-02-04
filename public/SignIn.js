async function loginUser(event) {
  event.preventDefault();
  const emailId = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await axios.post("http://localhost:3000/user/signIn", {
      emailId,
      password,
    });
    console.log(response.data);
    // console.log(response.data.message);
    alert(response.data.message);

    localStorage.setItem(
      "userDetails",
      JSON.stringify(response.data.data.token)
    );
    window.location.href = "./Chatapp.html";
  } catch (error) {
    // console.log(error);
    // console.log(error.response.data);
    alert(error.response.data.message);
  }
}

const forgotPasswordButton = document.getElementById("forgotPassword");

forgotPasswordButton.addEventListener("click", async () => {
  const emailId = document.getElementById("email").value;

  // Check if the email field is empty
  if (emailId === "") {
    alert("Please enter your email first");
    return;
  }

  try {
    // Send a POST request to the backend to initiate the password reset process
    const response = await axios.post(
      "http://localhost:3000/user/forgotPassword",
      {
        emailId,
      }
    );

    console.log(response.data); // Email sent successfully
    alert("Check your email");
  } catch (error) {
    // Error message from the backend
    console.log(error);
  }
});
