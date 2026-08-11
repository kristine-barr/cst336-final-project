let bookItems = document.querySelectorAll(".book-item");

bookItems.forEach((item) => {
  item.addEventListener("click", handleBookItemClick);
});

function handleBookItemClick(e) {
  e.preventDefault();
  const item = e.currentTarget;

  // get selected book data from the clicked item
  const body = {
    id: item.dataset.id,
    title: item.querySelector("[data-title]")?.dataset.title,
    author: item.querySelector("[data-author]")?.dataset.author,
    year: item.querySelector("[data-year]")?.dataset.year,
    isbn: item.querySelector("[data-isbn]")?.dataset.isbn,
    coverUrl: item.querySelector("[data-cover-url]")?.dataset.coverUrl,
    editionKey: item.querySelector("[data-edition-key]")?.dataset.editionKey,
  };

  // send the selected book data to the server
  postData("/book/save", body)
    .then((data) => {
      console.log("Book saved successfully:", data);
    })
    .catch((error) => {
      console.error("Error saving book:", error);
    });
}

// Fetch method post
async function postData(url, body) {
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    let data = await resp.json();

    if (data.metadata && data.metadata.status === 400) {
      throw new Error(data.metadata.error);
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error("Network error:", error);
      throw error;
    } else {
      console.error("Error fetching data:", error);
      throw error;
    }
  }
}