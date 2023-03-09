//----------------Firebase initialize----------------------------------//
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyBEr7B_GP1HeBCqVsof8kd-PNcCIp7KW6c",
  authDomain: "waiterassist-71fb0.firebaseapp.com",
  databaseURL:
    "https://waiterassist-71fb0-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "waiterassist-71fb0",
  storageBucket: "waiterassist-71fb0.appspot.com",
  messagingSenderId: "397401148253",
  appId: "1:397401148253:web:bde2dc9d7ee5a5d27cf6b4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import {
  getDatabase,
  ref,
  set,
  child,
  get,
  update,
  remove,
  push,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const db = getDatabase();

import {
  getStorage,
  ref as sRef,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

//----------------Spremenljivke, ki se ponavljajo ----------------------------------//
const itemList = document.getElementById("container");
const itemName = document.getElementById("name-item").value;
const itemCategory = document.getElementById("category-item").value;
const itemImage = document.getElementById("image").files[0];
const lastItem = document.getElementById("last-item");
const lastItemImg = document.getElementById("last-item-img");

const allItems = document.getElementById("filter-all-items");
const storedItems = document.getElementById("filter-stored-items");
const washItems = document.getElementById("filter-wash-items");

const allItemsRadio = document.getElementById("all-only");
const washItemsRadio = document.getElementById("wash-only");
const storedItemsRadio = document.getElementById("stored-only");
//----------------Dodajanje kategorij----------------------------------//
class Category {
  constructor(sifra, naziv) {
    this.sifra = sifra;
    this.naziv = naziv;
  }
}

const other = new Category(0, "Other");
const tshirt = new Category(1, "T-shirt");
const hoodie = new Category(2, "Hoodie");
const jeans = new Category(3, "Jeans");
const shorts = new Category(4, "Shorts");
const jacket = new Category(5, "Jacket");
const shoes = new Category(6, "Shoes");
const sweatpants = new Category(7, "Sweatpants");

let categories = [
  other,
  tshirt,
  hoodie,
  jeans,
  shorts,
  jacket,
  shoes,
  sweatpants,
];

const category = document.getElementById("category-item");
for (let i = 0; i < categories.length; i++) {
  let option = document.createElement("option");
  option.value = categories[i].naziv;
  option.text = categories[i].naziv;
  category.add(option);
}

//----------------Dodajanje oblacil----------------------------------//
const addedItems = [];
const form = document.getElementById("form");
class Item {
  constructor(name, category, image) {
    this.name = name;
    this.category = category;
    this.image = image;
  }
}

function newItem(event) {
  const itemName = document.getElementById("name-item").value;
  const itemCategory = document.getElementById("category-item").value;
  const itemImage = document.getElementById("image").files[0];
  const loader = document.getElementById("loader");
  loader.classList.remove("loader-hidden");
  event.preventDefault();
  const newItem = new Item(itemName, itemCategory, itemImage);
  addedItems.push(newItem);
  saveArrayDb(addedItems);
  itemList.innerText = "";
  closeModal();
}

form.addEventListener("submit", newItem);

//----------------Skrij obrazec za dodajanje itemov----------------------------------//
const btnCloseModal = document.getElementById("modal-close");
const overlay = document.getElementById("overlay");
const btnHideForm = document.getElementById("btn-hide-form");

btnHideForm.addEventListener("click", openModal);

function openModal() {
  document.body.classList.toggle("body-overflow");
  scrollTop();
  form.classList.toggle("hide-form");
  overlay.classList.toggle("hidden");
}

function scrollTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

btnCloseModal.addEventListener("click", closeModal);

function closeModal() {
  overlay.classList.toggle("hidden");
  form.classList.toggle("hide-form");
  document.body.classList.toggle("body-overflow");
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !form.classList.contains("hidden")) {
    closeModal();
  }
});

overlay.addEventListener("click", closeModal);

const cancelBtn = document.getElementById("item-cancel-btn");
cancelBtn.addEventListener("click", closeModal);

