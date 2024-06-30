const uneditedUrl = 'https://api.thecatapi.com/v1/images/search?';

const collectionGrid = document.querySelector('.cat-grid');
const favModal = document.querySelector('[data-modalG]');
const hairlessCount = document.getElementById("hairless-number");

const alphabetizerButtons = document.querySelectorAll('.alphabetizer');
const collectionAndModalAlphabetButtons = document.querySelectorAll('[data-organizer]');

const favoriteTab = document.querySelector('[data-fav]');
const favoriteTabCloser = document.querySelector(".close-modal");

// Local storage
function LSInitialLoad () {
  localStorage.setItem('favorites', JSON.stringify([]));
  LStorage = localStorage.getItem('favorites');
}

let LStorage = localStorage.getItem('favorites');
if (!LStorage) LSInitialLoad()
let LSFavoriteImages = JSON.parse(LStorage);

let originalFetchedCatObjects;

function removeImageFromLS (img) {
  const LSItem = LSFavoriteImages.filter((obj) => obj.id != img.dataset.id);
  LSFavoriteImages = LSItem;
  localStorage.setItem('favorites', JSON.stringify(LSItem));
}

// Cat image click animation
function clickAnimationCall (e) {
  const clicked = e.target;
  if (!clicked.lastElementChild) {
    return
  } else if (clicked.lastElementChild.className === 'cat-information open') {
    clicked.lastElementChild.classList.remove('open');
  } else {
    clicked.lastElementChild.classList.add('open');
  }
} 

function trueUrlCreator (url) {
  let newUrl = url;
  const speciesInput = document.querySelector('#species').value;
  const amountInput = document.querySelector('#amount').value;

  if (speciesInput) {
    const speciesKey = catDictionary[speciesInput.toLowerCase().replace(" ", "")];
    newUrl += `breed_ids=${speciesKey}&`
  }
  if (amountInput) newUrl += `limit=${amountInput}&`;
  newUrl += 'has_breeds=1';

  return newUrl
}

async function getCatsByBreed(searchUrl) {
  return await fetch(searchUrl, {
    headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'no-cors',
    'x-content-type-options': 'no sniff',
    'x-api-key': 'live_KhczGvR3GTtbmoCvARNv6PvI0zPaBu5oFVDWmdBbdAz7XTRBGqPSQjZbHgg6DIVF'
    }
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch data from specified URL!");
    }
    return res.json();
  }).catch((err) => {
    console.log("An error ocurred: ", err);
    throw new Error(err);
  })
}

function catCreator (url, id) {
  const catImg = document.createElement("img");
  catImg.src = url;
  catImg.alt = "Cat picture";

  const imgDiv = document.createElement("div");
  // sets unique img id as attribute value
  imgDiv.setAttribute('data-id', id);
  imgDiv.appendChild(catImg);

  // For images that are made from localStorage
  if (!originalFetchedCatObjects) {
    imgDiv.classList.add('cats-in-modal');
    favModal.appendChild(imgDiv);
  } else {
    imgDiv.classList.add('cats-in-grid');
    collectionGrid.appendChild(imgDiv);
  }

  return imgDiv
}

// Constructs the cat information div and fetched info
function catInformationConstructor (object, appendTo) {
  object.breeds.map((val) => { 
    const infoArr = [val.name, val.life_span, val.origin, val.temperament];
  
    for (let [key, value] of Object.entries(val)) {
      infoArr.forEach((info) => {
        if (value === info) { 
          const infoSpan = document.createElement("span");
          const capital = key.charAt(0).toUpperCase();
          if (key === 'life_span') { 
            const newKey = key.replace('_', ' ');
            infoSpan.textContent = capital + newKey.slice(1, key.length) + ': ' + value;
          } else infoSpan.textContent = capital + key.slice(1, key.length) + ': ' + value;
          appendTo.appendChild(infoSpan);
        }
      });
    }
    if (val.hairless === 1) {
      const infoSpan = document.createElement("span");
      infoSpan.textContent = "Hairless: Yes"
      appendTo.appendChild(infoSpan);
    }
  });
}

// Constructs/adds remove and favorite buttons 
function buttonCreator (arrOfButtons, appendTo) {
  arrOfButtons.forEach((button) => {
    const newButton = document.createElement('button');
    newButton.type = 'button';
    newButton.textContent = button;
    button === 'X' ? newButton.className = 'close-button' : newButton.className = 'favorites-button';
    appendTo.appendChild(newButton);
  });
}

// Adds or subtracts one from Hairless Count
function adjustHairlessCount (clickedButton) {
  const addingFavoritesBool = clickedButton.previousSibling.previousSibling.textContent.includes('Hairless');
  const removingFavoritesBool = clickedButton.previousSibling.textContent.includes('Hairless');
  if (addingFavoritesBool)  hairlessCount.textContent = Number(hairlessCount.textContent) + 1;
  else if (removingFavoritesBool) hairlessCount.textContent = Number(hairlessCount.textContent) - 1;
}

