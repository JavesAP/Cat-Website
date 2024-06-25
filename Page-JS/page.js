let url = 'https://api.thecatapi.com/v1/images/search?';
const speciesInput = document.querySelector('#species');
const amountInput = document.querySelector('#amount');
const breedInfoInput = document.querySelector('#breed-info');
const catGrid = document.querySelector('.cat-grid');
const favModal = document.querySelector('[data-modalG]');
const hairlessCount = document.querySelector('.hairless-count');
const hairlessNumber = document.getElementById("hairless-number");

const button = document.querySelector('.cat');
const alphabetizerButtons = document.querySelectorAll('.alphabetizer');
const alphabetButtons = document.querySelectorAll('[data-organizer]');

const favoriteTab = document.querySelector('[data-fav]');
const favoriteCloser = document.querySelector(".close-modal");


const data = [];
let LStorage = localStorage.getItem('favorites');

if (!LStorage) {
  localStorage.setItem('favorites', JSON.stringify(data));
  LStorage = localStorage.getItem('favorites');
}
let parsedLStorage = JSON.parse(LStorage);

let originalFetch;

function catPicCall (e) {
  const clicked = e.target;
  if (!clicked.lastElementChild) {
    return
  } else if (clicked.lastElementChild.className === 'cat-information open') {
    clicked.lastElementChild.classList.remove('open');
  } else {
    clicked.lastElementChild.classList.add('open');
  }
} 

function catCreator (url, id) {
  const catImg = document.createElement("img");
  catImg.src = url;
  catImg.alt = "Cat picture";

  const imgDiv = document.createElement("div");
  imgDiv.setAttribute('data-id', id);
  imgDiv.appendChild(catImg);

  // For images that are made from localStorage
  if (!originalFetch) {
    imgDiv.classList.add('cats-in-modal');
    favModal.appendChild(imgDiv);
  } else {
    imgDiv.classList.add('cats-in-grid');
    catGrid.appendChild(imgDiv);
  }

  return imgDiv
}

// Constructs the cat information div
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

  const twoTypes = ['X', 'Favorite'];
  twoTypes.forEach((button) => {
    const newButton = document.createElement('button');
    newButton.type = 'button';
    newButton.textContent = button;
    button === 'X' ? newButton.className = 'close-button' : newButton.className = 'favorites-button';
    appendTo.appendChild(newButton);
  });
}

// Adds the image to the favorites grid
function favAddCall (e) {
  const clicked = e.target;
  let checker;
  const catImageDiv = clicked.parentElement.parentElement;
  if (originalFetch) checker = originalFetch.map((obj) => obj.id);
  if (clicked.className === 'favorites-button') {
    if (checker.includes(catImageDiv.dataset.id)) {
      originalFetch.forEach((obj) => {
        if (obj.id === catImageDiv.dataset.id) {
          parsedLStorage.push(obj);
          localStorage.setItem('favorites', JSON.stringify(parsedLStorage));
        }
      })
    }
    if (clicked.previousSibling.previousSibling.textContent.includes('Hairless')) {
      hairlessNumber.textContent = Number(hairlessNumber.textContent) + 1;
    }
    const docFrag = document.createDocumentFragment();
    docFrag.appendChild(catImageDiv);
    favModal.appendChild(docFrag);
    catImageDiv.className = "cats-in-modal";
  }
}

// Removes image from favorites grid to collection grid or completely
function favRemoveCall (e) {
  const clicked = e.target;
  let checker;
  const catImageDiv = clicked.parentElement.parentElement;
  const docFrag = document.createDocumentFragment();
  if (originalFetch) checker = originalFetch.map((obj) => obj.id);
  if (clicked.className === 'close-button') {
    if (checker && checker.includes(catImageDiv.dataset.id)) {
      docFrag.appendChild(catImageDiv);
      catGrid.appendChild(docFrag);
      catImageDiv.className = "cats-in-grid";
    } else {
      let LSItem = parsedLStorage.filter((obj) => obj.id != catImageDiv.dataset.id);
      parsedLStorage = LSItem;
      localStorage.setItem('favorites', JSON.stringify(LSItem));
      
      catImageDiv.remove();
    }

    if (clicked.previousSibling.textContent.includes('Hairless')) {
      hairlessNumber.textContent = Number(hairlessNumber.textContent) - 1;
    }
  }
}

// Removes the image completely
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
        if (name === catName) catGrid.appendChild(elm);
      }
      else if (className === 'cats-in-modal') {
        if (name === catName) favModal.appendChild(elm);
      }
    }
  })
}

// Button that generates cats
button.addEventListener('click', async function () {
  if (catGrid.innerHTML) catGrid.innerHTML = '';

  if (speciesInput.value) url.endsWith("?") ? url += `breed_ids=${speciesInput.value.toLowerCase().trim()}` : url += `&breed_ids=${speciesInput.value.toLowerCase().trim()}`;
  if (amountInput.value) url.endsWith("?") ? url += `limit=${amountInput.value}` : url += `&limit=${amountInput.value}`;
  url.endsWith("?") ? url += 'has_breeds=1' : url += '&has_breeds=1';

  const catArr = fetch(url, {headers: {
    'Content-Type': 'application/json',
    'x-content-type-options': 'no sniff',
    'x-api-key': 'live_KhczGvR3GTtbmoCvARNv6PvI0zPaBu5oFVDWmdBbdAz7XTRBGqPSQjZbHgg6DIVF'
  }});

  const parsedArr = catArr.then((val) => val.json());

  parsedArr
    .then((arr) => { 
      originalFetch = arr;
      arr.forEach((obj) => { 
        const catDiv = catCreator(obj.url, obj.id);
        const information = document.createElement("div");
        information.className = 'cat-information';
        catInformationConstructor(obj, information);
        catDiv.appendChild(information);
    })});
    url = 'https://api.thecatapi.com/v1/images/search?';
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
  if (button.textContent === "A-Z") {
    catNamesArr.sort();
    button.textContent = "Z-A";
  }
  else if (button.textContent === "Z-A") {
    catNamesArr.sort();
    catNamesArr.reverse();
    button.textContent = "A-Z";
  }
  if (images[0] != null) catOrganizer(catNamesArr, images, images[0].className);
}

alphabetButtons.forEach((button) => {
  button.addEventListener('click', function () {
    const dataValue = this.dataset.organizer;
    if (favModal.hasChildNodes() && this.parentElement.parentElement.className.includes(dataValue)) alphabeticalArr(button);
    else if (catGrid.hasChildNodes()) alphabeticalArr(button);
  });
});

// Event listeners
catGrid.addEventListener('click', catPicCall);
favModal.addEventListener('click', catPicCall);


favoriteTab.addEventListener('click', function () {
  const modalId = this.dataset.fav;
  document.getElementById(modalId).classList.add('opened');
});

favoriteCloser.addEventListener('click', function () {
  this.parentElement.classList.remove('opened');
});

catGrid.addEventListener('click', favAddCall);

catGrid.addEventListener('click', removeCall);
favModal.addEventListener('click', favRemoveCall);

// Local storage cats
parsedLStorage.forEach((obj) => {
  const catDiv = catCreator(obj.url, obj.id);

  const information = document.createElement("div");
  information.className = 'cat-information';

  catInformationConstructor(obj, information);

  catDiv.appendChild(information);
  if (catDiv.lastChild.childElementCount > 6) {
    hairlessNumber.textContent = Number(hairlessNumber.textContent) + 1;
  }
})