//----------------Shranjevanje v bazo podatkov----------------------------------//
function saveArrayDb(array) {
  const itemName = document.getElementById("name-item").value;
  const itemCategory = document.getElementById("category-item").value;
  const itemImage = document.getElementById("image").files[0];

  const storage = getStorage();
  const storageRef = sRef(
    storage,
    "Users/" + currentUser.username + "/Images/" + itemName
  );

  const UploadTask = uploadBytesResumable(storageRef, itemImage);
  UploadTask.on(
    "state-changed",
    (snapshot) => {},
    (error) => {
      alert("Image not uploaded!");
    },
    () => {
      getDownloadURL(UploadTask.snapshot.ref).then((downloadURL) => {
        saveURLtoRealTimeDB(downloadURL);
      });
    }
  );
  function saveURLtoRealTimeDB(URL) {
    push(ref(db, "UsersList/" + currentUser.username + "/Items/"), {
      itemName: itemName,
      itemCategory: itemCategory,
      ImgURL: URL,
      InWash: false,
    }).then(showNewItems);
  }
}

//----------------Izris na ekranu - Branje iz baze vsi podatki ----------------------------------//
function showNewItems() {
  const loader = document.getElementById("loader");
  loader.classList.remove("loader-hidden");
  let counter = 0;
  const dbref = ref(db);
  let washCounter = 0;
  get(child(dbref, "UsersList/" + currentUser.username + "/Items"))
    .then((snapshot) => {
      snapshot.forEach(function (object) {
        document.getElementById("all-only").checked = true;
        if (
          storedItems.classList.contains("filter-button-active") ||
          washItems.classList.contains("filter-button-active")
        ) {
          storedItems.classList.remove("filter-button-active");
          washItems.classList.remove("filter-button-active");
        }
        allItems.classList.add("filter-button-active");

        const itemsNumber = document.getElementById("items-number");
        const washNumber = document.getElementById("items-washing");

        lastItem.textContent = object.val().itemName;
        lastItemImg.src = object.val().ImgURL;

        const itemList = document.getElementById("container");
        const itemContainer = document.createElement("div");
        itemContainer.classList.add("item-container");

        const imageContainer = document.createElement("div");
        imageContainer.classList.add("item-image-container");
        const imageElement = document.createElement("img");

        const nameElement = document.createElement("p");
        const categoryElement = document.createElement("p");
        const itemId = document.createElement("p");

        const btnsContainer = document.createElement("div");
        btnsContainer.classList.add("btns-container");
        const btnDelete = document.createElement("button");
        const iconDelete = document.createElement("i");
        iconDelete.classList.add("fa-solid", "fa-trash");
        const btnWash = document.createElement("button");

        btnDelete.classList.add("item-delete-btn");
        //btnDelete.textContent = "Delete";
        btnDelete.appendChild(iconDelete);

        nameElement.textContent = object.val().itemName;
        categoryElement.textContent = object.val().itemCategory;
        itemId.textContent = object.key;

        imageElement.src = object.val().ImgURL;
        imageElement.classList.add("img-small");

        if (object.val().InWash === true) {
          itemContainer.classList.add("wash-item-border");
          const iconStore = document.createElement("i");
          iconStore.classList.add("fa-solid", "fa-box-archive");
          btnWash.classList.add("item-wash-btn");
          btnWash.classList.add("item-wash-btn-active");
          btnWash.textContent = "Store";
          btnWash.appendChild(iconStore);
          imageContainer.classList.add("item-image-container-filter");
          washCounter++;
        } else if (object.val().InWash === false) {
          const iconWash = document.createElement("i");
          iconWash.classList.add("fa-solid", "fa-soap");
          btnWash.classList.add("item-wash-btn");
          btnWash.textContent = "Wash";
          btnWash.appendChild(iconWash);
          counter++;
        }

        btnsContainer.appendChild(btnWash);
        btnsContainer.appendChild(btnDelete);
        imageContainer.appendChild(imageElement);
        itemContainer.appendChild(imageContainer);
        itemContainer.appendChild(nameElement);
        itemContainer.appendChild(categoryElement);
        itemContainer.appendChild(itemId);
        itemContainer.appendChild(btnsContainer);
        itemList.appendChild(itemContainer);
        itemsNumber.textContent = counter;
        washNumber.textContent = washCounter;
      });
    })
    .then(scrollTop)

    .then(function () {
      const deleteItem = document.getElementsByClassName("item-delete-btn");
      for (let i = 0; i < deleteItem.length; i++) {
        deleteItem[i].addEventListener("click", deleteToDo);
      }
    })
    .then(function () {
      const washItem = document.getElementsByClassName("item-wash-btn");
      for (let i = 0; i < washItem.length; i++) {
        washItem[i].addEventListener("click", washToDo);
      }
    })
    .then(
      setTimeout(function () {
        loader.classList.add("loader-hidden");
      }, 1000)
    );
}

