const token = localStorage.getItem("token");
const userId = localStorage.getItem("user_id");
const getQueryParam = (name) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

const loadarticleDetails = () => {
  const articleId = getQueryParam("id");
  // console.log(articleId);
  showSpinner();
  fetch(`https://somoysondhan-backend.onrender.com/article/list/${articleId}/`)
    .then((res) => res.json())
    .then((data) => {
      const publishing_time = new Date(data.publishing_time).toLocaleString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }
      );
      // console.log(data);
      const section = document.getElementById("detail_article");
      const div = document.createElement("div");

      section.innerHTML = `
             <h1 class="text-3xl font-bold mb-4">${data.headline}</h1>
      <p class="text-gray-600 text-sm mb-4">Published on ${publishing_time}</p>
      <div class="bg-white p-6 rounded shadow-md mb-4">
        <p class="text-lg">${data.body}</p>
      </div>
      
    
      
     `;
      hideSpinner();
    })
    .catch((error) => {
      console.error("Error loading article details:", error);
    })
    .then(() => {
      showSpinner();
      reviewFetch(articleId);
      renderRating();
      hideSpinner();
    });
};

const fetchArticle = async () => {
  const articleId = getQueryParam("id");
  showSpinner()
  const response = await fetch(
    `https://somoysondhan-backend.onrender.com/article/list/${articleId}/`
  );
  const data = await response.json();
  hideSpinner()
  return data;
};

const renderRating = async () => {
  const ratingSection = document.getElementById("ratingSection");
  ratingSection.innerHTML = "";
  
  showSpinner()
  const data = await fetchArticle();
  // Render average rating
  const averageRatingElement = document.createElement("div");
  averageRatingElement.classList.add(
    "bg-white",
    "shadow-md",
    "rounded",
    "px-8",
    "py-16",
    "mb-4"
  );

  averageRatingElement.innerHTML = `
        <div class="flex items-center mb-4">
          ${(() => {
            const averageRating = data.average_rating.toFixed(3);
            const fullStars = Math.floor(averageRating);
            const halfStar = averageRating - fullStars >= 0.5;
            const emptyStars = 4 - fullStars - (halfStar ? 1 : 0);
            const stars = [];
            for (let i = 0; i < fullStars; i++) {
              stars.push(`<svg
            class="w-4 h-4 text-yellow-300 me-1"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 22 20"
          >
            <path
              d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"
            /></svg>`);
            }
            for (let i = 0; i < 4 - fullStars; i++) {
              stars.push(`<svg
            class="w-4 h-4 text-gray-300 me-1 dark:text-gray-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 22 20"
          >
            <path
              d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"
            /></svg>`);
            }
            const starHTML = stars.join("");
            return starHTML;
          })()}

          <p class="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            &nbsp;${data.average_rating.toFixed(2)}
          </p>
          <p class="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            &nbsp;out of&nbsp;
          </p>
          <p class="ms-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            4
          </p>
        </div>
        <p class="text-sm pb-2 font-medium text-gray-500 dark:text-gray-400">
          ${data.total_ratings} ${
    data.total_ratings <= 1 ? "global rating" : "global ratings"
  }
        </p>
        ${Object.entries(data.star_counts)
          .map(
            ([rating, count]) => `
        <div>
          <div class="flex items-center mt-4">
            <a
              href="#"
              class="text-sm font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >${rating} star</a
            >
            <div class="w-2/4 h-5 mx-4 bg-gray-200 rounded dark:bg-gray-700">
              <div
                class="h-5 bg-yellow-300 rounded"
                style="width: ${
                  count > 0 ? (count * 100) / data.total_ratings : 0
                }%; }"
              ></div>
            </div>
          </div>
        </div>
        `
          )
          .join("")}
   
  `;
  ratingSection.appendChild(averageRatingElement);
  hideSpinner();
};

