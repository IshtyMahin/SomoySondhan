let admin_navbar = false
const isAdmin_navbar = async () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  // Show spinner when checking user role
  showSpinner();

  if (token) {
    try {
      const response = await fetch(
        `https://somoysondhan-backend.onrender.com/user/${userId}/is_superuser/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userData = await response.json();

      if (userData) {
        admin_navbar = userData.is_superuser;
        // Call checkLoggedIn() after updating admin_navbar
        checkLoggedIn();
      }
    } catch (error) {
      console.error("Error fetching user information:", error);
    }
  }

  // Hide spinner after processing
  hideSpinner();
};

const checkLoggedIn = async () => {
  // Show spinner when checking login status
  showSpinner();

  const token = localStorage.getItem("token");

  document.querySelectorAll(".navbar-item").forEach((item) => {
    item.style.display = "none";
  });

  document.querySelectorAll(".profile-item").forEach((item) => {
    item.style.display = "none";
  });

  document.querySelectorAll(".admin-item").forEach((item) => {
    item.style.display = "none";
  });

  if (token) {
    document.querySelectorAll(".profile-item").forEach((item) => {
      item.style.display = "inline-block";
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
  }

  // Hide spinner after processing
  hideSpinner();
};

showSpinner()
window.addEventListener("load", isAdmin_navbar);
hideSpinner()

const handleLogout = async () => {
  // Show spinner when logging out
  showSpinner();

  const token = localStorage.getItem("token");

  if (token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    window.location.href = "login.html";
  } else {
    console.log("User not logged in");
  }

  // Hide spinner after processing
  hideSpinner();
};