window.addEventListener("load", function () {
  showNewItems();
});

//----------------Izris na ekranu - Branje iz baze vsi podatki brez animacije ----------------------------------//
function showAllItems() {
  let counter = 0;
  const dbref = ref(db);
  let washCounter = 0;
  get(child(dbref, "UsersList/" + currentUser.username + "/Items"))
    .then((snapshot) => {
      snapshot.forEach(function (object) {
        const itemsNumber = document.getElementById("items-number");
        const washNumber = document.getElementById("items-washing");

        lastItem.textContent = object.val().itemName;
        lastItemImg.src = object.val().ImgURL;

        const itemList = document.getElementById("container");
        const itemContainer = document.createElement("div");
        itemContainer.classList.add("item-container");

        const imageContainer = document.createElement("div");
        imageContainer.classList.add("item-image-container");
        const imageElement = document.createElement("img");

        const nameElement = document.createElement("p");
        const categoryElement = document.createElement("p");
        const itemId = document.createElement("p");

        const btnsContainer = document.createElement("div");
        btnsContainer.classList.add("btns-container");
        const btnDelete = document.createElement("button");
        const iconDelete = document.createElement("i");
        iconDelete.classList.add("fa-solid", "fa-trash");
        const btnWash = document.createElement("button");

        btnDelete.classList.add("item-delete-btn");
        //btnDelete.textContent = "Delete";
        btnDelete.appendChild(iconDelete);

        nameElement.textContent = object.val().itemName;
        categoryElement.textContent = object.val().itemCategory;
        itemId.textContent = object.key;

        imageElement.src = object.val().ImgURL;
        imageElement.classList.add("img-small");

        if (object.val().InWash === true) {
          itemContainer.classList.add("wash-item-border");
          const iconStore = document.createElement("i");
          iconStore.classList.add("fa-solid", "fa-box-archive");
          btnWash.classList.add("item-wash-btn");
          btnWash.classList.add("item-wash-btn-active");
          btnWash.textContent = "Store";
          btnWash.appendChild(iconStore);
          imageContainer.classList.add("item-image-container-filter");
          washCounter++;
        } else if (object.val().InWash === false) {
          const iconWash = document.createElement("i");
          iconWash.classList.add("fa-solid", "fa-soap");
          btnWash.classList.add("item-wash-btn");
          btnWash.textContent = "Wash";
          btnWash.appendChild(iconWash);
          counter++;
        }

        btnsContainer.appendChild(btnWash);
        btnsContainer.appendChild(btnDelete);
        imageContainer.appendChild(imageElement);
        itemContainer.appendChild(imageContainer);
        itemContainer.appendChild(nameElement);
        itemContainer.appendChild(categoryElement);
        itemContainer.appendChild(itemId);
        itemContainer.appendChild(btnsContainer);
        itemList.appendChild(itemContainer);
        itemsNumber.textContent = counter;
        washNumber.textContent = washCounter;
      });
    })

    .then(function () {
      const deleteItem = document.getElementsByClassName("item-delete-btn");
      for (let i = 0; i < deleteItem.length; i++) {
        deleteItem[i].addEventListener("click", deleteToDo);
      }
    })
    .then(function () {
      const washItem = document.getElementsByClassName("item-wash-btn");
      for (let i = 0; i < washItem.length; i++) {
        washItem[i].addEventListener("click", washToDo);
      }
    });
}