const handleReviewSubmission = async (event) => {
  event.preventDefault();

  const rating = document.getElementById("rating").value;
  const review = document.getElementById("review").value;
  const articleId = getQueryParam("id");
  document.getElementById("rating").value = "";
  document.getElementById("review").value = "";
  const reviewData = {
    rating: rating,
    comment: review,
    article: articleId,
    user: userId,
  };
  console.log(reviewData);
  showSpinner()
  fetch(
    `https://somoysondhan-backend.onrender.com/article/${articleId}/reviews/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      renderRating();
      reviewFetch();
      console.log("Submit review");
      hideSpinner()
    })
    .catch((error) => {
      console.error("Error submitting review:", error);
      location.reload();
      hideSpinner()
    });
};

const reviewFetch = (articleId) => {
  showSpinner();
  fetch(
    `https://somoysondhan-backend.onrender.com/article/${articleId}/reviews/`
  )
    .then((response) => response.json())
    .then((reviews) => {
      loadReview(reviews);
      hideSpinner();
    })
    .catch((error) => {
      console.error("Error loading reviews:", error);
    });
};

const loadReview = async (data) => {
  let commentContainer = document.getElementById("commentContainer");
  // console.log(commentContainer);
  commentContainer.innerHTML = "";
  showSpinner();
  const fetchUsername = async (userId) => {
    
    showSpinner();
    const response = await fetch(
      `https://somoysondhan-backend.onrender.com/user/list/${userId}/`
    );
    const userData = await response.json();
    hideSpinner();
    return userData.username;
  };

  data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const latestComments = data.slice(0, 3);

  if (data.length > 0) {
    for (const comment of latestComments) {
      const username = await fetchUsername(comment.user);
      const formattedDate = new Date(comment.created_at).toLocaleString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }
      );
      const commentCard = document.createElement("div");
      commentCard.classList.add("bg-white", "shadow-md", "rounded-lg", "p-4");

      const nameElement = document.createElement("p");
      nameElement.classList.add("text-gray-800", "font-semibold", "mb-2");
      nameElement.textContent = username;

      const ratingElement = document.createElement("p");
      ratingElement.classList.add("text-gray-500", "text-sm", "mb-2");
      ratingElement.textContent = `Rating: ${"⭐️".repeat(comment.rating)}`;

      const dateElement = document.createElement("p");
      dateElement.classList.add("text-gray-500", "text-sm", "mb-2");
      dateElement.textContent = formattedDate;

      const contentElement = document.createElement("p");
      contentElement.classList.add("text-gray-600");
      contentElement.textContent = comment.comment;

      commentCard.appendChild(nameElement);
      commentCard.appendChild(ratingElement);
      commentCard.appendChild(dateElement);
      commentCard.appendChild(contentElement);

      commentContainer.appendChild(commentCard);
    }
  } else {
    const noReviewMessage = document.createElement("div");
    noReviewMessage.classList.add(
      "bg-white-600",
      "border",
      "border-gray-300",
      "text-gray-600",
      "p-4",
      "rounded-md",
      "shadow-sm"
    );
    noReviewMessage.innerHTML = `
    <div class="flex items-center">
      <p class="text-sm font-medium">No reviews yet.</p>
    </div>
  `;
    commentContainer.appendChild(noReviewMessage);
  }
  hideSpinner()
};

function getWords(body, n) {
  const words = body.split(" ");

  const Words = words.slice(0, n).join(" ");
  return Words;
}
const relatedArticle = () => {
  const articleId = getQueryParam("id");
  showSpinner();
  fetch(
    `https://somoysondhan-backend.onrender.com/article/list/${articleId}/related/`
  )
    .then((res) => res.json())

    .then((data) => {
      const relatedSection = document.getElementById("related_article");
      if (data.length) {
        relatedSection.innerHTML = `
         ${data
           .slice(0, 2)
           .map(
             (article) => `
                              <div class="p-4 my-4 bg-white shadow-lg rounded-lg">
                                <a href="article_detail.html?id=${article.id}" class="text-xl font-semibold mb-2">${article.headline}</a>
                              </div>
                            `
           )
           .join("")}
        `;
      }
      hideSpinner();
    });
};

relatedArticle();

if (token && userId) {
  showSpinner();
  loadarticleDetails();
  // loadReview();
  reviewFetch();

  hideSpinner();
} else {
  window.location.href = "login.html";
}
