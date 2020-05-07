"use strict";

//forEach в ie11
if ('NodeList' in window && !NodeList.prototype.forEach) {
  console.info('polyfill for IE11');
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (var i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

//.remove() ie11
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
      if (this.parentNode) {
          this.parentNode.removeChild(this);
      }
  };
}

//Array.from ie11
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}

const basketLink = document.querySelector(`.basket__link`);
const modal = document.querySelectorAll(`.modal`);
const modalBasket = document.querySelector(`.modal--basket`);
const modalAlarm = document.querySelector(`.modal--alarm`);
const modalBasketClose = modalBasket.querySelector(`.basket-modal__exit`);
const modalAlarmClose = modalAlarm.querySelector(`.alarm-modal__exit`);
const modalOverlay = document.querySelector(`.overlay`);
const deleteTotalButton = modalBasket.querySelector(`.basket-modal__total-delete`);
const productWrapper = modalBasket.querySelector(`.basket-modal__products`);
const orderButton = document.querySelectorAll(`.product-card__order`);

// localStorage.clear();
let basketProducts = !!localStorage.getItem(`basketProduct`) ? JSON.parse(localStorage.getItem(`basketProduct`)).filter((it) => it) : [
  {
    title: `ALCHEMY OF CRYSTALS STICKER PACK`,
    priceOld: 99,
    priceClick: 99,
    id: 0,
    img: `img/product.png`,
  }
];

const renderProduct = () => {
  const productAll = productWrapper.querySelectorAll(`.basket-modal__product`);
  productAll.forEach((it) => {
    it.remove();
  });
  for (const basketProduct of basketProducts) {
    const priceValue = !!localStorage.getItem(`isStock`) ? basketProduct.priceOld : basketProduct.priceClick;
    productWrapper.insertAdjacentHTML('beforeEnd', createProduct(basketProduct.title, priceValue, basketProduct.id, basketProduct.img));
  }
  onCalculateTotalPrice();
};

const createProduct = (titleCard, priceValue, id, img) => {
  return `<div class="basket-modal__product">
    <img class="basket-modal__product-image" src="${img}" width="134" height="75" alt="product">
    <div class="basket-modal__product-description">
      <p class="basket-modal__product-title">${titleCard}</p>
      <div class="basket-modal__description-wrapper">
        <div class="basket-modal__price">
          <span class="basket-modal__price-value">${priceValue}.0</span>
          <span class="basket-modal__price-currency">руб.</span>
        </div>
        <a class="basket-modal__delete" href="#" data-id="${id}">
          <span class="basket-modal__delete-item">Delete</span>
        </a>
      </div>
    </div>
  </div>`
};

const getOrderButtom = () => {
  return orderButton.forEach((it, i) => {
    const render = () => {
      const titleCard = Array.from(document.querySelectorAll(`.product-card__title`))[i].textContent;
      const price = Array.from(document.querySelectorAll(`.product-card__price--actual .product-card__price-value`))[i].textContent;
      const priceOld = Array.from(document.querySelectorAll(`.product-card__price--old .product-card__price-value`))[i].textContent;
      const priceValue = !!localStorage.getItem(`isStock`) ? priceOld : price;
      const src = `http://picsum.photos/300/150?r=${Math.random()}`;
      if (basketProducts.some((product) => product.title === titleCard)) {
        alert(`Такой товар уже выбран`);
      } else {
        basketProducts.push({
          title: titleCard,
          priceOld: priceOld,
          priceClick: price,
          id: basketProducts.length,
          img: src,
        });
        productWrapper.insertAdjacentHTML('beforeEnd', createProduct(titleCard, priceValue, i, src));
      }
    };
    const action = () => {
      render();
      onCalculateTotalPrice();
      onRecordLocalStorageArray(); 
    };
    it.addEventListener(`click`, action);
  });
};

//Modal
const onKeyEscDown = (evt) => {
  if (evt.key === `Escape` || evt.key === `Esc`) {
    onCloseModal();
  }
};

const onClickOverlayCloseModal = (evt) => {
  if (evt.target == modalOverlay) {
    onCloseModal();
  }
};

const onOpenModal = (modal) => (evt) => {
  onCloseModal();
  modal.style.display = `block`;
  modalOverlay.style.display = `block`;
  document.addEventListener(`keydown`, onKeyEscDown);
  document.addEventListener(`click`, onClickOverlayCloseModal);
  if (modal == modalBasket) {
    evt.preventDefault();
    onClickDeleteProduct();
    onClickDeleteAllProduct();
    console.log(basketProducts);
  }
};