//----------------Izris na ekranu - Branje iz baze Stored elementov ----------------------------------//
function showNewItemsStored() {
  const dbref = ref(db);
  get(child(dbref, "UsersList/" + currentUser.username + "/Items"))
    .then((snapshot) => {
      snapshot.forEach(function (object) {
        if (object.val().InWash === false) {
          const itemList = document.getElementById("container");
          const itemContainer = document.createElement("div");
          itemContainer.classList.add("item-container");

          const imageContainer = document.createElement("div");
          imageContainer.classList.add("item-image-container");
          const imageElement = document.createElement("img");

          const nameElement = document.createElement("p");
          const categoryElement = document.createElement("p");
          const itemId = document.createElement("p");

          const btnsContainer = document.createElement("div");
          btnsContainer.classList.add("btns-container");
          const btnDelete = document.createElement("button");
          const iconDelete = document.createElement("i");
          iconDelete.classList.add("fa-solid", "fa-trash");
          const btnWash = document.createElement("button");

          btnDelete.classList.add("item-delete-btn");
          //btnDelete.textContent = "Delete";
          btnDelete.appendChild(iconDelete);

          nameElement.textContent = object.val().itemName;
          categoryElement.textContent = object.val().itemCategory;
          itemId.textContent = object.key;

          imageElement.src = object.val().ImgURL;
          imageElement.classList.add("img-small");

          const iconWash = document.createElement("i");
          iconWash.classList.add("fa-solid", "fa-soap");
          btnWash.classList.add("item-wash-btn");
          btnWash.textContent = "Wash";
          btnWash.appendChild(iconWash);

          btnsContainer.appendChild(btnWash);
          btnsContainer.appendChild(btnDelete);
          imageContainer.appendChild(imageElement);
          itemContainer.appendChild(imageContainer);
          itemContainer.appendChild(nameElement);
          itemContainer.appendChild(categoryElement);
          itemContainer.appendChild(itemId);
          itemContainer.appendChild(btnsContainer);
          itemList.appendChild(itemContainer);
        }
      });
    })

    .then(function () {
      const deleteItem = document.getElementsByClassName("item-delete-btn");
      for (let i = 0; i < deleteItem.length; i++) {
        deleteItem[i].addEventListener("click", deleteToDo);
      }
    })
    .then(function () {
      const washItem = document.getElementsByClassName("item-wash-btn");
      for (let i = 0; i < washItem.length; i++) {
        washItem[i].addEventListener("click", washToDo);
      }
    });
}

