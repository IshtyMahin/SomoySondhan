const showSpinner = () => {
  const spinner = document.getElementById("loading-spinner");
  spinner.classList.remove("hidden");
};

const hideSpinner = () => {
  const spinner = document.getElementById("loading-spinner");
  spinner.classList.add("hidden");
};
