if (module.hot)
  module.hot.accept();

import './index.scss';

'use strict';

function lightBox(options) {

  var settings;
  var currentState = {
    activeObject: '',
    mainImage: 'https://shop.r10s.jp/culture/cabinet/1707-pic27/co-f57521-immid_1.jpg',
    imageIndex: '',
    imageGroup: {},
    imageGroupCount: 0,
  };
  var defaultSettings = {
    lightboxActivator: 'a.lightbox',
    lightboxClass: 'lb',
    overlayClass: 'lb__overlay',
    mainClass: 'lb__main',
    mainWrapperClass: 'lb__main__image',
    mainImgClass: 'lb__main__img stretch',
    closeButtonClass: 'lb__close',
    navNextContent: '>',
    navNextClass: 'lb__main__next',
    navPreviousContent: '<',
    navPreviousClass: 'lb__main__previous',
  };
  var container = {
    lightbox: document.createElement('div'),
    overlay: document.createElement('div'),
    main: document.createElement('div'),
    mainWrapper: document.createElement('div'),
    mainImg: document.createElement('img'),
    close: document.createElement('div'),
    nav: document.createElement('div'),
    navNext: document.createElement('div'),
    navPrevious: document.createElement('div'),
  };

  let init = function () {
    mergeConfig(options);
    // Add listenings to lightbox activators
    document.querySelectorAll(settings.lightboxActivator).forEach(function (e) {
      e.addEventListener('click', function (e) {
        e.preventDefault();
        build(this);
      });
    });
  };

  let mergeConfig = function () {
    settings = Object.assign(defaultSettings, options);
  };

  let buildImagesGroup = function () {
    // Get info of current image
    var element = currentState.activeObject;
    var imageSrc = element.href;
    var imageGroup = element.getAttribute('rel');
    var imageArray = [];

    // Is this a group of images?
    if (element.hasAttribute('rel')) {

      // Generate an array of group images and thumbnails
      document.querySelectorAll('[rel=' + imageGroup + ']').forEach(function (e) {
        var image = e.href;
        var thumbnail = e.getElementsByTagName('img')[0].getAttribute('src');
        imageArray.push({
          image: image,
          thumbnail: thumbnail,
        });
      });
    } else {
      imageArray.push({
        image: imageSrc,
        thumbnail: element.getElementsByTagName('img')[0].getAttribute('src'),
      });
    }

    currentState.imageGroup = imageArray;
    currentState.imageGroupCount = imageArray.length;
    currentState.imageIndex = findIndexByKeyValue(currentState.imageGroup, 'image', imageSrc);
  };

  let setMainImage = function (index) {
    currentState.imageIndex = index;
    currentState.mainImage = currentState.imageGroup[index].image;
    container.mainImg.setAttribute('src', currentState.mainImage);
  };

  // let getImageIndex = function(image) {
  //   return findIndexByKeyValue(currentState.imageGroup, 'image', image);
  // };

  let build = function (element) {

    currentState.activeObject = element;

    buildImagesGroup();
    setMainImage(currentState.imageIndex);

    buildContainer();
    buildOverlay();
    buildMain();
    document.body.appendChild(container.lightbox);
    setListeners();
  };

  let buildContainer = function () {
    container.lightbox.className = settings.lightboxClass;
  };

  let buildOverlay = function () {
    container.overlay.className = settings.overlayClass;
    container.lightbox.appendChild(container.overlay);
  };

  let buildMain = function () {
    // Build Lightbox
    container.main.className = settings.mainClass;
    container.mainWrapper.className = settings.mainWrapperClass;
    container.mainImg.className = settings.mainImgClass;
    container.close.className = settings.closeButtonClass;

    // Set the image src for main image
    container.mainImg.src = currentState.mainImage;

    // Append the lightbox to DOM
    container.main.appendChild(container.mainWrapper);
    container.mainWrapper.appendChild(container.mainImg);
    container.lightbox.appendChild(container.main);
    container.lightbox.appendChild(container.close);

    if (currentState.imageGroup.length > 1) {
      buildNavigation();
    }
  };

  let buildNavigation = function () {
    container.navNext.className = defaultSettings.navNextClass;
    container.navNext.innerHTML = defaultSettings.navNextContent;
    container.navPrevious.className = defaultSettings.navPreviousClass;
    container.navPrevious.innerHTML = defaultSettings.navPreviousContent;

    container.main.insertBefore(container.navPrevious, container.mainWrapper);
    container.main.insertBefore(container.navNext, container.mainWrapper.nextSibling);

    // Add listeners
    container.navPrevious.addEventListener('click', previousImage);
    container.navNext.addEventListener('click', nextImage);
    document.addEventListener('keyup', keyNav);
  };

  let keyNav = function (e) {
    if (e.keyCode === 37) {
      previousImage();
    } else if (e.keyCode === 39) {
      nextImage();
    }
  };

  let nextImage = function () {
    var maxIndex = currentState.imageGroupCount - 1;
    var nextIndex;
    if (currentState.imageIndex < maxIndex) {
      nextIndex = currentState.imageIndex + 1;
    } else {
      nextIndex = 0;
    }
    setMainImage(nextIndex);
  };

  let previousImage = function () {
    var maxIndex = currentState.imageGroupCount - 1;
    var nextIndex;
    if (currentState.imageIndex > 0) {
      nextIndex = currentState.imageIndex - 1;
    } else {
      nextIndex = maxIndex;
    }
    setMainImage(nextIndex);
  };

  let setListeners = function () {
    // Close Button
    container.close.addEventListener('click', selfDestruct);
    document.addEventListener('keyup', function destroyEsc(e) {
      if (e.keyCode === 27) {
        document.removeEventListener('keyup', destroyEsc);
        selfDestruct();
      }
    });
  };

  let killListeners = function () {
    container.close.removeEventListener('click', selfDestruct);
    if (container.navPrevious.hasOwnProperty('click')) container.navPrevious.removeEventListener('click', previousImage);
    if (container.navNext.hasOwnProperty('click')) container.navNext.removeEventListener('click', nextImage);
    document.removeEventListener('keyup', keyNav);
  };

  let selfDestruct = function () {
    console.log('selfDestructing...');
    killListeners();
    document.body.removeChild(container.lightbox);
  };

  let findIndexByKeyValue = function (array, key, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][key] == value) {
        return i;
      }
    }
    return null;
  };

  init();
}


document.addEventListener('DOMContentLoaded', function () {
  var lightbox = new lightBox; // lightbox.render();
});
