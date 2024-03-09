

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
    if (admin) {
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
