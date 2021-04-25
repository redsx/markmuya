'use strict';

var require$$0$2 = require('path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0$2);

/**!
 * @fileOverview Kickass library to create and place poppers near their reference elements.
 * @version 1.16.1
 * @license
 * Copyright (c) 2016 Federico Zivolo and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof navigator !== 'undefined';

var timeoutDuration = function () {
  var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
  for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
    if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
      return 1;
    }
  }
  return 0;
}();

function microtaskDebounce(fn) {
  var called = false;
  return function () {
    if (called) {
      return;
    }
    called = true;
    window.Promise.resolve().then(function () {
      called = false;
      fn();
    });
  };
}

function taskDebounce(fn) {
  var scheduled = false;
  return function () {
    if (!scheduled) {
      scheduled = true;
      setTimeout(function () {
        scheduled = false;
        fn();
      }, timeoutDuration);
    }
  };
}

var supportsMicroTasks = isBrowser && window.Promise;

/**
* Create a debounced version of a method, that's asynchronously deferred
* but called in the minimum time possible.
*
* @method
* @memberof Popper.Utils
* @argument {Function} fn
* @returns {Function}
*/
var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

/**
 * Check if the given variable is a function
 * @method
 * @memberof Popper.Utils
 * @argument {Any} functionToCheck - variable to check
 * @returns {Boolean} answer to: is a function?
 */
function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

/**
 * Get CSS computed property of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Eement} element
 * @argument {String} property
 */
function getStyleComputedProperty(element, property) {
  if (element.nodeType !== 1) {
    return [];
  }
  // NOTE: 1 DOM access here
  var window = element.ownerDocument.defaultView;
  var css = window.getComputedStyle(element, null);
  return property ? css[property] : css;
}

/**
 * Returns the parentNode or the host of the element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} parent
 */
function getParentNode(element) {
  if (element.nodeName === 'HTML') {
    return element;
  }
  return element.parentNode || element.host;
}

/**
 * Returns the scrolling parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} scroll parent
 */
function getScrollParent(element) {
  // Return body, `getScroll` will take care to get the correct `scrollTop` from it
  if (!element) {
    return document.body;
  }

  switch (element.nodeName) {
    case 'HTML':
    case 'BODY':
      return element.ownerDocument.body;
    case '#document':
      return element.body;
  }

  // Firefox want us to check `-x` and `-y` variations as well

  var _getStyleComputedProp = getStyleComputedProperty(element),
      overflow = _getStyleComputedProp.overflow,
      overflowX = _getStyleComputedProp.overflowX,
      overflowY = _getStyleComputedProp.overflowY;

  if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
    return element;
  }

  return getScrollParent(getParentNode(element));
}

/**
 * Returns the reference node of the reference object, or the reference object itself.
 * @method
 * @memberof Popper.Utils
 * @param {Element|Object} reference - the reference element (the popper will be relative to this)
 * @returns {Element} parent
 */
function getReferenceNode(reference) {
  return reference && reference.referenceNode ? reference.referenceNode : reference;
}

var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

/**
 * Determines if the browser is Internet Explorer
 * @method
 * @memberof Popper.Utils
 * @param {Number} version to check
 * @returns {Boolean} isIE
 */
function isIE(version) {
  if (version === 11) {
    return isIE11;
  }
  if (version === 10) {
    return isIE10;
  }
  return isIE11 || isIE10;
}

/**
 * Returns the offset parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} offset parent
 */
function getOffsetParent(element) {
  if (!element) {
    return document.documentElement;
  }

  var noOffsetParent = isIE(10) ? document.body : null;

  // NOTE: 1 DOM access here
  var offsetParent = element.offsetParent || null;
  // Skip hidden elements which don't have an offsetParent
  while (offsetParent === noOffsetParent && element.nextElementSibling) {
    offsetParent = (element = element.nextElementSibling).offsetParent;
  }

  var nodeName = offsetParent && offsetParent.nodeName;

  if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
    return element ? element.ownerDocument.documentElement : document.documentElement;
  }

  // .offsetParent will return the closest TH, TD or TABLE in case
  // no offsetParent is present, I hate this job...
  if (['TH', 'TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
    return getOffsetParent(offsetParent);
  }

  return offsetParent;
}

function isOffsetContainer(element) {
  var nodeName = element.nodeName;

  if (nodeName === 'BODY') {
    return false;
  }
  return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
}

/**
 * Finds the root node (document, shadowDOM root) of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} node
 * @returns {Element} root node
 */
function getRoot(node) {
  if (node.parentNode !== null) {
    return getRoot(node.parentNode);
  }

  return node;
}

/**
 * Finds the offset parent common to the two provided nodes
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element1
 * @argument {Element} element2
 * @returns {Element} common offset parent
 */
function findCommonOffsetParent(element1, element2) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
    return document.documentElement;
  }

  // Here we make sure to give as "start" the element that comes first in the DOM
  var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
  var start = order ? element1 : element2;
  var end = order ? element2 : element1;

  // Get common ancestor container
  var range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, 0);
  var commonAncestorContainer = range.commonAncestorContainer;

  // Both nodes are inside #document

  if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
    if (isOffsetContainer(commonAncestorContainer)) {
      return commonAncestorContainer;
    }

    return getOffsetParent(commonAncestorContainer);
  }

  // one of the nodes is inside shadowDOM, find which one
  var element1root = getRoot(element1);
  if (element1root.host) {
    return findCommonOffsetParent(element1root.host, element2);
  } else {
    return findCommonOffsetParent(element1, getRoot(element2).host);
  }
}

/**
 * Gets the scroll value of the given element in the given side (top and left)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {String} side `top` or `left`
 * @returns {number} amount of scrolled pixels
 */
function getScroll(element) {
  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

  var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
  var nodeName = element.nodeName;

  if (nodeName === 'BODY' || nodeName === 'HTML') {
    var html = element.ownerDocument.documentElement;
    var scrollingElement = element.ownerDocument.scrollingElement || html;
    return scrollingElement[upperSide];
  }

  return element[upperSide];
}

/*
 * Sum or subtract the element scroll values (left and top) from a given rect object
 * @method
 * @memberof Popper.Utils
 * @param {Object} rect - Rect object you want to change
 * @param {HTMLElement} element - The element from the function reads the scroll values
 * @param {Boolean} subtract - set to true if you want to subtract the scroll values
 * @return {Object} rect - The modifier rect object
 */
function includeScroll(rect, element) {
  var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var scrollTop = getScroll(element, 'top');
  var scrollLeft = getScroll(element, 'left');
  var modifier = subtract ? -1 : 1;
  rect.top += scrollTop * modifier;
  rect.bottom += scrollTop * modifier;
  rect.left += scrollLeft * modifier;
  rect.right += scrollLeft * modifier;
  return rect;
}

/*
 * Helper to detect borders of a given element
 * @method
 * @memberof Popper.Utils
 * @param {CSSStyleDeclaration} styles
 * Result of `getStyleComputedProperty` on the given element
 * @param {String} axis - `x` or `y`
 * @return {number} borders - The borders size of the given axis
 */

function getBordersSize(styles, axis) {
  var sideA = axis === 'x' ? 'Left' : 'Top';
  var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

  return parseFloat(styles['border' + sideA + 'Width']) + parseFloat(styles['border' + sideB + 'Width']);
}

function getSize(axis, body, html, computedStyle) {
  return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? parseInt(html['offset' + axis]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')]) : 0);
}

function getWindowSizes(document) {
  var body = document.body;
  var html = document.documentElement;
  var computedStyle = isIE(10) && getComputedStyle(html);

  return {
    height: getSize('Height', body, html, computedStyle),
    width: getSize('Width', body, html, computedStyle)
  };
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Given element offsets, generate an output similar to getBoundingClientRect
 * @method
 * @memberof Popper.Utils
 * @argument {Object} offsets
 * @returns {Object} ClientRect like output
 */
function getClientRect(offsets) {
  return _extends({}, offsets, {
    right: offsets.left + offsets.width,
    bottom: offsets.top + offsets.height
  });
}

/**
 * Get bounding client rect of given element
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} element
 * @return {Object} client rect
 */
function getBoundingClientRect(element) {
  var rect = {};

  // IE10 10 FIX: Please, don't ask, the element isn't
  // considered in DOM in some circumstances...
  // This isn't reproducible in IE10 compatibility mode of IE11
  try {
    if (isIE(10)) {
      rect = element.getBoundingClientRect();
      var scrollTop = getScroll(element, 'top');
      var scrollLeft = getScroll(element, 'left');
      rect.top += scrollTop;
      rect.left += scrollLeft;
      rect.bottom += scrollTop;
      rect.right += scrollLeft;
    } else {
      rect = element.getBoundingClientRect();
    }
  } catch (e) {}

  var result = {
    left: rect.left,
    top: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top
  };

  // subtract scrollbar size from sizes
  var sizes = element.nodeName === 'HTML' ? getWindowSizes(element.ownerDocument) : {};
  var width = sizes.width || element.clientWidth || result.width;
  var height = sizes.height || element.clientHeight || result.height;

  var horizScrollbar = element.offsetWidth - width;
  var vertScrollbar = element.offsetHeight - height;

  // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
  // we make this check conditional for performance reasons
  if (horizScrollbar || vertScrollbar) {
    var styles = getStyleComputedProperty(element);
    horizScrollbar -= getBordersSize(styles, 'x');
    vertScrollbar -= getBordersSize(styles, 'y');

    result.width -= horizScrollbar;
    result.height -= vertScrollbar;
  }

  return getClientRect(result);
}

function getOffsetRectRelativeToArbitraryNode(children, parent) {
  var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var isIE10 = isIE(10);
  var isHTML = parent.nodeName === 'HTML';
  var childrenRect = getBoundingClientRect(children);
  var parentRect = getBoundingClientRect(parent);
  var scrollParent = getScrollParent(children);

  var styles = getStyleComputedProperty(parent);
  var borderTopWidth = parseFloat(styles.borderTopWidth);
  var borderLeftWidth = parseFloat(styles.borderLeftWidth);

  // In cases where the parent is fixed, we must ignore negative scroll in offset calc
  if (fixedPosition && isHTML) {
    parentRect.top = Math.max(parentRect.top, 0);
    parentRect.left = Math.max(parentRect.left, 0);
  }
  var offsets = getClientRect({
    top: childrenRect.top - parentRect.top - borderTopWidth,
    left: childrenRect.left - parentRect.left - borderLeftWidth,
    width: childrenRect.width,
    height: childrenRect.height
  });
  offsets.marginTop = 0;
  offsets.marginLeft = 0;

  // Subtract margins of documentElement in case it's being used as parent
  // we do this only on HTML because it's the only element that behaves
  // differently when margins are applied to it. The margins are included in
  // the box of the documentElement, in the other cases not.
  if (!isIE10 && isHTML) {
    var marginTop = parseFloat(styles.marginTop);
    var marginLeft = parseFloat(styles.marginLeft);

    offsets.top -= borderTopWidth - marginTop;
    offsets.bottom -= borderTopWidth - marginTop;
    offsets.left -= borderLeftWidth - marginLeft;
    offsets.right -= borderLeftWidth - marginLeft;

    // Attach marginTop and marginLeft because in some circumstances we may need them
    offsets.marginTop = marginTop;
    offsets.marginLeft = marginLeft;
  }

  if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
    offsets = includeScroll(offsets, parent);
  }

  return offsets;
}

function getViewportOffsetRectRelativeToArtbitraryNode(element) {
  var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var html = element.ownerDocument.documentElement;
  var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
  var width = Math.max(html.clientWidth, window.innerWidth || 0);
  var height = Math.max(html.clientHeight, window.innerHeight || 0);

  var scrollTop = !excludeScroll ? getScroll(html) : 0;
  var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

  var offset = {
    top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
    left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
    width: width,
    height: height
  };

  return getClientRect(offset);
}

/**
 * Check if the given element is fixed or is inside a fixed parent
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {Element} customContainer
 * @returns {Boolean} answer to "isFixed?"
 */
function isFixed(element) {
  var nodeName = element.nodeName;
  if (nodeName === 'BODY' || nodeName === 'HTML') {
    return false;
  }
  if (getStyleComputedProperty(element, 'position') === 'fixed') {
    return true;
  }
  var parentNode = getParentNode(element);
  if (!parentNode) {
    return false;
  }
  return isFixed(parentNode);
}

/**
 * Finds the first parent of an element that has a transformed property defined
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} first transformed parent or documentElement
 */

function getFixedPositionOffsetParent(element) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element || !element.parentElement || isIE()) {
    return document.documentElement;
  }
  var el = element.parentElement;
  while (el && getStyleComputedProperty(el, 'transform') === 'none') {
    el = el.parentElement;
  }
  return el || document.documentElement;
}

/**
 * Computed the boundaries limits and return them
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} popper
 * @param {HTMLElement} reference
 * @param {number} padding
 * @param {HTMLElement} boundariesElement - Element used to define the boundaries
 * @param {Boolean} fixedPosition - Is in fixed position mode
 * @returns {Object} Coordinates of the boundaries
 */
function getBoundaries(popper, reference, padding, boundariesElement) {
  var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  // NOTE: 1 DOM access here

  var boundaries = { top: 0, left: 0 };
  var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));

  // Handle viewport case
  if (boundariesElement === 'viewport') {
    boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
  } else {
    // Handle other cases based on DOM element used as boundaries
    var boundariesNode = void 0;
    if (boundariesElement === 'scrollParent') {
      boundariesNode = getScrollParent(getParentNode(reference));
      if (boundariesNode.nodeName === 'BODY') {
        boundariesNode = popper.ownerDocument.documentElement;
      }
    } else if (boundariesElement === 'window') {
      boundariesNode = popper.ownerDocument.documentElement;
    } else {
      boundariesNode = boundariesElement;
    }

    var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

    // In case of HTML, we need a different computation
    if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
      var _getWindowSizes = getWindowSizes(popper.ownerDocument),
          height = _getWindowSizes.height,
          width = _getWindowSizes.width;

      boundaries.top += offsets.top - offsets.marginTop;
      boundaries.bottom = height + offsets.top;
      boundaries.left += offsets.left - offsets.marginLeft;
      boundaries.right = width + offsets.left;
    } else {
      // for all the other DOM elements, this one is good
      boundaries = offsets;
    }
  }

  // Add paddings
  padding = padding || 0;
  var isPaddingNumber = typeof padding === 'number';
  boundaries.left += isPaddingNumber ? padding : padding.left || 0;
  boundaries.top += isPaddingNumber ? padding : padding.top || 0;
  boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
  boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

  return boundaries;
}

function getArea(_ref) {
  var width = _ref.width,
      height = _ref.height;

  return width * height;
}

/**
 * Utility used to transform the `auto` placement to the placement with more
 * available space.
 * @method
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
  var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

  if (placement.indexOf('auto') === -1) {
    return placement;
  }

  var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

  var rects = {
    top: {
      width: boundaries.width,
      height: refRect.top - boundaries.top
    },
    right: {
      width: boundaries.right - refRect.right,
      height: boundaries.height
    },
    bottom: {
      width: boundaries.width,
      height: boundaries.bottom - refRect.bottom
    },
    left: {
      width: refRect.left - boundaries.left,
      height: boundaries.height
    }
  };

  var sortedAreas = Object.keys(rects).map(function (key) {
    return _extends({
      key: key
    }, rects[key], {
      area: getArea(rects[key])
    });
  }).sort(function (a, b) {
    return b.area - a.area;
  });

  var filteredAreas = sortedAreas.filter(function (_ref2) {
    var width = _ref2.width,
        height = _ref2.height;
    return width >= popper.clientWidth && height >= popper.clientHeight;
  });

  var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

  var variation = placement.split('-')[1];

  return computedPlacement + (variation ? '-' + variation : '');
}

/**
 * Get offsets to the reference element
 * @method
 * @memberof Popper.Utils
 * @param {Object} state
 * @param {Element} popper - the popper element
 * @param {Element} reference - the reference element (the popper will be relative to this)
 * @param {Element} fixedPosition - is in fixed position mode
 * @returns {Object} An object containing the offsets which will be applied to the popper
 */
function getReferenceOffsets(state, popper, reference) {
  var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));
  return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
}

/**
 * Get the outer sizes of the given element (offset size + margins)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Object} object containing width and height properties
 */
function getOuterSizes(element) {
  var window = element.ownerDocument.defaultView;
  var styles = window.getComputedStyle(element);
  var x = parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
  var y = parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
  var result = {
    width: element.offsetWidth + y,
    height: element.offsetHeight + x
  };
  return result;
}

/**
 * Get the opposite placement of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement
 * @returns {String} flipped placement
 */
function getOppositePlacement(placement) {
  var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash[matched];
  });
}

/**
 * Get offsets to the popper
 * @method
 * @memberof Popper.Utils
 * @param {Object} position - CSS position the Popper will get applied
 * @param {HTMLElement} popper - the popper element
 * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
 * @param {String} placement - one of the valid placement options
 * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
 */
function getPopperOffsets(popper, referenceOffsets, placement) {
  placement = placement.split('-')[0];

  // Get popper node sizes
  var popperRect = getOuterSizes(popper);

  // Add position, width and height to our offsets object
  var popperOffsets = {
    width: popperRect.width,
    height: popperRect.height
  };

  // depending by the popper placement we have to compute its offsets slightly differently
  var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
  var mainSide = isHoriz ? 'top' : 'left';
  var secondarySide = isHoriz ? 'left' : 'top';
  var measurement = isHoriz ? 'height' : 'width';
  var secondaryMeasurement = !isHoriz ? 'height' : 'width';

  popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
  if (placement === secondarySide) {
    popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
  } else {
    popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
  }

  return popperOffsets;
}

/**
 * Mimics the `find` method of Array
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function find(arr, check) {
  // use native find if supported
  if (Array.prototype.find) {
    return arr.find(check);
  }

  // use `filter` to obtain the same behavior of `find`
  return arr.filter(check)[0];
}

/**
 * Return the index of the matching object
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function findIndex(arr, prop, value) {
  // use native findIndex if supported
  if (Array.prototype.findIndex) {
    return arr.findIndex(function (cur) {
      return cur[prop] === value;
    });
  }

  // use `find` + `indexOf` if `findIndex` isn't supported
  var match = find(arr, function (obj) {
    return obj[prop] === value;
  });
  return arr.indexOf(match);
}

/**
 * Loop trough the list of modifiers and run them in order,
 * each of them will then edit the data object.
 * @method
 * @memberof Popper.Utils
 * @param {dataObject} data
 * @param {Array} modifiers
 * @param {String} ends - Optional modifier name used as stopper
 * @returns {dataObject}
 */
function runModifiers(modifiers, data, ends) {
  var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

  modifiersToRun.forEach(function (modifier) {
    if (modifier['function']) {
      // eslint-disable-line dot-notation
      console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
    }
    var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
    if (modifier.enabled && isFunction(fn)) {
      // Add properties to offsets to make them a complete clientRect object
      // we do this before each modifier to make sure the previous one doesn't
      // mess with these values
      data.offsets.popper = getClientRect(data.offsets.popper);
      data.offsets.reference = getClientRect(data.offsets.reference);

      data = fn(data, modifier);
    }
  });

  return data;
}

/**
 * Updates the position of the popper, computing the new offsets and applying
 * the new style.<br />
 * Prefer `scheduleUpdate` over `update` because of performance reasons.
 * @method
 * @memberof Popper
 */
function update() {
  // if popper is destroyed, don't perform any further update
  if (this.state.isDestroyed) {
    return;
  }

  var data = {
    instance: this,
    styles: {},
    arrowStyles: {},
    attributes: {},
    flipped: false,
    offsets: {}
  };

  // compute reference element offsets
  data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

  // store the computed placement inside `originalPlacement`
  data.originalPlacement = data.placement;

  data.positionFixed = this.options.positionFixed;

  // compute the popper offsets
  data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

  data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

  // run the modifiers
  data = runModifiers(this.modifiers, data);

  // the first `update` will call `onCreate` callback
  // the other ones will call `onUpdate` callback
  if (!this.state.isCreated) {
    this.state.isCreated = true;
    this.options.onCreate(data);
  } else {
    this.options.onUpdate(data);
  }
}

/**
 * Helper used to know if the given modifier is enabled.
 * @method
 * @memberof Popper.Utils
 * @returns {Boolean}
 */
function isModifierEnabled(modifiers, modifierName) {
  return modifiers.some(function (_ref) {
    var name = _ref.name,
        enabled = _ref.enabled;
    return enabled && name === modifierName;
  });
}

/**
 * Get the prefixed supported property name
 * @method
 * @memberof Popper.Utils
 * @argument {String} property (camelCase)
 * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
 */
function getSupportedPropertyName(property) {
  var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
  var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

  for (var i = 0; i < prefixes.length; i++) {
    var prefix = prefixes[i];
    var toCheck = prefix ? '' + prefix + upperProp : property;
    if (typeof document.body.style[toCheck] !== 'undefined') {
      return toCheck;
    }
  }
  return null;
}

/**
 * Destroys the popper.
 * @method
 * @memberof Popper
 */
function destroy() {
  this.state.isDestroyed = true;

  // touch DOM only if `applyStyle` modifier is enabled
  if (isModifierEnabled(this.modifiers, 'applyStyle')) {
    this.popper.removeAttribute('x-placement');
    this.popper.style.position = '';
    this.popper.style.top = '';
    this.popper.style.left = '';
    this.popper.style.right = '';
    this.popper.style.bottom = '';
    this.popper.style.willChange = '';
    this.popper.style[getSupportedPropertyName('transform')] = '';
  }

  this.disableEventListeners();

  // remove the popper if user explicitly asked for the deletion on destroy
  // do not use `remove` because IE11 doesn't support it
  if (this.options.removeOnDestroy) {
    this.popper.parentNode.removeChild(this.popper);
  }
  return this;
}

/**
 * Get the window associated with the element
 * @argument {Element} element
 * @returns {Window}
 */
function getWindow(element) {
  var ownerDocument = element.ownerDocument;
  return ownerDocument ? ownerDocument.defaultView : window;
}

function attachToScrollParents(scrollParent, event, callback, scrollParents) {
  var isBody = scrollParent.nodeName === 'BODY';
  var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
  target.addEventListener(event, callback, { passive: true });

  if (!isBody) {
    attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
  }
  scrollParents.push(target);
}

/**
 * Setup needed event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function setupEventListeners(reference, options, state, updateBound) {
  // Resize event listener on window
  state.updateBound = updateBound;
  getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

  // Scroll event listener on scroll parents
  var scrollElement = getScrollParent(reference);
  attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
  state.scrollElement = scrollElement;
  state.eventsEnabled = true;

  return state;
}

/**
 * It will add resize/scroll events and start recalculating
 * position of the popper element when they are triggered.
 * @method
 * @memberof Popper
 */
function enableEventListeners() {
  if (!this.state.eventsEnabled) {
    this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
  }
}

/**
 * Remove event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function removeEventListeners(reference, state) {
  // Remove resize event listener on window
  getWindow(reference).removeEventListener('resize', state.updateBound);

  // Remove scroll event listener on scroll parents
  state.scrollParents.forEach(function (target) {
    target.removeEventListener('scroll', state.updateBound);
  });

  // Reset state
  state.updateBound = null;
  state.scrollParents = [];
  state.scrollElement = null;
  state.eventsEnabled = false;
  return state;
}

/**
 * It will remove resize/scroll events and won't recalculate popper position
 * when they are triggered. It also won't trigger `onUpdate` callback anymore,
 * unless you call `update` method manually.
 * @method
 * @memberof Popper
 */
function disableEventListeners() {
  if (this.state.eventsEnabled) {
    cancelAnimationFrame(this.scheduleUpdate);
    this.state = removeEventListeners(this.reference, this.state);
  }
}

/**
 * Tells if a given input is a number
 * @method
 * @memberof Popper.Utils
 * @param {*} input to check
 * @return {Boolean}
 */
function isNumeric(n) {
  return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Set the style to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the style to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setStyles(element, styles) {
  Object.keys(styles).forEach(function (prop) {
    var unit = '';
    // add unit if the value is numeric and is one of the following
    if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
      unit = 'px';
    }
    element.style[prop] = styles[prop] + unit;
  });
}

/**
 * Set the attributes to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the attributes to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setAttributes(element, attributes) {
  Object.keys(attributes).forEach(function (prop) {
    var value = attributes[prop];
    if (value !== false) {
      element.setAttribute(prop, attributes[prop]);
    } else {
      element.removeAttribute(prop);
    }
  });
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} data.styles - List of style properties - values to apply to popper element
 * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The same data object
 */
function applyStyle(data) {
  // any property present in `data.styles` will be applied to the popper,
  // in this way we can make the 3rd party modifiers add custom styles to it
  // Be aware, modifiers could override the properties defined in the previous
  // lines of this modifier!
  setStyles(data.instance.popper, data.styles);

  // any property present in `data.attributes` will be applied to the popper,
  // they will be set as HTML attributes of the element
  setAttributes(data.instance.popper, data.attributes);

  // if arrowElement is defined and arrowStyles has some properties
  if (data.arrowElement && Object.keys(data.arrowStyles).length) {
    setStyles(data.arrowElement, data.arrowStyles);
  }

  return data;
}

/**
 * Set the x-placement attribute before everything else because it could be used
 * to add margins to the popper margins needs to be calculated to get the
 * correct popper offsets.
 * @method
 * @memberof Popper.modifiers
 * @param {HTMLElement} reference - The reference element used to position the popper
 * @param {HTMLElement} popper - The HTML element used as popper
 * @param {Object} options - Popper.js options
 */
function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
  // compute reference element offsets
  var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

  popper.setAttribute('x-placement', placement);

  // Apply `position` to popper before anything else because
  // without the position applied we can't guarantee correct computations
  setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

  return options;
}

/**
 * @function
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Boolean} shouldRound - If the offsets should be rounded at all
 * @returns {Object} The popper's position offsets rounded
 *
 * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
 * good as it can be within reason.
 * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
 *
 * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
 * as well on High DPI screens).
 *
 * Firefox prefers no rounding for positioning and does not have blurriness on
 * high DPI screens.
 *
 * Only horizontal placement and left/right values need to be considered.
 */
function getRoundedOffsets(data, shouldRound) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;
  var round = Math.round,
      floor = Math.floor;

  var noRound = function noRound(v) {
    return v;
  };

  var referenceWidth = round(reference.width);
  var popperWidth = round(popper.width);

  var isVertical = ['left', 'right'].indexOf(data.placement) !== -1;
  var isVariation = data.placement.indexOf('-') !== -1;
  var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
  var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;

  var horizontalToInteger = !shouldRound ? noRound : isVertical || isVariation || sameWidthParity ? round : floor;
  var verticalToInteger = !shouldRound ? noRound : round;

  return {
    left: horizontalToInteger(bothOddWidth && !isVariation && shouldRound ? popper.left - 1 : popper.left),
    top: verticalToInteger(popper.top),
    bottom: verticalToInteger(popper.bottom),
    right: horizontalToInteger(popper.right)
  };
}

var isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeStyle(data, options) {
  var x = options.x,
      y = options.y;
  var popper = data.offsets.popper;

  // Remove this legacy support in Popper.js v2

  var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'applyStyle';
  }).gpuAcceleration;
  if (legacyGpuAccelerationOption !== undefined) {
    console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
  }
  var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

  var offsetParent = getOffsetParent(data.instance.popper);
  var offsetParentRect = getBoundingClientRect(offsetParent);

  // Styles
  var styles = {
    position: popper.position
  };

  var offsets = getRoundedOffsets(data, window.devicePixelRatio < 2 || !isFirefox);

  var sideA = x === 'bottom' ? 'top' : 'bottom';
  var sideB = y === 'right' ? 'left' : 'right';

  // if gpuAcceleration is set to `true` and transform is supported,
  //  we use `translate3d` to apply the position to the popper we
  // automatically use the supported prefixed version if needed
  var prefixedProperty = getSupportedPropertyName('transform');

  // now, let's make a step back and look at this code closely (wtf?)
  // If the content of the popper grows once it's been positioned, it
  // may happen that the popper gets misplaced because of the new content
  // overflowing its reference element
  // To avoid this problem, we provide two options (x and y), which allow
  // the consumer to define the offset origin.
  // If we position a popper on top of a reference element, we can set
  // `x` to `top` to make the popper grow towards its top instead of
  // its bottom.
  var left = void 0,
      top = void 0;
  if (sideA === 'bottom') {
    // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
    // and not the bottom of the html element
    if (offsetParent.nodeName === 'HTML') {
      top = -offsetParent.clientHeight + offsets.bottom;
    } else {
      top = -offsetParentRect.height + offsets.bottom;
    }
  } else {
    top = offsets.top;
  }
  if (sideB === 'right') {
    if (offsetParent.nodeName === 'HTML') {
      left = -offsetParent.clientWidth + offsets.right;
    } else {
      left = -offsetParentRect.width + offsets.right;
    }
  } else {
    left = offsets.left;
  }
  if (gpuAcceleration && prefixedProperty) {
    styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    styles[sideA] = 0;
    styles[sideB] = 0;
    styles.willChange = 'transform';
  } else {
    // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
    var invertTop = sideA === 'bottom' ? -1 : 1;
    var invertLeft = sideB === 'right' ? -1 : 1;
    styles[sideA] = top * invertTop;
    styles[sideB] = left * invertLeft;
    styles.willChange = sideA + ', ' + sideB;
  }

  // Attributes
  var attributes = {
    'x-placement': data.placement
  };

  // Update `data` attributes, styles and arrowStyles
  data.attributes = _extends({}, attributes, data.attributes);
  data.styles = _extends({}, styles, data.styles);
  data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

  return data;
}

/**
 * Helper used to know if the given modifier depends from another one.<br />
 * It checks if the needed modifier is listed and enabled.
 * @method
 * @memberof Popper.Utils
 * @param {Array} modifiers - list of modifiers
 * @param {String} requestingName - name of requesting modifier
 * @param {String} requestedName - name of requested modifier
 * @returns {Boolean}
 */
function isModifierRequired(modifiers, requestingName, requestedName) {
  var requesting = find(modifiers, function (_ref) {
    var name = _ref.name;
    return name === requestingName;
  });

  var isRequired = !!requesting && modifiers.some(function (modifier) {
    return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
  });

  if (!isRequired) {
    var _requesting = '`' + requestingName + '`';
    var requested = '`' + requestedName + '`';
    console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
  }
  return isRequired;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function arrow(data, options) {
  var _data$offsets$arrow;

  // arrow depends on keepTogether in order to work
  if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
    return data;
  }

  var arrowElement = options.element;

  // if arrowElement is a string, suppose it's a CSS selector
  if (typeof arrowElement === 'string') {
    arrowElement = data.instance.popper.querySelector(arrowElement);

    // if arrowElement is not found, don't run the modifier
    if (!arrowElement) {
      return data;
    }
  } else {
    // if the arrowElement isn't a query selector we must check that the
    // provided DOM node is child of its popper node
    if (!data.instance.popper.contains(arrowElement)) {
      console.warn('WARNING: `arrow.element` must be child of its popper element!');
      return data;
    }
  }

  var placement = data.placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isVertical = ['left', 'right'].indexOf(placement) !== -1;

  var len = isVertical ? 'height' : 'width';
  var sideCapitalized = isVertical ? 'Top' : 'Left';
  var side = sideCapitalized.toLowerCase();
  var altSide = isVertical ? 'left' : 'top';
  var opSide = isVertical ? 'bottom' : 'right';
  var arrowElementSize = getOuterSizes(arrowElement)[len];

  //
  // extends keepTogether behavior making sure the popper and its
  // reference have enough pixels in conjunction
  //

  // top/left side
  if (reference[opSide] - arrowElementSize < popper[side]) {
    data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
  }
  // bottom/right side
  if (reference[side] + arrowElementSize > popper[opSide]) {
    data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
  }
  data.offsets.popper = getClientRect(data.offsets.popper);

  // compute center of the popper
  var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

  // Compute the sideValue using the updated popper offsets
  // take popper margin in account because we don't have this info available
  var css = getStyleComputedProperty(data.instance.popper);
  var popperMarginSide = parseFloat(css['margin' + sideCapitalized]);
  var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width']);
  var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

  // prevent arrowElement from being placed not contiguously to its popper
  sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

  data.arrowElement = arrowElement;
  data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

  return data;
}

/**
 * Get the opposite placement variation of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement variation
 * @returns {String} flipped placement variation
 */
function getOppositeVariation(variation) {
  if (variation === 'end') {
    return 'start';
  } else if (variation === 'start') {
    return 'end';
  }
  return variation;
}

/**
 * List of accepted placements to use as values of the `placement` option.<br />
 * Valid placements are:
 * - `auto`
 * - `top`
 * - `right`
 * - `bottom`
 * - `left`
 *
 * Each placement can have a variation from this list:
 * - `-start`
 * - `-end`
 *
 * Variations are interpreted easily if you think of them as the left to right
 * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
 * is right.<br />
 * Vertically (`left` and `right`), `start` is top and `end` is bottom.
 *
 * Some valid examples are:
 * - `top-end` (on top of reference, right aligned)
 * - `right-start` (on right of reference, top aligned)
 * - `bottom` (on bottom, centered)
 * - `auto-end` (on the side with more space available, alignment depends by placement)
 *
 * @static
 * @type {Array}
 * @enum {String}
 * @readonly
 * @method placements
 * @memberof Popper
 */
var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

// Get rid of `auto` `auto-start` and `auto-end`
var validPlacements = placements.slice(3);

/**
 * Given an initial placement, returns all the subsequent placements
 * clockwise (or counter-clockwise).
 *
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement - A valid placement (it accepts variations)
 * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
 * @returns {Array} placements including their variations
 */
function clockwise(placement) {
  var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var index = validPlacements.indexOf(placement);
  var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
  return counter ? arr.reverse() : arr;
}

var BEHAVIORS = {
  FLIP: 'flip',
  CLOCKWISE: 'clockwise',
  COUNTERCLOCKWISE: 'counterclockwise'
};

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function flip(data, options) {
  // if `inner` modifier is enabled, we can't use the `flip` modifier
  if (isModifierEnabled(data.instance.modifiers, 'inner')) {
    return data;
  }

  if (data.flipped && data.placement === data.originalPlacement) {
    // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
    return data;
  }

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

  var placement = data.placement.split('-')[0];
  var placementOpposite = getOppositePlacement(placement);
  var variation = data.placement.split('-')[1] || '';

  var flipOrder = [];

  switch (options.behavior) {
    case BEHAVIORS.FLIP:
      flipOrder = [placement, placementOpposite];
      break;
    case BEHAVIORS.CLOCKWISE:
      flipOrder = clockwise(placement);
      break;
    case BEHAVIORS.COUNTERCLOCKWISE:
      flipOrder = clockwise(placement, true);
      break;
    default:
      flipOrder = options.behavior;
  }

  flipOrder.forEach(function (step, index) {
    if (placement !== step || flipOrder.length === index + 1) {
      return data;
    }

    placement = data.placement.split('-')[0];
    placementOpposite = getOppositePlacement(placement);

    var popperOffsets = data.offsets.popper;
    var refOffsets = data.offsets.reference;

    // using floor because the reference offsets may contain decimals we are not going to consider here
    var floor = Math.floor;
    var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

    var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
    var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
    var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
    var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

    var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

    // flip the variation if required
    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;

    // flips variation if reference element overflows boundaries
    var flippedVariationByRef = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

    // flips variation if popper content overflows boundaries
    var flippedVariationByContent = !!options.flipVariationsByContent && (isVertical && variation === 'start' && overflowsRight || isVertical && variation === 'end' && overflowsLeft || !isVertical && variation === 'start' && overflowsBottom || !isVertical && variation === 'end' && overflowsTop);

    var flippedVariation = flippedVariationByRef || flippedVariationByContent;

    if (overlapsRef || overflowsBoundaries || flippedVariation) {
      // this boolean to detect any flip loop
      data.flipped = true;

      if (overlapsRef || overflowsBoundaries) {
        placement = flipOrder[index + 1];
      }

      if (flippedVariation) {
        variation = getOppositeVariation(variation);
      }

      data.placement = placement + (variation ? '-' + variation : '');

      // this object contains `position`, we want to preserve it along with
      // any additional property we may add in the future
      data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

      data = runModifiers(data.instance.modifiers, data, 'flip');
    }
  });
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function keepTogether(data) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var placement = data.placement.split('-')[0];
  var floor = Math.floor;
  var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
  var side = isVertical ? 'right' : 'bottom';
  var opSide = isVertical ? 'left' : 'top';
  var measurement = isVertical ? 'width' : 'height';

  if (popper[side] < floor(reference[opSide])) {
    data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
  }
  if (popper[opSide] > floor(reference[side])) {
    data.offsets.popper[opSide] = floor(reference[side]);
  }

  return data;
}

/**
 * Converts a string containing value + unit into a px value number
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} str - Value + unit string
 * @argument {String} measurement - `height` or `width`
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @returns {Number|String}
 * Value in pixels, or original string if no values were extracted
 */
function toValue(str, measurement, popperOffsets, referenceOffsets) {
  // separate value from unit
  var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
  var value = +split[1];
  var unit = split[2];

  // If it's not a number it's an operator, I guess
  if (!value) {
    return str;
  }

  if (unit.indexOf('%') === 0) {
    var element = void 0;
    switch (unit) {
      case '%p':
        element = popperOffsets;
        break;
      case '%':
      case '%r':
      default:
        element = referenceOffsets;
    }

    var rect = getClientRect(element);
    return rect[measurement] / 100 * value;
  } else if (unit === 'vh' || unit === 'vw') {
    // if is a vh or vw, we calculate the size based on the viewport
    var size = void 0;
    if (unit === 'vh') {
      size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    } else {
      size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    return size / 100 * value;
  } else {
    // if is an explicit pixel unit, we get rid of the unit and keep the value
    // if is an implicit unit, it's px, and we return just the value
    return value;
  }
}

/**
 * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} offset
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @argument {String} basePlacement
 * @returns {Array} a two cells array with x and y offsets in numbers
 */
function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
  var offsets = [0, 0];

  // Use height if placement is left or right and index is 0 otherwise use width
  // in this way the first offset will use an axis and the second one
  // will use the other one
  var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

  // Split the offset string to obtain a list of values and operands
  // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
  var fragments = offset.split(/(\+|\-)/).map(function (frag) {
    return frag.trim();
  });

  // Detect if the offset string contains a pair of values or a single one
  // they could be separated by comma or space
  var divider = fragments.indexOf(find(fragments, function (frag) {
    return frag.search(/,|\s/) !== -1;
  }));

  if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
    console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
  }

  // If divider is found, we divide the list of values and operands to divide
  // them by ofset X and Y.
  var splitRegex = /\s*,\s*|\s+/;
  var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

  // Convert the values with units to absolute pixels to allow our computations
  ops = ops.map(function (op, index) {
    // Most of the units rely on the orientation of the popper
    var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
    var mergeWithPrevious = false;
    return op
    // This aggregates any `+` or `-` sign that aren't considered operators
    // e.g.: 10 + +5 => [10, +, +5]
    .reduce(function (a, b) {
      if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
        a[a.length - 1] = b;
        mergeWithPrevious = true;
        return a;
      } else if (mergeWithPrevious) {
        a[a.length - 1] += b;
        mergeWithPrevious = false;
        return a;
      } else {
        return a.concat(b);
      }
    }, [])
    // Here we convert the string values into number values (in px)
    .map(function (str) {
      return toValue(str, measurement, popperOffsets, referenceOffsets);
    });
  });

  // Loop trough the offsets arrays and execute the operations
  ops.forEach(function (op, index) {
    op.forEach(function (frag, index2) {
      if (isNumeric(frag)) {
        offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
      }
    });
  });
  return offsets;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @argument {Number|String} options.offset=0
 * The offset value as described in the modifier description
 * @returns {Object} The data object, properly modified
 */
function offset(data, _ref) {
  var offset = _ref.offset;
  var placement = data.placement,
      _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var basePlacement = placement.split('-')[0];

  var offsets = void 0;
  if (isNumeric(+offset)) {
    offsets = [+offset, 0];
  } else {
    offsets = parseOffset(offset, popper, reference, basePlacement);
  }

  if (basePlacement === 'left') {
    popper.top += offsets[0];
    popper.left -= offsets[1];
  } else if (basePlacement === 'right') {
    popper.top += offsets[0];
    popper.left += offsets[1];
  } else if (basePlacement === 'top') {
    popper.left += offsets[0];
    popper.top -= offsets[1];
  } else if (basePlacement === 'bottom') {
    popper.left += offsets[0];
    popper.top += offsets[1];
  }

  data.popper = popper;
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function preventOverflow(data, options) {
  var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

  // If offsetParent is the reference element, we really want to
  // go one step up and use the next offsetParent as reference to
  // avoid to make this modifier completely useless and look like broken
  if (data.instance.reference === boundariesElement) {
    boundariesElement = getOffsetParent(boundariesElement);
  }

  // NOTE: DOM access here
  // resets the popper's position so that the document size can be calculated excluding
  // the size of the popper element itself
  var transformProp = getSupportedPropertyName('transform');
  var popperStyles = data.instance.popper.style; // assignment to help minification
  var top = popperStyles.top,
      left = popperStyles.left,
      transform = popperStyles[transformProp];

  popperStyles.top = '';
  popperStyles.left = '';
  popperStyles[transformProp] = '';

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

  // NOTE: DOM access here
  // restores the original style properties after the offsets have been computed
  popperStyles.top = top;
  popperStyles.left = left;
  popperStyles[transformProp] = transform;

  options.boundaries = boundaries;

  var order = options.priority;
  var popper = data.offsets.popper;

  var check = {
    primary: function primary(placement) {
      var value = popper[placement];
      if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
        value = Math.max(popper[placement], boundaries[placement]);
      }
      return defineProperty({}, placement, value);
    },
    secondary: function secondary(placement) {
      var mainSide = placement === 'right' ? 'left' : 'top';
      var value = popper[mainSide];
      if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
        value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
      }
      return defineProperty({}, mainSide, value);
    }
  };

  order.forEach(function (placement) {
    var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
    popper = _extends({}, popper, check[side](placement));
  });

  data.offsets.popper = popper;

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function shift(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var shiftvariation = placement.split('-')[1];

  // if shift shiftvariation is specified, run the modifier
  if (shiftvariation) {
    var _data$offsets = data.offsets,
        reference = _data$offsets.reference,
        popper = _data$offsets.popper;

    var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
    var side = isVertical ? 'left' : 'top';
    var measurement = isVertical ? 'width' : 'height';

    var shiftOffsets = {
      start: defineProperty({}, side, reference[side]),
      end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
    };

    data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function hide(data) {
  if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
    return data;
  }

  var refRect = data.offsets.reference;
  var bound = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'preventOverflow';
  }).boundaries;

  if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === true) {
      return data;
    }

    data.hide = true;
    data.attributes['x-out-of-boundaries'] = '';
  } else {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === false) {
      return data;
    }

    data.hide = false;
    data.attributes['x-out-of-boundaries'] = false;
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function inner(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

  var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

  popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

  data.placement = getOppositePlacement(placement);
  data.offsets.popper = getClientRect(popper);

  return data;
}

/**
 * Modifier function, each modifier can have a function of this type assigned
 * to its `fn` property.<br />
 * These functions will be called on each update, this means that you must
 * make sure they are performant enough to avoid performance bottlenecks.
 *
 * @function ModifierFn
 * @argument {dataObject} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {dataObject} The data object, properly modified
 */

/**
 * Modifiers are plugins used to alter the behavior of your poppers.<br />
 * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
 * needed by the library.
 *
 * Usually you don't want to override the `order`, `fn` and `onLoad` props.
 * All the other properties are configurations that could be tweaked.
 * @namespace modifiers
 */
var modifiers = {
  /**
   * Modifier used to shift the popper on the start or end of its reference
   * element.<br />
   * It will read the variation of the `placement` property.<br />
   * It can be one either `-end` or `-start`.
   * @memberof modifiers
   * @inner
   */
  shift: {
    /** @prop {number} order=100 - Index used to define the order of execution */
    order: 100,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: shift
  },

  /**
   * The `offset` modifier can shift your popper on both its axis.
   *
   * It accepts the following units:
   * - `px` or unit-less, interpreted as pixels
   * - `%` or `%r`, percentage relative to the length of the reference element
   * - `%p`, percentage relative to the length of the popper element
   * - `vw`, CSS viewport width unit
   * - `vh`, CSS viewport height unit
   *
   * For length is intended the main axis relative to the placement of the popper.<br />
   * This means that if the placement is `top` or `bottom`, the length will be the
   * `width`. In case of `left` or `right`, it will be the `height`.
   *
   * You can provide a single value (as `Number` or `String`), or a pair of values
   * as `String` divided by a comma or one (or more) white spaces.<br />
   * The latter is a deprecated method because it leads to confusion and will be
   * removed in v2.<br />
   * Additionally, it accepts additions and subtractions between different units.
   * Note that multiplications and divisions aren't supported.
   *
   * Valid examples are:
   * ```
   * 10
   * '10%'
   * '10, 10'
   * '10%, 10'
   * '10 + 10%'
   * '10 - 5vh + 3%'
   * '-10px + 5vh, 5px - 6%'
   * ```
   * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
   * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
   * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
   *
   * @memberof modifiers
   * @inner
   */
  offset: {
    /** @prop {number} order=200 - Index used to define the order of execution */
    order: 200,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: offset,
    /** @prop {Number|String} offset=0
     * The offset value as described in the modifier description
     */
    offset: 0
  },

  /**
   * Modifier used to prevent the popper from being positioned outside the boundary.
   *
   * A scenario exists where the reference itself is not within the boundaries.<br />
   * We can say it has "escaped the boundaries" — or just "escaped".<br />
   * In this case we need to decide whether the popper should either:
   *
   * - detach from the reference and remain "trapped" in the boundaries, or
   * - if it should ignore the boundary and "escape with its reference"
   *
   * When `escapeWithReference` is set to`true` and reference is completely
   * outside its boundaries, the popper will overflow (or completely leave)
   * the boundaries in order to remain attached to the edge of the reference.
   *
   * @memberof modifiers
   * @inner
   */
  preventOverflow: {
    /** @prop {number} order=300 - Index used to define the order of execution */
    order: 300,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: preventOverflow,
    /**
     * @prop {Array} [priority=['left','right','top','bottom']]
     * Popper will try to prevent overflow following these priorities by default,
     * then, it could overflow on the left and on top of the `boundariesElement`
     */
    priority: ['left', 'right', 'top', 'bottom'],
    /**
     * @prop {number} padding=5
     * Amount of pixel used to define a minimum distance between the boundaries
     * and the popper. This makes sure the popper always has a little padding
     * between the edges of its container
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='scrollParent'
     * Boundaries used by the modifier. Can be `scrollParent`, `window`,
     * `viewport` or any DOM element.
     */
    boundariesElement: 'scrollParent'
  },

  /**
   * Modifier used to make sure the reference and its popper stay near each other
   * without leaving any gap between the two. Especially useful when the arrow is
   * enabled and you want to ensure that it points to its reference element.
   * It cares only about the first axis. You can still have poppers with margin
   * between the popper and its reference element.
   * @memberof modifiers
   * @inner
   */
  keepTogether: {
    /** @prop {number} order=400 - Index used to define the order of execution */
    order: 400,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: keepTogether
  },

  /**
   * This modifier is used to move the `arrowElement` of the popper to make
   * sure it is positioned between the reference element and its popper element.
   * It will read the outer size of the `arrowElement` node to detect how many
   * pixels of conjunction are needed.
   *
   * It has no effect if no `arrowElement` is provided.
   * @memberof modifiers
   * @inner
   */
  arrow: {
    /** @prop {number} order=500 - Index used to define the order of execution */
    order: 500,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: arrow,
    /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
    element: '[x-arrow]'
  },

  /**
   * Modifier used to flip the popper's placement when it starts to overlap its
   * reference element.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   *
   * **NOTE:** this modifier will interrupt the current update cycle and will
   * restart it if it detects the need to flip the placement.
   * @memberof modifiers
   * @inner
   */
  flip: {
    /** @prop {number} order=600 - Index used to define the order of execution */
    order: 600,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: flip,
    /**
     * @prop {String|Array} behavior='flip'
     * The behavior used to change the popper's placement. It can be one of
     * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
     * placements (with optional variations)
     */
    behavior: 'flip',
    /**
     * @prop {number} padding=5
     * The popper will flip if it hits the edges of the `boundariesElement`
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='viewport'
     * The element which will define the boundaries of the popper position.
     * The popper will never be placed outside of the defined boundaries
     * (except if `keepTogether` is enabled)
     */
    boundariesElement: 'viewport',
    /**
     * @prop {Boolean} flipVariations=false
     * The popper will switch placement variation between `-start` and `-end` when
     * the reference element overlaps its boundaries.
     *
     * The original placement should have a set variation.
     */
    flipVariations: false,
    /**
     * @prop {Boolean} flipVariationsByContent=false
     * The popper will switch placement variation between `-start` and `-end` when
     * the popper element overlaps its reference boundaries.
     *
     * The original placement should have a set variation.
     */
    flipVariationsByContent: false
  },

  /**
   * Modifier used to make the popper flow toward the inner of the reference element.
   * By default, when this modifier is disabled, the popper will be placed outside
   * the reference element.
   * @memberof modifiers
   * @inner
   */
  inner: {
    /** @prop {number} order=700 - Index used to define the order of execution */
    order: 700,
    /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
    enabled: false,
    /** @prop {ModifierFn} */
    fn: inner
  },

  /**
   * Modifier used to hide the popper when its reference element is outside of the
   * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
   * be used to hide with a CSS selector the popper when its reference is
   * out of boundaries.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   * @memberof modifiers
   * @inner
   */
  hide: {
    /** @prop {number} order=800 - Index used to define the order of execution */
    order: 800,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: hide
  },

  /**
   * Computes the style that will be applied to the popper element to gets
   * properly positioned.
   *
   * Note that this modifier will not touch the DOM, it just prepares the styles
   * so that `applyStyle` modifier can apply it. This separation is useful
   * in case you need to replace `applyStyle` with a custom implementation.
   *
   * This modifier has `850` as `order` value to maintain backward compatibility
   * with previous versions of Popper.js. Expect the modifiers ordering method
   * to change in future major versions of the library.
   *
   * @memberof modifiers
   * @inner
   */
  computeStyle: {
    /** @prop {number} order=850 - Index used to define the order of execution */
    order: 850,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: computeStyle,
    /**
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3D transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties
     */
    gpuAcceleration: true,
    /**
     * @prop {string} [x='bottom']
     * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
     * Change this if your popper should grow in a direction different from `bottom`
     */
    x: 'bottom',
    /**
     * @prop {string} [x='left']
     * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
     * Change this if your popper should grow in a direction different from `right`
     */
    y: 'right'
  },

  /**
   * Applies the computed styles to the popper element.
   *
   * All the DOM manipulations are limited to this modifier. This is useful in case
   * you want to integrate Popper.js inside a framework or view library and you
   * want to delegate all the DOM manipulations to it.
   *
   * Note that if you disable this modifier, you must make sure the popper element
   * has its position set to `absolute` before Popper.js can do its work!
   *
   * Just disable this modifier and define your own to achieve the desired effect.
   *
   * @memberof modifiers
   * @inner
   */
  applyStyle: {
    /** @prop {number} order=900 - Index used to define the order of execution */
    order: 900,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: applyStyle,
    /** @prop {Function} */
    onLoad: applyStyleOnLoad,
    /**
     * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3D transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties
     */
    gpuAcceleration: undefined
  }
};

/**
 * The `dataObject` is an object containing all the information used by Popper.js.
 * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
 * @name dataObject
 * @property {Object} data.instance The Popper.js instance
 * @property {String} data.placement Placement applied to popper
 * @property {String} data.originalPlacement Placement originally defined on init
 * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
 * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
 * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
 * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.boundaries Offsets of the popper boundaries
 * @property {Object} data.offsets The measurements of popper, reference and arrow elements
 * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
 */

/**
 * Default options provided to Popper.js constructor.<br />
 * These can be overridden using the `options` argument of Popper.js.<br />
 * To override an option, simply pass an object with the same
 * structure of the `options` object, as the 3rd argument. For example:
 * ```
 * new Popper(ref, pop, {
 *   modifiers: {
 *     preventOverflow: { enabled: false }
 *   }
 * })
 * ```
 * @type {Object}
 * @static
 * @memberof Popper
 */
var Defaults = {
  /**
   * Popper's placement.
   * @prop {Popper.placements} placement='bottom'
   */
  placement: 'bottom',

  /**
   * Set this to true if you want popper to position it self in 'fixed' mode
   * @prop {Boolean} positionFixed=false
   */
  positionFixed: false,

  /**
   * Whether events (resize, scroll) are initially enabled.
   * @prop {Boolean} eventsEnabled=true
   */
  eventsEnabled: true,

  /**
   * Set to true if you want to automatically remove the popper when
   * you call the `destroy` method.
   * @prop {Boolean} removeOnDestroy=false
   */
  removeOnDestroy: false,

  /**
   * Callback called when the popper is created.<br />
   * By default, it is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onCreate}
   */
  onCreate: function onCreate() {},

  /**
   * Callback called when the popper is updated. This callback is not called
   * on the initialization/creation of the popper, but only on subsequent
   * updates.<br />
   * By default, it is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onUpdate}
   */
  onUpdate: function onUpdate() {},

  /**
   * List of modifiers used to modify the offsets before they are applied to the popper.
   * They provide most of the functionalities of Popper.js.
   * @prop {modifiers}
   */
  modifiers: modifiers
};

/**
 * @callback onCreate
 * @param {dataObject} data
 */

/**
 * @callback onUpdate
 * @param {dataObject} data
 */

// Utils
// Methods
var Popper = function () {
  /**
   * Creates a new Popper.js instance.
   * @class Popper
   * @param {Element|referenceObject} reference - The reference element used to position the popper
   * @param {Element} popper - The HTML / XML element used as the popper
   * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
   * @return {Object} instance - The generated Popper.js instance
   */
  function Popper(reference, popper) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    classCallCheck(this, Popper);

    this.scheduleUpdate = function () {
      return requestAnimationFrame(_this.update);
    };

    // make update() debounced, so that it only runs at most once-per-tick
    this.update = debounce(this.update.bind(this));

    // with {} we create a new object with the options inside it
    this.options = _extends({}, Popper.Defaults, options);

    // init state
    this.state = {
      isDestroyed: false,
      isCreated: false,
      scrollParents: []
    };

    // get reference and popper elements (allow jQuery wrappers)
    this.reference = reference && reference.jquery ? reference[0] : reference;
    this.popper = popper && popper.jquery ? popper[0] : popper;

    // Deep merge modifiers options
    this.options.modifiers = {};
    Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
      _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
    });

    // Refactoring modifiers' list (Object => Array)
    this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
      return _extends({
        name: name
      }, _this.options.modifiers[name]);
    })
    // sort the modifiers by order
    .sort(function (a, b) {
      return a.order - b.order;
    });

    // modifiers have the ability to execute arbitrary code when Popper.js get inited
    // such code is executed in the same order of its modifier
    // they could add new properties to their options configuration
    // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
    this.modifiers.forEach(function (modifierOptions) {
      if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
        modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
      }
    });

    // fire the first update to position the popper in the right place
    this.update();

    var eventsEnabled = this.options.eventsEnabled;
    if (eventsEnabled) {
      // setup event listeners, they will take care of update the position in specific situations
      this.enableEventListeners();
    }

    this.state.eventsEnabled = eventsEnabled;
  }

  // We can't use class properties because they don't get listed in the
  // class prototype and break stuff like Sinon stubs


  createClass(Popper, [{
    key: 'update',
    value: function update$$1() {
      return update.call(this);
    }
  }, {
    key: 'destroy',
    value: function destroy$$1() {
      return destroy.call(this);
    }
  }, {
    key: 'enableEventListeners',
    value: function enableEventListeners$$1() {
      return enableEventListeners.call(this);
    }
  }, {
    key: 'disableEventListeners',
    value: function disableEventListeners$$1() {
      return disableEventListeners.call(this);
    }

    /**
     * Schedules an update. It will run on the next UI update available.
     * @method scheduleUpdate
     * @memberof Popper
     */


    /**
     * Collection of utilities useful when writing custom modifiers.
     * Starting from version 1.7, this method is available only if you
     * include `popper-utils.js` before `popper.js`.
     *
     * **DEPRECATION**: This way to access PopperUtils is deprecated
     * and will be removed in v2! Use the PopperUtils module directly instead.
     * Due to the high instability of the methods contained in Utils, we can't
     * guarantee them to follow semver. Use them at your own risk!
     * @static
     * @private
     * @type {Object}
     * @deprecated since version 1.8
     * @member Utils
     * @memberof Popper
     */

  }]);
  return Popper;
}();

/**
 * The `referenceObject` is an object that provides an interface compatible with Popper.js
 * and lets you use it as replacement of a real DOM node.<br />
 * You can use this method to position a popper relatively to a set of coordinates
 * in case you don't have a DOM node to use as reference.
 *
 * ```
 * new Popper(referenceObject, popperNode);
 * ```
 *
 * NB: This feature isn't supported in Internet Explorer 10.
 * @name referenceObject
 * @property {Function} data.getBoundingClientRect
 * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
 * @property {number} data.clientWidth
 * An ES6 getter that will return the width of the virtual reference element.
 * @property {number} data.clientHeight
 * An ES6 getter that will return the height of the virtual reference element.
 */


Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
Popper.placements = placements;
Popper.Defaults = Defaults;

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var collectionUtils = createCommonjsModule(function (module) {

var utils = module.exports = {};

/**
 * Loops through the collection and calls the callback for each element. if the callback returns truthy, the loop is broken and returns the same value.
 * @public
 * @param {*} collection The collection to loop through. Needs to have a length property set and have indices set from 0 to length - 1.
 * @param {function} callback The callback to be called for each element. The element will be given as a parameter to the callback. If this callback returns truthy, the loop is broken and the same value is returned.
 * @returns {*} The value that a callback has returned (if truthy). Otherwise nothing.
 */
utils.forEach = function(collection, callback) {
    for(var i = 0; i < collection.length; i++) {
        var result = callback(collection[i]);
        if(result) {
            return result;
        }
    }
};
});

var elementUtils = function(options) {
    var getState = options.stateHandler.getState;

    /**
     * Tells if the element has been made detectable and ready to be listened for resize events.
     * @public
     * @param {element} The element to check.
     * @returns {boolean} True or false depending on if the element is detectable or not.
     */
    function isDetectable(element) {
        var state = getState(element);
        return state && !!state.isDetectable;
    }

    /**
     * Marks the element that it has been made detectable and ready to be listened for resize events.
     * @public
     * @param {element} The element to mark.
     */
    function markAsDetectable(element) {
        getState(element).isDetectable = true;
    }

    /**
     * Tells if the element is busy or not.
     * @public
     * @param {element} The element to check.
     * @returns {boolean} True or false depending on if the element is busy or not.
     */
    function isBusy(element) {
        return !!getState(element).busy;
    }

    /**
     * Marks the object is busy and should not be made detectable.
     * @public
     * @param {element} element The element to mark.
     * @param {boolean} busy If the element is busy or not.
     */
    function markBusy(element, busy) {
        getState(element).busy = !!busy;
    }

    return {
        isDetectable: isDetectable,
        markAsDetectable: markAsDetectable,
        isBusy: isBusy,
        markBusy: markBusy
    };
};

var listenerHandler = function(idHandler) {
    var eventListeners = {};

    /**
     * Gets all listeners for the given element.
     * @public
     * @param {element} element The element to get all listeners for.
     * @returns All listeners for the given element.
     */
    function getListeners(element) {
        var id = idHandler.get(element);

        if (id === undefined) {
            return [];
        }

        return eventListeners[id] || [];
    }

    /**
     * Stores the given listener for the given element. Will not actually add the listener to the element.
     * @public
     * @param {element} element The element that should have the listener added.
     * @param {function} listener The callback that the element has added.
     */
    function addListener(element, listener) {
        var id = idHandler.get(element);

        if(!eventListeners[id]) {
            eventListeners[id] = [];
        }

        eventListeners[id].push(listener);
    }

    function removeListener(element, listener) {
        var listeners = getListeners(element);
        for (var i = 0, len = listeners.length; i < len; ++i) {
            if (listeners[i] === listener) {
              listeners.splice(i, 1);
              break;
            }
        }
    }

    function removeAllListeners(element) {
      var listeners = getListeners(element);
      if (!listeners) { return; }
      listeners.length = 0;
    }

    return {
        get: getListeners,
        add: addListener,
        removeListener: removeListener,
        removeAllListeners: removeAllListeners
    };
};

var idGenerator = function() {
    var idCount = 1;

    /**
     * Generates a new unique id in the context.
     * @public
     * @returns {number} A unique id in the context.
     */
    function generate() {
        return idCount++;
    }

    return {
        generate: generate
    };
};

var idHandler = function(options) {
    var idGenerator     = options.idGenerator;
    var getState        = options.stateHandler.getState;

    /**
     * Gets the resize detector id of the element.
     * @public
     * @param {element} element The target element to get the id of.
     * @returns {string|number|null} The id of the element. Null if it has no id.
     */
    function getId(element) {
        var state = getState(element);

        if (state && state.id !== undefined) {
            return state.id;
        }

        return null;
    }

    /**
     * Sets the resize detector id of the element. Requires the element to have a resize detector state initialized.
     * @public
     * @param {element} element The target element to set the id of.
     * @returns {string|number|null} The id of the element.
     */
    function setId(element) {
        var state = getState(element);

        if (!state) {
            throw new Error("setId required the element to have a resize detection state.");
        }

        var id = idGenerator.generate();

        state.id = id;

        return id;
    }

    return {
        get: getId,
        set: setId
    };
};

/* global console: false */

/**
 * Reporter that handles the reporting of logs, warnings and errors.
 * @public
 * @param {boolean} quiet Tells if the reporter should be quiet or not.
 */
var reporter = function(quiet) {
    function noop() {
        //Does nothing.
    }

    var reporter = {
        log: noop,
        warn: noop,
        error: noop
    };

    if(!quiet && window.console) {
        var attachFunction = function(reporter, name) {
            //The proxy is needed to be able to call the method with the console context,
            //since we cannot use bind.
            reporter[name] = function reporterProxy() {
                var f = console[name];
                if (f.apply) { //IE9 does not support console.log.apply :)
                    f.apply(console, arguments);
                } else {
                    for (var i = 0; i < arguments.length; i++) {
                        f(arguments[i]);
                    }
                }
            };
        };

        attachFunction(reporter, "log");
        attachFunction(reporter, "warn");
        attachFunction(reporter, "error");
    }

    return reporter;
};

var browserDetector = createCommonjsModule(function (module) {

var detector = module.exports = {};

detector.isIE = function(version) {
    function isAnyIeVersion() {
        var agent = navigator.userAgent.toLowerCase();
        return agent.indexOf("msie") !== -1 || agent.indexOf("trident") !== -1 || agent.indexOf(" edge/") !== -1;
    }

    if(!isAnyIeVersion()) {
        return false;
    }

    if(!version) {
        return true;
    }

    //Shamelessly stolen from https://gist.github.com/padolsey/527683
    var ieVersion = (function(){
        var undef,
            v = 3,
            div = document.createElement("div"),
            all = div.getElementsByTagName("i");

        do {
            div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->";
        }
        while (all[0]);

        return v > 4 ? v : undef;
    }());

    return version === ieVersion;
};

detector.isLegacyOpera = function() {
    return !!window.opera;
};
});

var utils_1 = createCommonjsModule(function (module) {

var utils = module.exports = {};

utils.getOption = getOption;

function getOption(options, name, defaultValue) {
    var value = options[name];

    if((value === undefined || value === null) && defaultValue !== undefined) {
        return defaultValue;
    }

    return value;
}
});

var batchProcessor = function batchProcessorMaker(options) {
    options             = options || {};
    var reporter        = options.reporter;
    var asyncProcess    = utils_1.getOption(options, "async", true);
    var autoProcess     = utils_1.getOption(options, "auto", true);

    if(autoProcess && !asyncProcess) {
        reporter && reporter.warn("Invalid options combination. auto=true and async=false is invalid. Setting async=true.");
        asyncProcess = true;
    }

    var batch = Batch();
    var asyncFrameHandler;
    var isProcessing = false;

    function addFunction(level, fn) {
        if(!isProcessing && autoProcess && asyncProcess && batch.size() === 0) {
            // Since this is async, it is guaranteed to be executed after that the fn is added to the batch.
            // This needs to be done before, since we're checking the size of the batch to be 0.
            processBatchAsync();
        }

        batch.add(level, fn);
    }

    function processBatch() {
        // Save the current batch, and create a new batch so that incoming functions are not added into the currently processing batch.
        // Continue processing until the top-level batch is empty (functions may be added to the new batch while processing, and so on).
        isProcessing = true;
        while (batch.size()) {
            var processingBatch = batch;
            batch = Batch();
            processingBatch.process();
        }
        isProcessing = false;
    }

    function forceProcessBatch(localAsyncProcess) {
        if (isProcessing) {
            return;
        }

        if(localAsyncProcess === undefined) {
            localAsyncProcess = asyncProcess;
        }

        if(asyncFrameHandler) {
            cancelFrame(asyncFrameHandler);
            asyncFrameHandler = null;
        }

        if(localAsyncProcess) {
            processBatchAsync();
        } else {
            processBatch();
        }
    }

    function processBatchAsync() {
        asyncFrameHandler = requestFrame(processBatch);
    }

    function cancelFrame(listener) {
        // var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout;
        var cancel = clearTimeout;
        return cancel(listener);
    }

    function requestFrame(callback) {
        // var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(fn) { return window.setTimeout(fn, 20); };
        var raf = function(fn) { return setTimeout(fn, 0); };
        return raf(callback);
    }

    return {
        add: addFunction,
        force: forceProcessBatch
    };
};

function Batch() {
    var batch       = {};
    var size        = 0;
    var topLevel    = 0;
    var bottomLevel = 0;

    function add(level, fn) {
        if(!fn) {
            fn = level;
            level = 0;
        }

        if(level > topLevel) {
            topLevel = level;
        } else if(level < bottomLevel) {
            bottomLevel = level;
        }

        if(!batch[level]) {
            batch[level] = [];
        }

        batch[level].push(fn);
        size++;
    }

    function process() {
        for(var level = bottomLevel; level <= topLevel; level++) {
            var fns = batch[level];

            for(var i = 0; i < fns.length; i++) {
                var fn = fns[i];
                fn();
            }
        }
    }

    function getSize() {
        return size;
    }

    return {
        add: add,
        process: process,
        size: getSize
    };
}

var prop = "_erd";

function initState(element) {
    element[prop] = {};
    return getState(element);
}

function getState(element) {
    return element[prop];
}

function cleanState(element) {
    delete element[prop];
}

var stateHandler = {
    initState: initState,
    getState: getState,
    cleanState: cleanState
};

/**
 * Resize detection strategy that injects objects to elements in order to detect resize events.
 * Heavily inspired by: http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
 */



var object = function(options) {
    options             = options || {};
    var reporter        = options.reporter;
    var batchProcessor  = options.batchProcessor;
    var getState        = options.stateHandler.getState;

    if(!reporter) {
        throw new Error("Missing required dependency: reporter.");
    }

    /**
     * Adds a resize event listener to the element.
     * @public
     * @param {element} element The element that should have the listener added.
     * @param {function} listener The listener callback to be called for each resize event of the element. The element will be given as a parameter to the listener callback.
     */
    function addListener(element, listener) {
        function listenerProxy() {
            listener(element);
        }

        if(browserDetector.isIE(8)) {
            //IE 8 does not support object, but supports the resize event directly on elements.
            getState(element).object = {
                proxy: listenerProxy
            };
            element.attachEvent("onresize", listenerProxy);
        } else {
            var object = getObject(element);

            if(!object) {
                throw new Error("Element is not detectable by this strategy.");
            }

            object.contentDocument.defaultView.addEventListener("resize", listenerProxy);
        }
    }

    function buildCssTextString(rules) {
        var seperator = options.important ? " !important; " : "; ";

        return (rules.join(seperator) + seperator).trim();
    }

    /**
     * Makes an element detectable and ready to be listened for resize events. Will call the callback when the element is ready to be listened for resize changes.
     * @private
     * @param {object} options Optional options object.
     * @param {element} element The element to make detectable
     * @param {function} callback The callback to be called when the element is ready to be listened for resize changes. Will be called with the element as first parameter.
     */
    function makeDetectable(options, element, callback) {
        if (!callback) {
            callback = element;
            element = options;
            options = null;
        }

        options = options || {};
        options.debug;

        function injectObject(element, callback) {
            var OBJECT_STYLE = buildCssTextString(["display: block", "position: absolute", "top: 0", "left: 0", "width: 100%", "height: 100%", "border: none", "padding: 0", "margin: 0", "opacity: 0", "z-index: -1000", "pointer-events: none", "visibility: hidden"]);

            //The target element needs to be positioned (everything except static) so the absolute positioned object will be positioned relative to the target element.

            // Position altering may be performed directly or on object load, depending on if style resolution is possible directly or not.
            var positionCheckPerformed = false;

            // The element may not yet be attached to the DOM, and therefore the style object may be empty in some browsers.
            // Since the style object is a reference, it will be updated as soon as the element is attached to the DOM.
            var style = window.getComputedStyle(element);
            var width = element.offsetWidth;
            var height = element.offsetHeight;

            getState(element).startSize = {
                width: width,
                height: height
            };

            function mutateDom() {
                function alterPositionStyles() {
                    if(style.position === "static") {
                        element.style.setProperty("position", "relative", options.important ? "important" : "");

                        var removeRelativeStyles = function(reporter, element, style, property) {
                            function getNumericalValue(value) {
                                return value.replace(/[^-\d\.]/g, "");
                            }

                            var value = style[property];

                            if(value !== "auto" && getNumericalValue(value) !== "0") {
                                reporter.warn("An element that is positioned static has style." + property + "=" + value + " which is ignored due to the static positioning. The element will need to be positioned relative, so the style." + property + " will be set to 0. Element: ", element);
                                element.style.setProperty(property, "0", options.important ? "important" : "");
                            }
                        };

                        //Check so that there are no accidental styles that will make the element styled differently now that is is relative.
                        //If there are any, set them to 0 (this should be okay with the user since the style properties did nothing before [since the element was positioned static] anyway).
                        removeRelativeStyles(reporter, element, style, "top");
                        removeRelativeStyles(reporter, element, style, "right");
                        removeRelativeStyles(reporter, element, style, "bottom");
                        removeRelativeStyles(reporter, element, style, "left");
                    }
                }

                function onObjectLoad() {
                    // The object has been loaded, which means that the element now is guaranteed to be attached to the DOM.
                    if (!positionCheckPerformed) {
                        alterPositionStyles();
                    }

                    /*jshint validthis: true */

                    function getDocument(element, callback) {
                        //Opera 12 seem to call the object.onload before the actual document has been created.
                        //So if it is not present, poll it with an timeout until it is present.
                        //TODO: Could maybe be handled better with object.onreadystatechange or similar.
                        if(!element.contentDocument) {
                            var state = getState(element);
                            if (state.checkForObjectDocumentTimeoutId) {
                                window.clearTimeout(state.checkForObjectDocumentTimeoutId);
                            }
                            state.checkForObjectDocumentTimeoutId = setTimeout(function checkForObjectDocument() {
                                state.checkForObjectDocumentTimeoutId = 0;
                                getDocument(element, callback);
                            }, 100);

                            return;
                        }

                        callback(element.contentDocument);
                    }

                    //Mutating the object element here seems to fire another load event.
                    //Mutating the inner document of the object element is fine though.
                    var objectElement = this;

                    //Create the style element to be added to the object.
                    getDocument(objectElement, function onObjectDocumentReady(objectDocument) {
                        //Notify that the element is ready to be listened to.
                        callback(element);
                    });
                }

                // The element may be detached from the DOM, and some browsers does not support style resolving of detached elements.
                // The alterPositionStyles needs to be delayed until we know the element has been attached to the DOM (which we are sure of when the onObjectLoad has been fired), if style resolution is not possible.
                if (style.position !== "") {
                    alterPositionStyles();
                    positionCheckPerformed = true;
                }

                //Add an object element as a child to the target element that will be listened to for resize events.
                var object = document.createElement("object");
                object.style.cssText = OBJECT_STYLE;
                object.tabIndex = -1;
                object.type = "text/html";
                object.setAttribute("aria-hidden", "true");
                object.onload = onObjectLoad;

                //Safari: This must occur before adding the object to the DOM.
                //IE: Does not like that this happens before, even if it is also added after.
                if(!browserDetector.isIE()) {
                    object.data = "about:blank";
                }

                if (!getState(element)) {
                    // The element has been uninstalled before the actual loading happened.
                    return;
                }

                element.appendChild(object);
                getState(element).object = object;

                //IE: This must occur after adding the object to the DOM.
                if(browserDetector.isIE()) {
                    object.data = "about:blank";
                }
            }

            if(batchProcessor) {
                batchProcessor.add(mutateDom);
            } else {
                mutateDom();
            }
        }

        if(browserDetector.isIE(8)) {
            //IE 8 does not support objects properly. Luckily they do support the resize event.
            //So do not inject the object and notify that the element is already ready to be listened to.
            //The event handler for the resize event is attached in the utils.addListener instead.
            callback(element);
        } else {
            injectObject(element, callback);
        }
    }

    /**
     * Returns the child object of the target element.
     * @private
     * @param {element} element The target element.
     * @returns The object element of the target.
     */
    function getObject(element) {
        return getState(element).object;
    }

    function uninstall(element) {
        if (!getState(element)) {
            return;
        }

        var object = getObject(element);

        if (!object) {
            return;
        }

        if (browserDetector.isIE(8)) {
            element.detachEvent("onresize", object.proxy);
        } else {
            element.removeChild(object);
        }

        if (getState(element).checkForObjectDocumentTimeoutId) {
            window.clearTimeout(getState(element).checkForObjectDocumentTimeoutId);
        }

        delete getState(element).object;
    }

    return {
        makeDetectable: makeDetectable,
        addListener: addListener,
        uninstall: uninstall
    };
};

/**
 * Resize detection strategy that injects divs to elements in order to detect resize events on scroll events.
 * Heavily inspired by: https://github.com/marcj/css-element-queries/blob/master/src/ResizeSensor.js
 */

var forEach$1 = collectionUtils.forEach;

var scroll = function(options) {
    options             = options || {};
    var reporter        = options.reporter;
    var batchProcessor  = options.batchProcessor;
    var getState        = options.stateHandler.getState;
    options.stateHandler.hasState;
    var idHandler       = options.idHandler;

    if (!batchProcessor) {
        throw new Error("Missing required dependency: batchProcessor");
    }

    if (!reporter) {
        throw new Error("Missing required dependency: reporter.");
    }

    //TODO: Could this perhaps be done at installation time?
    var scrollbarSizes = getScrollbarSizes();

    var styleId = "erd_scroll_detection_scrollbar_style";
    var detectionContainerClass = "erd_scroll_detection_container";

    function initDocument(targetDocument) {
        // Inject the scrollbar styling that prevents them from appearing sometimes in Chrome.
        // The injected container needs to have a class, so that it may be styled with CSS (pseudo elements).
        injectScrollStyle(targetDocument, styleId, detectionContainerClass);
    }

    initDocument(window.document);

    function buildCssTextString(rules) {
        var seperator = options.important ? " !important; " : "; ";

        return (rules.join(seperator) + seperator).trim();
    }

    function getScrollbarSizes() {
        var width = 500;
        var height = 500;

        var child = document.createElement("div");
        child.style.cssText = buildCssTextString(["position: absolute", "width: " + width*2 + "px", "height: " + height*2 + "px", "visibility: hidden", "margin: 0", "padding: 0"]);

        var container = document.createElement("div");
        container.style.cssText = buildCssTextString(["position: absolute", "width: " + width + "px", "height: " + height + "px", "overflow: scroll", "visibility: none", "top: " + -width*3 + "px", "left: " + -height*3 + "px", "visibility: hidden", "margin: 0", "padding: 0"]);

        container.appendChild(child);

        document.body.insertBefore(container, document.body.firstChild);

        var widthSize = width - container.clientWidth;
        var heightSize = height - container.clientHeight;

        document.body.removeChild(container);

        return {
            width: widthSize,
            height: heightSize
        };
    }

    function injectScrollStyle(targetDocument, styleId, containerClass) {
        function injectStyle(style, method) {
            method = method || function (element) {
                targetDocument.head.appendChild(element);
            };

            var styleElement = targetDocument.createElement("style");
            styleElement.innerHTML = style;
            styleElement.id = styleId;
            method(styleElement);
            return styleElement;
        }

        if (!targetDocument.getElementById(styleId)) {
            var containerAnimationClass = containerClass + "_animation";
            var containerAnimationActiveClass = containerClass + "_animation_active";
            var style = "/* Created by the element-resize-detector library. */\n";
            style += "." + containerClass + " > div::-webkit-scrollbar { " + buildCssTextString(["display: none"]) + " }\n\n";
            style += "." + containerAnimationActiveClass + " { " + buildCssTextString(["-webkit-animation-duration: 0.1s", "animation-duration: 0.1s", "-webkit-animation-name: " + containerAnimationClass, "animation-name: " + containerAnimationClass]) + " }\n";
            style += "@-webkit-keyframes " + containerAnimationClass +  " { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }\n";
            style += "@keyframes " + containerAnimationClass +          " { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }";
            injectStyle(style);
        }
    }

    function addAnimationClass(element) {
        element.className += " " + detectionContainerClass + "_animation_active";
    }

    function addEvent(el, name, cb) {
        if (el.addEventListener) {
            el.addEventListener(name, cb);
        } else if(el.attachEvent) {
            el.attachEvent("on" + name, cb);
        } else {
            return reporter.error("[scroll] Don't know how to add event listeners.");
        }
    }

    function removeEvent(el, name, cb) {
        if (el.removeEventListener) {
            el.removeEventListener(name, cb);
        } else if(el.detachEvent) {
            el.detachEvent("on" + name, cb);
        } else {
            return reporter.error("[scroll] Don't know how to remove event listeners.");
        }
    }

    function getExpandElement(element) {
        return getState(element).container.childNodes[0].childNodes[0].childNodes[0];
    }

    function getShrinkElement(element) {
        return getState(element).container.childNodes[0].childNodes[0].childNodes[1];
    }

    /**
     * Adds a resize event listener to the element.
     * @public
     * @param {element} element The element that should have the listener added.
     * @param {function} listener The listener callback to be called for each resize event of the element. The element will be given as a parameter to the listener callback.
     */
    function addListener(element, listener) {
        var listeners = getState(element).listeners;

        if (!listeners.push) {
            throw new Error("Cannot add listener to an element that is not detectable.");
        }

        getState(element).listeners.push(listener);
    }

    /**
     * Makes an element detectable and ready to be listened for resize events. Will call the callback when the element is ready to be listened for resize changes.
     * @private
     * @param {object} options Optional options object.
     * @param {element} element The element to make detectable
     * @param {function} callback The callback to be called when the element is ready to be listened for resize changes. Will be called with the element as first parameter.
     */
    function makeDetectable(options, element, callback) {
        if (!callback) {
            callback = element;
            element = options;
            options = null;
        }

        options = options || {};

        function debug() {
            if (options.debug) {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(idHandler.get(element), "Scroll: ");
                if (reporter.log.apply) {
                    reporter.log.apply(null, args);
                } else {
                    for (var i = 0; i < args.length; i++) {
                        reporter.log(args[i]);
                    }
                }
            }
        }

        function isDetached(element) {
            function isInDocument(element) {
                var isInShadowRoot = element.getRootNode && element.getRootNode().contains(element);
                return element === element.ownerDocument.body || element.ownerDocument.body.contains(element) || isInShadowRoot;
            }

            if (!isInDocument(element)) {
                return true;
            }

            // FireFox returns null style in hidden iframes. See https://github.com/wnr/element-resize-detector/issues/68 and https://bugzilla.mozilla.org/show_bug.cgi?id=795520
            if (window.getComputedStyle(element) === null) {
                return true;
            }

            return false;
        }

        function isUnrendered(element) {
            // Check the absolute positioned container since the top level container is display: inline.
            var container = getState(element).container.childNodes[0];
            var style = window.getComputedStyle(container);
            return !style.width || style.width.indexOf("px") === -1; //Can only compute pixel value when rendered.
        }

        function getStyle() {
            // Some browsers only force layouts when actually reading the style properties of the style object, so make sure that they are all read here,
            // so that the user of the function can be sure that it will perform the layout here, instead of later (important for batching).
            var elementStyle            = window.getComputedStyle(element);
            var style                   = {};
            style.position              = elementStyle.position;
            style.width                 = element.offsetWidth;
            style.height                = element.offsetHeight;
            style.top                   = elementStyle.top;
            style.right                 = elementStyle.right;
            style.bottom                = elementStyle.bottom;
            style.left                  = elementStyle.left;
            style.widthCSS              = elementStyle.width;
            style.heightCSS             = elementStyle.height;
            return style;
        }

        function storeStartSize() {
            var style = getStyle();
            getState(element).startSize = {
                width: style.width,
                height: style.height
            };
            debug("Element start size", getState(element).startSize);
        }

        function initListeners() {
            getState(element).listeners = [];
        }

        function storeStyle() {
            debug("storeStyle invoked.");
            if (!getState(element)) {
                debug("Aborting because element has been uninstalled");
                return;
            }

            var style = getStyle();
            getState(element).style = style;
        }

        function storeCurrentSize(element, width, height) {
            getState(element).lastWidth = width;
            getState(element).lastHeight  = height;
        }

        function getExpandChildElement(element) {
            return getExpandElement(element).childNodes[0];
        }

        function getWidthOffset() {
            return 2 * scrollbarSizes.width + 1;
        }

        function getHeightOffset() {
            return 2 * scrollbarSizes.height + 1;
        }

        function getExpandWidth(width) {
            return width + 10 + getWidthOffset();
        }

        function getExpandHeight(height) {
            return height + 10 + getHeightOffset();
        }

        function getShrinkWidth(width) {
            return width * 2 + getWidthOffset();
        }

        function getShrinkHeight(height) {
            return height * 2 + getHeightOffset();
        }

        function positionScrollbars(element, width, height) {
            var expand          = getExpandElement(element);
            var shrink          = getShrinkElement(element);
            var expandWidth     = getExpandWidth(width);
            var expandHeight    = getExpandHeight(height);
            var shrinkWidth     = getShrinkWidth(width);
            var shrinkHeight    = getShrinkHeight(height);
            expand.scrollLeft   = expandWidth;
            expand.scrollTop    = expandHeight;
            shrink.scrollLeft   = shrinkWidth;
            shrink.scrollTop    = shrinkHeight;
        }

        function injectContainerElement() {
            var container = getState(element).container;

            if (!container) {
                container                   = document.createElement("div");
                container.className         = detectionContainerClass;
                container.style.cssText     = buildCssTextString(["visibility: hidden", "display: inline", "width: 0px", "height: 0px", "z-index: -1", "overflow: hidden", "margin: 0", "padding: 0"]);
                getState(element).container = container;
                addAnimationClass(container);
                element.appendChild(container);

                var onAnimationStart = function () {
                    getState(element).onRendered && getState(element).onRendered();
                };

                addEvent(container, "animationstart", onAnimationStart);

                // Store the event handler here so that they may be removed when uninstall is called.
                // See uninstall function for an explanation why it is needed.
                getState(element).onAnimationStart = onAnimationStart;
            }

            return container;
        }

        function injectScrollElements() {
            function alterPositionStyles() {
                var style = getState(element).style;

                if(style.position === "static") {
                    element.style.setProperty("position", "relative",options.important ? "important" : "");

                    var removeRelativeStyles = function(reporter, element, style, property) {
                        function getNumericalValue(value) {
                            return value.replace(/[^-\d\.]/g, "");
                        }

                        var value = style[property];

                        if(value !== "auto" && getNumericalValue(value) !== "0") {
                            reporter.warn("An element that is positioned static has style." + property + "=" + value + " which is ignored due to the static positioning. The element will need to be positioned relative, so the style." + property + " will be set to 0. Element: ", element);
                            element.style[property] = 0;
                        }
                    };

                    //Check so that there are no accidental styles that will make the element styled differently now that is is relative.
                    //If there are any, set them to 0 (this should be okay with the user since the style properties did nothing before [since the element was positioned static] anyway).
                    removeRelativeStyles(reporter, element, style, "top");
                    removeRelativeStyles(reporter, element, style, "right");
                    removeRelativeStyles(reporter, element, style, "bottom");
                    removeRelativeStyles(reporter, element, style, "left");
                }
            }

            function getLeftTopBottomRightCssText(left, top, bottom, right) {
                left = (!left ? "0" : (left + "px"));
                top = (!top ? "0" : (top + "px"));
                bottom = (!bottom ? "0" : (bottom + "px"));
                right = (!right ? "0" : (right + "px"));

                return ["left: " + left, "top: " + top, "right: " + right, "bottom: " + bottom];
            }

            debug("Injecting elements");

            if (!getState(element)) {
                debug("Aborting because element has been uninstalled");
                return;
            }

            alterPositionStyles();

            var rootContainer = getState(element).container;

            if (!rootContainer) {
                rootContainer = injectContainerElement();
            }

            // Due to this WebKit bug https://bugs.webkit.org/show_bug.cgi?id=80808 (currently fixed in Blink, but still present in WebKit browsers such as Safari),
            // we need to inject two containers, one that is width/height 100% and another that is left/top -1px so that the final container always is 1x1 pixels bigger than
            // the targeted element.
            // When the bug is resolved, "containerContainer" may be removed.

            // The outer container can occasionally be less wide than the targeted when inside inline elements element in WebKit (see https://bugs.webkit.org/show_bug.cgi?id=152980).
            // This should be no problem since the inner container either way makes sure the injected scroll elements are at least 1x1 px.

            var scrollbarWidth          = scrollbarSizes.width;
            var scrollbarHeight         = scrollbarSizes.height;
            var containerContainerStyle = buildCssTextString(["position: absolute", "flex: none", "overflow: hidden", "z-index: -1", "visibility: hidden", "width: 100%", "height: 100%", "left: 0px", "top: 0px"]);
            var containerStyle          = buildCssTextString(["position: absolute", "flex: none", "overflow: hidden", "z-index: -1", "visibility: hidden"].concat(getLeftTopBottomRightCssText(-(1 + scrollbarWidth), -(1 + scrollbarHeight), -scrollbarHeight, -scrollbarWidth)));
            var expandStyle             = buildCssTextString(["position: absolute", "flex: none", "overflow: scroll", "z-index: -1", "visibility: hidden", "width: 100%", "height: 100%"]);
            var shrinkStyle             = buildCssTextString(["position: absolute", "flex: none", "overflow: scroll", "z-index: -1", "visibility: hidden", "width: 100%", "height: 100%"]);
            var expandChildStyle        = buildCssTextString(["position: absolute", "left: 0", "top: 0"]);
            var shrinkChildStyle        = buildCssTextString(["position: absolute", "width: 200%", "height: 200%"]);

            var containerContainer      = document.createElement("div");
            var container               = document.createElement("div");
            var expand                  = document.createElement("div");
            var expandChild             = document.createElement("div");
            var shrink                  = document.createElement("div");
            var shrinkChild             = document.createElement("div");

            // Some browsers choke on the resize system being rtl, so force it to ltr. https://github.com/wnr/element-resize-detector/issues/56
            // However, dir should not be set on the top level container as it alters the dimensions of the target element in some browsers.
            containerContainer.dir              = "ltr";

            containerContainer.style.cssText    = containerContainerStyle;
            containerContainer.className        = detectionContainerClass;
            container.className                 = detectionContainerClass;
            container.style.cssText             = containerStyle;
            expand.style.cssText                = expandStyle;
            expandChild.style.cssText           = expandChildStyle;
            shrink.style.cssText                = shrinkStyle;
            shrinkChild.style.cssText           = shrinkChildStyle;

            expand.appendChild(expandChild);
            shrink.appendChild(shrinkChild);
            container.appendChild(expand);
            container.appendChild(shrink);
            containerContainer.appendChild(container);
            rootContainer.appendChild(containerContainer);

            function onExpandScroll() {
                getState(element).onExpand && getState(element).onExpand();
            }

            function onShrinkScroll() {
                getState(element).onShrink && getState(element).onShrink();
            }

            addEvent(expand, "scroll", onExpandScroll);
            addEvent(shrink, "scroll", onShrinkScroll);

            // Store the event handlers here so that they may be removed when uninstall is called.
            // See uninstall function for an explanation why it is needed.
            getState(element).onExpandScroll = onExpandScroll;
            getState(element).onShrinkScroll = onShrinkScroll;
        }

        function registerListenersAndPositionElements() {
            function updateChildSizes(element, width, height) {
                var expandChild             = getExpandChildElement(element);
                var expandWidth             = getExpandWidth(width);
                var expandHeight            = getExpandHeight(height);
                expandChild.style.setProperty("width", expandWidth + "px", options.important ? "important" : "");
                expandChild.style.setProperty("height", expandHeight + "px", options.important ? "important" : "");
            }

            function updateDetectorElements(done) {
                var width           = element.offsetWidth;
                var height          = element.offsetHeight;

                // Check whether the size has actually changed since last time the algorithm ran. If not, some steps may be skipped.
                var sizeChanged = width !== getState(element).lastWidth || height !== getState(element).lastHeight;

                debug("Storing current size", width, height);

                // Store the size of the element sync here, so that multiple scroll events may be ignored in the event listeners.
                // Otherwise the if-check in handleScroll is useless.
                storeCurrentSize(element, width, height);

                // Since we delay the processing of the batch, there is a risk that uninstall has been called before the batch gets to execute.
                // Since there is no way to cancel the fn executions, we need to add an uninstall guard to all fns of the batch.

                batchProcessor.add(0, function performUpdateChildSizes() {
                    if (!sizeChanged) {
                        return;
                    }

                    if (!getState(element)) {
                        debug("Aborting because element has been uninstalled");
                        return;
                    }

                    if (!areElementsInjected()) {
                        debug("Aborting because element container has not been initialized");
                        return;
                    }

                    if (options.debug) {
                        var w = element.offsetWidth;
                        var h = element.offsetHeight;

                        if (w !== width || h !== height) {
                            reporter.warn(idHandler.get(element), "Scroll: Size changed before updating detector elements.");
                        }
                    }

                    updateChildSizes(element, width, height);
                });

                batchProcessor.add(1, function updateScrollbars() {
                    // This function needs to be invoked event though the size is unchanged. The element could have been resized very quickly and then
                    // been restored to the original size, which will have changed the scrollbar positions.

                    if (!getState(element)) {
                        debug("Aborting because element has been uninstalled");
                        return;
                    }

                    if (!areElementsInjected()) {
                        debug("Aborting because element container has not been initialized");
                        return;
                    }

                    positionScrollbars(element, width, height);
                });

                if (sizeChanged && done) {
                    batchProcessor.add(2, function () {
                        if (!getState(element)) {
                            debug("Aborting because element has been uninstalled");
                            return;
                        }

                        if (!areElementsInjected()) {
                          debug("Aborting because element container has not been initialized");
                          return;
                        }

                        done();
                    });
                }
            }

            function areElementsInjected() {
                return !!getState(element).container;
            }

            function notifyListenersIfNeeded() {
                function isFirstNotify() {
                    return getState(element).lastNotifiedWidth === undefined;
                }

                debug("notifyListenersIfNeeded invoked");

                var state = getState(element);

                // Don't notify if the current size is the start size, and this is the first notification.
                if (isFirstNotify() && state.lastWidth === state.startSize.width && state.lastHeight === state.startSize.height) {
                    return debug("Not notifying: Size is the same as the start size, and there has been no notification yet.");
                }

                // Don't notify if the size already has been notified.
                if (state.lastWidth === state.lastNotifiedWidth && state.lastHeight === state.lastNotifiedHeight) {
                    return debug("Not notifying: Size already notified");
                }


                debug("Current size not notified, notifying...");
                state.lastNotifiedWidth = state.lastWidth;
                state.lastNotifiedHeight = state.lastHeight;
                forEach$1(getState(element).listeners, function (listener) {
                    listener(element);
                });
            }

            function handleRender() {
                debug("startanimation triggered.");

                if (isUnrendered(element)) {
                    debug("Ignoring since element is still unrendered...");
                    return;
                }

                debug("Element rendered.");
                var expand = getExpandElement(element);
                var shrink = getShrinkElement(element);
                if (expand.scrollLeft === 0 || expand.scrollTop === 0 || shrink.scrollLeft === 0 || shrink.scrollTop === 0) {
                    debug("Scrollbars out of sync. Updating detector elements...");
                    updateDetectorElements(notifyListenersIfNeeded);
                }
            }

            function handleScroll() {
                debug("Scroll detected.");

                if (isUnrendered(element)) {
                    // Element is still unrendered. Skip this scroll event.
                    debug("Scroll event fired while unrendered. Ignoring...");
                    return;
                }

                updateDetectorElements(notifyListenersIfNeeded);
            }

            debug("registerListenersAndPositionElements invoked.");

            if (!getState(element)) {
                debug("Aborting because element has been uninstalled");
                return;
            }

            getState(element).onRendered = handleRender;
            getState(element).onExpand = handleScroll;
            getState(element).onShrink = handleScroll;

            var style = getState(element).style;
            updateChildSizes(element, style.width, style.height);
        }

        function finalizeDomMutation() {
            debug("finalizeDomMutation invoked.");

            if (!getState(element)) {
                debug("Aborting because element has been uninstalled");
                return;
            }

            var style = getState(element).style;
            storeCurrentSize(element, style.width, style.height);
            positionScrollbars(element, style.width, style.height);
        }

        function ready() {
            callback(element);
        }

        function install() {
            debug("Installing...");
            initListeners();
            storeStartSize();

            batchProcessor.add(0, storeStyle);
            batchProcessor.add(1, injectScrollElements);
            batchProcessor.add(2, registerListenersAndPositionElements);
            batchProcessor.add(3, finalizeDomMutation);
            batchProcessor.add(4, ready);
        }

        debug("Making detectable...");

        if (isDetached(element)) {
            debug("Element is detached");

            injectContainerElement();

            debug("Waiting until element is attached...");

            getState(element).onRendered = function () {
                debug("Element is now attached");
                install();
            };
        } else {
            install();
        }
    }

    function uninstall(element) {
        var state = getState(element);

        if (!state) {
            // Uninstall has been called on a non-erd element.
            return;
        }

        // Uninstall may have been called in the following scenarios:
        // (1) Right between the sync code and async batch (here state.busy = true, but nothing have been registered or injected).
        // (2) In the ready callback of the last level of the batch by another element (here, state.busy = true, but all the stuff has been injected).
        // (3) After the installation process (here, state.busy = false and all the stuff has been injected).
        // So to be on the safe side, let's check for each thing before removing.

        // We need to remove the event listeners, because otherwise the event might fire on an uninstall element which results in an error when trying to get the state of the element.
        state.onExpandScroll && removeEvent(getExpandElement(element), "scroll", state.onExpandScroll);
        state.onShrinkScroll && removeEvent(getShrinkElement(element), "scroll", state.onShrinkScroll);
        state.onAnimationStart && removeEvent(state.container, "animationstart", state.onAnimationStart);

        state.container && element.removeChild(state.container);
    }

    return {
        makeDetectable: makeDetectable,
        addListener: addListener,
        uninstall: uninstall,
        initDocument: initDocument
    };
};

var forEach                 = collectionUtils.forEach;









//Detection strategies.



function isCollection(obj) {
    return Array.isArray(obj) || obj.length !== undefined;
}

function toArray(collection) {
    if (!Array.isArray(collection)) {
        var array = [];
        forEach(collection, function (obj) {
            array.push(obj);
        });
        return array;
    } else {
        return collection;
    }
}

function isElement(obj) {
    return obj && obj.nodeType === 1;
}

/**
 * @typedef idHandler
 * @type {object}
 * @property {function} get Gets the resize detector id of the element.
 * @property {function} set Generate and sets the resize detector id of the element.
 */

/**
 * @typedef Options
 * @type {object}
 * @property {boolean} callOnAdd    Determines if listeners should be called when they are getting added.
                                    Default is true. If true, the listener is guaranteed to be called when it has been added.
                                    If false, the listener will not be guarenteed to be called when it has been added (does not prevent it from being called).
 * @property {idHandler} idHandler  A custom id handler that is responsible for generating, setting and retrieving id's for elements.
                                    If not provided, a default id handler will be used.
 * @property {reporter} reporter    A custom reporter that handles reporting logs, warnings and errors.
                                    If not provided, a default id handler will be used.
                                    If set to false, then nothing will be reported.
 * @property {boolean} debug        If set to true, the the system will report debug messages as default for the listenTo method.
 */

/**
 * Creates an element resize detector instance.
 * @public
 * @param {Options?} options Optional global options object that will decide how this instance will work.
 */
var elementResizeDetector = function(options) {
    options = options || {};

    //idHandler is currently not an option to the listenTo function, so it should not be added to globalOptions.
    var idHandler$1;

    if (options.idHandler) {
        // To maintain compatability with idHandler.get(element, readonly), make sure to wrap the given idHandler
        // so that readonly flag always is true when it's used here. This may be removed next major version bump.
        idHandler$1 = {
            get: function (element) { return options.idHandler.get(element, true); },
            set: options.idHandler.set
        };
    } else {
        var idGenerator$1 = idGenerator();
        var defaultIdHandler = idHandler({
            idGenerator: idGenerator$1,
            stateHandler: stateHandler
        });
        idHandler$1 = defaultIdHandler;
    }

    //reporter is currently not an option to the listenTo function, so it should not be added to globalOptions.
    var reporter$1 = options.reporter;

    if(!reporter$1) {
        //If options.reporter is false, then the reporter should be quiet.
        var quiet = reporter$1 === false;
        reporter$1 = reporter(quiet);
    }

    //batchProcessor is currently not an option to the listenTo function, so it should not be added to globalOptions.
    var batchProcessor$1 = getOption(options, "batchProcessor", batchProcessor({ reporter: reporter$1 }));

    //Options to be used as default for the listenTo function.
    var globalOptions = {};
    globalOptions.callOnAdd     = !!getOption(options, "callOnAdd", true);
    globalOptions.debug         = !!getOption(options, "debug", false);

    var eventListenerHandler    = listenerHandler(idHandler$1);
    var elementUtils$1            = elementUtils({
        stateHandler: stateHandler
    });

    //The detection strategy to be used.
    var detectionStrategy;
    var desiredStrategy = getOption(options, "strategy", "object");
    var importantCssRules = getOption(options, "important", false);
    var strategyOptions = {
        reporter: reporter$1,
        batchProcessor: batchProcessor$1,
        stateHandler: stateHandler,
        idHandler: idHandler$1,
        important: importantCssRules
    };

    if(desiredStrategy === "scroll") {
        if (browserDetector.isLegacyOpera()) {
            reporter$1.warn("Scroll strategy is not supported on legacy Opera. Changing to object strategy.");
            desiredStrategy = "object";
        } else if (browserDetector.isIE(9)) {
            reporter$1.warn("Scroll strategy is not supported on IE9. Changing to object strategy.");
            desiredStrategy = "object";
        }
    }

    if(desiredStrategy === "scroll") {
        detectionStrategy = scroll(strategyOptions);
    } else if(desiredStrategy === "object") {
        detectionStrategy = object(strategyOptions);
    } else {
        throw new Error("Invalid strategy name: " + desiredStrategy);
    }

    //Calls can be made to listenTo with elements that are still being installed.
    //Also, same elements can occur in the elements list in the listenTo function.
    //With this map, the ready callbacks can be synchronized between the calls
    //so that the ready callback can always be called when an element is ready - even if
    //it wasn't installed from the function itself.
    var onReadyCallbacks = {};

    /**
     * Makes the given elements resize-detectable and starts listening to resize events on the elements. Calls the event callback for each event for each element.
     * @public
     * @param {Options?} options Optional options object. These options will override the global options. Some options may not be overriden, such as idHandler.
     * @param {element[]|element} elements The given array of elements to detect resize events of. Single element is also valid.
     * @param {function} listener The callback to be executed for each resize event for each element.
     */
    function listenTo(options, elements, listener) {
        function onResizeCallback(element) {
            var listeners = eventListenerHandler.get(element);
            forEach(listeners, function callListenerProxy(listener) {
                listener(element);
            });
        }

        function addListener(callOnAdd, element, listener) {
            eventListenerHandler.add(element, listener);

            if(callOnAdd) {
                listener(element);
            }
        }

        //Options object may be omitted.
        if(!listener) {
            listener = elements;
            elements = options;
            options = {};
        }

        if(!elements) {
            throw new Error("At least one element required.");
        }

        if(!listener) {
            throw new Error("Listener required.");
        }

        if (isElement(elements)) {
            // A single element has been passed in.
            elements = [elements];
        } else if (isCollection(elements)) {
            // Convert collection to array for plugins.
            // TODO: May want to check so that all the elements in the collection are valid elements.
            elements = toArray(elements);
        } else {
            return reporter$1.error("Invalid arguments. Must be a DOM element or a collection of DOM elements.");
        }

        var elementsReady = 0;

        var callOnAdd = getOption(options, "callOnAdd", globalOptions.callOnAdd);
        var onReadyCallback = getOption(options, "onReady", function noop() {});
        var debug = getOption(options, "debug", globalOptions.debug);

        forEach(elements, function attachListenerToElement(element) {
            if (!stateHandler.getState(element)) {
                stateHandler.initState(element);
                idHandler$1.set(element);
            }

            var id = idHandler$1.get(element);

            debug && reporter$1.log("Attaching listener to element", id, element);

            if(!elementUtils$1.isDetectable(element)) {
                debug && reporter$1.log(id, "Not detectable.");
                if(elementUtils$1.isBusy(element)) {
                    debug && reporter$1.log(id, "System busy making it detectable");

                    //The element is being prepared to be detectable. Do not make it detectable.
                    //Just add the listener, because the element will soon be detectable.
                    addListener(callOnAdd, element, listener);
                    onReadyCallbacks[id] = onReadyCallbacks[id] || [];
                    onReadyCallbacks[id].push(function onReady() {
                        elementsReady++;

                        if(elementsReady === elements.length) {
                            onReadyCallback();
                        }
                    });
                    return;
                }

                debug && reporter$1.log(id, "Making detectable...");
                //The element is not prepared to be detectable, so do prepare it and add a listener to it.
                elementUtils$1.markBusy(element, true);
                return detectionStrategy.makeDetectable({ debug: debug, important: importantCssRules }, element, function onElementDetectable(element) {
                    debug && reporter$1.log(id, "onElementDetectable");

                    if (stateHandler.getState(element)) {
                        elementUtils$1.markAsDetectable(element);
                        elementUtils$1.markBusy(element, false);
                        detectionStrategy.addListener(element, onResizeCallback);
                        addListener(callOnAdd, element, listener);

                        // Since the element size might have changed since the call to "listenTo", we need to check for this change,
                        // so that a resize event may be emitted.
                        // Having the startSize object is optional (since it does not make sense in some cases such as unrendered elements), so check for its existance before.
                        // Also, check the state existance before since the element may have been uninstalled in the installation process.
                        var state = stateHandler.getState(element);
                        if (state && state.startSize) {
                            var width = element.offsetWidth;
                            var height = element.offsetHeight;
                            if (state.startSize.width !== width || state.startSize.height !== height) {
                                onResizeCallback(element);
                            }
                        }

                        if(onReadyCallbacks[id]) {
                            forEach(onReadyCallbacks[id], function(callback) {
                                callback();
                            });
                        }
                    } else {
                        // The element has been unisntalled before being detectable.
                        debug && reporter$1.log(id, "Element uninstalled before being detectable.");
                    }

                    delete onReadyCallbacks[id];

                    elementsReady++;
                    if(elementsReady === elements.length) {
                        onReadyCallback();
                    }
                });
            }

            debug && reporter$1.log(id, "Already detecable, adding listener.");

            //The element has been prepared to be detectable and is ready to be listened to.
            addListener(callOnAdd, element, listener);
            elementsReady++;
        });

        if(elementsReady === elements.length) {
            onReadyCallback();
        }
    }

    function uninstall(elements) {
        if(!elements) {
            return reporter$1.error("At least one element is required.");
        }

        if (isElement(elements)) {
            // A single element has been passed in.
            elements = [elements];
        } else if (isCollection(elements)) {
            // Convert collection to array for plugins.
            // TODO: May want to check so that all the elements in the collection are valid elements.
            elements = toArray(elements);
        } else {
            return reporter$1.error("Invalid arguments. Must be a DOM element or a collection of DOM elements.");
        }

        forEach(elements, function (element) {
            eventListenerHandler.removeAllListeners(element);
            detectionStrategy.uninstall(element);
            stateHandler.cleanState(element);
        });
    }

    function initDocument(targetDocument) {
        detectionStrategy.initDocument && detectionStrategy.initDocument(targetDocument);
    }

    return {
        listenTo: listenTo,
        removeListener: eventListenerHandler.removeListener,
        removeAllListeners: eventListenerHandler.removeAllListeners,
        uninstall: uninstall,
        initDocument: initDocument
    };
};

function getOption(options, name, defaultValue) {
    var value = options[name];

    if((value === undefined || value === null) && defaultValue !== undefined) {
        return defaultValue;
    }

    return value;
}

/*! @license DOMPurify | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.2.2/LICENSE */

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var hasOwnProperty = Object.hasOwnProperty,
    setPrototypeOf = Object.setPrototypeOf,
    isFrozen = Object.isFrozen,
    getPrototypeOf = Object.getPrototypeOf,
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var freeze = Object.freeze,
    seal = Object.seal,
    create = Object.create; // eslint-disable-line import/no-mutable-exports

var _ref = typeof Reflect !== 'undefined' && Reflect,
    apply = _ref.apply,
    construct = _ref.construct;

if (!apply) {
  apply = function apply(fun, thisValue, args) {
    return fun.apply(thisValue, args);
  };
}

if (!freeze) {
  freeze = function freeze(x) {
    return x;
  };
}

if (!seal) {
  seal = function seal(x) {
    return x;
  };
}

if (!construct) {
  construct = function construct(Func, args) {
    return new (Function.prototype.bind.apply(Func, [null].concat(_toConsumableArray(args))))();
  };
}

var arrayForEach = unapply(Array.prototype.forEach);
var arrayPop = unapply(Array.prototype.pop);
var arrayPush = unapply(Array.prototype.push);

var stringToLowerCase = unapply(String.prototype.toLowerCase);
var stringMatch = unapply(String.prototype.match);
var stringReplace = unapply(String.prototype.replace);
var stringIndexOf = unapply(String.prototype.indexOf);
var stringTrim = unapply(String.prototype.trim);

var regExpTest = unapply(RegExp.prototype.test);

var typeErrorCreate = unconstruct(TypeError);

function unapply(func) {
  return function (thisArg) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return apply(func, thisArg, args);
  };
}

function unconstruct(func) {
  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return construct(func, args);
  };
}

/* Add properties to a lookup table */
function addToSet(set, array) {
  if (setPrototypeOf) {
    // Make 'in' and truthy checks like Boolean(set.constructor)
    // independent of any properties defined on Object.prototype.
    // Prevent prototype setters from intercepting set as a this value.
    setPrototypeOf(set, null);
  }

  var l = array.length;
  while (l--) {
    var element = array[l];
    if (typeof element === 'string') {
      var lcElement = stringToLowerCase(element);
      if (lcElement !== element) {
        // Config presets (e.g. tags.js, attrs.js) are immutable.
        if (!isFrozen(array)) {
          array[l] = lcElement;
        }

        element = lcElement;
      }
    }

    set[element] = true;
  }

  return set;
}

/* Shallow clone an object */
function clone(object) {
  var newObject = create(null);

  var property = void 0;
  for (property in object) {
    if (apply(hasOwnProperty, object, [property])) {
      newObject[property] = object[property];
    }
  }

  return newObject;
}

/* IE10 doesn't support __lookupGetter__ so lets'
 * simulate it. It also automatically checks
 * if the prop is function or getter and behaves
 * accordingly. */
function lookupGetter(object, prop) {
  while (object !== null) {
    var desc = getOwnPropertyDescriptor(object, prop);
    if (desc) {
      if (desc.get) {
        return unapply(desc.get);
      }

      if (typeof desc.value === 'function') {
        return unapply(desc.value);
      }
    }

    object = getPrototypeOf(object);
  }

  function fallbackValue(element) {
    console.warn('fallback value for', element);
    return null;
  }

  return fallbackValue;
}

var html = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);

// SVG
var svg = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);

var svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);

// List of SVG elements that are disallowed by default.
// We still need to know them so that we can do namespace
// checks properly in case one wants to add them to
// allow-list.
var svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'fedropshadow', 'feimage', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);

var mathMl = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover']);

// Similarly to SVG, we want to know all MathML elements,
// even those that we disallow by default.
var mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);

var text = freeze(['#text']);

var html$1 = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns']);

var svg$1 = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'transform', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);

var mathMl$1 = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);

var xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

// eslint-disable-next-line unicorn/better-regex
var MUSTACHE_EXPR = seal(/\{\{[\s\S]*|[\s\S]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
var ERB_EXPR = seal(/<%[\s\S]*|[\s\S]*%>/gm);
var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape
var ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
);
var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var getGlobal = function getGlobal() {
  return typeof window === 'undefined' ? null : window;
};

/**
 * Creates a no-op policy for internal use only.
 * Don't export this function outside this module!
 * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
 * @param {Document} document The document object (to determine policy name suffix)
 * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
 * are not supported).
 */
var _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, document) {
  if ((typeof trustedTypes === 'undefined' ? 'undefined' : _typeof(trustedTypes)) !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
    return null;
  }

  // Allow the callers to control the unique policy name
  // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
  // Policy creation with duplicate names throws in Trusted Types.
  var suffix = null;
  var ATTR_NAME = 'data-tt-policy-suffix';
  if (document.currentScript && document.currentScript.hasAttribute(ATTR_NAME)) {
    suffix = document.currentScript.getAttribute(ATTR_NAME);
  }

  var policyName = 'dompurify' + (suffix ? '#' + suffix : '');

  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML: function createHTML(html$$1) {
        return html$$1;
      }
    });
  } catch (_) {
    // Policy creation failed (most likely another DOMPurify script has
    // already run). Skip creating the policy, as this will only cause errors
    // if TT are enforced.
    console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
    return null;
  }
};

function createDOMPurify() {
  var window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

  var DOMPurify = function DOMPurify(root) {
    return createDOMPurify(root);
  };

  /**
   * Version label, exposed for easier checks
   * if DOMPurify is up to date or not
   */
  DOMPurify.version = '2.2.7';

  /**
   * Array of elements that DOMPurify removed during sanitation.
   * Empty if nothing was removed.
   */
  DOMPurify.removed = [];

  if (!window || !window.document || window.document.nodeType !== 9) {
    // Not running in a browser, provide a factory function
    // so that you can pass your own Window
    DOMPurify.isSupported = false;

    return DOMPurify;
  }

  var originalDocument = window.document;

  var document = window.document;
  var DocumentFragment = window.DocumentFragment,
      HTMLTemplateElement = window.HTMLTemplateElement,
      Node = window.Node,
      Element = window.Element,
      NodeFilter = window.NodeFilter,
      _window$NamedNodeMap = window.NamedNodeMap,
      NamedNodeMap = _window$NamedNodeMap === undefined ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap,
      Text = window.Text,
      Comment = window.Comment,
      DOMParser = window.DOMParser,
      trustedTypes = window.trustedTypes;


  var ElementPrototype = Element.prototype;

  var cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
  var getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
  var getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
  var getParentNode = lookupGetter(ElementPrototype, 'parentNode');

  // As per issue #47, the web-components registry is inherited by a
  // new document created via createHTMLDocument. As per the spec
  // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
  // a new empty registry is used when creating a template contents owner
  // document, so we use that as our parent document to ensure nothing
  // is inherited.
  if (typeof HTMLTemplateElement === 'function') {
    var template = document.createElement('template');
    if (template.content && template.content.ownerDocument) {
      document = template.content.ownerDocument;
    }
  }

  var trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, originalDocument);
  var emptyHTML = trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML('') : '';

  var _document = document,
      implementation = _document.implementation,
      createNodeIterator = _document.createNodeIterator,
      getElementsByTagName = _document.getElementsByTagName,
      createDocumentFragment = _document.createDocumentFragment;
  var importNode = originalDocument.importNode;


  var documentMode = {};
  try {
    documentMode = clone(document).documentMode ? document.documentMode : {};
  } catch (_) {}

  var hooks = {};

  /**
   * Expose whether this browser supports running the full DOMPurify.
   */
  DOMPurify.isSupported = typeof getParentNode === 'function' && implementation && typeof implementation.createHTMLDocument !== 'undefined' && documentMode !== 9;

  var MUSTACHE_EXPR$$1 = MUSTACHE_EXPR,
      ERB_EXPR$$1 = ERB_EXPR,
      DATA_ATTR$$1 = DATA_ATTR,
      ARIA_ATTR$$1 = ARIA_ATTR,
      IS_SCRIPT_OR_DATA$$1 = IS_SCRIPT_OR_DATA,
      ATTR_WHITESPACE$$1 = ATTR_WHITESPACE;
  var IS_ALLOWED_URI$$1 = IS_ALLOWED_URI;

  /**
   * We consider the elements and attributes below to be safe. Ideally
   * don't add any new ones but feel free to remove unwanted ones.
   */

  /* allowed element names */

  var ALLOWED_TAGS = null;
  var DEFAULT_ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(html), _toConsumableArray$1(svg), _toConsumableArray$1(svgFilters), _toConsumableArray$1(mathMl), _toConsumableArray$1(text)));

  /* Allowed attribute names */
  var ALLOWED_ATTR = null;
  var DEFAULT_ALLOWED_ATTR = addToSet({}, [].concat(_toConsumableArray$1(html$1), _toConsumableArray$1(svg$1), _toConsumableArray$1(mathMl$1), _toConsumableArray$1(xml)));

  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
  var FORBID_TAGS = null;

  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
  var FORBID_ATTR = null;

  /* Decide if ARIA attributes are okay */
  var ALLOW_ARIA_ATTR = true;

  /* Decide if custom data attributes are okay */
  var ALLOW_DATA_ATTR = true;

  /* Decide if unknown protocols are okay */
  var ALLOW_UNKNOWN_PROTOCOLS = false;

  /* Output should be safe for common template engines.
   * This means, DOMPurify removes data attributes, mustaches and ERB
   */
  var SAFE_FOR_TEMPLATES = false;

  /* Decide if document with <html>... should be returned */
  var WHOLE_DOCUMENT = false;

  /* Track whether config is already set on this instance of DOMPurify. */
  var SET_CONFIG = false;

  /* Decide if all elements (e.g. style, script) must be children of
   * document.body. By default, browsers might move them to document.head */
  var FORCE_BODY = false;

  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
   * string (or a TrustedHTML object if Trusted Types are supported).
   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
   */
  var RETURN_DOM = false;

  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
   * string  (or a TrustedHTML object if Trusted Types are supported) */
  var RETURN_DOM_FRAGMENT = false;

  /* If `RETURN_DOM` or `RETURN_DOM_FRAGMENT` is enabled, decide if the returned DOM
   * `Node` is imported into the current `Document`. If this flag is not enabled the
   * `Node` will belong (its ownerDocument) to a fresh `HTMLDocument`, created by
   * DOMPurify.
   *
   * This defaults to `true` starting DOMPurify 2.2.0. Note that setting it to `false`
   * might cause XSS from attacks hidden in closed shadowroots in case the browser
   * supports Declarative Shadow: DOM https://web.dev/declarative-shadow-dom/
   */
  var RETURN_DOM_IMPORT = true;

  /* Try to return a Trusted Type object instead of a string, return a string in
   * case Trusted Types are not supported  */
  var RETURN_TRUSTED_TYPE = false;

  /* Output should be free from DOM clobbering attacks? */
  var SANITIZE_DOM = true;

  /* Keep element content when removing element? */
  var KEEP_CONTENT = true;

  /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
   * of importing it into a new Document and returning a sanitized copy */
  var IN_PLACE = false;

  /* Allow usage of profiles like html, svg and mathMl */
  var USE_PROFILES = {};

  /* Tags to ignore content of when KEEP_CONTENT is true */
  var FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);

  /* Tags that are safe for data: URIs */
  var DATA_URI_TAGS = null;
  var DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);

  /* Attributes safe for values like "javascript:" */
  var URI_SAFE_ATTRIBUTES = null;
  var DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'summary', 'title', 'value', 'style', 'xmlns']);

  /* Keep a reference to config to pass to hooks */
  var CONFIG = null;

  /* Ideally, do not touch anything below this line */
  /* ______________________________________________ */

  var formElement = document.createElement('form');

  /**
   * _parseConfig
   *
   * @param  {Object} cfg optional config literal
   */
  // eslint-disable-next-line complexity
  var _parseConfig = function _parseConfig(cfg) {
    if (CONFIG && CONFIG === cfg) {
      return;
    }

    /* Shield configuration object from tampering */
    if (!cfg || (typeof cfg === 'undefined' ? 'undefined' : _typeof(cfg)) !== 'object') {
      cfg = {};
    }

    /* Shield configuration object from prototype pollution */
    cfg = clone(cfg);

    /* Set configuration parameters */
    ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS) : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR) : DEFAULT_ALLOWED_ATTR;
    URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR) : DEFAULT_URI_SAFE_ATTRIBUTES;
    DATA_URI_TAGS = 'ADD_DATA_URI_TAGS' in cfg ? addToSet(clone(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS) : DEFAULT_DATA_URI_TAGS;
    FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS) : {};
    FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR) : {};
    USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
    RETURN_DOM = cfg.RETURN_DOM || false; // Default false
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
    RETURN_DOM_IMPORT = cfg.RETURN_DOM_IMPORT !== false; // Default true
    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
    FORCE_BODY = cfg.FORCE_BODY || false; // Default false
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
    IN_PLACE = cfg.IN_PLACE || false; // Default false
    IS_ALLOWED_URI$$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI$$1;
    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }

    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }

    /* Parse profile info */
    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(text)));
      ALLOWED_ATTR = [];
      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html);
        addToSet(ALLOWED_ATTR, html$1);
      }

      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg);
        addToSet(ALLOWED_ATTR, svg$1);
        addToSet(ALLOWED_ATTR, xml);
      }

      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg$1);
        addToSet(ALLOWED_ATTR, xml);
      }

      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl);
        addToSet(ALLOWED_ATTR, mathMl$1);
        addToSet(ALLOWED_ATTR, xml);
      }
    }

    /* Merge configuration parameters */
    if (cfg.ADD_TAGS) {
      if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
        ALLOWED_TAGS = clone(ALLOWED_TAGS);
      }

      addToSet(ALLOWED_TAGS, cfg.ADD_TAGS);
    }

    if (cfg.ADD_ATTR) {
      if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
        ALLOWED_ATTR = clone(ALLOWED_ATTR);
      }

      addToSet(ALLOWED_ATTR, cfg.ADD_ATTR);
    }

    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR);
    }

    /* Add #text in case KEEP_CONTENT is set to true */
    if (KEEP_CONTENT) {
      ALLOWED_TAGS['#text'] = true;
    }

    /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
    if (WHOLE_DOCUMENT) {
      addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
    }

    /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ['tbody']);
      delete FORBID_TAGS.tbody;
    }

    // Prevent further manipulation of configuration.
    // Not available in IE8, Safari 5, etc.
    if (freeze) {
      freeze(cfg);
    }

    CONFIG = cfg;
  };

  var MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);

  var HTML_INTEGRATION_POINTS = addToSet({}, ['foreignobject', 'desc', 'title', 'annotation-xml']);

  /* Keep track of all possible SVG and MathML tags
   * so that we can perform the namespace checks
   * correctly. */
  var ALL_SVG_TAGS = addToSet({}, svg);
  addToSet(ALL_SVG_TAGS, svgFilters);
  addToSet(ALL_SVG_TAGS, svgDisallowed);

  var ALL_MATHML_TAGS = addToSet({}, mathMl);
  addToSet(ALL_MATHML_TAGS, mathMlDisallowed);

  var MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';

  /**
   *
   *
   * @param  {Element} element a DOM element whose namespace is being checked
   * @returns {boolean} Return false if the element has a
   *  namespace that a spec-compliant parser would never
   *  return. Return true otherwise.
   */
  var _checkValidNamespace = function _checkValidNamespace(element) {
    var parent = getParentNode(element);

    // In JSDOM, if we're inside shadow DOM, then parentNode
    // can be null. We just simulate parent in this case.
    if (!parent || !parent.tagName) {
      parent = {
        namespaceURI: HTML_NAMESPACE,
        tagName: 'template'
      };
    }

    var tagName = stringToLowerCase(element.tagName);
    var parentTagName = stringToLowerCase(parent.tagName);

    if (element.namespaceURI === SVG_NAMESPACE) {
      // The only way to switch from HTML namespace to SVG
      // is via <svg>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'svg';
      }

      // The only way to switch from MathML to SVG is via
      // svg if parent is either <annotation-xml> or MathML
      // text integration points.
      if (parent.namespaceURI === MATHML_NAMESPACE) {
        return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
      }

      // We only allow elements that are defined in SVG
      // spec. All others are disallowed in SVG namespace.
      return Boolean(ALL_SVG_TAGS[tagName]);
    }

    if (element.namespaceURI === MATHML_NAMESPACE) {
      // The only way to switch from HTML namespace to MathML
      // is via <math>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'math';
      }

      // The only way to switch from SVG to MathML is via
      // <math> and HTML integration points
      if (parent.namespaceURI === SVG_NAMESPACE) {
        return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
      }

      // We only allow elements that are defined in MathML
      // spec. All others are disallowed in MathML namespace.
      return Boolean(ALL_MATHML_TAGS[tagName]);
    }

    if (element.namespaceURI === HTML_NAMESPACE) {
      // The only way to switch from SVG to HTML is via
      // HTML integration points, and from MathML to HTML
      // is via MathML text integration points
      if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }

      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }

      // Certain elements are allowed in both SVG and HTML
      // namespace. We need to specify them explicitly
      // so that they don't get erronously deleted from
      // HTML namespace.
      var commonSvgAndHTMLElements = addToSet({}, ['title', 'style', 'font', 'a', 'script']);

      // We disallow tags that are specific for MathML
      // or SVG and should never appear in HTML namespace
      return !ALL_MATHML_TAGS[tagName] && (commonSvgAndHTMLElements[tagName] || !ALL_SVG_TAGS[tagName]);
    }

    // The code should never reach this place (this means
    // that the element somehow got namespace that is not
    // HTML, SVG or MathML). Return false just in case.
    return false;
  };

  /**
   * _forceRemove
   *
   * @param  {Node} node a DOM node
   */
  var _forceRemove = function _forceRemove(node) {
    arrayPush(DOMPurify.removed, { element: node });
    try {
      node.parentNode.removeChild(node);
    } catch (_) {
      try {
        node.outerHTML = emptyHTML;
      } catch (_) {
        node.remove();
      }
    }
  };

  /**
   * _removeAttribute
   *
   * @param  {String} name an Attribute name
   * @param  {Node} node a DOM node
   */
  var _removeAttribute = function _removeAttribute(name, node) {
    try {
      arrayPush(DOMPurify.removed, {
        attribute: node.getAttributeNode(name),
        from: node
      });
    } catch (_) {
      arrayPush(DOMPurify.removed, {
        attribute: null,
        from: node
      });
    }

    node.removeAttribute(name);

    // We void attribute values for unremovable "is"" attributes
    if (name === 'is' && !ALLOWED_ATTR[name]) {
      if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
        try {
          _forceRemove(node);
        } catch (_) {}
      } else {
        try {
          node.setAttribute(name, '');
        } catch (_) {}
      }
    }
  };

  /**
   * _initDocument
   *
   * @param  {String} dirty a string of dirty markup
   * @return {Document} a DOM, filled with the dirty markup
   */
  var _initDocument = function _initDocument(dirty) {
    /* Create a HTML document */
    var doc = void 0;
    var leadingWhitespace = void 0;

    if (FORCE_BODY) {
      dirty = '<remove></remove>' + dirty;
    } else {
      /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
      var matches = stringMatch(dirty, /^[\r\n\t ]+/);
      leadingWhitespace = matches && matches[0];
    }

    var dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
    /* Use the DOMParser API by default, fallback later if needs be */
    try {
      doc = new DOMParser().parseFromString(dirtyPayload, 'text/html');
    } catch (_) {}

    /* Use createHTMLDocument in case DOMParser is not available */
    if (!doc || !doc.documentElement) {
      doc = implementation.createHTMLDocument('');
      var _doc = doc,
          body = _doc.body;

      body.parentNode.removeChild(body.parentNode.firstElementChild);
      body.outerHTML = dirtyPayload;
    }

    if (dirty && leadingWhitespace) {
      doc.body.insertBefore(document.createTextNode(leadingWhitespace), doc.body.childNodes[0] || null);
    }

    /* Work on whole document or just its body */
    return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
  };

  /**
   * _createIterator
   *
   * @param  {Document} root document/fragment to create iterator for
   * @return {Iterator} iterator instance
   */
  var _createIterator = function _createIterator(root) {
    return createNodeIterator.call(root.ownerDocument || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, function () {
      return NodeFilter.FILTER_ACCEPT;
    }, false);
  };

  /**
   * _isClobbered
   *
   * @param  {Node} elm element to check for clobbering attacks
   * @return {Boolean} true if clobbered, false if safe
   */
  var _isClobbered = function _isClobbered(elm) {
    if (elm instanceof Text || elm instanceof Comment) {
      return false;
    }

    if (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string' || typeof elm.insertBefore !== 'function') {
      return true;
    }

    return false;
  };

  /**
   * _isNode
   *
   * @param  {Node} obj object to check whether it's a DOM node
   * @return {Boolean} true is object is a DOM node
   */
  var _isNode = function _isNode(object) {
    return (typeof Node === 'undefined' ? 'undefined' : _typeof(Node)) === 'object' ? object instanceof Node : object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string';
  };

  /**
   * _executeHook
   * Execute user configurable hooks
   *
   * @param  {String} entryPoint  Name of the hook's entry point
   * @param  {Node} currentNode node to work on with the hook
   * @param  {Object} data additional hook parameters
   */
  var _executeHook = function _executeHook(entryPoint, currentNode, data) {
    if (!hooks[entryPoint]) {
      return;
    }

    arrayForEach(hooks[entryPoint], function (hook) {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  };

  /**
   * _sanitizeElements
   *
   * @protect nodeName
   * @protect textContent
   * @protect removeChild
   *
   * @param   {Node} currentNode to check for permission to exist
   * @return  {Boolean} true if node was killed, false if left alive
   */
  var _sanitizeElements = function _sanitizeElements(currentNode) {
    var content = void 0;

    /* Execute a hook if present */
    _executeHook('beforeSanitizeElements', currentNode, null);

    /* Check if element is clobbered or can clobber */
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }

    /* Check if tagname contains Unicode */
    if (stringMatch(currentNode.nodeName, /[\u0080-\uFFFF]/)) {
      _forceRemove(currentNode);
      return true;
    }

    /* Now let's check the element's type and name */
    var tagName = stringToLowerCase(currentNode.nodeName);

    /* Execute a hook if present */
    _executeHook('uponSanitizeElement', currentNode, {
      tagName: tagName,
      allowedTags: ALLOWED_TAGS
    });

    /* Detect mXSS attempts abusing namespace confusion */
    if (!_isNode(currentNode.firstElementChild) && (!_isNode(currentNode.content) || !_isNode(currentNode.content.firstElementChild)) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
      _forceRemove(currentNode);
      return true;
    }

    /* Remove element if anything forbids its presence */
    if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
      /* Keep content except for bad-listed elements */
      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
        var parentNode = getParentNode(currentNode);
        var childNodes = getChildNodes(currentNode);

        if (childNodes && parentNode) {
          var childCount = childNodes.length;

          for (var i = childCount - 1; i >= 0; --i) {
            parentNode.insertBefore(cloneNode(childNodes[i], true), getNextSibling(currentNode));
          }
        }
      }

      _forceRemove(currentNode);
      return true;
    }

    /* Check whether element has a valid namespace */
    if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }

    if ((tagName === 'noscript' || tagName === 'noembed') && regExpTest(/<\/no(script|embed)/i, currentNode.innerHTML)) {
      _forceRemove(currentNode);
      return true;
    }

    /* Sanitize element content to be template-safe */
    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
      /* Get the element's text content */
      content = currentNode.textContent;
      content = stringReplace(content, MUSTACHE_EXPR$$1, ' ');
      content = stringReplace(content, ERB_EXPR$$1, ' ');
      if (currentNode.textContent !== content) {
        arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
        currentNode.textContent = content;
      }
    }

    /* Execute a hook if present */
    _executeHook('afterSanitizeElements', currentNode, null);

    return false;
  };

  /**
   * _isValidAttribute
   *
   * @param  {string} lcTag Lowercase tag name of containing element.
   * @param  {string} lcName Lowercase attribute name.
   * @param  {string} value Attribute value.
   * @return {Boolean} Returns true if `value` is valid, otherwise false.
   */
  // eslint-disable-next-line complexity
  var _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
    /* Make sure attribute cannot clobber */
    if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
      return false;
    }

    /* Allow valid data-* attributes: At least one character after "-"
        (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
        XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
        We don't need to check the value; it's always URI safe. */
    if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR$$1, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$$1, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
      return false;

      /* Check value is safe. First, is attr inert? If so, is safe */
    } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if (!value) ; else {
      return false;
    }

    return true;
  };

  /**
   * _sanitizeAttributes
   *
   * @protect attributes
   * @protect nodeName
   * @protect removeAttribute
   * @protect setAttribute
   *
   * @param  {Node} currentNode to sanitize
   */
  var _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
    var attr = void 0;
    var value = void 0;
    var lcName = void 0;
    var l = void 0;
    /* Execute a hook if present */
    _executeHook('beforeSanitizeAttributes', currentNode, null);

    var attributes = currentNode.attributes;

    /* Check if we have attributes; if not we might have a text node */

    if (!attributes) {
      return;
    }

    var hookEvent = {
      attrName: '',
      attrValue: '',
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR
    };
    l = attributes.length;

    /* Go backwards over all attributes; safely remove bad ones */
    while (l--) {
      attr = attributes[l];
      var _attr = attr,
          name = _attr.name,
          namespaceURI = _attr.namespaceURI;

      value = stringTrim(attr.value);
      lcName = stringToLowerCase(name);

      /* Execute a hook if present */
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
      _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
      value = hookEvent.attrValue;
      /* Did the hooks approve of the attribute? */
      if (hookEvent.forceKeepAttr) {
        continue;
      }

      /* Remove attribute */
      _removeAttribute(name, currentNode);

      /* Did the hooks approve of the attribute? */
      if (!hookEvent.keepAttr) {
        continue;
      }

      /* Work around a security issue in jQuery 3.0 */
      if (regExpTest(/\/>/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }

      /* Sanitize attribute content to be template-safe */
      if (SAFE_FOR_TEMPLATES) {
        value = stringReplace(value, MUSTACHE_EXPR$$1, ' ');
        value = stringReplace(value, ERB_EXPR$$1, ' ');
      }

      /* Is `value` valid for this attribute? */
      var lcTag = currentNode.nodeName.toLowerCase();
      if (!_isValidAttribute(lcTag, lcName, value)) {
        continue;
      }

      /* Handle invalid data-* attribute set by try-catching it */
      try {
        if (namespaceURI) {
          currentNode.setAttributeNS(namespaceURI, name, value);
        } else {
          /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
          currentNode.setAttribute(name, value);
        }

        arrayPop(DOMPurify.removed);
      } catch (_) {}
    }

    /* Execute a hook if present */
    _executeHook('afterSanitizeAttributes', currentNode, null);
  };

  /**
   * _sanitizeShadowDOM
   *
   * @param  {DocumentFragment} fragment to iterate over recursively
   */
  var _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
    var shadowNode = void 0;
    var shadowIterator = _createIterator(fragment);

    /* Execute a hook if present */
    _executeHook('beforeSanitizeShadowDOM', fragment, null);

    while (shadowNode = shadowIterator.nextNode()) {
      /* Execute a hook if present */
      _executeHook('uponSanitizeShadowNode', shadowNode, null);

      /* Sanitize tags and elements */
      if (_sanitizeElements(shadowNode)) {
        continue;
      }

      /* Deep shadow DOM detected */
      if (shadowNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(shadowNode.content);
      }

      /* Check attributes, sanitize if necessary */
      _sanitizeAttributes(shadowNode);
    }

    /* Execute a hook if present */
    _executeHook('afterSanitizeShadowDOM', fragment, null);
  };

  /**
   * Sanitize
   * Public method providing core sanitation functionality
   *
   * @param {String|Node} dirty string or DOM node
   * @param {Object} configuration object
   */
  // eslint-disable-next-line complexity
  DOMPurify.sanitize = function (dirty, cfg) {
    var body = void 0;
    var importedNode = void 0;
    var currentNode = void 0;
    var oldNode = void 0;
    var returnNode = void 0;
    /* Make sure we have a string to sanitize.
      DO NOT return early, as this will return the wrong type if
      the user has requested a DOM object rather than a string */
    if (!dirty) {
      dirty = '<!-->';
    }

    /* Stringify, in case dirty is an object */
    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      // eslint-disable-next-line no-negated-condition
      if (typeof dirty.toString !== 'function') {
        throw typeErrorCreate('toString is not a function');
      } else {
        dirty = dirty.toString();
        if (typeof dirty !== 'string') {
          throw typeErrorCreate('dirty is not a string, aborting');
        }
      }
    }

    /* Check we can run. Otherwise fall back or ignore */
    if (!DOMPurify.isSupported) {
      if (_typeof(window.toStaticHTML) === 'object' || typeof window.toStaticHTML === 'function') {
        if (typeof dirty === 'string') {
          return window.toStaticHTML(dirty);
        }

        if (_isNode(dirty)) {
          return window.toStaticHTML(dirty.outerHTML);
        }
      }

      return dirty;
    }

    /* Assign config vars */
    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }

    /* Clean up removed elements */
    DOMPurify.removed = [];

    /* Check if dirty is correctly typed for IN_PLACE */
    if (typeof dirty === 'string') {
      IN_PLACE = false;
    }

    if (IN_PLACE) ; else if (dirty instanceof Node) {
      /* If dirty is a DOM element, append to an empty document to avoid
         elements being stripped by the parser */
      body = _initDocument('<!---->');
      importedNode = body.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
        /* Node is already a body, use as is */
        body = importedNode;
      } else if (importedNode.nodeName === 'HTML') {
        body = importedNode;
      } else {
        // eslint-disable-next-line unicorn/prefer-node-append
        body.appendChild(importedNode);
      }
    } else {
      /* Exit directly if we have nothing to do */
      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT &&
      // eslint-disable-next-line unicorn/prefer-includes
      dirty.indexOf('<') === -1) {
        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
      }

      /* Initialize the document to work on */
      body = _initDocument(dirty);

      /* Check we have a DOM node from the data */
      if (!body) {
        return RETURN_DOM ? null : emptyHTML;
      }
    }

    /* Remove first element node (ours) if FORCE_BODY is set */
    if (body && FORCE_BODY) {
      _forceRemove(body.firstChild);
    }

    /* Get node iterator */
    var nodeIterator = _createIterator(IN_PLACE ? dirty : body);

    /* Now start iterating over the created document */
    while (currentNode = nodeIterator.nextNode()) {
      /* Fix IE's strange behavior with manipulated textNodes #89 */
      if (currentNode.nodeType === 3 && currentNode === oldNode) {
        continue;
      }

      /* Sanitize tags and elements */
      if (_sanitizeElements(currentNode)) {
        continue;
      }

      /* Shadow DOM detected, sanitize it */
      if (currentNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(currentNode.content);
      }

      /* Check attributes, sanitize if necessary */
      _sanitizeAttributes(currentNode);

      oldNode = currentNode;
    }

    oldNode = null;

    /* If we sanitized `dirty` in-place, return it. */
    if (IN_PLACE) {
      return dirty;
    }

    /* Return sanitized string or DOM */
    if (RETURN_DOM) {
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);

        while (body.firstChild) {
          // eslint-disable-next-line unicorn/prefer-node-append
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }

      if (RETURN_DOM_IMPORT) {
        /*
          AdoptNode() is not used because internal state is not reset
          (e.g. the past names map of a HTMLFormElement), this is safe
          in theory but we would rather not risk another attack vector.
          The state that is cloned by importNode() is explicitly defined
          by the specs.
        */
        returnNode = importNode.call(originalDocument, returnNode, true);
      }

      return returnNode;
    }

    var serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;

    /* Sanitize final string template-safe */
    if (SAFE_FOR_TEMPLATES) {
      serializedHTML = stringReplace(serializedHTML, MUSTACHE_EXPR$$1, ' ');
      serializedHTML = stringReplace(serializedHTML, ERB_EXPR$$1, ' ');
    }

    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
  };

  /**
   * Public method to set the configuration once
   * setConfig
   *
   * @param {Object} cfg configuration object
   */
  DOMPurify.setConfig = function (cfg) {
    _parseConfig(cfg);
    SET_CONFIG = true;
  };

  /**
   * Public method to remove the configuration
   * clearConfig
   *
   */
  DOMPurify.clearConfig = function () {
    CONFIG = null;
    SET_CONFIG = false;
  };

  /**
   * Public method to check if an attribute value is valid.
   * Uses last set config, if any. Otherwise, uses config defaults.
   * isValidAttribute
   *
   * @param  {string} tag Tag name of containing element.
   * @param  {string} attr Attribute name.
   * @param  {string} value Attribute value.
   * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
   */
  DOMPurify.isValidAttribute = function (tag, attr, value) {
    /* Initialize shared config vars if necessary. */
    if (!CONFIG) {
      _parseConfig({});
    }

    var lcTag = stringToLowerCase(tag);
    var lcName = stringToLowerCase(attr);
    return _isValidAttribute(lcTag, lcName, value);
  };

  /**
   * AddHook
   * Public method to add DOMPurify hooks
   *
   * @param {String} entryPoint entry point for the hook to add
   * @param {Function} hookFunction function to execute
   */
  DOMPurify.addHook = function (entryPoint, hookFunction) {
    if (typeof hookFunction !== 'function') {
      return;
    }

    hooks[entryPoint] = hooks[entryPoint] || [];
    arrayPush(hooks[entryPoint], hookFunction);
  };

  /**
   * RemoveHook
   * Public method to remove a DOMPurify hook at a given entryPoint
   * (pops it from the stack of hooks if more are present)
   *
   * @param {String} entryPoint entry point for the hook to remove
   */
  DOMPurify.removeHook = function (entryPoint) {
    if (hooks[entryPoint]) {
      arrayPop(hooks[entryPoint]);
    }
  };

  /**
   * RemoveHooks
   * Public method to remove all DOMPurify hooks at a given entryPoint
   *
   * @param  {String} entryPoint entry point for the hooks to remove
   */
  DOMPurify.removeHooks = function (entryPoint) {
    if (hooks[entryPoint]) {
      hooks[entryPoint] = [];
    }
  };

  /**
   * RemoveAllHooks
   * Public method to remove all DOMPurify hooks
   *
   */
  DOMPurify.removeAllHooks = function () {
    hooks = {};
  };

  return DOMPurify;
}

var purify = createDOMPurify();

purify.sanitize;

const ID_PREFIX = 'ag-';
let id = 0;
const getUniqueId = () => `${ID_PREFIX}${id++}`;
const getLongUniqueId = () => `${getUniqueId()}-${(+new Date()).toString(32)}`;
const noop = () => {};
/**
 * [genUpper2LowerKeyHash generate constants map hash, the value is lowercase of the key,
 * also translate `_` to `-`]
 */

const genUpper2LowerKeyHash = keys => {
  return keys.reduce((acc, key) => {
    const value = key.toLowerCase().replace(/_/g, '-');
    return Object.assign(acc, {
      [key]: value
    });
  }, {});
};
/**
 * generate constants map, the value is the key.
 */

const generateKeyHash = keys => {
  return keys.reduce((acc, key) => {
    return Object.assign(acc, {
      [key]: key
    });
  }, {});
}; // mixins

var require$$0$1 = [
	"a",
	"abbr",
	"address",
	"area",
	"article",
	"aside",
	"audio",
	"b",
	"base",
	"bdi",
	"bdo",
	"blockquote",
	"body",
	"br",
	"button",
	"canvas",
	"caption",
	"cite",
	"code",
	"col",
	"colgroup",
	"data",
	"datalist",
	"dd",
	"del",
	"details",
	"dfn",
	"dialog",
	"div",
	"dl",
	"dt",
	"em",
	"embed",
	"fieldset",
	"figcaption",
	"figure",
	"footer",
	"form",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"head",
	"header",
	"hgroup",
	"hr",
	"html",
	"i",
	"iframe",
	"img",
	"input",
	"ins",
	"kbd",
	"label",
	"legend",
	"li",
	"link",
	"main",
	"map",
	"mark",
	"math",
	"menu",
	"menuitem",
	"meta",
	"meter",
	"nav",
	"noscript",
	"object",
	"ol",
	"optgroup",
	"option",
	"output",
	"p",
	"param",
	"picture",
	"pre",
	"progress",
	"q",
	"rb",
	"rp",
	"rt",
	"rtc",
	"ruby",
	"s",
	"samp",
	"script",
	"section",
	"select",
	"slot",
	"small",
	"source",
	"span",
	"strong",
	"style",
	"sub",
	"summary",
	"sup",
	"svg",
	"table",
	"tbody",
	"td",
	"template",
	"textarea",
	"tfoot",
	"th",
	"thead",
	"time",
	"title",
	"tr",
	"track",
	"u",
	"ul",
	"var",
	"video",
	"wbr"
];

var htmlTags = require$$0$1;

var require$$0 = [
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"menuitem",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
];

var _void = require$$0;

Object.freeze(_void);
Object.freeze(htmlTags); // TYPE1 ~ TYPE7 according to https://github.github.com/gfm/#html-blocks

const BLOCK_TYPE1 = Object.freeze(['script', 'pre', 'style']);
const BLOCK_TYPE6 = Object.freeze(['address', 'article', 'aside', 'base', 'basefont', 'blockquote', 'body', 'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dialog', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'iframe', 'legend', 'li', 'link', 'main', 'menu', 'menuitem', 'meta', 'nav', 'noframes', 'ol', 'optgroup', 'option', 'p', 'param', 'section', 'source', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul']);
Object.freeze(htmlTags.filter(tag => {
  return !BLOCK_TYPE1.find(t => t === tag) && !BLOCK_TYPE6.find(t => t === tag);
}));
const PARAGRAPH_TYPES = Object.freeze(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'ol', 'li', 'figure']);
const blockContainerElementNames = Object.freeze([// elements our editor generates
...PARAGRAPH_TYPES, // all other known block elements
'address', 'article', 'aside', 'audio', 'canvas', 'dd', 'dl', 'dt', 'fieldset', 'figcaption', 'footer', 'form', 'header', 'hgroup', 'main', 'nav', 'noscript', 'output', 'section', 'video', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td']);
const emptyElementNames = Object.freeze(['br', 'col', 'colgroup', 'hr', 'img', 'input', 'source', 'wbr']);
const EVENT_KEYS = Object.freeze(generateKeyHash(['Enter', 'Backspace', 'Space', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Escape']));
Object.freeze(generateKeyHash([...blockContainerElementNames, ...emptyElementNames, 'div']));
Object.freeze(genUpper2LowerKeyHash(['AG_ACTIVE', 'AG_AUTO_LINK', 'AG_AUTO_LINK_EXTENSION', 'AG_BACKLASH', 'AG_BUG', 'AG_BULLET_LIST', 'AG_BULLET_LIST_ITEM', 'AG_CHECKBOX_CHECKED', 'AG_CONTAINER_BLOCK', 'AG_CONTAINER_PREVIEW', 'AG_CONTAINER_ICON', 'AG_COPY_REMOVE', 'AG_EDITOR_ID', 'AG_EMOJI_MARKED_TEXT', 'AG_EMOJI_MARKER', 'AG_EMPTY', 'AG_FENCE_CODE', 'AG_FLOWCHART', 'AG_FOCUS_MODE', 'AG_FRONT_MATTER', 'AG_FRONT_ICON', 'AG_GRAY', 'AG_HARD_LINE_BREAK', 'AG_HARD_LINE_BREAK_SPACE', 'AG_LINE_END', 'AG_HEADER_TIGHT_SPACE', 'AG_HIDE', 'AG_HIGHLIGHT', 'AG_HTML_BLOCK', 'AG_HTML_ESCAPE', 'AG_HTML_PREVIEW', 'AG_HTML_TAG', 'AG_IMAGE_FAIL', 'AG_IMAGE_BUTTONS', 'AG_IMAGE_LOADING', 'AG_EMPTY_IMAGE', 'AG_IMAGE_MARKED_TEXT', 'AG_IMAGE_SRC', 'AG_IMAGE_CONTAINER', 'AG_INLINE_IMAGE', 'AG_IMAGE_SUCCESS', 'AG_IMAGE_UPLOADING', 'AG_INLINE_IMAGE_SELECTED', 'AG_INLINE_IMAGE_IS_EDIT', 'AG_INDENT_CODE', 'AG_INLINE_FOOTNOTE_IDENTIFIER', 'AG_INLINE_RULE', 'AG_LANGUAGE', 'AG_LANGUAGE_INPUT', 'AG_LINK', 'AG_LINK_IN_BRACKET', 'AG_LIST_ITEM', 'AG_LOOSE_LIST_ITEM', 'AG_MATH', 'AG_MATH_TEXT', 'AG_MATH_RENDER', 'AG_RUBY', 'AG_RUBY_TEXT', 'AG_RUBY_RENDER', 'AG_SELECTED', 'AG_SOFT_LINE_BREAK', 'AG_MATH_ERROR', 'AG_MATH_MARKER', 'AG_MATH_RENDER', 'AG_MATH_TEXT', 'AG_MERMAID', 'AG_MULTIPLE_MATH', 'AG_NOTEXT_LINK', 'AG_ORDER_LIST', 'AG_ORDER_LIST_ITEM', 'AG_OUTPUT_REMOVE', 'AG_PARAGRAPH', 'AG_RAW_HTML', 'AG_REFERENCE_LABEL', 'AG_REFERENCE_LINK', 'AG_REFERENCE_MARKER', 'AG_REFERENCE_TITLE', 'AG_REMOVE', 'AG_RUBY', 'AG_RUBY_RENDER', 'AG_RUBY_TEXT', 'AG_SELECTION', 'AG_SEQUENCE', 'AG_SHOW_PREVIEW', 'AG_SOFT_LINE_BREAK', 'AG_TASK_LIST', 'AG_TASK_LIST_ITEM', 'AG_TASK_LIST_ITEM_CHECKBOX', 'AG_TIGHT_LIST_ITEM', 'AG_TOOL_BAR', 'AG_VEGA_LITE', 'AG_WARN']));
Object.freeze(new Set(['.ag-image-marked-text::before', '.ag-image-marked-text.ag-image-fail::before', '.ag-hide', '.ag-gray', '.ag-warn']));
getLongUniqueId();
getLongUniqueId();
Object.freeze({
  headingStyle: 'atx',
  // setext or atx
  hr: '---',
  bulletListMarker: '-',
  // -, +, or *
  codeBlockStyle: 'fenced',
  // fenced or indented
  fence: '```',
  // ``` or ~~~
  emDelimiter: '*',
  // _ or *
  strongDelimiter: '**',
  // ** or __
  linkStyle: 'inlined',
  linkReferenceStyle: 'full',

  blankReplacement(content, node, options) {
    if (node && node.classList.contains('ag-soft-line-break')) {
      return LINE_BREAK;
    } else if (node && node.classList.contains('ag-hard-line-break')) {
      return '  ' + LINE_BREAK;
    } else if (node && node.classList.contains('ag-hard-line-break-sapce')) {
      return '';
    } else {
      return node.isBlock ? '\n\n' : '';
    }
  }

});
Object.freeze({
  em: '*',
  inline_code: '`',
  strong: '**',
  del: '~~',
  inline_math: '$',
  u: {
    open: '<u>',
    close: '</u>'
  },
  sub: {
    open: '<sub>',
    close: '</sub>'
  },
  sup: {
    open: '<sup>',
    close: '</sup>'
  },
  mark: {
    open: '<mark>',
    close: '</mark>'
  }
});
Object.freeze(['strong', 'em', 'del', 'inline_code', 'link', 'image', 'inline_math']);
const LINE_BREAK = '\n';
Object.freeze({
  // do not forbit `class` because `code` element use class to present language
  FORBID_ATTR: ['style', 'contenteditable'],
  ALLOW_DATA_ATTR: false,
  USE_PROFILES: {
    html: true,
    svg: true,
    svgFilters: true,
    mathMl: false
  },
  RETURN_TRUSTED_TYPE: false
});
Object.freeze({
  FORBID_ATTR: ['contenteditable'],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ['data-align'],
  USE_PROFILES: {
    html: true,
    svg: true,
    svgFilters: true,
    mathMl: false
  },
  RETURN_TRUSTED_TYPE: false,
  // Allow "file" protocol to export images on Windows (#1997).
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|file):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape

});
Object.freeze({
  fontSize: 16,
  lineHeight: 1.6,
  focusMode: false,
  markdown: '',
  // Whether to trim the beginning and ending empty line in code block when open markdown.
  trimUnnecessaryCodeBlockEmptyLines: false,
  preferLooseListItem: true,
  autoPairBracket: true,
  autoPairMarkdownSyntax: true,
  autoPairQuote: true,
  bulletListMarker: '-',
  orderListDelimiter: '.',
  tabSize: 4,
  codeBlockLineNumbers: false,
  // bullet/list marker width + listIndentation, tab or Daring Fireball Markdown (4 spaces) --> list indentation
  listIndentation: 1,
  frontmatterType: '-',
  sequenceTheme: 'hand',
  // hand or simple
  mermaidTheme: 'default',
  // dark / forest / default
  vegaTheme: 'latimes',
  // excel / ggplot2 / quartz / vox / fivethirtyeight / dark / latimes
  hideQuickInsertHint: false,
  hideLinkPopup: false,
  autoCheck: false,
  // Whether we should set spellcheck attribute on our container to highlight misspelled words.
  // NOTE: The browser is not able to correct misspelled words words without a custom
  // implementation like in Mark Text.
  spellcheckEnabled: false,
  // transform the image to local folder, cloud or just return the local path
  imageAction: null,
  // Call Electron open dialog or input element type is file.
  imagePathPicker: null,
  clipboardFilePath: () => {},
  // image path auto completed when you input in image selector.
  imagePathAutoComplete: () => [],
  // Markdown extensions
  superSubScript: false,
  footnote: false,
  isGitlabCompatibilityEnabled: false,
  // Whether HTML rendering is disabled or not.
  disableHtml: true
}); // export const DIAGRAM_TEMPLATE = Object.freeze({
//   'mermaid': `graph LR;\nYou-->|Mark Text|Me;`
// })

window && window.navigator && /Mac/.test(window.navigator.platform);
window && window.navigator.userAgent && /win32|wow32|win64|wow64/i.test(window.navigator.userAgent); // The smallest transparent gif base64 image.
// export const SMALLEST_BASE64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
// export const isIOS = /(?:iPhone|iPad|iPod|iOS)/i.test(window.navigator.userAgent)

Object.freeze({
  isCaseSensitive: false,
  isWholeWord: false,
  isRegexp: false,
  selectHighlight: false,
  highlightIndex: -1
});

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z$1 = ".ag-float-wrapper {\n  position: absolute;\n  font-size: 12px;\n  opacity: 0;\n  width: 110px;\n  height: auto;\n  top: -1000px;\n  right: -1000px;\n  border-radius: 2px;\n  box-shadow: var(--floatShadow);\n  background-color: var(--floatBgColor);\n  transition: opacity .25s ease-in-out;\n  transform-origin: top;\n  box-sizing: border-box;\n  z-index: 10000;\n  overflow: hidden;\n}\n\n.ag-float-container::-webkit-scrollbar:vertical {\n  width: 0px;\n}\n\n[x-placement] {\n  opacity: 1;\n}\n\n.ag-popper-arrow {\n  width: 16px;\n  height: 16px;\n  background: inherit;\n  border: 1px solid #ebeef5;\n  display: inline-block;\n  position: absolute;\n  transform: rotate(45deg);\n}\n\n[x-placement=\"bottom-start\"] > .ag-popper-arrow {\n  border-right: none;\n  border-bottom: none;\n  top: -9px;\n}\n\n[x-placement=\"top-start\"] > .ag-popper-arrow {\n  border-left: none;\n  border-top: none;\n  bottom: -9px;\n}\n\n[x-out-of-boundaries] {\n  display: none;\n}\n";
styleInject(css_248z$1);

const defaultOptions = () => ({
  placement: 'bottom-start',
  modifiers: {
    offset: {
      offset: '0, 12'
    }
  },
  showArrow: true
});

class BaseFloat {
  constructor(muya, name, options = {}) {
    this.name = name;
    this.muya = muya;
    this.options = Object.assign({}, defaultOptions(), options);
    this.status = false;
    this.floatBox = null;
    this.container = null;
    this.popper = null;
    this.lastScrollTop = null;
    this.cb = noop;
    this.init();
  }

  init() {
    const {
      showArrow
    } = this.options;
    const floatBox = document.createElement('div');
    const container = document.createElement('div'); // Use to remember whick float container is shown.

    container.classList.add(this.name);
    container.classList.add('ag-float-container');
    floatBox.classList.add('ag-float-wrapper');

    if (showArrow) {
      const arrow = document.createElement('div');
      arrow.setAttribute('x-arrow', '');
      arrow.classList.add('ag-popper-arrow');
      floatBox.appendChild(arrow);
    }

    floatBox.appendChild(container);
    document.body.appendChild(floatBox);
    const erd = elementResizeDetector({
      strategy: 'scroll'
    }); // use polyfill

    erd.listenTo(container, ele => {
      const {
        offsetWidth,
        offsetHeight
      } = ele;
      Object.assign(floatBox.style, {
        width: `${offsetWidth}px`,
        height: `${offsetHeight}px`
      });
      this.popper && this.popper.update();
    }); // const ro = new ResizeObserver(entries => {
    //   for (const entry of entries) {
    //     const { offsetWidth, offsetHeight } = entry.target
    //     Object.assign(floatBox.style, { width: `${offsetWidth + 2}px`, height: `${offsetHeight + 2}px` })
    //     this.popper && this.popper.update()
    //   }
    // })
    // ro.observe(container)

    this.floatBox = floatBox;
    this.container = container;
  }

  listen() {
    const {
      eventCenter,
      container
    } = this.muya;
    const {
      floatBox
    } = this;

    const keydownHandler = event => {
      if (event.key === EVENT_KEYS.Escape) {
        this.hide();
      }
    };

    const scrollHandler = event => {
      if (typeof this.lastScrollTop !== 'number') {
        this.lastScrollTop = event.target.scrollTop;
        return;
      } // only when scoll distance great than 50px, then hide the float box.


      if (this.status && Math.abs(event.target.scrollTop - this.lastScrollTop) > 50) {
        this.hide();
      }
    };

    eventCenter.attachDOMEvent(document, 'click', this.hide.bind(this));
    eventCenter.attachDOMEvent(floatBox, 'click', event => {
      event.stopPropagation();
      event.preventDefault();
    });
    eventCenter.attachDOMEvent(container, 'keydown', keydownHandler);
    eventCenter.attachDOMEvent(container, 'scroll', scrollHandler);
  }

  hide() {
    const {
      eventCenter
    } = this.muya;
    if (!this.status) return;
    this.status = false;

    if (this.popper && this.popper.destroy) {
      this.popper.destroy();
    }

    this.cb = noop;
    eventCenter.dispatch('muya-float', this, false);
    this.lastScrollTop = null;
  }

  show(reference, cb = noop) {
    const {
      floatBox
    } = this;
    const {
      eventCenter
    } = this.muya;
    const {
      placement,
      modifiers
    } = this.options;

    if (this.popper && this.popper.destroy) {
      this.popper.destroy();
    }

    this.cb = cb;
    this.popper = new Popper(reference, floatBox, {
      placement,
      modifiers
    });
    this.status = true;
    eventCenter.dispatch('muya-float', this, true);
  }

  destroy() {
    if (this.popper && this.popper.destroy) {
      this.popper.destroy();
    }

    this.floatBox.remove();
  }

}

class BaseScrollFloat extends BaseFloat {
  constructor(muya, name, options = {}) {
    super(muya, name, options);
    this.scrollElement = null;
    this.reference = null;
    this.activeItem = null;
    this.createScrollElement();
  }

  createScrollElement() {
    const {
      container
    } = this;
    const scrollElement = document.createElement('div');
    container.appendChild(scrollElement);
    this.scrollElement = scrollElement;
  }

  activeEleScrollIntoView(ele) {
    if (ele) {
      ele.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'start'
      });
    }
  }

  listen() {
    super.listen();
    const {
      eventCenter,
      container
    } = this.muya;

    const handler = event => {
      if (!this.status) return;

      switch (event.key) {
        case EVENT_KEYS.ArrowUp:
          this.step('previous');
          break;

        case EVENT_KEYS.ArrowDown:
        case EVENT_KEYS.Tab:
          this.step('next');
          break;

        case EVENT_KEYS.Enter:
          this.selectItem(this.activeItem);
          break;
      }
    };

    eventCenter.attachDOMEvent(container, 'keydown', handler);
  }

  hide() {
    super.hide();
    this.reference = null;
  }

  show(reference, cb) {
    this.cb = cb;

    if (reference instanceof HTMLElement) {
      if (this.reference && this.reference === reference && this.status) return;
    } else {
      if (this.reference && this.reference.id === reference.id && this.status) return;
    }

    this.reference = reference;
    super.show(reference, cb);
  }

  step(direction) {
    let index = this.renderArray.findIndex(item => {
      return item === this.activeItem;
    });
    index = direction === 'next' ? index + 1 : index - 1;

    if (index < 0 || index >= this.renderArray.length) {
      return;
    }

    this.activeItem = this.renderArray[index];
    this.render();
    const activeEle = this.getItemElement(this.activeItem);
    this.activeEleScrollIntoView(activeEle);
  }

  selectItem(item) {
    const {
      cb
    } = this;
    cb(item); // delay hide to avoid dispatch enter hander

    setTimeout(this.hide.bind(this));
  }

  getItemElement() {}

}

var scorer = createCommonjsModule(function (module, exports) {
(function() {
  var PathSeparator, queryIsLastPathSegment;

  PathSeparator = require$$0__default['default'].sep;

  exports.basenameScore = function(string, query, score) {
    var base, depth, index, lastCharacter, segmentCount, slashCount;
    index = string.length - 1;
    while (string[index] === PathSeparator) {
      index--;
    }
    slashCount = 0;
    lastCharacter = index;
    base = null;
    while (index >= 0) {
      if (string[index] === PathSeparator) {
        slashCount++;
        if (base == null) {
          base = string.substring(index + 1, lastCharacter + 1);
        }
      } else if (index === 0) {
        if (lastCharacter < string.length - 1) {
          if (base == null) {
            base = string.substring(0, lastCharacter + 1);
          }
        } else {
          if (base == null) {
            base = string;
          }
        }
      }
      index--;
    }
    if (base === string) {
      score *= 2;
    } else if (base) {
      score += exports.score(base, query);
    }
    segmentCount = slashCount + 1;
    depth = Math.max(1, 10 - segmentCount);
    score *= depth * 0.01;
    return score;
  };

  exports.score = function(string, query) {
    var character, characterScore, indexInQuery, indexInString, lowerCaseIndex, minIndex, queryLength, queryScore, stringLength, totalCharacterScore, upperCaseIndex, _ref;
    if (string === query) {
      return 1;
    }
    if (queryIsLastPathSegment(string, query)) {
      return 1;
    }
    totalCharacterScore = 0;
    queryLength = query.length;
    stringLength = string.length;
    indexInQuery = 0;
    indexInString = 0;
    while (indexInQuery < queryLength) {
      character = query[indexInQuery++];
      lowerCaseIndex = string.indexOf(character.toLowerCase());
      upperCaseIndex = string.indexOf(character.toUpperCase());
      minIndex = Math.min(lowerCaseIndex, upperCaseIndex);
      if (minIndex === -1) {
        minIndex = Math.max(lowerCaseIndex, upperCaseIndex);
      }
      indexInString = minIndex;
      if (indexInString === -1) {
        return 0;
      }
      characterScore = 0.1;
      if (string[indexInString] === character) {
        characterScore += 0.1;
      }
      if (indexInString === 0 || string[indexInString - 1] === PathSeparator) {
        characterScore += 0.8;
      } else if ((_ref = string[indexInString - 1]) === '-' || _ref === '_' || _ref === ' ') {
        characterScore += 0.7;
      }
      string = string.substring(indexInString + 1, stringLength);
      totalCharacterScore += characterScore;
    }
    queryScore = totalCharacterScore / queryLength;
    return ((queryScore * (queryLength / stringLength)) + queryScore) / 2;
  };

  queryIsLastPathSegment = function(string, query) {
    if (string[string.length - query.length - 1] === PathSeparator) {
      return string.lastIndexOf(query) === string.length - query.length;
    }
  };

}).call(commonjsGlobal);
});

var filter = createCommonjsModule(function (module) {
(function() {
  var pluckCandidates, scorer$1, sortCandidates;

  scorer$1 = scorer;

  pluckCandidates = function(a) {
    return a.candidate;
  };

  sortCandidates = function(a, b) {
    return b.score - a.score;
  };

  module.exports = function(candidates, query, queryHasSlashes, _arg) {
    var candidate, key, maxResults, score, scoredCandidates, string, _i, _len, _ref;
    _ref = _arg != null ? _arg : {}, key = _ref.key, maxResults = _ref.maxResults;
    if (query) {
      scoredCandidates = [];
      for (_i = 0, _len = candidates.length; _i < _len; _i++) {
        candidate = candidates[_i];
        string = key != null ? candidate[key] : candidate;
        if (!string) {
          continue;
        }
        score = scorer$1.score(string, query, queryHasSlashes);
        if (!queryHasSlashes) {
          score = scorer$1.basenameScore(string, query, score);
        }
        if (score > 0) {
          scoredCandidates.push({
            candidate: candidate,
            score: score
          });
        }
      }
      scoredCandidates.sort(sortCandidates);
      candidates = scoredCandidates.map(pluckCandidates);
    }
    if (maxResults != null) {
      candidates = candidates.slice(0, maxResults);
    }
    return candidates;
  };

}).call(commonjsGlobal);
});

var matcher = createCommonjsModule(function (module, exports) {
(function() {
  var PathSeparator;

  PathSeparator = require$$0__default['default'].sep;

  exports.basenameMatch = function(string, query) {
    var base, index, lastCharacter;
    index = string.length - 1;
    while (string[index] === PathSeparator) {
      index--;
    }
    lastCharacter = index;
    base = null;
    while (index >= 0) {
      if (string[index] === PathSeparator) {
        if (base == null) {
          base = string.substring(index + 1, lastCharacter + 1);
        }
      } else if (index === 0) {
        if (lastCharacter < string.length - 1) {
          if (base == null) {
            base = string.substring(0, lastCharacter + 1);
          }
        } else {
          if (base == null) {
            base = string;
          }
        }
      }
      index--;
    }
    return exports.match(base, query, string.length - base.length);
  };

  exports.match = function(string, query, stringOffset) {
    var character, indexInQuery, indexInString, lowerCaseIndex, matches, minIndex, queryLength, stringLength, upperCaseIndex, _results;
    if (stringOffset == null) {
      stringOffset = 0;
    }
    if (string === query) {
      return (function() {
        _results = [];
        for (var _i = stringOffset, _ref = stringOffset + string.length; stringOffset <= _ref ? _i < _ref : _i > _ref; stringOffset <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this);
    }
    queryLength = query.length;
    stringLength = string.length;
    indexInQuery = 0;
    indexInString = 0;
    matches = [];
    while (indexInQuery < queryLength) {
      character = query[indexInQuery++];
      lowerCaseIndex = string.indexOf(character.toLowerCase());
      upperCaseIndex = string.indexOf(character.toUpperCase());
      minIndex = Math.min(lowerCaseIndex, upperCaseIndex);
      if (minIndex === -1) {
        minIndex = Math.max(lowerCaseIndex, upperCaseIndex);
      }
      indexInString = minIndex;
      if (indexInString === -1) {
        return [];
      }
      matches.push(stringOffset + indexInString);
      stringOffset += indexInString + 1;
      string = string.substring(indexInString + 1, stringLength);
    }
    return matches;
  };

}).call(commonjsGlobal);
});

var fuzzaldrin = createCommonjsModule(function (module) {
(function() {
  var PathSeparator, SpaceRegex, filter$1, matcher$1, scorer$1;

  scorer$1 = scorer;

  filter$1 = filter;

  matcher$1 = matcher;

  PathSeparator = require$$0__default['default'].sep;

  SpaceRegex = /\ /g;

  module.exports = {
    filter: function(candidates, query, options) {
      var queryHasSlashes;
      if (query) {
        queryHasSlashes = query.indexOf(PathSeparator) !== -1;
        query = query.replace(SpaceRegex, '');
      }
      return filter$1(candidates, query, queryHasSlashes, options);
    },
    score: function(string, query) {
      var queryHasSlashes, score;
      if (!string) {
        return 0;
      }
      if (!query) {
        return 0;
      }
      if (string === query) {
        return 2;
      }
      queryHasSlashes = query.indexOf(PathSeparator) !== -1;
      query = query.replace(SpaceRegex, '');
      score = scorer$1.score(string, query);
      if (!queryHasSlashes) {
        score = scorer$1.basenameScore(string, query, score);
      }
      return score;
    },
    match: function(string, query) {
      var baseMatches, index, matches, queryHasSlashes, seen, _results;
      if (!string) {
        return [];
      }
      if (!query) {
        return [];
      }
      if (string === query) {
        return (function() {
          _results = [];
          for (var _i = 0, _ref = string.length; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
          return _results;
        }).apply(this);
      }
      queryHasSlashes = query.indexOf(PathSeparator) !== -1;
      query = query.replace(SpaceRegex, '');
      matches = matcher$1.match(string, query);
      if (!queryHasSlashes) {
        baseMatches = matcher$1.basenameMatch(string, query);
        matches = matches.concat(baseMatches).sort(function(a, b) {
          return a - b;
        });
        seen = null;
        index = 0;
        while (index < matches.length) {
          if (index && seen === matches[index]) {
            matches.splice(index, 1);
          } else {
            seen = matches[index];
            index++;
          }
        }
      }
      return matches;
    }
  };

}).call(commonjsGlobal);
});

var emojis = [
	{
		emoji: "😀",
		description: "grinning face",
		category: "People",
		aliases: [
			"grinning"
		],
		tags: [
			"smile",
			"happy"
		]
	},
	{
		emoji: "😃",
		description: "smiling face with open mouth",
		category: "People",
		aliases: [
			"smiley"
		],
		tags: [
			"happy",
			"joy",
			"haha"
		]
	},
	{
		emoji: "😄",
		description: "smiling face with open mouth & smiling eyes",
		category: "People",
		aliases: [
			"smile"
		],
		tags: [
			"happy",
			"joy",
			"laugh",
			"pleased"
		]
	},
	{
		emoji: "😁",
		description: "grinning face with smiling eyes",
		category: "People",
		aliases: [
			"grin"
		],
		tags: [
		]
	},
	{
		emoji: "😆",
		description: "smiling face with open mouth & closed eyes",
		category: "People",
		aliases: [
			"laughing",
			"satisfied"
		],
		tags: [
			"happy",
			"haha"
		]
	},
	{
		emoji: "😅",
		description: "smiling face with open mouth & cold sweat",
		category: "People",
		aliases: [
			"sweat_smile"
		],
		tags: [
			"hot"
		]
	},
	{
		emoji: "😂",
		description: "face with tears of joy",
		category: "People",
		aliases: [
			"joy"
		],
		tags: [
			"tears"
		]
	},
	{
		emoji: "🤣",
		description: "rolling on the floor laughing",
		category: "People",
		aliases: [
			"rofl"
		],
		tags: [
			"lol",
			"laughing"
		]
	},
	{
		emoji: "☺️",
		description: "smiling face",
		category: "People",
		aliases: [
			"relaxed"
		],
		tags: [
			"blush",
			"pleased"
		]
	},
	{
		emoji: "😊",
		description: "smiling face with smiling eyes",
		category: "People",
		aliases: [
			"blush"
		],
		tags: [
			"proud"
		]
	},
	{
		emoji: "😇",
		description: "smiling face with halo",
		category: "People",
		aliases: [
			"innocent"
		],
		tags: [
			"angel"
		]
	},
	{
		emoji: "🙂",
		description: "slightly smiling face",
		category: "People",
		aliases: [
			"slightly_smiling_face"
		],
		tags: [
		]
	},
	{
		emoji: "🙃",
		description: "upside-down face",
		category: "People",
		aliases: [
			"upside_down_face"
		],
		tags: [
		]
	},
	{
		emoji: "😉",
		description: "winking face",
		category: "People",
		aliases: [
			"wink"
		],
		tags: [
			"flirt"
		]
	},
	{
		emoji: "😌",
		description: "relieved face",
		category: "People",
		aliases: [
			"relieved"
		],
		tags: [
			"whew"
		]
	},
	{
		emoji: "😍",
		description: "smiling face with heart-eyes",
		category: "People",
		aliases: [
			"heart_eyes"
		],
		tags: [
			"love",
			"crush"
		]
	},
	{
		emoji: "😘",
		description: "face blowing a kiss",
		category: "People",
		aliases: [
			"kissing_heart"
		],
		tags: [
			"flirt"
		]
	},
	{
		emoji: "😗",
		description: "kissing face",
		category: "People",
		aliases: [
			"kissing"
		],
		tags: [
		]
	},
	{
		emoji: "😙",
		description: "kissing face with smiling eyes",
		category: "People",
		aliases: [
			"kissing_smiling_eyes"
		],
		tags: [
		]
	},
	{
		emoji: "😚",
		description: "kissing face with closed eyes",
		category: "People",
		aliases: [
			"kissing_closed_eyes"
		],
		tags: [
		]
	},
	{
		emoji: "😋",
		description: "face savouring delicious food",
		category: "People",
		aliases: [
			"yum"
		],
		tags: [
			"tongue",
			"lick"
		]
	},
	{
		emoji: "😜",
		description: "face with stuck-out tongue & winking eye",
		category: "People",
		aliases: [
			"stuck_out_tongue_winking_eye"
		],
		tags: [
			"prank",
			"silly"
		]
	},
	{
		emoji: "😝",
		description: "face with stuck-out tongue & closed eyes",
		category: "People",
		aliases: [
			"stuck_out_tongue_closed_eyes"
		],
		tags: [
			"prank"
		]
	},
	{
		emoji: "😛",
		description: "face with stuck-out tongue",
		category: "People",
		aliases: [
			"stuck_out_tongue"
		],
		tags: [
		]
	},
	{
		emoji: "🤑",
		description: "money-mouth face",
		category: "People",
		aliases: [
			"money_mouth_face"
		],
		tags: [
			"rich"
		]
	},
	{
		emoji: "🤗",
		description: "hugging face",
		category: "People",
		aliases: [
			"hugs"
		],
		tags: [
		]
	},
	{
		emoji: "🤓",
		description: "nerd face",
		category: "People",
		aliases: [
			"nerd_face"
		],
		tags: [
			"geek",
			"glasses"
		]
	},
	{
		emoji: "😎",
		description: "smiling face with sunglasses",
		category: "People",
		aliases: [
			"sunglasses"
		],
		tags: [
			"cool"
		]
	},
	{
		emoji: "🤡",
		description: "clown face",
		category: "People",
		aliases: [
			"clown_face"
		],
		tags: [
		]
	},
	{
		emoji: "🤠",
		description: "cowboy hat face",
		category: "People",
		aliases: [
			"cowboy_hat_face"
		],
		tags: [
		]
	},
	{
		emoji: "😏",
		description: "smirking face",
		category: "People",
		aliases: [
			"smirk"
		],
		tags: [
			"smug"
		]
	},
	{
		emoji: "😒",
		description: "unamused face",
		category: "People",
		aliases: [
			"unamused"
		],
		tags: [
			"meh"
		]
	},
	{
		emoji: "😞",
		description: "disappointed face",
		category: "People",
		aliases: [
			"disappointed"
		],
		tags: [
			"sad"
		]
	},
	{
		emoji: "😔",
		description: "pensive face",
		category: "People",
		aliases: [
			"pensive"
		],
		tags: [
		]
	},
	{
		emoji: "😟",
		description: "worried face",
		category: "People",
		aliases: [
			"worried"
		],
		tags: [
			"nervous"
		]
	},
	{
		emoji: "😕",
		description: "confused face",
		category: "People",
		aliases: [
			"confused"
		],
		tags: [
		]
	},
	{
		emoji: "🙁",
		description: "slightly frowning face",
		category: "People",
		aliases: [
			"slightly_frowning_face"
		],
		tags: [
		]
	},
	{
		emoji: "☹️",
		description: "frowning face",
		category: "People",
		aliases: [
			"frowning_face"
		],
		tags: [
		]
	},
	{
		emoji: "😣",
		description: "persevering face",
		category: "People",
		aliases: [
			"persevere"
		],
		tags: [
			"struggling"
		]
	},
	{
		emoji: "😖",
		description: "confounded face",
		category: "People",
		aliases: [
			"confounded"
		],
		tags: [
		]
	},
	{
		emoji: "😫",
		description: "tired face",
		category: "People",
		aliases: [
			"tired_face"
		],
		tags: [
			"upset",
			"whine"
		]
	},
	{
		emoji: "😩",
		description: "weary face",
		category: "People",
		aliases: [
			"weary"
		],
		tags: [
			"tired"
		]
	},
	{
		emoji: "😤",
		description: "face with steam from nose",
		category: "People",
		aliases: [
			"triumph"
		],
		tags: [
			"smug"
		]
	},
	{
		emoji: "😠",
		description: "angry face",
		category: "People",
		aliases: [
			"angry"
		],
		tags: [
			"mad",
			"annoyed"
		]
	},
	{
		emoji: "😡",
		description: "pouting face",
		category: "People",
		aliases: [
			"rage",
			"pout"
		],
		tags: [
			"angry"
		]
	},
	{
		emoji: "😶",
		description: "face without mouth",
		category: "People",
		aliases: [
			"no_mouth"
		],
		tags: [
			"mute",
			"silence"
		]
	},
	{
		emoji: "😐",
		description: "neutral face",
		category: "People",
		aliases: [
			"neutral_face"
		],
		tags: [
			"meh"
		]
	},
	{
		emoji: "😑",
		description: "expressionless face",
		category: "People",
		aliases: [
			"expressionless"
		],
		tags: [
		]
	},
	{
		emoji: "😯",
		description: "hushed face",
		category: "People",
		aliases: [
			"hushed"
		],
		tags: [
			"silence",
			"speechless"
		]
	},
	{
		emoji: "😦",
		description: "frowning face with open mouth",
		category: "People",
		aliases: [
			"frowning"
		],
		tags: [
		]
	},
	{
		emoji: "😧",
		description: "anguished face",
		category: "People",
		aliases: [
			"anguished"
		],
		tags: [
			"stunned"
		]
	},
	{
		emoji: "😮",
		description: "face with open mouth",
		category: "People",
		aliases: [
			"open_mouth"
		],
		tags: [
			"surprise",
			"impressed",
			"wow"
		]
	},
	{
		emoji: "😲",
		description: "astonished face",
		category: "People",
		aliases: [
			"astonished"
		],
		tags: [
			"amazed",
			"gasp"
		]
	},
	{
		emoji: "😵",
		description: "dizzy face",
		category: "People",
		aliases: [
			"dizzy_face"
		],
		tags: [
		]
	},
	{
		emoji: "😳",
		description: "flushed face",
		category: "People",
		aliases: [
			"flushed"
		],
		tags: [
		]
	},
	{
		emoji: "😱",
		description: "face screaming in fear",
		category: "People",
		aliases: [
			"scream"
		],
		tags: [
			"horror",
			"shocked"
		]
	},
	{
		emoji: "😨",
		description: "fearful face",
		category: "People",
		aliases: [
			"fearful"
		],
		tags: [
			"scared",
			"shocked",
			"oops"
		]
	},
	{
		emoji: "😰",
		description: "face with open mouth & cold sweat",
		category: "People",
		aliases: [
			"cold_sweat"
		],
		tags: [
			"nervous"
		]
	},
	{
		emoji: "😢",
		description: "crying face",
		category: "People",
		aliases: [
			"cry"
		],
		tags: [
			"sad",
			"tear"
		]
	},
	{
		emoji: "😥",
		description: "disappointed but relieved face",
		category: "People",
		aliases: [
			"disappointed_relieved"
		],
		tags: [
			"phew",
			"sweat",
			"nervous"
		]
	},
	{
		emoji: "🤤",
		description: "drooling face",
		category: "People",
		aliases: [
			"drooling_face"
		],
		tags: [
		]
	},
	{
		emoji: "😭",
		description: "loudly crying face",
		category: "People",
		aliases: [
			"sob"
		],
		tags: [
			"sad",
			"cry",
			"bawling"
		]
	},
	{
		emoji: "😓",
		description: "face with cold sweat",
		category: "People",
		aliases: [
			"sweat"
		],
		tags: [
		]
	},
	{
		emoji: "😪",
		description: "sleepy face",
		category: "People",
		aliases: [
			"sleepy"
		],
		tags: [
			"tired"
		]
	},
	{
		emoji: "😴",
		description: "sleeping face",
		category: "People",
		aliases: [
			"sleeping"
		],
		tags: [
			"zzz"
		]
	},
	{
		emoji: "🙄",
		description: "face with rolling eyes",
		category: "People",
		aliases: [
			"roll_eyes"
		],
		tags: [
		]
	},
	{
		emoji: "🤔",
		description: "thinking face",
		category: "People",
		aliases: [
			"thinking"
		],
		tags: [
		]
	},
	{
		emoji: "🤥",
		description: "lying face",
		category: "People",
		aliases: [
			"lying_face"
		],
		tags: [
			"liar"
		]
	},
	{
		emoji: "😬",
		description: "grimacing face",
		category: "People",
		aliases: [
			"grimacing"
		],
		tags: [
		]
	},
	{
		emoji: "🤐",
		description: "zipper-mouth face",
		category: "People",
		aliases: [
			"zipper_mouth_face"
		],
		tags: [
			"silence",
			"hush"
		]
	},
	{
		emoji: "🤢",
		description: "nauseated face",
		category: "People",
		aliases: [
			"nauseated_face"
		],
		tags: [
			"sick",
			"barf",
			"disgusted"
		]
	},
	{
		emoji: "🤧",
		description: "sneezing face",
		category: "People",
		aliases: [
			"sneezing_face"
		],
		tags: [
			"achoo",
			"sick"
		]
	},
	{
		emoji: "😷",
		description: "face with medical mask",
		category: "People",
		aliases: [
			"mask"
		],
		tags: [
			"sick",
			"ill"
		]
	},
	{
		emoji: "🤒",
		description: "face with thermometer",
		category: "People",
		aliases: [
			"face_with_thermometer"
		],
		tags: [
			"sick"
		]
	},
	{
		emoji: "🤕",
		description: "face with head-bandage",
		category: "People",
		aliases: [
			"face_with_head_bandage"
		],
		tags: [
			"hurt"
		]
	},
	{
		emoji: "😈",
		description: "smiling face with horns",
		category: "People",
		aliases: [
			"smiling_imp"
		],
		tags: [
			"devil",
			"evil",
			"horns"
		]
	},
	{
		emoji: "👿",
		description: "angry face with horns",
		category: "People",
		aliases: [
			"imp"
		],
		tags: [
			"angry",
			"devil",
			"evil",
			"horns"
		]
	},
	{
		emoji: "👹",
		description: "ogre",
		category: "People",
		aliases: [
			"japanese_ogre"
		],
		tags: [
			"monster"
		]
	},
	{
		emoji: "👺",
		description: "goblin",
		category: "People",
		aliases: [
			"japanese_goblin"
		],
		tags: [
		]
	},
	{
		emoji: "💩",
		description: "pile of poo",
		category: "People",
		aliases: [
			"hankey",
			"poop",
			"shit"
		],
		tags: [
			"crap"
		]
	},
	{
		emoji: "👻",
		description: "ghost",
		category: "People",
		aliases: [
			"ghost"
		],
		tags: [
			"halloween"
		]
	},
	{
		emoji: "💀",
		description: "skull",
		category: "People",
		aliases: [
			"skull"
		],
		tags: [
			"dead",
			"danger",
			"poison"
		]
	},
	{
		emoji: "☠️",
		description: "skull and crossbones",
		category: "People",
		aliases: [
			"skull_and_crossbones"
		],
		tags: [
			"danger",
			"pirate"
		]
	},
	{
		emoji: "👽",
		description: "alien",
		category: "People",
		aliases: [
			"alien"
		],
		tags: [
			"ufo"
		]
	},
	{
		emoji: "👾",
		description: "alien monster",
		category: "People",
		aliases: [
			"space_invader"
		],
		tags: [
			"game",
			"retro"
		]
	},
	{
		emoji: "🤖",
		description: "robot face",
		category: "People",
		aliases: [
			"robot"
		],
		tags: [
		]
	},
	{
		emoji: "🎃",
		description: "jack-o-lantern",
		category: "People",
		aliases: [
			"jack_o_lantern"
		],
		tags: [
			"halloween"
		]
	},
	{
		emoji: "😺",
		description: "smiling cat face with open mouth",
		category: "People",
		aliases: [
			"smiley_cat"
		],
		tags: [
		]
	},
	{
		emoji: "😸",
		description: "grinning cat face with smiling eyes",
		category: "People",
		aliases: [
			"smile_cat"
		],
		tags: [
		]
	},
	{
		emoji: "😹",
		description: "cat face with tears of joy",
		category: "People",
		aliases: [
			"joy_cat"
		],
		tags: [
		]
	},
	{
		emoji: "😻",
		description: "smiling cat face with heart-eyes",
		category: "People",
		aliases: [
			"heart_eyes_cat"
		],
		tags: [
		]
	},
	{
		emoji: "😼",
		description: "cat face with wry smile",
		category: "People",
		aliases: [
			"smirk_cat"
		],
		tags: [
		]
	},
	{
		emoji: "😽",
		description: "kissing cat face with closed eyes",
		category: "People",
		aliases: [
			"kissing_cat"
		],
		tags: [
		]
	},
	{
		emoji: "🙀",
		description: "weary cat face",
		category: "People",
		aliases: [
			"scream_cat"
		],
		tags: [
			"horror"
		]
	},
	{
		emoji: "😿",
		description: "crying cat face",
		category: "People",
		aliases: [
			"crying_cat_face"
		],
		tags: [
			"sad",
			"tear"
		]
	},
	{
		emoji: "😾",
		description: "pouting cat face",
		category: "People",
		aliases: [
			"pouting_cat"
		],
		tags: [
		]
	},
	{
		emoji: "👐",
		description: "open hands",
		category: "People",
		aliases: [
			"open_hands"
		],
		tags: [
		]
	},
	{
		emoji: "🙌",
		description: "raising hands",
		category: "People",
		aliases: [
			"raised_hands"
		],
		tags: [
			"hooray"
		]
	},
	{
		emoji: "👏",
		description: "clapping hands",
		category: "People",
		aliases: [
			"clap"
		],
		tags: [
			"praise",
			"applause"
		]
	},
	{
		emoji: "🙏",
		description: "folded hands",
		category: "People",
		aliases: [
			"pray"
		],
		tags: [
			"please",
			"hope",
			"wish"
		]
	},
	{
		emoji: "🤝",
		description: "handshake",
		category: "People",
		aliases: [
			"handshake"
		],
		tags: [
			"deal"
		]
	},
	{
		emoji: "👍",
		description: "thumbs up",
		category: "People",
		aliases: [
			"+1",
			"thumbsup"
		],
		tags: [
			"approve",
			"ok"
		]
	},
	{
		emoji: "👎",
		description: "thumbs down",
		category: "People",
		aliases: [
			"-1",
			"thumbsdown"
		],
		tags: [
			"disapprove",
			"bury"
		]
	},
	{
		emoji: "👊",
		description: "oncoming fist",
		category: "People",
		aliases: [
			"fist_oncoming",
			"facepunch",
			"punch"
		],
		tags: [
			"attack"
		]
	},
	{
		emoji: "✊",
		description: "raised fist",
		category: "People",
		aliases: [
			"fist_raised",
			"fist"
		],
		tags: [
			"power"
		]
	},
	{
		emoji: "🤛",
		description: "left-facing fist",
		category: "People",
		aliases: [
			"fist_left"
		],
		tags: [
		]
	},
	{
		emoji: "🤜",
		description: "right-facing fist",
		category: "People",
		aliases: [
			"fist_right"
		],
		tags: [
		]
	},
	{
		emoji: "🤞",
		description: "crossed fingers",
		category: "People",
		aliases: [
			"crossed_fingers"
		],
		tags: [
			"luck",
			"hopeful"
		]
	},
	{
		emoji: "✌️",
		description: "victory hand",
		category: "People",
		aliases: [
			"v"
		],
		tags: [
			"victory",
			"peace"
		]
	},
	{
		emoji: "🤘",
		description: "sign of the horns",
		category: "People",
		aliases: [
			"metal"
		],
		tags: [
		]
	},
	{
		emoji: "👌",
		description: "OK hand",
		category: "People",
		aliases: [
			"ok_hand"
		],
		tags: [
		]
	},
	{
		emoji: "👈",
		description: "backhand index pointing left",
		category: "People",
		aliases: [
			"point_left"
		],
		tags: [
		]
	},
	{
		emoji: "👉",
		description: "backhand index pointing right",
		category: "People",
		aliases: [
			"point_right"
		],
		tags: [
		]
	},
	{
		emoji: "👆",
		description: "backhand index pointing up",
		category: "People",
		aliases: [
			"point_up_2"
		],
		tags: [
		]
	},
	{
		emoji: "👇",
		description: "backhand index pointing down",
		category: "People",
		aliases: [
			"point_down"
		],
		tags: [
		]
	},
	{
		emoji: "☝️",
		description: "index pointing up",
		category: "People",
		aliases: [
			"point_up"
		],
		tags: [
		]
	},
	{
		emoji: "✋",
		description: "raised hand",
		category: "People",
		aliases: [
			"hand",
			"raised_hand"
		],
		tags: [
			"highfive",
			"stop"
		]
	},
	{
		emoji: "🤚",
		description: "raised back of hand",
		category: "People",
		aliases: [
			"raised_back_of_hand"
		],
		tags: [
		]
	},
	{
		emoji: "🖐",
		description: "raised hand with fingers splayed",
		category: "People",
		aliases: [
			"raised_hand_with_fingers_splayed"
		],
		tags: [
		]
	},
	{
		emoji: "🖖",
		description: "vulcan salute",
		category: "People",
		aliases: [
			"vulcan_salute"
		],
		tags: [
			"prosper",
			"spock"
		]
	},
	{
		emoji: "👋",
		description: "waving hand",
		category: "People",
		aliases: [
			"wave"
		],
		tags: [
			"goodbye"
		]
	},
	{
		emoji: "🤙",
		description: "call me hand",
		category: "People",
		aliases: [
			"call_me_hand"
		],
		tags: [
		]
	},
	{
		emoji: "💪",
		description: "flexed biceps",
		category: "People",
		aliases: [
			"muscle"
		],
		tags: [
			"flex",
			"bicep",
			"strong",
			"workout"
		]
	},
	{
		emoji: "🖕",
		description: "middle finger",
		category: "People",
		aliases: [
			"middle_finger",
			"fu"
		],
		tags: [
		]
	},
	{
		emoji: "✍️",
		description: "writing hand",
		category: "People",
		aliases: [
			"writing_hand"
		],
		tags: [
		]
	},
	{
		emoji: "🤳",
		description: "selfie",
		category: "People",
		aliases: [
			"selfie"
		],
		tags: [
		]
	},
	{
		emoji: "💅",
		description: "nail polish",
		category: "People",
		aliases: [
			"nail_care"
		],
		tags: [
			"beauty",
			"manicure"
		]
	},
	{
		emoji: "💍",
		description: "ring",
		category: "People",
		aliases: [
			"ring"
		],
		tags: [
			"wedding",
			"marriage",
			"engaged"
		]
	},
	{
		emoji: "💄",
		description: "lipstick",
		category: "People",
		aliases: [
			"lipstick"
		],
		tags: [
			"makeup"
		]
	},
	{
		emoji: "💋",
		description: "kiss mark",
		category: "People",
		aliases: [
			"kiss"
		],
		tags: [
			"lipstick"
		]
	},
	{
		emoji: "👄",
		description: "mouth",
		category: "People",
		aliases: [
			"lips"
		],
		tags: [
			"kiss"
		]
	},
	{
		emoji: "👅",
		description: "tongue",
		category: "People",
		aliases: [
			"tongue"
		],
		tags: [
			"taste"
		]
	},
	{
		emoji: "👂",
		description: "ear",
		category: "People",
		aliases: [
			"ear"
		],
		tags: [
			"hear",
			"sound",
			"listen"
		]
	},
	{
		emoji: "👃",
		description: "nose",
		category: "People",
		aliases: [
			"nose"
		],
		tags: [
			"smell"
		]
	},
	{
		emoji: "👣",
		description: "footprints",
		category: "People",
		aliases: [
			"footprints"
		],
		tags: [
			"feet",
			"tracks"
		]
	},
	{
		emoji: "👁",
		description: "eye",
		category: "People",
		aliases: [
			"eye"
		],
		tags: [
		]
	},
	{
		emoji: "👀",
		description: "eyes",
		category: "People",
		aliases: [
			"eyes"
		],
		tags: [
			"look",
			"see",
			"watch"
		]
	},
	{
		emoji: "🗣",
		description: "speaking head",
		category: "People",
		aliases: [
			"speaking_head"
		],
		tags: [
		]
	},
	{
		emoji: "👤",
		description: "bust in silhouette",
		category: "People",
		aliases: [
			"bust_in_silhouette"
		],
		tags: [
			"user"
		]
	},
	{
		emoji: "👥",
		description: "busts in silhouette",
		category: "People",
		aliases: [
			"busts_in_silhouette"
		],
		tags: [
			"users",
			"group",
			"team"
		]
	},
	{
		emoji: "👶",
		description: "baby",
		category: "People",
		aliases: [
			"baby"
		],
		tags: [
			"child",
			"newborn"
		]
	},
	{
		emoji: "👦",
		description: "boy",
		category: "People",
		aliases: [
			"boy"
		],
		tags: [
			"child"
		]
	},
	{
		emoji: "👧",
		description: "girl",
		category: "People",
		aliases: [
			"girl"
		],
		tags: [
			"child"
		]
	},
	{
		emoji: "👨",
		description: "man",
		category: "People",
		aliases: [
			"man"
		],
		tags: [
			"mustache",
			"father",
			"dad"
		]
	},
	{
		emoji: "👩",
		description: "woman",
		category: "People",
		aliases: [
			"woman"
		],
		tags: [
			"girls"
		]
	},
	{
		emoji: "👱‍♀",
		description: "blond-haired woman",
		category: "People",
		aliases: [
			"blonde_woman"
		],
		tags: [
		]
	},
	{
		emoji: "👱",
		description: "blond-haired person",
		category: "People",
		aliases: [
			"blonde_man",
			"person_with_blond_hair"
		],
		tags: [
			"boy"
		]
	},
	{
		emoji: "👴",
		description: "old man",
		category: "People",
		aliases: [
			"older_man"
		],
		tags: [
		]
	},
	{
		emoji: "👵",
		description: "old woman",
		category: "People",
		aliases: [
			"older_woman"
		],
		tags: [
		]
	},
	{
		emoji: "👲",
		description: "man with Chinese cap",
		category: "People",
		aliases: [
			"man_with_gua_pi_mao"
		],
		tags: [
		]
	},
	{
		emoji: "👳‍♀",
		description: "woman wearing turban",
		category: "People",
		aliases: [
			"woman_with_turban"
		],
		tags: [
		]
	},
	{
		emoji: "👳",
		description: "person wearing turban",
		category: "People",
		aliases: [
			"man_with_turban"
		],
		tags: [
		]
	},
	{
		emoji: "👮‍♀",
		description: "woman police officer",
		category: "People",
		aliases: [
			"policewoman"
		],
		tags: [
			"police",
			"law",
			"cop"
		]
	},
	{
		emoji: "👮",
		description: "police officer",
		category: "People",
		aliases: [
			"policeman",
			"cop"
		],
		tags: [
			"police",
			"law"
		]
	},
	{
		emoji: "👷‍♀",
		description: "woman construction worker",
		category: "People",
		aliases: [
			"construction_worker_woman"
		],
		tags: [
		]
	},
	{
		emoji: "👷",
		description: "construction worker",
		category: "People",
		aliases: [
			"construction_worker_man",
			"construction_worker"
		],
		tags: [
			"helmet"
		]
	},
	{
		emoji: "💂‍♀",
		description: "woman guard",
		category: "People",
		aliases: [
			"guardswoman"
		],
		tags: [
		]
	},
	{
		emoji: "💂",
		description: "guard",
		category: "People",
		aliases: [
			"guardsman"
		],
		tags: [
		]
	},
	{
		emoji: "🕵️‍♀️",
		description: "woman detective",
		category: "People",
		aliases: [
			"female_detective"
		],
		tags: [
			"sleuth"
		]
	},
	{
		emoji: "🕵",
		description: "detective",
		category: "People",
		aliases: [
			"male_detective",
			"detective"
		],
		tags: [
			"sleuth"
		]
	},
	{
		emoji: "👩‍⚕",
		description: "woman health worker",
		category: "People",
		aliases: [
			"woman_health_worker"
		],
		tags: [
			"doctor",
			"nurse"
		]
	},
	{
		emoji: "👨‍⚕",
		description: "man health worker",
		category: "People",
		aliases: [
			"man_health_worker"
		],
		tags: [
			"doctor",
			"nurse"
		]
	},
	{
		emoji: "👩‍🌾",
		description: "woman farmer",
		category: "People",
		aliases: [
			"woman_farmer"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍🌾",
		description: "man farmer",
		category: "People",
		aliases: [
			"man_farmer"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍🍳",
		description: "woman cook",
		category: "People",
		aliases: [
			"woman_cook"
		],
		tags: [
			"chef"
		]
	},
	{
		emoji: "👨‍🍳",
		description: "man cook",
		category: "People",
		aliases: [
			"man_cook"
		],
		tags: [
			"chef"
		]
	},
	{
		emoji: "👩‍🎓",
		description: "woman student",
		category: "People",
		aliases: [
			"woman_student"
		],
		tags: [
			"graduation"
		]
	},
	{
		emoji: "👨‍🎓",
		description: "man student",
		category: "People",
		aliases: [
			"man_student"
		],
		tags: [
			"graduation"
		]
	},
	{
		emoji: "👩‍🎤",
		description: "woman singer",
		category: "People",
		aliases: [
			"woman_singer"
		],
		tags: [
			"rockstar"
		]
	},
	{
		emoji: "👨‍🎤",
		description: "man singer",
		category: "People",
		aliases: [
			"man_singer"
		],
		tags: [
			"rockstar"
		]
	},
	{
		emoji: "👩‍🏫",
		description: "woman teacher",
		category: "People",
		aliases: [
			"woman_teacher"
		],
		tags: [
			"school",
			"professor"
		]
	},
	{
		emoji: "👨‍🏫",
		description: "man teacher",
		category: "People",
		aliases: [
			"man_teacher"
		],
		tags: [
			"school",
			"professor"
		]
	},
	{
		emoji: "👩‍🏭",
		description: "woman factory worker",
		category: "People",
		aliases: [
			"woman_factory_worker"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍🏭",
		description: "man factory worker",
		category: "People",
		aliases: [
			"man_factory_worker"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍💻",
		description: "woman technologist",
		category: "People",
		aliases: [
			"woman_technologist"
		],
		tags: [
			"coder"
		]
	},
	{
		emoji: "👨‍💻",
		description: "man technologist",
		category: "People",
		aliases: [
			"man_technologist"
		],
		tags: [
			"coder"
		]
	},
	{
		emoji: "👩‍💼",
		description: "woman office worker",
		category: "People",
		aliases: [
			"woman_office_worker"
		],
		tags: [
			"business"
		]
	},
	{
		emoji: "👨‍💼",
		description: "man office worker",
		category: "People",
		aliases: [
			"man_office_worker"
		],
		tags: [
			"business"
		]
	},
	{
		emoji: "👩‍🔧",
		description: "woman mechanic",
		category: "People",
		aliases: [
			"woman_mechanic"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍🔧",
		description: "man mechanic",
		category: "People",
		aliases: [
			"man_mechanic"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍🔬",
		description: "woman scientist",
		category: "People",
		aliases: [
			"woman_scientist"
		],
		tags: [
			"research"
		]
	},
	{
		emoji: "👨‍🔬",
		description: "man scientist",
		category: "People",
		aliases: [
			"man_scientist"
		],
		tags: [
			"research"
		]
	},
	{
		emoji: "👩‍🎨",
		description: "woman artist",
		category: "People",
		aliases: [
			"woman_artist"
		],
		tags: [
			"painter"
		]
	},
	{
		emoji: "👨‍🎨",
		description: "man artist",
		category: "People",
		aliases: [
			"man_artist"
		],
		tags: [
			"painter"
		]
	},
	{
		emoji: "👩‍🚒",
		description: "woman firefighter",
		category: "People",
		aliases: [
			"woman_firefighter"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍🚒",
		description: "man firefighter",
		category: "People",
		aliases: [
			"man_firefighter"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍✈️",
		description: "woman pilot",
		category: "People",
		aliases: [
			"woman_pilot"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍✈️",
		description: "man pilot",
		category: "People",
		aliases: [
			"man_pilot"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍🚀",
		description: "woman astronaut",
		category: "People",
		aliases: [
			"woman_astronaut"
		],
		tags: [
			"space"
		]
	},
	{
		emoji: "👨‍🚀",
		description: "man astronaut",
		category: "People",
		aliases: [
			"man_astronaut"
		],
		tags: [
			"space"
		]
	},
	{
		emoji: "👩‍⚖️",
		description: "woman judge",
		category: "People",
		aliases: [
			"woman_judge"
		],
		tags: [
			"justice"
		]
	},
	{
		emoji: "👨‍⚖️",
		description: "man judge",
		category: "People",
		aliases: [
			"man_judge"
		],
		tags: [
			"justice"
		]
	},
	{
		emoji: "🤶",
		description: "Mrs. Claus",
		category: "People",
		aliases: [
			"mrs_claus"
		],
		tags: [
			"santa"
		]
	},
	{
		emoji: "🎅",
		description: "Santa Claus",
		category: "People",
		aliases: [
			"santa"
		],
		tags: [
			"christmas"
		]
	},
	{
		emoji: "👸",
		description: "princess",
		category: "People",
		aliases: [
			"princess"
		],
		tags: [
			"blonde",
			"crown",
			"royal"
		]
	},
	{
		emoji: "🤴",
		description: "prince",
		category: "People",
		aliases: [
			"prince"
		],
		tags: [
			"crown",
			"royal"
		]
	},
	{
		emoji: "👰",
		description: "bride with veil",
		category: "People",
		aliases: [
			"bride_with_veil"
		],
		tags: [
			"marriage",
			"wedding"
		]
	},
	{
		emoji: "🤵",
		description: "man in tuxedo",
		category: "People",
		aliases: [
			"man_in_tuxedo"
		],
		tags: [
			"groom",
			"marriage",
			"wedding"
		]
	},
	{
		emoji: "👼",
		description: "baby angel",
		category: "People",
		aliases: [
			"angel"
		],
		tags: [
		]
	},
	{
		emoji: "🤰",
		description: "pregnant woman",
		category: "People",
		aliases: [
			"pregnant_woman"
		],
		tags: [
		]
	},
	{
		emoji: "🙇‍♀",
		description: "woman bowing",
		category: "People",
		aliases: [
			"bowing_woman"
		],
		tags: [
			"respect",
			"thanks"
		]
	},
	{
		emoji: "🙇",
		description: "person bowing",
		category: "People",
		aliases: [
			"bowing_man",
			"bow"
		],
		tags: [
			"respect",
			"thanks"
		]
	},
	{
		emoji: "💁",
		description: "person tipping hand",
		category: "People",
		aliases: [
			"tipping_hand_woman",
			"information_desk_person",
			"sassy_woman"
		],
		tags: [
		]
	},
	{
		emoji: "💁‍♂",
		description: "man tipping hand",
		category: "People",
		aliases: [
			"tipping_hand_man",
			"sassy_man"
		],
		tags: [
			"information"
		]
	},
	{
		emoji: "🙅",
		description: "person gesturing NO",
		category: "People",
		aliases: [
			"no_good_woman",
			"no_good",
			"ng_woman"
		],
		tags: [
			"stop",
			"halt"
		]
	},
	{
		emoji: "🙅‍♂",
		description: "man gesturing NO",
		category: "People",
		aliases: [
			"no_good_man",
			"ng_man"
		],
		tags: [
			"stop",
			"halt"
		]
	},
	{
		emoji: "🙆",
		description: "person gesturing OK",
		category: "People",
		aliases: [
			"ok_woman"
		],
		tags: [
		]
	},
	{
		emoji: "🙆‍♂",
		description: "man gesturing OK",
		category: "People",
		aliases: [
			"ok_man"
		],
		tags: [
		]
	},
	{
		emoji: "🙋",
		description: "person raising hand",
		category: "People",
		aliases: [
			"raising_hand_woman",
			"raising_hand"
		],
		tags: [
		]
	},
	{
		emoji: "🙋‍♂",
		description: "man raising hand",
		category: "People",
		aliases: [
			"raising_hand_man"
		],
		tags: [
		]
	},
	{
		emoji: "🤦‍♀",
		description: "woman facepalming",
		category: "People",
		aliases: [
			"woman_facepalming"
		],
		tags: [
		]
	},
	{
		emoji: "🤦‍♂",
		description: "man facepalming",
		category: "People",
		aliases: [
			"man_facepalming"
		],
		tags: [
		]
	},
	{
		emoji: "🤷‍♀",
		description: "woman shrugging",
		category: "People",
		aliases: [
			"woman_shrugging"
		],
		tags: [
		]
	},
	{
		emoji: "🤷‍♂",
		description: "man shrugging",
		category: "People",
		aliases: [
			"man_shrugging"
		],
		tags: [
		]
	},
	{
		emoji: "🙎",
		description: "person pouting",
		category: "People",
		aliases: [
			"pouting_woman",
			"person_with_pouting_face"
		],
		tags: [
		]
	},
	{
		emoji: "🙎‍♂",
		description: "man pouting",
		category: "People",
		aliases: [
			"pouting_man"
		],
		tags: [
		]
	},
	{
		emoji: "🙍",
		description: "person frowning",
		category: "People",
		aliases: [
			"frowning_woman",
			"person_frowning"
		],
		tags: [
			"sad"
		]
	},
	{
		emoji: "🙍‍♂",
		description: "man frowning",
		category: "People",
		aliases: [
			"frowning_man"
		],
		tags: [
		]
	},
	{
		emoji: "💇",
		description: "person getting haircut",
		category: "People",
		aliases: [
			"haircut_woman",
			"haircut"
		],
		tags: [
			"beauty"
		]
	},
	{
		emoji: "💇‍♂",
		description: "man getting haircut",
		category: "People",
		aliases: [
			"haircut_man"
		],
		tags: [
		]
	},
	{
		emoji: "💆",
		description: "person getting massage",
		category: "People",
		aliases: [
			"massage_woman",
			"massage"
		],
		tags: [
			"spa"
		]
	},
	{
		emoji: "💆‍♂",
		description: "man getting massage",
		category: "People",
		aliases: [
			"massage_man"
		],
		tags: [
			"spa"
		]
	},
	{
		emoji: "🕴",
		description: "man in business suit levitating",
		category: "People",
		aliases: [
			"business_suit_levitating"
		],
		tags: [
		]
	},
	{
		emoji: "💃",
		description: "woman dancing",
		category: "People",
		aliases: [
			"dancer"
		],
		tags: [
			"dress"
		]
	},
	{
		emoji: "🕺",
		description: "man dancing",
		category: "People",
		aliases: [
			"man_dancing"
		],
		tags: [
			"dancer"
		]
	},
	{
		emoji: "👯",
		description: "people with bunny ears partying",
		category: "People",
		aliases: [
			"dancing_women",
			"dancers"
		],
		tags: [
			"bunny"
		]
	},
	{
		emoji: "👯‍♂",
		description: "men with bunny ears partying",
		category: "People",
		aliases: [
			"dancing_men"
		],
		tags: [
			"bunny"
		]
	},
	{
		emoji: "🚶‍♀",
		description: "woman walking",
		category: "People",
		aliases: [
			"walking_woman"
		],
		tags: [
		]
	},
	{
		emoji: "🚶",
		description: "person walking",
		category: "People",
		aliases: [
			"walking_man",
			"walking"
		],
		tags: [
		]
	},
	{
		emoji: "🏃‍♀",
		description: "woman running",
		category: "People",
		aliases: [
			"running_woman"
		],
		tags: [
			"exercise",
			"workout",
			"marathon"
		]
	},
	{
		emoji: "🏃",
		description: "person running",
		category: "People",
		aliases: [
			"running_man",
			"runner",
			"running"
		],
		tags: [
			"exercise",
			"workout",
			"marathon"
		]
	},
	{
		emoji: "👫",
		description: "man and woman holding hands",
		category: "People",
		aliases: [
			"couple"
		],
		tags: [
			"date"
		]
	},
	{
		emoji: "👭",
		description: "two women holding hands",
		category: "People",
		aliases: [
			"two_women_holding_hands"
		],
		tags: [
			"couple",
			"date"
		]
	},
	{
		emoji: "👬",
		description: "two men holding hands",
		category: "People",
		aliases: [
			"two_men_holding_hands"
		],
		tags: [
			"couple",
			"date"
		]
	},
	{
		emoji: "💑",
		description: "couple with heart",
		category: "People",
		aliases: [
			"couple_with_heart_woman_man",
			"couple_with_heart"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍❤️‍👩",
		description: "couple with heart: woman, woman",
		category: "People",
		aliases: [
			"couple_with_heart_woman_woman"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍❤️‍👨",
		description: "couple with heart: man, man",
		category: "People",
		aliases: [
			"couple_with_heart_man_man"
		],
		tags: [
		]
	},
	{
		emoji: "💏",
		description: "kiss",
		category: "People",
		aliases: [
			"couplekiss_man_woman"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍❤️‍💋‍👩",
		description: "kiss: woman, woman",
		category: "People",
		aliases: [
			"couplekiss_woman_woman"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍❤️‍💋‍👨",
		description: "kiss: man, man",
		category: "People",
		aliases: [
			"couplekiss_man_man"
		],
		tags: [
		]
	},
	{
		emoji: "👪",
		description: "family",
		category: "People",
		aliases: [
			"family_man_woman_boy",
			"family"
		],
		tags: [
			"home",
			"parents",
			"child"
		]
	},
	{
		emoji: "👨‍👩‍👧",
		description: "family: man, woman, girl",
		category: "People",
		aliases: [
			"family_man_woman_girl"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍👩‍👧‍👦",
		description: "family: man, woman, girl, boy",
		category: "People",
		aliases: [
			"family_man_woman_girl_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍👩‍👦‍👦",
		description: "family: man, woman, boy, boy",
		category: "People",
		aliases: [
			"family_man_woman_boy_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍👩‍👧‍👧",
		description: "family: man, woman, girl, girl",
		category: "People",
		aliases: [
			"family_man_woman_girl_girl"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍👩‍👦",
		description: "family: woman, woman, boy",
		category: "People",
		aliases: [
			"family_woman_woman_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍👩‍👧",
		description: "family: woman, woman, girl",
		category: "People",
		aliases: [
			"family_woman_woman_girl"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍👩‍👧‍👦",
		description: "family: woman, woman, girl, boy",
		category: "People",
		aliases: [
			"family_woman_woman_girl_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍👩‍👦‍👦",
		description: "family: woman, woman, boy, boy",
		category: "People",
		aliases: [
			"family_woman_woman_boy_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍👩‍👧‍👧",
		description: "family: woman, woman, girl, girl",
		category: "People",
		aliases: [
			"family_woman_woman_girl_girl"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍👨‍👦",
		description: "family: man, man, boy",
		category: "People",
		aliases: [
			"family_man_man_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍👨‍👧",
		description: "family: man, man, girl",
		category: "People",
		aliases: [
			"family_man_man_girl"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍👨‍👧‍👦",
		description: "family: man, man, girl, boy",
		category: "People",
		aliases: [
			"family_man_man_girl_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍👨‍👦‍👦",
		description: "family: man, man, boy, boy",
		category: "People",
		aliases: [
			"family_man_man_boy_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍👨‍👧‍👧",
		description: "family: man, man, girl, girl",
		category: "People",
		aliases: [
			"family_man_man_girl_girl"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍👦",
		description: "family: woman, boy",
		category: "People",
		aliases: [
			"family_woman_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍👧",
		description: "family: woman, girl",
		category: "People",
		aliases: [
			"family_woman_girl"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍👧‍👦",
		description: "family: woman, girl, boy",
		category: "People",
		aliases: [
			"family_woman_girl_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍👦‍👦",
		description: "family: woman, boy, boy",
		category: "People",
		aliases: [
			"family_woman_boy_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👩‍👧‍👧",
		description: "family: woman, girl, girl",
		category: "People",
		aliases: [
			"family_woman_girl_girl"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍👦",
		description: "family: man, boy",
		category: "People",
		aliases: [
			"family_man_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍👧",
		description: "family: man, girl",
		category: "People",
		aliases: [
			"family_man_girl"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍👧‍👦",
		description: "family: man, girl, boy",
		category: "People",
		aliases: [
			"family_man_girl_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍👦‍👦",
		description: "family: man, boy, boy",
		category: "People",
		aliases: [
			"family_man_boy_boy"
		],
		tags: [
		]
	},
	{
		emoji: "👨‍👧‍👧",
		description: "family: man, girl, girl",
		category: "People",
		aliases: [
			"family_man_girl_girl"
		],
		tags: [
		]
	},
	{
		emoji: "👚",
		description: "woman’s clothes",
		category: "People",
		aliases: [
			"womans_clothes"
		],
		tags: [
		]
	},
	{
		emoji: "👕",
		description: "t-shirt",
		category: "People",
		aliases: [
			"shirt",
			"tshirt"
		],
		tags: [
		]
	},
	{
		emoji: "👖",
		description: "jeans",
		category: "People",
		aliases: [
			"jeans"
		],
		tags: [
			"pants"
		]
	},
	{
		emoji: "👔",
		description: "necktie",
		category: "People",
		aliases: [
			"necktie"
		],
		tags: [
			"shirt",
			"formal"
		]
	},
	{
		emoji: "👗",
		description: "dress",
		category: "People",
		aliases: [
			"dress"
		],
		tags: [
		]
	},
	{
		emoji: "👙",
		description: "bikini",
		category: "People",
		aliases: [
			"bikini"
		],
		tags: [
			"beach"
		]
	},
	{
		emoji: "👘",
		description: "kimono",
		category: "People",
		aliases: [
			"kimono"
		],
		tags: [
		]
	},
	{
		emoji: "👠",
		description: "high-heeled shoe",
		category: "People",
		aliases: [
			"high_heel"
		],
		tags: [
			"shoe"
		]
	},
	{
		emoji: "👡",
		description: "woman’s sandal",
		category: "People",
		aliases: [
			"sandal"
		],
		tags: [
			"shoe"
		]
	},
	{
		emoji: "👢",
		description: "woman’s boot",
		category: "People",
		aliases: [
			"boot"
		],
		tags: [
		]
	},
	{
		emoji: "👞",
		description: "man’s shoe",
		category: "People",
		aliases: [
			"mans_shoe",
			"shoe"
		],
		tags: [
		]
	},
	{
		emoji: "👟",
		description: "running shoe",
		category: "People",
		aliases: [
			"athletic_shoe"
		],
		tags: [
			"sneaker",
			"sport",
			"running"
		]
	},
	{
		emoji: "👒",
		description: "woman’s hat",
		category: "People",
		aliases: [
			"womans_hat"
		],
		tags: [
		]
	},
	{
		emoji: "🎩",
		description: "top hat",
		category: "People",
		aliases: [
			"tophat"
		],
		tags: [
			"hat",
			"classy"
		]
	},
	{
		emoji: "🎓",
		description: "graduation cap",
		category: "People",
		aliases: [
			"mortar_board"
		],
		tags: [
			"education",
			"college",
			"university",
			"graduation"
		]
	},
	{
		emoji: "👑",
		description: "crown",
		category: "People",
		aliases: [
			"crown"
		],
		tags: [
			"king",
			"queen",
			"royal"
		]
	},
	{
		emoji: "⛑",
		description: "rescue worker’s helmet",
		category: "People",
		aliases: [
			"rescue_worker_helmet"
		],
		tags: [
		]
	},
	{
		emoji: "🎒",
		description: "school backpack",
		category: "People",
		aliases: [
			"school_satchel"
		],
		tags: [
		]
	},
	{
		emoji: "👝",
		description: "clutch bag",
		category: "People",
		aliases: [
			"pouch"
		],
		tags: [
			"bag"
		]
	},
	{
		emoji: "👛",
		description: "purse",
		category: "People",
		aliases: [
			"purse"
		],
		tags: [
		]
	},
	{
		emoji: "👜",
		description: "handbag",
		category: "People",
		aliases: [
			"handbag"
		],
		tags: [
			"bag"
		]
	},
	{
		emoji: "💼",
		description: "briefcase",
		category: "People",
		aliases: [
			"briefcase"
		],
		tags: [
			"business"
		]
	},
	{
		emoji: "👓",
		description: "glasses",
		category: "People",
		aliases: [
			"eyeglasses"
		],
		tags: [
			"glasses"
		]
	},
	{
		emoji: "🕶",
		description: "sunglasses",
		category: "People",
		aliases: [
			"dark_sunglasses"
		],
		tags: [
		]
	},
	{
		emoji: "🌂",
		description: "closed umbrella",
		category: "People",
		aliases: [
			"closed_umbrella"
		],
		tags: [
			"weather",
			"rain"
		]
	},
	{
		emoji: "☂️",
		description: "umbrella",
		category: "People",
		aliases: [
			"open_umbrella"
		],
		tags: [
		]
	},
	{
		emoji: "🐶",
		description: "dog face",
		category: "Nature",
		aliases: [
			"dog"
		],
		tags: [
			"pet"
		]
	},
	{
		emoji: "🐱",
		description: "cat face",
		category: "Nature",
		aliases: [
			"cat"
		],
		tags: [
			"pet"
		]
	},
	{
		emoji: "🐭",
		description: "mouse face",
		category: "Nature",
		aliases: [
			"mouse"
		],
		tags: [
		]
	},
	{
		emoji: "🐹",
		description: "hamster face",
		category: "Nature",
		aliases: [
			"hamster"
		],
		tags: [
			"pet"
		]
	},
	{
		emoji: "🐰",
		description: "rabbit face",
		category: "Nature",
		aliases: [
			"rabbit"
		],
		tags: [
			"bunny"
		]
	},
	{
		emoji: "🦊",
		description: "fox face",
		category: "Nature",
		aliases: [
			"fox_face"
		],
		tags: [
		]
	},
	{
		emoji: "🐻",
		description: "bear face",
		category: "Nature",
		aliases: [
			"bear"
		],
		tags: [
		]
	},
	{
		emoji: "🐼",
		description: "panda face",
		category: "Nature",
		aliases: [
			"panda_face"
		],
		tags: [
		]
	},
	{
		emoji: "🐨",
		description: "koala",
		category: "Nature",
		aliases: [
			"koala"
		],
		tags: [
		]
	},
	{
		emoji: "🐯",
		description: "tiger face",
		category: "Nature",
		aliases: [
			"tiger"
		],
		tags: [
		]
	},
	{
		emoji: "🦁",
		description: "lion face",
		category: "Nature",
		aliases: [
			"lion"
		],
		tags: [
		]
	},
	{
		emoji: "🐮",
		description: "cow face",
		category: "Nature",
		aliases: [
			"cow"
		],
		tags: [
		]
	},
	{
		emoji: "🐷",
		description: "pig face",
		category: "Nature",
		aliases: [
			"pig"
		],
		tags: [
		]
	},
	{
		emoji: "🐽",
		description: "pig nose",
		category: "Nature",
		aliases: [
			"pig_nose"
		],
		tags: [
		]
	},
	{
		emoji: "🐸",
		description: "frog face",
		category: "Nature",
		aliases: [
			"frog"
		],
		tags: [
		]
	},
	{
		emoji: "🐵",
		description: "monkey face",
		category: "Nature",
		aliases: [
			"monkey_face"
		],
		tags: [
		]
	},
	{
		emoji: "🙈",
		description: "see-no-evil monkey",
		category: "Nature",
		aliases: [
			"see_no_evil"
		],
		tags: [
			"monkey",
			"blind",
			"ignore"
		]
	},
	{
		emoji: "🙉",
		description: "hear-no-evil monkey",
		category: "Nature",
		aliases: [
			"hear_no_evil"
		],
		tags: [
			"monkey",
			"deaf"
		]
	},
	{
		emoji: "🙊",
		description: "speak-no-evil monkey",
		category: "Nature",
		aliases: [
			"speak_no_evil"
		],
		tags: [
			"monkey",
			"mute",
			"hush"
		]
	},
	{
		emoji: "🐒",
		description: "monkey",
		category: "Nature",
		aliases: [
			"monkey"
		],
		tags: [
		]
	},
	{
		emoji: "🐔",
		description: "chicken",
		category: "Nature",
		aliases: [
			"chicken"
		],
		tags: [
		]
	},
	{
		emoji: "🐧",
		description: "penguin",
		category: "Nature",
		aliases: [
			"penguin"
		],
		tags: [
		]
	},
	{
		emoji: "🐦",
		description: "bird",
		category: "Nature",
		aliases: [
			"bird"
		],
		tags: [
		]
	},
	{
		emoji: "🐤",
		description: "baby chick",
		category: "Nature",
		aliases: [
			"baby_chick"
		],
		tags: [
		]
	},
	{
		emoji: "🐣",
		description: "hatching chick",
		category: "Nature",
		aliases: [
			"hatching_chick"
		],
		tags: [
		]
	},
	{
		emoji: "🐥",
		description: "front-facing baby chick",
		category: "Nature",
		aliases: [
			"hatched_chick"
		],
		tags: [
		]
	},
	{
		emoji: "🦆",
		description: "duck",
		category: "Nature",
		aliases: [
			"duck"
		],
		tags: [
		]
	},
	{
		emoji: "🦅",
		description: "eagle",
		category: "Nature",
		aliases: [
			"eagle"
		],
		tags: [
		]
	},
	{
		emoji: "🦉",
		description: "owl",
		category: "Nature",
		aliases: [
			"owl"
		],
		tags: [
		]
	},
	{
		emoji: "🦇",
		description: "bat",
		category: "Nature",
		aliases: [
			"bat"
		],
		tags: [
		]
	},
	{
		emoji: "🐺",
		description: "wolf face",
		category: "Nature",
		aliases: [
			"wolf"
		],
		tags: [
		]
	},
	{
		emoji: "🐗",
		description: "boar",
		category: "Nature",
		aliases: [
			"boar"
		],
		tags: [
		]
	},
	{
		emoji: "🐴",
		description: "horse face",
		category: "Nature",
		aliases: [
			"horse"
		],
		tags: [
		]
	},
	{
		emoji: "🦄",
		description: "unicorn face",
		category: "Nature",
		aliases: [
			"unicorn"
		],
		tags: [
		]
	},
	{
		emoji: "🐝",
		description: "honeybee",
		category: "Nature",
		aliases: [
			"bee",
			"honeybee"
		],
		tags: [
		]
	},
	{
		emoji: "🐛",
		description: "bug",
		category: "Nature",
		aliases: [
			"bug"
		],
		tags: [
		]
	},
	{
		emoji: "🦋",
		description: "butterfly",
		category: "Nature",
		aliases: [
			"butterfly"
		],
		tags: [
		]
	},
	{
		emoji: "🐌",
		description: "snail",
		category: "Nature",
		aliases: [
			"snail"
		],
		tags: [
			"slow"
		]
	},
	{
		emoji: "🐚",
		description: "spiral shell",
		category: "Nature",
		aliases: [
			"shell"
		],
		tags: [
			"sea",
			"beach"
		]
	},
	{
		emoji: "🐞",
		description: "lady beetle",
		category: "Nature",
		aliases: [
			"beetle"
		],
		tags: [
			"bug"
		]
	},
	{
		emoji: "🐜",
		description: "ant",
		category: "Nature",
		aliases: [
			"ant"
		],
		tags: [
		]
	},
	{
		emoji: "🕷",
		description: "spider",
		category: "Nature",
		aliases: [
			"spider"
		],
		tags: [
		]
	},
	{
		emoji: "🕸",
		description: "spider web",
		category: "Nature",
		aliases: [
			"spider_web"
		],
		tags: [
		]
	},
	{
		emoji: "🐢",
		description: "turtle",
		category: "Nature",
		aliases: [
			"turtle"
		],
		tags: [
			"slow"
		]
	},
	{
		emoji: "🐍",
		description: "snake",
		category: "Nature",
		aliases: [
			"snake"
		],
		tags: [
		]
	},
	{
		emoji: "🦎",
		description: "lizard",
		category: "Nature",
		aliases: [
			"lizard"
		],
		tags: [
		]
	},
	{
		emoji: "🦂",
		description: "scorpion",
		category: "Nature",
		aliases: [
			"scorpion"
		],
		tags: [
		]
	},
	{
		emoji: "🦀",
		description: "crab",
		category: "Nature",
		aliases: [
			"crab"
		],
		tags: [
		]
	},
	{
		emoji: "🦑",
		description: "squid",
		category: "Nature",
		aliases: [
			"squid"
		],
		tags: [
		]
	},
	{
		emoji: "🐙",
		description: "octopus",
		category: "Nature",
		aliases: [
			"octopus"
		],
		tags: [
		]
	},
	{
		emoji: "🦐",
		description: "shrimp",
		category: "Nature",
		aliases: [
			"shrimp"
		],
		tags: [
		]
	},
	{
		emoji: "🐠",
		description: "tropical fish",
		category: "Nature",
		aliases: [
			"tropical_fish"
		],
		tags: [
		]
	},
	{
		emoji: "🐟",
		description: "fish",
		category: "Nature",
		aliases: [
			"fish"
		],
		tags: [
		]
	},
	{
		emoji: "🐡",
		description: "blowfish",
		category: "Nature",
		aliases: [
			"blowfish"
		],
		tags: [
		]
	},
	{
		emoji: "🐬",
		description: "dolphin",
		category: "Nature",
		aliases: [
			"dolphin",
			"flipper"
		],
		tags: [
		]
	},
	{
		emoji: "🦈",
		description: "shark",
		category: "Nature",
		aliases: [
			"shark"
		],
		tags: [
		]
	},
	{
		emoji: "🐳",
		description: "spouting whale",
		category: "Nature",
		aliases: [
			"whale"
		],
		tags: [
			"sea"
		]
	},
	{
		emoji: "🐋",
		description: "whale",
		category: "Nature",
		aliases: [
			"whale2"
		],
		tags: [
		]
	},
	{
		emoji: "🐊",
		description: "crocodile",
		category: "Nature",
		aliases: [
			"crocodile"
		],
		tags: [
		]
	},
	{
		emoji: "🐆",
		description: "leopard",
		category: "Nature",
		aliases: [
			"leopard"
		],
		tags: [
		]
	},
	{
		emoji: "🐅",
		description: "tiger",
		category: "Nature",
		aliases: [
			"tiger2"
		],
		tags: [
		]
	},
	{
		emoji: "🐃",
		description: "water buffalo",
		category: "Nature",
		aliases: [
			"water_buffalo"
		],
		tags: [
		]
	},
	{
		emoji: "🐂",
		description: "ox",
		category: "Nature",
		aliases: [
			"ox"
		],
		tags: [
		]
	},
	{
		emoji: "🐄",
		description: "cow",
		category: "Nature",
		aliases: [
			"cow2"
		],
		tags: [
		]
	},
	{
		emoji: "🦌",
		description: "deer",
		category: "Nature",
		aliases: [
			"deer"
		],
		tags: [
		]
	},
	{
		emoji: "🐪",
		description: "camel",
		category: "Nature",
		aliases: [
			"dromedary_camel"
		],
		tags: [
			"desert"
		]
	},
	{
		emoji: "🐫",
		description: "two-hump camel",
		category: "Nature",
		aliases: [
			"camel"
		],
		tags: [
		]
	},
	{
		emoji: "🐘",
		description: "elephant",
		category: "Nature",
		aliases: [
			"elephant"
		],
		tags: [
		]
	},
	{
		emoji: "🦏",
		description: "rhinoceros",
		category: "Nature",
		aliases: [
			"rhinoceros"
		],
		tags: [
		]
	},
	{
		emoji: "🦍",
		description: "gorilla",
		category: "Nature",
		aliases: [
			"gorilla"
		],
		tags: [
		]
	},
	{
		emoji: "🐎",
		description: "horse",
		category: "Nature",
		aliases: [
			"racehorse"
		],
		tags: [
			"speed"
		]
	},
	{
		emoji: "🐖",
		description: "pig",
		category: "Nature",
		aliases: [
			"pig2"
		],
		tags: [
		]
	},
	{
		emoji: "🐐",
		description: "goat",
		category: "Nature",
		aliases: [
			"goat"
		],
		tags: [
		]
	},
	{
		emoji: "🐏",
		description: "ram",
		category: "Nature",
		aliases: [
			"ram"
		],
		tags: [
		]
	},
	{
		emoji: "🐑",
		description: "sheep",
		category: "Nature",
		aliases: [
			"sheep"
		],
		tags: [
		]
	},
	{
		emoji: "🐕",
		description: "dog",
		category: "Nature",
		aliases: [
			"dog2"
		],
		tags: [
		]
	},
	{
		emoji: "🐩",
		description: "poodle",
		category: "Nature",
		aliases: [
			"poodle"
		],
		tags: [
			"dog"
		]
	},
	{
		emoji: "🐈",
		description: "cat",
		category: "Nature",
		aliases: [
			"cat2"
		],
		tags: [
		]
	},
	{
		emoji: "🐓",
		description: "rooster",
		category: "Nature",
		aliases: [
			"rooster"
		],
		tags: [
		]
	},
	{
		emoji: "🦃",
		description: "turkey",
		category: "Nature",
		aliases: [
			"turkey"
		],
		tags: [
			"thanksgiving"
		]
	},
	{
		emoji: "🕊",
		description: "dove",
		category: "Nature",
		aliases: [
			"dove"
		],
		tags: [
			"peace"
		]
	},
	{
		emoji: "🐇",
		description: "rabbit",
		category: "Nature",
		aliases: [
			"rabbit2"
		],
		tags: [
		]
	},
	{
		emoji: "🐁",
		description: "mouse",
		category: "Nature",
		aliases: [
			"mouse2"
		],
		tags: [
		]
	},
	{
		emoji: "🐀",
		description: "rat",
		category: "Nature",
		aliases: [
			"rat"
		],
		tags: [
		]
	},
	{
		emoji: "🐿",
		description: "chipmunk",
		category: "Nature",
		aliases: [
			"chipmunk"
		],
		tags: [
		]
	},
	{
		emoji: "🐾",
		description: "paw prints",
		category: "Nature",
		aliases: [
			"feet",
			"paw_prints"
		],
		tags: [
		]
	},
	{
		emoji: "🐉",
		description: "dragon",
		category: "Nature",
		aliases: [
			"dragon"
		],
		tags: [
		]
	},
	{
		emoji: "🐲",
		description: "dragon face",
		category: "Nature",
		aliases: [
			"dragon_face"
		],
		tags: [
		]
	},
	{
		emoji: "🌵",
		description: "cactus",
		category: "Nature",
		aliases: [
			"cactus"
		],
		tags: [
		]
	},
	{
		emoji: "🎄",
		description: "Christmas tree",
		category: "Nature",
		aliases: [
			"christmas_tree"
		],
		tags: [
		]
	},
	{
		emoji: "🌲",
		description: "evergreen tree",
		category: "Nature",
		aliases: [
			"evergreen_tree"
		],
		tags: [
			"wood"
		]
	},
	{
		emoji: "🌳",
		description: "deciduous tree",
		category: "Nature",
		aliases: [
			"deciduous_tree"
		],
		tags: [
			"wood"
		]
	},
	{
		emoji: "🌴",
		description: "palm tree",
		category: "Nature",
		aliases: [
			"palm_tree"
		],
		tags: [
		]
	},
	{
		emoji: "🌱",
		description: "seedling",
		category: "Nature",
		aliases: [
			"seedling"
		],
		tags: [
			"plant"
		]
	},
	{
		emoji: "🌿",
		description: "herb",
		category: "Nature",
		aliases: [
			"herb"
		],
		tags: [
		]
	},
	{
		emoji: "☘️",
		description: "shamrock",
		category: "Nature",
		aliases: [
			"shamrock"
		],
		tags: [
		]
	},
	{
		emoji: "🍀",
		description: "four leaf clover",
		category: "Nature",
		aliases: [
			"four_leaf_clover"
		],
		tags: [
			"luck"
		]
	},
	{
		emoji: "🎍",
		description: "pine decoration",
		category: "Nature",
		aliases: [
			"bamboo"
		],
		tags: [
		]
	},
	{
		emoji: "🎋",
		description: "tanabata tree",
		category: "Nature",
		aliases: [
			"tanabata_tree"
		],
		tags: [
		]
	},
	{
		emoji: "🍃",
		description: "leaf fluttering in wind",
		category: "Nature",
		aliases: [
			"leaves"
		],
		tags: [
			"leaf"
		]
	},
	{
		emoji: "🍂",
		description: "fallen leaf",
		category: "Nature",
		aliases: [
			"fallen_leaf"
		],
		tags: [
			"autumn"
		]
	},
	{
		emoji: "🍁",
		description: "maple leaf",
		category: "Nature",
		aliases: [
			"maple_leaf"
		],
		tags: [
			"canada"
		]
	},
	{
		emoji: "🍄",
		description: "mushroom",
		category: "Nature",
		aliases: [
			"mushroom"
		],
		tags: [
		]
	},
	{
		emoji: "🌾",
		description: "sheaf of rice",
		category: "Nature",
		aliases: [
			"ear_of_rice"
		],
		tags: [
		]
	},
	{
		emoji: "💐",
		description: "bouquet",
		category: "Nature",
		aliases: [
			"bouquet"
		],
		tags: [
			"flowers"
		]
	},
	{
		emoji: "🌷",
		description: "tulip",
		category: "Nature",
		aliases: [
			"tulip"
		],
		tags: [
			"flower"
		]
	},
	{
		emoji: "🌹",
		description: "rose",
		category: "Nature",
		aliases: [
			"rose"
		],
		tags: [
			"flower"
		]
	},
	{
		emoji: "🥀",
		description: "wilted flower",
		category: "Nature",
		aliases: [
			"wilted_flower"
		],
		tags: [
		]
	},
	{
		emoji: "🌻",
		description: "sunflower",
		category: "Nature",
		aliases: [
			"sunflower"
		],
		tags: [
		]
	},
	{
		emoji: "🌼",
		description: "blossom",
		category: "Nature",
		aliases: [
			"blossom"
		],
		tags: [
		]
	},
	{
		emoji: "🌸",
		description: "cherry blossom",
		category: "Nature",
		aliases: [
			"cherry_blossom"
		],
		tags: [
			"flower",
			"spring"
		]
	},
	{
		emoji: "🌺",
		description: "hibiscus",
		category: "Nature",
		aliases: [
			"hibiscus"
		],
		tags: [
		]
	},
	{
		emoji: "🌎",
		description: "globe showing Americas",
		category: "Nature",
		aliases: [
			"earth_americas"
		],
		tags: [
			"globe",
			"world",
			"international"
		]
	},
	{
		emoji: "🌍",
		description: "globe showing Europe-Africa",
		category: "Nature",
		aliases: [
			"earth_africa"
		],
		tags: [
			"globe",
			"world",
			"international"
		]
	},
	{
		emoji: "🌏",
		description: "globe showing Asia-Australia",
		category: "Nature",
		aliases: [
			"earth_asia"
		],
		tags: [
			"globe",
			"world",
			"international"
		]
	},
	{
		emoji: "🌕",
		description: "full moon",
		category: "Nature",
		aliases: [
			"full_moon"
		],
		tags: [
		]
	},
	{
		emoji: "🌖",
		description: "waning gibbous moon",
		category: "Nature",
		aliases: [
			"waning_gibbous_moon"
		],
		tags: [
		]
	},
	{
		emoji: "🌗",
		description: "last quarter moon",
		category: "Nature",
		aliases: [
			"last_quarter_moon"
		],
		tags: [
		]
	},
	{
		emoji: "🌘",
		description: "waning crescent moon",
		category: "Nature",
		aliases: [
			"waning_crescent_moon"
		],
		tags: [
		]
	},
	{
		emoji: "🌑",
		description: "new moon",
		category: "Nature",
		aliases: [
			"new_moon"
		],
		tags: [
		]
	},
	{
		emoji: "🌒",
		description: "waxing crescent moon",
		category: "Nature",
		aliases: [
			"waxing_crescent_moon"
		],
		tags: [
		]
	},
	{
		emoji: "🌓",
		description: "first quarter moon",
		category: "Nature",
		aliases: [
			"first_quarter_moon"
		],
		tags: [
		]
	},
	{
		emoji: "🌔",
		description: "waxing gibbous moon",
		category: "Nature",
		aliases: [
			"moon",
			"waxing_gibbous_moon"
		],
		tags: [
		]
	},
	{
		emoji: "🌚",
		description: "new moon face",
		category: "Nature",
		aliases: [
			"new_moon_with_face"
		],
		tags: [
		]
	},
	{
		emoji: "🌝",
		description: "full moon with face",
		category: "Nature",
		aliases: [
			"full_moon_with_face"
		],
		tags: [
		]
	},
	{
		emoji: "🌞",
		description: "sun with face",
		category: "Nature",
		aliases: [
			"sun_with_face"
		],
		tags: [
			"summer"
		]
	},
	{
		emoji: "🌛",
		description: "first quarter moon with face",
		category: "Nature",
		aliases: [
			"first_quarter_moon_with_face"
		],
		tags: [
		]
	},
	{
		emoji: "🌜",
		description: "last quarter moon with face",
		category: "Nature",
		aliases: [
			"last_quarter_moon_with_face"
		],
		tags: [
		]
	},
	{
		emoji: "🌙",
		description: "crescent moon",
		category: "Nature",
		aliases: [
			"crescent_moon"
		],
		tags: [
			"night"
		]
	},
	{
		emoji: "💫",
		description: "dizzy",
		category: "Nature",
		aliases: [
			"dizzy"
		],
		tags: [
			"star"
		]
	},
	{
		emoji: "⭐️",
		description: "white medium star",
		category: "Nature",
		aliases: [
			"star"
		],
		tags: [
		]
	},
	{
		emoji: "🌟",
		description: "glowing star",
		category: "Nature",
		aliases: [
			"star2"
		],
		tags: [
		]
	},
	{
		emoji: "✨",
		description: "sparkles",
		category: "Nature",
		aliases: [
			"sparkles"
		],
		tags: [
			"shiny"
		]
	},
	{
		emoji: "⚡️",
		description: "high voltage",
		category: "Nature",
		aliases: [
			"zap"
		],
		tags: [
			"lightning",
			"thunder"
		]
	},
	{
		emoji: "🔥",
		description: "fire",
		category: "Nature",
		aliases: [
			"fire"
		],
		tags: [
			"burn"
		]
	},
	{
		emoji: "💥",
		description: "collision",
		category: "Nature",
		aliases: [
			"boom",
			"collision"
		],
		tags: [
			"explode"
		]
	},
	{
		emoji: "☄",
		description: "comet",
		category: "Nature",
		aliases: [
			"comet"
		],
		tags: [
		]
	},
	{
		emoji: "☀️",
		description: "sun",
		category: "Nature",
		aliases: [
			"sunny"
		],
		tags: [
			"weather"
		]
	},
	{
		emoji: "🌤",
		description: "sun behind small cloud",
		category: "Nature",
		aliases: [
			"sun_behind_small_cloud"
		],
		tags: [
		]
	},
	{
		emoji: "⛅️",
		description: "sun behind cloud",
		category: "Nature",
		aliases: [
			"partly_sunny"
		],
		tags: [
			"weather",
			"cloud"
		]
	},
	{
		emoji: "🌥",
		description: "sun behind large cloud",
		category: "Nature",
		aliases: [
			"sun_behind_large_cloud"
		],
		tags: [
		]
	},
	{
		emoji: "🌦",
		description: "sun behind rain cloud",
		category: "Nature",
		aliases: [
			"sun_behind_rain_cloud"
		],
		tags: [
		]
	},
	{
		emoji: "🌈",
		description: "rainbow",
		category: "Nature",
		aliases: [
			"rainbow"
		],
		tags: [
		]
	},
	{
		emoji: "☁️",
		description: "cloud",
		category: "Nature",
		aliases: [
			"cloud"
		],
		tags: [
		]
	},
	{
		emoji: "🌧",
		description: "cloud with rain",
		category: "Nature",
		aliases: [
			"cloud_with_rain"
		],
		tags: [
		]
	},
	{
		emoji: "⛈",
		description: "cloud with lightning and rain",
		category: "Nature",
		aliases: [
			"cloud_with_lightning_and_rain"
		],
		tags: [
		]
	},
	{
		emoji: "🌩",
		description: "cloud with lightning",
		category: "Nature",
		aliases: [
			"cloud_with_lightning"
		],
		tags: [
		]
	},
	{
		emoji: "🌨",
		description: "cloud with snow",
		category: "Nature",
		aliases: [
			"cloud_with_snow"
		],
		tags: [
		]
	},
	{
		emoji: "☃️",
		description: "snowman",
		category: "Nature",
		aliases: [
			"snowman_with_snow"
		],
		tags: [
			"winter",
			"christmas"
		]
	},
	{
		emoji: "⛄️",
		description: "snowman without snow",
		category: "Nature",
		aliases: [
			"snowman"
		],
		tags: [
			"winter"
		]
	},
	{
		emoji: "❄️",
		description: "snowflake",
		category: "Nature",
		aliases: [
			"snowflake"
		],
		tags: [
			"winter",
			"cold",
			"weather"
		]
	},
	{
		emoji: "🌬",
		description: "wind face",
		category: "Nature",
		aliases: [
			"wind_face"
		],
		tags: [
		]
	},
	{
		emoji: "💨",
		description: "dashing away",
		category: "Nature",
		aliases: [
			"dash"
		],
		tags: [
			"wind",
			"blow",
			"fast"
		]
	},
	{
		emoji: "🌪",
		description: "tornado",
		category: "Nature",
		aliases: [
			"tornado"
		],
		tags: [
		]
	},
	{
		emoji: "🌫",
		description: "fog",
		category: "Nature",
		aliases: [
			"fog"
		],
		tags: [
		]
	},
	{
		emoji: "🌊",
		description: "water wave",
		category: "Nature",
		aliases: [
			"ocean"
		],
		tags: [
			"sea"
		]
	},
	{
		emoji: "💧",
		description: "droplet",
		category: "Nature",
		aliases: [
			"droplet"
		],
		tags: [
			"water"
		]
	},
	{
		emoji: "💦",
		description: "sweat droplets",
		category: "Nature",
		aliases: [
			"sweat_drops"
		],
		tags: [
			"water",
			"workout"
		]
	},
	{
		emoji: "☔️",
		description: "umbrella with rain drops",
		category: "Nature",
		aliases: [
			"umbrella"
		],
		tags: [
			"rain",
			"weather"
		]
	},
	{
		emoji: "🍏",
		description: "green apple",
		category: "Foods",
		aliases: [
			"green_apple"
		],
		tags: [
			"fruit"
		]
	},
	{
		emoji: "🍎",
		description: "red apple",
		category: "Foods",
		aliases: [
			"apple"
		],
		tags: [
		]
	},
	{
		emoji: "🍐",
		description: "pear",
		category: "Foods",
		aliases: [
			"pear"
		],
		tags: [
		]
	},
	{
		emoji: "🍊",
		description: "tangerine",
		category: "Foods",
		aliases: [
			"tangerine",
			"orange",
			"mandarin"
		],
		tags: [
		]
	},
	{
		emoji: "🍋",
		description: "lemon",
		category: "Foods",
		aliases: [
			"lemon"
		],
		tags: [
		]
	},
	{
		emoji: "🍌",
		description: "banana",
		category: "Foods",
		aliases: [
			"banana"
		],
		tags: [
			"fruit"
		]
	},
	{
		emoji: "🍉",
		description: "watermelon",
		category: "Foods",
		aliases: [
			"watermelon"
		],
		tags: [
		]
	},
	{
		emoji: "🍇",
		description: "grapes",
		category: "Foods",
		aliases: [
			"grapes"
		],
		tags: [
		]
	},
	{
		emoji: "🍓",
		description: "strawberry",
		category: "Foods",
		aliases: [
			"strawberry"
		],
		tags: [
			"fruit"
		]
	},
	{
		emoji: "🍈",
		description: "melon",
		category: "Foods",
		aliases: [
			"melon"
		],
		tags: [
		]
	},
	{
		emoji: "🍒",
		description: "cherries",
		category: "Foods",
		aliases: [
			"cherries"
		],
		tags: [
			"fruit"
		]
	},
	{
		emoji: "🍑",
		description: "peach",
		category: "Foods",
		aliases: [
			"peach"
		],
		tags: [
		]
	},
	{
		emoji: "🍍",
		description: "pineapple",
		category: "Foods",
		aliases: [
			"pineapple"
		],
		tags: [
		]
	},
	{
		emoji: "🥝",
		description: "kiwi fruit",
		category: "Foods",
		aliases: [
			"kiwi_fruit"
		],
		tags: [
		]
	},
	{
		emoji: "🥑",
		description: "avocado",
		category: "Foods",
		aliases: [
			"avocado"
		],
		tags: [
		]
	},
	{
		emoji: "🍅",
		description: "tomato",
		category: "Foods",
		aliases: [
			"tomato"
		],
		tags: [
		]
	},
	{
		emoji: "🍆",
		description: "eggplant",
		category: "Foods",
		aliases: [
			"eggplant"
		],
		tags: [
			"aubergine"
		]
	},
	{
		emoji: "🥒",
		description: "cucumber",
		category: "Foods",
		aliases: [
			"cucumber"
		],
		tags: [
		]
	},
	{
		emoji: "🥕",
		description: "carrot",
		category: "Foods",
		aliases: [
			"carrot"
		],
		tags: [
		]
	},
	{
		emoji: "🌽",
		description: "ear of corn",
		category: "Foods",
		aliases: [
			"corn"
		],
		tags: [
		]
	},
	{
		emoji: "🌶",
		description: "hot pepper",
		category: "Foods",
		aliases: [
			"hot_pepper"
		],
		tags: [
			"spicy"
		]
	},
	{
		emoji: "🥔",
		description: "potato",
		category: "Foods",
		aliases: [
			"potato"
		],
		tags: [
		]
	},
	{
		emoji: "🍠",
		description: "roasted sweet potato",
		category: "Foods",
		aliases: [
			"sweet_potato"
		],
		tags: [
		]
	},
	{
		emoji: "🌰",
		description: "chestnut",
		category: "Foods",
		aliases: [
			"chestnut"
		],
		tags: [
		]
	},
	{
		emoji: "🥜",
		description: "peanuts",
		category: "Foods",
		aliases: [
			"peanuts"
		],
		tags: [
		]
	},
	{
		emoji: "🍯",
		description: "honey pot",
		category: "Foods",
		aliases: [
			"honey_pot"
		],
		tags: [
		]
	},
	{
		emoji: "🥐",
		description: "croissant",
		category: "Foods",
		aliases: [
			"croissant"
		],
		tags: [
		]
	},
	{
		emoji: "🍞",
		description: "bread",
		category: "Foods",
		aliases: [
			"bread"
		],
		tags: [
			"toast"
		]
	},
	{
		emoji: "🥖",
		description: "baguette bread",
		category: "Foods",
		aliases: [
			"baguette_bread"
		],
		tags: [
		]
	},
	{
		emoji: "🧀",
		description: "cheese wedge",
		category: "Foods",
		aliases: [
			"cheese"
		],
		tags: [
		]
	},
	{
		emoji: "🥚",
		description: "egg",
		category: "Foods",
		aliases: [
			"egg"
		],
		tags: [
		]
	},
	{
		emoji: "🍳",
		description: "cooking",
		category: "Foods",
		aliases: [
			"fried_egg"
		],
		tags: [
			"breakfast"
		]
	},
	{
		emoji: "🥓",
		description: "bacon",
		category: "Foods",
		aliases: [
			"bacon"
		],
		tags: [
		]
	},
	{
		emoji: "🥞",
		description: "pancakes",
		category: "Foods",
		aliases: [
			"pancakes"
		],
		tags: [
		]
	},
	{
		emoji: "🍤",
		description: "fried shrimp",
		category: "Foods",
		aliases: [
			"fried_shrimp"
		],
		tags: [
			"tempura"
		]
	},
	{
		emoji: "🍗",
		description: "poultry leg",
		category: "Foods",
		aliases: [
			"poultry_leg"
		],
		tags: [
			"meat",
			"chicken"
		]
	},
	{
		emoji: "🍖",
		description: "meat on bone",
		category: "Foods",
		aliases: [
			"meat_on_bone"
		],
		tags: [
		]
	},
	{
		emoji: "🍕",
		description: "pizza",
		category: "Foods",
		aliases: [
			"pizza"
		],
		tags: [
		]
	},
	{
		emoji: "🌭",
		description: "hot dog",
		category: "Foods",
		aliases: [
			"hotdog"
		],
		tags: [
		]
	},
	{
		emoji: "🍔",
		description: "hamburger",
		category: "Foods",
		aliases: [
			"hamburger"
		],
		tags: [
			"burger"
		]
	},
	{
		emoji: "🍟",
		description: "french fries",
		category: "Foods",
		aliases: [
			"fries"
		],
		tags: [
		]
	},
	{
		emoji: "🥙",
		description: "stuffed flatbread",
		category: "Foods",
		aliases: [
			"stuffed_flatbread"
		],
		tags: [
		]
	},
	{
		emoji: "🌮",
		description: "taco",
		category: "Foods",
		aliases: [
			"taco"
		],
		tags: [
		]
	},
	{
		emoji: "🌯",
		description: "burrito",
		category: "Foods",
		aliases: [
			"burrito"
		],
		tags: [
		]
	},
	{
		emoji: "🥗",
		description: "green salad",
		category: "Foods",
		aliases: [
			"green_salad"
		],
		tags: [
		]
	},
	{
		emoji: "🥘",
		description: "shallow pan of food",
		category: "Foods",
		aliases: [
			"shallow_pan_of_food"
		],
		tags: [
			"paella",
			"curry"
		]
	},
	{
		emoji: "🍝",
		description: "spaghetti",
		category: "Foods",
		aliases: [
			"spaghetti"
		],
		tags: [
			"pasta"
		]
	},
	{
		emoji: "🍜",
		description: "steaming bowl",
		category: "Foods",
		aliases: [
			"ramen"
		],
		tags: [
			"noodle"
		]
	},
	{
		emoji: "🍲",
		description: "pot of food",
		category: "Foods",
		aliases: [
			"stew"
		],
		tags: [
		]
	},
	{
		emoji: "🍥",
		description: "fish cake with swirl",
		category: "Foods",
		aliases: [
			"fish_cake"
		],
		tags: [
		]
	},
	{
		emoji: "🍣",
		description: "sushi",
		category: "Foods",
		aliases: [
			"sushi"
		],
		tags: [
		]
	},
	{
		emoji: "🍱",
		description: "bento box",
		category: "Foods",
		aliases: [
			"bento"
		],
		tags: [
		]
	},
	{
		emoji: "🍛",
		description: "curry rice",
		category: "Foods",
		aliases: [
			"curry"
		],
		tags: [
		]
	},
	{
		emoji: "🍚",
		description: "cooked rice",
		category: "Foods",
		aliases: [
			"rice"
		],
		tags: [
		]
	},
	{
		emoji: "🍙",
		description: "rice ball",
		category: "Foods",
		aliases: [
			"rice_ball"
		],
		tags: [
		]
	},
	{
		emoji: "🍘",
		description: "rice cracker",
		category: "Foods",
		aliases: [
			"rice_cracker"
		],
		tags: [
		]
	},
	{
		emoji: "🍢",
		description: "oden",
		category: "Foods",
		aliases: [
			"oden"
		],
		tags: [
		]
	},
	{
		emoji: "🍡",
		description: "dango",
		category: "Foods",
		aliases: [
			"dango"
		],
		tags: [
		]
	},
	{
		emoji: "🍧",
		description: "shaved ice",
		category: "Foods",
		aliases: [
			"shaved_ice"
		],
		tags: [
		]
	},
	{
		emoji: "🍨",
		description: "ice cream",
		category: "Foods",
		aliases: [
			"ice_cream"
		],
		tags: [
		]
	},
	{
		emoji: "🍦",
		description: "soft ice cream",
		category: "Foods",
		aliases: [
			"icecream"
		],
		tags: [
		]
	},
	{
		emoji: "🍰",
		description: "shortcake",
		category: "Foods",
		aliases: [
			"cake"
		],
		tags: [
			"dessert"
		]
	},
	{
		emoji: "🎂",
		description: "birthday cake",
		category: "Foods",
		aliases: [
			"birthday"
		],
		tags: [
			"party"
		]
	},
	{
		emoji: "🍮",
		description: "custard",
		category: "Foods",
		aliases: [
			"custard"
		],
		tags: [
		]
	},
	{
		emoji: "🍭",
		description: "lollipop",
		category: "Foods",
		aliases: [
			"lollipop"
		],
		tags: [
		]
	},
	{
		emoji: "🍬",
		description: "candy",
		category: "Foods",
		aliases: [
			"candy"
		],
		tags: [
			"sweet"
		]
	},
	{
		emoji: "🍫",
		description: "chocolate bar",
		category: "Foods",
		aliases: [
			"chocolate_bar"
		],
		tags: [
		]
	},
	{
		emoji: "🍿",
		description: "popcorn",
		category: "Foods",
		aliases: [
			"popcorn"
		],
		tags: [
		]
	},
	{
		emoji: "🍩",
		description: "doughnut",
		category: "Foods",
		aliases: [
			"doughnut"
		],
		tags: [
		]
	},
	{
		emoji: "🍪",
		description: "cookie",
		category: "Foods",
		aliases: [
			"cookie"
		],
		tags: [
		]
	},
	{
		emoji: "🥛",
		description: "glass of milk",
		category: "Foods",
		aliases: [
			"milk_glass"
		],
		tags: [
		]
	},
	{
		emoji: "🍼",
		description: "baby bottle",
		category: "Foods",
		aliases: [
			"baby_bottle"
		],
		tags: [
			"milk"
		]
	},
	{
		emoji: "☕️",
		description: "hot beverage",
		category: "Foods",
		aliases: [
			"coffee"
		],
		tags: [
			"cafe",
			"espresso"
		]
	},
	{
		emoji: "🍵",
		description: "teacup without handle",
		category: "Foods",
		aliases: [
			"tea"
		],
		tags: [
			"green",
			"breakfast"
		]
	},
	{
		emoji: "🍶",
		description: "sake",
		category: "Foods",
		aliases: [
			"sake"
		],
		tags: [
		]
	},
	{
		emoji: "🍺",
		description: "beer mug",
		category: "Foods",
		aliases: [
			"beer"
		],
		tags: [
			"drink"
		]
	},
	{
		emoji: "🍻",
		description: "clinking beer mugs",
		category: "Foods",
		aliases: [
			"beers"
		],
		tags: [
			"drinks"
		]
	},
	{
		emoji: "🥂",
		description: "clinking glasses",
		category: "Foods",
		aliases: [
			"clinking_glasses"
		],
		tags: [
			"cheers",
			"toast"
		]
	},
	{
		emoji: "🍷",
		description: "wine glass",
		category: "Foods",
		aliases: [
			"wine_glass"
		],
		tags: [
		]
	},
	{
		emoji: "🥃",
		description: "tumbler glass",
		category: "Foods",
		aliases: [
			"tumbler_glass"
		],
		tags: [
			"whisky"
		]
	},
	{
		emoji: "🍸",
		description: "cocktail glass",
		category: "Foods",
		aliases: [
			"cocktail"
		],
		tags: [
			"drink"
		]
	},
	{
		emoji: "🍹",
		description: "tropical drink",
		category: "Foods",
		aliases: [
			"tropical_drink"
		],
		tags: [
			"summer",
			"vacation"
		]
	},
	{
		emoji: "🍾",
		description: "bottle with popping cork",
		category: "Foods",
		aliases: [
			"champagne"
		],
		tags: [
			"bottle",
			"bubbly",
			"celebration"
		]
	},
	{
		emoji: "🥄",
		description: "spoon",
		category: "Foods",
		aliases: [
			"spoon"
		],
		tags: [
		]
	},
	{
		emoji: "🍴",
		description: "fork and knife",
		category: "Foods",
		aliases: [
			"fork_and_knife"
		],
		tags: [
			"cutlery"
		]
	},
	{
		emoji: "🍽",
		description: "fork and knife with plate",
		category: "Foods",
		aliases: [
			"plate_with_cutlery"
		],
		tags: [
			"dining",
			"dinner"
		]
	},
	{
		emoji: "⚽️",
		description: "soccer ball",
		category: "Activity",
		aliases: [
			"soccer"
		],
		tags: [
			"sports"
		]
	},
	{
		emoji: "🏀",
		description: "basketball",
		category: "Activity",
		aliases: [
			"basketball"
		],
		tags: [
			"sports"
		]
	},
	{
		emoji: "🏈",
		description: "american football",
		category: "Activity",
		aliases: [
			"football"
		],
		tags: [
			"sports"
		]
	},
	{
		emoji: "⚾️",
		description: "baseball",
		category: "Activity",
		aliases: [
			"baseball"
		],
		tags: [
			"sports"
		]
	},
	{
		emoji: "🎾",
		description: "tennis",
		category: "Activity",
		aliases: [
			"tennis"
		],
		tags: [
			"sports"
		]
	},
	{
		emoji: "🏐",
		description: "volleyball",
		category: "Activity",
		aliases: [
			"volleyball"
		],
		tags: [
		]
	},
	{
		emoji: "🏉",
		description: "rugby football",
		category: "Activity",
		aliases: [
			"rugby_football"
		],
		tags: [
		]
	},
	{
		emoji: "🎱",
		description: "pool 8 ball",
		category: "Activity",
		aliases: [
			"8ball"
		],
		tags: [
			"pool",
			"billiards"
		]
	},
	{
		emoji: "🏓",
		description: "ping pong",
		category: "Activity",
		aliases: [
			"ping_pong"
		],
		tags: [
		]
	},
	{
		emoji: "🏸",
		description: "badminton",
		category: "Activity",
		aliases: [
			"badminton"
		],
		tags: [
		]
	},
	{
		emoji: "🥅",
		description: "goal net",
		category: "Activity",
		aliases: [
			"goal_net"
		],
		tags: [
		]
	},
	{
		emoji: "🏒",
		description: "ice hockey",
		category: "Activity",
		aliases: [
			"ice_hockey"
		],
		tags: [
		]
	},
	{
		emoji: "🏑",
		description: "field hockey",
		category: "Activity",
		aliases: [
			"field_hockey"
		],
		tags: [
		]
	},
	{
		emoji: "🏏",
		description: "cricket",
		category: "Activity",
		aliases: [
			"cricket"
		],
		tags: [
		]
	},
	{
		emoji: "⛳️",
		description: "flag in hole",
		category: "Activity",
		aliases: [
			"golf"
		],
		tags: [
		]
	},
	{
		emoji: "🏹",
		description: "bow and arrow",
		category: "Activity",
		aliases: [
			"bow_and_arrow"
		],
		tags: [
			"archery"
		]
	},
	{
		emoji: "🎣",
		description: "fishing pole",
		category: "Activity",
		aliases: [
			"fishing_pole_and_fish"
		],
		tags: [
		]
	},
	{
		emoji: "🥊",
		description: "boxing glove",
		category: "Activity",
		aliases: [
			"boxing_glove"
		],
		tags: [
		]
	},
	{
		emoji: "🥋",
		description: "martial arts uniform",
		category: "Activity",
		aliases: [
			"martial_arts_uniform"
		],
		tags: [
		]
	},
	{
		emoji: "⛸",
		description: "ice skate",
		category: "Activity",
		aliases: [
			"ice_skate"
		],
		tags: [
			"skating"
		]
	},
	{
		emoji: "🎿",
		description: "skis",
		category: "Activity",
		aliases: [
			"ski"
		],
		tags: [
		]
	},
	{
		emoji: "⛷",
		description: "skier",
		category: "Activity",
		aliases: [
			"skier"
		],
		tags: [
		]
	},
	{
		emoji: "🏂",
		description: "snowboarder",
		category: "Activity",
		aliases: [
			"snowboarder"
		],
		tags: [
		]
	},
	{
		emoji: "🏋️‍♀️",
		description: "woman lifting weights",
		category: "Activity",
		aliases: [
			"weight_lifting_woman"
		],
		tags: [
			"gym",
			"workout"
		]
	},
	{
		emoji: "🏋",
		description: "person lifting weights",
		category: "Activity",
		aliases: [
			"weight_lifting_man"
		],
		tags: [
			"gym",
			"workout"
		]
	},
	{
		emoji: "🤺",
		description: "person fencing",
		category: "Activity",
		aliases: [
			"person_fencing"
		],
		tags: [
		]
	},
	{
		emoji: "🤼‍♀",
		description: "women wrestling",
		category: "Activity",
		aliases: [
			"women_wrestling"
		],
		tags: [
		]
	},
	{
		emoji: "🤼‍♂",
		description: "men wrestling",
		category: "Activity",
		aliases: [
			"men_wrestling"
		],
		tags: [
		]
	},
	{
		emoji: "🤸‍♀",
		description: "woman cartwheeling",
		category: "Activity",
		aliases: [
			"woman_cartwheeling"
		],
		tags: [
		]
	},
	{
		emoji: "🤸‍♂",
		description: "man cartwheeling",
		category: "Activity",
		aliases: [
			"man_cartwheeling"
		],
		tags: [
		]
	},
	{
		emoji: "⛹️‍♀️",
		description: "woman bouncing ball",
		category: "Activity",
		aliases: [
			"basketball_woman"
		],
		tags: [
		]
	},
	{
		emoji: "⛹",
		description: "person bouncing ball",
		category: "Activity",
		aliases: [
			"basketball_man"
		],
		tags: [
		]
	},
	{
		emoji: "🤾‍♀",
		description: "woman playing handball",
		category: "Activity",
		aliases: [
			"woman_playing_handball"
		],
		tags: [
		]
	},
	{
		emoji: "🤾‍♂",
		description: "man playing handball",
		category: "Activity",
		aliases: [
			"man_playing_handball"
		],
		tags: [
		]
	},
	{
		emoji: "🏌️‍♀️",
		description: "woman golfing",
		category: "Activity",
		aliases: [
			"golfing_woman"
		],
		tags: [
		]
	},
	{
		emoji: "🏌",
		description: "person golfing",
		category: "Activity",
		aliases: [
			"golfing_man"
		],
		tags: [
		]
	},
	{
		emoji: "🏄‍♀",
		description: "woman surfing",
		category: "Activity",
		aliases: [
			"surfing_woman"
		],
		tags: [
		]
	},
	{
		emoji: "🏄",
		description: "person surfing",
		category: "Activity",
		aliases: [
			"surfing_man",
			"surfer"
		],
		tags: [
		]
	},
	{
		emoji: "🏊‍♀",
		description: "woman swimming",
		category: "Activity",
		aliases: [
			"swimming_woman"
		],
		tags: [
		]
	},
	{
		emoji: "🏊",
		description: "person swimming",
		category: "Activity",
		aliases: [
			"swimming_man",
			"swimmer"
		],
		tags: [
		]
	},
	{
		emoji: "🤽‍♀",
		description: "woman playing water polo",
		category: "Activity",
		aliases: [
			"woman_playing_water_polo"
		],
		tags: [
		]
	},
	{
		emoji: "🤽‍♂",
		description: "man playing water polo",
		category: "Activity",
		aliases: [
			"man_playing_water_polo"
		],
		tags: [
		]
	},
	{
		emoji: "🚣‍♀",
		description: "woman rowing boat",
		category: "Activity",
		aliases: [
			"rowing_woman"
		],
		tags: [
		]
	},
	{
		emoji: "🚣",
		description: "person rowing boat",
		category: "Activity",
		aliases: [
			"rowing_man",
			"rowboat"
		],
		tags: [
		]
	},
	{
		emoji: "🏇",
		description: "horse racing",
		category: "Activity",
		aliases: [
			"horse_racing"
		],
		tags: [
		]
	},
	{
		emoji: "🚴‍♀",
		description: "woman biking",
		category: "Activity",
		aliases: [
			"biking_woman"
		],
		tags: [
		]
	},
	{
		emoji: "🚴",
		description: "person biking",
		category: "Activity",
		aliases: [
			"biking_man",
			"bicyclist"
		],
		tags: [
		]
	},
	{
		emoji: "🚵‍♀",
		description: "woman mountain biking",
		category: "Activity",
		aliases: [
			"mountain_biking_woman"
		],
		tags: [
		]
	},
	{
		emoji: "🚵",
		description: "person mountain biking",
		category: "Activity",
		aliases: [
			"mountain_biking_man",
			"mountain_bicyclist"
		],
		tags: [
		]
	},
	{
		emoji: "🎽",
		description: "running shirt",
		category: "Activity",
		aliases: [
			"running_shirt_with_sash"
		],
		tags: [
			"marathon"
		]
	},
	{
		emoji: "🏅",
		description: "sports medal",
		category: "Activity",
		aliases: [
			"medal_sports"
		],
		tags: [
			"gold",
			"winner"
		]
	},
	{
		emoji: "🎖",
		description: "military medal",
		category: "Activity",
		aliases: [
			"medal_military"
		],
		tags: [
		]
	},
	{
		emoji: "🥇",
		description: "1st place medal",
		category: "Activity",
		aliases: [
			"1st_place_medal"
		],
		tags: [
			"gold"
		]
	},
	{
		emoji: "🥈",
		description: "2nd place medal",
		category: "Activity",
		aliases: [
			"2nd_place_medal"
		],
		tags: [
			"silver"
		]
	},
	{
		emoji: "🥉",
		description: "3rd place medal",
		category: "Activity",
		aliases: [
			"3rd_place_medal"
		],
		tags: [
			"bronze"
		]
	},
	{
		emoji: "🏆",
		description: "trophy",
		category: "Activity",
		aliases: [
			"trophy"
		],
		tags: [
			"award",
			"contest",
			"winner"
		]
	},
	{
		emoji: "🏵",
		description: "rosette",
		category: "Activity",
		aliases: [
			"rosette"
		],
		tags: [
		]
	},
	{
		emoji: "🎗",
		description: "reminder ribbon",
		category: "Activity",
		aliases: [
			"reminder_ribbon"
		],
		tags: [
		]
	},
	{
		emoji: "🎫",
		description: "ticket",
		category: "Activity",
		aliases: [
			"ticket"
		],
		tags: [
		]
	},
	{
		emoji: "🎟",
		description: "admission tickets",
		category: "Activity",
		aliases: [
			"tickets"
		],
		tags: [
		]
	},
	{
		emoji: "🎪",
		description: "circus tent",
		category: "Activity",
		aliases: [
			"circus_tent"
		],
		tags: [
		]
	},
	{
		emoji: "🤹‍♀",
		description: "woman juggling",
		category: "Activity",
		aliases: [
			"woman_juggling"
		],
		tags: [
		]
	},
	{
		emoji: "🤹‍♂",
		description: "man juggling",
		category: "Activity",
		aliases: [
			"man_juggling"
		],
		tags: [
		]
	},
	{
		emoji: "🎭",
		description: "performing arts",
		category: "Activity",
		aliases: [
			"performing_arts"
		],
		tags: [
			"theater",
			"drama"
		]
	},
	{
		emoji: "🎨",
		description: "artist palette",
		category: "Activity",
		aliases: [
			"art"
		],
		tags: [
			"design",
			"paint"
		]
	},
	{
		emoji: "🎬",
		description: "clapper board",
		category: "Activity",
		aliases: [
			"clapper"
		],
		tags: [
			"film"
		]
	},
	{
		emoji: "🎤",
		description: "microphone",
		category: "Activity",
		aliases: [
			"microphone"
		],
		tags: [
			"sing"
		]
	},
	{
		emoji: "🎧",
		description: "headphone",
		category: "Activity",
		aliases: [
			"headphones"
		],
		tags: [
			"music",
			"earphones"
		]
	},
	{
		emoji: "🎼",
		description: "musical score",
		category: "Activity",
		aliases: [
			"musical_score"
		],
		tags: [
		]
	},
	{
		emoji: "🎹",
		description: "musical keyboard",
		category: "Activity",
		aliases: [
			"musical_keyboard"
		],
		tags: [
			"piano"
		]
	},
	{
		emoji: "🥁",
		description: "drum",
		category: "Activity",
		aliases: [
			"drum"
		],
		tags: [
		]
	},
	{
		emoji: "🎷",
		description: "saxophone",
		category: "Activity",
		aliases: [
			"saxophone"
		],
		tags: [
		]
	},
	{
		emoji: "🎺",
		description: "trumpet",
		category: "Activity",
		aliases: [
			"trumpet"
		],
		tags: [
		]
	},
	{
		emoji: "🎸",
		description: "guitar",
		category: "Activity",
		aliases: [
			"guitar"
		],
		tags: [
			"rock"
		]
	},
	{
		emoji: "🎻",
		description: "violin",
		category: "Activity",
		aliases: [
			"violin"
		],
		tags: [
		]
	},
	{
		emoji: "🎲",
		description: "game die",
		category: "Activity",
		aliases: [
			"game_die"
		],
		tags: [
			"dice",
			"gambling"
		]
	},
	{
		emoji: "🎯",
		description: "direct hit",
		category: "Activity",
		aliases: [
			"dart"
		],
		tags: [
			"target"
		]
	},
	{
		emoji: "🎳",
		description: "bowling",
		category: "Activity",
		aliases: [
			"bowling"
		],
		tags: [
		]
	},
	{
		emoji: "🎮",
		description: "video game",
		category: "Activity",
		aliases: [
			"video_game"
		],
		tags: [
			"play",
			"controller",
			"console"
		]
	},
	{
		emoji: "🎰",
		description: "slot machine",
		category: "Activity",
		aliases: [
			"slot_machine"
		],
		tags: [
		]
	},
	{
		emoji: "🚗",
		description: "automobile",
		category: "Places",
		aliases: [
			"car",
			"red_car"
		],
		tags: [
		]
	},
	{
		emoji: "🚕",
		description: "taxi",
		category: "Places",
		aliases: [
			"taxi"
		],
		tags: [
		]
	},
	{
		emoji: "🚙",
		description: "sport utility vehicle",
		category: "Places",
		aliases: [
			"blue_car"
		],
		tags: [
		]
	},
	{
		emoji: "🚌",
		description: "bus",
		category: "Places",
		aliases: [
			"bus"
		],
		tags: [
		]
	},
	{
		emoji: "🚎",
		description: "trolleybus",
		category: "Places",
		aliases: [
			"trolleybus"
		],
		tags: [
		]
	},
	{
		emoji: "🏎",
		description: "racing car",
		category: "Places",
		aliases: [
			"racing_car"
		],
		tags: [
		]
	},
	{
		emoji: "🚓",
		description: "police car",
		category: "Places",
		aliases: [
			"police_car"
		],
		tags: [
		]
	},
	{
		emoji: "🚑",
		description: "ambulance",
		category: "Places",
		aliases: [
			"ambulance"
		],
		tags: [
		]
	},
	{
		emoji: "🚒",
		description: "fire engine",
		category: "Places",
		aliases: [
			"fire_engine"
		],
		tags: [
		]
	},
	{
		emoji: "🚐",
		description: "minibus",
		category: "Places",
		aliases: [
			"minibus"
		],
		tags: [
		]
	},
	{
		emoji: "🚚",
		description: "delivery truck",
		category: "Places",
		aliases: [
			"truck"
		],
		tags: [
		]
	},
	{
		emoji: "🚛",
		description: "articulated lorry",
		category: "Places",
		aliases: [
			"articulated_lorry"
		],
		tags: [
		]
	},
	{
		emoji: "🚜",
		description: "tractor",
		category: "Places",
		aliases: [
			"tractor"
		],
		tags: [
		]
	},
	{
		emoji: "🛴",
		description: "kick scooter",
		category: "Places",
		aliases: [
			"kick_scooter"
		],
		tags: [
		]
	},
	{
		emoji: "🚲",
		description: "bicycle",
		category: "Places",
		aliases: [
			"bike"
		],
		tags: [
			"bicycle"
		]
	},
	{
		emoji: "🛵",
		description: "motor scooter",
		category: "Places",
		aliases: [
			"motor_scooter"
		],
		tags: [
		]
	},
	{
		emoji: "🏍",
		description: "motorcycle",
		category: "Places",
		aliases: [
			"motorcycle"
		],
		tags: [
		]
	},
	{
		emoji: "🚨",
		description: "police car light",
		category: "Places",
		aliases: [
			"rotating_light"
		],
		tags: [
			"911",
			"emergency"
		]
	},
	{
		emoji: "🚔",
		description: "oncoming police car",
		category: "Places",
		aliases: [
			"oncoming_police_car"
		],
		tags: [
		]
	},
	{
		emoji: "🚍",
		description: "oncoming bus",
		category: "Places",
		aliases: [
			"oncoming_bus"
		],
		tags: [
		]
	},
	{
		emoji: "🚘",
		description: "oncoming automobile",
		category: "Places",
		aliases: [
			"oncoming_automobile"
		],
		tags: [
		]
	},
	{
		emoji: "🚖",
		description: "oncoming taxi",
		category: "Places",
		aliases: [
			"oncoming_taxi"
		],
		tags: [
		]
	},
	{
		emoji: "🚡",
		description: "aerial tramway",
		category: "Places",
		aliases: [
			"aerial_tramway"
		],
		tags: [
		]
	},
	{
		emoji: "🚠",
		description: "mountain cableway",
		category: "Places",
		aliases: [
			"mountain_cableway"
		],
		tags: [
		]
	},
	{
		emoji: "🚟",
		description: "suspension railway",
		category: "Places",
		aliases: [
			"suspension_railway"
		],
		tags: [
		]
	},
	{
		emoji: "🚃",
		description: "railway car",
		category: "Places",
		aliases: [
			"railway_car"
		],
		tags: [
		]
	},
	{
		emoji: "🚋",
		description: "tram car",
		category: "Places",
		aliases: [
			"train"
		],
		tags: [
		]
	},
	{
		emoji: "🚞",
		description: "mountain railway",
		category: "Places",
		aliases: [
			"mountain_railway"
		],
		tags: [
		]
	},
	{
		emoji: "🚝",
		description: "monorail",
		category: "Places",
		aliases: [
			"monorail"
		],
		tags: [
		]
	},
	{
		emoji: "🚄",
		description: "high-speed train",
		category: "Places",
		aliases: [
			"bullettrain_side"
		],
		tags: [
			"train"
		]
	},
	{
		emoji: "🚅",
		description: "high-speed train with bullet nose",
		category: "Places",
		aliases: [
			"bullettrain_front"
		],
		tags: [
			"train"
		]
	},
	{
		emoji: "🚈",
		description: "light rail",
		category: "Places",
		aliases: [
			"light_rail"
		],
		tags: [
		]
	},
	{
		emoji: "🚂",
		description: "locomotive",
		category: "Places",
		aliases: [
			"steam_locomotive"
		],
		tags: [
			"train"
		]
	},
	{
		emoji: "🚆",
		description: "train",
		category: "Places",
		aliases: [
			"train2"
		],
		tags: [
		]
	},
	{
		emoji: "🚇",
		description: "metro",
		category: "Places",
		aliases: [
			"metro"
		],
		tags: [
		]
	},
	{
		emoji: "🚊",
		description: "tram",
		category: "Places",
		aliases: [
			"tram"
		],
		tags: [
		]
	},
	{
		emoji: "🚉",
		description: "station",
		category: "Places",
		aliases: [
			"station"
		],
		tags: [
		]
	},
	{
		emoji: "🚁",
		description: "helicopter",
		category: "Places",
		aliases: [
			"helicopter"
		],
		tags: [
		]
	},
	{
		emoji: "🛩",
		description: "small airplane",
		category: "Places",
		aliases: [
			"small_airplane"
		],
		tags: [
			"flight"
		]
	},
	{
		emoji: "✈️",
		description: "airplane",
		category: "Places",
		aliases: [
			"airplane"
		],
		tags: [
			"flight"
		]
	},
	{
		emoji: "🛫",
		description: "airplane departure",
		category: "Places",
		aliases: [
			"flight_departure"
		],
		tags: [
		]
	},
	{
		emoji: "🛬",
		description: "airplane arrival",
		category: "Places",
		aliases: [
			"flight_arrival"
		],
		tags: [
		]
	},
	{
		emoji: "🚀",
		description: "rocket",
		category: "Places",
		aliases: [
			"rocket"
		],
		tags: [
			"ship",
			"launch"
		]
	},
	{
		emoji: "🛰",
		description: "satellite",
		category: "Places",
		aliases: [
			"artificial_satellite"
		],
		tags: [
			"orbit",
			"space"
		]
	},
	{
		emoji: "💺",
		description: "seat",
		category: "Places",
		aliases: [
			"seat"
		],
		tags: [
		]
	},
	{
		emoji: "🛶",
		description: "canoe",
		category: "Places",
		aliases: [
			"canoe"
		],
		tags: [
		]
	},
	{
		emoji: "⛵️",
		description: "sailboat",
		category: "Places",
		aliases: [
			"boat",
			"sailboat"
		],
		tags: [
		]
	},
	{
		emoji: "🛥",
		description: "motor boat",
		category: "Places",
		aliases: [
			"motor_boat"
		],
		tags: [
		]
	},
	{
		emoji: "🚤",
		description: "speedboat",
		category: "Places",
		aliases: [
			"speedboat"
		],
		tags: [
			"ship"
		]
	},
	{
		emoji: "🛳",
		description: "passenger ship",
		category: "Places",
		aliases: [
			"passenger_ship"
		],
		tags: [
			"cruise"
		]
	},
	{
		emoji: "⛴",
		description: "ferry",
		category: "Places",
		aliases: [
			"ferry"
		],
		tags: [
		]
	},
	{
		emoji: "🚢",
		description: "ship",
		category: "Places",
		aliases: [
			"ship"
		],
		tags: [
		]
	},
	{
		emoji: "⚓️",
		description: "anchor",
		category: "Places",
		aliases: [
			"anchor"
		],
		tags: [
			"ship"
		]
	},
	{
		emoji: "🚧",
		description: "construction",
		category: "Places",
		aliases: [
			"construction"
		],
		tags: [
			"wip"
		]
	},
	{
		emoji: "⛽️",
		description: "fuel pump",
		category: "Places",
		aliases: [
			"fuelpump"
		],
		tags: [
		]
	},
	{
		emoji: "🚏",
		description: "bus stop",
		category: "Places",
		aliases: [
			"busstop"
		],
		tags: [
		]
	},
	{
		emoji: "🚦",
		description: "vertical traffic light",
		category: "Places",
		aliases: [
			"vertical_traffic_light"
		],
		tags: [
			"semaphore"
		]
	},
	{
		emoji: "🚥",
		description: "horizontal traffic light",
		category: "Places",
		aliases: [
			"traffic_light"
		],
		tags: [
		]
	},
	{
		emoji: "🗺",
		description: "world map",
		category: "Places",
		aliases: [
			"world_map"
		],
		tags: [
			"travel"
		]
	},
	{
		emoji: "🗿",
		description: "moai",
		category: "Places",
		aliases: [
			"moyai"
		],
		tags: [
			"stone"
		]
	},
	{
		emoji: "🗽",
		description: "Statue of Liberty",
		category: "Places",
		aliases: [
			"statue_of_liberty"
		],
		tags: [
		]
	},
	{
		emoji: "⛲️",
		description: "fountain",
		category: "Places",
		aliases: [
			"fountain"
		],
		tags: [
		]
	},
	{
		emoji: "🗼",
		description: "Tokyo tower",
		category: "Places",
		aliases: [
			"tokyo_tower"
		],
		tags: [
		]
	},
	{
		emoji: "🏰",
		description: "castle",
		category: "Places",
		aliases: [
			"european_castle"
		],
		tags: [
		]
	},
	{
		emoji: "🏯",
		description: "Japanese castle",
		category: "Places",
		aliases: [
			"japanese_castle"
		],
		tags: [
		]
	},
	{
		emoji: "🏟",
		description: "stadium",
		category: "Places",
		aliases: [
			"stadium"
		],
		tags: [
		]
	},
	{
		emoji: "🎡",
		description: "ferris wheel",
		category: "Places",
		aliases: [
			"ferris_wheel"
		],
		tags: [
		]
	},
	{
		emoji: "🎢",
		description: "roller coaster",
		category: "Places",
		aliases: [
			"roller_coaster"
		],
		tags: [
		]
	},
	{
		emoji: "🎠",
		description: "carousel horse",
		category: "Places",
		aliases: [
			"carousel_horse"
		],
		tags: [
		]
	},
	{
		emoji: "⛱",
		description: "umbrella on ground",
		category: "Places",
		aliases: [
			"parasol_on_ground"
		],
		tags: [
			"beach_umbrella"
		]
	},
	{
		emoji: "🏖",
		description: "beach with umbrella",
		category: "Places",
		aliases: [
			"beach_umbrella"
		],
		tags: [
		]
	},
	{
		emoji: "🏝",
		description: "desert island",
		category: "Places",
		aliases: [
			"desert_island"
		],
		tags: [
		]
	},
	{
		emoji: "⛰",
		description: "mountain",
		category: "Places",
		aliases: [
			"mountain"
		],
		tags: [
		]
	},
	{
		emoji: "🏔",
		description: "snow-capped mountain",
		category: "Places",
		aliases: [
			"mountain_snow"
		],
		tags: [
		]
	},
	{
		emoji: "🗻",
		description: "mount fuji",
		category: "Places",
		aliases: [
			"mount_fuji"
		],
		tags: [
		]
	},
	{
		emoji: "🌋",
		description: "volcano",
		category: "Places",
		aliases: [
			"volcano"
		],
		tags: [
		]
	},
	{
		emoji: "🏜",
		description: "desert",
		category: "Places",
		aliases: [
			"desert"
		],
		tags: [
		]
	},
	{
		emoji: "🏕",
		description: "camping",
		category: "Places",
		aliases: [
			"camping"
		],
		tags: [
		]
	},
	{
		emoji: "⛺️",
		description: "tent",
		category: "Places",
		aliases: [
			"tent"
		],
		tags: [
			"camping"
		]
	},
	{
		emoji: "🛤",
		description: "railway track",
		category: "Places",
		aliases: [
			"railway_track"
		],
		tags: [
		]
	},
	{
		emoji: "🛣",
		description: "motorway",
		category: "Places",
		aliases: [
			"motorway"
		],
		tags: [
		]
	},
	{
		emoji: "🏗",
		description: "building construction",
		category: "Places",
		aliases: [
			"building_construction"
		],
		tags: [
		]
	},
	{
		emoji: "🏭",
		description: "factory",
		category: "Places",
		aliases: [
			"factory"
		],
		tags: [
		]
	},
	{
		emoji: "🏠",
		description: "house",
		category: "Places",
		aliases: [
			"house"
		],
		tags: [
		]
	},
	{
		emoji: "🏡",
		description: "house with garden",
		category: "Places",
		aliases: [
			"house_with_garden"
		],
		tags: [
		]
	},
	{
		emoji: "🏘",
		description: "house",
		category: "Places",
		aliases: [
			"houses"
		],
		tags: [
		]
	},
	{
		emoji: "🏚",
		description: "derelict house",
		category: "Places",
		aliases: [
			"derelict_house"
		],
		tags: [
		]
	},
	{
		emoji: "🏢",
		description: "office building",
		category: "Places",
		aliases: [
			"office"
		],
		tags: [
		]
	},
	{
		emoji: "🏬",
		description: "department store",
		category: "Places",
		aliases: [
			"department_store"
		],
		tags: [
		]
	},
	{
		emoji: "🏣",
		description: "Japanese post office",
		category: "Places",
		aliases: [
			"post_office"
		],
		tags: [
		]
	},
	{
		emoji: "🏤",
		description: "post office",
		category: "Places",
		aliases: [
			"european_post_office"
		],
		tags: [
		]
	},
	{
		emoji: "🏥",
		description: "hospital",
		category: "Places",
		aliases: [
			"hospital"
		],
		tags: [
		]
	},
	{
		emoji: "🏦",
		description: "bank",
		category: "Places",
		aliases: [
			"bank"
		],
		tags: [
		]
	},
	{
		emoji: "🏨",
		description: "hotel",
		category: "Places",
		aliases: [
			"hotel"
		],
		tags: [
		]
	},
	{
		emoji: "🏪",
		description: "convenience store",
		category: "Places",
		aliases: [
			"convenience_store"
		],
		tags: [
		]
	},
	{
		emoji: "🏫",
		description: "school",
		category: "Places",
		aliases: [
			"school"
		],
		tags: [
		]
	},
	{
		emoji: "🏩",
		description: "love hotel",
		category: "Places",
		aliases: [
			"love_hotel"
		],
		tags: [
		]
	},
	{
		emoji: "💒",
		description: "wedding",
		category: "Places",
		aliases: [
			"wedding"
		],
		tags: [
			"marriage"
		]
	},
	{
		emoji: "🏛",
		description: "classical building",
		category: "Places",
		aliases: [
			"classical_building"
		],
		tags: [
		]
	},
	{
		emoji: "⛪️",
		description: "church",
		category: "Places",
		aliases: [
			"church"
		],
		tags: [
		]
	},
	{
		emoji: "🕌",
		description: "mosque",
		category: "Places",
		aliases: [
			"mosque"
		],
		tags: [
		]
	},
	{
		emoji: "🕍",
		description: "synagogue",
		category: "Places",
		aliases: [
			"synagogue"
		],
		tags: [
		]
	},
	{
		emoji: "🕋",
		description: "kaaba",
		category: "Places",
		aliases: [
			"kaaba"
		],
		tags: [
		]
	},
	{
		emoji: "⛩",
		description: "shinto shrine",
		category: "Places",
		aliases: [
			"shinto_shrine"
		],
		tags: [
		]
	},
	{
		emoji: "🗾",
		description: "map of Japan",
		category: "Places",
		aliases: [
			"japan"
		],
		tags: [
		]
	},
	{
		emoji: "🎑",
		description: "moon viewing ceremony",
		category: "Places",
		aliases: [
			"rice_scene"
		],
		tags: [
		]
	},
	{
		emoji: "🏞",
		description: "national park",
		category: "Places",
		aliases: [
			"national_park"
		],
		tags: [
		]
	},
	{
		emoji: "🌅",
		description: "sunrise",
		category: "Places",
		aliases: [
			"sunrise"
		],
		tags: [
		]
	},
	{
		emoji: "🌄",
		description: "sunrise over mountains",
		category: "Places",
		aliases: [
			"sunrise_over_mountains"
		],
		tags: [
		]
	},
	{
		emoji: "🌠",
		description: "shooting star",
		category: "Places",
		aliases: [
			"stars"
		],
		tags: [
		]
	},
	{
		emoji: "🎇",
		description: "sparkler",
		category: "Places",
		aliases: [
			"sparkler"
		],
		tags: [
		]
	},
	{
		emoji: "🎆",
		description: "fireworks",
		category: "Places",
		aliases: [
			"fireworks"
		],
		tags: [
			"festival",
			"celebration"
		]
	},
	{
		emoji: "🌇",
		description: "sunset",
		category: "Places",
		aliases: [
			"city_sunrise"
		],
		tags: [
		]
	},
	{
		emoji: "🌆",
		description: "cityscape at dusk",
		category: "Places",
		aliases: [
			"city_sunset"
		],
		tags: [
		]
	},
	{
		emoji: "🏙",
		description: "cityscape",
		category: "Places",
		aliases: [
			"cityscape"
		],
		tags: [
			"skyline"
		]
	},
	{
		emoji: "🌃",
		description: "night with stars",
		category: "Places",
		aliases: [
			"night_with_stars"
		],
		tags: [
		]
	},
	{
		emoji: "🌌",
		description: "milky way",
		category: "Places",
		aliases: [
			"milky_way"
		],
		tags: [
		]
	},
	{
		emoji: "🌉",
		description: "bridge at night",
		category: "Places",
		aliases: [
			"bridge_at_night"
		],
		tags: [
		]
	},
	{
		emoji: "🌁",
		description: "foggy",
		category: "Places",
		aliases: [
			"foggy"
		],
		tags: [
			"karl"
		]
	},
	{
		emoji: "⌚️",
		description: "watch",
		category: "Objects",
		aliases: [
			"watch"
		],
		tags: [
			"time"
		]
	},
	{
		emoji: "📱",
		description: "mobile phone",
		category: "Objects",
		aliases: [
			"iphone"
		],
		tags: [
			"smartphone",
			"mobile"
		]
	},
	{
		emoji: "📲",
		description: "mobile phone with arrow",
		category: "Objects",
		aliases: [
			"calling"
		],
		tags: [
			"call",
			"incoming"
		]
	},
	{
		emoji: "💻",
		description: "laptop computer",
		category: "Objects",
		aliases: [
			"computer"
		],
		tags: [
			"desktop",
			"screen"
		]
	},
	{
		emoji: "⌨️",
		description: "keyboard",
		category: "Objects",
		aliases: [
			"keyboard"
		],
		tags: [
		]
	},
	{
		emoji: "🖥",
		description: "desktop computer",
		category: "Objects",
		aliases: [
			"desktop_computer"
		],
		tags: [
		]
	},
	{
		emoji: "🖨",
		description: "printer",
		category: "Objects",
		aliases: [
			"printer"
		],
		tags: [
		]
	},
	{
		emoji: "🖱",
		description: "computer mouse",
		category: "Objects",
		aliases: [
			"computer_mouse"
		],
		tags: [
		]
	},
	{
		emoji: "🖲",
		description: "trackball",
		category: "Objects",
		aliases: [
			"trackball"
		],
		tags: [
		]
	},
	{
		emoji: "🕹",
		description: "joystick",
		category: "Objects",
		aliases: [
			"joystick"
		],
		tags: [
		]
	},
	{
		emoji: "🗜",
		description: "clamp",
		category: "Objects",
		aliases: [
			"clamp"
		],
		tags: [
		]
	},
	{
		emoji: "💽",
		description: "computer disk",
		category: "Objects",
		aliases: [
			"minidisc"
		],
		tags: [
		]
	},
	{
		emoji: "💾",
		description: "floppy disk",
		category: "Objects",
		aliases: [
			"floppy_disk"
		],
		tags: [
			"save"
		]
	},
	{
		emoji: "💿",
		description: "optical disk",
		category: "Objects",
		aliases: [
			"cd"
		],
		tags: [
		]
	},
	{
		emoji: "📀",
		description: "dvd",
		category: "Objects",
		aliases: [
			"dvd"
		],
		tags: [
		]
	},
	{
		emoji: "📼",
		description: "videocassette",
		category: "Objects",
		aliases: [
			"vhs"
		],
		tags: [
		]
	},
	{
		emoji: "📷",
		description: "camera",
		category: "Objects",
		aliases: [
			"camera"
		],
		tags: [
			"photo"
		]
	},
	{
		emoji: "📸",
		description: "camera with flash",
		category: "Objects",
		aliases: [
			"camera_flash"
		],
		tags: [
			"photo"
		]
	},
	{
		emoji: "📹",
		description: "video camera",
		category: "Objects",
		aliases: [
			"video_camera"
		],
		tags: [
		]
	},
	{
		emoji: "🎥",
		description: "movie camera",
		category: "Objects",
		aliases: [
			"movie_camera"
		],
		tags: [
			"film",
			"video"
		]
	},
	{
		emoji: "📽",
		description: "film projector",
		category: "Objects",
		aliases: [
			"film_projector"
		],
		tags: [
		]
	},
	{
		emoji: "🎞",
		description: "film frames",
		category: "Objects",
		aliases: [
			"film_strip"
		],
		tags: [
		]
	},
	{
		emoji: "📞",
		description: "telephone receiver",
		category: "Objects",
		aliases: [
			"telephone_receiver"
		],
		tags: [
			"phone",
			"call"
		]
	},
	{
		emoji: "☎️",
		description: "telephone",
		category: "Objects",
		aliases: [
			"phone",
			"telephone"
		],
		tags: [
		]
	},
	{
		emoji: "📟",
		description: "pager",
		category: "Objects",
		aliases: [
			"pager"
		],
		tags: [
		]
	},
	{
		emoji: "📠",
		description: "fax machine",
		category: "Objects",
		aliases: [
			"fax"
		],
		tags: [
		]
	},
	{
		emoji: "📺",
		description: "television",
		category: "Objects",
		aliases: [
			"tv"
		],
		tags: [
		]
	},
	{
		emoji: "📻",
		description: "radio",
		category: "Objects",
		aliases: [
			"radio"
		],
		tags: [
			"podcast"
		]
	},
	{
		emoji: "🎙",
		description: "studio microphone",
		category: "Objects",
		aliases: [
			"studio_microphone"
		],
		tags: [
			"podcast"
		]
	},
	{
		emoji: "🎚",
		description: "level slider",
		category: "Objects",
		aliases: [
			"level_slider"
		],
		tags: [
		]
	},
	{
		emoji: "🎛",
		description: "control knobs",
		category: "Objects",
		aliases: [
			"control_knobs"
		],
		tags: [
		]
	},
	{
		emoji: "⏱",
		description: "stopwatch",
		category: "Objects",
		aliases: [
			"stopwatch"
		],
		tags: [
		]
	},
	{
		emoji: "⏲",
		description: "timer clock",
		category: "Objects",
		aliases: [
			"timer_clock"
		],
		tags: [
		]
	},
	{
		emoji: "⏰",
		description: "alarm clock",
		category: "Objects",
		aliases: [
			"alarm_clock"
		],
		tags: [
			"morning"
		]
	},
	{
		emoji: "🕰",
		description: "mantelpiece clock",
		category: "Objects",
		aliases: [
			"mantelpiece_clock"
		],
		tags: [
		]
	},
	{
		emoji: "⌛️",
		description: "hourglass",
		category: "Objects",
		aliases: [
			"hourglass"
		],
		tags: [
			"time"
		]
	},
	{
		emoji: "⏳",
		description: "hourglass with flowing sand",
		category: "Objects",
		aliases: [
			"hourglass_flowing_sand"
		],
		tags: [
			"time"
		]
	},
	{
		emoji: "📡",
		description: "satellite antenna",
		category: "Objects",
		aliases: [
			"satellite"
		],
		tags: [
			"signal"
		]
	},
	{
		emoji: "🔋",
		description: "battery",
		category: "Objects",
		aliases: [
			"battery"
		],
		tags: [
			"power"
		]
	},
	{
		emoji: "🔌",
		description: "electric plug",
		category: "Objects",
		aliases: [
			"electric_plug"
		],
		tags: [
		]
	},
	{
		emoji: "💡",
		description: "light bulb",
		category: "Objects",
		aliases: [
			"bulb"
		],
		tags: [
			"idea",
			"light"
		]
	},
	{
		emoji: "🔦",
		description: "flashlight",
		category: "Objects",
		aliases: [
			"flashlight"
		],
		tags: [
		]
	},
	{
		emoji: "🕯",
		description: "candle",
		category: "Objects",
		aliases: [
			"candle"
		],
		tags: [
		]
	},
	{
		emoji: "🗑",
		description: "wastebasket",
		category: "Objects",
		aliases: [
			"wastebasket"
		],
		tags: [
			"trash"
		]
	},
	{
		emoji: "🛢",
		description: "oil drum",
		category: "Objects",
		aliases: [
			"oil_drum"
		],
		tags: [
		]
	},
	{
		emoji: "💸",
		description: "money with wings",
		category: "Objects",
		aliases: [
			"money_with_wings"
		],
		tags: [
			"dollar"
		]
	},
	{
		emoji: "💵",
		description: "dollar banknote",
		category: "Objects",
		aliases: [
			"dollar"
		],
		tags: [
			"money"
		]
	},
	{
		emoji: "💴",
		description: "yen banknote",
		category: "Objects",
		aliases: [
			"yen"
		],
		tags: [
		]
	},
	{
		emoji: "💶",
		description: "euro banknote",
		category: "Objects",
		aliases: [
			"euro"
		],
		tags: [
		]
	},
	{
		emoji: "💷",
		description: "pound banknote",
		category: "Objects",
		aliases: [
			"pound"
		],
		tags: [
		]
	},
	{
		emoji: "💰",
		description: "money bag",
		category: "Objects",
		aliases: [
			"moneybag"
		],
		tags: [
			"dollar",
			"cream"
		]
	},
	{
		emoji: "💳",
		description: "credit card",
		category: "Objects",
		aliases: [
			"credit_card"
		],
		tags: [
			"subscription"
		]
	},
	{
		emoji: "💎",
		description: "gem stone",
		category: "Objects",
		aliases: [
			"gem"
		],
		tags: [
			"diamond"
		]
	},
	{
		emoji: "⚖️",
		description: "balance scale",
		category: "Objects",
		aliases: [
			"balance_scale"
		],
		tags: [
		]
	},
	{
		emoji: "🔧",
		description: "wrench",
		category: "Objects",
		aliases: [
			"wrench"
		],
		tags: [
			"tool"
		]
	},
	{
		emoji: "🔨",
		description: "hammer",
		category: "Objects",
		aliases: [
			"hammer"
		],
		tags: [
			"tool"
		]
	},
	{
		emoji: "⚒",
		description: "hammer and pick",
		category: "Objects",
		aliases: [
			"hammer_and_pick"
		],
		tags: [
		]
	},
	{
		emoji: "🛠",
		description: "hammer and wrench",
		category: "Objects",
		aliases: [
			"hammer_and_wrench"
		],
		tags: [
		]
	},
	{
		emoji: "⛏",
		description: "pick",
		category: "Objects",
		aliases: [
			"pick"
		],
		tags: [
		]
	},
	{
		emoji: "🔩",
		description: "nut and bolt",
		category: "Objects",
		aliases: [
			"nut_and_bolt"
		],
		tags: [
		]
	},
	{
		emoji: "⚙️",
		description: "gear",
		category: "Objects",
		aliases: [
			"gear"
		],
		tags: [
		]
	},
	{
		emoji: "⛓",
		description: "chains",
		category: "Objects",
		aliases: [
			"chains"
		],
		tags: [
		]
	},
	{
		emoji: "🔫",
		description: "pistol",
		category: "Objects",
		aliases: [
			"gun"
		],
		tags: [
			"shoot",
			"weapon"
		]
	},
	{
		emoji: "💣",
		description: "bomb",
		category: "Objects",
		aliases: [
			"bomb"
		],
		tags: [
			"boom"
		]
	},
	{
		emoji: "🔪",
		description: "kitchen knife",
		category: "Objects",
		aliases: [
			"hocho",
			"knife"
		],
		tags: [
			"cut",
			"chop"
		]
	},
	{
		emoji: "🗡",
		description: "dagger",
		category: "Objects",
		aliases: [
			"dagger"
		],
		tags: [
		]
	},
	{
		emoji: "⚔️",
		description: "crossed swords",
		category: "Objects",
		aliases: [
			"crossed_swords"
		],
		tags: [
		]
	},
	{
		emoji: "🛡",
		description: "shield",
		category: "Objects",
		aliases: [
			"shield"
		],
		tags: [
		]
	},
	{
		emoji: "🚬",
		description: "cigarette",
		category: "Objects",
		aliases: [
			"smoking"
		],
		tags: [
			"cigarette"
		]
	},
	{
		emoji: "⚰️",
		description: "coffin",
		category: "Objects",
		aliases: [
			"coffin"
		],
		tags: [
			"funeral"
		]
	},
	{
		emoji: "⚱️",
		description: "funeral urn",
		category: "Objects",
		aliases: [
			"funeral_urn"
		],
		tags: [
		]
	},
	{
		emoji: "🏺",
		description: "amphora",
		category: "Objects",
		aliases: [
			"amphora"
		],
		tags: [
		]
	},
	{
		emoji: "🔮",
		description: "crystal ball",
		category: "Objects",
		aliases: [
			"crystal_ball"
		],
		tags: [
			"fortune"
		]
	},
	{
		emoji: "📿",
		description: "prayer beads",
		category: "Objects",
		aliases: [
			"prayer_beads"
		],
		tags: [
		]
	},
	{
		emoji: "💈",
		description: "barber pole",
		category: "Objects",
		aliases: [
			"barber"
		],
		tags: [
		]
	},
	{
		emoji: "⚗️",
		description: "alembic",
		category: "Objects",
		aliases: [
			"alembic"
		],
		tags: [
		]
	},
	{
		emoji: "🔭",
		description: "telescope",
		category: "Objects",
		aliases: [
			"telescope"
		],
		tags: [
		]
	},
	{
		emoji: "🔬",
		description: "microscope",
		category: "Objects",
		aliases: [
			"microscope"
		],
		tags: [
			"science",
			"laboratory",
			"investigate"
		]
	},
	{
		emoji: "🕳",
		description: "hole",
		category: "Objects",
		aliases: [
			"hole"
		],
		tags: [
		]
	},
	{
		emoji: "💊",
		description: "pill",
		category: "Objects",
		aliases: [
			"pill"
		],
		tags: [
			"health",
			"medicine"
		]
	},
	{
		emoji: "💉",
		description: "syringe",
		category: "Objects",
		aliases: [
			"syringe"
		],
		tags: [
			"health",
			"hospital",
			"needle"
		]
	},
	{
		emoji: "🌡",
		description: "thermometer",
		category: "Objects",
		aliases: [
			"thermometer"
		],
		tags: [
		]
	},
	{
		emoji: "🚽",
		description: "toilet",
		category: "Objects",
		aliases: [
			"toilet"
		],
		tags: [
			"wc"
		]
	},
	{
		emoji: "🚰",
		description: "potable water",
		category: "Objects",
		aliases: [
			"potable_water"
		],
		tags: [
		]
	},
	{
		emoji: "🚿",
		description: "shower",
		category: "Objects",
		aliases: [
			"shower"
		],
		tags: [
			"bath"
		]
	},
	{
		emoji: "🛁",
		description: "bathtub",
		category: "Objects",
		aliases: [
			"bathtub"
		],
		tags: [
		]
	},
	{
		emoji: "🛀",
		description: "person taking bath",
		category: "Objects",
		aliases: [
			"bath"
		],
		tags: [
			"shower"
		]
	},
	{
		emoji: "🛎",
		description: "bellhop bell",
		category: "Objects",
		aliases: [
			"bellhop_bell"
		],
		tags: [
		]
	},
	{
		emoji: "🔑",
		description: "key",
		category: "Objects",
		aliases: [
			"key"
		],
		tags: [
			"lock",
			"password"
		]
	},
	{
		emoji: "🗝",
		description: "old key",
		category: "Objects",
		aliases: [
			"old_key"
		],
		tags: [
		]
	},
	{
		emoji: "🚪",
		description: "door",
		category: "Objects",
		aliases: [
			"door"
		],
		tags: [
		]
	},
	{
		emoji: "🛋",
		description: "couch and lamp",
		category: "Objects",
		aliases: [
			"couch_and_lamp"
		],
		tags: [
		]
	},
	{
		emoji: "🛏",
		description: "bed",
		category: "Objects",
		aliases: [
			"bed"
		],
		tags: [
		]
	},
	{
		emoji: "🛌",
		description: "person in bed",
		category: "Objects",
		aliases: [
			"sleeping_bed"
		],
		tags: [
		]
	},
	{
		emoji: "🖼",
		description: "framed picture",
		category: "Objects",
		aliases: [
			"framed_picture"
		],
		tags: [
		]
	},
	{
		emoji: "🛍",
		description: "shopping bags",
		category: "Objects",
		aliases: [
			"shopping"
		],
		tags: [
			"bags"
		]
	},
	{
		emoji: "🛒",
		description: "shopping cart",
		category: "Objects",
		aliases: [
			"shopping_cart"
		],
		tags: [
		]
	},
	{
		emoji: "🎁",
		description: "wrapped gift",
		category: "Objects",
		aliases: [
			"gift"
		],
		tags: [
			"present",
			"birthday",
			"christmas"
		]
	},
	{
		emoji: "🎈",
		description: "balloon",
		category: "Objects",
		aliases: [
			"balloon"
		],
		tags: [
			"party",
			"birthday"
		]
	},
	{
		emoji: "🎏",
		description: "carp streamer",
		category: "Objects",
		aliases: [
			"flags"
		],
		tags: [
		]
	},
	{
		emoji: "🎀",
		description: "ribbon",
		category: "Objects",
		aliases: [
			"ribbon"
		],
		tags: [
		]
	},
	{
		emoji: "🎊",
		description: "confetti ball",
		category: "Objects",
		aliases: [
			"confetti_ball"
		],
		tags: [
		]
	},
	{
		emoji: "🎉",
		description: "party popper",
		category: "Objects",
		aliases: [
			"tada"
		],
		tags: [
			"hooray",
			"party"
		]
	},
	{
		emoji: "🎎",
		description: "Japanese dolls",
		category: "Objects",
		aliases: [
			"dolls"
		],
		tags: [
		]
	},
	{
		emoji: "🏮",
		description: "red paper lantern",
		category: "Objects",
		aliases: [
			"izakaya_lantern",
			"lantern"
		],
		tags: [
		]
	},
	{
		emoji: "🎐",
		description: "wind chime",
		category: "Objects",
		aliases: [
			"wind_chime"
		],
		tags: [
		]
	},
	{
		emoji: "✉️",
		description: "envelope",
		category: "Objects",
		aliases: [
			"email",
			"envelope"
		],
		tags: [
			"letter"
		]
	},
	{
		emoji: "📩",
		description: "envelope with arrow",
		category: "Objects",
		aliases: [
			"envelope_with_arrow"
		],
		tags: [
		]
	},
	{
		emoji: "📨",
		description: "incoming envelope",
		category: "Objects",
		aliases: [
			"incoming_envelope"
		],
		tags: [
		]
	},
	{
		emoji: "📧",
		description: "e-mail",
		category: "Objects",
		aliases: [
			"e-mail"
		],
		tags: [
		]
	},
	{
		emoji: "💌",
		description: "love letter",
		category: "Objects",
		aliases: [
			"love_letter"
		],
		tags: [
			"email",
			"envelope"
		]
	},
	{
		emoji: "📥",
		description: "inbox tray",
		category: "Objects",
		aliases: [
			"inbox_tray"
		],
		tags: [
		]
	},
	{
		emoji: "📤",
		description: "outbox tray",
		category: "Objects",
		aliases: [
			"outbox_tray"
		],
		tags: [
		]
	},
	{
		emoji: "📦",
		description: "package",
		category: "Objects",
		aliases: [
			"package"
		],
		tags: [
			"shipping"
		]
	},
	{
		emoji: "🏷",
		description: "label",
		category: "Objects",
		aliases: [
			"label"
		],
		tags: [
			"tag"
		]
	},
	{
		emoji: "📪",
		description: "closed mailbox with lowered flag",
		category: "Objects",
		aliases: [
			"mailbox_closed"
		],
		tags: [
		]
	},
	{
		emoji: "📫",
		description: "closed mailbox with raised flag",
		category: "Objects",
		aliases: [
			"mailbox"
		],
		tags: [
		]
	},
	{
		emoji: "📬",
		description: "open mailbox with raised flag",
		category: "Objects",
		aliases: [
			"mailbox_with_mail"
		],
		tags: [
		]
	},
	{
		emoji: "📭",
		description: "open mailbox with lowered flag",
		category: "Objects",
		aliases: [
			"mailbox_with_no_mail"
		],
		tags: [
		]
	},
	{
		emoji: "📮",
		description: "postbox",
		category: "Objects",
		aliases: [
			"postbox"
		],
		tags: [
		]
	},
	{
		emoji: "📯",
		description: "postal horn",
		category: "Objects",
		aliases: [
			"postal_horn"
		],
		tags: [
		]
	},
	{
		emoji: "📜",
		description: "scroll",
		category: "Objects",
		aliases: [
			"scroll"
		],
		tags: [
			"document"
		]
	},
	{
		emoji: "📃",
		description: "page with curl",
		category: "Objects",
		aliases: [
			"page_with_curl"
		],
		tags: [
		]
	},
	{
		emoji: "📄",
		description: "page facing up",
		category: "Objects",
		aliases: [
			"page_facing_up"
		],
		tags: [
			"document"
		]
	},
	{
		emoji: "📑",
		description: "bookmark tabs",
		category: "Objects",
		aliases: [
			"bookmark_tabs"
		],
		tags: [
		]
	},
	{
		emoji: "📊",
		description: "bar chart",
		category: "Objects",
		aliases: [
			"bar_chart"
		],
		tags: [
			"stats",
			"metrics"
		]
	},
	{
		emoji: "📈",
		description: "chart increasing",
		category: "Objects",
		aliases: [
			"chart_with_upwards_trend"
		],
		tags: [
			"graph",
			"metrics"
		]
	},
	{
		emoji: "📉",
		description: "chart decreasing",
		category: "Objects",
		aliases: [
			"chart_with_downwards_trend"
		],
		tags: [
			"graph",
			"metrics"
		]
	},
	{
		emoji: "🗒",
		description: "spiral notepad",
		category: "Objects",
		aliases: [
			"spiral_notepad"
		],
		tags: [
		]
	},
	{
		emoji: "🗓",
		description: "spiral calendar",
		category: "Objects",
		aliases: [
			"spiral_calendar"
		],
		tags: [
		]
	},
	{
		emoji: "📆",
		description: "tear-off calendar",
		category: "Objects",
		aliases: [
			"calendar"
		],
		tags: [
			"schedule"
		]
	},
	{
		emoji: "📅",
		description: "calendar",
		category: "Objects",
		aliases: [
			"date"
		],
		tags: [
			"calendar",
			"schedule"
		]
	},
	{
		emoji: "📇",
		description: "card index",
		category: "Objects",
		aliases: [
			"card_index"
		],
		tags: [
		]
	},
	{
		emoji: "🗃",
		description: "card file box",
		category: "Objects",
		aliases: [
			"card_file_box"
		],
		tags: [
		]
	},
	{
		emoji: "🗳",
		description: "ballot box with ballot",
		category: "Objects",
		aliases: [
			"ballot_box"
		],
		tags: [
		]
	},
	{
		emoji: "🗄",
		description: "file cabinet",
		category: "Objects",
		aliases: [
			"file_cabinet"
		],
		tags: [
		]
	},
	{
		emoji: "📋",
		description: "clipboard",
		category: "Objects",
		aliases: [
			"clipboard"
		],
		tags: [
		]
	},
	{
		emoji: "📁",
		description: "file folder",
		category: "Objects",
		aliases: [
			"file_folder"
		],
		tags: [
			"directory"
		]
	},
	{
		emoji: "📂",
		description: "open file folder",
		category: "Objects",
		aliases: [
			"open_file_folder"
		],
		tags: [
		]
	},
	{
		emoji: "🗂",
		description: "card index dividers",
		category: "Objects",
		aliases: [
			"card_index_dividers"
		],
		tags: [
		]
	},
	{
		emoji: "🗞",
		description: "rolled-up newspaper",
		category: "Objects",
		aliases: [
			"newspaper_roll"
		],
		tags: [
			"press"
		]
	},
	{
		emoji: "📰",
		description: "newspaper",
		category: "Objects",
		aliases: [
			"newspaper"
		],
		tags: [
			"press"
		]
	},
	{
		emoji: "📓",
		description: "notebook",
		category: "Objects",
		aliases: [
			"notebook"
		],
		tags: [
		]
	},
	{
		emoji: "📔",
		description: "notebook with decorative cover",
		category: "Objects",
		aliases: [
			"notebook_with_decorative_cover"
		],
		tags: [
		]
	},
	{
		emoji: "📒",
		description: "ledger",
		category: "Objects",
		aliases: [
			"ledger"
		],
		tags: [
		]
	},
	{
		emoji: "📕",
		description: "closed book",
		category: "Objects",
		aliases: [
			"closed_book"
		],
		tags: [
		]
	},
	{
		emoji: "📗",
		description: "green book",
		category: "Objects",
		aliases: [
			"green_book"
		],
		tags: [
		]
	},
	{
		emoji: "📘",
		description: "blue book",
		category: "Objects",
		aliases: [
			"blue_book"
		],
		tags: [
		]
	},
	{
		emoji: "📙",
		description: "orange book",
		category: "Objects",
		aliases: [
			"orange_book"
		],
		tags: [
		]
	},
	{
		emoji: "📚",
		description: "books",
		category: "Objects",
		aliases: [
			"books"
		],
		tags: [
			"library"
		]
	},
	{
		emoji: "📖",
		description: "open book",
		category: "Objects",
		aliases: [
			"book",
			"open_book"
		],
		tags: [
		]
	},
	{
		emoji: "🔖",
		description: "bookmark",
		category: "Objects",
		aliases: [
			"bookmark"
		],
		tags: [
		]
	},
	{
		emoji: "🔗",
		description: "link",
		category: "Objects",
		aliases: [
			"link"
		],
		tags: [
		]
	},
	{
		emoji: "📎",
		description: "paperclip",
		category: "Objects",
		aliases: [
			"paperclip"
		],
		tags: [
		]
	},
	{
		emoji: "🖇",
		description: "linked paperclips",
		category: "Objects",
		aliases: [
			"paperclips"
		],
		tags: [
		]
	},
	{
		emoji: "📐",
		description: "triangular ruler",
		category: "Objects",
		aliases: [
			"triangular_ruler"
		],
		tags: [
		]
	},
	{
		emoji: "📏",
		description: "straight ruler",
		category: "Objects",
		aliases: [
			"straight_ruler"
		],
		tags: [
		]
	},
	{
		emoji: "📌",
		description: "pushpin",
		category: "Objects",
		aliases: [
			"pushpin"
		],
		tags: [
			"location"
		]
	},
	{
		emoji: "📍",
		description: "round pushpin",
		category: "Objects",
		aliases: [
			"round_pushpin"
		],
		tags: [
			"location"
		]
	},
	{
		emoji: "✂️",
		description: "scissors",
		category: "Objects",
		aliases: [
			"scissors"
		],
		tags: [
			"cut"
		]
	},
	{
		emoji: "🖊",
		description: "pen",
		category: "Objects",
		aliases: [
			"pen"
		],
		tags: [
		]
	},
	{
		emoji: "🖋",
		description: "fountain pen",
		category: "Objects",
		aliases: [
			"fountain_pen"
		],
		tags: [
		]
	},
	{
		emoji: "✒️",
		description: "black nib",
		category: "Objects",
		aliases: [
			"black_nib"
		],
		tags: [
		]
	},
	{
		emoji: "🖌",
		description: "paintbrush",
		category: "Objects",
		aliases: [
			"paintbrush"
		],
		tags: [
		]
	},
	{
		emoji: "🖍",
		description: "crayon",
		category: "Objects",
		aliases: [
			"crayon"
		],
		tags: [
		]
	},
	{
		emoji: "📝",
		description: "memo",
		category: "Objects",
		aliases: [
			"memo",
			"pencil"
		],
		tags: [
			"document",
			"note"
		]
	},
	{
		emoji: "✏️",
		description: "pencil",
		category: "Objects",
		aliases: [
			"pencil2"
		],
		tags: [
		]
	},
	{
		emoji: "🔍",
		description: "left-pointing magnifying glass",
		category: "Objects",
		aliases: [
			"mag"
		],
		tags: [
			"search",
			"zoom"
		]
	},
	{
		emoji: "🔎",
		description: "right-pointing magnifying glass",
		category: "Objects",
		aliases: [
			"mag_right"
		],
		tags: [
		]
	},
	{
		emoji: "🔏",
		description: "locked with pen",
		category: "Objects",
		aliases: [
			"lock_with_ink_pen"
		],
		tags: [
		]
	},
	{
		emoji: "🔐",
		description: "locked with key",
		category: "Objects",
		aliases: [
			"closed_lock_with_key"
		],
		tags: [
			"security"
		]
	},
	{
		emoji: "🔒",
		description: "locked",
		category: "Objects",
		aliases: [
			"lock"
		],
		tags: [
			"security",
			"private"
		]
	},
	{
		emoji: "🔓",
		description: "unlocked",
		category: "Objects",
		aliases: [
			"unlock"
		],
		tags: [
			"security"
		]
	},
	{
		emoji: "❤️",
		description: "red heart",
		category: "Symbols",
		aliases: [
			"heart"
		],
		tags: [
			"love"
		]
	},
	{
		emoji: "💛",
		description: "yellow heart",
		category: "Symbols",
		aliases: [
			"yellow_heart"
		],
		tags: [
		]
	},
	{
		emoji: "💚",
		description: "green heart",
		category: "Symbols",
		aliases: [
			"green_heart"
		],
		tags: [
		]
	},
	{
		emoji: "💙",
		description: "blue heart",
		category: "Symbols",
		aliases: [
			"blue_heart"
		],
		tags: [
		]
	},
	{
		emoji: "💜",
		description: "purple heart",
		category: "Symbols",
		aliases: [
			"purple_heart"
		],
		tags: [
		]
	},
	{
		emoji: "🖤",
		description: "black heart",
		category: "Symbols",
		aliases: [
			"black_heart"
		],
		tags: [
		]
	},
	{
		emoji: "💔",
		description: "broken heart",
		category: "Symbols",
		aliases: [
			"broken_heart"
		],
		tags: [
		]
	},
	{
		emoji: "❣️",
		description: "heavy heart exclamation",
		category: "Symbols",
		aliases: [
			"heavy_heart_exclamation"
		],
		tags: [
		]
	},
	{
		emoji: "💕",
		description: "two hearts",
		category: "Symbols",
		aliases: [
			"two_hearts"
		],
		tags: [
		]
	},
	{
		emoji: "💞",
		description: "revolving hearts",
		category: "Symbols",
		aliases: [
			"revolving_hearts"
		],
		tags: [
		]
	},
	{
		emoji: "💓",
		description: "beating heart",
		category: "Symbols",
		aliases: [
			"heartbeat"
		],
		tags: [
		]
	},
	{
		emoji: "💗",
		description: "growing heart",
		category: "Symbols",
		aliases: [
			"heartpulse"
		],
		tags: [
		]
	},
	{
		emoji: "💖",
		description: "sparkling heart",
		category: "Symbols",
		aliases: [
			"sparkling_heart"
		],
		tags: [
		]
	},
	{
		emoji: "💘",
		description: "heart with arrow",
		category: "Symbols",
		aliases: [
			"cupid"
		],
		tags: [
			"love",
			"heart"
		]
	},
	{
		emoji: "💝",
		description: "heart with ribbon",
		category: "Symbols",
		aliases: [
			"gift_heart"
		],
		tags: [
			"chocolates"
		]
	},
	{
		emoji: "💟",
		description: "heart decoration",
		category: "Symbols",
		aliases: [
			"heart_decoration"
		],
		tags: [
		]
	},
	{
		emoji: "☮️",
		description: "peace symbol",
		category: "Symbols",
		aliases: [
			"peace_symbol"
		],
		tags: [
		]
	},
	{
		emoji: "✝️",
		description: "latin cross",
		category: "Symbols",
		aliases: [
			"latin_cross"
		],
		tags: [
		]
	},
	{
		emoji: "☪️",
		description: "star and crescent",
		category: "Symbols",
		aliases: [
			"star_and_crescent"
		],
		tags: [
		]
	},
	{
		emoji: "🕉",
		description: "om",
		category: "Symbols",
		aliases: [
			"om"
		],
		tags: [
		]
	},
	{
		emoji: "☸️",
		description: "wheel of dharma",
		category: "Symbols",
		aliases: [
			"wheel_of_dharma"
		],
		tags: [
		]
	},
	{
		emoji: "✡️",
		description: "star of David",
		category: "Symbols",
		aliases: [
			"star_of_david"
		],
		tags: [
		]
	},
	{
		emoji: "🔯",
		description: "dotted six-pointed star",
		category: "Symbols",
		aliases: [
			"six_pointed_star"
		],
		tags: [
		]
	},
	{
		emoji: "🕎",
		description: "menorah",
		category: "Symbols",
		aliases: [
			"menorah"
		],
		tags: [
		]
	},
	{
		emoji: "☯️",
		description: "yin yang",
		category: "Symbols",
		aliases: [
			"yin_yang"
		],
		tags: [
		]
	},
	{
		emoji: "☦️",
		description: "orthodox cross",
		category: "Symbols",
		aliases: [
			"orthodox_cross"
		],
		tags: [
		]
	},
	{
		emoji: "🛐",
		description: "place of worship",
		category: "Symbols",
		aliases: [
			"place_of_worship"
		],
		tags: [
		]
	},
	{
		emoji: "⛎",
		description: "Ophiuchus",
		category: "Symbols",
		aliases: [
			"ophiuchus"
		],
		tags: [
		]
	},
	{
		emoji: "♈️",
		description: "Aries",
		category: "Symbols",
		aliases: [
			"aries"
		],
		tags: [
		]
	},
	{
		emoji: "♉️",
		description: "Taurus",
		category: "Symbols",
		aliases: [
			"taurus"
		],
		tags: [
		]
	},
	{
		emoji: "♊️",
		description: "Gemini",
		category: "Symbols",
		aliases: [
			"gemini"
		],
		tags: [
		]
	},
	{
		emoji: "♋️",
		description: "Cancer",
		category: "Symbols",
		aliases: [
			"cancer"
		],
		tags: [
		]
	},
	{
		emoji: "♌️",
		description: "Leo",
		category: "Symbols",
		aliases: [
			"leo"
		],
		tags: [
		]
	},
	{
		emoji: "♍️",
		description: "Virgo",
		category: "Symbols",
		aliases: [
			"virgo"
		],
		tags: [
		]
	},
	{
		emoji: "♎️",
		description: "Libra",
		category: "Symbols",
		aliases: [
			"libra"
		],
		tags: [
		]
	},
	{
		emoji: "♏️",
		description: "Scorpius",
		category: "Symbols",
		aliases: [
			"scorpius"
		],
		tags: [
		]
	},
	{
		emoji: "♐️",
		description: "Sagittarius",
		category: "Symbols",
		aliases: [
			"sagittarius"
		],
		tags: [
		]
	},
	{
		emoji: "♑️",
		description: "Capricorn",
		category: "Symbols",
		aliases: [
			"capricorn"
		],
		tags: [
		]
	},
	{
		emoji: "♒️",
		description: "Aquarius",
		category: "Symbols",
		aliases: [
			"aquarius"
		],
		tags: [
		]
	},
	{
		emoji: "♓️",
		description: "Pisces",
		category: "Symbols",
		aliases: [
			"pisces"
		],
		tags: [
		]
	},
	{
		emoji: "🆔",
		description: "ID button",
		category: "Symbols",
		aliases: [
			"id"
		],
		tags: [
		]
	},
	{
		emoji: "⚛️",
		description: "atom symbol",
		category: "Symbols",
		aliases: [
			"atom_symbol"
		],
		tags: [
		]
	},
	{
		emoji: "🉑",
		description: "Japanese “acceptable” button",
		category: "Symbols",
		aliases: [
			"accept"
		],
		tags: [
		]
	},
	{
		emoji: "☢️",
		description: "radioactive",
		category: "Symbols",
		aliases: [
			"radioactive"
		],
		tags: [
		]
	},
	{
		emoji: "☣️",
		description: "biohazard",
		category: "Symbols",
		aliases: [
			"biohazard"
		],
		tags: [
		]
	},
	{
		emoji: "📴",
		description: "mobile phone off",
		category: "Symbols",
		aliases: [
			"mobile_phone_off"
		],
		tags: [
			"mute",
			"off"
		]
	},
	{
		emoji: "📳",
		description: "vibration mode",
		category: "Symbols",
		aliases: [
			"vibration_mode"
		],
		tags: [
		]
	},
	{
		emoji: "🈶",
		description: "Japanese “not free of charge” button",
		category: "Symbols",
		aliases: [
			"u6709"
		],
		tags: [
		]
	},
	{
		emoji: "🈚️",
		description: "Japanese “free of charge” button",
		category: "Symbols",
		aliases: [
			"u7121"
		],
		tags: [
		]
	},
	{
		emoji: "🈸",
		description: "Japanese “application” button",
		category: "Symbols",
		aliases: [
			"u7533"
		],
		tags: [
		]
	},
	{
		emoji: "🈺",
		description: "Japanese “open for business” button",
		category: "Symbols",
		aliases: [
			"u55b6"
		],
		tags: [
		]
	},
	{
		emoji: "🈷️",
		description: "Japanese “monthly amount” button",
		category: "Symbols",
		aliases: [
			"u6708"
		],
		tags: [
		]
	},
	{
		emoji: "✴️",
		description: "eight-pointed star",
		category: "Symbols",
		aliases: [
			"eight_pointed_black_star"
		],
		tags: [
		]
	},
	{
		emoji: "🆚",
		description: "VS button",
		category: "Symbols",
		aliases: [
			"vs"
		],
		tags: [
		]
	},
	{
		emoji: "💮",
		description: "white flower",
		category: "Symbols",
		aliases: [
			"white_flower"
		],
		tags: [
		]
	},
	{
		emoji: "🉐",
		description: "Japanese “bargain” button",
		category: "Symbols",
		aliases: [
			"ideograph_advantage"
		],
		tags: [
		]
	},
	{
		emoji: "㊙️",
		description: "Japanese “secret” button",
		category: "Symbols",
		aliases: [
			"secret"
		],
		tags: [
		]
	},
	{
		emoji: "㊗️",
		description: "Japanese “congratulations” button",
		category: "Symbols",
		aliases: [
			"congratulations"
		],
		tags: [
		]
	},
	{
		emoji: "🈴",
		description: "Japanese “passing grade” button",
		category: "Symbols",
		aliases: [
			"u5408"
		],
		tags: [
		]
	},
	{
		emoji: "🈵",
		description: "Japanese “no vacancy” button",
		category: "Symbols",
		aliases: [
			"u6e80"
		],
		tags: [
		]
	},
	{
		emoji: "🈹",
		description: "Japanese “discount” button",
		category: "Symbols",
		aliases: [
			"u5272"
		],
		tags: [
		]
	},
	{
		emoji: "🈲",
		description: "Japanese “prohibited” button",
		category: "Symbols",
		aliases: [
			"u7981"
		],
		tags: [
		]
	},
	{
		emoji: "🅰️",
		description: "A button (blood type)",
		category: "Symbols",
		aliases: [
			"a"
		],
		tags: [
		]
	},
	{
		emoji: "🅱️",
		description: "B button (blood type)",
		category: "Symbols",
		aliases: [
			"b"
		],
		tags: [
		]
	},
	{
		emoji: "🆎",
		description: "AB button (blood type)",
		category: "Symbols",
		aliases: [
			"ab"
		],
		tags: [
		]
	},
	{
		emoji: "🆑",
		description: "CL button",
		category: "Symbols",
		aliases: [
			"cl"
		],
		tags: [
		]
	},
	{
		emoji: "🅾️",
		description: "O button (blood type)",
		category: "Symbols",
		aliases: [
			"o2"
		],
		tags: [
		]
	},
	{
		emoji: "🆘",
		description: "SOS button",
		category: "Symbols",
		aliases: [
			"sos"
		],
		tags: [
			"help",
			"emergency"
		]
	},
	{
		emoji: "❌",
		description: "cross mark",
		category: "Symbols",
		aliases: [
			"x"
		],
		tags: [
		]
	},
	{
		emoji: "⭕️",
		description: "heavy large circle",
		category: "Symbols",
		aliases: [
			"o"
		],
		tags: [
		]
	},
	{
		emoji: "🛑",
		description: "stop sign",
		category: "Symbols",
		aliases: [
			"stop_sign"
		],
		tags: [
		]
	},
	{
		emoji: "⛔️",
		description: "no entry",
		category: "Symbols",
		aliases: [
			"no_entry"
		],
		tags: [
			"limit"
		]
	},
	{
		emoji: "📛",
		description: "name badge",
		category: "Symbols",
		aliases: [
			"name_badge"
		],
		tags: [
		]
	},
	{
		emoji: "🚫",
		description: "prohibited",
		category: "Symbols",
		aliases: [
			"no_entry_sign"
		],
		tags: [
			"block",
			"forbidden"
		]
	},
	{
		emoji: "💯",
		description: "hundred points",
		category: "Symbols",
		aliases: [
			"100"
		],
		tags: [
			"score",
			"perfect"
		]
	},
	{
		emoji: "💢",
		description: "anger symbol",
		category: "Symbols",
		aliases: [
			"anger"
		],
		tags: [
			"angry"
		]
	},
	{
		emoji: "♨️",
		description: "hot springs",
		category: "Symbols",
		aliases: [
			"hotsprings"
		],
		tags: [
		]
	},
	{
		emoji: "🚷",
		description: "no pedestrians",
		category: "Symbols",
		aliases: [
			"no_pedestrians"
		],
		tags: [
		]
	},
	{
		emoji: "🚯",
		description: "no littering",
		category: "Symbols",
		aliases: [
			"do_not_litter"
		],
		tags: [
		]
	},
	{
		emoji: "🚳",
		description: "no bicycles",
		category: "Symbols",
		aliases: [
			"no_bicycles"
		],
		tags: [
		]
	},
	{
		emoji: "🚱",
		description: "non-potable water",
		category: "Symbols",
		aliases: [
			"non-potable_water"
		],
		tags: [
		]
	},
	{
		emoji: "🔞",
		description: "no one under eighteen",
		category: "Symbols",
		aliases: [
			"underage"
		],
		tags: [
		]
	},
	{
		emoji: "📵",
		description: "no mobile phones",
		category: "Symbols",
		aliases: [
			"no_mobile_phones"
		],
		tags: [
		]
	},
	{
		emoji: "🚭",
		description: "no smoking",
		category: "Symbols",
		aliases: [
			"no_smoking"
		],
		tags: [
		]
	},
	{
		emoji: "❗️",
		description: "exclamation mark",
		category: "Symbols",
		aliases: [
			"exclamation",
			"heavy_exclamation_mark"
		],
		tags: [
			"bang"
		]
	},
	{
		emoji: "❕",
		description: "white exclamation mark",
		category: "Symbols",
		aliases: [
			"grey_exclamation"
		],
		tags: [
		]
	},
	{
		emoji: "❓",
		description: "question mark",
		category: "Symbols",
		aliases: [
			"question"
		],
		tags: [
			"confused"
		]
	},
	{
		emoji: "❔",
		description: "white question mark",
		category: "Symbols",
		aliases: [
			"grey_question"
		],
		tags: [
		]
	},
	{
		emoji: "‼️",
		description: "double exclamation mark",
		category: "Symbols",
		aliases: [
			"bangbang"
		],
		tags: [
		]
	},
	{
		emoji: "⁉️",
		description: "exclamation question mark",
		category: "Symbols",
		aliases: [
			"interrobang"
		],
		tags: [
		]
	},
	{
		emoji: "🔅",
		description: "dim button",
		category: "Symbols",
		aliases: [
			"low_brightness"
		],
		tags: [
		]
	},
	{
		emoji: "🔆",
		description: "bright button",
		category: "Symbols",
		aliases: [
			"high_brightness"
		],
		tags: [
		]
	},
	{
		emoji: "〽️",
		description: "part alternation mark",
		category: "Symbols",
		aliases: [
			"part_alternation_mark"
		],
		tags: [
		]
	},
	{
		emoji: "⚠️",
		description: "warning",
		category: "Symbols",
		aliases: [
			"warning"
		],
		tags: [
			"wip"
		]
	},
	{
		emoji: "🚸",
		description: "children crossing",
		category: "Symbols",
		aliases: [
			"children_crossing"
		],
		tags: [
		]
	},
	{
		emoji: "🔱",
		description: "trident emblem",
		category: "Symbols",
		aliases: [
			"trident"
		],
		tags: [
		]
	},
	{
		emoji: "⚜️",
		description: "fleur-de-lis",
		category: "Symbols",
		aliases: [
			"fleur_de_lis"
		],
		tags: [
		]
	},
	{
		emoji: "🔰",
		description: "Japanese symbol for beginner",
		category: "Symbols",
		aliases: [
			"beginner"
		],
		tags: [
		]
	},
	{
		emoji: "♻️",
		description: "recycling symbol",
		category: "Symbols",
		aliases: [
			"recycle"
		],
		tags: [
			"environment",
			"green"
		]
	},
	{
		emoji: "✅",
		description: "white heavy check mark",
		category: "Symbols",
		aliases: [
			"white_check_mark"
		],
		tags: [
		]
	},
	{
		emoji: "🈯️",
		description: "Japanese “reserved” button",
		category: "Symbols",
		aliases: [
			"u6307"
		],
		tags: [
		]
	},
	{
		emoji: "💹",
		description: "chart increasing with yen",
		category: "Symbols",
		aliases: [
			"chart"
		],
		tags: [
		]
	},
	{
		emoji: "❇️",
		description: "sparkle",
		category: "Symbols",
		aliases: [
			"sparkle"
		],
		tags: [
		]
	},
	{
		emoji: "✳️",
		description: "eight-spoked asterisk",
		category: "Symbols",
		aliases: [
			"eight_spoked_asterisk"
		],
		tags: [
		]
	},
	{
		emoji: "❎",
		description: "cross mark button",
		category: "Symbols",
		aliases: [
			"negative_squared_cross_mark"
		],
		tags: [
		]
	},
	{
		emoji: "🌐",
		description: "globe with meridians",
		category: "Symbols",
		aliases: [
			"globe_with_meridians"
		],
		tags: [
			"world",
			"global",
			"international"
		]
	},
	{
		emoji: "💠",
		description: "diamond with a dot",
		category: "Symbols",
		aliases: [
			"diamond_shape_with_a_dot_inside"
		],
		tags: [
		]
	},
	{
		emoji: "Ⓜ️",
		description: "circled M",
		category: "Symbols",
		aliases: [
			"m"
		],
		tags: [
		]
	},
	{
		emoji: "🌀",
		description: "cyclone",
		category: "Symbols",
		aliases: [
			"cyclone"
		],
		tags: [
			"swirl"
		]
	},
	{
		emoji: "💤",
		description: "zzz",
		category: "Symbols",
		aliases: [
			"zzz"
		],
		tags: [
			"sleeping"
		]
	},
	{
		emoji: "🏧",
		description: "ATM sign",
		category: "Symbols",
		aliases: [
			"atm"
		],
		tags: [
		]
	},
	{
		emoji: "🚾",
		description: "water closet",
		category: "Symbols",
		aliases: [
			"wc"
		],
		tags: [
			"toilet",
			"restroom"
		]
	},
	{
		emoji: "♿️",
		description: "wheelchair symbol",
		category: "Symbols",
		aliases: [
			"wheelchair"
		],
		tags: [
			"accessibility"
		]
	},
	{
		emoji: "🅿️",
		description: "P button",
		category: "Symbols",
		aliases: [
			"parking"
		],
		tags: [
		]
	},
	{
		emoji: "🈳",
		description: "Japanese “vacancy” button",
		category: "Symbols",
		aliases: [
			"u7a7a"
		],
		tags: [
		]
	},
	{
		emoji: "🈂️",
		description: "Japanese “service charge” button",
		category: "Symbols",
		aliases: [
			"sa"
		],
		tags: [
		]
	},
	{
		emoji: "🛂",
		description: "passport control",
		category: "Symbols",
		aliases: [
			"passport_control"
		],
		tags: [
		]
	},
	{
		emoji: "🛃",
		description: "customs",
		category: "Symbols",
		aliases: [
			"customs"
		],
		tags: [
		]
	},
	{
		emoji: "🛄",
		description: "baggage claim",
		category: "Symbols",
		aliases: [
			"baggage_claim"
		],
		tags: [
			"airport"
		]
	},
	{
		emoji: "🛅",
		description: "left luggage",
		category: "Symbols",
		aliases: [
			"left_luggage"
		],
		tags: [
		]
	},
	{
		emoji: "🚹",
		description: "men’s room",
		category: "Symbols",
		aliases: [
			"mens"
		],
		tags: [
		]
	},
	{
		emoji: "🚺",
		description: "women’s room",
		category: "Symbols",
		aliases: [
			"womens"
		],
		tags: [
		]
	},
	{
		emoji: "🚼",
		description: "baby symbol",
		category: "Symbols",
		aliases: [
			"baby_symbol"
		],
		tags: [
		]
	},
	{
		emoji: "🚻",
		description: "restroom",
		category: "Symbols",
		aliases: [
			"restroom"
		],
		tags: [
			"toilet"
		]
	},
	{
		emoji: "🚮",
		description: "litter in bin sign",
		category: "Symbols",
		aliases: [
			"put_litter_in_its_place"
		],
		tags: [
		]
	},
	{
		emoji: "🎦",
		description: "cinema",
		category: "Symbols",
		aliases: [
			"cinema"
		],
		tags: [
			"film",
			"movie"
		]
	},
	{
		emoji: "📶",
		description: "antenna bars",
		category: "Symbols",
		aliases: [
			"signal_strength"
		],
		tags: [
			"wifi"
		]
	},
	{
		emoji: "🈁",
		description: "Japanese “here” button",
		category: "Symbols",
		aliases: [
			"koko"
		],
		tags: [
		]
	},
	{
		emoji: "🔣",
		description: "input symbols",
		category: "Symbols",
		aliases: [
			"symbols"
		],
		tags: [
		]
	},
	{
		emoji: "ℹ️",
		description: "information",
		category: "Symbols",
		aliases: [
			"information_source"
		],
		tags: [
		]
	},
	{
		emoji: "🔤",
		description: "input latin letters",
		category: "Symbols",
		aliases: [
			"abc"
		],
		tags: [
			"alphabet"
		]
	},
	{
		emoji: "🔡",
		description: "input latin lowercase",
		category: "Symbols",
		aliases: [
			"abcd"
		],
		tags: [
		]
	},
	{
		emoji: "🔠",
		description: "input latin uppercase",
		category: "Symbols",
		aliases: [
			"capital_abcd"
		],
		tags: [
			"letters"
		]
	},
	{
		emoji: "🆖",
		description: "NG button",
		category: "Symbols",
		aliases: [
			"ng"
		],
		tags: [
		]
	},
	{
		emoji: "🆗",
		description: "OK button",
		category: "Symbols",
		aliases: [
			"ok"
		],
		tags: [
			"yes"
		]
	},
	{
		emoji: "🆙",
		description: "UP! button",
		category: "Symbols",
		aliases: [
			"up"
		],
		tags: [
		]
	},
	{
		emoji: "🆒",
		description: "COOL button",
		category: "Symbols",
		aliases: [
			"cool"
		],
		tags: [
		]
	},
	{
		emoji: "🆕",
		description: "NEW button",
		category: "Symbols",
		aliases: [
			"new"
		],
		tags: [
			"fresh"
		]
	},
	{
		emoji: "🆓",
		description: "FREE button",
		category: "Symbols",
		aliases: [
			"free"
		],
		tags: [
		]
	},
	{
		emoji: "0️⃣",
		description: "keycap: 0",
		category: "Symbols",
		aliases: [
			"zero"
		],
		tags: [
		]
	},
	{
		emoji: "1️⃣",
		description: "keycap: 1",
		category: "Symbols",
		aliases: [
			"one"
		],
		tags: [
		]
	},
	{
		emoji: "2️⃣",
		description: "keycap: 2",
		category: "Symbols",
		aliases: [
			"two"
		],
		tags: [
		]
	},
	{
		emoji: "3️⃣",
		description: "keycap: 3",
		category: "Symbols",
		aliases: [
			"three"
		],
		tags: [
		]
	},
	{
		emoji: "4️⃣",
		description: "keycap: 4",
		category: "Symbols",
		aliases: [
			"four"
		],
		tags: [
		]
	},
	{
		emoji: "5️⃣",
		description: "keycap: 5",
		category: "Symbols",
		aliases: [
			"five"
		],
		tags: [
		]
	},
	{
		emoji: "6️⃣",
		description: "keycap: 6",
		category: "Symbols",
		aliases: [
			"six"
		],
		tags: [
		]
	},
	{
		emoji: "7️⃣",
		description: "keycap: 7",
		category: "Symbols",
		aliases: [
			"seven"
		],
		tags: [
		]
	},
	{
		emoji: "8️⃣",
		description: "keycap: 8",
		category: "Symbols",
		aliases: [
			"eight"
		],
		tags: [
		]
	},
	{
		emoji: "9️⃣",
		description: "keycap: 9",
		category: "Symbols",
		aliases: [
			"nine"
		],
		tags: [
		]
	},
	{
		emoji: "🔟",
		description: "keycap 10",
		category: "Symbols",
		aliases: [
			"keycap_ten"
		],
		tags: [
		]
	},
	{
		emoji: "🔢",
		description: "input numbers",
		category: "Symbols",
		aliases: [
			"1234"
		],
		tags: [
			"numbers"
		]
	},
	{
		emoji: "#️⃣",
		description: "keycap: #",
		category: "Symbols",
		aliases: [
			"hash"
		],
		tags: [
			"number"
		]
	},
	{
		emoji: "*️⃣",
		description: "keycap: *",
		category: "Symbols",
		aliases: [
			"asterisk"
		],
		tags: [
		]
	},
	{
		emoji: "▶️",
		description: "play button",
		category: "Symbols",
		aliases: [
			"arrow_forward"
		],
		tags: [
		]
	},
	{
		emoji: "⏸",
		description: "pause button",
		category: "Symbols",
		aliases: [
			"pause_button"
		],
		tags: [
		]
	},
	{
		emoji: "⏯",
		description: "play or pause button",
		category: "Symbols",
		aliases: [
			"play_or_pause_button"
		],
		tags: [
		]
	},
	{
		emoji: "⏹",
		description: "stop button",
		category: "Symbols",
		aliases: [
			"stop_button"
		],
		tags: [
		]
	},
	{
		emoji: "⏺",
		description: "record button",
		category: "Symbols",
		aliases: [
			"record_button"
		],
		tags: [
		]
	},
	{
		emoji: "⏭",
		description: "next track button",
		category: "Symbols",
		aliases: [
			"next_track_button"
		],
		tags: [
		]
	},
	{
		emoji: "⏮",
		description: "last track button",
		category: "Symbols",
		aliases: [
			"previous_track_button"
		],
		tags: [
		]
	},
	{
		emoji: "⏩",
		description: "fast-forward button",
		category: "Symbols",
		aliases: [
			"fast_forward"
		],
		tags: [
		]
	},
	{
		emoji: "⏪",
		description: "fast reverse button",
		category: "Symbols",
		aliases: [
			"rewind"
		],
		tags: [
		]
	},
	{
		emoji: "⏫",
		description: "fast up button",
		category: "Symbols",
		aliases: [
			"arrow_double_up"
		],
		tags: [
		]
	},
	{
		emoji: "⏬",
		description: "fast down button",
		category: "Symbols",
		aliases: [
			"arrow_double_down"
		],
		tags: [
		]
	},
	{
		emoji: "◀️",
		description: "reverse button",
		category: "Symbols",
		aliases: [
			"arrow_backward"
		],
		tags: [
		]
	},
	{
		emoji: "🔼",
		description: "up button",
		category: "Symbols",
		aliases: [
			"arrow_up_small"
		],
		tags: [
		]
	},
	{
		emoji: "🔽",
		description: "down button",
		category: "Symbols",
		aliases: [
			"arrow_down_small"
		],
		tags: [
		]
	},
	{
		emoji: "➡️",
		description: "right arrow",
		category: "Symbols",
		aliases: [
			"arrow_right"
		],
		tags: [
		]
	},
	{
		emoji: "⬅️",
		description: "left arrow",
		category: "Symbols",
		aliases: [
			"arrow_left"
		],
		tags: [
		]
	},
	{
		emoji: "⬆️",
		description: "up arrow",
		category: "Symbols",
		aliases: [
			"arrow_up"
		],
		tags: [
		]
	},
	{
		emoji: "⬇️",
		description: "down arrow",
		category: "Symbols",
		aliases: [
			"arrow_down"
		],
		tags: [
		]
	},
	{
		emoji: "↗️",
		description: "up-right arrow",
		category: "Symbols",
		aliases: [
			"arrow_upper_right"
		],
		tags: [
		]
	},
	{
		emoji: "↘️",
		description: "down-right arrow",
		category: "Symbols",
		aliases: [
			"arrow_lower_right"
		],
		tags: [
		]
	},
	{
		emoji: "↙️",
		description: "down-left arrow",
		category: "Symbols",
		aliases: [
			"arrow_lower_left"
		],
		tags: [
		]
	},
	{
		emoji: "↖️",
		description: "up-left arrow",
		category: "Symbols",
		aliases: [
			"arrow_upper_left"
		],
		tags: [
		]
	},
	{
		emoji: "↕️",
		description: "up-down arrow",
		category: "Symbols",
		aliases: [
			"arrow_up_down"
		],
		tags: [
		]
	},
	{
		emoji: "↔️",
		description: "left-right arrow",
		category: "Symbols",
		aliases: [
			"left_right_arrow"
		],
		tags: [
		]
	},
	{
		emoji: "↪️",
		description: "left arrow curving right",
		category: "Symbols",
		aliases: [
			"arrow_right_hook"
		],
		tags: [
		]
	},
	{
		emoji: "↩️",
		description: "right arrow curving left",
		category: "Symbols",
		aliases: [
			"leftwards_arrow_with_hook"
		],
		tags: [
			"return"
		]
	},
	{
		emoji: "⤴️",
		description: "right arrow curving up",
		category: "Symbols",
		aliases: [
			"arrow_heading_up"
		],
		tags: [
		]
	},
	{
		emoji: "⤵️",
		description: "right arrow curving down",
		category: "Symbols",
		aliases: [
			"arrow_heading_down"
		],
		tags: [
		]
	},
	{
		emoji: "🔀",
		description: "shuffle tracks button",
		category: "Symbols",
		aliases: [
			"twisted_rightwards_arrows"
		],
		tags: [
			"shuffle"
		]
	},
	{
		emoji: "🔁",
		description: "repeat button",
		category: "Symbols",
		aliases: [
			"repeat"
		],
		tags: [
			"loop"
		]
	},
	{
		emoji: "🔂",
		description: "repeat single button",
		category: "Symbols",
		aliases: [
			"repeat_one"
		],
		tags: [
		]
	},
	{
		emoji: "🔄",
		description: "anticlockwise arrows button",
		category: "Symbols",
		aliases: [
			"arrows_counterclockwise"
		],
		tags: [
			"sync"
		]
	},
	{
		emoji: "🔃",
		description: "clockwise vertical arrows",
		category: "Symbols",
		aliases: [
			"arrows_clockwise"
		],
		tags: [
		]
	},
	{
		emoji: "🎵",
		description: "musical note",
		category: "Symbols",
		aliases: [
			"musical_note"
		],
		tags: [
		]
	},
	{
		emoji: "🎶",
		description: "musical notes",
		category: "Symbols",
		aliases: [
			"notes"
		],
		tags: [
			"music"
		]
	},
	{
		emoji: "➕",
		description: "heavy plus sign",
		category: "Symbols",
		aliases: [
			"heavy_plus_sign"
		],
		tags: [
		]
	},
	{
		emoji: "➖",
		description: "heavy minus sign",
		category: "Symbols",
		aliases: [
			"heavy_minus_sign"
		],
		tags: [
		]
	},
	{
		emoji: "➗",
		description: "heavy division sign",
		category: "Symbols",
		aliases: [
			"heavy_division_sign"
		],
		tags: [
		]
	},
	{
		emoji: "✖️",
		description: "heavy multiplication x",
		category: "Symbols",
		aliases: [
			"heavy_multiplication_x"
		],
		tags: [
		]
	},
	{
		emoji: "💲",
		description: "heavy dollar sign",
		category: "Symbols",
		aliases: [
			"heavy_dollar_sign"
		],
		tags: [
		]
	},
	{
		emoji: "💱",
		description: "currency exchange",
		category: "Symbols",
		aliases: [
			"currency_exchange"
		],
		tags: [
		]
	},
	{
		emoji: "™️",
		description: "trade mark",
		category: "Symbols",
		aliases: [
			"tm"
		],
		tags: [
			"trademark"
		]
	},
	{
		emoji: "©️",
		description: "copyright",
		category: "Symbols",
		aliases: [
			"copyright"
		],
		tags: [
		]
	},
	{
		emoji: "®️",
		description: "registered",
		category: "Symbols",
		aliases: [
			"registered"
		],
		tags: [
		]
	},
	{
		emoji: "〰️",
		description: "wavy dash",
		category: "Symbols",
		aliases: [
			"wavy_dash"
		],
		tags: [
		]
	},
	{
		emoji: "➰",
		description: "curly loop",
		category: "Symbols",
		aliases: [
			"curly_loop"
		],
		tags: [
		]
	},
	{
		emoji: "➿",
		description: "double curly loop",
		category: "Symbols",
		aliases: [
			"loop"
		],
		tags: [
		]
	},
	{
		emoji: "🔚",
		description: "END arrow",
		category: "Symbols",
		aliases: [
			"end"
		],
		tags: [
		]
	},
	{
		emoji: "🔙",
		description: "BACK arrow",
		category: "Symbols",
		aliases: [
			"back"
		],
		tags: [
		]
	},
	{
		emoji: "🔛",
		description: "ON! arrow",
		category: "Symbols",
		aliases: [
			"on"
		],
		tags: [
		]
	},
	{
		emoji: "🔝",
		description: "TOP arrow",
		category: "Symbols",
		aliases: [
			"top"
		],
		tags: [
		]
	},
	{
		emoji: "🔜",
		description: "SOON arrow",
		category: "Symbols",
		aliases: [
			"soon"
		],
		tags: [
		]
	},
	{
		emoji: "✔️",
		description: "heavy check mark",
		category: "Symbols",
		aliases: [
			"heavy_check_mark"
		],
		tags: [
		]
	},
	{
		emoji: "☑️",
		description: "ballot box with check",
		category: "Symbols",
		aliases: [
			"ballot_box_with_check"
		],
		tags: [
		]
	},
	{
		emoji: "🔘",
		description: "radio button",
		category: "Symbols",
		aliases: [
			"radio_button"
		],
		tags: [
		]
	},
	{
		emoji: "⚪️",
		description: "white circle",
		category: "Symbols",
		aliases: [
			"white_circle"
		],
		tags: [
		]
	},
	{
		emoji: "⚫️",
		description: "black circle",
		category: "Symbols",
		aliases: [
			"black_circle"
		],
		tags: [
		]
	},
	{
		emoji: "🔴",
		description: "red circle",
		category: "Symbols",
		aliases: [
			"red_circle"
		],
		tags: [
		]
	},
	{
		emoji: "🔵",
		description: "blue circle",
		category: "Symbols",
		aliases: [
			"large_blue_circle"
		],
		tags: [
		]
	},
	{
		emoji: "🔺",
		description: "red triangle pointed up",
		category: "Symbols",
		aliases: [
			"small_red_triangle"
		],
		tags: [
		]
	},
	{
		emoji: "🔻",
		description: "red triangle pointed down",
		category: "Symbols",
		aliases: [
			"small_red_triangle_down"
		],
		tags: [
		]
	},
	{
		emoji: "🔸",
		description: "small orange diamond",
		category: "Symbols",
		aliases: [
			"small_orange_diamond"
		],
		tags: [
		]
	},
	{
		emoji: "🔹",
		description: "small blue diamond",
		category: "Symbols",
		aliases: [
			"small_blue_diamond"
		],
		tags: [
		]
	},
	{
		emoji: "🔶",
		description: "large orange diamond",
		category: "Symbols",
		aliases: [
			"large_orange_diamond"
		],
		tags: [
		]
	},
	{
		emoji: "🔷",
		description: "large blue diamond",
		category: "Symbols",
		aliases: [
			"large_blue_diamond"
		],
		tags: [
		]
	},
	{
		emoji: "🔳",
		description: "white square button",
		category: "Symbols",
		aliases: [
			"white_square_button"
		],
		tags: [
		]
	},
	{
		emoji: "🔲",
		description: "black square button",
		category: "Symbols",
		aliases: [
			"black_square_button"
		],
		tags: [
		]
	},
	{
		emoji: "▪️",
		description: "black small square",
		category: "Symbols",
		aliases: [
			"black_small_square"
		],
		tags: [
		]
	},
	{
		emoji: "▫️",
		description: "white small square",
		category: "Symbols",
		aliases: [
			"white_small_square"
		],
		tags: [
		]
	},
	{
		emoji: "◾️",
		description: "black medium-small square",
		category: "Symbols",
		aliases: [
			"black_medium_small_square"
		],
		tags: [
		]
	},
	{
		emoji: "◽️",
		description: "white medium-small square",
		category: "Symbols",
		aliases: [
			"white_medium_small_square"
		],
		tags: [
		]
	},
	{
		emoji: "◼️",
		description: "black medium square",
		category: "Symbols",
		aliases: [
			"black_medium_square"
		],
		tags: [
		]
	},
	{
		emoji: "◻️",
		description: "white medium square",
		category: "Symbols",
		aliases: [
			"white_medium_square"
		],
		tags: [
		]
	},
	{
		emoji: "⬛️",
		description: "black large square",
		category: "Symbols",
		aliases: [
			"black_large_square"
		],
		tags: [
		]
	},
	{
		emoji: "⬜️",
		description: "white large square",
		category: "Symbols",
		aliases: [
			"white_large_square"
		],
		tags: [
		]
	},
	{
		emoji: "🔈",
		description: "speaker low volume",
		category: "Symbols",
		aliases: [
			"speaker"
		],
		tags: [
		]
	},
	{
		emoji: "🔇",
		description: "muted speaker",
		category: "Symbols",
		aliases: [
			"mute"
		],
		tags: [
			"sound",
			"volume"
		]
	},
	{
		emoji: "🔉",
		description: "speaker medium volume",
		category: "Symbols",
		aliases: [
			"sound"
		],
		tags: [
			"volume"
		]
	},
	{
		emoji: "🔊",
		description: "speaker high volume",
		category: "Symbols",
		aliases: [
			"loud_sound"
		],
		tags: [
			"volume"
		]
	},
	{
		emoji: "🔔",
		description: "bell",
		category: "Symbols",
		aliases: [
			"bell"
		],
		tags: [
			"sound",
			"notification"
		]
	},
	{
		emoji: "🔕",
		description: "bell with slash",
		category: "Symbols",
		aliases: [
			"no_bell"
		],
		tags: [
			"volume",
			"off"
		]
	},
	{
		emoji: "📣",
		description: "megaphone",
		category: "Symbols",
		aliases: [
			"mega"
		],
		tags: [
		]
	},
	{
		emoji: "📢",
		description: "loudspeaker",
		category: "Symbols",
		aliases: [
			"loudspeaker"
		],
		tags: [
			"announcement"
		]
	},
	{
		emoji: "👁‍🗨",
		description: "eye in speech bubble",
		category: "Symbols",
		aliases: [
			"eye_speech_bubble"
		],
		tags: [
		]
	},
	{
		emoji: "💬",
		description: "speech balloon",
		category: "Symbols",
		aliases: [
			"speech_balloon"
		],
		tags: [
			"comment"
		]
	},
	{
		emoji: "💭",
		description: "thought balloon",
		category: "Symbols",
		aliases: [
			"thought_balloon"
		],
		tags: [
			"thinking"
		]
	},
	{
		emoji: "🗯",
		description: "right anger bubble",
		category: "Symbols",
		aliases: [
			"right_anger_bubble"
		],
		tags: [
		]
	},
	{
		emoji: "♠️",
		description: "spade suit",
		category: "Symbols",
		aliases: [
			"spades"
		],
		tags: [
		]
	},
	{
		emoji: "♣️",
		description: "club suit",
		category: "Symbols",
		aliases: [
			"clubs"
		],
		tags: [
		]
	},
	{
		emoji: "♥️",
		description: "heart suit",
		category: "Symbols",
		aliases: [
			"hearts"
		],
		tags: [
		]
	},
	{
		emoji: "♦️",
		description: "diamond suit",
		category: "Symbols",
		aliases: [
			"diamonds"
		],
		tags: [
		]
	},
	{
		emoji: "🃏",
		description: "joker",
		category: "Symbols",
		aliases: [
			"black_joker"
		],
		tags: [
		]
	},
	{
		emoji: "🎴",
		description: "flower playing cards",
		category: "Symbols",
		aliases: [
			"flower_playing_cards"
		],
		tags: [
		]
	},
	{
		emoji: "🀄️",
		description: "mahjong red dragon",
		category: "Symbols",
		aliases: [
			"mahjong"
		],
		tags: [
		]
	},
	{
		emoji: "🕐",
		description: "one o’clock",
		category: "Symbols",
		aliases: [
			"clock1"
		],
		tags: [
		]
	},
	{
		emoji: "🕑",
		description: "two o’clock",
		category: "Symbols",
		aliases: [
			"clock2"
		],
		tags: [
		]
	},
	{
		emoji: "🕒",
		description: "three o’clock",
		category: "Symbols",
		aliases: [
			"clock3"
		],
		tags: [
		]
	},
	{
		emoji: "🕓",
		description: "four o’clock",
		category: "Symbols",
		aliases: [
			"clock4"
		],
		tags: [
		]
	},
	{
		emoji: "🕔",
		description: "five o’clock",
		category: "Symbols",
		aliases: [
			"clock5"
		],
		tags: [
		]
	},
	{
		emoji: "🕕",
		description: "six o’clock",
		category: "Symbols",
		aliases: [
			"clock6"
		],
		tags: [
		]
	},
	{
		emoji: "🕖",
		description: "seven o’clock",
		category: "Symbols",
		aliases: [
			"clock7"
		],
		tags: [
		]
	},
	{
		emoji: "🕗",
		description: "eight o’clock",
		category: "Symbols",
		aliases: [
			"clock8"
		],
		tags: [
		]
	},
	{
		emoji: "🕘",
		description: "nine o’clock",
		category: "Symbols",
		aliases: [
			"clock9"
		],
		tags: [
		]
	},
	{
		emoji: "🕙",
		description: "ten o’clock",
		category: "Symbols",
		aliases: [
			"clock10"
		],
		tags: [
		]
	},
	{
		emoji: "🕚",
		description: "eleven o’clock",
		category: "Symbols",
		aliases: [
			"clock11"
		],
		tags: [
		]
	},
	{
		emoji: "🕛",
		description: "twelve o’clock",
		category: "Symbols",
		aliases: [
			"clock12"
		],
		tags: [
		]
	},
	{
		emoji: "🕜",
		description: "one-thirty",
		category: "Symbols",
		aliases: [
			"clock130"
		],
		tags: [
		]
	},
	{
		emoji: "🕝",
		description: "two-thirty",
		category: "Symbols",
		aliases: [
			"clock230"
		],
		tags: [
		]
	},
	{
		emoji: "🕞",
		description: "three-thirty",
		category: "Symbols",
		aliases: [
			"clock330"
		],
		tags: [
		]
	},
	{
		emoji: "🕟",
		description: "four-thirty",
		category: "Symbols",
		aliases: [
			"clock430"
		],
		tags: [
		]
	},
	{
		emoji: "🕠",
		description: "five-thirty",
		category: "Symbols",
		aliases: [
			"clock530"
		],
		tags: [
		]
	},
	{
		emoji: "🕡",
		description: "six-thirty",
		category: "Symbols",
		aliases: [
			"clock630"
		],
		tags: [
		]
	},
	{
		emoji: "🕢",
		description: "seven-thirty",
		category: "Symbols",
		aliases: [
			"clock730"
		],
		tags: [
		]
	},
	{
		emoji: "🕣",
		description: "eight-thirty",
		category: "Symbols",
		aliases: [
			"clock830"
		],
		tags: [
		]
	},
	{
		emoji: "🕤",
		description: "nine-thirty",
		category: "Symbols",
		aliases: [
			"clock930"
		],
		tags: [
		]
	},
	{
		emoji: "🕥",
		description: "ten-thirty",
		category: "Symbols",
		aliases: [
			"clock1030"
		],
		tags: [
		]
	},
	{
		emoji: "🕦",
		description: "eleven-thirty",
		category: "Symbols",
		aliases: [
			"clock1130"
		],
		tags: [
		]
	},
	{
		emoji: "🕧",
		description: "twelve-thirty",
		category: "Symbols",
		aliases: [
			"clock1230"
		],
		tags: [
		]
	},
	{
		emoji: "🏳️",
		description: "white flag",
		category: "Flags",
		aliases: [
			"white_flag"
		],
		tags: [
		]
	},
	{
		emoji: "🏴",
		description: "black flag",
		category: "Flags",
		aliases: [
			"black_flag"
		],
		tags: [
		]
	},
	{
		emoji: "🏁",
		description: "chequered flag",
		category: "Flags",
		aliases: [
			"checkered_flag"
		],
		tags: [
			"milestone",
			"finish"
		]
	},
	{
		emoji: "🚩",
		description: "triangular flag",
		category: "Flags",
		aliases: [
			"triangular_flag_on_post"
		],
		tags: [
		]
	},
	{
		emoji: "🏳️‍🌈",
		description: "rainbow flag",
		category: "Flags",
		aliases: [
			"rainbow_flag"
		],
		tags: [
			"pride"
		]
	},
	{
		emoji: "🇦🇫",
		description: "Afghanistan",
		category: "Flags",
		aliases: [
			"afghanistan"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇽",
		description: "Åland Islands",
		category: "Flags",
		aliases: [
			"aland_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇱",
		description: "Albania",
		category: "Flags",
		aliases: [
			"albania"
		],
		tags: [
		]
	},
	{
		emoji: "🇩🇿",
		description: "Algeria",
		category: "Flags",
		aliases: [
			"algeria"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇸",
		description: "American Samoa",
		category: "Flags",
		aliases: [
			"american_samoa"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇩",
		description: "Andorra",
		category: "Flags",
		aliases: [
			"andorra"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇴",
		description: "Angola",
		category: "Flags",
		aliases: [
			"angola"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇮",
		description: "Anguilla",
		category: "Flags",
		aliases: [
			"anguilla"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇶",
		description: "Antarctica",
		category: "Flags",
		aliases: [
			"antarctica"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇬",
		description: "Antigua & Barbuda",
		category: "Flags",
		aliases: [
			"antigua_barbuda"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇷",
		description: "Argentina",
		category: "Flags",
		aliases: [
			"argentina"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇲",
		description: "Armenia",
		category: "Flags",
		aliases: [
			"armenia"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇼",
		description: "Aruba",
		category: "Flags",
		aliases: [
			"aruba"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇺",
		description: "Australia",
		category: "Flags",
		aliases: [
			"australia"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇹",
		description: "Austria",
		category: "Flags",
		aliases: [
			"austria"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇿",
		description: "Azerbaijan",
		category: "Flags",
		aliases: [
			"azerbaijan"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇸",
		description: "Bahamas",
		category: "Flags",
		aliases: [
			"bahamas"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇭",
		description: "Bahrain",
		category: "Flags",
		aliases: [
			"bahrain"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇩",
		description: "Bangladesh",
		category: "Flags",
		aliases: [
			"bangladesh"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇧",
		description: "Barbados",
		category: "Flags",
		aliases: [
			"barbados"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇾",
		description: "Belarus",
		category: "Flags",
		aliases: [
			"belarus"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇪",
		description: "Belgium",
		category: "Flags",
		aliases: [
			"belgium"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇿",
		description: "Belize",
		category: "Flags",
		aliases: [
			"belize"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇯",
		description: "Benin",
		category: "Flags",
		aliases: [
			"benin"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇲",
		description: "Bermuda",
		category: "Flags",
		aliases: [
			"bermuda"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇹",
		description: "Bhutan",
		category: "Flags",
		aliases: [
			"bhutan"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇴",
		description: "Bolivia",
		category: "Flags",
		aliases: [
			"bolivia"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇶",
		description: "Caribbean Netherlands",
		category: "Flags",
		aliases: [
			"caribbean_netherlands"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇦",
		description: "Bosnia & Herzegovina",
		category: "Flags",
		aliases: [
			"bosnia_herzegovina"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇼",
		description: "Botswana",
		category: "Flags",
		aliases: [
			"botswana"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇷",
		description: "Brazil",
		category: "Flags",
		aliases: [
			"brazil"
		],
		tags: [
		]
	},
	{
		emoji: "🇮🇴",
		description: "British Indian Ocean Territory",
		category: "Flags",
		aliases: [
			"british_indian_ocean_territory"
		],
		tags: [
		]
	},
	{
		emoji: "🇻🇬",
		description: "British Virgin Islands",
		category: "Flags",
		aliases: [
			"british_virgin_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇳",
		description: "Brunei",
		category: "Flags",
		aliases: [
			"brunei"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇬",
		description: "Bulgaria",
		category: "Flags",
		aliases: [
			"bulgaria"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇫",
		description: "Burkina Faso",
		category: "Flags",
		aliases: [
			"burkina_faso"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇮",
		description: "Burundi",
		category: "Flags",
		aliases: [
			"burundi"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇻",
		description: "Cape Verde",
		category: "Flags",
		aliases: [
			"cape_verde"
		],
		tags: [
		]
	},
	{
		emoji: "🇰🇭",
		description: "Cambodia",
		category: "Flags",
		aliases: [
			"cambodia"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇲",
		description: "Cameroon",
		category: "Flags",
		aliases: [
			"cameroon"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇦",
		description: "Canada",
		category: "Flags",
		aliases: [
			"canada"
		],
		tags: [
		]
	},
	{
		emoji: "🇮🇨",
		description: "Canary Islands",
		category: "Flags",
		aliases: [
			"canary_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇰🇾",
		description: "Cayman Islands",
		category: "Flags",
		aliases: [
			"cayman_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇫",
		description: "Central African Republic",
		category: "Flags",
		aliases: [
			"central_african_republic"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇩",
		description: "Chad",
		category: "Flags",
		aliases: [
			"chad"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇱",
		description: "Chile",
		category: "Flags",
		aliases: [
			"chile"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇳",
		description: "China",
		category: "Flags",
		aliases: [
			"cn"
		],
		tags: [
			"china"
		]
	},
	{
		emoji: "🇨🇽",
		description: "Christmas Island",
		category: "Flags",
		aliases: [
			"christmas_island"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇨",
		description: "Cocos (Keeling) Islands",
		category: "Flags",
		aliases: [
			"cocos_islands"
		],
		tags: [
			"keeling"
		]
	},
	{
		emoji: "🇨🇴",
		description: "Colombia",
		category: "Flags",
		aliases: [
			"colombia"
		],
		tags: [
		]
	},
	{
		emoji: "🇰🇲",
		description: "Comoros",
		category: "Flags",
		aliases: [
			"comoros"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇬",
		description: "Congo - Brazzaville",
		category: "Flags",
		aliases: [
			"congo_brazzaville"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇩",
		description: "Congo - Kinshasa",
		category: "Flags",
		aliases: [
			"congo_kinshasa"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇰",
		description: "Cook Islands",
		category: "Flags",
		aliases: [
			"cook_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇷",
		description: "Costa Rica",
		category: "Flags",
		aliases: [
			"costa_rica"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇮",
		description: "Côte d’Ivoire",
		category: "Flags",
		aliases: [
			"cote_divoire"
		],
		tags: [
			"ivory"
		]
	},
	{
		emoji: "🇭🇷",
		description: "Croatia",
		category: "Flags",
		aliases: [
			"croatia"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇺",
		description: "Cuba",
		category: "Flags",
		aliases: [
			"cuba"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇼",
		description: "Curaçao",
		category: "Flags",
		aliases: [
			"curacao"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇾",
		description: "Cyprus",
		category: "Flags",
		aliases: [
			"cyprus"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇿",
		description: "Czech Republic",
		category: "Flags",
		aliases: [
			"czech_republic"
		],
		tags: [
		]
	},
	{
		emoji: "🇩🇰",
		description: "Denmark",
		category: "Flags",
		aliases: [
			"denmark"
		],
		tags: [
		]
	},
	{
		emoji: "🇩🇯",
		description: "Djibouti",
		category: "Flags",
		aliases: [
			"djibouti"
		],
		tags: [
		]
	},
	{
		emoji: "🇩🇲",
		description: "Dominica",
		category: "Flags",
		aliases: [
			"dominica"
		],
		tags: [
		]
	},
	{
		emoji: "🇩🇴",
		description: "Dominican Republic",
		category: "Flags",
		aliases: [
			"dominican_republic"
		],
		tags: [
		]
	},
	{
		emoji: "🇪🇨",
		description: "Ecuador",
		category: "Flags",
		aliases: [
			"ecuador"
		],
		tags: [
		]
	},
	{
		emoji: "🇪🇬",
		description: "Egypt",
		category: "Flags",
		aliases: [
			"egypt"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇻",
		description: "El Salvador",
		category: "Flags",
		aliases: [
			"el_salvador"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇶",
		description: "Equatorial Guinea",
		category: "Flags",
		aliases: [
			"equatorial_guinea"
		],
		tags: [
		]
	},
	{
		emoji: "🇪🇷",
		description: "Eritrea",
		category: "Flags",
		aliases: [
			"eritrea"
		],
		tags: [
		]
	},
	{
		emoji: "🇪🇪",
		description: "Estonia",
		category: "Flags",
		aliases: [
			"estonia"
		],
		tags: [
		]
	},
	{
		emoji: "🇪🇹",
		description: "Ethiopia",
		category: "Flags",
		aliases: [
			"ethiopia"
		],
		tags: [
		]
	},
	{
		emoji: "🇪🇺",
		description: "European Union",
		category: "Flags",
		aliases: [
			"eu",
			"european_union"
		],
		tags: [
		]
	},
	{
		emoji: "🇫🇰",
		description: "Falkland Islands",
		category: "Flags",
		aliases: [
			"falkland_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇫🇴",
		description: "Faroe Islands",
		category: "Flags",
		aliases: [
			"faroe_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇫🇯",
		description: "Fiji",
		category: "Flags",
		aliases: [
			"fiji"
		],
		tags: [
		]
	},
	{
		emoji: "🇫🇮",
		description: "Finland",
		category: "Flags",
		aliases: [
			"finland"
		],
		tags: [
		]
	},
	{
		emoji: "🇫🇷",
		description: "France",
		category: "Flags",
		aliases: [
			"fr"
		],
		tags: [
			"france",
			"french"
		]
	},
	{
		emoji: "🇬🇫",
		description: "French Guiana",
		category: "Flags",
		aliases: [
			"french_guiana"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇫",
		description: "French Polynesia",
		category: "Flags",
		aliases: [
			"french_polynesia"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇫",
		description: "French Southern Territories",
		category: "Flags",
		aliases: [
			"french_southern_territories"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇦",
		description: "Gabon",
		category: "Flags",
		aliases: [
			"gabon"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇲",
		description: "Gambia",
		category: "Flags",
		aliases: [
			"gambia"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇪",
		description: "Georgia",
		category: "Flags",
		aliases: [
			"georgia"
		],
		tags: [
		]
	},
	{
		emoji: "🇩🇪",
		description: "Germany",
		category: "Flags",
		aliases: [
			"de"
		],
		tags: [
			"flag",
			"germany"
		]
	},
	{
		emoji: "🇬🇭",
		description: "Ghana",
		category: "Flags",
		aliases: [
			"ghana"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇮",
		description: "Gibraltar",
		category: "Flags",
		aliases: [
			"gibraltar"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇷",
		description: "Greece",
		category: "Flags",
		aliases: [
			"greece"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇱",
		description: "Greenland",
		category: "Flags",
		aliases: [
			"greenland"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇩",
		description: "Grenada",
		category: "Flags",
		aliases: [
			"grenada"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇵",
		description: "Guadeloupe",
		category: "Flags",
		aliases: [
			"guadeloupe"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇺",
		description: "Guam",
		category: "Flags",
		aliases: [
			"guam"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇹",
		description: "Guatemala",
		category: "Flags",
		aliases: [
			"guatemala"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇬",
		description: "Guernsey",
		category: "Flags",
		aliases: [
			"guernsey"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇳",
		description: "Guinea",
		category: "Flags",
		aliases: [
			"guinea"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇼",
		description: "Guinea-Bissau",
		category: "Flags",
		aliases: [
			"guinea_bissau"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇾",
		description: "Guyana",
		category: "Flags",
		aliases: [
			"guyana"
		],
		tags: [
		]
	},
	{
		emoji: "🇭🇹",
		description: "Haiti",
		category: "Flags",
		aliases: [
			"haiti"
		],
		tags: [
		]
	},
	{
		emoji: "🇭🇳",
		description: "Honduras",
		category: "Flags",
		aliases: [
			"honduras"
		],
		tags: [
		]
	},
	{
		emoji: "🇭🇰",
		description: "Hong Kong SAR China",
		category: "Flags",
		aliases: [
			"hong_kong"
		],
		tags: [
		]
	},
	{
		emoji: "🇭🇺",
		description: "Hungary",
		category: "Flags",
		aliases: [
			"hungary"
		],
		tags: [
		]
	},
	{
		emoji: "🇮🇸",
		description: "Iceland",
		category: "Flags",
		aliases: [
			"iceland"
		],
		tags: [
		]
	},
	{
		emoji: "🇮🇳",
		description: "India",
		category: "Flags",
		aliases: [
			"india"
		],
		tags: [
		]
	},
	{
		emoji: "🇮🇩",
		description: "Indonesia",
		category: "Flags",
		aliases: [
			"indonesia"
		],
		tags: [
		]
	},
	{
		emoji: "🇮🇷",
		description: "Iran",
		category: "Flags",
		aliases: [
			"iran"
		],
		tags: [
		]
	},
	{
		emoji: "🇮🇶",
		description: "Iraq",
		category: "Flags",
		aliases: [
			"iraq"
		],
		tags: [
		]
	},
	{
		emoji: "🇮🇪",
		description: "Ireland",
		category: "Flags",
		aliases: [
			"ireland"
		],
		tags: [
		]
	},
	{
		emoji: "🇮🇲",
		description: "Isle of Man",
		category: "Flags",
		aliases: [
			"isle_of_man"
		],
		tags: [
		]
	},
	{
		emoji: "🇮🇱",
		description: "Israel",
		category: "Flags",
		aliases: [
			"israel"
		],
		tags: [
		]
	},
	{
		emoji: "🇮🇹",
		description: "Italy",
		category: "Flags",
		aliases: [
			"it"
		],
		tags: [
			"italy"
		]
	},
	{
		emoji: "🇯🇲",
		description: "Jamaica",
		category: "Flags",
		aliases: [
			"jamaica"
		],
		tags: [
		]
	},
	{
		emoji: "🇯🇵",
		description: "Japan",
		category: "Flags",
		aliases: [
			"jp"
		],
		tags: [
			"japan"
		]
	},
	{
		emoji: "🎌",
		description: "crossed flags",
		category: "Flags",
		aliases: [
			"crossed_flags"
		],
		tags: [
		]
	},
	{
		emoji: "🇯🇪",
		description: "Jersey",
		category: "Flags",
		aliases: [
			"jersey"
		],
		tags: [
		]
	},
	{
		emoji: "🇯🇴",
		description: "Jordan",
		category: "Flags",
		aliases: [
			"jordan"
		],
		tags: [
		]
	},
	{
		emoji: "🇰🇿",
		description: "Kazakhstan",
		category: "Flags",
		aliases: [
			"kazakhstan"
		],
		tags: [
		]
	},
	{
		emoji: "🇰🇪",
		description: "Kenya",
		category: "Flags",
		aliases: [
			"kenya"
		],
		tags: [
		]
	},
	{
		emoji: "🇰🇮",
		description: "Kiribati",
		category: "Flags",
		aliases: [
			"kiribati"
		],
		tags: [
		]
	},
	{
		emoji: "🇽🇰",
		description: "Kosovo",
		category: "Flags",
		aliases: [
			"kosovo"
		],
		tags: [
		]
	},
	{
		emoji: "🇰🇼",
		description: "Kuwait",
		category: "Flags",
		aliases: [
			"kuwait"
		],
		tags: [
		]
	},
	{
		emoji: "🇰🇬",
		description: "Kyrgyzstan",
		category: "Flags",
		aliases: [
			"kyrgyzstan"
		],
		tags: [
		]
	},
	{
		emoji: "🇱🇦",
		description: "Laos",
		category: "Flags",
		aliases: [
			"laos"
		],
		tags: [
		]
	},
	{
		emoji: "🇱🇻",
		description: "Latvia",
		category: "Flags",
		aliases: [
			"latvia"
		],
		tags: [
		]
	},
	{
		emoji: "🇱🇧",
		description: "Lebanon",
		category: "Flags",
		aliases: [
			"lebanon"
		],
		tags: [
		]
	},
	{
		emoji: "🇱🇸",
		description: "Lesotho",
		category: "Flags",
		aliases: [
			"lesotho"
		],
		tags: [
		]
	},
	{
		emoji: "🇱🇷",
		description: "Liberia",
		category: "Flags",
		aliases: [
			"liberia"
		],
		tags: [
		]
	},
	{
		emoji: "🇱🇾",
		description: "Libya",
		category: "Flags",
		aliases: [
			"libya"
		],
		tags: [
		]
	},
	{
		emoji: "🇱🇮",
		description: "Liechtenstein",
		category: "Flags",
		aliases: [
			"liechtenstein"
		],
		tags: [
		]
	},
	{
		emoji: "🇱🇹",
		description: "Lithuania",
		category: "Flags",
		aliases: [
			"lithuania"
		],
		tags: [
		]
	},
	{
		emoji: "🇱🇺",
		description: "Luxembourg",
		category: "Flags",
		aliases: [
			"luxembourg"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇴",
		description: "Macau SAR China",
		category: "Flags",
		aliases: [
			"macau"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇰",
		description: "Macedonia",
		category: "Flags",
		aliases: [
			"macedonia"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇬",
		description: "Madagascar",
		category: "Flags",
		aliases: [
			"madagascar"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇼",
		description: "Malawi",
		category: "Flags",
		aliases: [
			"malawi"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇾",
		description: "Malaysia",
		category: "Flags",
		aliases: [
			"malaysia"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇻",
		description: "Maldives",
		category: "Flags",
		aliases: [
			"maldives"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇱",
		description: "Mali",
		category: "Flags",
		aliases: [
			"mali"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇹",
		description: "Malta",
		category: "Flags",
		aliases: [
			"malta"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇭",
		description: "Marshall Islands",
		category: "Flags",
		aliases: [
			"marshall_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇶",
		description: "Martinique",
		category: "Flags",
		aliases: [
			"martinique"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇷",
		description: "Mauritania",
		category: "Flags",
		aliases: [
			"mauritania"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇺",
		description: "Mauritius",
		category: "Flags",
		aliases: [
			"mauritius"
		],
		tags: [
		]
	},
	{
		emoji: "🇾🇹",
		description: "Mayotte",
		category: "Flags",
		aliases: [
			"mayotte"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇽",
		description: "Mexico",
		category: "Flags",
		aliases: [
			"mexico"
		],
		tags: [
		]
	},
	{
		emoji: "🇫🇲",
		description: "Micronesia",
		category: "Flags",
		aliases: [
			"micronesia"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇩",
		description: "Moldova",
		category: "Flags",
		aliases: [
			"moldova"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇨",
		description: "Monaco",
		category: "Flags",
		aliases: [
			"monaco"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇳",
		description: "Mongolia",
		category: "Flags",
		aliases: [
			"mongolia"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇪",
		description: "Montenegro",
		category: "Flags",
		aliases: [
			"montenegro"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇸",
		description: "Montserrat",
		category: "Flags",
		aliases: [
			"montserrat"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇦",
		description: "Morocco",
		category: "Flags",
		aliases: [
			"morocco"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇿",
		description: "Mozambique",
		category: "Flags",
		aliases: [
			"mozambique"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇲",
		description: "Myanmar (Burma)",
		category: "Flags",
		aliases: [
			"myanmar"
		],
		tags: [
			"burma"
		]
	},
	{
		emoji: "🇳🇦",
		description: "Namibia",
		category: "Flags",
		aliases: [
			"namibia"
		],
		tags: [
		]
	},
	{
		emoji: "🇳🇷",
		description: "Nauru",
		category: "Flags",
		aliases: [
			"nauru"
		],
		tags: [
		]
	},
	{
		emoji: "🇳🇵",
		description: "Nepal",
		category: "Flags",
		aliases: [
			"nepal"
		],
		tags: [
		]
	},
	{
		emoji: "🇳🇱",
		description: "Netherlands",
		category: "Flags",
		aliases: [
			"netherlands"
		],
		tags: [
		]
	},
	{
		emoji: "🇳🇨",
		description: "New Caledonia",
		category: "Flags",
		aliases: [
			"new_caledonia"
		],
		tags: [
		]
	},
	{
		emoji: "🇳🇿",
		description: "New Zealand",
		category: "Flags",
		aliases: [
			"new_zealand"
		],
		tags: [
		]
	},
	{
		emoji: "🇳🇮",
		description: "Nicaragua",
		category: "Flags",
		aliases: [
			"nicaragua"
		],
		tags: [
		]
	},
	{
		emoji: "🇳🇪",
		description: "Niger",
		category: "Flags",
		aliases: [
			"niger"
		],
		tags: [
		]
	},
	{
		emoji: "🇳🇬",
		description: "Nigeria",
		category: "Flags",
		aliases: [
			"nigeria"
		],
		tags: [
		]
	},
	{
		emoji: "🇳🇺",
		description: "Niue",
		category: "Flags",
		aliases: [
			"niue"
		],
		tags: [
		]
	},
	{
		emoji: "🇳🇫",
		description: "Norfolk Island",
		category: "Flags",
		aliases: [
			"norfolk_island"
		],
		tags: [
		]
	},
	{
		emoji: "🇲🇵",
		description: "Northern Mariana Islands",
		category: "Flags",
		aliases: [
			"northern_mariana_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇰🇵",
		description: "North Korea",
		category: "Flags",
		aliases: [
			"north_korea"
		],
		tags: [
		]
	},
	{
		emoji: "🇳🇴",
		description: "Norway",
		category: "Flags",
		aliases: [
			"norway"
		],
		tags: [
		]
	},
	{
		emoji: "🇴🇲",
		description: "Oman",
		category: "Flags",
		aliases: [
			"oman"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇰",
		description: "Pakistan",
		category: "Flags",
		aliases: [
			"pakistan"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇼",
		description: "Palau",
		category: "Flags",
		aliases: [
			"palau"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇸",
		description: "Palestinian Territories",
		category: "Flags",
		aliases: [
			"palestinian_territories"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇦",
		description: "Panama",
		category: "Flags",
		aliases: [
			"panama"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇬",
		description: "Papua New Guinea",
		category: "Flags",
		aliases: [
			"papua_new_guinea"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇾",
		description: "Paraguay",
		category: "Flags",
		aliases: [
			"paraguay"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇪",
		description: "Peru",
		category: "Flags",
		aliases: [
			"peru"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇭",
		description: "Philippines",
		category: "Flags",
		aliases: [
			"philippines"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇳",
		description: "Pitcairn Islands",
		category: "Flags",
		aliases: [
			"pitcairn_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇱",
		description: "Poland",
		category: "Flags",
		aliases: [
			"poland"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇹",
		description: "Portugal",
		category: "Flags",
		aliases: [
			"portugal"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇷",
		description: "Puerto Rico",
		category: "Flags",
		aliases: [
			"puerto_rico"
		],
		tags: [
		]
	},
	{
		emoji: "🇶🇦",
		description: "Qatar",
		category: "Flags",
		aliases: [
			"qatar"
		],
		tags: [
		]
	},
	{
		emoji: "🇷🇪",
		description: "Réunion",
		category: "Flags",
		aliases: [
			"reunion"
		],
		tags: [
		]
	},
	{
		emoji: "🇷🇴",
		description: "Romania",
		category: "Flags",
		aliases: [
			"romania"
		],
		tags: [
		]
	},
	{
		emoji: "🇷🇺",
		description: "Russia",
		category: "Flags",
		aliases: [
			"ru"
		],
		tags: [
			"russia"
		]
	},
	{
		emoji: "🇷🇼",
		description: "Rwanda",
		category: "Flags",
		aliases: [
			"rwanda"
		],
		tags: [
		]
	},
	{
		emoji: "🇧🇱",
		description: "St. Barthélemy",
		category: "Flags",
		aliases: [
			"st_barthelemy"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇭",
		description: "St. Helena",
		category: "Flags",
		aliases: [
			"st_helena"
		],
		tags: [
		]
	},
	{
		emoji: "🇰🇳",
		description: "St. Kitts & Nevis",
		category: "Flags",
		aliases: [
			"st_kitts_nevis"
		],
		tags: [
		]
	},
	{
		emoji: "🇱🇨",
		description: "St. Lucia",
		category: "Flags",
		aliases: [
			"st_lucia"
		],
		tags: [
		]
	},
	{
		emoji: "🇵🇲",
		description: "St. Pierre & Miquelon",
		category: "Flags",
		aliases: [
			"st_pierre_miquelon"
		],
		tags: [
		]
	},
	{
		emoji: "🇻🇨",
		description: "St. Vincent & Grenadines",
		category: "Flags",
		aliases: [
			"st_vincent_grenadines"
		],
		tags: [
		]
	},
	{
		emoji: "🇼🇸",
		description: "Samoa",
		category: "Flags",
		aliases: [
			"samoa"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇲",
		description: "San Marino",
		category: "Flags",
		aliases: [
			"san_marino"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇹",
		description: "São Tomé & Príncipe",
		category: "Flags",
		aliases: [
			"sao_tome_principe"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇦",
		description: "Saudi Arabia",
		category: "Flags",
		aliases: [
			"saudi_arabia"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇳",
		description: "Senegal",
		category: "Flags",
		aliases: [
			"senegal"
		],
		tags: [
		]
	},
	{
		emoji: "🇷🇸",
		description: "Serbia",
		category: "Flags",
		aliases: [
			"serbia"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇨",
		description: "Seychelles",
		category: "Flags",
		aliases: [
			"seychelles"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇱",
		description: "Sierra Leone",
		category: "Flags",
		aliases: [
			"sierra_leone"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇬",
		description: "Singapore",
		category: "Flags",
		aliases: [
			"singapore"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇽",
		description: "Sint Maarten",
		category: "Flags",
		aliases: [
			"sint_maarten"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇰",
		description: "Slovakia",
		category: "Flags",
		aliases: [
			"slovakia"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇮",
		description: "Slovenia",
		category: "Flags",
		aliases: [
			"slovenia"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇧",
		description: "Solomon Islands",
		category: "Flags",
		aliases: [
			"solomon_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇴",
		description: "Somalia",
		category: "Flags",
		aliases: [
			"somalia"
		],
		tags: [
		]
	},
	{
		emoji: "🇿🇦",
		description: "South Africa",
		category: "Flags",
		aliases: [
			"south_africa"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇸",
		description: "South Georgia & South Sandwich Islands",
		category: "Flags",
		aliases: [
			"south_georgia_south_sandwich_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇰🇷",
		description: "South Korea",
		category: "Flags",
		aliases: [
			"kr"
		],
		tags: [
			"korea"
		]
	},
	{
		emoji: "🇸🇸",
		description: "South Sudan",
		category: "Flags",
		aliases: [
			"south_sudan"
		],
		tags: [
		]
	},
	{
		emoji: "🇪🇸",
		description: "Spain",
		category: "Flags",
		aliases: [
			"es"
		],
		tags: [
			"spain"
		]
	},
	{
		emoji: "🇱🇰",
		description: "Sri Lanka",
		category: "Flags",
		aliases: [
			"sri_lanka"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇩",
		description: "Sudan",
		category: "Flags",
		aliases: [
			"sudan"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇷",
		description: "Suriname",
		category: "Flags",
		aliases: [
			"suriname"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇿",
		description: "Swaziland",
		category: "Flags",
		aliases: [
			"swaziland"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇪",
		description: "Sweden",
		category: "Flags",
		aliases: [
			"sweden"
		],
		tags: [
		]
	},
	{
		emoji: "🇨🇭",
		description: "Switzerland",
		category: "Flags",
		aliases: [
			"switzerland"
		],
		tags: [
		]
	},
	{
		emoji: "🇸🇾",
		description: "Syria",
		category: "Flags",
		aliases: [
			"syria"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇼",
		description: "Taiwan",
		category: "Flags",
		aliases: [
			"taiwan"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇯",
		description: "Tajikistan",
		category: "Flags",
		aliases: [
			"tajikistan"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇿",
		description: "Tanzania",
		category: "Flags",
		aliases: [
			"tanzania"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇭",
		description: "Thailand",
		category: "Flags",
		aliases: [
			"thailand"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇱",
		description: "Timor-Leste",
		category: "Flags",
		aliases: [
			"timor_leste"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇬",
		description: "Togo",
		category: "Flags",
		aliases: [
			"togo"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇰",
		description: "Tokelau",
		category: "Flags",
		aliases: [
			"tokelau"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇴",
		description: "Tonga",
		category: "Flags",
		aliases: [
			"tonga"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇹",
		description: "Trinidad & Tobago",
		category: "Flags",
		aliases: [
			"trinidad_tobago"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇳",
		description: "Tunisia",
		category: "Flags",
		aliases: [
			"tunisia"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇷",
		description: "Turkey",
		category: "Flags",
		aliases: [
			"tr"
		],
		tags: [
			"turkey"
		]
	},
	{
		emoji: "🇹🇲",
		description: "Turkmenistan",
		category: "Flags",
		aliases: [
			"turkmenistan"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇨",
		description: "Turks & Caicos Islands",
		category: "Flags",
		aliases: [
			"turks_caicos_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇹🇻",
		description: "Tuvalu",
		category: "Flags",
		aliases: [
			"tuvalu"
		],
		tags: [
		]
	},
	{
		emoji: "🇺🇬",
		description: "Uganda",
		category: "Flags",
		aliases: [
			"uganda"
		],
		tags: [
		]
	},
	{
		emoji: "🇺🇦",
		description: "Ukraine",
		category: "Flags",
		aliases: [
			"ukraine"
		],
		tags: [
		]
	},
	{
		emoji: "🇦🇪",
		description: "United Arab Emirates",
		category: "Flags",
		aliases: [
			"united_arab_emirates"
		],
		tags: [
		]
	},
	{
		emoji: "🇬🇧",
		description: "United Kingdom",
		category: "Flags",
		aliases: [
			"gb",
			"uk"
		],
		tags: [
			"flag",
			"british"
		]
	},
	{
		emoji: "🇺🇸",
		description: "United States",
		category: "Flags",
		aliases: [
			"us"
		],
		tags: [
			"flag",
			"united",
			"america"
		]
	},
	{
		emoji: "🇻🇮",
		description: "U.S. Virgin Islands",
		category: "Flags",
		aliases: [
			"us_virgin_islands"
		],
		tags: [
		]
	},
	{
		emoji: "🇺🇾",
		description: "Uruguay",
		category: "Flags",
		aliases: [
			"uruguay"
		],
		tags: [
		]
	},
	{
		emoji: "🇺🇿",
		description: "Uzbekistan",
		category: "Flags",
		aliases: [
			"uzbekistan"
		],
		tags: [
		]
	},
	{
		emoji: "🇻🇺",
		description: "Vanuatu",
		category: "Flags",
		aliases: [
			"vanuatu"
		],
		tags: [
		]
	},
	{
		emoji: "🇻🇦",
		description: "Vatican City",
		category: "Flags",
		aliases: [
			"vatican_city"
		],
		tags: [
		]
	},
	{
		emoji: "🇻🇪",
		description: "Venezuela",
		category: "Flags",
		aliases: [
			"venezuela"
		],
		tags: [
		]
	},
	{
		emoji: "🇻🇳",
		description: "Vietnam",
		category: "Flags",
		aliases: [
			"vietnam"
		],
		tags: [
		]
	},
	{
		emoji: "🇼🇫",
		description: "Wallis & Futuna",
		category: "Flags",
		aliases: [
			"wallis_futuna"
		],
		tags: [
		]
	},
	{
		emoji: "🇪🇭",
		description: "Western Sahara",
		category: "Flags",
		aliases: [
			"western_sahara"
		],
		tags: [
		]
	},
	{
		emoji: "🇾🇪",
		description: "Yemen",
		category: "Flags",
		aliases: [
			"yemen"
		],
		tags: [
		]
	},
	{
		emoji: "🇿🇲",
		description: "Zambia",
		category: "Flags",
		aliases: [
			"zambia"
		],
		tags: [
		]
	},
	{
		emoji: "🇿🇼",
		description: "Zimbabwe",
		category: "Flags",
		aliases: [
			"zimbabwe"
		],
		tags: [
		]
	}
];

const emojisForSearch = {};

for (const emoji of emojis) {
  const newEmoji = Object.assign({}, emoji, {
    search: [...emoji.aliases, ...emoji.tags].join(' ')
  });

  if (emojisForSearch[newEmoji.category]) {
    emojisForSearch[newEmoji.category].push(newEmoji);
  } else {
    emojisForSearch[newEmoji.category] = [newEmoji];
  }
}

class Emoji {
  constructor() {
    this.cache = new Map();
  }

  search(text) {
    const {
      cache
    } = this;
    if (cache.has(text)) return cache.get(text);
    const result = {};
    Object.keys(emojisForSearch).forEach(category => {
      const list = fuzzaldrin.filter(emojisForSearch[category], text, {
        key: 'search'
      });

      if (list.length) {
        result[category] = list;
      }
    });
    cache.set(text, result);
    return result;
  }

  destroy() {
    return this.cache.clear();
  }

}

// import virtualize from 'snabbdom-virtualize/strings'
const snabbdom = require('snabbdom');

const patch = snabbdom.init([// Init patch function with chosen modules
require('snabbdom/modules/class').default, // makes it easy to toggle classes
require('snabbdom/modules/attributes').default, require('snabbdom/modules/style').default, // handles styling on elements with support for animations
require('snabbdom/modules/props').default, // for setting properties on DOM elements
require('snabbdom/modules/dataset').default, require('snabbdom/modules/eventlisteners').default // attaches event listeners
]);
const h = require('snabbdom/h').default; // helper function for creating vnodes

require('snabbdom-to-html'); // helper function for convert vnode to HTML string

require('snabbdom/tovnode').default; // helper function for convert DOM to vnode

var css_248z = ".ag-emoji-picker {\n  width: 348px;\n  max-height: 350px;\n  overflow-y: auto;\n}\n\n.ag-emoji-picker .title {\n  color: var(--editorColor80);\n  line-height: 1.15;\n  font-size: 12px;\n  padding: 10px 12px 12px 12px;\n  display: flex;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n  font-weight: 600;\n  position: sticky;\n  top: 0;\n  background: var(--itemBgColor);\n  z-index: 1001;\n}\n\n.ag-emoji-picker section .emoji-wrapper {\n  display: flex;\n  flex-direction: row;\n  flex-wrap: wrap;\n  padding: 0 12px;\n}\n\n.ag-emoji-picker section .emoji-wrapper .item {\n  width: 36px;\n  height: 36px;\n  flex-shrink: 0;\n  cursor: pointer;\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n  box-sizing: border-box;\n  border-radius: 50%;\n}\n\n.ag-emoji-picker:hover .active {\n  background: transparent;\n  border-color: transparent;\n}\n\n.ag-emoji-picker .active, .ag-emoji-picker .item:hover {\n background-color: var(--floatHoverColor);\n}\n\n.ag-emoji-picker section .emoji-wrapper .item span {\n  width: 24px;\n  height: 24px;\n  display: block;\n  font-size: 24px;\n  text-align: center;\n  line-height: 1.15;\n  color: #000;\n  transition: transform .2s ease-in;\n  transform-origin: center;\n}\n ";
styleInject(css_248z);

class EmojiPicker extends BaseScrollFloat {
  constructor(muya) {
    const name = 'ag-emoji-picker';
    super(muya, name);
    this._renderObj = null;
    this.renderArray = null;
    this.activeItem = null;
    this.oldVnode = null;
    this.emoji = new Emoji();
    this.listen();
  }

  get renderObj() {
    return this._renderObj;
  }

  set renderObj(obj) {
    this._renderObj = obj;
    const renderArray = [];
    Object.keys(obj).forEach(key => {
      renderArray.push(...obj[key]);
    });
    this.renderArray = renderArray;

    if (this.renderArray.length > 0) {
      this.activeItem = this.renderArray[0];
      const activeEle = this.getItemElement(this.activeItem);
      this.activeEleScrollIntoView(activeEle);
    }
  }

  listen() {
    super.listen();
    const {
      eventCenter
    } = this.muya;
    eventCenter.subscribe('muya-emoji-picker', ({
      reference,
      emojiNode
    }) => {
      if (!emojiNode) return this.hide();
      const text = emojiNode.textContent.trim();

      if (text) {
        const renderObj = this.emoji.search(text);
        this.renderObj = renderObj;

        const cb = item => {
          this.muya.contentState.setEmoji(item);
        };

        if (this.renderArray.length) {
          this.show(reference, cb);
          this.render();
        } else {
          this.hide();
        }
      }
    });
  }

  render() {
    const {
      scrollElement,
      _renderObj,
      activeItem,
      oldVnode
    } = this;
    const children = Object.keys(_renderObj).map(category => {
      const title = h('div.title', category);

      const emojis = _renderObj[category].map(e => {
        const selector = activeItem === e ? 'div.item.active' : 'div.item';
        return h(selector, {
          dataset: {
            label: e.aliases[0]
          },
          props: {
            title: e.description
          },
          on: {
            click: () => {
              this.selectItem(e);
            }
          }
        }, h('span', e.emoji));
      });

      return h('section', [title, h('div.emoji-wrapper', emojis)]);
    });
    const vnode = h('div', children);

    if (oldVnode) {
      patch(oldVnode, vnode);
    } else {
      patch(scrollElement, vnode);
    }

    this.oldVnode = vnode;
  }

  getItemElement(item) {
    const label = item.aliases[0];
    return this.floatBox.querySelector(`[data-label="${label}"]`);
  }

  destroy() {
    super.destroy();
    this.emoji.destroy();
  }

}

EmojiPicker.pluginName = 'emojiPicker';

module.exports = EmojiPicker;
//# sourceMappingURL=index.js.map
