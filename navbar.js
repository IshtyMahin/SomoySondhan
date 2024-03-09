let is_admin = false;
const isAdmin = async () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  if (token) {
    return fetch(
      `https://somoysondhan-backend.onrender.com/user/${userId}/is_superuser/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => response.json())
      .then((userData) => {
        if (userData) {
          // console.log(userData);

          is_admin = userData.is_superuser;
        }
      })
      .catch((error) => {
        console.error("Error fetching user information:", error);
      });
  }
};

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
    if (is_admin) {
      document.querySelectorAll(".admin-item").forEach((item) => {
        item.style.display = "inline-block";
      });
    }
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

window.addEventListener("load", generateCategoryLinks, isAdmin);

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
