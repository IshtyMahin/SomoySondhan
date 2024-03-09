let admin_navbar = false;

const isAdmin_navbar = async () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  
  showSpinner()
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
          admin_navbar = userData.is_superuser;
          // Call checkLoggedIn() after updating admin_navbar
          checkLoggedIn();
        }
      })
      .catch((error) => {
        console.error("Error fetching user information:", error);
      });
  }
  hideSpinner()
};

const checkLoggedIn = () => {
  showSpinner()
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
    if (admin_navbar) {
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
  hideSpinner()
};

window.addEventListener("load", isAdmin_navbar);

const handleLogout = () => {
  showSpinner()
  const token = localStorage.getItem("token");

  if (token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    window.location.href = "login.html";
  } else {
    console.log("User not logged in");
  }
  hideSpinner()
};