//----------------Izris na ekranu - Branje iz baze Wash elementov ----------------------------------//
function showNewItemsWash() {
  const dbref = ref(db);
  get(child(dbref, "UsersList/" + currentUser.username + "/Items"))
    .then((snapshot) => {
      snapshot.forEach(function (object) {
        if (object.val().InWash === true) {
          const itemList = document.getElementById("container");
          const itemContainer = document.createElement("div");
          itemContainer.classList.add("item-container");

          const imageContainer = document.createElement("div");
          imageContainer.classList.add("item-image-container");
          const imageElement = document.createElement("img");

          const nameElement = document.createElement("p");
          const categoryElement = document.createElement("p");
          const itemId = document.createElement("p");

          const btnsContainer = document.createElement("div");
          btnsContainer.classList.add("btns-container");
          const btnDelete = document.createElement("button");
          const iconDelete = document.createElement("i");
          iconDelete.classList.add("fa-solid", "fa-trash");
          const btnWash = document.createElement("button");

          btnDelete.classList.add("item-delete-btn");
          btnDelete.appendChild(iconDelete);

          nameElement.textContent = object.val().itemName;
          categoryElement.textContent = object.val().itemCategory;
          itemId.textContent = object.key;

          imageElement.src = object.val().ImgURL;
          imageElement.classList.add("img-small");

          itemContainer.classList.add("wash-item-border");
          const iconStore = document.createElement("i");
          iconStore.classList.add("fa-solid", "fa-box-archive");
          btnWash.classList.add("item-wash-btn");
          btnWash.classList.add("item-wash-btn-active");
          btnWash.textContent = "Store";
          btnWash.appendChild(iconStore);
          imageContainer.classList.add("item-image-container-filter");

          btnsContainer.appendChild(btnWash);
          btnsContainer.appendChild(btnDelete);
          imageContainer.appendChild(imageElement);
          itemContainer.appendChild(imageContainer);
          itemContainer.appendChild(nameElement);
          itemContainer.appendChild(categoryElement);
          itemContainer.appendChild(itemId);
          itemContainer.appendChild(btnsContainer);
          itemList.appendChild(itemContainer);
        }
      });
    })

    .then(function () {
      const deleteItem = document.getElementsByClassName("item-delete-btn");
      for (let i = 0; i < deleteItem.length; i++) {
        deleteItem[i].addEventListener("click", deleteToDo);
      }
    })
    .then(function () {
      const washItem = document.getElementsByClassName("item-wash-btn");
      for (let i = 0; i < washItem.length; i++) {
        washItem[i].addEventListener("click", washToDo);
      }
    });
}

//----------------Delete button izbiranje gumba----------------------------------//

function deleteToDo(event) {
  const clickTarget = event.target;
  const id = clickTarget.parentNode.previousElementSibling.textContent;
  const idIcon =
    clickTarget.parentNode.parentNode.previousElementSibling.textContent;
  if (clickTarget.matches(".item-delete-btn")) {
    clickTarget.parentNode.parentNode.remove();
    deleteItemDatabase(id);
    //updateNumberItems();
    //itemList.innerText = "";
    //setTimeout(showNewItems, 500);
  } else if (clickTarget.matches(".fa-trash")) {
    clickTarget.parentNode.parentNode.parentNode.remove();
    deleteItemDatabase(idIcon);
  }
}

//----------------Delete iz baze----------------------------------//
function deleteItemDatabase(idItem) {
  remove(ref(db, "UsersList/" + currentUser.username + "/Items/" + idItem))
    .then(updateNumberItems)
    .then(updateWashNumberItems);
}

//----------------Update latest items----------------------------------//
function updateNumberItems() {
  let counter = 0;
  const dbref = ref(db);
  get(child(dbref, "UsersList/" + currentUser.username + "/Items")).then(
    (snapshot) => {
      snapshot.forEach(function (object) {
        if (object.val().InWash === false) {
          counter++;
        }
        const itemsNumber = document.getElementById("items-number");
        lastItem.textContent = object.val().itemName;
        lastItemImg.src = object.val().ImgURL;
        itemsNumber.textContent = counter;
      });
    }
  );
}

