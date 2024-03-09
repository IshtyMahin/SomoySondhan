
const checkLoggedIn = () => {
  const token = localStorage.getItem("token");
  console.log(token);
  if (token) {
    document.querySelectorAll(".navbar-item").forEach((item) => {
      item.style.display = "none";
    });
    document.querySelectorAll(".profile-item").forEach((item) => {
      item.style.display = "inline-block";
    });
    document.querySelectorAll(".admin-item").forEach((item) => {
      item.style.display = "none";
    });
    isAdmin().then((isAdmin) => {
      if (isAdmin) {
        document.querySelectorAll(".admin-item").forEach((item) => {
          item.style.display = "inline-block";
        });
      }
    });
  } else {
    document.querySelectorAll(".navbar-item").forEach((item) => {
      item.style.display = "inline-block";
    });
    document.querySelectorAll(".admin-item").forEach((item) => {
      item.style.display = "none";
    });
    document.querySelectorAll(".profile-item").forEach((item) => {
      item.style.display = "none";
    });
  }
};


window.addEventListener("load", checkLoggedIn);

const handleLogout = () => {
  const token = localStorage.getItem("token");

  if (token) {
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          window.location.href = "login.html"; 
  } else {
    console.log("User not logged in");
  }
};


function isAdmin() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  if (token) {
    return fetch(`http://127.0.0.1:8000/user/${userId}/is_superuser/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((userData) => {
        if (userData) {
          console.log(userData);
          return userData.is_superuser;
        }
        return false; // Return false if userData is not available or is_superuser is not present
      })
      .catch((error) => {
        console.error("Error fetching user information:", error);
        return false;
      });
  } else {
    return false;
  }
}
