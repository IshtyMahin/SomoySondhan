const fetchCategories = async () => {
  try {
    showSpinner()
    const response = await fetch(
      "https://somoysondhan-backend.onrender.com/article/categories/"
    );
    const categories = await response.json();
    hideSpinner()
    return categories;
  } catch (error) {
    showSpinner()
    console.error("Error fetching categories:", error);
  }
};

const CategoriesSelect = async () => {
  const categoriesSelect = document.getElementById("categories");
  showSpinner()
  const categories = await fetchCategories();
  hideSpinner()
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categoriesSelect.appendChild(option);
  });
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const headline = document.getElementById("headline").value;
  const body = document.getElementById("body").value;
  const categoriesSelect = document.getElementById("categories");
  const categories = Array.from(categoriesSelect.selectedOptions).map(
    (option) => option.textContent
  );

  const formData = {
    headline,
    body,
    categories,
  };
  showSpinner()
  fetch("https://somoysondhan-backend.onrender.com/article/list/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      // console.log(data);
      window.location.href = "/";
      hideSpinner()
    });
};

const handleCategorySubmit = async (event) => {
  event.preventDefault();
  const category = document.getElementById("category").value;

  const formData = {
    name: category,
  };
  showSpinner()
  fetch("https://somoysondhan-backend.onrender.com/article/categories/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      // console.log(data);
      window.location.href = "/";
      hideSpinner()
    });
};

document.addEventListener("DOMContentLoaded", CategoriesSelect);