// Adds the image to the favorites grid
function favAddCall (e) {
  const clicked = e.target;
  let checker;
  const catImageDiv = clicked.parentElement.parentElement;
  if (originalFetchedCatObjects) checker = originalFetchedCatObjects.map((obj) => obj.id);
  if (clicked.className === 'favorites-button' && checker.includes(catImageDiv.dataset.id)) {
    originalFetchedCatObjects.forEach((obj) => {
      if (obj.id === catImageDiv.dataset.id) LSFavoriteImages.push(obj);
      localStorage.setItem('favorites', JSON.stringify(LSFavoriteImages));
    })
    adjustHairlessCount(clicked);
    favModal.appendChild(catImageDiv);
    catImageDiv.className = "cats-in-modal";
  }
}

// Removes image from favorites grid to collection grid or completely
function favRemoveCall (e) {
  const clicked = e.target;
  let checker;
  const catImageDiv = clicked.parentElement.parentElement;
  if (originalFetchedCatObjects) checker = originalFetchedCatObjects.map((obj) => obj.id);
  if (clicked.className === 'close-button') {
    if (checker && checker.includes(catImageDiv.dataset.id)) {
      removeImageFromLS(catImageDiv);
      collectionGrid.appendChild(catImageDiv);
      catImageDiv.className = "cats-in-grid";
    } else {
      removeImageFromLS(catImageDiv);
      catImageDiv.remove();
    }
    adjustHairlessCount(clicked);
  }
}

// Removes image from collectionGrid
function removeCall (e) {
  const clicked = e.target;
  if (clicked.className === 'close-button') {
    clicked.parentElement.parentElement.remove();
  }
} 

// Organize cat images
function catOrganizer (arr, selectors, className) {
  arr.forEach((name) => {
    for (const elm of selectors) {
      const catName = JSON.stringify(elm.lastElementChild.firstChild.textContent).slice(7, this.length - 1);
      if (className === 'cats-in-grid') {
        if (name === catName) collectionGrid.appendChild(elm);
      }
      else if (className === 'cats-in-modal') {
        if (name === catName) favModal.appendChild(elm);
      }
    }
  })
}

// Calls all functions that contribute to creating a cat
function completeCatConstructor (object) {
  const catDiv = catCreator(object.url, object.id);
  const information = document.createElement("div");
  information.className = 'cat-information';
  catInformationConstructor(object, information);
  buttonCreator(['X', 'Favorites'], information);
  catDiv.appendChild(information);
  // for LS
  return catDiv
}

// Button that generates cats
document.querySelector('.cat').addEventListener('click', async function () {
  if (collectionGrid.innerHTML) collectionGrid.innerHTML = '';
  const alteredUrl =  trueUrlCreator(uneditedUrl);

  getCatsByBreed(alteredUrl)
    .then((arr) => { 
      originalFetchedCatObjects = arr;
      arr.forEach((obj) => { 
        completeCatConstructor(obj);
    })})
    .catch((error) => console.log("Error Fetching Cats:", error));
}); 

// Creates the sorted array
function alphabeticalArr (button) {
  let images;
  if (button.parentElement.parentElement.id === "favorites") images = document.querySelectorAll('.cats-in-modal'); 
  else images = document.querySelectorAll('.cats-in-grid');
  const catNamesArr = [];
  images.forEach((obj) => {
    const catName = JSON.stringify(obj.lastElementChild.firstChild.textContent).slice(7, this.length - 1);
    catNamesArr.push(catName);
  })
  if (button.textContent === "Z-A") {
    catNamesArr.sort();
    button.textContent = "A-Z";
  }
  else if (button.textContent === "A-Z") {
    catNamesArr.sort();
    catNamesArr.reverse();
    button.textContent = "Z-A";
  }
  if (images[0] != null) catOrganizer(catNamesArr, images, images[0].className);
}

// Adds an event listener to both buttons
// And makes sure that whatever button is being clicked
// Does not cause the other button to be activated as well using data-attributes
collectionAndModalAlphabetButtons.forEach((button) => {
  button.addEventListener('click', function () {
    const dataValue = this.dataset.organizer;
    if (favModal.hasChildNodes() && this.parentElement.parentElement.className.includes(dataValue)) alphabeticalArr(button);
    else if (collectionGrid.hasChildNodes()) alphabeticalArr(button);
  });
});

// Event listeners
collectionGrid.addEventListener('click', clickAnimationCall);
collectionGrid.addEventListener('click', favAddCall);
collectionGrid.addEventListener('click', removeCall);

favModal.addEventListener('click', clickAnimationCall);
favModal.addEventListener('click', favRemoveCall);

favoriteTab.addEventListener('click', function () {
  const modalId = this.dataset.fav;
  document.getElementById(modalId).classList.add('opened');
});
favoriteTabCloser.addEventListener('click', function () {
  this.parentElement.classList.remove('opened');
});

// Local storage cats
LSFavoriteImages.forEach((obj) => {
  const createdCatDiv = completeCatConstructor(obj);
  if (createdCatDiv.lastChild.childElementCount > 6) {
    hairlessCount.textContent = Number(hairlessCount.textContent) + 1;
  }
})