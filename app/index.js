if (module.hot)
  module.hot.accept();

import './index.scss';

'use strict';

function lightBox(element = '', options) {

  var settings;
  var currentState = {
    activeObject: '',
    mainImage: '',
    imageIndex: '',
    imageGroup: {},
    imageGroupCount: 0,
  };
  var defaultSettings = {
    activeClass: 'active',
    lightboxActivator: element != '' ? element : 'a.lightbox',
    lightboxClass: 'lb',
    overlayClass: 'lb-Overlay',
    closeButtonClass: 'lb__close',
    imageContainerClass: 'lb__image',
    mainImageWrapper: 'lb__image__main',
    mainImageClass: 'stretch',
    navNextContent: '>',
    navNextClass: 'lb__image__next',
    navPreviousContent: '<',
    navPreviousClass: 'lb__image__previous',
    thumbnailWrapperClass: 'lb__thumbnails',
    thumbnailListClass: 'lb__thumnails__list',
  };
  var container = {};

  let init = function () {
    mergeConfig(options);
    // Get an inventory of all the thumbnails
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

    // Set image object
    currentState.imageIndex = index;
    currentState.mainImage = currentState.imageGroup[index].image;

    // Update main image
    container.mainImage.setAttribute('src', currentState.mainImage);

    // Update thumbnails
    if(container.thumbnailsList != undefined && currentState.imageGroupCount > 0) {
      console.log('d');
      var children = container.thumbnailsList.childNodes;
      for(var i = 0; i < currentState.imageGroupCount; i++) {
        if (children[i].hasAttribute('class')) children[i].removeAttribute('class');

        if(i == currentState.imageIndex) {
          children[i].setAttribute('class', defaultSettings.activeClass);
        }
      }
    }

  };

  // let getImageIndex = function(image) {
  //   return findIndexByKeyValue(currentState.imageGroup, 'image', image);
  // };

  let build = function (element) {

    currentState.activeObject = element;

    container.lightbox = document.createElement('div'),
    container.overlay = document.createElement('div'),
    container.main = document.createElement('div'),
    container.mainImageWrapper = document.createElement('div'),
    container.mainImage = document.createElement('img'),
    container.close = document.createElement('div'),

    buildImagesGroup();
    setMainImage(currentState.imageIndex);
    buildLightbox();
    buildOverlay();
    document.body.appendChild(container.lightbox);
    setListeners();
  };

  let buildOverlay = function () {
    container.overlay.className = settings.overlayClass;
    document.body.insertBefore(container.overlay, container.lightbox.nextSibling);

    container.overlay.addEventListener('click', function destroyOverlay() {
      container.overlay.removeEventListener('click', destroyOverlay);
      selfDestruct();
    });
  };

  let buildLightbox = function () {

    container.lightbox.className = settings.lightboxClass;

    // Build Lightbox
    container.main.className = settings.imageContainerClass;
    container.mainImageWrapper.className = settings.mainImageWrapper;
    container.mainImage.className = settings.mainImageClass;
    container.close.className = settings.closeButtonClass;

    // Set the image src for main image
    container.mainImage.src = currentState.mainImage;

    // Append the lightbox to DOM
    container.main.appendChild(container.mainImageWrapper);
    container.mainImageWrapper.appendChild(container.mainImage);
    container.lightbox.appendChild(container.main);
    container.lightbox.appendChild(container.close);

    if (currentState.imageGroup.length > 1) {
      buildNavigation();
      buildThumbnails();
    }
  };

  let buildNavigation = function () {
    container.navNext = document.createElement('div'),
    container.navPrevious = document.createElement('div'),

    container.navNext.className = defaultSettings.navNextClass;
    container.navNext.innerHTML = defaultSettings.navNextContent;
    container.navPrevious.className = defaultSettings.navPreviousClass;
    container.navPrevious.innerHTML = defaultSettings.navPreviousContent;

    container.main.insertBefore(container.navPrevious, container.mainImageWrapper);
    container.main.insertBefore(container.navNext, container.mainImageWrapper.nextSibling);

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


  let buildThumbnails = function () {

    container.thumbnails = document.createElement('div'),
    container.thumbnails.className = defaultSettings.thumbnailWrapperClass;
    container.lightbox.appendChild(container.thumbnails);

    container.thumbnailsList = document.createElement('ul');
    container.thumbnails.appendChild(container.thumbnailsList);

    // Generate thumbnails
    // for(var i = 0; i < currentState.imageGroupCount; i++) {

    currentState.imageGroup.forEach(function(e, i){

      var newList = document.createElement('li');
      var newImage = document.createElement('img');

      var image = currentState.imageGroup[i];
      newImage.setAttribute('src',image.thumbnail) ;
      newImage.setAttribute('data-index',i);
      newImage.setAttribute('class', 'stretch');

      if(i === currentState.imageIndex) {
        newList.className = defaultSettings.activeClass;
      }

      newImage.addEventListener('click',function() {
        setMainImage(i);
      });

      newList.appendChild(newImage);
      container.thumbnailsList.appendChild(newList);

    });

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
    document.body.removeChild(container.overlay);
    container = {};
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
  var lightbox = new lightBox(); // lightbox.render();
});
