const getQueryParam = (name) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};
const articleId = getQueryParam("id");
async function fetchCategories() {
  try {
    const response = await fetch("http://127.0.0.1:8000/article/categories/");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

async function fetchArticleDetails() {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/article/list/${articleId}/`
    );
    const article = await response.json();
    return article;
  } catch (error) {
    console.error("Error fetching article details:", error);
  }
}

async function EditForm() {
  const article = await fetchArticleDetails();
  document.getElementById("headline").value = article.headline;
  document.getElementById("body").value = article.body;

  const categoriesSelect = document.getElementById("categories");
  const allCategories = await fetchCategories();

  allCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;

    if (article.categories.includes(category.name)) {
      option.selected = true;
    }

    categoriesSelect.appendChild(option);
  });
}

async function handleEditSubmit(event) {
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

  fetch(`http://127.0.0.1:8000/article/list/${articleId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      window.location.href = `article_detail.html?id=${articleId}`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  EditForm();
});
