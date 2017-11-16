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
    imageNavVisibility: false,
    thumbnailsVisibility: false,
    thumbnailsPerPage: 0,
    thumbnailsCurrentPage: 1,
    thumbnailsContainerWidth: 0,
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
    thumbnailMainClass: 'lb__thumbnails',
    thumbnailWrapperClass: 'lb__thumbnails__items',
    thumbnailListClass: 'lb__thumbnails__items__list',
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

  let build = function (element) {

    currentState.activeObject = element;

    container.lightbox = document.createElement('div'),
    container.overlay = document.createElement('div'),
    container.main = document.createElement('div'),
    container.mainImageWrapper = document.createElement('div'),
    container.mainImage = document.createElement('img'),
    container.close = document.createElement('div'),
    container.thumbnails = [];

    generateObjects();

    // Insert Lightbox into DOM
    document.body.appendChild(container.lightbox);
    buildOverlay();
    buildLightbox();
    setMainImage(currentState.imageIndex);
    refreshCurrentStates();
    setListeners();
  };

  let generateObjects = function () {
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
    console.log('setting main image to image index: ' + index);
    // Set image object
    currentState.imageIndex = index;
    currentState.mainImage = currentState.imageGroup[index].image;

    // Update main image
    container.mainImage.setAttribute('src', currentState.mainImage);

    // Update thumbnails
    if(container.thumbnailsList != undefined && currentState.imageGroupCount > 0) {
      var children = container.thumbnailsList.childNodes;
      for(var i = 0; i < currentState.imageGroupCount; i++) {
        if (children[i].hasAttribute('class')) children[i].removeAttribute('class');

        if(i == currentState.imageIndex) {
          children[i].setAttribute('class', defaultSettings.activeClass);
          console.log('jump to:' + children[i].getAttribute('data-page'));
          // Next thumbnail page if the thumbnail is half shown (belongs to the next page);
          if(children[i].hasAttribute('data-page') && children[i].getAttribute('data-page') != currentState.thumbnailsCurrentPage) {
            if(children[i].getAttribute('data-page') > currentState.thumbnailsCurrentPage) {
              nextThumbnailPage(children[i].getAttribute('data-page'));
            } else {
              previousThumbnailPage(children[i].getAttribute('data-page'));
            }
          }

        }
      }
    }


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
      currentState.imageNavVisibility = true;
      currentState.thumbnailsVisibility = true;
    }
    if(currentState.imageNavVisibility == true) buildNavigation();
    if(currentState.thumbnailsVisibility  == true) buildThumbnails();

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
    if (currentState.imageIndex < maxIndex) {
      setMainImage(currentState.imageIndex + 1);
    }
  };

  let previousImage = function () {
    if (currentState.imageIndex > 0) {
      setMainImage(currentState.imageIndex - 1);
    }
  };


  let buildThumbnails = function () {

    container.thumbnailsMain = document.createElement('div'),
    container.thumbnailsMain.className = defaultSettings.thumbnailMainClass;
    container.lightbox.appendChild(container.thumbnailsMain);

    container.thumbnailsWrapper = document.createElement('div');
    container.thumbnailsWrapper.className = defaultSettings.thumbnailWrapperClass;

    container.thumbnailsList = document.createElement('ul');
    container.thumbnailsList.setAttribute('class', defaultSettings.thumbnailListClass);

    container.thumbnailsWrapper.appendChild(container.thumbnailsList);
    container.thumbnailsMain.appendChild(container.thumbnailsWrapper);

    // Generate thumbnails

    currentState.imageGroup.forEach(function(e, i){

      var newList = document.createElement('li');
      newList.setAttribute('data-index',i);
      container.thumbnails[i] = document.createElement('img');

      var image = currentState.imageGroup[i];
      container.thumbnails[i].setAttribute('src',image.thumbnail) ;
      container.thumbnails[i].setAttribute('class', 'stretch');

      if(i === currentState.imageIndex) {
        newList.className = defaultSettings.activeClass;
      }

      // Add listeners to update main image
      container.thumbnails[i].addEventListener('click',function() {
        setMainImage(i);
      });

      newList.appendChild(container.thumbnails[i]);
      container.thumbnailsList.appendChild(newList);
    });


    refreshCurrentStates();

    // Generate thumbnail pagination if
    if(currentState.thumbnailsPerPage < currentState.imageGroupCount) {

      currentState.thumbnailsCurrentPage = 1;

      container.thumbnailsPrevious = document.createElement('div');
      container.thumbnailsPrevious.setAttribute('class','lb__thumbnails__previous');
      container.thumbnailsPrevious.innerHTML = '<';
      container.thumbnailsMain.insertBefore(container.thumbnailsPrevious, container.thumbnailsWrapper);

      container.thumbnailsNext = document.createElement('div');
      container.thumbnailsNext.setAttribute('class','lb__thumbnails__next');
      container.thumbnailsNext.innerHTML = '>';
      container.thumbnailsMain.insertBefore(container.thumbnailsNext, container.thumbnailsWrapper.nextSibling);

      refreshThumbnailData();

      // thumbnail navigation
      container.thumbnailsPrevious.addEventListener('click', previousThumbnailPage);
      container.thumbnailsNext.addEventListener('click', nextThumbnailPage);

    }

  };


  let nextThumbnailPage = function(currentPage) {
    if(typeof currentPage !== 'undefined') {
      currentPage = currentState.thumbnailsCurrentPage;
    }
    var nextPage = currentPage >= currentState.imageGroupCount ? currentState.imageGroupCount : currentPage + 1;

    if(currentPage * currentState.thumbnailsPerPage < currentState.imageGroupCount) {
      var scrollDistance = 0;
      var nextElement = currentPage * currentState.thumbnailsPerPage;
      var loopStart = nextElement - currentState.thumbnailsPerPage;

      // Calculate distance of previous objects (left)
      for(var i = loopStart; i < nextElement; i++) {
        scrollDistance = scrollDistance + container.thumbnails[i].parentNode.offsetWidth;
      }
      container.thumbnailsWrapper.scrollLeft += scrollDistance;
      currentState.thumbnailsCurrentPage = nextPage;
      // refreshThumbnailData(nextElement);
    }
  };

  let previousThumbnailPage = function(currentPage) {
    if(typeof currentPage !== 'undefined') {
      currentPage = currentState.thumbnailsCurrentPage;
    }
    var previousPage = currentPage == 1 ? 1 : currentPage - 1;

    if(previousPage >= 1) {
      var scrollDistance = 0;
      var nextElement = previousPage + currentState.thumbnailsPerPage - 1;

      for(var i = nextElement; i < (nextElement + currentState.thumbnailsPerPage); i++) {
        scrollDistance = scrollDistance + container.thumbnails[i].parentNode.offsetWidth;
      }
      container.thumbnailsWrapper.scrollLeft += scrollDistance * -1;
      currentState.thumbnailsCurrentPage = previousPage;
    }
  };

  let refreshThumbnailData = function (needle) {
    if(typeof needle == 'undefined') {
      needle = currentState.imageIndex;
    }
    var counter = 1;
    var page = 1;
    var counterMax = currentState.imageGroupCount - 1;
    for(var i = 0; i <= counterMax; i++) {
      container.thumbnails[i].parentNode.setAttribute('data-page', page);
      if(counter == currentState.thumbnailsPerPage) {
        page++;
        counter = 1;
      } else {
        counter++;
      }
    }
    // currentState.thumbnailsCurrentPage = container.thumbnails[needle].parentNode.getAttribute('data-page');
  };

  // Calculate settings that may continue to change
  let refreshCurrentStates = function() {
    console.log('calculating window dimensions');
    // Update global scope variables
    currentState.thumbnailsPerPage = Math.floor(container.thumbnailsWrapper.offsetWidth / container.thumbnailsList.childNodes[0].offsetWidth);

    // width of all the images combined
    container.thumbnailsList.childNodes.forEach(element => {
      currentState.thumbnailsContainerWidth = currentState.thumbnailsContainerWidth + element.offsetWidth;
    });

    if(currentState.thumbnailsPerPage < currentState.imageGroupCount) {
      container.thumbnailsList.setAttribute('style','width: ' + currentState.thumbnailsContainerWidth + 'px');
    } else {
      container.thumbnailsList.className = container.thumbnailsList.getAttribute('class') + ' align-center';
    }
    // console.log('thumbnailsPerPage: ' + currentState.thumbnailsPerPage);
    refreshThumbnailData();
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
    window.addEventListener('resize', refreshCurrentStates);
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
