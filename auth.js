const handleRegistration = (event) => {
  event.preventDefault();
  const username = getValue("username");
  const first_name = getValue("first-name");
  const last_name = getValue("last-name");
  const email = getValue("email");
  const password = getValue("password");
  const confirm_password = getValue("confirm-password");
  const info = {
    'username':username,
    'first_name':first_name,
    'last_name':last_name,
    'email':email,
    'password':password,
    'confirm_password':confirm_password,
  };

  console.log(info);
  fetch("http://127.0.0.1:8000/user/register/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(info),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      const element = document.getElementById("login-error")
      if (Array.isArray(data['username'])) {
        element.textContent =
          data["username"][0];
      }
      else if (Array.isArray(data["password"])) {
        element.textContent = data["password"][0];
      } else if (data["error"]) {
        element.textContent = data["error"];
      } else {
        
        element.textContent = "Check your mail for confirmation";
        element.classList.remove("text-red-500");
        element.classList.add("text-green-500");
  
      }
    })
};
const getValue = (id) => {
  const value = document.getElementById(id).value;
  return value;
};

const handleLogin = (event) => {
  event.preventDefault();
  const username = getValue("login-username");
  const password = getValue("login-password");
  console.log(username, password);
  fetch("http://127.0.0.1:8000/user/login/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.token && data.user_id) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);
        window.location.href = "index.html";
      } else {
        console.log(data);
        document.getElementById("login-error").textContent = data.error;
      }
    })
    .catch((error) => {
      document.getElementById("login-error").textContent = error.message;
    });
};