const onCloseModal = () => {
  modalAlarm.style.display = `none`;
  modalBasket.style.display = `none`;
  modalOverlay.style.display = `none`;
  document.removeEventListener(`keydown`, onKeyEscDown);
  document.removeEventListener(`click`, onClickOverlayCloseModal);
};

const onClickButtonCloseModal = (evt) => {
  evt.preventDefault();
  onCloseModal();
}
//Корзина Modal
basketLink.addEventListener(`click`, onOpenModal(modalBasket));
modalBasketClose.addEventListener(`click`, onClickButtonCloseModal);

//Окончание акции Modal
modalAlarmClose.addEventListener(`click`, onClickButtonCloseModal);

//Записываю массив с продуктами в localstorage
const onRecordLocalStorageArray = () => {
  localStorage.removeItem(`basketProduct`);
  localStorage.setItem(`basketProduct`, JSON.stringify(basketProducts));
};

//Считает итоговую цену
const onCalculateTotalPrice = () => {
  const price = productWrapper.querySelectorAll(`.basket-modal__price-value`);
  const total = Array.from(price);
  const prices = [];
  for (let i = 0; i < total.length; i++) {
    prices.push(Number(total[i].textContent.replace(/ /g, ``)));
  }
  const totalPrice = prices.length ? prices.reduce((arr, atr) => arr + atr) : 0;
  document.querySelector(`.basket-modal__total-value`).textContent = `${totalPrice}.0`;
  document.querySelector(`.basket__price-value`).textContent = `${totalPrice}.0`;
};

//Функция удаления товара из корзины
const onClickDeleteProduct = () => {
  const productAll = productWrapper.querySelectorAll(`.basket-modal__product`);
  const deleteButton = modalBasket.querySelectorAll(`.basket-modal__delete`);

  deleteButton.forEach((it, i) => {
    it.addEventListener(`click`, (evt) => {
      evt.preventDefault();
      productAll[i].remove();      
      basketProducts = basketProducts.filter(product => {
        return product.id.toString() !== it.dataset.id;
      });
      onRecordLocalStorageArray();
      onCalculateTotalPrice();
    });
  });
};

//Функция удаления всех товаров из корзины
const onClickDeleteAllProduct = () => {
  const productAll = productWrapper.querySelectorAll(`.basket-modal__product`);

  deleteTotalButton.addEventListener(`click`, (evt) => {
    evt.preventDefault();
    productAll.forEach((it) => {
      it.remove();
      onCalculateTotalPrice();
    });
    basketProducts.splice(0, basketProducts.length);
    onRecordLocalStorageArray();
  });
};

//Timer
const alarmInfo = document.querySelector(`.product-card__alarm-info`);
const timerTime = 15 * 60;
const lsKey = `timerEnd`;
const savedTime = parseInt(localStorage.getItem(lsKey));

const castTimeFormat = (value) => {
  return value < 10 ? `0${value}` : `${value}`;
};

const timerStart = (finishDate) => {
  localStorage.setItem(lsKey, finishDate.getTime());

  const timerId = setInterval(() => {
    const seconds = parseInt((finishDate - new Date()) / 1000);
    const alarmMinute = parseInt((finishDate - new Date()) / 1000 / 60);
    const alarmSecond = parseInt(((finishDate - new Date()) - alarmMinute * 1000 * 60) / 1000);
    alarmInfo.textContent = `Offer valid ${castTimeFormat(alarmMinute)} : ${castTimeFormat(alarmSecond)}`;
    if (seconds <= 0) {
      clearInterval(timerId);
      onOpenModal(modalAlarm)();
      discountNo();
      localStorage.setItem(`isStock`, `false`);
      renderProduct();
    }
  }, 100);
}

window.onload = () => {
  const date = new Date();

  //Чтобы таймер больше не запускался
  savedTime ? date.setTime(savedTime) : date.setTime(date.getTime() + 1000 * timerTime);
  !!localStorage.getItem(`isStock`) ? discountNo() : timerStart(date);

  //Вставляет товары в корзину
  renderProduct();
  onCalculateTotalPrice();

  getOrderButtom();
};

//Функция, которая при окончании таймера удаляет его из карточки, скрывает акционную цену и делает выравнивание 
const discountNo = () => {
  const actualPrice = document.querySelectorAll(`.product-card__price`);

  if (!!document.querySelector(`.product-card__alarm`)) {
    document.querySelector(`.product-card__alarm`).remove();
    document.querySelector(`.product-card__wrapper-detail`).style.justifyContent = `flex-end`;
    actualPrice.forEach((it) => {
      it.classList.toggle(`product-card__price--actual`);
      !it.classList.contains(`product-card__price--actual`) ? it.remove() : ``;
    });
  }
};