//----------------Update items in washing----------------------------------//
function updateWashNumberItems() {
  let counterWash = 0;
  const dbref = ref(db);
  get(child(dbref, "UsersList/" + currentUser.username + "/Items")).then(
    (snapshot) => {
      snapshot.forEach(function (object) {
        if (object.val().InWash === true) {
          counterWash++;
        }
        const itemsWashNumber = document.getElementById("items-washing");
        itemsWashNumber.textContent = counterWash;
      });
    }
  );
}
//----------------Wash button select----------------------------------//
function washToDo(event) {
  const clickTarget = event.target;

  if (clickTarget.matches(".item-wash-btn")) {
    const id = clickTarget.parentNode.previousElementSibling.textContent;
    clickTarget.parentNode.parentNode.classList.toggle("wash-item-border");
    clickTarget.parentNode.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.classList.toggle(
      "item-image-container-filter"
    );
    if (clickTarget.textContent === "Wash") {
      clickTarget.textContent = "Store";
      const iconStore = document.createElement("i");
      iconStore.classList.add("fa-solid", "fa-box-archive");
      clickTarget.appendChild(iconStore);
      updateWashStateTrue(id);
      if (storedItemsRadio.checked) {
        itemList.innerText = "";
        showNewItemsStored();
      }
    } else if (clickTarget.textContent === "Store") {
      clickTarget.textContent = "Wash";
      const iconWash = document.createElement("i");
      iconWash.classList.add("fa-solid", "fa-soap");
      clickTarget.appendChild(iconWash);
      updateWashStateFalse(id);
      console.log(washItems.checked);
      if (washItemsRadio.checked) {
        itemList.innerText = "";
        showNewItemsWash();
      }
    }
    clickTarget.classList.toggle("item-wash-btn-active");
    updateWashNumberItems();
    updateNumberItems();
  } else if (
    clickTarget.matches(".fa-soap") ||
    clickTarget.matches(".fa-box-archive")
  ) {
    let clickTargetParent = clickTarget.parentNode;
    const idWash =
      clickTarget.parentNode.parentNode.previousElementSibling.textContent;
    clickTarget.parentNode.parentNode.parentNode.classList.toggle(
      "wash-item-border"
    );
    clickTarget.parentNode.parentNode.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.classList.toggle(
      "item-image-container-filter"
    );
    if (clickTargetParent.textContent === "Wash") {
      clickTargetParent.textContent = "Store";
      const iconStore = document.createElement("i");
      iconStore.classList.add("fa-solid", "fa-box-archive");
      clickTargetParent.appendChild(iconStore);
      updateWashStateTrue(idWash);
      if (storedItemsRadio.checked) {
        itemList.innerText = "";
        showNewItemsStored();
      }
    } else if (clickTargetParent.textContent === "Store") {
      clickTargetParent.textContent = "Wash";
      const iconWash = document.createElement("i");
      iconWash.classList.add("fa-solid", "fa-soap");
      clickTargetParent.appendChild(iconWash);
      updateWashStateFalse(idWash);
      if (washItemsRadio.checked) {
        itemList.innerText = "";
        showNewItemsWash();
      }
    }
    clickTargetParent.classList.toggle("item-wash-btn-active");
    updateWashNumberItems();
    updateNumberItems();
  }
}

//----------------Update Wash v bazi----------------------------------//
function updateWashStateTrue(idItem) {
  update(ref(db, "UsersList/" + currentUser.username + "/Items/" + idItem), {
    InWash: true,
  });
}

function updateWashStateFalse(idItem) {
  update(ref(db, "UsersList/" + currentUser.username + "/Items/" + idItem), {
    InWash: false,
  });
}

//----------------Izris na ekranu FILTRI----------------------------------//

const radioFilters = document.querySelectorAll('input[type="radio"]');
for (let i = 0; i < radioFilters.length; i++) {
  radioFilters[i].addEventListener("change", handleChange);
}

function handleChange(event) {
  if (event.target.id === "all-only") {
    if (
      storedItems.classList.contains("filter-button-active") ||
      washItems.classList.contains("filter-button-active")
    ) {
      storedItems.classList.remove("filter-button-active");
      washItems.classList.remove("filter-button-active");
    }
    allItems.classList.add("filter-button-active");
    itemList.innerText = "";
    showAllItems();
  } else if (event.target.id === "stored-only") {
    if (
      allItems.classList.contains("filter-button-active") ||
      washItems.classList.contains("filter-button-active")
    ) {
      allItems.classList.remove("filter-button-active");
      washItems.classList.remove("filter-button-active");
    }
    storedItems.classList.add("filter-button-active");
    itemList.innerText = "";
    showNewItemsStored();
  } else if (event.target.id === "wash-only") {
    if (
      allItems.classList.contains("filter-button-active") ||
      storedItems.classList.contains("filter-button-active")
    ) {
      allItems.classList.remove("filter-button-active");
      storedItems.classList.remove("filter-button-active");
    }
    washItems.classList.add("filter-button-active");
    itemList.innerText = "";
    showNewItemsWash();
  }
}
