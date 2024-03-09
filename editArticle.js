

const getQueryParam = (name) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

const articleId = getQueryParam("id");

const fetchCategories = async () => {
  try {
    showSpinner(); // Show spinner while fetching categories
    const response = await fetch(
      "https://somoysondhan-backend.onrender.com/article/categories/"
    );
    const data = await response.json();
    hideSpinner(); // Hide spinner after fetching categories
    return data;
  } catch (error) {
    hideSpinner(); // Hide spinner if an error occurs
    console.error("Error fetching categories:", error);
  }
};

const fetchArticleDetails = async () => {
  try {
    showSpinner(); // Show spinner while fetching article details
    const response = await fetch(
      `https://somoysondhan-backend.onrender.com/article/list/${articleId}/`
    );
    const article = await response.json();
    hideSpinner(); // Hide spinner after fetching article details
    return article;
  } catch (error) {
    hideSpinner(); // Hide spinner if an error occurs
    console.error("Error fetching article details:", error);
  }
};

const EditForm = async () => {
  showSpinner(); // Show spinner while loading edit form
  const article = await fetchArticleDetails();
  document.getElementById("headline").value = article.headline;
  document.getElementById("body").value = article.body;

  const selectedCategory = document.getElementById("categories");
  const categories = await fetchCategories();

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;

    if (article.categories.includes(category.name)) {
      option.selected = true;
    }

    selectedCategory.appendChild(option);
  });

  hideSpinner(); // Hide spinner after loading edit form
};

const handleEditSubmit = (event) => {
  event.preventDefault();
  const headline = document.getElementById("headline").value;
  const body = document.getElementById("body").value;
  const selectedCategory = document.getElementById("categories");
  const categories = Array.from(selectedCategory.selectedOptions).map(
    (option) => option.textContent
  );

  const data = {
    headline,
    body,
    categories,
  };

  showSpinner(); // Show spinner while submitting edit form

  fetch(
    `https://somoysondhan-backend.onrender.com/article/list/${articleId}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      hideSpinner(); // Hide spinner after submitting edit form
      // console.log(data);
      window.location.href = `article_detail.html?id=${articleId}`;
    });
};

document.addEventListener("DOMContentLoaded", () => {
  EditForm();
});
