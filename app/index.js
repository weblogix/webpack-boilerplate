if (module.hot)
  module.hot.accept();

import './index.scss';

'use strict';

function lightBox(element = '', options) {

  var settings, currentState, container;

  var defaultSettings = {
    activeClass: 'active',
    lightboxActivator: element != '' ? element : 'a.lightbox',
    lightboxClass: 'lb',
    overlayClass: 'lb__overlay',
    headerClass: 'lb__header',
    descriptionClass: 'lb__header__description',
    closeButtonContent: 'X',
    closeButtonClass: 'lb__header__close',
    contentClass: 'lb__content',
    imageWrapper: 'lb__content__image',
    imageClass: '',
    navNextContent: '>',
    navNextClass: 'lb__content__next',
    navPreviousContent: '<',
    navPreviousClass: 'lb__content__previous',
    navCounter: 'lb__content__counter',
    footerClass: 'lb__footer',
    thumbnailClass: 'lb__footer__thumbnails',
    thumbnailListClass: 'lb__footer__thumbnails__list',
    thumbnailPreviousClass: 'lb__footer__previous',
    thumbnailNextClass: 'lb__footer__next',
  };

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

    currentState = {
      activeObject: '',
      image: '',
      currentImageIndex: '',
      imageGroup: {},
      imageGroupCount: 0,
      imageNavVisibility: false,
      thumbnailsVisibility: false,
      thumbnailsPerPage: 0,
      thumbnailsTotalPages: 1,
      thumbnailsCurrentPage: 1,
      thumbnailsContainerWidth: 0,
    };

    container = {
      lightbox: document.createElement('div'),
      overlay: document.createElement('div'),
      header: document.createElement('header'),
      description: document.createElement('div'),
      content: document.createElement('div'),
      imageWrapper: document.createElement('div'),
      image: document.createElement('img'),
      close: document.createElement('div'),
      thumbnails: [],
    };

    currentState.activeObject = element;
    document.body.setAttribute('style', 'overflow: hidden'); // prevent body object from scrolling in the ackground
    generateObjects();

    // Insert Lightbox into DOM
    document.body.appendChild(container.lightbox);
    buildOverlay();
    buildLightbox();
    refreshCurrentStates();
    setimage(currentState.currentImageIndex);
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
        var description = e.hasAttribute('alt') ? e.getAttribute('alt') : '';
        imageArray.push({
          image: image,
          thumbnail: thumbnail,
          description: description,
        });
      });
    } else {
      imageArray.push({
        image: imageSrc,
        thumbnail: element.getElementsByTagName('img')[0].getAttribute('src'),
        description: element.hasAttribute('alt') ? element.getAttribute('alt') : '',
      });
    }

    currentState.imageGroup = imageArray;
    currentState.imageGroupCount = imageArray.length;
    currentState.currentImageIndex = findIndexByKeyValue(currentState.imageGroup, 'image', imageSrc);

    if (currentState.imageGroupCount > 1) {
      currentState.imageNavVisibility = true;
      currentState.thumbnailsVisibility = true;
    }
  };

  let setimage = function (index) {

    // Set image object
    currentState.currentImageIndex = index;
    currentState.image = currentState.imageGroup[index].image;

    // Update main image
    container.image.setAttribute('src', currentState.image);

    // Update description

    var description = currentState.imageGroup[index].description;
    container.description.innerHTML = description;
    // Update Counter

    if (currentState.imageNavVisibility == true) {
      container.counter.innerHTML = (currentState.currentImageIndex + 1) + '/' + currentState.imageGroupCount;
    }


    // Update thumbnails
    if (currentState.thumbnailsVisibility == true) {
      var children = container.thumbnailsList.childNodes;
      for (var i = 0; i < currentState.imageGroupCount; i++) {
        if (children[i].hasAttribute('class')) children[i].removeAttribute('class');

        if (i == currentState.currentImageIndex) {
          children[i].setAttribute('class', defaultSettings.activeClass);
          // console.log('jump to:' + children[i].getAttribute('data-page'));
          // Next thumbnail page if the thumbnail is half shown (belongs to the next page);
          if (children[i].hasAttribute('data-page') && children[i].getAttribute('data-page') != currentState.thumbnailsCurrentPage) {
            if (children[i].getAttribute('data-page') > currentState.thumbnailsCurrentPage) {
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
    container.content.className = settings.contentClass + (currentState.imageGroupCount == 1 ? ' ' + settings.contentClass + '--single' : '');

    container.imageWrapper.className = settings.imageWrapper;
    container.image.className = settings.imageClass;
    container.close.className = settings.closeButtonClass;
    container.close.innerHTML = settings.closeButtonContent;
    container.header.className = defaultSettings.headerClass;
    container.description.className = defaultSettings.descriptionClass;

    // Set the image src for main image
    container.image.src = currentState.image;

    // Append the lightbox to DOM
    container.content.appendChild(container.imageWrapper);
    container.imageWrapper.appendChild(container.image);

    container.header.appendChild(container.close);
    container.header.appendChild(container.description);

    container.lightbox.appendChild(container.header);
    container.lightbox.appendChild(container.content);

    if (currentState.imageNavVisibility == true) buildNavigation();
    if (currentState.thumbnailsVisibility == true) buildThumbnails();

  };

  let buildNavigation = function () {
    container.navNext = document.createElement('div');
    container.navNext.className = defaultSettings.navNextClass;
    container.navNext.innerHTML = defaultSettings.navNextContent;

    container.navPrevious = document.createElement('div');
    container.navPrevious.className = defaultSettings.navPreviousClass;
    container.navPrevious.innerHTML = defaultSettings.navPreviousContent;

    container.counter = document.createElement('div');
    container.counter.className = defaultSettings.navCounter;
    container.content.append(container.counter);

    container.content.insertBefore(container.navPrevious, container.imageWrapper);
    container.content.insertBefore(container.navNext, container.imageWrapper.nextSibling);

    container.navPrevious.addEventListener('click', previousImage);
    container.navNext.addEventListener('click', nextImage);
    document.addEventListener('keydown', keyNav);
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
    if (currentState.currentImageIndex < maxIndex) {
      setimage(currentState.currentImageIndex + 1);
    }
  };

  let previousImage = function () {
    if (currentState.currentImageIndex > 0) {
      setimage(currentState.currentImageIndex - 1);
    }
  };


  let buildThumbnails = function () {

    container.footer = document.createElement('footer'),
    container.footer.className = defaultSettings.footerClass;
    container.lightbox.appendChild(container.footer);

    container.thumbnailsWrapper = document.createElement('div');
    container.thumbnailsWrapper.className = defaultSettings.thumbnailClass;

    container.thumbnailsList = document.createElement('ul');
    container.thumbnailsList.setAttribute('class', defaultSettings.thumbnailListClass);

    container.thumbnailsWrapper.appendChild(container.thumbnailsList);
    container.footer.appendChild(container.thumbnailsWrapper);

    // Generate thumbnails

    currentState.imageGroup.forEach(function (e, i) {

      var newList = document.createElement('li');
      newList.setAttribute('data-index', i);
      container.thumbnails[i] = document.createElement('img');

      var image = currentState.imageGroup[i];
      container.thumbnails[i].setAttribute('src', image.thumbnail);
      container.thumbnails[i].setAttribute('class', 'stretch');

      if (i === currentState.currentImageIndex) {
        newList.className = defaultSettings.activeClass;
      }

      // Add listeners to update main image
      container.thumbnails[i].addEventListener('click', function () {
        setimage(i);
      });

      newList.appendChild(container.thumbnails[i]);
      container.thumbnailsList.appendChild(newList);
    });

    // Generate thumbnail pagination if
    if (currentState.thumbnailsPerPage < currentState.imageGroupCount) {

      currentState.thumbnailsCurrentPage = 1;

      container.thumbnailsPrevious = document.createElement('div');
      container.thumbnailsPrevious.setAttribute('class', defaultSettings.thumbnailPreviousClass);
      container.thumbnailsPrevious.innerHTML = '<';
      container.footer.insertBefore(container.thumbnailsPrevious, container.thumbnailsWrapper);

      container.thumbnailsNext = document.createElement('div');
      container.thumbnailsNext.setAttribute('class', defaultSettings.thumbnailNextClass);
      container.thumbnailsNext.innerHTML = '>';
      container.footer.insertBefore(container.thumbnailsNext, container.thumbnailsWrapper.nextSibling);

      // thumbnail navigation
      container.thumbnailsPrevious.addEventListener('click', previousThumbnailPage);
      container.thumbnailsNext.addEventListener('click', nextThumbnailPage);

    }

  };

  let nextThumbnailPage = function (currentPage) {
    if (typeof currentPage !== 'undefined') {
      currentPage = currentState.thumbnailsCurrentPage;
    }
    var nextPage = currentPage >= currentState.imageGroupCount ? currentState.imageGroupCount : currentPage + 1;

    if (currentPage * currentState.thumbnailsPerPage < currentState.imageGroupCount) {
      var scrollDistance = 0;
      var nextElement = currentPage * currentState.thumbnailsPerPage;
      var loopStart = nextElement - currentState.thumbnailsPerPage;

      // Calculate distance of previous objects (left)
      for (var i = loopStart; i < nextElement; i++) {
        scrollDistance = scrollDistance + getWidth(container.thumbnails[i].parentNode);
      }
      container.thumbnailsWrapper.scrollLeft += scrollDistance;
      currentState.thumbnailsCurrentPage = nextPage;
    }
  };

  let previousThumbnailPage = function (currentPage) {
    if (typeof currentPage !== 'undefined') {
      currentPage = currentState.thumbnailsCurrentPage;
    }
    var previousPage = currentPage == 1 ? 1 : currentPage - 1;

    if (previousPage >= 1) {
      var scrollDistance = getWidth(container.thumbnailsWrapper);
      container.thumbnailsWrapper.scrollLeft += scrollDistance * -1;
      currentState.thumbnailsCurrentPage = previousPage;
    }
  };

  let refreshThumbnailData = function (needle) {
    if (typeof needle == 'undefined') {
      needle = currentState.currentImageIndex;
    }
    var counter = 1;
    var page = 1;
    var counterMax = currentState.imageGroupCount - 1;

    for (var i = 0; i <= counterMax; i++) {
      container.thumbnails[i].parentNode.setAttribute('data-page', page);
      if (counter == currentState.thumbnailsPerPage) {
        page++;
        counter = 1;
      } else {
        counter++;
      }
    }

    currentState.thumbnailsTotalPages = page;

    if (currentState.thumbnailsTotalPages == 2 && currentState.imageGroupCount <= currentState.thumbnailsPerPage) {
      container.thumbnailsList.className = container.thumbnailsList.getAttribute('class') + ' align-center';
    } else {
      container.thumbnailsList.setAttribute('style', 'width: ' + currentState.thumbnailsContainerWidth + 'px');
    }
  };

  // Calculate settings that may continue to change
  let refreshCurrentStates = function () {

    if (currentState.thumbnailsVisibility == true && currentState.imageGroupCount > 1) {

      // Update global scope variables
      currentState.thumbnailsPerPage = Math.floor(getWidth(container.thumbnailsWrapper) / getWidth(container.thumbnailsList.childNodes[0]));

      // width of all the images combined
      container.thumbnailsList.childNodes.forEach(element => {
        var width = getWidth(element);
        currentState.thumbnailsContainerWidth = currentState.thumbnailsContainerWidth + width;
      });

      refreshThumbnailData();
    }
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
    if (currentState.thumbnailsVisibility == true && currentState.imageGroupCount > 1) {
      window.addEventListener('resize', refreshCurrentStates);
    }
  };

  let killListeners = function () {
    container.close.removeEventListener('click', selfDestruct);
    if (currentState.imageNavVisibility == true) {
      if (container.navPrevious.hasOwnProperty('click')) container.navPrevious.removeEventListener('click', previousImage);
      if (container.navNext.hasOwnProperty('click')) container.navNext.removeEventListener('click', nextImage);
    }
    document.removeEventListener('keyup', keyNav);
  };

  let selfDestruct = function () {
    // console.log('selfDestructing...');
    killListeners();
    document.body.removeChild(container.lightbox);
    document.body.removeChild(container.overlay);
    document.body.setAttribute('style', 'overflow: auto');
  };

  let findIndexByKeyValue = function (array, key, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][key] == value) {
        return i;
      }
    }
    return null;
  };

  let getWidth = function (element) {
    var style = element.currentStyle || window.getComputedStyle(element),
      width = element.offsetWidth, // or use style.width
      margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight),
      padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
      border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    return (width + margin - padding + border);
  };

  init();
}

document.addEventListener('DOMContentLoaded', function () {
  var lightbox = new lightBox('a.lightbox', {
    closeButtonContent: 'Go Back ->',
  });
});
