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
    imageClass: 'stretch',
    navNextContent: '>',
    navNextClass: 'lb__content__next',
    navPreviousContent: '<',
    navPreviousClass: 'lb__content__previous',
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
      imageIndex: '',
      imageGroup: {},
      imageGroupCount: 0,
      imageNavVisibility: false,
      thumbnailsVisibility: false,
      thumbnailsPerPage: 0,
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
    document.body.setAttribute('style','overflow: hidden');
    generateObjects();

    // Insert Lightbox into DOM
    document.body.appendChild(container.lightbox);
    buildOverlay();
    buildLightbox();
    setimage(currentState.imageIndex);
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
    currentState.imageIndex = findIndexByKeyValue(currentState.imageGroup, 'image', imageSrc);

    if (currentState.imageGroupCount > 1) {
      currentState.imageNavVisibility = true;
      currentState.thumbnailsVisibility = true;
    }
  };

  let setimage = function (index) {

    // Set image object
    currentState.imageIndex = index;
    currentState.image = currentState.imageGroup[index].image;

    // Update main image
    container.image.setAttribute('src', currentState.image);

    // Update description

    var description = currentState.imageGroup[index].description;
    container.description.innerHTML = description;

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
    container.content.className = settings.contentClass + (currentState.imageGroupCount == 1 ? ' ' + settings.contentClass +'--single' : '');

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

    container.content.insertBefore(container.navPrevious, container.imageWrapper);
    container.content.insertBefore(container.navNext, container.imageWrapper.nextSibling);

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
      setimage(currentState.imageIndex + 1);
    }
  };

  let previousImage = function () {
    if (currentState.imageIndex > 0) {
      setimage(currentState.imageIndex - 1);
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
        setimage(i);
      });

      newList.appendChild(container.thumbnails[i]);
      container.thumbnailsList.appendChild(newList);
    });


    refreshCurrentStates();

    // Generate thumbnail pagination if
    if(currentState.thumbnailsPerPage < currentState.imageGroupCount) {

      currentState.thumbnailsCurrentPage = 1;

      container.thumbnailsPrevious = document.createElement('div');
      container.thumbnailsPrevious.setAttribute('class', defaultSettings.thumbnailPreviousClass);
      container.thumbnailsPrevious.innerHTML = '<';
      container.footer.insertBefore(container.thumbnailsPrevious, container.thumbnailsWrapper);

      container.thumbnailsNext = document.createElement('div');
      container.thumbnailsNext.setAttribute('class', defaultSettings.thumbnailNextClass);
      container.thumbnailsNext.innerHTML = '>';
      container.footer.insertBefore(container.thumbnailsNext, container.thumbnailsWrapper.nextSibling);

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
      var scrollDistance = container.thumbnailsWrapper.offsetWidth ;
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

    if(currentState.imageGroupCount > 1) {
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
    window.addEventListener('resize', refreshCurrentStates);
  };

  let killListeners = function () {
    container.close.removeEventListener('click', selfDestruct);
    if(currentState.imageNavVisibility == true){
      if (container.navPrevious.hasOwnProperty('click')) container.navPrevious.removeEventListener('click', previousImage);
      if (container.navNext.hasOwnProperty('click')) container.navNext.removeEventListener('click', nextImage);
    }
    document.removeEventListener('keyup', keyNav);
  };

  let selfDestruct = function () {
    console.log('selfDestructing...');
    killListeners();
    document.body.removeChild(container.lightbox);
    document.body.removeChild(container.overlay);
    document.body.setAttribute('style','overflow: auto');
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
  var lightbox = new lightBox('a.lightbox', {
    closeButtonContent: 'Go Back ->',
  });
});
