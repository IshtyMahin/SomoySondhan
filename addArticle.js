async function fetchCategories() {
  try {
    const response = await fetch("https://somoysondhan-backend.onrender.com/article/categories/");
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

async function CategoriesSelect() {
  const categoriesSelect = document.getElementById("categories");
  const categories = await fetchCategories();

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categoriesSelect.appendChild(option);
  });
}

async function handleSubmit(event) {
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
  fetch("https://somoysondhan-backend.onrender.com/article/list/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      // window.location.href = "index.html";
    });

}
async function handleCategorySubmit(event) {
  event.preventDefault();
  const category = document.getElementById("category").value;
  

  const formData = {
    name:category
  };
  fetch("https://somoysondhan-backend.onrender.com/article/categories/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      window.location.href = "index.html";
    });
}

document.addEventListener("DOMContentLoaded", CategoriesSelect);
