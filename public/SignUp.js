async function registerUser(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const emailId = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await axios.post("http://localhost:3000/user/signUp", {
      name,
      emailId,
      password,
    });
    console.log(response);
    alert(response.data.message);
  } catch (error) {
    // console.log(error);
    // console.log(error.response.data.message);
    alert(error.response.data.message);
  }
}
