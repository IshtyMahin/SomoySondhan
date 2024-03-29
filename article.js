

const fetchCategories = async () => {
  try {
    showSpinner();
    const response = await fetch(
      "https://somoysondhan-backend.onrender.com/article/categories/"
    );
    const data = await response.json();
    return data;
    hideSpinner()
  } catch (error) {
    hideSpinner();
    console.error("Error fetching categories:", error);
  }
};
let admin = false;
const isAdmin = async () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");
  
  if (token) {
    showSpinner();
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

          admin = userData.is_superuser;
          hideSpinner();
        }
      })
      .catch((error) => {
        console.error("Error fetching user information:", error);
      });
    
  }
};

const generateCategoryLinks = async () => {
  showSpinner();
  const categories = await fetchCategories();
  // console.log(categories);
  
  const categoryLinksContainer = document.getElementById("category-links");

  categories.forEach((category) => {
    const categoryLink = document.createElement("a");
    categoryLink.href = `?category=${category.name.toLowerCase()}`;
    categoryLink.classList.add("mr-4", "text-gray-800");
    categoryLink.textContent = category.name;

    categoryLinksContainer.appendChild(categoryLink);
  });
  hideSpinner();
};

window.addEventListener("load", async () => {
  showSpinner()
  await isAdmin();
  generateCategoryLinks();
  hideSpinner();
});
const getWords = (body, n) => {
  const Words = body.slice(0, n);
  return Words;
};

document.addEventListener("DOMContentLoaded",async function () {
  const getQueryParam = (name) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  };
  showSpinner()
  await isAdmin();
  hideSpinner()
  const categoryName = getQueryParam("category");
  // console.log(categoryName);
  const NewsContainer = document.getElementById("news-section");
  if (categoryName === null) {
    showSpinner()
    fetch("https://somoysondhan-backend.onrender.com/article/categories/")
      .then((response) => response.json())
      .then((categories) => {
        let sectionPromise = Promise.resolve();
        categories.forEach((category) => {
          sectionPromise = sectionPromise.then(() => {
            return new Promise((resolve) => {
              fetch(
                `https://somoysondhan-backend.onrender.com/article/list/?category=${category.name.toLowerCase()}`
              )
                .then((response) => response.json())
                .then((articles) => {
                  // console.log(articles);
                  if (articles.length > 0) {
                    const sectionHTML = `
                    <section id="${category.name.toLowerCase()}-news" class="container mx-auto py-8">
                      <h2 class="text-2xl font-bold mb-4">${
                        category.name
                      } News</h2>
                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${articles
                          .slice(0, 6)
                          .map(
                            (article) => `
                              <div class="p-4 bg-white shadow-lg rounded-lg">
                                <a href="article_detail.html?id=${
                                  article.id
                                }" class="text-xl font-semibold mb-2">${
                              article.headline
                            }</a>
                                <p>${getWords(article.body, 50)}....</p>
                                 ${
                                   admin
                                     ? `<div class="flex justify-end mt-2">
        <button class="px-4 py-2 bg-gray-800 text-white rounded-md mr-2"><a href="edit_article.html?id=${article.id}">Edit</a></button>
        <button class="px-4 py-2 bg-red-800 text-white rounded-md"><a href="#" onclick="deleteArticle(${article.id})">Delete</a></button>
      </div>`
                                     : ""
                                 }
                              </div>
                            `
                          )
                          .join("")}
                      </div>
                      <div class="flex justify-center mt-4">
                        <button class="px-4 py-2 bg-gray-800 text-white rounded-md"><a href="?category=${category.name.toLowerCase()}">See More</a></button>
                      </div>
                    </section>
                  `;
                    NewsContainer.insertAdjacentHTML("beforeend", sectionHTML);
                  }
                  resolve();
                })
                .catch((error) =>
                  console.error(
                    `Error fetching articles for category ${category.name}:`,
                    error
                  )
                );
            });
          });
        });
      })
      .catch((error) => console.error("Error fetching categories:", error));
    hideSpinner();
  } else {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");
    if (token && userId) {
      showSpinner()
      fetch(
        `https://somoysondhan-backend.onrender.com/article/list/?category=${categoryName}`
      )
        .then((response) => response.json())
        .then((articles) => {
          articles.sort((a, b) => b.average_rating - a.average_rating);

          // console.log(articles);

          if (articles.length > 0) {
            const sectionHTML = `
                    <section id="${categoryName}-news" class="container mx-auto py-8">
                      <h2 class="text-2xl font-bold mb-4">${
                        categoryName.charAt(0).toUpperCase() +
                        categoryName.slice(1)
                      } News</h2>
                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${articles
                          .map(
                            (article) => `
                              <div class="p-4 bg-white shadow-lg rounded-lg">
                                <a href="article_detail.html?id=${
                                  article.id
                                }" class="text-xl font-semibold mb-2">${
                              article.headline
                            }</a>
                                <p>${getWords(article.body, 150)}....</p>
                                ${
                                  admin
                                    ? `<div class="flex justify-end mt-2">
        <button class="px-4 py-2 bg-gray-800 text-white rounded-md mr-2"><a href="edit_article.html?id=${article.id}">Edit</a></button>
        <button class="px-4 py-2 bg-red-800 text-white rounded-md"><a href="#" onclick="deleteArticle(${article.id})">Delete</a></button>
      </div>`
                                    : ""
                                }
                              </div>
                              
                              
                            `
                          )
                          .join("")}
                          
                      </div>
                    </section>
                  `;

            NewsContainer.insertAdjacentHTML("beforeend", sectionHTML);
          }
        })
        .catch((error) =>
          console.error(
            `Error fetching articles for category ${categoryName}:`,
            error
          )
      );
      hideSpinner();
    } else {
      window.location.href = "login.html";
    }
  }
});

const deleteArticle = (articleId) => {
  showSpinner();
  fetch(
    `https://somoysondhan-backend.onrender.com/article/list/${articleId}/`,
    {
      method: "DELETE",
    }
  )
    .then((response) => {
      if (response.ok) {
        // console.log("Article deleted successfully");
        hideSpinner();
        location.reload();
      } else {
        console.error("Failed to delete article:", response.statusText);
      }
    })
    .catch((error) => console.error("Error deleting article:", error));
};
