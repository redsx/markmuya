'use strict';

var require$$0$2 = require('path');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      }
    });
  }
  n['default'] = e;
  return Object.freeze(n);
}

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

var css_248z$2 = ".ag-float-wrapper {\n  position: absolute;\n  font-size: 12px;\n  opacity: 0;\n  width: 110px;\n  height: auto;\n  top: -1000px;\n  right: -1000px;\n  border-radius: 2px;\n  box-shadow: var(--floatShadow);\n  background-color: var(--floatBgColor);\n  transition: opacity .25s ease-in-out;\n  transform-origin: top;\n  box-sizing: border-box;\n  z-index: 10000;\n  overflow: hidden;\n}\n\n.ag-float-container::-webkit-scrollbar:vertical {\n  width: 0px;\n}\n\n[x-placement] {\n  opacity: 1;\n}\n\n.ag-popper-arrow {\n  width: 16px;\n  height: 16px;\n  background: inherit;\n  border: 1px solid #ebeef5;\n  display: inline-block;\n  position: absolute;\n  transform: rotate(45deg);\n}\n\n[x-placement=\"bottom-start\"] > .ag-popper-arrow {\n  border-right: none;\n  border-bottom: none;\n  top: -9px;\n}\n\n[x-placement=\"top-start\"] > .ag-popper-arrow {\n  border-left: none;\n  border-top: none;\n  bottom: -9px;\n}\n\n[x-out-of-boundaries] {\n  display: none;\n}\n";
styleInject(css_248z$2);

const defaultOptions$1 = () => ({
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
    this.options = Object.assign({}, defaultOptions$1(), options);
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

var prism = createCommonjsModule(function (module) {
/* **********************************************
     Begin prism-core.js
********************************************** */

/// <reference lib="WebWorker"/>

var _self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 *
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Lea Verou <https://lea.verou.me>
 * @namespace
 * @public
 */
var Prism = (function (_self){

// Private helper vars
var lang = /\blang(?:uage)?-([\w-]+)\b/i;
var uniqueId = 0;


var _ = {
	/**
	 * By default, Prism will attempt to highlight all code elements (by calling {@link Prism.highlightAll}) on the
	 * current page after the page finished loading. This might be a problem if e.g. you wanted to asynchronously load
	 * additional languages or plugins yourself.
	 *
	 * By setting this value to `true`, Prism will not automatically highlight all code elements on the page.
	 *
	 * You obviously have to change this value before the automatic highlighting started. To do this, you can add an
	 * empty Prism object into the global scope before loading the Prism script like this:
	 *
	 * ```js
	 * window.Prism = window.Prism || {};
	 * Prism.manual = true;
	 * // add a new <script> to load Prism's script
	 * ```
	 *
	 * @default false
	 * @type {boolean}
	 * @memberof Prism
	 * @public
	 */
	manual: _self.Prism && _self.Prism.manual,
	disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,

	/**
	 * A namespace for utility methods.
	 *
	 * All function in this namespace that are not explicitly marked as _public_ are for __internal use only__ and may
	 * change or disappear at any time.
	 *
	 * @namespace
	 * @memberof Prism
	 */
	util: {
		encode: function encode(tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, encode(tokens.content), tokens.alias);
			} else if (Array.isArray(tokens)) {
				return tokens.map(encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		/**
		 * Returns the name of the type of the given value.
		 *
		 * @param {any} o
		 * @returns {string}
		 * @example
		 * type(null)      === 'Null'
		 * type(undefined) === 'Undefined'
		 * type(123)       === 'Number'
		 * type('foo')     === 'String'
		 * type(true)      === 'Boolean'
		 * type([1, 2])    === 'Array'
		 * type({})        === 'Object'
		 * type(String)    === 'Function'
		 * type(/abc+/)    === 'RegExp'
		 */
		type: function (o) {
			return Object.prototype.toString.call(o).slice(8, -1);
		},

		/**
		 * Returns a unique number for the given object. Later calls will still return the same number.
		 *
		 * @param {Object} obj
		 * @returns {number}
		 */
		objId: function (obj) {
			if (!obj['__id']) {
				Object.defineProperty(obj, '__id', { value: ++uniqueId });
			}
			return obj['__id'];
		},

		/**
		 * Creates a deep clone of the given object.
		 *
		 * The main intended use of this function is to clone language definitions.
		 *
		 * @param {T} o
		 * @param {Record<number, any>} [visited]
		 * @returns {T}
		 * @template T
		 */
		clone: function deepClone(o, visited) {
			visited = visited || {};

			var clone, id;
			switch (_.util.type(o)) {
				case 'Object':
					id = _.util.objId(o);
					if (visited[id]) {
						return visited[id];
					}
					clone = /** @type {Record<string, any>} */ ({});
					visited[id] = clone;

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = deepClone(o[key], visited);
						}
					}

					return /** @type {any} */ (clone);

				case 'Array':
					id = _.util.objId(o);
					if (visited[id]) {
						return visited[id];
					}
					clone = [];
					visited[id] = clone;

					(/** @type {Array} */(/** @type {any} */(o))).forEach(function (v, i) {
						clone[i] = deepClone(v, visited);
					});

					return /** @type {any} */ (clone);

				default:
					return o;
			}
		},

		/**
		 * Returns the Prism language of the given element set by a `language-xxxx` or `lang-xxxx` class.
		 *
		 * If no language is set for the element or the element is `null` or `undefined`, `none` will be returned.
		 *
		 * @param {Element} element
		 * @returns {string}
		 */
		getLanguage: function (element) {
			while (element && !lang.test(element.className)) {
				element = element.parentElement;
			}
			if (element) {
				return (element.className.match(lang) || [, 'none'])[1].toLowerCase();
			}
			return 'none';
		},

		/**
		 * Returns the script element that is currently executing.
		 *
		 * This does __not__ work for line script element.
		 *
		 * @returns {HTMLScriptElement | null}
		 */
		currentScript: function () {
			if (typeof document === 'undefined') {
				return null;
			}
			if ('currentScript' in document && 1 < 2 /* hack to trip TS' flow analysis */) {
				return /** @type {any} */ (document.currentScript);
			}

			// IE11 workaround
			// we'll get the src of the current script by parsing IE11's error stack trace
			// this will not work for inline scripts

			try {
				throw new Error();
			} catch (err) {
				// Get file src url from stack. Specifically works with the format of stack traces in IE.
				// A stack will look like this:
				//
				// Error
				//    at _.util.currentScript (http://localhost/components/prism-core.js:119:5)
				//    at Global code (http://localhost/components/prism-core.js:606:1)

				var src = (/at [^(\r\n]*\((.*):.+:.+\)$/i.exec(err.stack) || [])[1];
				if (src) {
					var scripts = document.getElementsByTagName('script');
					for (var i in scripts) {
						if (scripts[i].src == src) {
							return scripts[i];
						}
					}
				}
				return null;
			}
		},

		/**
		 * Returns whether a given class is active for `element`.
		 *
		 * The class can be activated if `element` or one of its ancestors has the given class and it can be deactivated
		 * if `element` or one of its ancestors has the negated version of the given class. The _negated version_ of the
		 * given class is just the given class with a `no-` prefix.
		 *
		 * Whether the class is active is determined by the closest ancestor of `element` (where `element` itself is
		 * closest ancestor) that has the given class or the negated version of it. If neither `element` nor any of its
		 * ancestors have the given class or the negated version of it, then the default activation will be returned.
		 *
		 * In the paradoxical situation where the closest ancestor contains __both__ the given class and the negated
		 * version of it, the class is considered active.
		 *
		 * @param {Element} element
		 * @param {string} className
		 * @param {boolean} [defaultActivation=false]
		 * @returns {boolean}
		 */
		isActive: function (element, className, defaultActivation) {
			var no = 'no-' + className;

			while (element) {
				var classList = element.classList;
				if (classList.contains(className)) {
					return true;
				}
				if (classList.contains(no)) {
					return false;
				}
				element = element.parentElement;
			}
			return !!defaultActivation;
		}
	},

	/**
	 * This namespace contains all currently loaded languages and the some helper functions to create and modify languages.
	 *
	 * @namespace
	 * @memberof Prism
	 * @public
	 */
	languages: {
		/**
		 * Creates a deep copy of the language with the given id and appends the given tokens.
		 *
		 * If a token in `redef` also appears in the copied language, then the existing token in the copied language
		 * will be overwritten at its original position.
		 *
		 * ## Best practices
		 *
		 * Since the position of overwriting tokens (token in `redef` that overwrite tokens in the copied language)
		 * doesn't matter, they can technically be in any order. However, this can be confusing to others that trying to
		 * understand the language definition because, normally, the order of tokens matters in Prism grammars.
		 *
		 * Therefore, it is encouraged to order overwriting tokens according to the positions of the overwritten tokens.
		 * Furthermore, all non-overwriting tokens should be placed after the overwriting ones.
		 *
		 * @param {string} id The id of the language to extend. This has to be a key in `Prism.languages`.
		 * @param {Grammar} redef The new tokens to append.
		 * @returns {Grammar} The new language created.
		 * @public
		 * @example
		 * Prism.languages['css-with-colors'] = Prism.languages.extend('css', {
		 *     // Prism.languages.css already has a 'comment' token, so this token will overwrite CSS' 'comment' token
		 *     // at its original position
		 *     'comment': { ... },
		 *     // CSS doesn't have a 'color' token, so this token will be appended
		 *     'color': /\b(?:red|green|blue)\b/
		 * });
		 */
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		/**
		 * Inserts tokens _before_ another token in a language definition or any other grammar.
		 *
		 * ## Usage
		 *
		 * This helper method makes it easy to modify existing languages. For example, the CSS language definition
		 * not only defines CSS highlighting for CSS documents, but also needs to define highlighting for CSS embedded
		 * in HTML through `<style>` elements. To do this, it needs to modify `Prism.languages.markup` and add the
		 * appropriate tokens. However, `Prism.languages.markup` is a regular JavaScript object literal, so if you do
		 * this:
		 *
		 * ```js
		 * Prism.languages.markup.style = {
		 *     // token
		 * };
		 * ```
		 *
		 * then the `style` token will be added (and processed) at the end. `insertBefore` allows you to insert tokens
		 * before existing tokens. For the CSS example above, you would use it like this:
		 *
		 * ```js
		 * Prism.languages.insertBefore('markup', 'cdata', {
		 *     'style': {
		 *         // token
		 *     }
		 * });
		 * ```
		 *
		 * ## Special cases
		 *
		 * If the grammars of `inside` and `insert` have tokens with the same name, the tokens in `inside`'s grammar
		 * will be ignored.
		 *
		 * This behavior can be used to insert tokens after `before`:
		 *
		 * ```js
		 * Prism.languages.insertBefore('markup', 'comment', {
		 *     'comment': Prism.languages.markup.comment,
		 *     // tokens after 'comment'
		 * });
		 * ```
		 *
		 * ## Limitations
		 *
		 * The main problem `insertBefore` has to solve is iteration order. Since ES2015, the iteration order for object
		 * properties is guaranteed to be the insertion order (except for integer keys) but some browsers behave
		 * differently when keys are deleted and re-inserted. So `insertBefore` can't be implemented by temporarily
		 * deleting properties which is necessary to insert at arbitrary positions.
		 *
		 * To solve this problem, `insertBefore` doesn't actually insert the given tokens into the target object.
		 * Instead, it will create a new object and replace all references to the target object with the new one. This
		 * can be done without temporarily deleting properties, so the iteration order is well-defined.
		 *
		 * However, only references that can be reached from `Prism.languages` or `insert` will be replaced. I.e. if
		 * you hold the target object in a variable, then the value of the variable will not change.
		 *
		 * ```js
		 * var oldMarkup = Prism.languages.markup;
		 * var newMarkup = Prism.languages.insertBefore('markup', 'comment', { ... });
		 *
		 * assert(oldMarkup !== Prism.languages.markup);
		 * assert(newMarkup === Prism.languages.markup);
		 * ```
		 *
		 * @param {string} inside The property of `root` (e.g. a language id in `Prism.languages`) that contains the
		 * object to be modified.
		 * @param {string} before The key to insert before.
		 * @param {Grammar} insert An object containing the key-value pairs to be inserted.
		 * @param {Object<string, any>} [root] The object containing `inside`, i.e. the object that contains the
		 * object to be modified.
		 *
		 * Defaults to `Prism.languages`.
		 * @returns {Grammar} The new grammar object.
		 * @public
		 */
		insertBefore: function (inside, before, insert, root) {
			root = root || /** @type {any} */ (_.languages);
			var grammar = root[inside];
			/** @type {Grammar} */
			var ret = {};

			for (var token in grammar) {
				if (grammar.hasOwnProperty(token)) {

					if (token == before) {
						for (var newToken in insert) {
							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					// Do not insert token which also occur in insert. See #1525
					if (!insert.hasOwnProperty(token)) {
						ret[token] = grammar[token];
					}
				}
			}

			var old = root[inside];
			root[inside] = ret;

			// Update references in other language definitions
			_.languages.DFS(_.languages, function(key, value) {
				if (value === old && key != inside) {
					this[key] = ret;
				}
			});

			return ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function DFS(o, callback, type, visited) {
			visited = visited || {};

			var objId = _.util.objId;

			for (var i in o) {
				if (o.hasOwnProperty(i)) {
					callback.call(o, i, o[i], type || i);

					var property = o[i],
					    propertyType = _.util.type(property);

					if (propertyType === 'Object' && !visited[objId(property)]) {
						visited[objId(property)] = true;
						DFS(property, callback, null, visited);
					}
					else if (propertyType === 'Array' && !visited[objId(property)]) {
						visited[objId(property)] = true;
						DFS(property, callback, i, visited);
					}
				}
			}
		}
	},

	plugins: {},

	/**
	 * This is the most high-level function in Prism’s API.
	 * It fetches all the elements that have a `.language-xxxx` class and then calls {@link Prism.highlightElement} on
	 * each one of them.
	 *
	 * This is equivalent to `Prism.highlightAllUnder(document, async, callback)`.
	 *
	 * @param {boolean} [async=false] Same as in {@link Prism.highlightAllUnder}.
	 * @param {HighlightCallback} [callback] Same as in {@link Prism.highlightAllUnder}.
	 * @memberof Prism
	 * @public
	 */
	highlightAll: function(async, callback) {
		_.highlightAllUnder(document, async, callback);
	},

	/**
	 * Fetches all the descendants of `container` that have a `.language-xxxx` class and then calls
	 * {@link Prism.highlightElement} on each one of them.
	 *
	 * The following hooks will be run:
	 * 1. `before-highlightall`
	 * 2. `before-all-elements-highlight`
	 * 3. All hooks of {@link Prism.highlightElement} for each element.
	 *
	 * @param {ParentNode} container The root element, whose descendants that have a `.language-xxxx` class will be highlighted.
	 * @param {boolean} [async=false] Whether each element is to be highlighted asynchronously using Web Workers.
	 * @param {HighlightCallback} [callback] An optional callback to be invoked on each element after its highlighting is done.
	 * @memberof Prism
	 * @public
	 */
	highlightAllUnder: function(container, async, callback) {
		var env = {
			callback: callback,
			container: container,
			selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
		};

		_.hooks.run('before-highlightall', env);

		env.elements = Array.prototype.slice.apply(env.container.querySelectorAll(env.selector));

		_.hooks.run('before-all-elements-highlight', env);

		for (var i = 0, element; element = env.elements[i++];) {
			_.highlightElement(element, async === true, env.callback);
		}
	},

	/**
	 * Highlights the code inside a single element.
	 *
	 * The following hooks will be run:
	 * 1. `before-sanity-check`
	 * 2. `before-highlight`
	 * 3. All hooks of {@link Prism.highlight}. These hooks will be run by an asynchronous worker if `async` is `true`.
	 * 4. `before-insert`
	 * 5. `after-highlight`
	 * 6. `complete`
	 *
	 * Some the above hooks will be skipped if the element doesn't contain any text or there is no grammar loaded for
	 * the element's language.
	 *
	 * @param {Element} element The element containing the code.
	 * It must have a class of `language-xxxx` to be processed, where `xxxx` is a valid language identifier.
	 * @param {boolean} [async=false] Whether the element is to be highlighted asynchronously using Web Workers
	 * to improve performance and avoid blocking the UI when highlighting very large chunks of code. This option is
	 * [disabled by default](https://prismjs.com/faq.html#why-is-asynchronous-highlighting-disabled-by-default).
	 *
	 * Note: All language definitions required to highlight the code must be included in the main `prism.js` file for
	 * asynchronous highlighting to work. You can build your own bundle on the
	 * [Download page](https://prismjs.com/download.html).
	 * @param {HighlightCallback} [callback] An optional callback to be invoked after the highlighting is done.
	 * Mostly useful when `async` is `true`, since in that case, the highlighting is done asynchronously.
	 * @memberof Prism
	 * @public
	 */
	highlightElement: function(element, async, callback) {
		// Find language
		var language = _.util.getLanguage(element);
		var grammar = _.languages[language];

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		// Set language on the parent, for styling
		var parent = element.parentElement;
		if (parent && parent.nodeName.toLowerCase() === 'pre') {
			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
		}

		var code = element.textContent;

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		function insertHighlightedCode(highlightedCode) {
			env.highlightedCode = highlightedCode;

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			_.hooks.run('after-highlight', env);
			_.hooks.run('complete', env);
			callback && callback.call(env.element);
		}

		_.hooks.run('before-sanity-check', env);

		if (!env.code) {
			_.hooks.run('complete', env);
			callback && callback.call(env.element);
			return;
		}

		_.hooks.run('before-highlight', env);

		if (!env.grammar) {
			insertHighlightedCode(_.util.encode(env.code));
			return;
		}

		if (async && _self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				insertHighlightedCode(evt.data);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code,
				immediateClose: true
			}));
		}
		else {
			insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
		}
	},

	/**
	 * Low-level function, only use if you know what you’re doing. It accepts a string of text as input
	 * and the language definitions to use, and returns a string with the HTML produced.
	 *
	 * The following hooks will be run:
	 * 1. `before-tokenize`
	 * 2. `after-tokenize`
	 * 3. `wrap`: On each {@link Token}.
	 *
	 * @param {string} text A string with the code to be highlighted.
	 * @param {Grammar} grammar An object containing the tokens to use.
	 *
	 * Usually a language definition like `Prism.languages.markup`.
	 * @param {string} language The name of the language definition passed to `grammar`.
	 * @returns {string} The highlighted HTML.
	 * @memberof Prism
	 * @public
	 * @example
	 * Prism.highlight('var foo = true;', Prism.languages.javascript, 'javascript');
	 */
	highlight: function (text, grammar, language) {
		var env = {
			code: text,
			grammar: grammar,
			language: language
		};
		_.hooks.run('before-tokenize', env);
		env.tokens = _.tokenize(env.code, env.grammar);
		_.hooks.run('after-tokenize', env);
		return Token.stringify(_.util.encode(env.tokens), env.language);
	},

	/**
	 * This is the heart of Prism, and the most low-level function you can use. It accepts a string of text as input
	 * and the language definitions to use, and returns an array with the tokenized code.
	 *
	 * When the language definition includes nested tokens, the function is called recursively on each of these tokens.
	 *
	 * This method could be useful in other contexts as well, as a very crude parser.
	 *
	 * @param {string} text A string with the code to be highlighted.
	 * @param {Grammar} grammar An object containing the tokens to use.
	 *
	 * Usually a language definition like `Prism.languages.markup`.
	 * @returns {TokenStream} An array of strings and tokens, a token stream.
	 * @memberof Prism
	 * @public
	 * @example
	 * let code = `var foo = 0;`;
	 * let tokens = Prism.tokenize(code, Prism.languages.javascript);
	 * tokens.forEach(token => {
	 *     if (token instanceof Prism.Token && token.type === 'number') {
	 *         console.log(`Found numeric literal: ${token.content}`);
	 *     }
	 * });
	 */
	tokenize: function(text, grammar) {
		var rest = grammar.rest;
		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		var tokenList = new LinkedList();
		addAfter(tokenList, tokenList.head, text);

		matchGrammar(text, tokenList, grammar, tokenList.head, 0);

		return toArray(tokenList);
	},

	/**
	 * @namespace
	 * @memberof Prism
	 * @public
	 */
	hooks: {
		all: {},

		/**
		 * Adds the given callback to the list of callbacks for the given hook.
		 *
		 * The callback will be invoked when the hook it is registered for is run.
		 * Hooks are usually directly run by a highlight function but you can also run hooks yourself.
		 *
		 * One callback function can be registered to multiple hooks and the same hook multiple times.
		 *
		 * @param {string} name The name of the hook.
		 * @param {HookCallback} callback The callback function which is given environment variables.
		 * @public
		 */
		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		/**
		 * Runs a hook invoking all registered callbacks with the given environment variables.
		 *
		 * Callbacks will be invoked synchronously and in the order in which they were registered.
		 *
		 * @param {string} name The name of the hook.
		 * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
		 * @public
		 */
		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	},

	Token: Token
};
_self.Prism = _;


// Typescript note:
// The following can be used to import the Token type in JSDoc:
//
//   @typedef {InstanceType<import("./prism-core")["Token"]>} Token

/**
 * Creates a new token.
 *
 * @param {string} type See {@link Token#type type}
 * @param {string | TokenStream} content See {@link Token#content content}
 * @param {string|string[]} [alias] The alias(es) of the token.
 * @param {string} [matchedStr=""] A copy of the full string this token was created from.
 * @class
 * @global
 * @public
 */
function Token(type, content, alias, matchedStr) {
	/**
	 * The type of the token.
	 *
	 * This is usually the key of a pattern in a {@link Grammar}.
	 *
	 * @type {string}
	 * @see GrammarToken
	 * @public
	 */
	this.type = type;
	/**
	 * The strings or tokens contained by this token.
	 *
	 * This will be a token stream if the pattern matched also defined an `inside` grammar.
	 *
	 * @type {string | TokenStream}
	 * @public
	 */
	this.content = content;
	/**
	 * The alias(es) of the token.
	 *
	 * @type {string|string[]}
	 * @see GrammarToken
	 * @public
	 */
	this.alias = alias;
	// Copy of the full string this token was created from
	this.length = (matchedStr || '').length | 0;
}

/**
 * A token stream is an array of strings and {@link Token Token} objects.
 *
 * Token streams have to fulfill a few properties that are assumed by most functions (mostly internal ones) that process
 * them.
 *
 * 1. No adjacent strings.
 * 2. No empty strings.
 *
 *    The only exception here is the token stream that only contains the empty string and nothing else.
 *
 * @typedef {Array<string | Token>} TokenStream
 * @global
 * @public
 */

/**
 * Converts the given token or token stream to an HTML representation.
 *
 * The following hooks will be run:
 * 1. `wrap`: On each {@link Token}.
 *
 * @param {string | Token | TokenStream} o The token or token stream to be converted.
 * @param {string} language The name of current language.
 * @returns {string} The HTML representation of the token or token stream.
 * @memberof Token
 * @static
 */
Token.stringify = function stringify(o, language) {
	if (typeof o == 'string') {
		return o;
	}
	if (Array.isArray(o)) {
		var s = '';
		o.forEach(function (e) {
			s += stringify(e, language);
		});
		return s;
	}

	var env = {
		type: o.type,
		content: stringify(o.content, language),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language
	};

	var aliases = o.alias;
	if (aliases) {
		if (Array.isArray(aliases)) {
			Array.prototype.push.apply(env.classes, aliases);
		} else {
			env.classes.push(aliases);
		}
	}

	_.hooks.run('wrap', env);

	var attributes = '';
	for (var name in env.attributes) {
		attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
	}

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
};

/**
 * @param {RegExp} pattern
 * @param {number} pos
 * @param {string} text
 * @param {boolean} lookbehind
 * @returns {RegExpExecArray | null}
 */
function matchPattern(pattern, pos, text, lookbehind) {
	pattern.lastIndex = pos;
	var match = pattern.exec(text);
	if (match && lookbehind && match[1]) {
		// change the match to remove the text matched by the Prism lookbehind group
		var lookbehindLength = match[1].length;
		match.index += lookbehindLength;
		match[0] = match[0].slice(lookbehindLength);
	}
	return match;
}

/**
 * @param {string} text
 * @param {LinkedList<string | Token>} tokenList
 * @param {any} grammar
 * @param {LinkedListNode<string | Token>} startNode
 * @param {number} startPos
 * @param {RematchOptions} [rematch]
 * @returns {void}
 * @private
 *
 * @typedef RematchOptions
 * @property {string} cause
 * @property {number} reach
 */
function matchGrammar(text, tokenList, grammar, startNode, startPos, rematch) {
	for (var token in grammar) {
		if (!grammar.hasOwnProperty(token) || !grammar[token]) {
			continue;
		}

		var patterns = grammar[token];
		patterns = Array.isArray(patterns) ? patterns : [patterns];

		for (var j = 0; j < patterns.length; ++j) {
			if (rematch && rematch.cause == token + ',' + j) {
				return;
			}

			var patternObj = patterns[j],
				inside = patternObj.inside,
				lookbehind = !!patternObj.lookbehind,
				greedy = !!patternObj.greedy,
				alias = patternObj.alias;

			if (greedy && !patternObj.pattern.global) {
				// Without the global flag, lastIndex won't work
				var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
				patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
			}

			/** @type {RegExp} */
			var pattern = patternObj.pattern || patternObj;

			for ( // iterate the token list and keep track of the current token/string position
				var currentNode = startNode.next, pos = startPos;
				currentNode !== tokenList.tail;
				pos += currentNode.value.length, currentNode = currentNode.next
			) {

				if (rematch && pos >= rematch.reach) {
					break;
				}

				var str = currentNode.value;

				if (tokenList.length > text.length) {
					// Something went terribly wrong, ABORT, ABORT!
					return;
				}

				if (str instanceof Token) {
					continue;
				}

				var removeCount = 1; // this is the to parameter of removeBetween
				var match;

				if (greedy) {
					match = matchPattern(pattern, pos, text, lookbehind);
					if (!match) {
						break;
					}

					var from = match.index;
					var to = match.index + match[0].length;
					var p = pos;

					// find the node that contains the match
					p += currentNode.value.length;
					while (from >= p) {
						currentNode = currentNode.next;
						p += currentNode.value.length;
					}
					// adjust pos (and p)
					p -= currentNode.value.length;
					pos = p;

					// the current node is a Token, then the match starts inside another Token, which is invalid
					if (currentNode.value instanceof Token) {
						continue;
					}

					// find the last node which is affected by this match
					for (
						var k = currentNode;
						k !== tokenList.tail && (p < to || typeof k.value === 'string');
						k = k.next
					) {
						removeCount++;
						p += k.value.length;
					}
					removeCount--;

					// replace with the new match
					str = text.slice(pos, p);
					match.index -= pos;
				} else {
					match = matchPattern(pattern, 0, str, lookbehind);
					if (!match) {
						continue;
					}
				}

				var from = match.index,
					matchStr = match[0],
					before = str.slice(0, from),
					after = str.slice(from + matchStr.length);

				var reach = pos + str.length;
				if (rematch && reach > rematch.reach) {
					rematch.reach = reach;
				}

				var removeFrom = currentNode.prev;

				if (before) {
					removeFrom = addAfter(tokenList, removeFrom, before);
					pos += before.length;
				}

				removeRange(tokenList, removeFrom, removeCount);

				var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
				currentNode = addAfter(tokenList, removeFrom, wrapped);

				if (after) {
					addAfter(tokenList, currentNode, after);
				}

				if (removeCount > 1) {
					// at least one Token object was removed, so we have to do some rematching
					// this can only happen if the current pattern is greedy
					matchGrammar(text, tokenList, grammar, currentNode.prev, pos, {
						cause: token + ',' + j,
						reach: reach
					});
				}
			}
		}
	}
}

/**
 * @typedef LinkedListNode
 * @property {T} value
 * @property {LinkedListNode<T> | null} prev The previous node.
 * @property {LinkedListNode<T> | null} next The next node.
 * @template T
 * @private
 */

/**
 * @template T
 * @private
 */
function LinkedList() {
	/** @type {LinkedListNode<T>} */
	var head = { value: null, prev: null, next: null };
	/** @type {LinkedListNode<T>} */
	var tail = { value: null, prev: head, next: null };
	head.next = tail;

	/** @type {LinkedListNode<T>} */
	this.head = head;
	/** @type {LinkedListNode<T>} */
	this.tail = tail;
	this.length = 0;
}

/**
 * Adds a new node with the given value to the list.
 * @param {LinkedList<T>} list
 * @param {LinkedListNode<T>} node
 * @param {T} value
 * @returns {LinkedListNode<T>} The added node.
 * @template T
 */
function addAfter(list, node, value) {
	// assumes that node != list.tail && values.length >= 0
	var next = node.next;

	var newNode = { value: value, prev: node, next: next };
	node.next = newNode;
	next.prev = newNode;
	list.length++;

	return newNode;
}
/**
 * Removes `count` nodes after the given node. The given node will not be removed.
 * @param {LinkedList<T>} list
 * @param {LinkedListNode<T>} node
 * @param {number} count
 * @template T
 */
function removeRange(list, node, count) {
	var next = node.next;
	for (var i = 0; i < count && next !== list.tail; i++) {
		next = next.next;
	}
	node.next = next;
	next.prev = node;
	list.length -= i;
}
/**
 * @param {LinkedList<T>} list
 * @returns {T[]}
 * @template T
 */
function toArray(list) {
	var array = [];
	var node = list.head.next;
	while (node !== list.tail) {
		array.push(node.value);
		node = node.next;
	}
	return array;
}


if (!_self.document) {
	if (!_self.addEventListener) {
		// in Node.js
		return _;
	}

	if (!_.disableWorkerMessageHandler) {
		// In worker
		_self.addEventListener('message', function (evt) {
			var message = JSON.parse(evt.data),
				lang = message.language,
				code = message.code,
				immediateClose = message.immediateClose;

			_self.postMessage(_.highlight(code, _.languages[lang], lang));
			if (immediateClose) {
				_self.close();
			}
		}, false);
	}

	return _;
}

// Get current script and highlight
var script = _.util.currentScript();

if (script) {
	_.filename = script.src;

	if (script.hasAttribute('data-manual')) {
		_.manual = true;
	}
}

function highlightAutomaticallyCallback() {
	if (!_.manual) {
		_.highlightAll();
	}
}

if (!_.manual) {
	// If the document state is "loading", then we'll use DOMContentLoaded.
	// If the document state is "interactive" and the prism.js script is deferred, then we'll also use the
	// DOMContentLoaded event because there might be some plugins or languages which have also been deferred and they
	// might take longer one animation frame to execute which can create a race condition where only some plugins have
	// been loaded when Prism.highlightAll() is executed, depending on how fast resources are loaded.
	// See https://github.com/PrismJS/prism/issues/2102
	var readyState = document.readyState;
	if (readyState === 'loading' || readyState === 'interactive' && script && script.defer) {
		document.addEventListener('DOMContentLoaded', highlightAutomaticallyCallback);
	} else {
		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(highlightAutomaticallyCallback);
		} else {
			window.setTimeout(highlightAutomaticallyCallback, 16);
		}
	}
}

return _;

})(_self);

if (module.exports) {
	module.exports = Prism;
}

// hack for components to work correctly in node.js
if (typeof commonjsGlobal !== 'undefined') {
	commonjsGlobal.Prism = Prism;
}

// some additional documentation/types

/**
 * The expansion of a simple `RegExp` literal to support additional properties.
 *
 * @typedef GrammarToken
 * @property {RegExp} pattern The regular expression of the token.
 * @property {boolean} [lookbehind=false] If `true`, then the first capturing group of `pattern` will (effectively)
 * behave as a lookbehind group meaning that the captured text will not be part of the matched text of the new token.
 * @property {boolean} [greedy=false] Whether the token is greedy.
 * @property {string|string[]} [alias] An optional alias or list of aliases.
 * @property {Grammar} [inside] The nested grammar of this token.
 *
 * The `inside` grammar will be used to tokenize the text value of each token of this kind.
 *
 * This can be used to make nested and even recursive language definitions.
 *
 * Note: This can cause infinite recursion. Be careful when you embed different languages or even the same language into
 * each another.
 * @global
 * @public
*/

/**
 * @typedef Grammar
 * @type {Object<string, RegExp | GrammarToken | Array<RegExp | GrammarToken>>}
 * @property {Grammar} [rest] An optional grammar object that will be appended to this grammar.
 * @global
 * @public
 */

/**
 * A function which will invoked after an element was successfully highlighted.
 *
 * @callback HighlightCallback
 * @param {Element} element The element successfully highlighted.
 * @returns {void}
 * @global
 * @public
*/

/**
 * @callback HookCallback
 * @param {Object<string, any>} env The environment variables of the hook.
 * @returns {void}
 * @global
 * @public
 */


/* **********************************************
     Begin prism-markup.js
********************************************** */

Prism.languages.markup = {
	'comment': /<!--[\s\S]*?-->/,
	'prolog': /<\?[\s\S]+?\?>/,
	'doctype': {
		// https://www.w3.org/TR/xml/#NT-doctypedecl
		pattern: /<!DOCTYPE(?:[^>"'[\]]|"[^"]*"|'[^']*')+(?:\[(?:[^<"'\]]|"[^"]*"|'[^']*'|<(?!!--)|<!--(?:[^-]|-(?!->))*-->)*\]\s*)?>/i,
		greedy: true,
		inside: {
			'internal-subset': {
				pattern: /(\[)[\s\S]+(?=\]>$)/,
				lookbehind: true,
				greedy: true,
				inside: null // see below
			},
			'string': {
				pattern: /"[^"]*"|'[^']*'/,
				greedy: true
			},
			'punctuation': /^<!|>$|[[\]]/,
			'doctype-tag': /^DOCTYPE/,
			'name': /[^\s<>'"]+/
		}
	},
	'cdata': /<!\[CDATA\[[\s\S]*?]]>/i,
	'tag': {
		pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/,
		greedy: true,
		inside: {
			'tag': {
				pattern: /^<\/?[^\s>\/]+/,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[^\s>\/:]+:/
				}
			},
			'attr-value': {
				pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
				inside: {
					'punctuation': [
						{
							pattern: /^=/,
							alias: 'attr-equals'
						},
						/"|'/
					]
				}
			},
			'punctuation': /\/?>/,
			'attr-name': {
				pattern: /[^\s>\/]+/,
				inside: {
					'namespace': /^[^\s>\/:]+:/
				}
			}

		}
	},
	'entity': [
		{
			pattern: /&[\da-z]{1,8};/i,
			alias: 'named-entity'
		},
		/&#x?[\da-f]{1,8};/i
	]
};

Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
	Prism.languages.markup['entity'];
Prism.languages.markup['doctype'].inside['internal-subset'].inside = Prism.languages.markup;

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function (env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Object.defineProperty(Prism.languages.markup.tag, 'addInlined', {
	/**
	 * Adds an inlined language to markup.
	 *
	 * An example of an inlined language is CSS with `<style>` tags.
	 *
	 * @param {string} tagName The name of the tag that contains the inlined language. This name will be treated as
	 * case insensitive.
	 * @param {string} lang The language key.
	 * @example
	 * addInlined('style', 'css');
	 */
	value: function addInlined(tagName, lang) {
		var includedCdataInside = {};
		includedCdataInside['language-' + lang] = {
			pattern: /(^<!\[CDATA\[)[\s\S]+?(?=\]\]>$)/i,
			lookbehind: true,
			inside: Prism.languages[lang]
		};
		includedCdataInside['cdata'] = /^<!\[CDATA\[|\]\]>$/i;

		var inside = {
			'included-cdata': {
				pattern: /<!\[CDATA\[[\s\S]*?\]\]>/i,
				inside: includedCdataInside
			}
		};
		inside['language-' + lang] = {
			pattern: /[\s\S]+/,
			inside: Prism.languages[lang]
		};

		var def = {};
		def[tagName] = {
			pattern: RegExp(/(<__[^>]*>)(?:<!\[CDATA\[(?:[^\]]|\](?!\]>))*\]\]>|(?!<!\[CDATA\[)[\s\S])*?(?=<\/__>)/.source.replace(/__/g, function () { return tagName; }), 'i'),
			lookbehind: true,
			greedy: true,
			inside: inside
		};

		Prism.languages.insertBefore('markup', 'cdata', def);
	}
});

Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;

Prism.languages.xml = Prism.languages.extend('markup', {});
Prism.languages.ssml = Prism.languages.xml;
Prism.languages.atom = Prism.languages.xml;
Prism.languages.rss = Prism.languages.xml;


/* **********************************************
     Begin prism-css.js
********************************************** */

(function (Prism) {

	var string = /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/;

	Prism.languages.css = {
		'comment': /\/\*[\s\S]*?\*\//,
		'atrule': {
			pattern: /@[\w-](?:[^;{\s]|\s+(?![\s{]))*(?:;|(?=\s*\{))/,
			inside: {
				'rule': /^@[\w-]+/,
				'selector-function-argument': {
					pattern: /(\bselector\s*\(\s*(?![\s)]))(?:[^()\s]|\s+(?![\s)])|\((?:[^()]|\([^()]*\))*\))+(?=\s*\))/,
					lookbehind: true,
					alias: 'selector'
				},
				'keyword': {
					pattern: /(^|[^\w-])(?:and|not|only|or)(?![\w-])/,
					lookbehind: true
				}
				// See rest below
			}
		},
		'url': {
			// https://drafts.csswg.org/css-values-3/#urls
			pattern: RegExp('\\burl\\((?:' + string.source + '|' + /(?:[^\\\r\n()"']|\\[\s\S])*/.source + ')\\)', 'i'),
			greedy: true,
			inside: {
				'function': /^url/i,
				'punctuation': /^\(|\)$/,
				'string': {
					pattern: RegExp('^' + string.source + '$'),
					alias: 'url'
				}
			}
		},
		'selector': RegExp('[^{}\\s](?:[^{};"\'\\s]|\\s+(?![\\s{])|' + string.source + ')*(?=\\s*\\{)'),
		'string': {
			pattern: string,
			greedy: true
		},
		'property': /(?!\s)[-_a-z\xA0-\uFFFF](?:(?!\s)[-\w\xA0-\uFFFF])*(?=\s*:)/i,
		'important': /!important\b/i,
		'function': /[-a-z0-9]+(?=\()/i,
		'punctuation': /[(){};:,]/
	};

	Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

	var markup = Prism.languages.markup;
	if (markup) {
		markup.tag.addInlined('style', 'css');

		Prism.languages.insertBefore('inside', 'attr-value', {
			'style-attr': {
				pattern: /(^|["'\s])style\s*=\s*(?:"[^"]*"|'[^']*')/i,
				lookbehind: true,
				inside: {
					'attr-value': {
						pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/,
						inside: {
							'style': {
								pattern: /(["'])[\s\S]+(?=["']$)/,
								lookbehind: true,
								alias: 'language-css',
								inside: Prism.languages.css
							},
							'punctuation': [
								{
									pattern: /^=/,
									alias: 'attr-equals'
								},
								/"|'/
							]
						}
					},
					'attr-name': /^style/i
				}
			}
		}, markup.tag);
	}

}(Prism));


/* **********************************************
     Begin prism-clike.js
********************************************** */

Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
			lookbehind: true,
			greedy: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*/,
			lookbehind: true,
			greedy: true
		}
	],
	'string': {
		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: true
	},
	'class-name': {
		pattern: /(\b(?:class|interface|extends|implements|trait|instanceof|new)\s+|\bcatch\s+\()[\w.\\]+/i,
		lookbehind: true,
		inside: {
			'punctuation': /[.\\]/
		}
	},
	'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	'boolean': /\b(?:true|false)\b/,
	'function': /\w+(?=\()/,
	'number': /\b0x[\da-f]+\b|(?:\b\d+(?:\.\d*)?|\B\.\d+)(?:e[+-]?\d+)?/i,
	'operator': /[<>]=?|[!=]=?=?|--?|\+\+?|&&?|\|\|?|[?*/~^%]/,
	'punctuation': /[{}[\];(),.:]/
};


/* **********************************************
     Begin prism-javascript.js
********************************************** */

Prism.languages.javascript = Prism.languages.extend('clike', {
	'class-name': [
		Prism.languages.clike['class-name'],
		{
			pattern: /(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:prototype|constructor))/,
			lookbehind: true
		}
	],
	'keyword': [
		{
			pattern: /((?:^|})\s*)(?:catch|finally)\b/,
			lookbehind: true
		},
		{
			pattern: /(^|[^.]|\.\.\.\s*)\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|(?:get|set)(?=\s*[\[$\w\xA0-\uFFFF])|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,
			lookbehind: true
		},
	],
	// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
	'function': /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,
	'number': /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/,
	'operator': /--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/
});

Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)\/(?:\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/,
		lookbehind: true,
		greedy: true,
		inside: {
			'regex-source': {
				pattern: /^(\/)[\s\S]+(?=\/[a-z]*$)/,
				lookbehind: true,
				alias: 'language-regex',
				inside: Prism.languages.regex
			},
			'regex-flags': /[a-z]+$/,
			'regex-delimiter': /^\/|\/$/
		}
	},
	// This must be declared before keyword because we use "function" inside the look-forward
	'function-variable': {
		pattern: /#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,
		alias: 'function'
	},
	'parameter': [
		{
			pattern: /(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,
			inside: Prism.languages.javascript
		},
		{
			pattern: /(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		},
		{
			pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,
			lookbehind: true,
			inside: Prism.languages.javascript
		}
	],
	'constant': /\b[A-Z](?:[A-Z_]|\dx?)*\b/
});

Prism.languages.insertBefore('javascript', 'string', {
	'template-string': {
		pattern: /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}|(?!\${)[^\\`])*`/,
		greedy: true,
		inside: {
			'template-punctuation': {
				pattern: /^`|`$/,
				alias: 'string'
			},
			'interpolation': {
				pattern: /((?:^|[^\\])(?:\\{2})*)\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})+}/,
				lookbehind: true,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\${|}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.markup.tag.addInlined('script', 'javascript');
}

Prism.languages.js = Prism.languages.javascript;


/* **********************************************
     Begin prism-file-highlight.js
********************************************** */

(function () {
	if (typeof self === 'undefined' || !self.Prism || !self.document) {
		return;
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
	if (!Element.prototype.matches) {
		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
	}

	var Prism = window.Prism;

	var LOADING_MESSAGE = 'Loading…';
	var FAILURE_MESSAGE = function (status, message) {
		return '✖ Error ' + status + ' while fetching file: ' + message;
	};
	var FAILURE_EMPTY_MESSAGE = '✖ Error: File does not exist or is empty';

	var EXTENSIONS = {
		'js': 'javascript',
		'py': 'python',
		'rb': 'ruby',
		'ps1': 'powershell',
		'psm1': 'powershell',
		'sh': 'bash',
		'bat': 'batch',
		'h': 'c',
		'tex': 'latex'
	};

	var STATUS_ATTR = 'data-src-status';
	var STATUS_LOADING = 'loading';
	var STATUS_LOADED = 'loaded';
	var STATUS_FAILED = 'failed';

	var SELECTOR = 'pre[data-src]:not([' + STATUS_ATTR + '="' + STATUS_LOADED + '"])'
		+ ':not([' + STATUS_ATTR + '="' + STATUS_LOADING + '"])';

	var lang = /\blang(?:uage)?-([\w-]+)\b/i;

	/**
	 * Sets the Prism `language-xxxx` or `lang-xxxx` class to the given language.
	 *
	 * @param {HTMLElement} element
	 * @param {string} language
	 * @returns {void}
	 */
	function setLanguageClass(element, language) {
		var className = element.className;
		className = className.replace(lang, ' ') + ' language-' + language;
		element.className = className.replace(/\s+/g, ' ').trim();
	}


	Prism.hooks.add('before-highlightall', function (env) {
		env.selector += ', ' + SELECTOR;
	});

	Prism.hooks.add('before-sanity-check', function (env) {
		var pre = /** @type {HTMLPreElement} */ (env.element);
		if (pre.matches(SELECTOR)) {
			env.code = ''; // fast-path the whole thing and go to complete

			pre.setAttribute(STATUS_ATTR, STATUS_LOADING); // mark as loading

			// add code element with loading message
			var code = pre.appendChild(document.createElement('CODE'));
			code.textContent = LOADING_MESSAGE;

			var src = pre.getAttribute('data-src');

			var language = env.language;
			if (language === 'none') {
				// the language might be 'none' because there is no language set;
				// in this case, we want to use the extension as the language
				var extension = (/\.(\w+)$/.exec(src) || [, 'none'])[1];
				language = EXTENSIONS[extension] || extension;
			}

			// set language classes
			setLanguageClass(code, language);
			setLanguageClass(pre, language);

			// preload the language
			var autoloader = Prism.plugins.autoloader;
			if (autoloader) {
				autoloader.loadLanguages(language);
			}

			// load file
			var xhr = new XMLHttpRequest();
			xhr.open('GET', src, true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					if (xhr.status < 400 && xhr.responseText) {
						// mark as loaded
						pre.setAttribute(STATUS_ATTR, STATUS_LOADED);

						// highlight code
						code.textContent = xhr.responseText;
						Prism.highlightElement(code);

					} else {
						// mark as failed
						pre.setAttribute(STATUS_ATTR, STATUS_FAILED);

						if (xhr.status >= 400) {
							code.textContent = FAILURE_MESSAGE(xhr.status, xhr.statusText);
						} else {
							code.textContent = FAILURE_EMPTY_MESSAGE;
						}
					}
				}
			};
			xhr.send(null);
		}
	});

	Prism.plugins.fileHighlight = {
		/**
		 * Executes the File Highlight plugin for all matching `pre` elements under the given container.
		 *
		 * Note: Elements which are already loaded or currently loading will not be touched by this method.
		 *
		 * @param {ParentNode} [container=document]
		 */
		highlight: function highlight(container) {
			var elements = (container || document).querySelectorAll(SELECTOR);

			for (var i = 0, element; element = elements[i++];) {
				Prism.highlightElement(element);
			}
		}
	};

	var logged = false;
	/** @deprecated Use `Prism.plugins.fileHighlight.highlight` instead. */
	Prism.fileHighlight = function () {
		if (!logged) {
			console.warn('Prism.fileHighlight is deprecated. Use `Prism.plugins.fileHighlight.highlight` instead.');
			logged = true;
		}
		Prism.plugins.fileHighlight.highlight.apply(this, arguments);
	};

})();
});

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

var markup = {
	title: "Markup",
	alias: [
		"html",
		"xml",
		"svg",
		"mathml"
	],
	aliasTitles: {
		html: "HTML",
		xml: "XML",
		svg: "SVG",
		mathml: "MathML"
	},
	option: "default",
	ext: [
		"html"
	]
};
var css = {
	title: "CSS",
	option: "default",
	peerDependencies: "markup",
	ext: [
		"css"
	]
};
var clike = {
	title: "C-like",
	option: "default",
	overrideExampleHeader: true,
	ext: [
		"c",
		"h",
		"ino"
	]
};
var javascript = {
	title: "JavaScript",
	require: "clike",
	peerDependencies: "markup",
	alias: "js",
	option: "default",
	ext: [
		"js"
	]
};
var abap = {
	title: "ABAP",
	ext: [
		"absp"
	]
};
var abnf = {
	title: "Augmented Backus–Naur form",
	ext: [
	]
};
var actionscript = {
	title: "ActionScript",
	require: "javascript",
	peerDependencies: "markup",
	ext: [
		"as"
	]
};
var ada = {
	title: "Ada",
	ext: [
	]
};
var apacheconf = {
	title: "Apache Configuration",
	ext: [
	]
};
var apl = {
	title: "APL",
	ext: [
		"dyalog",
		"apl"
	]
};
var applescript = {
	title: "AppleScript",
	ext: [
	]
};
var arduino = {
	title: "Arduino",
	require: "cpp",
	ext: [
	]
};
var arff = {
	title: "ARFF",
	ext: [
	]
};
var asciidoc = {
	alias: "adoc",
	title: "AsciiDoc",
	ext: [
	]
};
var asm6502 = {
	title: "6502 Assembly",
	ext: [
	]
};
var aspnet = {
	title: "ASP.NET (C#)",
	require: [
		"markup",
		"csharp"
	],
	ext: [
	]
};
var autohotkey = {
	title: "AutoHotkey",
	ext: [
	]
};
var autoit = {
	title: "AutoIt",
	ext: [
	]
};
var bash = {
	title: "Bash",
	alias: "shell",
	aliasTitles: {
		shell: "Shell"
	},
	ext: [
		"sh",
		"ksh",
		"bash"
	]
};
var basic = {
	title: "BASIC",
	ext: [
	]
};
var batch = {
	title: "Batch",
	ext: [
	]
};
var bison = {
	title: "Bison",
	require: "c",
	ext: [
	]
};
var bnf = {
	title: "Backus–Naur form",
	alias: "rbnf",
	aliasTitles: {
		rbnf: "Routing Backus–Naur form"
	},
	ext: [
	]
};
var brainfuck = {
	title: "Brainfuck",
	ext: [
		"b",
		"bf"
	]
};
var bro = {
	title: "Bro",
	ext: [
	]
};
var c = {
	title: "C",
	require: "clike",
	ext: [
		"c",
		"h",
		"ino"
	]
};
var csharp = {
	title: "C#",
	require: "clike",
	alias: "dotnet",
	ext: [
		"cs"
	]
};
var cpp = {
	title: "C++",
	require: "c",
	ext: [
		"cpp",
		"c++",
		"cc",
		"cxx",
		"hpp",
		"h++",
		"hh",
		"hxx"
	]
};
var cil = {
	title: "CIL",
	ext: [
	]
};
var coffeescript = {
	title: "CoffeeScript",
	require: "javascript",
	alias: "coffee",
	ext: [
		"coffee"
	]
};
var cmake = {
	title: "CMake",
	ext: [
	]
};
var clojure = {
	title: "Clojure",
	ext: [
		"clj",
		"cljc",
		"cljx"
	]
};
var crystal = {
	title: "Crystal",
	require: "ruby",
	ext: [
		"cr"
	]
};
var csp = {
	title: "Content-Security-Policy",
	ext: [
	]
};
var d = {
	title: "D",
	require: "clike",
	ext: [
		"d"
	]
};
var dart = {
	title: "Dart",
	require: "clike",
	ext: [
		"dart"
	]
};
var diff = {
	title: "Diff",
	ext: [
		"diff",
		"patch"
	]
};
var django = {
	title: "Django/Jinja2",
	require: "markup-templating",
	alias: "jinja2",
	ext: [
	]
};
var docker = {
	title: "Docker",
	alias: "dockerfile",
	ext: [
	]
};
var ebnf = {
	title: "Extended Backus–Naur form",
	ext: [
	]
};
var eiffel = {
	title: "Eiffel",
	ext: [
		"e"
	]
};
var ejs = {
	title: "EJS",
	require: [
		"javascript",
		"markup-templating"
	],
	ext: [
	]
};
var elixir = {
	title: "Elixir",
	ext: [
	]
};
var elm = {
	title: "Elm",
	ext: [
		"elm"
	]
};
var erb = {
	title: "ERB",
	require: [
		"ruby",
		"markup-templating"
	],
	ext: [
		"erb"
	]
};
var erlang = {
	title: "Erlang",
	ext: [
		"erl"
	]
};
var fsharp = {
	title: "F#",
	require: "clike",
	ext: [
		"fs"
	]
};
var flow = {
	title: "Flow",
	require: "javascript",
	ext: [
	]
};
var fortran = {
	title: "Fortran",
	ext: [
		"f",
		"for",
		"f77",
		"f90"
	]
};
var gcode = {
	title: "G-code",
	ext: [
	]
};
var gedcom = {
	title: "GEDCOM",
	ext: [
	]
};
var gherkin = {
	title: "Gherkin",
	ext: [
		"feature"
	]
};
var git = {
	title: "Git",
	ext: [
	]
};
var glsl = {
	title: "GLSL",
	require: "clike",
	ext: [
	]
};
var gml = {
	title: "GameMaker Language",
	alias: "gamemakerlanguage",
	require: "clike",
	ext: [
	]
};
var go = {
	title: "Go",
	require: "clike",
	ext: [
		"go"
	]
};
var graphql = {
	title: "GraphQL",
	ext: [
	]
};
var groovy = {
	title: "Groovy",
	require: "clike",
	ext: [
		"groovy",
		"gradle"
	]
};
var haml = {
	title: "Haml",
	require: "ruby",
	peerDependencies: [
		"css",
		"coffeescript",
		"erb",
		"javascript",
		"less",
		"markdown",
		"ruby",
		"scss",
		"textile"
	],
	ext: [
		"haml"
	]
};
var handlebars = {
	title: "Handlebars",
	require: "markup-templating",
	ext: [
		"html",
		"htm",
		"handlebars",
		"hbs"
	]
};
var haskell = {
	title: "Haskell",
	alias: "hs",
	ext: [
		"hs"
	]
};
var haxe = {
	title: "Haxe",
	require: "clike",
	ext: [
		"hx"
	]
};
var hcl = {
	title: "HCL",
	ext: [
	]
};
var http = {
	title: "HTTP",
	peerDependencies: [
		"javascript",
		"markup"
	],
	ext: [
	]
};
var hpkp = {
	title: "HTTP Public-Key-Pins",
	ext: [
	]
};
var hsts = {
	title: "HTTP Strict-Transport-Security",
	ext: [
	]
};
var ichigojam = {
	title: "IchigoJam",
	ext: [
	]
};
var icon = {
	title: "Icon",
	ext: [
	]
};
var inform7 = {
	title: "Inform 7",
	ext: [
	]
};
var ini = {
	title: "Ini",
	ext: [
		"properties",
		"ini",
		"in"
	]
};
var io = {
	title: "Io",
	ext: [
	]
};
var j = {
	title: "J",
	ext: [
	]
};
var java = {
	title: "Java",
	require: "clike",
	ext: [
		"java"
	]
};
var javadoc = {
	title: "JavaDoc",
	require: [
		"markup",
		"java",
		"javadoclike"
	],
	peerDependencies: [
		"scala"
	],
	ext: [
	]
};
var javadoclike = {
	title: "JavaDoc-like",
	peerDependencies: [
		"java",
		"javascript",
		"php"
	],
	ext: [
	]
};
var javastacktrace = {
	title: "Java stack trace",
	ext: [
	]
};
var jolie = {
	title: "Jolie",
	require: "clike",
	ext: [
	]
};
var jsdoc = {
	title: "JSDoc",
	require: [
		"javascript",
		"javadoclike"
	],
	peerDependencies: [
		"actionscript",
		"coffeescript"
	],
	ext: [
	]
};
var json = {
	title: "JSON",
	ext: [
		"json",
		"map"
	]
};
var jsonp = {
	title: "JSONP",
	require: "json",
	ext: [
	]
};
var json5 = {
	title: "JSON5",
	require: "json",
	ext: [
	]
};
var julia = {
	title: "Julia",
	ext: [
		"jl"
	]
};
var keyman = {
	title: "Keyman",
	ext: [
	]
};
var kotlin = {
	title: "Kotlin",
	require: "clike",
	ext: [
		"kt"
	]
};
var latex = {
	title: "LaTeX",
	alias: [
		"math"
	],
	ext: [
		"text",
		"ltx",
		"tex"
	]
};
var less = {
	title: "Less",
	require: "css",
	ext: [
		"less"
	]
};
var liquid = {
	title: "Liquid",
	ext: [
	]
};
var lisp = {
	title: "Lisp",
	alias: [
		"emacs",
		"elisp",
		"emacs-lisp"
	],
	ext: [
		"cl",
		"lisp",
		"el"
	]
};
var livescript = {
	title: "LiveScript",
	ext: [
		"ls"
	]
};
var lolcode = {
	title: "LOLCODE",
	ext: [
	]
};
var lua = {
	title: "Lua",
	ext: [
		"lua"
	]
};
var makefile = {
	title: "Makefile",
	ext: [
	]
};
var markdown = {
	title: "Markdown",
	require: "markup",
	alias: "md",
	ext: [
		"markdown",
		"md",
		"mkd"
	]
};
var matlab = {
	title: "MATLAB",
	ext: [
	]
};
var mel = {
	title: "MEL",
	ext: [
	]
};
var mizar = {
	title: "Mizar",
	ext: [
	]
};
var monkey = {
	title: "Monkey",
	ext: [
	]
};
var n1ql = {
	title: "N1QL",
	ext: [
	]
};
var n4js = {
	title: "N4JS",
	require: "javascript",
	peerDependencies: [
		"jsdoc"
	],
	alias: "n4jsd",
	ext: [
	]
};
var nasm = {
	title: "NASM",
	ext: [
	]
};
var nginx = {
	title: "nginx",
	require: "clike",
	ext: [
	]
};
var nim = {
	title: "Nim",
	ext: [
	]
};
var nix = {
	title: "Nix",
	ext: [
	]
};
var nsis = {
	title: "NSIS",
	ext: [
		"nsh",
		"nsi"
	]
};
var objectivec = {
	title: "Objective-C",
	require: "c",
	ext: [
		"m",
		"mm"
	]
};
var ocaml = {
	title: "OCaml",
	ext: [
		"ml",
		"mli",
		"mll",
		"mly"
	]
};
var opencl = {
	title: "OpenCL",
	require: "cpp",
	peerDependencies: [
		"c",
		"cpp"
	],
	overrideExampleHeader: true,
	ext: [
	]
};
var oz = {
	title: "Oz",
	ext: [
		"oz"
	]
};
var parigp = {
	title: "PARI/GP",
	ext: [
	]
};
var parser = {
	title: "Parser",
	require: "markup",
	ext: [
	]
};
var pascal = {
	title: "Pascal",
	alias: "objectpascal",
	aliasTitles: {
		objectpascal: "Object Pascal"
	},
	ext: [
		"p",
		"pas"
	]
};
var perl = {
	title: "Perl",
	ext: [
		"pl",
		"pm"
	]
};
var php = {
	title: "PHP",
	require: [
		"clike",
		"markup-templating"
	],
	ext: [
		"php",
		"php3",
		"php4",
		"php5",
		"php7",
		"phtml"
	]
};
var phpdoc = {
	title: "PHPDoc",
	require: [
		"php",
		"javadoclike"
	],
	ext: [
	]
};
var plsql = {
	title: "PL/SQL",
	require: "sql",
	ext: [
		"pls"
	]
};
var powershell = {
	title: "PowerShell",
	ext: [
		"ps1",
		"psd1",
		"psm1"
	]
};
var processing = {
	title: "Processing",
	require: "clike",
	ext: [
	]
};
var prolog = {
	title: "Prolog",
	ext: [
	]
};
var properties = {
	title: ".properties",
	ext: [
		"properties",
		"ini",
		"in"
	]
};
var protobuf = {
	title: "Protocol Buffers",
	require: "clike",
	ext: [
		"proto"
	]
};
var pug = {
	title: "Pug",
	require: [
		"markup",
		"javascript"
	],
	peerDependencies: [
		"coffeescript",
		"ejs",
		"handlebars",
		"less",
		"livescript",
		"markdown",
		"scss",
		"stylus",
		"twig"
	],
	ext: [
		"jade",
		"pug"
	]
};
var puppet = {
	title: "Puppet",
	ext: [
		"pp"
	]
};
var pure = {
	title: "Pure",
	peerDependencies: [
		"c",
		"cpp",
		"fortran"
	],
	ext: [
	]
};
var python = {
	title: "Python",
	alias: "py",
	ext: [
		"pyx",
		"pxd",
		"pxi"
	]
};
var q = {
	title: "Q (kdb+ database)",
	ext: [
		"q"
	]
};
var qore = {
	title: "Qore",
	require: "clike",
	ext: [
	]
};
var r = {
	title: "R",
	ext: [
		"r",
		"R"
	]
};
var jsx = {
	title: "React JSX",
	require: [
		"markup",
		"javascript"
	],
	peerDependencies: [
		"jsdoc",
		"js-extras"
	],
	ext: [
		"jsx"
	]
};
var tsx = {
	title: "React TSX",
	require: [
		"jsx",
		"typescript"
	],
	ext: [
		"tsx"
	]
};
var renpy = {
	title: "Ren'py",
	ext: [
	]
};
var reason = {
	title: "Reason",
	require: "clike",
	ext: [
	]
};
var regex = {
	title: "Regex",
	peerDependencies: [
		"actionscript",
		"coffeescript",
		"flow",
		"javascript",
		"typescript",
		"vala"
	],
	ext: [
	]
};
var rest = {
	title: "reST (reStructuredText)",
	ext: [
	]
};
var rip = {
	title: "Rip",
	ext: [
	]
};
var roboconf = {
	title: "Roboconf",
	ext: [
	]
};
var ruby = {
	title: "Ruby",
	require: "clike",
	alias: "rb",
	ext: [
		"rb"
	]
};
var rust = {
	title: "Rust",
	ext: [
		"rs"
	]
};
var sas = {
	title: "SAS",
	ext: [
		"sas"
	]
};
var sass = {
	title: "Sass (Sass)",
	require: "css",
	ext: [
		"sass"
	]
};
var scss = {
	title: "Sass (Scss)",
	require: "css",
	ext: [
		"scss"
	]
};
var scala = {
	title: "Scala",
	require: "java",
	ext: [
		"scala"
	]
};
var scheme = {
	title: "Scheme",
	ext: [
		"scm",
		"ss"
	]
};
var smalltalk = {
	title: "Smalltalk",
	ext: [
		"st"
	]
};
var smarty = {
	title: "Smarty",
	require: "markup-templating",
	ext: [
		"tpl"
	]
};
var sparql = {
	title: "SPARQL",
	require: "turtle",
	ext: [
	]
};
var sql = {
	title: "SQL",
	ext: [
		"cql"
	]
};
var soy = {
	title: "Soy (Closure Template)",
	require: "markup-templating",
	ext: [
		"soy"
	]
};
var stylus = {
	title: "Stylus",
	ext: [
		"styl"
	]
};
var swift = {
	title: "Swift",
	require: "clike",
	ext: [
		"swift"
	]
};
var tap = {
	title: "TAP",
	require: "yaml",
	ext: [
	]
};
var tcl = {
	title: "Tcl",
	ext: [
		"tcl"
	]
};
var textile = {
	title: "Textile",
	require: "markup",
	peerDependencies: "css",
	ext: [
		"textile"
	]
};
var toml = {
	title: "TOML",
	ext: [
	]
};
var tt2 = {
	title: "Template Toolkit 2",
	require: [
		"clike",
		"markup-templating"
	],
	ext: [
	]
};
var turtle = {
	title: "Turtle",
	ext: [
	]
};
var twig = {
	title: "Twig",
	require: "markup",
	ext: [
	]
};
var typescript = {
	title: "TypeScript",
	require: "javascript",
	alias: "ts",
	ext: [
		"ts"
	]
};
var vala = {
	title: "Vala",
	require: "clike",
	ext: [
	]
};
var vbnet = {
	title: "VB.Net",
	require: "basic",
	ext: [
		"vb"
	]
};
var velocity = {
	title: "Velocity",
	require: "markup",
	ext: [
		"vtl"
	]
};
var verilog = {
	title: "Verilog",
	ext: [
		"v",
		"sv",
		"svh"
	]
};
var vhdl = {
	title: "VHDL",
	ext: [
		"vhd",
		"vhdl"
	]
};
var vim = {
	title: "vim",
	ext: [
	]
};
var wasm = {
	title: "WebAssembly",
	ext: [
	]
};
var wiki = {
	title: "Wiki markup",
	require: "markup",
	ext: [
	]
};
var xeora = {
	title: "Xeora",
	require: "markup",
	alias: "xeoracube",
	aliasTitles: {
		xeoracube: "XeoraCube"
	},
	ext: [
	]
};
var xojo = {
	title: "Xojo (REALbasic)",
	ext: [
	]
};
var xquery = {
	title: "XQuery",
	require: "markup",
	ext: [
		"xy",
		"xquery"
	]
};
var yaml = {
	title: "YAML",
	alias: "yml",
	ext: [
		"yaml",
		"yml"
	]
};
var languages = {
	markup: markup,
	css: css,
	clike: clike,
	javascript: javascript,
	abap: abap,
	abnf: abnf,
	actionscript: actionscript,
	ada: ada,
	apacheconf: apacheconf,
	apl: apl,
	applescript: applescript,
	arduino: arduino,
	arff: arff,
	asciidoc: asciidoc,
	asm6502: asm6502,
	aspnet: aspnet,
	autohotkey: autohotkey,
	autoit: autoit,
	bash: bash,
	basic: basic,
	batch: batch,
	bison: bison,
	bnf: bnf,
	brainfuck: brainfuck,
	bro: bro,
	c: c,
	csharp: csharp,
	cpp: cpp,
	cil: cil,
	coffeescript: coffeescript,
	cmake: cmake,
	clojure: clojure,
	crystal: crystal,
	csp: csp,
	"css-extras": {
	title: "CSS Extras",
	require: "css",
	ext: [
	]
},
	d: d,
	dart: dart,
	diff: diff,
	django: django,
	docker: docker,
	ebnf: ebnf,
	eiffel: eiffel,
	ejs: ejs,
	elixir: elixir,
	elm: elm,
	erb: erb,
	erlang: erlang,
	fsharp: fsharp,
	flow: flow,
	fortran: fortran,
	gcode: gcode,
	gedcom: gedcom,
	gherkin: gherkin,
	git: git,
	glsl: glsl,
	gml: gml,
	go: go,
	graphql: graphql,
	groovy: groovy,
	haml: haml,
	handlebars: handlebars,
	haskell: haskell,
	haxe: haxe,
	hcl: hcl,
	http: http,
	hpkp: hpkp,
	hsts: hsts,
	ichigojam: ichigojam,
	icon: icon,
	inform7: inform7,
	ini: ini,
	io: io,
	j: j,
	java: java,
	javadoc: javadoc,
	javadoclike: javadoclike,
	javastacktrace: javastacktrace,
	jolie: jolie,
	jsdoc: jsdoc,
	"js-extras": {
	title: "JS Extras",
	require: "javascript",
	peerDependencies: [
		"actionscript",
		"coffeescript",
		"flow",
		"n4js",
		"typescript"
	],
	ext: [
	]
},
	json: json,
	jsonp: jsonp,
	json5: json5,
	julia: julia,
	keyman: keyman,
	kotlin: kotlin,
	latex: latex,
	less: less,
	liquid: liquid,
	lisp: lisp,
	livescript: livescript,
	lolcode: lolcode,
	lua: lua,
	makefile: makefile,
	markdown: markdown,
	"markup-templating": {
	title: "Markup templating",
	require: "markup",
	ext: [
	]
},
	matlab: matlab,
	mel: mel,
	mizar: mizar,
	monkey: monkey,
	n1ql: n1ql,
	n4js: n4js,
	"nand2tetris-hdl": {
	title: "Nand To Tetris HDL",
	ext: [
	]
},
	nasm: nasm,
	nginx: nginx,
	nim: nim,
	nix: nix,
	nsis: nsis,
	objectivec: objectivec,
	ocaml: ocaml,
	opencl: opencl,
	oz: oz,
	parigp: parigp,
	parser: parser,
	pascal: pascal,
	perl: perl,
	php: php,
	phpdoc: phpdoc,
	"php-extras": {
	title: "PHP Extras",
	require: "php",
	ext: [
	]
},
	plsql: plsql,
	powershell: powershell,
	processing: processing,
	prolog: prolog,
	properties: properties,
	protobuf: protobuf,
	pug: pug,
	puppet: puppet,
	pure: pure,
	python: python,
	q: q,
	qore: qore,
	r: r,
	jsx: jsx,
	tsx: tsx,
	renpy: renpy,
	reason: reason,
	regex: regex,
	rest: rest,
	rip: rip,
	roboconf: roboconf,
	ruby: ruby,
	rust: rust,
	sas: sas,
	sass: sass,
	scss: scss,
	scala: scala,
	scheme: scheme,
	smalltalk: smalltalk,
	smarty: smarty,
	sparql: sparql,
	sql: sql,
	soy: soy,
	stylus: stylus,
	swift: swift,
	tap: tap,
	tcl: tcl,
	textile: textile,
	toml: toml,
	tt2: tt2,
	turtle: turtle,
	twig: twig,
	typescript: typescript,
	"t4-cs": {
	title: "T4 Text Templates (C#)",
	require: [
		"t4-templating",
		"csharp"
	],
	alias: "t4",
	ext: [
	]
},
	"t4-vb": {
	title: "T4 Text Templates (VB)",
	require: [
		"t4-templating",
		"visual-basic"
	],
	ext: [
	]
},
	"t4-templating": {
	title: "T4 templating",
	ext: [
	]
},
	vala: vala,
	vbnet: vbnet,
	velocity: velocity,
	verilog: verilog,
	vhdl: vhdl,
	vim: vim,
	"visual-basic": {
	title: "Visual Basic",
	alias: "vb",
	ext: [
	]
},
	wasm: wasm,
	wiki: wiki,
	xeora: xeora,
	xojo: xojo,
	xquery: xquery,
	yaml: yaml
};

let peerDependentsMap = null;
const loadedCache = new Set(['markup', 'css', 'clike', 'javascript']);
const prismComponentCache = new Map();

function getPeerDependentsMap() {
  const peerDependentsMap = {};
  Object.keys(languages).forEach(function (language) {
    if (language === 'meta') {
      return false;
    }

    if (languages[language].peerDependencies) {
      let peerDependencies = languages[language].peerDependencies;

      if (!Array.isArray(peerDependencies)) {
        peerDependencies = [peerDependencies];
      }

      peerDependencies.forEach(function (peerDependency) {
        if (!peerDependentsMap[peerDependency]) {
          peerDependentsMap[peerDependency] = [];
        }

        peerDependentsMap[peerDependency].push(language);
      });
    }
  });
  return peerDependentsMap;
}

function getPeerDependents(mainLanguage) {
  if (!peerDependentsMap) {
    peerDependentsMap = getPeerDependentsMap();
  }

  return peerDependentsMap[mainLanguage] || [];
} // Look for the origin languge by alias


const transfromAliasToOrigin = arr => {
  const result = [];

  for (const lang of arr) {
    if (languages[lang]) {
      result.push(lang);
    } else {
      const language = Object.keys(languages).find(name => {
        const l = languages[name];

        if (l.alias) {
          return l.alias === lang || Array.isArray(l.alias) && l.alias.includes(lang);
        }

        return false;
      });

      if (language) {
        result.push(language);
      } else {
        // The lang is not exist, the will handle in `initLoadLanguage`
        result.push(lang);
      }
    }
  }

  return result;
};

function initLoadLanguage(Prism) {
  return async function loadLanguages(arr, withoutDependencies) {
    // If no argument is passed, load all components
    if (!arr) {
      arr = Object.keys(languages).filter(function (language) {
        return language !== 'meta';
      });
    }

    if (arr && !arr.length) {
      return Promise.reject(new Error('The first parameter should be a list of load languages or single language.'));
    }

    if (!Array.isArray(arr)) {
      arr = [arr];
    }

    const promises = [];
    const transformedLangs = transfromAliasToOrigin(arr);

    for (const language of transformedLangs) {
      // handle not existed
      if (!languages[language]) {
        promises.push(Promise.resolve({
          lang: language,
          status: 'noexist'
        }));
        continue;
      } // handle already cached


      if (loadedCache.has(language)) {
        promises.push(Promise.resolve({
          lang: language,
          status: 'cached'
        }));
        continue;
      } // Load dependencies first


      if (!withoutDependencies && languages[language].require) {
        const results = await loadLanguages(languages[language].require);
        promises.push(...results);
      }

      delete Prism.languages[language];

      if (!prismComponentCache.has(language)) {
        await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('prismjs/components/prism-' + language)); });
        prismComponentCache.set(language, Prism.languages[language]);
      } else {
        Prism.languages[language] = prismComponentCache.get(language);
      }

      loadedCache.add(language);
      promises.push(Promise.resolve({
        status: 'loaded',
        lang: language
      })); // Reload dependents

      const dependents = getPeerDependents(language).filter(function (dependent) {
        // If dependent language was already loaded,
        // we want to reload it.
        if (Prism.languages[dependent]) {
          delete Prism.languages[dependent];
          loadedCache.delete(dependent);
          return true;
        }

        return false;
      });

      if (dependents.length) {
        const results = await loadLanguages(dependents, true);
        promises.push(...results);
      }
    }

    return Promise.all(promises);
  };
}

window.Prism = prism;
/* eslint-disable */

Promise.resolve().then(function () { return require('./prism-keep-markup-0b71ed26.js'); });
/* eslint-enable */

const langs = [];

for (const name of Object.keys(languages)) {
  const lang = languages[name];
  langs.push({
    name,
    ...lang
  });

  if (lang.alias) {
    if (typeof lang.alias === 'string') {
      langs.push({
        name: lang.alias,
        ...lang
      });
    } else if (Array.isArray(lang.alias)) {
      langs.push(...lang.alias.map(a => ({
        name: a,
        ...lang
      })));
    }
  }
}

const loadLanguage = initLoadLanguage(prism);

const search = text => {
  return fuzzaldrin.filter(langs, text, {
    key: 'name'
  });
}; // pre load latex and yaml and html for `math block` \ `front matter` and `html block`


loadLanguage('latex');
loadLanguage('yaml');

var css_248z$1 = "/*\n | File Icons\n | @link https://github.com/file-icons\n | @author Daniel Brooker https://github.com/DanBrooker\n */\n\n/* ----------------------------[ Colors ]---------------------------------- */\n\n/*============================================================================*\n\tPALETTE\n\tBase16 colours from https://github.com/chriskempson/base16\n/*============================================================================*/\n.light-red:before {\n  color: #c97071;\n}\n.medium-red:before {\n  color: #ac4142;\n}\n.dark-red:before {\n  color: #742c2d;\n}\n.light-green:before {\n  color: #a6ba7b;\n}\n.medium-green:before {\n  color: #90a959;\n}\n.dark-green:before {\n  color: #66783e;\n}\n.light-yellow:before {\n  color: #fae0bc;\n}\n.medium-yellow:before {\n  color: #ee9e2e;\n}\n.dark-yellow:before {\n  color: #d88511;\n}\n.light-blue:before {\n  color: #6098b0;\n}\n.medium-blue:before {\n  color: #6a9fb5;\n}\n.dark-blue:before {\n  color: #46788d;\n}\n.light-maroon:before {\n  color: #be7953;\n}\n.medium-maroon:before {\n  color: #8f5536;\n}\n.dark-maroon:before {\n  color: #573421;\n}\n.light-purple:before {\n  color: #c7a4c0;\n}\n.medium-purple:before {\n  color: #aa759f;\n}\n.dark-purple:before {\n  color: #825078;\n}\n.light-orange:before {\n  color: #d99762;\n}\n.medium-orange:before {\n  color: #d28445;\n}\n.dark-orange:before {\n  color: #a35f27;\n}\n.light-cyan:before {\n  color: #6bb0a4;\n}\n.medium-cyan:before {\n  color: #75b5aa;\n}\n.dark-cyan:before {\n  color: #4d9085;\n}\n.light-pink:before {\n  color: #ff4ddb;\n}\n.medium-pink:before {\n  color: #ff00cc;\n}\n.dark-pink:before {\n  color: #b3008f;\n}\n.theme-colour-check {\n  background: #ffffff;\n}\n\n/* ----------------------------[ Fonts ]---------------------------------- */\n\n@font-face {\n\tfont-family: FontAwesome;\n\tfont-weight: normal;\n\tfont-style: normal;\n\tsrc: url(\"../fonts/fontawesome.woff2\");\n}\n\n@font-face {\n\tfont-family: Mfizz;\n\tsrc: url(\"../fonts/mfixx.woff2\");\n\tfont-weight: normal;\n\tfont-style: normal;\n}\n\n@font-face {\n\tfont-family: Devicons;\n\tsrc: url(\"../fonts/devopicons.woff2\");\n\tfont-weight: normal;\n\tfont-style: normal;\n}\n\n@font-face {\n\tfont-family: file-icons;\n\tsrc: url(\"../fonts/file-icons.woff2\");\n\tfont-weight: normal;\n\tfont-style: normal;\n}\n\n@font-face {\n\tfont-family: octicons;\n\tsrc: url(\"../fonts/octicons.woff2\");\n\tfont-weight: normal;\n\tfont-style: normal;\n}\n\n/* ----------------------------[ Icons ]---------------------------------- */\n\n.icon:before{\n\tfont-weight: normal;\n\tfont-style: normal;\n\ttext-align: center;\n\twidth: 16px;\n\tline-height: 1;\n\tposition: relative;\n\tdisplay: inline-block;\n\t-webkit-font-smoothing: antialiased;\n}\n\n/*============================================================================*\n  Octicons\n  https://github.com/github/octicons\n/*============================================================================*/\n\n.binary-icon:before       { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f094\"; }\n.book-icon:before         { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f007\"; }\n.brew-icon:before         { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f069\"; font-size: 15px; left: 1px; }\n.checklist-icon:before    { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f076\"; font-size: 17px; left: 1px; }\n.code-icon:before         { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f05f\"; }\n.database-icon:before     { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f096\"; }\n.gear-icon:before         { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f02f\"; }\n.git-commit-icon:before   { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f01f\"; }\n.git-merge-icon:before    { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f023\"; }\n.github-icon:before       { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f00a\"; }\n.graph-icon:before        { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f043\"; }\n.image-icon:before        { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f012\"; }\n.key-icon:before          { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f049\"; }\n.link-icon:before         { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f0b0\"; }\n.markdown-icon:before     { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f0c9\"; }\n.package-icon:before      { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f0c4\"; }\n.ruby-icon:before         { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f047\"; }\n.secret-icon:before       { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f08c\"; }\n.squirrel-icon:before     { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f0b2\"; font-size: 15px; }\n.text-icon:before         { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f011\"; }\n.zip-icon:before          { font-family: octicons; font-size: 16px; top: 1px; content: \"\\f013\"; }\n\n\n\n\n/*============================================================================*\n  FontAwesome\n  http://fortawesome.github.io/Font-Awesome/cheatsheet\n/*============================================================================*/\n\n.android-icon:before      { font-family: FontAwesome; font-size: 13px; content: \"\\f17b\"; font-size: 16px; top: 1px; }\n.at-icon:before           { font-family: FontAwesome; font-size: 13px; content: \"\\f1fa\"; font-size: 15px; top: 1px; }\n.audio-icon:before        { font-family: FontAwesome; font-size: 13px; content: \"\\f028\"; font-size: 15px; top: 1px; }\n.bullhorn-icon:before     { font-family: FontAwesome; font-size: 13px; content: \"\\f0a1\"; font-size: 16px; top: 2px; }\n.calc-icon:before         { font-family: FontAwesome; font-size: 13px; content: \"\\f1ec\"; font-size: 14px; }\n.coffee-icon:before       { font-family: FontAwesome; font-size: 13px; content: \"\\f0f4\"; font-size: 14px; top: 1px; }\n.css3-icon:before         { font-family: FontAwesome; font-size: 13px; content: \"\\f13c\"; top: 0; }\n.circle-icon:before       { font-family: FontAwesome; font-size: 13px; content: \"\\f111\"; font-size: 16px; top: 1px; }\n.earth-icon:before        { font-family: FontAwesome; font-size: 13px; content: \"\\f0ac\"; font-size: 15px; }\n.gears-icon:before        { font-family: FontAwesome; font-size: 13px; content: \"\\f085\"; font-size: 15px; }\n.html5-icon:before        { font-family: FontAwesome; font-size: 13px; content: \"\\f13b\"; font-size: 15px; top: 1px; }\n.mobile-icon:before       { font-family: FontAwesome; font-size: 13px; content: \"\\f10b\"; font-size: 20px; top: 2px; }\n.moon-icon:before         { font-family: FontAwesome; font-size: 13px; content: \"\\f186\"; font-size: 16px; top: 1px; }\n.music-icon:before        { font-family: FontAwesome; font-size: 13px; content: \"\\f001\"; font-size: 15px; }\n.print-icon:before        { font-family: FontAwesome; font-size: 13px; content: \"\\f02f\"; font-size: 15px; top: 2px; }\n.recycle-icon:before      { font-family: FontAwesome; font-size: 13px; content: \"\\f1b8\"; font-size: 15px; top: 2px; }\n.rss-icon:before          { font-family: FontAwesome; font-size: 13px; content: \"\\f143\"; font-size: 16px; top: 2px; }\n.smarty-icon:before       { font-family: FontAwesome; font-size: 13px; content: \"\\f0eb\"; font-size: 15px; }\n.sourcemap-icon:before    { font-family: FontAwesome; font-size: 13px; content: \"\\f279\"; font-size: 14px; }\n.sun-icon:before          { font-family: FontAwesome; font-size: 13px; content: \"\\f185\"; font-size: 14px; -webkit-font-smoothing: subpixel-antialiased; }\n.toc-icon:before          { font-family: FontAwesome; font-size: 13px; content: \"\\f03a\"; font-size: 15px; top: 2px; }\n.twig-icon:before         { font-family: FontAwesome; font-size: 13px; content: \"\\f1bb\"; font-size: 14px; }\n.pdf-icon:before         { font-family: FontAwesome; font-size: 13px; content: \"\\f1c1\"; font-size: 14px; }\n\n\n\n/*============================================================================*\n  Mfizz\n  http://mfizz.com/oss/font-mfizz\n/*============================================================================*/\n\n.apache-icon:before       { font-family: Mfizz; font-size: 14px; content: \"\\f102\"; top: 3px; font-size: 15px; }\n.archlinux-icon:before    { font-family: Mfizz; font-size: 14px; content: \"A\";     top: 1px; font-size: 15px; }\n.c-icon:before            { font-family: Mfizz; font-size: 14px; content: \"\\f106\"; top: 1px; font-size: 13px; }\n.cpp-icon:before          { font-family: Mfizz; font-size: 14px; content: \"\\f10b\"; top: 1px; }\n.csharp-icon:before       { font-family: Mfizz; font-size: 14px; content: \"\\f10c\"; top: 1px; }\n.debian-icon:before       { font-family: Mfizz; font-size: 14px; content: \"\\f111\"; top: 1px; }\n.elixir-icon:before       { font-family: Mfizz; font-size: 14px; content: \"\\f113\"; top: 1px; }\n.gnome-icon:before        { font-family: Mfizz; font-size: 14px; content: \"\\f119\"; top: 1px; }\n.haskell-icon:before      { font-family: Mfizz; font-size: 14px; content: \"\\f121\"; top: 2px; font-size: 16px; }\n.java-icon:before         { font-family: Mfizz; font-size: 14px; content: \"\\f126\"; top: 2px; font-size: 16px; }\n.js-icon:before           { font-family: Mfizz; font-size: 14px; content: \"\\f129\"; top: 1px; font-size: 14px; }\n.msql-icon:before         { font-family: Mfizz; font-size: 14px; content: \"\\f136\"; top: 2px; font-size: 15px; text-shadow: 0 0 0; }\n.objc-icon:before         { font-family: Mfizz; font-size: 14px; content: \"\\f13e\"; top: 2px; font-size: 16px; }\n.osx-icon:before          { font-family: Mfizz; font-size: 14px; content: \"\\f141\"; top: 1px; }\n.perl-icon:before         { font-family: Mfizz; font-size: 14px; content: \"\\f142\"; top: 1px; }\n.python-icon:before       { font-family: Mfizz; font-size: 14px; content: \"\\f14c\"; top: 1px; }\n.red-hat-icon:before      { font-family: Mfizz; font-size: 14px; content: \"\\f14e\"; top: 2px; }\n.scala-icon:before        { font-family: Mfizz; font-size: 14px; content: \"\\f154\"; top: 1px; }\n.sql-icon:before          { font-family: Mfizz; font-size: 14px; content: \"\\f10e\"; top: 1px; }\n.svg-icon:before          { font-family: Mfizz; font-size: 14px; content: \"\\f15c\"; top: 1px; }\n.tt-icon:before           { font-family: Mfizz; font-size: 14px; content: \"TT\";    }\n.x11-icon:before          { font-family: Mfizz; font-size: 14px; content: \"\\f16e\"; top: 1px; font-size: 13px; }\n\n\n\n/*============================================================================*\n  Devicons\n  http://vorillaz.github.io/devicons\n/*============================================================================*/\n\n.angular-icon:before      { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e653\"; }\n.appcelerator-icon:before { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e6ab\"; }\n.appstore-icon:before     { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e613\"; }\n.asp-icon:before          { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e67f\"; }\n.atom-icon:before         { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e664\"; -webkit-font-smoothing: subpixel-antialiased; }\n.backbone-icon:before     { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e652\"; }\n.bootstrap-icon:before    { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e647\"; font-size: 15px; top: 2px; }\n.bower-icon:before        { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e64d\"; text-shadow: 0 0 0; }\n.chrome-icon:before       { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e643\"; }\n.clojure-icon:before      { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e668\"; -webkit-font-smoothing: subpixel-antialiased; }\n.compass-icon:before      { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e661\"; font-size: 14px; top: 2px; }\n.dart-icon:before         { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e698\"; font-size: 15px; top: 2px; }\n.dlang-icon:before        { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e6af\"; }\n.dojo-icon:before         { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e61c\"; font-size: 16px; top: 4px; transform: scale(1.2); -webkit-font-smoothing: subpixel-antialiased; }\n.dropbox-icon:before      { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e607\"; }\n.eclipse-icon:before      { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e69e\"; }\n.erlang-icon:before       { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e6b1\"; }\n.extjs-icon:before        { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e68e\"; }\n.fsharp-icon:before       { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e6a7\"; left: 1px; top: 2px; }\n.git-icon:before          { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e602\"; font-size: 15px; top: 2px; }\n.heroku-icon:before       { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e67b\"; }\n.jquery-icon:before       { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e650\"; font-size: 15px; top: 2px; }\n.jqueryui-icon:before     { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e654\"; font-size: 15px; top: 2px; }\n.laravel-icon:before      { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e63f\"; -webkit-font-smoothing: subpixel-antialiased; }\n.materialize-icon:before  { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e6b6\"; transform: scale(1.2); -webkit-font-smoothing: subpixel-antialiased; }\n.modernizr-icon:before    { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e620\"; }\n.mootools-icon:before     { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e68f\"; text-shadow: 0 0 0; }\n.node-icon:before         { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e618\"; }\n.pod-icon:before          { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e669\"; font-size: 15px; top: 2px; }\n.prolog-icon:before       { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e6a1\"; }\n.rails-icon:before        { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e63b\"; }\n.raphael-icon:before      { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e65f\"; font-size: 15px; }\n.requirejs-icon:before    { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e670\"; }\n.rust-icon:before         { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e6a8\"; }\n.sass-icon:before         { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e64b\"; }\n.sencha-icon:before       { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e68c\"; }\n.snapsvg-icon:before      { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e65e\"; }\n.swift-icon:before        { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e655\"; left: -1px; }\n.travis-icon:before       { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e67e\"; font-size: 15px; top: 2px; }\n.uikit-icon:before        { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e673\"; font-size: 15px; top: 2px; }\n.unity3d-icon:before      { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e621\"; }\n.vim-icon:before          { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e6c5\"; }\n.vs-icon:before           { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e60c\"; font-size: 14px; top: 2px; }\n.windows-icon:before      { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e60f\"; font-size: 14px; top: 2px; }\n.yeoman-icon:before       { font-family: Devicons; font-size: 16px; top: 3px; content: \"\\e67a\"; }\n\n\n\n\n/*============================================================================*\n  Custom file icons\n  See https://github.com/file-icons/source/#adding-new-icons\n/*============================================================================*/\n\n._1c-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\a5ea\"; top: 3px; font-size: 16px; }\n._1c-alt-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\ea28\"; top: 3px; font-size: 16px; }\n.abap-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e92b\"; top: 2px; }\n.access-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e9ea\"; top: 2px; }\n.ada-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e90b\"; top: 3px; font-size: 17px; }\n.ae-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e9f3\"; top: 2px; }\n.ahk-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e932\"; top: 2px; }\n.ai-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e6b4\"; top: 2px; }\n.alloy-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e935\"; top: 2px; }\n.alpine-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e9ff\"; top: 2px; font-size: 16px; }\n.ampl-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e94e\"; top: 3px; font-size: 16px; left: 1px; }\n.amx-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e99b\"; top: 3px; font-size: 16px; }\n.ant-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e93e\"; top: 4px; font-size: 18px; transform: scale(1.1); }\n.antlr-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e92c\"; top: 3px; }\n.api-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e92d\"; top: 2px; }\n.apl-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\234b\"; top: 2px; }\n.apple-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e925\"; top: 1px; }\n.appveyor-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e923\"; top: 2px; }\n.arc-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e92f\"; top: 2px; }\n.arduino-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e930\"; top: 3px; font-size: 16px; }\n.arttext-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\24d0\"; top: 2px; }\n.as-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e92e\"; top: 1px; font-size: 14px; }\n.asciidoc-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e918\"; top: 1px; font-size: 14px; }\n.ats-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e934\"; top: 2px; }\n.audacity-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e9f9\"; top: 2px; }\n.augeas-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e931\"; top: 2px; }\n.autoit-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e933\"; top: 2px; font-size: 16px; }\n.babel-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e91f\"; top: 2px; left: 1px; }\n.bibtex-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e601\"; top: 2px; font-size: 16px; -webkit-font-smoothing: subpixel-antialiased; }\n.blender-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e9fa\"; top: 2px; }\n.bluespec-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e93c\"; top: 1px; font-size: 13px; left: 1px; }\n.boo-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e939\"; top: 2px; }\n.boot-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\f103\"; top: 2px; font-size: 16px; }\n.brain-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e93a\"; top: 2px; }\n.brakeman-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e9d6\"; top: 2px; }\n.bro-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e93b\"; top: 3px; font-size: 16px; }\n.broccoli-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e922\"; top: 1px; font-size: 14px; }\n.byond-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e962\"; top: 2px; }\n.cabal-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9c2\"; top: 2px; }\n.cake-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9e3\"; top: 2px; }\n.cakefile-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e924\"; top: 2px; }\n.cakephp-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e9d3\"; top: 1px; font-size: 14px; }\n.cc-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e9d5\"; top: 2px; font-size: 16px; }\n.ceylon-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e94f\"; top: 2px; }\n.cf-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e929\"; top: 2px; }\n.chai-icon:before          { font-family: file-icons; font-size: 15px; content: \"c\";     top: 3px; font-size: 16px; }\n.chapel-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e950\"; top: 2px; }\n.chartjs-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\ea0b\"; top: 2px; }\n.chuck-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e943\"; top: 2px; }\n.circleci-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\ea12\"; top: 2px; font-size: 14px; }\n.cirru-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e951\"; top: 2px; text-shadow: 0 0 0; }\n.cl-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e972\"; top: 2px; text-shadow: 0 0 0; }\n.clarion-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e952\"; top: 1px; font-size: 14px; left: 1px; }\n.clean-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e95b\"; top: 2px; font-size: 16px; }\n.click-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e95c\"; top: 2px; }\n.clips-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e940\"; top: 3px; font-size: 18px; }\n.cljs-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\f104\"; top: 2px; }\n.cmake-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e93f\"; top: 1px; font-size: 14px; }\n.codecov-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\2602\"; top: 2px; }\n.composer-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e683\"; top: 3px; font-size: 17px; }\n.config-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\f07c\"; top: 2px; font-size: 14px; }\n.cordova-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\ea11\"; top: 2px; }\n.coq-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e95f\"; top: 2px; font-size: 16px; left: 1px; }\n.cp-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e942\"; top: 3px; font-size: 17px; }\n.creole-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e95e\"; top: 2px; }\n.crystal-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e902\"; top: 2px; left: 1px; }\n.csound-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e9f0\"; top: 2px; }\n.csscript-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e9e2\"; top: 2px; }\n.cucumber-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\f02b\"; top: 3px; }\n.cython-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e963\"; top: 2px; }\n.d3-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\ea10\"; top: 2px; }\n.darcs-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e964\"; top: 2px; }\n.dashboard-icon:before     { font-family: file-icons; font-size: 15px; content: \"\\f07d\"; top: 2px; font-size: 13px; }\n.dbase-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9f1\"; top: 2px; }\n.default-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\1f5cc\";top: 2px; font-size: 14px; }\n.diff-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e960\"; top: 2px; }\n.docker-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\f106\"; top: 3px; font-size: 18px; }\n.doxygen-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e928\"; top: 1px; font-size: 13px; }\n.doge-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e946\"; top: 2px; }\n.dyalog-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e90c\"; top: 1px; font-size: 14px; left: 1px; }\n.dylib-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\ea15\"; top: 2px; }\n.e-icon:before             { font-family: file-icons; font-size: 15px; content: \"E\";     top: 1px; font-size: 14px; }\n.eagle-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e965\"; top: 2px; }\n.ec-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e9c9\"; top: 2px; }\n.ecere-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e966\"; top: 3px; font-size: 16px; }\n.editorconfig-icon:before  { font-family: file-icons; font-size: 15px; content: \"\\ea1b\"; top: 3px; }\n.eiffel-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e967\"; top: 2px; font-size: 16px; }\n.electron-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\ea27\"; top: 3px; font-size: 16px; text-shadow: 0 0 0; }\n.elm-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\f102\"; top: 2px; }\n.em-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e968\"; top: 3px; font-size: 16px; }\n.ember-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e61b\"; top: 2px; font-size: 14px; }\n.emacs-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e926\"; top: 2px; }\n.eq-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\ea0a\"; top: 5px; }\n.eslint-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\ea0f\"; top: 3px; font-size: 16px; }\n.excel-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9ee\"; top: 2px; }\n.fabfile-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e94b\"; top: 2px; font-size: 16px; }\n.factor-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e96a\"; top: 3px; font-size: 18px; left: -2px; transform: scale(1.2); }\n.fancy-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e96b\"; top: 2px; font-size: 16px; }\n.fantom-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e96f\"; top: 2px; left: 1px; }\n.fbx-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e9fc\"; top: 2px; }\n.ff-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\fb00\"; top: 3px; }\n.finder-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e9e9\"; top: 3px; font-size: 16px; }\n.flow-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e921\"; top: 1px; }\n.flux-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e969\"; top: 2px; }\n.font-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e90f\"; top: 1px; font-size: 14px; left: 1px; }\n.fortran-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e90a\"; top: 1px; font-size: 14px; left: 1px; }\n.freemarker-icon:before    { font-family: file-icons; font-size: 15px; content: \"\\e970\"; top: 2px; font-size: 16px; left: 1px; }\n.frege-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e96e\"; top: 2px; font-size: 16px; left: 1px; }\n.fuelux-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\ea09\"; top: 3px; font-size: 16px; left: 2px; transform: scale(1.15); text-shadow: 0 0 0; }\n.gams-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e973\"; top: 2px; left: 1px; }\n.gap-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e971\"; top: 3px; font-size: 16px; left: 1px; }\n.gdb-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\ea08\"; top: 3px; font-size: 16px; transform: scale(1.15); text-shadow: 0 0 0; }\n.genshi-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e976\"; top: 3px; }\n.gentoo-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e96d\"; top: 1px; font-size: 14px; left: 1px; }\n.gf-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e978\"; top: 2px; }\n.glade-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e938\"; top: 2px; }\n.glyphs-icon:before        { font-family: file-icons; font-size: 15px; content: \"G\";     top: 3px; }\n.gml-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e975\"; top: 3px; font-size: 16px; }\n.gn-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\ea25\"; top: 2px; }\n.gnu-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e679\"; top: 2px; font-size: 16px; text-shadow: 0 0 0; }\n.go-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e624\"; top: 3px; }\n.godot-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e974\"; top: 2px; }\n.golo-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e979\"; top: 2px; }\n.gosu-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e97a\"; top: 2px; }\n.gradle-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e903\"; top: 3px; font-size: 16px; left: 1px; }\n.graphql-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e97c\"; top: 2px; }\n.graphviz-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e97d\"; top: 4px; font-size: 17px; left:  1px; }\n.groovy-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e904\"; top: 4px; font-size: 17px; left: -1px; }\n.grunt-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e611\"; top: 1px; font-size: 14px; }\n.gulp-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e610\"; top: 2px; font-size: 16px; }\n.hack-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9ce\"; top: 2px; }\n.haml-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\f15b\"; top: 2px; }\n.harbour-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e97b\"; top: 2px; font-size: 16px; text-shadow: 0 0 0; }\n.hashicorp-icon:before     { font-family: file-icons; font-size: 15px; content: \"\\e97e\"; top: 2px; }\n.haxe-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e907\"; top: 2px; }\n.hy-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e97f\"; top: 2px; }\n.idl-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e947\"; top: 3px; font-size: 18px; }\n.idris-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e983\"; top: 2px; font-size: 16px; -webkit-font-smoothing: subpixel-antialiased; }\n.igorpro-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e980\"; top: 2px; font-size: 16px; -webkit-font-smoothing: subpixel-antialiased; }\n.indesign-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e9f4\"; top: 2px; }\n.inform7-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e984\"; top: 2px; font-size: 16px; text-shadow: 0 0 0; }\n.inno-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e985\"; top: 2px; }\n.io-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e981\"; top: 1px; font-size: 13px; -webkit-font-smoothing: subpixel-antialiased; }\n.ioke-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e982\"; top: 2px; }\n.ionic-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\f14b\"; top: 2px; }\n.isabelle-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e945\"; top: 2px; font-size: 16px; }\n.j-icon:before             { font-family: file-icons; font-size: 15px; content: \"\\e937\"; top: 1px; font-size: 13px; }\n.jade-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e90d\"; top: 1px; font-size: 14px; }\n.jake-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e948\"; top: 3px; font-size: 16px; }\n.jenkins-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e667\"; top: 3px; font-size: 18px; text-shadow: 0 0 0; }\n.jinja-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e944\"; top: 2px; }\n.jsonld-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e958\"; top: 3px; font-size: 17px; }\n.jsx-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e9e6\"; top: 1px; font-size: 14px; }\n.julia-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\26ec\"; top: 1px; font-size: 14px; }\n.jupyter-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e987\"; top: 3px; font-size: 16px; }\n.karma-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9cd\"; top: 2px; }\n.keynote-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e9e5\"; top: 2px; }\n.khronos-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e9f8\"; top: 2px; }\n.kivy-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e901\"; top: 2px; }\n.knockout-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\4B\";   top: 2px; }\n.kotlin-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e989\"; top: 1px; font-size: 14px; }\n.krl-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e988\"; top: 1px; font-size: 14px; }\n.labview-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e98a\"; top: 2px; font-size: 16px; }\n.lasso-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e98c\"; top: 2px; left: 1px; }\n.leaflet-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\ea07\"; top: 2px; }\n.lean-icon:before          { font-family: file-icons; font-size: 15px; content: \"L\";     top: 1px; font-size: 13px; }\n.lein-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\f105\"; top: 3px; font-size: 16px; text-shadow: 0 0 0; transform: scale(1.15); }\n.lfe-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e94c\"; top: 2px; font-size: 16px; }\n.lightwave-icon:before     { font-family: file-icons; font-size: 15px; content: \"\\e9fb\"; top: 2px; }\n.lisp-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e908\"; top: 3px; font-size: 17px; }\n.llvm-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e91d\"; top: 3px; font-size: 17px; }\n.logtalk-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e98d\"; top: 2px; text-shadow: 0 0 0; }\n.lookml-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e98e\"; top: 2px; font-size: 16px; text-shadow: 0 0 0; }\n.ls-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e914\"; top: 2px; font-size: 14px; }\n.lsl-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e98b\"; top: 1px; }\n.lua-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e91b\"; top: 2px; font-size: 14px; }\n.mako-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e98f\"; top: 4px; font-size: 16px; }\n.mapbox-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e941\"; top: 1px; font-size: 13px; }\n.marko-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e920\"; top: 4px; font-size: 18px; left: -1px; transform: scale(1.05); }\n.mathematica-icon:before   { font-family: file-icons; font-size: 15px; content: \"\\e990\"; top: 2px; font-size: 16px; }\n.mathjax-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\ea06\"; top: 2px; }\n.matlab-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e991\"; top: 2px; }\n.max-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e993\"; top: 2px; }\n.maxscript-icon:before     { font-family: file-icons; font-size: 15px; content: \"\\e900\"; top: 2px; }\n.maya-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9f6\"; top: 2px; font-size: 16px; }\n.manpage-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e936\"; top: 3px; }\n.mediawiki-icon:before     { font-family: file-icons; font-size: 15px; content: \"\\e954\"; top: 2px; font-size: 16px; }\n.mercury-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e994\"; top: 3px; font-size: 16px; transform: scale(1.2); }\n.metal-icon:before         { font-family: file-icons; font-size: 15px; content: \"M\";     top: 1px; left: 1px; }\n.meteor-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e6a5\"; top: 1px; }\n.minecraft-icon:before     { font-family: file-icons; font-size: 15px; content: \"\\e9dc\"; top: 2px; }\n.mirah-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e995\"; top: 2px; }\n.mocha-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\26fe\"; top: 2px; font-size: 17px; }\n.model-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9e8\"; top: 2px; font-size: 16px; }\n.modula2-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e996\"; top: 2px; }\n.monkey-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e997\"; top: 3px; font-size: 18px; left: -1px; }\n.mruby-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\ea18\"; top: 2px; }\n.mupad-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9ca\"; top: 3px; font-size: 16px; }\n.mustache-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e60f\"; top: 2px; font-size: 16px; }\n.nant-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9e1\"; top: 3px; transform: scale(1.2); }\n.neko-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\ea05\"; top: 2px; }\n.netlogo-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e99c\"; top: 2px; left: 1px; }\n.newrelic-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e9d7\"; top: 2px; }\n.nginx-icon:before         { font-family: file-icons; font-size: 15px; content:\"\\f146b\"; top: 2px; }\n.nib-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\2712\"; top: 2px; }\n.nimrod-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e998\"; top: 2px; }\n.nit-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e999\"; top: 2px; }\n.nix-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e99a\"; top: 3px; font-size: 16px; }\n.nmap-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e94d\"; top: 3px; font-size: 16px; transform: scale(1.1); }\n.nodemon-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\ea26\"; top: 2px; }\n.normalize-icon:before     { font-family: file-icons; font-size: 15px; content: \"\\ea04\"; top: 3px; font-size: 16px; }\n.npm-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e91c\"; top: 3px; font-size: 17px; }\n.nsis-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\ea1e\"; top: 3px; font-size: 16px; }\n.numpy-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e99d\"; top: 2px; font-size: 14px; }\n.nuget-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9d9\"; top: 2px; }\n.nunjucks-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e953\"; top: 2px; font-size: 16px; }\n.nvidia-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e95d\"; top: 2px; }\n.objj-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e99e\"; top: 2px; }\n.ocaml-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e91a\"; top: 1px; font-size: 14px; }\n.onenote-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e9eb\"; top: 2px; }\n.ooc-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e9cb\"; top: 2px; }\n.opa-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\2601\"; top: 2px; }\n.opencl-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e99f\"; top: 2px; font-size: 16px; }\n.openoffice-icon:before    { font-family: file-icons; font-size: 15px; content: \"\\e9e4\"; top: 2px; }\n.org-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e917\"; top: 1px; font-size: 14px; left: 1px; }\n.owl-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e957\"; top: 2px; }\n.ox-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e9a1\"; top: 3px; font-size: 16px; text-shadow: 0 0 0; }\n.oxygene-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e9bf\"; top: 2px; }\n.oz-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e9be\"; top: 2px; }\n.pan-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e9bd\"; top: 2px; }\n.papyrus-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e9bc\"; top: 2px; }\n.parrot-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e9bb\"; top: 3px; font-size: 16px; }\n.pascal-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e92a\"; top: 2px; }\n.patch-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e961\"; top: 2px; }\n.pawn-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\265f\"; top: 1px; font-size: 14px; }\n.perl6-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e96c\"; top: 2px; }\n.phalcon-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e94a\"; top: 2px; }\n.php-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\f147\"; top: 1px; font-size: 14px; left: 1px; }\n.pickle-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e9c4\"; top: 2px; }\n.pike-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9b9\"; top: 4px; font-size: 16px; -webkit-font-smoothing: subpixel-antialiased; transform: scale(1.15); }\n.pogo-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9b8\"; top: 3px; font-size: 14px; -webkit-font-smoothing: subpixel-antialiased; }\n.pony-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9b7\"; top: 3px; font-size: 16px; }\n.pointwise-icon:before     { font-family: file-icons; font-size: 15px; content: \"\\e977\"; top: 2px; }\n.postcss-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e910\"; top: 2px; font-size: 14px; }\n.postscript-icon:before    { font-family: file-icons; font-size: 15px; content: \"\\e955\"; top: 2px; left: 1px; }\n.povray-icon:before        { font-family: file-icons; font-size: 15px; content: \"P\";     top: 2px; left: 1px; }\n.powerbuilder-icon:before  { font-family: file-icons; font-size: 15px; content: \"\\ea14\"; }\n.powerpoint-icon:before    { font-family: file-icons; font-size: 15px; content: \"\\e9ec\"; top: 2px; }\n.powershell-icon:before    { font-family: file-icons; font-size: 15px; content: \"\\e9da\"; top: 2px; font-size: 16px; }\n.premiere-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e9f5\"; top: 2px; }\n.processing-icon:before    { font-family: file-icons; font-size: 15px; content: \"\\e9a0\"; top: 2px; }\n.progress-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e9c0\"; top: 2px; font-size: 16px; transform: scale(1.2); }\n.propeller-icon:before     { font-family: file-icons; font-size: 15px; content: \"\\e9b5\"; top: 3px; font-size: 16px; }\n.protractor-icon:before    { font-family: file-icons; font-size: 15px; content: \"\\e9de\"; top: 3px; }\n.psd-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e6b8\"; top: 2px; }\n.pug-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\ea13\"; top: 3px; font-size: 16px; }\n.pug-alt-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e9d0\"; top: 3px; font-size: 16px; }\n.puppet-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\f0c3\"; top: 2px; left: 1px; }\n.purebasic-icon:before     { font-family: file-icons; font-size: 15px; content: \"\\01b5\"; top: 2px; }\n.purescript-icon:before    { font-family: file-icons; font-size: 15px; content: \"\\e9b2\"; top: 3px; }\n.r-icon:before             { font-family: file-icons; font-size: 15px; content: \"\\e905\"; top: 3px; font-size: 17px; }\n.racket-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e9b1\"; top: 2px; left: 1px; }\n.raml-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e913\"; top: 1px; font-size: 14px; }\n.rascal-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\ea24\"; top: 2px; }\n.rdoc-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9b0\"; top: 2px; left: 1px; }\n.react-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\f100\"; top: 2px; }\n.rebol-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9ae\"; top: 1px; font-size: 13px; }\n.reason-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\ea1d\"; top: 3px; }\n.red-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e9ad\"; top: 3px; font-size: 16px; }\n.regex-icon:before         { font-family: file-icons; font-size: 15px; content: \"*\";     top: 1px; font-size: 12px; left: 1px; }\n.rexx-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\ea16\"; top: 2px; font-size: 14px; left: 1px; }\n.riot-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e919\"; top: 4px; font-size: 18px; }\n.robot-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9ac\"; top: 2px; font-size: 14px; }\n.rollup-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\ea20\"; top: 2px; }\n.rst-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e9cc\"; top: 3px; font-size: 16px; }\n.sage-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9ab\"; top: 3px; font-size: 16px; -webkit-font-smoothing: subpixel-antialiased; }\n.saltstack-icon:before     { font-family: file-icons; font-size: 15px; content: \"\\e915\"; top: 2px; font-size: 14px; }\n.sas-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e95a\"; top: 2px; }\n.sbt-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e9d2\"; top: 2px; font-size: 14px; }\n.scd-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e9a2\"; top: 2px; }\n.scad-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e911\"; top: 2px; font-size: 14px; }\n.scheme-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\03bb\"; top: 2px; }\n.scilab-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e9a9\"; top: 3px; font-size: 18px; left: -1px; -webkit-font-smoothing: subpixel-antialiased; }\n.scrutinizer-icon:before   { font-family: file-icons; font-size: 15px; content: \"\\e9d4\"; top: 2px; font-size: 14px; }\n.self-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9a8\"; top: 3px; font-size: 16px; text-shadow: 0 0 0; transform: scale(1.2); }\n.sf-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\e9db\"; top: 2px; }\n.shen-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9a7\"; top: 2px; font-size: 16px; }\n.shopify-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e9cf\"; top: 2px; }\n.shuriken-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\272b\"; top: 2px; font-size: 14px; }\n.sigils-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\1f764\";top: 3px; font-size: 16px; text-shadow: 0 0 0; }\n.silverstripe-icon:before  { font-family: file-icons; font-size: 15px; content: \"\\e800\"; top: 2px; }\n.sketch-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e927\"; top: 2px; }\n.slash-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9a6\"; top: 2px; }\n.snyk-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\ea1c\"; top: 2px; font-size: 16px; }\n.sparql-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e959\"; top: 2px; }\n.sqf-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e9a5\"; top: 1px; text-shadow: 0 0 0; }\n.sqlite-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e9dd\"; top: 3px; }\n.stan-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9a4\"; top: 2px; }\n.stata-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9a3\"; top: 2px; }\n.storyist-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\e9ef\"; top: 2px; font-size: 16px; }\n.strings-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e9e0\"; top: 2px; }\n.stylelint-icon:before     { font-family: file-icons; font-size: 15px; content: \"\\e93d\"; top: 2px; }\n.stylus-icon:before        { font-family: file-icons; font-size: 15px; content: \"s\";     top: 2px; left: 1px; }\n.sublime-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e986\"; top: 2px; }\n.svn-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\ea17\"; top: 2px; }\n.sysverilog-icon:before    { font-family: file-icons; font-size: 15px; content: \"\\e9c3\"; top: 2px; }\n.tag-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\f015\"; top: 2px; font-size: 14px; }\n.tcl-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e956\"; top: 2px; font-size: 16px; }\n.terminal-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\f0c8\"; top: 2px; font-size: 14px; }\n.tern-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\1f54a\";top: 4px; font-size: 16px; }\n.terraform-icon:before     { font-family: file-icons; font-size: 15px; content: \"\\e916\"; top: 1px; font-size: 14px; }\n.tex-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e600\"; top: 4px; font-size: 16px; -webkit-font-smoothing: subpixel-antialiased; }\n.textile-icon:before       { font-family: file-icons; font-size: 15px; content: \"t\";     top: 2px; }\n.textmate-icon:before      { font-family: file-icons; font-size: 15px; content: \"\\2122\"; top: 2px; font-size: 16px; }\n.thor-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9d8\"; top: 2px; }\n.ts-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\2a6\";  top: 1px; font-size: 14px; }\n.tsx-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e9e7\"; top: 1px; font-size: 14px; }\n.turing-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e9b6\"; top: 2px; }\n.txl-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e9c1\"; top: 2px; }\n.typedoc-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e9fe\"; top: 2px; }\n.typings-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e9df\"; top: 2px; }\n.uno-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e9b3\"; top: 2px; }\n.unreal-icon:before        { font-family: file-icons; font-size: 15px; content: \"u\";     top: 2px; }\n.urweb-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9ba\"; top: 4px; font-size: 18px; left: -1px; text-shadow: 0 0 0; }\n.webpack-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e91e\"; top: 3px; }\n.wercker-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\ea19\"; top: 2px; }\n.word-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9ed\"; top: 2px; }\n.v8-icon:before            { font-family: file-icons; font-size: 15px; content: \"\\ea1f\"; top: 3px; font-size: 16px; }\n.vagrant-icon:before       { font-family: file-icons; font-size: 15px; content: \"V\";     top: 2px; font-size: 14px; }\n.varnish-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e9b4\"; top: 1px; font-size: 14px; }\n.verilog-icon:before       { font-family: file-icons; font-size: 15px; content: \"\\e949\"; top: 2px; }\n.vhdl-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9aa\"; top: 2px; }\n.video-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\f057\"; top: 1px; font-size: 14px; }\n.vue-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\e906\"; top: 3px; }\n.x10-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\2169\"; top: 2px; }\n.xmos-icon:before          { font-family: file-icons; font-size: 15px; content: \"X\";     top: 1px; font-size: 14px; }\n.xojo-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\e9af\"; top: 2px; }\n.xpages-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e9c5\"; top: 2px; }\n.xtend-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9c6\"; top: 2px; }\n.yang-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\262f\"; top: 2px; }\n.yarn-icon:before          { font-family: file-icons; font-size: 15px; content: \"\\ea1a\"; top: 2px; font-size: 16px; }\n.yui-icon:before           { font-family: file-icons; font-size: 15px; content: \"\\ea00\"; top: 2px; }\n.zbrush-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e9f2\"; top: 2px; font-size: 16px; }\n.zephir-icon:before        { font-family: file-icons; font-size: 15px; content: \"\\e9c7\"; top: 2px; -webkit-font-smoothing: subpixel-antialiased; }\n.zimpl-icon:before         { font-family: file-icons; font-size: 15px; content: \"\\e9c8\"; top: 2px; font-size: 16px; left: 1px; }\n";
styleInject(css_248z$1);

/**
 * ╭─╮ ┬ ┬   ╭─╮    ┬ ╭─╮ ╭─╮ ╭╮╭ ╭─╮
 * ├┤  │ │   ├┤     │ │   │ │ │││ ╰─╮
 * ┴   ┴ ┴─╯ ╰─╯    ┴ ╰─╯ ╰─╯ ╯╰╯ ╰─╯
 * File specific icons for the browser
 * from Atom File-icons, https://github.com/file-icons/atom
 *
 * @link      https://github.com/file-icons/atom
 * @author    Daniel Brooker, <dan@nocturnalcode.com>
 * @author    Adnan M.Sagar, <adnan@websemantics.ca>
 * @author    Jacob Hrbek, <kreyren@rixotstudio.cz>
 */


/* ---------------------------------------------------------------------------
 * Icons Database
 * ------------------------------------------------------------------------- */

const icondb = [
  [[["arttext-icon", ["dark-purple", "dark-purple"], /\.artx$/i],
  ["atom-icon", ["dark-green", "dark-green"], /^\.atom$/],
  ["bower-icon", ["medium-yellow", "medium-orange"], /^bower[-_]components$/],
  ["dropbox-icon", ["medium-blue", "medium-blue"], /^(?:Dropbox|\.dropbox\.cache)$/],
  ["emacs-icon", ["medium-purple", "medium-purple"], /^\.emacs\.d$/],
  ["dylib-icon", [null, null], /\.framework$/i],
  ["git-icon", ["medium-red", "medium-red"], /\.git$/],
  ["github-icon", [null, null], /^\.github$/],
  ["meteor-icon", ["dark-orange", "dark-orange"], /^\.meteor$/],
  ["node-icon", ["medium-green", "medium-green"], /^node_modules$/],
  ["package-icon", [null, null], /^\.bundle$/i],
  ["svn-icon", [null, null], /^\.svn$/i],
  ["textmate-icon", [null, null], /\.tmBundle$/i],
  ["vagrant-icon", ["medium-cyan", "medium-cyan"], /\.vagrant$/i],
  ["appstore-icon", [null, null], /\.xcodeproj$/i]],
  [[], [], [], [], []]],
  [[["binary-icon", ["dark-green", "dark-green"], /\.swp$/i, 4],
  ["link-icon", ["medium-blue", "medium-blue"], /\.lnk$/i, 3],
  ["angular-icon", ["medium-red", "medium-red"], /^angular[^.]*\.js$/i, 2],
  ["ant-icon", ["dark-pink", "dark-pink"], /^ant\.xml$|\.ant$/i, 2],
  ["apache-icon", ["medium-red", "medium-red"], /^(?:apache2?|httpd).conf$/i, 2],
  ["apache-icon", ["dark-green", "dark-green"], /\.vhost$/i, 2],
  ["apache-icon", ["medium-green", "medium-green"], /\.thrift$/i, 2],
  ["appcelerator-icon", ["medium-red", "medium-red"], /^appcelerator\.js$/i, 2],
  ["appveyor-icon", ["medium-blue", "medium-blue"], /^appveyor\.yml$/i, 2],
  ["archlinux-icon", ["dark-purple", "dark-purple"], /^\.install$/, 2],
  ["archlinux-icon", ["dark-maroon", "dark-maroon"], /^\.SRCINFO$/, 2],
  ["archlinux-icon", ["dark-yellow", "dark-yellow"], /^pacman\.conf$/, 2],
  ["archlinux-icon", ["light-yellow", "light-yellow"], /^pamac\.conf$/, 2],
  ["archlinux-icon", ["dark-cyan", "dark-cyan"], /^PKGBUILD$/, 2],
  ["archlinux-icon", ["light-yellow", "light-yellow"], /yaourtrc$/i, 2],
  ["backbone-icon", ["dark-blue", "dark-blue"], /^backbone(?:[-.]min|dev)?\.js$/i, 2],
  ["boot-icon", ["medium-green", "dark-green"], /^Makefile\.boot$/i, 2],
  ["bootstrap-icon", ["medium-yellow", "dark-yellow"], /^(?:custom\.)?bootstrap\S*\.js$/i, 2],
  ["bootstrap-icon", ["medium-blue", "medium-blue"], /^(?:custom\.)?bootstrap\S*\.css$/i, 2],
  ["bootstrap-icon", ["dark-blue", "dark-blue"], /^(?:custom\.)?bootstrap\S*\.less$/i, 2],
  ["bootstrap-icon", ["light-pink", "light-pink"], /^(?:custom\.)?bootstrap\S*\.scss$/i, 2],
  ["bootstrap-icon", ["medium-green", "medium-green"], /^(?:custom\.)?bootstrap\S*\.styl$/i, 2],
  ["bower-icon", ["medium-yellow", "medium-orange"], /^(?:\.bowerrc|bower\.json|Bowerfile)$/i, 2],
  ["brakeman-icon", ["medium-red", "medium-red"], /brakeman\.yml$/i, 2],
  ["brakeman-icon", ["dark-red", "dark-red"], /^brakeman\.ignore$/i, 2],
  ["broccoli-icon", ["medium-green", "medium-green"], /^Brocfile\./i, 2],
  ["package-icon", ["light-orange", "light-orange"], /Cargo\.toml$/i, 2],
  ["package-icon", ["dark-orange", "dark-orange"], /Cargo\.lock$/i, 2],
  ["chai-icon", ["medium-red", "dark-red"], /^chai\.(?:[jt]sx?|es6?|coffee)$/i, 2],
  ["chartjs-icon", ["dark-pink", "dark-pink"], /^Chart\.js$/i, 2],
  ["circleci-icon", ["medium-green", "medium-green"], /^circle\.yml$/i, 2],
  ["cc-icon", ["medium-green", "medium-green"], /\.codeclimate\.yml$/i, 2],
  ["codecov-icon", ["dark-pink", "dark-pink"], /^codecov\.ya?ml$/i, 2],
  ["coffee-icon", ["medium-cyan", "medium-cyan"], /\.coffee\.ecr$/i, 2],
  ["coffee-icon", ["medium-red", "medium-red"], /\.coffee\.erb$/i, 2],
  ["compass-icon", ["medium-red", "medium-red"], /^_?(?:compass|lemonade)\.scss$/i, 2],
  ["composer-icon", ["medium-yellow", "medium-yellow"], /^composer\.(?:json|lock)$/i, 2],
  ["composer-icon", ["dark-blue", "dark-blue"], /^composer\.phar$/i, 2],
  ["cordova-icon", ["light-blue", "light-blue"], /^cordova(?:[^.]*\.|-(?:\d\.)+)js$/i, 2],
  ["d3-icon", ["medium-orange", "medium-orange"], /^d3(?:\.v\d+)?[^.]*\.js$/i, 2],
  ["database-icon", ["medium-red", "medium-red"], /^METADATA\.pb$/, 2],
  ["database-icon", ["medium-red", "medium-red"], /\.git[\/\\](?:.*[\/\\])?(?:HEAD|ORIG_HEAD|packed-refs|logs[\/\\](?:.+[\/\\])?[^\/\\]+)$/, 2, true],
  ["docker-icon", ["dark-blue", "dark-blue"], /^(?:Dockerfile(\.\w+$|)|docker-compose)|\.docker(?:file|ignore)$/i, 2, false, , /\.dockerfile$/i, /^Docker$/i],
  ["docker-icon", ["dark-orange", "dark-orange"], /^docker-sync\.yml$/i, 2],
  ["dojo-icon", ["light-red", "light-red"], /^dojo\.js$/i, 2],
  ["ember-icon", ["medium-red", "medium-red"], /^ember(?:\.|(?:-[^.]+)?-(?:\d+\.)+(?:debug\.)?)js$/i, 2],
  ["eslint-icon", ["medium-purple", "medium-purple"], /\.eslint(?:cache|ignore)$/i, 2],
  ["eslint-icon", ["light-purple", "light-purple"], /\.eslintrc(?:\.(?:js|json|ya?ml))?$/i, 2],
  ["extjs-icon", ["light-green", "light-green"], /\bExtjs(?:-ext)?\.js$/i, 2],
  ["fabfile-icon", ["medium-blue", "medium-blue"], /^fabfile\.py$/i, 2],
  ["fuelux-icon", ["medium-orange", "dark-orange"], /^fuelux(?:\.min)?\.(?:css|js)$/i, 2],
  ["gear-icon", ["medium-blue", "medium-blue"], /\.indent\.pro$/i, 2],
  ["grunt-icon", ["medium-yellow", "medium-yellow"], /gruntfile\.js$/i, 2],
  ["grunt-icon", ["medium-maroon", "medium-maroon"], /gruntfile\.coffee$/i, 2],
  ["gulp-icon", ["medium-red", "medium-red"], /gulpfile\.((babel\.)?js|ts)$/i, 2],
  ["gulp-icon", ["medium-maroon", "medium-maroon"], /gulpfile\.coffee$/i, 2],
  ["html5-icon", ["medium-cyan", "medium-cyan"], /\.html?\.ecr$/i, 2],
  ["html5-icon", ["medium-red", "medium-red"], /\.(?:html?\.erb|rhtml)$/i, 2, false, , /\.html\.erb$/i, /^HTML$/i],
  ["ionic-icon", ["medium-blue", "medium-blue"], /^ionic\.project$/, 2],
  ["js-icon", ["medium-cyan", "medium-cyan"], /\.js\.ecr$/i, 2],
  ["js-icon", ["medium-red", "medium-red"], /\.js\.erb$/i, 2],
  ["jquery-icon", ["dark-blue", "dark-blue"], /^jquery(?:[-.](?:min|latest|\d\.\d+(?:\.\d+)?))*\.(?:[jt]sx?|es6?|coffee|map)$/i, 2],
  ["jqueryui-icon", ["dark-blue", "dark-blue"], /^jquery(?:[-_.](?:ui[-_.](?:custom|dialog-?\w*)|effects)(?:\.[^.]*)?|[-.]?ui(?:-\d\.\d+(?:\.\d+)?)?(?:\.\w+)?)(?:[-_.]?min|dev)?\.(?:[jt]sx?|es6?|coffee|map|s?css|less|styl)$/i, 2],
  ["karma-icon", ["medium-cyan", "medium-cyan"], /^karma\.conf\.js$/i, 2],
  ["karma-icon", ["medium-maroon", "medium-maroon"], /^karma\.conf\.coffee$/i, 2],
  ["knockout-icon", ["medium-red", "medium-red"], /^knockout[-.](?:\d+\.){3}(?:debug\.)?js$/i, 2],
  ["leaflet-icon", ["medium-green", "medium-green"], /^leaflet\.(?:draw-src|draw|spin|coordinates-(?:\d+\.)\d+\.\d+\.src)\.(?:js|css)$|^wicket-leaflet\.js$/i, 2],
  ["lein-icon", [null, null], /project\.clj$/i, 2],
  ["manpage-icon", ["dark-green", "dark-green"], /^tmac\.|^(?:mmn|mmt)$/i, 2],
  ["marko-icon", ["medium-blue", "medium-blue"], /\.marko$/i, 2, false, /^marko$/, /\.marko$/i, /^mark[0o]$/i],
  ["marko-icon", ["medium-maroon", "medium-maroon"], /\.marko\.js$/i, 2],
  ["materialize-icon", ["light-red", "light-red"], /^materialize(?:\.min)?\.(?:js|css)$/i, 2],
  ["mathjax-icon", ["dark-green", "dark-green"], /^MathJax[^.]*\.js$/i, 2],
  ["mocha-icon", ["medium-maroon", "medium-maroon"], /^mocha\.(?:[jt]sx?|es6?|coffee)$/i, 2],
  ["mocha-icon", ["medium-red", "medium-red"], /^mocha\.(?:s?css|less|styl)$/i, 2],
  ["mocha-icon", ["light-maroon", "light-maroon"], /mocha\.opts$/i, 2],
  ["modernizr-icon", ["medium-red", "medium-red"], /^modernizr(?:[-\.]custom|-\d\.\d+)(?:\.\d+)?\.js$/i, 2],
  ["mootools-icon", ["medium-purple", "medium-purple"], /^mootools[^.]*\d+\.\d+(?:.\d+)?[^.]*\.js$/i, 2],
  ["neko-icon", ["dark-orange", "dark-orange"], /^run\.n$/, 2],
  ["newrelic-icon", ["medium-cyan", "medium-cyan"], /^newrelic\.yml/i, 2],
  ["nginx-icon", ["dark-green", "dark-green"], /^nginx\.conf$/i, 2],
  ["shuriken-icon", ["dark-cyan", "dark-cyan"], /\.ninja\.d$/i, 2],
  ["nodemon-icon", ["medium-green", "medium-green"], /^nodemon\.json$|^\.nodemonignore$/i, 2],
  ["normalize-icon", ["medium-red", "medium-red"], /^normalize\.(?:css|less|scss|styl)$/i, 2],
  ["npm-icon", ["medium-red", "medium-red"], /^(?:package\.json|\.npmignore|\.?npmrc|npm-debug\.log|npm-shrinkwrap\.json)$/i, 2],
  ["postcss-icon", ["medium-yellow", "dark-yellow"], /\bpostcss\.config\.js$/i, 2],
  ["protractor-icon", ["medium-red", "medium-red"], /^protractor\.conf\./i, 2],
  ["pug-icon", ["medium-orange", "medium-orange"], /^\.pug-lintrc/i, 2],
  ["raphael-icon", ["medium-orange", "medium-orange"], /^raphael(?:\.min|\.no-deps)*\.js$/i, 2],
  ["react-icon", ["dark-blue", "dark-blue"], /^react(?:-[^.]*)?\.js$/i, 2],
  ["react-icon", ["medium-blue", "dark-blue"], /\.react\.js$/i, 2],
  ["book-icon", ["medium-blue", "medium-blue"], /^README(?:\b|_)|^(?:licen[sc]es?|(?:read|readme|click|delete|keep|test)\.me)$|\.(?:readme|1st)$/i, 2],
  ["book-icon", ["dark-blue", "dark-blue"], /^(?:notice|bugs|changes|change[-_]?log(?:[-._]?\d+)?|contribute|contributing|contributors|copying|hacking|history|install|maintainers|manifest|more\.stuff|projects|revision|terms|thanks)$/i, 2],
  ["requirejs-icon", ["medium-blue", "medium-blue"], /^require(?:[-.]min|dev)?\.js$/i, 2],
  ["clojure-icon", ["medium-maroon", "dark-maroon"], /^riemann\.config$/i, 2],
  ["rollup-icon", ["medium-red", "medium-red"], /^rollup\.config\./i, 2],
  ["ruby-icon", ["light-green", "light-green"], /_spec\.rb$/i, 2],
  ["scrutinizer-icon", ["dark-blue", "dark-blue"], /\.scrutinizer\.yml$/i, 2],
  ["sencha-icon", ["light-green", "light-green"], /^sencha(?:\.min)?\.js$/i, 2],
  ["snapsvg-icon", ["medium-cyan", "medium-cyan"], /^snap\.svg(?:[-.]min)?\.js$/i, 2],
  ["sourcemap-icon", ["medium-blue", "medium-blue"], /\.css\.map$/i, 2],
  ["sourcemap-icon", ["medium-yellow", "dark-yellow"], /\.js\.map$/i, 2],
  ["stylelint-icon", ["medium-purple", "medium-purple"], /^\.stylelintrc(?:\.|$)/i, 2],
  ["stylelint-icon", ["medium-yellow", "dark-yellow"], /^stylelint\.config\.js$/i, 2],
  ["stylelint-icon", ["dark-blue", "dark-blue"], /\.stylelintignore$/i, 2],
  ["toc-icon", ["medium-cyan", "dark-cyan"], /\.toc$/i, 2, false, , /\.toc$/i, /^Table of Contents$/i],
  ["calc-icon", ["medium-maroon", "medium-maroon"], /\.8x[pk](?:\.txt)?$/i, 2, false, , , , /^\*\*TI[789]\d\*\*/],
  ["travis-icon", ["medium-red", "medium-red"], /^\.travis/i, 2],
  ["typedoc-icon", ["dark-purple", "dark-purple"], /^typedoc\.json$/i, 2],
  ["typings-icon", ["medium-maroon", "medium-maroon"], /^typings\.json$/i, 2],
  ["uikit-icon", ["medium-blue", "medium-blue"], /^uikit(?:\.min)?\.js$/i, 2],
  ["webpack-icon", ["medium-blue", "medium-blue"], /webpack\.config\.|^webpackfile\.js$/i, 2],
  ["wercker-icon", ["medium-purple", "medium-purple"], /^wercker\.ya?ml$/i, 2],
  ["yarn-icon", ["medium-blue", "medium-blue"], /^yarn\.lock$/i, 2],
  ["yeoman-icon", ["medium-cyan", "medium-cyan"], /\.yo-rc\.json$/i, 2],
  ["yui-icon", ["dark-blue", "dark-blue"], /^(?:yahoo-|yui)[^.]*\.js$/i, 2],
  ["emacs-icon", ["medium-red", "medium-red"], /\.gnus$/i, 1.5],
  ["emacs-icon", ["dark-green", "dark-green"], /\.viper$/i, 1.5],
  ["emacs-icon", ["dark-blue", "dark-blue"], /^Cask$/, 1.5],
  ["emacs-icon", ["medium-blue", "medium-blue"], /^Project\.ede$/i, 1.5],
  ["_1c-icon", ["medium-red", "medium-red"], /\.bsl$/i, , false, , /\.bsl$/i, /^1C$|^1[\W_ \t]?C[\W_ \t]?Enterprise$/i],
  ["_1c-icon", ["dark-orange", "dark-orange"], /\.sdbl$/i, , false, , /\.sdbl$/i, /^1C$|^1[\W_ \t]?C[\W_ \t]?Query$/i],
  ["_1c-icon", ["dark-red", "dark-red"], /\.os$/i],
  ["_1c-alt-icon", ["medium-red", "dark-red"], /\.mdo$/i],
  ["abap-icon", ["medium-orange", "medium-orange"], /\.abap$/i, , false, , /\.abp$/i, /^ABAP$/i],
  ["as-icon", ["medium-blue", "medium-blue"], /\.swf$/i],
  ["as-icon", ["medium-red", "medium-red"], /\.as$/i, , false, , /\.(?:flex-config|actionscript(?:\.\d+)?)$/i, /^ActionScript$|^(?:ActionScript\s*3|as3)$/i],
  ["as-icon", ["medium-yellow", "dark-yellow"], /\.jsfl$/i],
  ["as-icon", ["dark-red", "dark-red"], /\.swc$/i],
  ["ada-icon", ["medium-blue", "medium-blue"], /\.(?:ada|adb|ads)$/i, , false, , /\.ada$/i, /^Ada$|^(?:ada95|ada2005)$/i],
  ["ae-icon", ["dark-pink", "dark-pink"], /\.aep$/i],
  ["ae-icon", ["dark-purple", "dark-purple"], /\.aet$/i],
  ["ai-icon", ["medium-orange", "medium-orange"], /\.ai$/i],
  ["ai-icon", ["dark-orange", "dark-orange"], /\.ait$/i],
  ["indesign-icon", ["dark-pink", "dark-pink"], /\.indd$|\.idml$/i],
  ["indesign-icon", ["medium-purple", "medium-purple"], /\.indl$/i],
  ["indesign-icon", ["dark-purple", "dark-purple"], /\.indt$|\.inx$/i],
  ["indesign-icon", ["dark-blue", "dark-blue"], /\.indb$/i],
  ["psd-icon", ["medium-blue", "medium-blue"], /\.psd$/i, , false, , , , /^8BPS/],
  ["psd-icon", ["dark-purple", "dark-purple"], /\.psb$/i],
  ["premiere-icon", ["dark-purple", "dark-purple"], /\.prproj$/i],
  ["premiere-icon", ["medium-maroon", "medium-maroon"], /\.prel$/i],
  ["premiere-icon", ["medium-purple", "medium-purple"], /\.psq$/i],
  ["alloy-icon", ["medium-red", "medium-red"], /\.als$/i, , false, , /\.alloy$/i, /^Alloy$/i],
  ["alpine-icon", ["dark-blue", "dark-blue"], /(?:\.|^)APKBUILD$/],
  ["ampl-icon", ["dark-maroon", "dark-maroon"], /\.ampl$/i, , false, , /\.ampl$/i, /^AMPL$/i],
  ["sun-icon", ["medium-yellow", "dark-yellow"], /\.ansiweatherrc$/i],
  ["antlr-icon", ["medium-red", "medium-red"], /\.g$/i, , false, /^antlr$/, /\.antlr$/i, /^antlr$/i],
  ["antlr-icon", ["medium-orange", "medium-orange"], /\.g4$/i],
  ["apache-icon", ["dark-red", "dark-red"], /\.apacheconf$/i, , false, , /\.apache-config$/i, /^Apache$|^(?:aconf|ApacheConf)$/i],
  ["apache-icon", ["medium-purple", "medium-purple"], /apache2[\\\/]magic$/i, , true],
  ["api-icon", ["medium-blue", "medium-blue"], /\.apib$/i, , false, , /\.apib$/i, /^API Blueprint$/i],
  ["apl-icon", ["dark-cyan", "dark-cyan"], /\.apl$/i, , false, /^apl$/, /\.apl$/i, /^apl$/i],
  ["apl-icon", ["medium-maroon", "medium-maroon"], /\.apl\.history$/i],
  ["apple-icon", ["medium-purple", "medium-purple"], /\.(?:applescript|scpt)$/i, , false, /^osascript$/, /\.applescript$/i, /^Apple$|^[0o]sascript$/i],
  ["arc-icon", ["medium-blue", "medium-blue"], /\.arc$/i],
  ["arduino-icon", ["dark-cyan", "dark-cyan"], /\.ino$/i, , false, , /\.arduino$/i, /^Arduino$/i],
  ["asciidoc-icon", ["medium-blue", "medium-blue"], /\.(?:ad|adoc|asc|asciidoc)$/i, , false, , /\.asciidoc$/i, /^AsciiDoc$/i],
  ["asp-icon", ["dark-blue", "dark-blue"], /\.asp$/i, , false, , /\.asp$/i, /^[Aa][Ss][Pp][\W_ \t]?[Nn][Ee][Tt]$|^aspx(?:-vb)?$/],
  ["asp-icon", ["medium-maroon", "medium-maroon"], /\.asax$/i],
  ["asp-icon", ["dark-green", "dark-green"], /\.ascx$/i],
  ["asp-icon", ["medium-green", "medium-green"], /\.ashx$/i],
  ["asp-icon", ["dark-cyan", "dark-cyan"], /\.asmx$/i],
  ["asp-icon", ["medium-purple", "medium-purple"], /\.aspx$/i],
  ["asp-icon", ["medium-cyan", "medium-cyan"], /\.axd$/i],
  ["eclipse-icon", ["medium-maroon", "medium-maroon"], /\.aj$/i],
  ["binary-icon", ["medium-red", "medium-red"], /\.(?:l?a|[ls]?o|out|s|a51|n?asm|axf|elf|prx|puff|was[mt]|z80)$|\.rpy[bc]$/i, , false, , /(?:^|\.)(?:a[rs]m|x86|z80|lc-?3|cpu12|x86asm|m68k|assembly|avr(?:dis)?asm|dasm)(?:\.|$)/i, /^Assembly$|^n?asm$/i],
  ["binary-icon", ["dark-blue", "dark-blue"], /\.agc$|\.d-objdump$/i, , false, , /\.source\.agc$/i, /^Assembly$|^(?:Virtual\s*)?AGC$|^Apollo(?:[-_\s]*11)?\s*Guidance\s*Computer$/i],
  ["binary-icon", ["dark-green", "dark-green"], /\.ko$/i],
  ["binary-icon", ["medium-blue", "medium-blue"], /\.lst$/i, , false, /^lst-cpu12$/, /\.lst-cpu12$/i, /^Assembly$|^lst[\W_ \t]?cpu12$/i],
  ["binary-icon", ["dark-orange", "dark-orange"], /\.(?:(?:c(?:[+px]{2}?)?-?)?objdump|bsdiff|bin|dat|pak|pdb)$/i],
  ["binary-icon", ["medium-orange", "medium-orange"], /\.gcode|\.gco/i],
  ["binary-icon", ["dark-purple", "dark-purple"], /\.py[co]$/i],
  ["binary-icon", [null, null], /\.DS_Store$/i],
  ["ats-icon", ["medium-red", "medium-red"], /\.dats$/i, , false, , /\.ats$/i, /^ATS$|^ats2$/i],
  ["ats-icon", ["medium-blue", "medium-blue"], /\.hats$/i],
  ["ats-icon", ["dark-yellow", "dark-yellow"], /\.sats$/i],
  ["audacity-icon", ["medium-yellow", "medium-yellow"], /\.aup$/i],
  ["audio-icon", ["medium-red", "medium-red"], /\.mp3$/i, , false, , , , /^\xFF\xFB|^ID3/],
  ["audio-icon", ["dark-yellow", "dark-yellow"], /\.wav$/i, , false, , , , /^RIFF(?!.+WEBP)/],
  ["audio-icon", ["dark-cyan", "dark-cyan"], /\.(?:aac|ac3|m4p)$/i, , false, , , , /^\x0Bw/],
  ["audio-icon", ["medium-purple", "medium-purple"], /\.aif[fc]?$/i, , false, , , , /^FORM.{4}AIFF/],
  ["audio-icon", ["medium-cyan", "medium-cyan"], /\.au$/i, , false, , , , /^\.snd|^dns\./],
  ["audio-icon", ["dark-red", "dark-red"], /\.flac$/i, , false, , , , /^fLaC/],
  ["audio-icon", ["medium-red", "medium-red"], /\.f4[ab]$/i, , false, , , , /^FLV\x01\x04/],
  ["audio-icon", ["medium-cyan", "medium-cyan"], /\.m4a$/i, , false, , , , /^.{4}ftypM4A/],
  ["audio-icon", ["dark-green", "dark-green"], /\.(?:mpc|mp\+)$/i, , false, , , , /^MPCK/],
  ["audio-icon", ["dark-orange", "dark-orange"], /\.oga$/i],
  ["audio-icon", ["dark-maroon", "dark-maroon"], /\.opus$/i, , false, , , , /OpusHead/],
  ["audio-icon", ["dark-blue", "dark-blue"], /\.r[am]$/i, , false, , , , /^\.RMF/],
  ["audio-icon", ["medium-blue", "medium-blue"], /\.wma$/i],
  ["augeas-icon", ["dark-orange", "dark-orange"], /\.aug$/i],
  ["ahk-icon", ["dark-blue", "dark-blue"], /\.ahk$/i, , false, /^ahk$/, /\.ahk$/i, /^AutoHotkey$|^ahk$/i],
  ["ahk-icon", ["dark-purple", "dark-purple"], /\.ahkl$/i],
  ["autoit-icon", ["medium-purple", "medium-purple"], /\.au3$/i, , false, , /(?:^|\.)autoit(?:\.|$)/i, /^AutoIt$|^(?:AutoIt3|AutoItScript|au3)$/i],
  ["terminal-icon", ["medium-blue", "medium-blue"], /\.awk$/i, , false, /^awk$/, /\.awk$/i, /^awk$/i],
  ["terminal-icon", ["medium-red", "medium-red"], /\.gawk$/i, , false, /^gawk$/, /\.gawk$/i, /^AWK$|^gawk$/i],
  ["terminal-icon", ["medium-maroon", "medium-maroon"], /\.mawk$/i, , false, /^mawk$/, /\.mawk$/i, /^AWK$|^mawk$/i],
  ["terminal-icon", ["dark-green", "dark-green"], /\.nawk$/i, , false, /^nawk$/, /\.nawk$/i, /^AWK$|^nawk$/i],
  ["terminal-icon", ["dark-cyan", "dark-cyan"], /\.auk$/i],
  ["babel-icon", ["medium-yellow", "medium-yellow"], /\.(?:babelrc|languagebabel|babel)$/i],
  ["babel-icon", ["dark-yellow", "dark-yellow"], /\.babelignore$/i],
  ["bibtex-icon", ["medium-red", "dark-red"], /\.cbx$/i],
  ["bibtex-icon", ["medium-orange", "dark-orange"], /\.bbx$/i],
  ["bibtex-icon", ["medium-yellow", "dark-yellow"], /\.bib$/i, , false, /^bibtex$/, /\.bibtex$/i, /^bibtex$/i],
  ["bibtex-icon", ["medium-green", "dark-green"], /\.bst$/i],
  ["gnu-icon", ["medium-red", "medium-red"], /\.bison$/i, , false, , /\.bison$/i, /^Bison$/i],
  ["blender-icon", ["medium-orange", "medium-orange"], /\.blend$/i],
  ["blender-icon", ["dark-orange", "dark-orange"], /\.blend\d+$/i],
  ["blender-icon", ["dark-blue", "dark-blue"], /\.bphys$/i],
  ["bluespec-icon", ["dark-blue", "dark-blue"], /\.bsv$/i, , false, , /\.bsv$/i, /^Bluespec$/i],
  ["boo-icon", ["medium-green", "medium-green"], /\.boo$/i, , false, , /\.boo(?:\.unity)?$/i, /^Boo$/i],
  ["boot-icon", [null, null], /\.boot$/i],
  ["brain-icon", ["dark-pink", "dark-pink"], /\.bf?$/i, , false, , /\.(?:bf|brainfuck)$/i, /^Brainfuck$|^(?:bf|Brainf\**ck)$/i],
  ["brew-icon", ["medium-orange", "medium-orange"], /^Brewfile$/],
  ["bro-icon", ["dark-cyan", "dark-cyan"], /\.bro$/i, , false, , /\.bro$/i, /^Bro$/i],
  ["byond-icon", ["medium-blue", "medium-blue"], /\.dm$/i, , false, , /\.dm$/i, /^BYOND$|^(?:DM|Dream\s*Maker(?:\s*Script)?)$/i],
  ["c-icon", ["medium-blue", "medium-blue"], /\.c$/i, , false, /^tcc$/, /\.c$/i, /^C$/i],
  ["c-icon", ["medium-purple", "medium-purple"], /\.h$|\.cats$/i],
  ["c-icon", ["medium-green", "medium-green"], /\.idc$/i],
  ["c-icon", ["medium-maroon", "medium-maroon"], /\.w$/i],
  ["c-icon", ["dark-blue", "dark-blue"], /\.nc$/i],
  ["c-icon", ["medium-cyan", "medium-cyan"], /\.upc$/i],
  ["csharp-icon", ["medium-blue", "dark-blue"], /\.cs$/i, , false, , /\.cs$/i, /^C#$|^c\s*sharp$/i],
  ["csscript-icon", ["dark-green", "dark-green"], /\.csx$/i, , false, , /\.csx$/i, /^C#-Script$/i],
  ["cpp-icon", ["medium-blue", "dark-blue"], /\.c[+px]{2}$|\.cc$/i, , false, , /\.cpp$/i, /^C\+\+$|c[-_]?pp|cplusplus/i],
  ["cpp-icon", ["medium-purple", "dark-purple"], /\.h[+px]{2}$/i],
  ["cpp-icon", ["medium-orange", "dark-orange"], /\.[it]pp$/i],
  ["cpp-icon", ["medium-red", "dark-red"], /\.(?:tcc|inl)$/i],
  ["cabal-icon", ["medium-cyan", "medium-cyan"], /\.cabal$/i, , false, , /\.cabal$/i, /^Cabal$/i],
  ["cake-icon", ["medium-yellow", "medium-yellow"], /\.cake$/i, , false, , /\.cake$/i, /^Cake$/i],
  ["cakefile-icon", ["medium-red", "medium-red"], /^Cakefile$/],
  ["cakephp-icon", ["medium-red", "medium-red"], /\.ctp$/i],
  ["ceylon-icon", ["medium-orange", "medium-orange"], /\.ceylon$/i],
  ["chapel-icon", ["medium-green", "medium-green"], /\.chpl$/i, , false, , /\.chapel$/i, /^Chapel$|^chpl$/i],
  ["chrome-icon", ["medium-red", "medium-red"], /\.crx$/i, , false, , , , /^Cr24/],
  ["chuck-icon", ["medium-green", "medium-green"], /\.ck$/i, , false, , /\.chuck$/i, /^ChucK$/i],
  ["cirru-icon", ["medium-pink", "dark-pink"], /\.cirru$/i, , false, , /\.cirru$/i, /^Cirru$/i],
  ["clarion-icon", ["medium-orange", "medium-orange"], /\.clw$/i, , false, , /\.clarion$/i, /^Clarion$/i],
  ["clean-icon", ["dark-cyan", "dark-cyan"], /\.icl$/i, , false, /^clean$/, /\.clean$/i, /^clean$/i],
  ["clean-icon", ["medium-cyan", "medium-cyan"], /\.dcl$/i],
  ["clean-icon", ["medium-blue", "medium-blue"], /\.abc$/i],
  ["click-icon", ["medium-yellow", "medium-yellow"], /\.click$/i, , false, , /\.click$/i, /^Click$|^Click!$/i],
  ["clips-icon", ["dark-green", "dark-green"], /\.clp$/i, , false, , /\.clips$/i, /^CLIPS$/i],
  ["clojure-icon", ["medium-blue", "dark-blue"], /\.clj$/i, , false, /^clojure$/, /\.clojure$/i, /^cl[0o]jure$/i],
  ["clojure-icon", ["medium-purple", "dark-purple"], /\.cl2$/i],
  ["clojure-icon", ["medium-green", "dark-green"], /\.cljc$/i],
  ["clojure-icon", ["medium-red", "dark-red"], /\.cljx$|\.hic$/i],
  ["cljs-icon", ["medium-blue", "dark-blue"], /\.cljs(?:\.hl|cm)?$/i],
  ["cmake-icon", ["medium-green", "medium-green"], /\.cmake$/i, , false, /^cmake$/, /\.cmake$/i, /^cmake$/i],
  ["cmake-icon", ["medium-red", "medium-red"], /^CMakeLists\.txt$/],
  ["coffee-icon", ["medium-maroon", "medium-maroon"], /\.coffee$/i, , false, /^coffee$/, /\.coffee$/i, /^CoffeeScript$|^Coffee(?:-Script)?$/i],
  ["coffee-icon", ["dark-maroon", "dark-maroon"], /\.cjsx$/i],
  ["coffee-icon", ["light-maroon", "light-maroon"], /\.litcoffee$/i, , false, /^litcoffee$/, /\.litcoffee$/i, /^CoffeeScript$|^litc[0o]ffee$/i],
  ["coffee-icon", ["medium-blue", "medium-blue"], /\.iced$/i],
  ["cf-icon", ["light-cyan", "light-cyan"], /\.cfc$/i, , false, , /\.cfscript$/i, /^ColdFusion$|^(?:CFC|CFScript)$/i],
  ["cf-icon", ["medium-cyan", "medium-cyan"], /\.cfml?$/i, , false, , /\.cfml?$/i, /^ColdFusion$|^(?:cfml?|ColdFusion\s*HTML)$/i],
  ["khronos-icon", ["medium-orange", "medium-orange"], /\.dae$/i],
  ["cl-icon", ["medium-orange", "medium-orange"], /\.cl$/i, , false, /^(?:c?lisp|sbcl|[ec]cl)$/, /\.common-lisp$/i, /^Common Lisp$|^c?lisp$/i],
  ["cp-icon", ["medium-maroon", "medium-maroon"], /\.cp$/i],
  ["cp-icon", ["dark-red", "dark-red"], /\.cps$/i],
  ["zip-icon", [null, null], /\.(?:zip|z|xz)$/i, , false, , , , /^(?:\x50\x4B(?:\x03\x04|\x05\x06|\x07|\x08)|\x1F[\x9D\xA0]|BZh|RNC[\x01\x02]|\xD0\xCF\x11\xE0)/],
  ["zip-icon", ["medium-blue", "medium-blue"], /\.rar$/i, , false, , , , /^Rar!\x1A\x07\x01?\0/],
  ["zip-icon", ["dark-blue", "dark-blue"], /\.t?gz$|\.tar$|\.whl$/i, , false, , , , /^\x1F\x8B/],
  ["zip-icon", ["medium-maroon", "medium-maroon"], /\.(?:lzo?|lzma|tlz|tar\.lzma)$/i, , false, , , , /^LZIP/],
  ["zip-icon", ["medium-maroon", "medium-maroon"], /\.7z$/i, , false, , , , /^7z\xBC\xAF\x27\x1C/],
  ["zip-icon", ["medium-red", "medium-red"], /\.apk$|\.gem$/i],
  ["zip-icon", ["dark-cyan", "dark-cyan"], /\.bz2$/i],
  ["zip-icon", ["medium-blue", "medium-blue"], /\.iso$/i, , false, , , , /^\x45\x52\x02\0{3}|^\x8B\x45\x52\x02/],
  ["zip-icon", ["medium-orange", "medium-orange"], /\.xpi$/i],
  ["zip-icon", ["medium-green", "medium-green"], /\.epub$/i],
  ["zip-icon", ["dark-pink", "dark-pink"], /\.jar$/i],
  ["zip-icon", ["medium-purple", "medium-purple"], /\.war$/i],
  ["zip-icon", ["dark-orange", "dark-orange"], /\.xar$/i, , false, , , , /^xar!/],
  ["zip-icon", ["light-orange", "light-orange"], /\.egg$/i],
  ["config-icon", ["medium-yellow", "medium-yellow"], /\.(?:ini|desktop|directory|cfg|conf|prefs)$/i, , false, , /\.ini$/i, /^d[0o]sini$/i],
  ["config-icon", ["medium-purple", "medium-purple"], /\.properties$/i, , false, , /\.java-properties$/i],
  ["config-icon", ["medium-green", "medium-green"], /\.toml$|\.opts$/i],
  ["config-icon", ["dark-red", "dark-red"], /\.ld$/i],
  ["config-icon", ["medium-red", "medium-red"], /\.lds$|\.reek$/i],
  ["config-icon", ["dark-blue", "dark-blue"], /\.terminal$/i],
  ["config-icon", ["medium-orange", "medium-orange"], /^ld\.script$/i],
  ["config-icon", ["dark-red", "dark-red"], /\.git[\/\\](?:config|info[\/\\]\w+)$/, , true],
  ["config-icon", ["dark-orange", "dark-orange"], /^\/(?:private\/)?etc\/(?:[^\/]+\/)*[^\/]*\.(?:cf|conf|ini)(?:\.default)?$/i, , true],
  ["config-icon", ["medium-maroon", "medium-maroon"], /^\/(?:private\/)?etc\/(?:aliases|auto_(?:home|master)|ftpusers|group|gettytab|hosts(?:\.equiv)?|manpaths|networks|paths|protocols|services|shells|sudoers|ttys)$/i, , true],
  ["coq-icon", ["medium-maroon", "medium-maroon"], /\.coq$/i, , false, , /\.coq$/i, /^Coq$/i],
  ["creole-icon", ["medium-blue", "medium-blue"], /\.creole$/i, , false, , /\.creole$/i, /^Creole$/i],
  ["crystal-icon", ["medium-cyan", "medium-cyan"], /\.e?cr$/i, , false, /^crystal$/, /\.crystal$/i, /^Crystal$/i],
  ["csound-icon", ["medium-maroon", "medium-maroon"], /\.orc$/i, , false, , /\.csound$/i, /^Csound$|^cs[0o]und[\W_ \t]?[0o]rc$/i],
  ["csound-icon", ["dark-orange", "dark-orange"], /\.udo$/i],
  ["csound-icon", ["dark-maroon", "dark-maroon"], /\.csd$/i, , false, , /\.csound-document$/i, /^Csound$|^cs[0o]und[\W_ \t]?csd$/i],
  ["csound-icon", ["dark-blue", "dark-blue"], /\.sco$/i, , false, , /\.csound-score$/i, /^Csound$|^cs[0o]und[\W_ \t]?sc[0o]$/i],
  ["css3-icon", ["medium-blue", "medium-blue"], /\.css$/i, , false, /^css$/, /\.css$/i, /^css$/i],
  ["css3-icon", ["dark-blue", "dark-blue"], /\.less$/i, , false, /^less$/, /\.less$/i, /^CSS$|^less$/i],
  ["cucumber-icon", ["medium-green", "medium-green"], /\.feature$/i, , false, , /(?:^|\.)(?:gherkin\.feature|cucumber\.steps)(?:\.|$)/i, /^Cucumber$|^gherkin$/i],
  ["nvidia-icon", ["medium-green", "medium-green"], /\.cu$/i, , false, , /\.cuda(?:-c\+\+)?$/i, /^CUDA$/i],
  ["nvidia-icon", ["dark-green", "dark-green"], /\.cuh$/i],
  ["cython-icon", ["medium-orange", "medium-orange"], /\.pyx$/i, , false, , /\.cython$/i, /^Cython$|^pyrex$/i],
  ["cython-icon", ["medium-blue", "medium-blue"], /\.pxd$/i],
  ["cython-icon", ["dark-blue", "dark-blue"], /\.pxi$/i],
  ["dlang-icon", ["medium-red", "medium-red"], /\.di?$/i, , false, , /\.d$/i, /^D$/i],
  ["yang-icon", ["medium-red", "medium-red"], /\.dnh$/i, , false, , /\.danmakufu$/i, /^Danmakufu$/i],
  ["darcs-icon", ["medium-green", "medium-green"], /\.d(?:arcs)?patch$/i],
  ["dart-icon", ["medium-cyan", "medium-cyan"], /\.dart$/i, , false, /^dart$/, /\.dart$/i, /^Dart$/i],
  ["dashboard-icon", ["medium-orange", "medium-orange"], /\.s[kl]im$/i, , false, /^slim$/, /\.slim$/i, /^slim$/i],
  ["dashboard-icon", ["medium-green", "medium-green"], /\.cpuprofile$/i],
  ["database-icon", ["medium-yellow", "medium-yellow"], /\.(?:h|geo|topo)?json$/i],
  ["database-icon", ["light-red", "light-red"], /\.ya?ml$/i],
  ["database-icon", ["medium-maroon", "medium-maroon"], /\.cson$|\.ston$|^mime\.types$/i],
  ["database-icon", ["dark-yellow", "dark-yellow"], /\.json5$/i, , false, /^json5$/, /\.json5$/i, /^js[0o]n5$/i],
  ["database-icon", ["medium-red", "medium-red"], /\.http$|\.pot?$/i],
  ["database-icon", ["medium-orange", "medium-orange"], /\.ndjson$|\.pytb$/i, , false, , /\.python\.traceback$/i],
  ["database-icon", ["light-blue", "light-blue"], /\.fea$/i, , false, , /\.opentype$/i, /^afdk[0o]$/i],
  ["database-icon", ["medium-purple", "medium-purple"], /\.json\.eex$|\.edn$/i],
  ["database-icon", ["dark-cyan", "dark-cyan"], /\.proto$/i, , false, , /\.protobuf$/i, /^(?:protobuf|Protocol\s*Buffers?)$/i],
  ["database-icon", ["dark-blue", "dark-blue"], /\.pydeps$|\.rviz$/i],
  ["database-icon", ["dark-purple", "dark-purple"], /\.eam\.fs$/i],
  ["database-icon", ["medium-pink", "medium-pink"], /\.qml$/i],
  ["database-icon", ["dark-pink", "dark-pink"], /\.qbs$/i],
  ["database-icon", ["medium-cyan", "medium-cyan"], /\.ttl$/i, , false, , /\.turtle$/i],
  ["database-icon", ["medium-blue", "medium-blue"], /\.syntax$/i],
  ["database-icon", ["dark-red", "dark-red"], /[\/\\](?:magic[\/\\]Magdir|file[\/\\]magic)[\/\\][-.\w]+$|lib[\\\/]icons[\\\/]\.icondb\.js$/i, , true],
  ["dbase-icon", ["medium-red", "medium-red"], /\.dbf$/i],
  ["debian-icon", ["medium-red", "medium-red"], /\.deb$/i],
  ["debian-icon", ["dark-cyan", "dark-cyan"], /^control$/],
  ["debian-icon", ["medium-cyan", "medium-cyan"], /^rules$/],
  ["diff-icon", ["medium-orange", "medium-orange"], /\.diff$/i, , false, , /\.diff$/i, /^Diff$|^udiff$/i],
  ["earth-icon", ["medium-blue", "medium-blue"], /\.zone$/i],
  ["earth-icon", ["medium-green", "medium-green"], /\.arpa$/i],
  ["earth-icon", ["dark-blue", "dark-blue"], /^CNAME$/],
  ["doxygen-icon", ["medium-blue", "medium-blue"], /^Doxyfile$/, , false, , /\.doxygen$/i, /^Doxyfile$/i],
  ["dyalog-icon", ["medium-orange", "medium-orange"], /\.dyalog$/i, , false, /^dyalog$/],
  ["dylib-icon", ["medium-cyan", "medium-cyan"], /\.(?:dylib|bundle)$/i],
  ["e-icon", ["medium-green", "medium-green"], /\.E$/, , false, /^rune$/],
  ["eagle-icon", ["medium-red", "medium-red"], /\.sch$/i],
  ["eagle-icon", ["dark-red", "dark-red"], /\.brd$/i],
  ["ec-icon", ["dark-blue", "dark-blue"], /\.ec$/i, , false, /^ec$/, /\.ec$/i, /^ec$/i],
  ["ec-icon", ["dark-purple", "dark-purple"], /\.eh$/i],
  ["ecere-icon", ["medium-blue", "medium-blue"], /\.epj$/i],
  ["eclipse-icon", ["dark-blue", "dark-blue"], /\.c?project$/],
  ["eclipse-icon", ["medium-red", "medium-red"], /\.classpath$/i],
  ["editorconfig-icon", ["medium-orange", "medium-orange"], /\.editorconfig$/i, , false, , /\.editorconfig$/i, /^EditorConfig$/i],
  ["eiffel-icon", ["medium-cyan", "medium-cyan"], /\.e$/, , false, , /\.eiffel$/i, /^Eiffel$/i],
  ["elixir-icon", ["dark-purple", "dark-purple"], /\.ex$/i, , false, /^elixir$/, /\.elixir$/i, /^elixir$/i],
  ["elixir-icon", ["medium-purple", "medium-purple"], /\.(?:exs|eex)$/i],
  ["elixir-icon", ["light-purple", "light-purple"], /mix\.exs?$/i],
  ["elm-icon", ["medium-blue", "medium-blue"], /\.elm$/i, , false, , /\.elm$/i, /^Elm$/i],
  ["emacs-icon", ["medium-purple", "medium-purple"], /(?:^|\.)(?:el|_?emacs|spacemacs|emacs\.desktop|abbrev[-_]defs)$/i, , false, /^emacs$/, /\.emacs\.lisp$/i, /^Emacs Lisp$|^elisp$/i],
  ["emacs-icon", ["dark-purple", "dark-purple"], /(?:^|\.)(?:elc|eld)$/i, , false, , , , /^;ELC\x17\0{3}/],
  ["at-icon", ["medium-red", "dark-red"], /^(?:authors|owners)$/i],
  ["em-icon", ["medium-red", "medium-red"], /\.emberscript$/i, , false, , /\.ember(?:script)?$/i, /^EmberScript$/i],
  ["mustache-icon", ["medium-blue", "medium-blue"], /\.em(?:blem)?$/i, , false, , /\.emblem$/i, /^Emblem$/i],
  ["eq-icon", ["medium-orange", "medium-orange"], /\.eq$/i, , false, , /\.eq$/i, /^EQ$/i],
  ["erlang-icon", ["medium-red", "medium-red"], /\.erl$/i, , false, /^escript$/, /\.erlang$/i, /^Erlang$/i],
  ["erlang-icon", ["dark-red", "dark-red"], /\.beam$/i],
  ["erlang-icon", ["medium-maroon", "medium-maroon"], /\.hrl$/i],
  ["erlang-icon", ["medium-green", "medium-green"], /\.xrl$/i],
  ["erlang-icon", ["dark-green", "dark-green"], /\.yrl$/i],
  ["erlang-icon", ["dark-maroon", "dark-maroon"], /\.app\.src$/i],
  ["factor-icon", ["medium-orange", "medium-orange"], /\.factor$/i, , false, , /\.factor$/i, /^Factor$/i],
  ["factor-icon", ["dark-orange", "dark-orange"], /\.factor-rc$/i],
  ["factor-icon", ["medium-red", "medium-red"], /\.factor-boot-rc$/i],
  ["fancy-icon", ["dark-blue", "dark-blue"], /\.fy$/i, , false, /^fancy$/, /\.fancy$/i, /^fancy$/i],
  ["fancy-icon", ["medium-blue", "medium-blue"], /\.fancypack$/i],
  ["fancy-icon", ["medium-green", "medium-green"], /^Fakefile$/],
  ["fantom-icon", ["medium-blue", "medium-blue"], /\.fan$/i, , false, , /\.fan(?:tom)?$/i, /^Fantom$/i],
  ["fbx-icon", ["medium-maroon", "medium-maroon"], /\.fbx$/i],
  ["finder-icon", ["medium-blue", "medium-blue"], /^Icon\r$/],
  ["finder-icon", ["dark-blue", "dark-blue"], /\.rsrc$/i],
  ["flow-icon", ["medium-orange", "medium-orange"], /\.(?:flowconfig|js\.flow)$/i],
  ["flux-icon", ["medium-blue", "medium-blue"], /\.fx$/i],
  ["flux-icon", ["dark-blue", "dark-blue"], /\.flux$/i],
  ["font-icon", ["dark-blue", "dark-blue"], /\.woff2$/i, , false, , , , /^wOF2/],
  ["font-icon", ["medium-blue", "medium-blue"], /\.woff$/i, , false, , , , /^wOFF/],
  ["font-icon", ["light-green", "light-green"], /\.eot$/i, , false, , , , /^.{34}LP/],
  ["font-icon", ["dark-green", "dark-green"], /\.ttc$/i, , false, , , , /^ttcf/],
  ["font-icon", ["medium-green", "medium-green"], /\.ttf$/i, , false, , , , /^\0\x01\0{3}/],
  ["font-icon", ["dark-yellow", "dark-yellow"], /\.otf$/i, , false, , , , /^OTTO.*\0/],
  ["font-icon", ["dark-red", "dark-red"], /\.pfb$/i],
  ["font-icon", ["medium-red", "medium-red"], /\.pfm$/i],
  ["ff-icon", ["medium-orange", "medium-orange"], /\.pe$/i, , false, /^fontforge$/, /\.source\.fontforge$/i, /^FontForge$|^pfaedit$/i],
  ["ff-icon", ["dark-blue", "dark-blue"], /\.sfd$/i, , false, , /\.text\.sfd$/i, /^FontForge$/i],
  ["fortran-icon", ["medium-maroon", "medium-maroon"], /\.f$/i, , false, , /\.fortran\.?(?:modern|punchcard)?$/i, /^Fortran$/i],
  ["fortran-icon", ["medium-green", "medium-green"], /\.f90$/i, , false, , /\.fortran\.free$/i, /^Fortran$/i],
  ["fortran-icon", ["medium-red", "medium-red"], /\.f03$/i],
  ["fortran-icon", ["medium-blue", "medium-blue"], /\.f08$/i],
  ["fortran-icon", ["medium-maroon", "medium-maroon"], /\.f77$/i, , false, , /\.fortran\.fixed$/i, /^Fortran$/i],
  ["fortran-icon", ["dark-pink", "dark-pink"], /\.f95$/i],
  ["fortran-icon", ["dark-cyan", "dark-cyan"], /\.for$/i],
  ["fortran-icon", ["dark-yellow", "dark-yellow"], /\.fpp$/i],
  ["freemarker-icon", ["medium-blue", "medium-blue"], /\.ftl$/i, , false, , /\.ftl$/i, /^FreeMarker$|^ftl$/i],
  ["frege-icon", ["dark-red", "dark-red"], /\.fr$/i],
  ["fsharp-icon", ["medium-blue", "medium-blue"], /\.fs[xi]?$/i, , false, , /\.fsharp$/i, /^FSharp$|^f#$/i],
  ["gml-icon", ["medium-green", "medium-green"], /\.gml$/i],
  ["gams-icon", ["dark-red", "dark-red"], /\.gms$/i, , false, , /\.gams(?:-lst)?$/i, /^GAMS$/i],
  ["gap-icon", ["medium-yellow", "dark-yellow"], /\.gap$/i, , false, /^gap$/, /\.gap$/i, /^gap$/i],
  ["gap-icon", ["dark-blue", "dark-blue"], /\.gi$/i],
  ["gap-icon", ["medium-orange", "medium-orange"], /\.tst$/i],
  ["gdb-icon", ["medium-green", "dark-green"], /\.gdb$/i, , false, /^gdb$/, /\.gdb$/i, /^gdb$/i],
  ["gdb-icon", ["medium-cyan", "dark-cyan"], /gdbinit$/i],
  ["godot-icon", ["medium-blue", "medium-blue"], /\.gd$/i, , false, , /\.gdscript$/i, /^GDScript$/i],
  ["gear-icon", ["medium-red", "medium-red"], /^\.htaccess$|\.yardopts$/i],
  ["gear-icon", ["medium-orange", "medium-orange"], /^\.htpasswd$/i],
  ["gear-icon", ["dark-green", "dark-green"], /^\.env\.|\.pairs$/i],
  ["gear-icon", ["dark-yellow", "dark-yellow"], /^\.lesshintrc$/i],
  ["gear-icon", ["medium-yellow", "medium-yellow"], /^\.csscomb\.json$|\.csslintrc$|\.jsbeautifyrc$|\.jshintrc$|\.jscsrc$/i],
  ["gear-icon", ["medium-maroon", "medium-maroon"], /\.coffeelintignore$|\.codoopts$/i],
  ["gear-icon", ["medium-blue", "medium-blue"], /\.module$/i],
  ["gear-icon", ["dark-blue", "dark-blue"], /\.arcconfig$|\.python-version$/i],
  ["gear-icon", ["dark-orange", "dark-orange"], /\.lintstagedrc$/i],
  ["gears-icon", ["dark-orange", "dark-orange"], /\.dll$/i, , false, , , , /^PMOCCMOC/],
  ["code-icon", ["medium-blue", "medium-blue"], /\.xml$|\.config$|\.4th$|\.cocci$|\.dyl$|\.dylan$|\.ecl$|\.forth$|\.launch$|\.manifest$|\.menu$|\.srdf$|\.st$|\.ui$|\.wsf$|\.x3d$|\.xaml$/i, , false, , , , /^<\?xml /],
  ["code-icon", ["dark-red", "dark-red"], /\.rdf$|\.capnp$|\.dotsettings$|\.flex$|\.fsh$|\.fsproj$|\.prw$|\.xproj$/i, , false, , /\.capnp$/i],
  ["code-icon", ["medium-blue", "medium-blue"], /^_service$/],
  ["code-icon", ["medium-red", "medium-red"], /^configure\.ac$|\.ML$/],
  ["code-icon", ["medium-green", "medium-green"], /^Settings\.StyleCop$/],
  ["code-icon", ["medium-green", "medium-green"], /\.abnf$|\.ditaval$|\.storyboard$|\.xmi$|\.yacc$/i, , false, /^abnf$/, /\.abnf$/i, /^abnf$/i],
  ["code-icon", ["medium-purple", "medium-purple"], /\.aepx$|\.dita$|\.grace$|\.lid$|\.nproj$/i],
  ["code-icon", ["dark-cyan", "dark-cyan"], /\.agda$|\.plist$|\.wisp$|\.xlf$|\.xslt$/i, , false, , /\.plist$/i],
  ["code-icon", ["medium-orange", "medium-orange"], /\.appxmanifest$|\.befunge$|\.fun$|\.muf$|\.xul$/i],
  ["code-icon", ["medium-cyan", "medium-cyan"], /\.ash$|\.asn1?$|\.lagda$|\.lex$|\.props$|\.resx$|\.smt2$|\.vsh$|\.xsl$|\.yy$/i, , false, /^xsl$/, /\.xsl$/i],
  ["code-icon", ["dark-blue", "dark-blue"], /\.axml$|\.bmx$|\.brs$|\.ccxml$|\.clixml$|\.fth$|\.intr$|\.mdpolicy$|\.mtml$|\.myt$|\.xsd$/i, , false, /^brightscript$/, /\.brightscript$/i],
  ["code-icon", ["medium-maroon", "medium-maroon"], /\.bnf$|\.cbl$|\.cob$|\.cobol$|\.fxml$/i, , false, /^bnf$/, /\.bnf$/i, /^bnf$/i],
  ["code-icon", ["dark-maroon", "dark-maroon"], /\.ccp$|\.cpy$|\.mxml$/i],
  ["code-icon", ["medium-red", "medium-red"], /\.ch$|\.cw$|\.ebnf$|\.iml$|\.jflex$|\.m4$|\.mask$|\.mumps$|\.prg$|\.pt$|\.rl$|\.sml$|\.targets$|\.webidl$|\.wsdl$|\.xacro$|\.xliff$/i, , false, /^ebnf$/, /\.ebnf$/i],
  ["code-icon", ["dark-pink", "dark-pink"], /\.ct$|\.zcml$/i],
  ["code-icon", ["dark-green", "dark-green"], /\.cy$|\.eclxml$|\.ivy$|\.sed$|\.tml$|\.y$/i],
  ["code-icon", ["dark-purple", "dark-purple"], /\.ditamap$|\.frt$|\.lp$|\.omgrofl$|\.osm$|\.wxs$|\.xib$/i],
  ["code-icon", ["medium-pink", "medium-pink"], /\.filters$|\.lol$|\.pig$/i],
  ["code-icon", ["dark-orange", "dark-orange"], /\.grxml$|\.urdf$/i],
  ["code-icon", ["medium-yellow", "medium-yellow"], /\.jelly$/i],
  ["code-icon", ["dark-yellow", "dark-yellow"], /\.jsproj$|\.ohm$|\.sgml?$/i, , false, /^ohm$/, /\.ohm$/i],
  ["code-icon", ["dark-blue", "dark-blue"], /\.mq[45h]$/i, , false, , /(?:^|\.)mq[45](?=\.|$)/i],
  ["code-icon", ["light-green", "light-green"], /\.odd$/i],
  ["code-icon", ["light-blue", "light-blue"], /\.psc1$|\.smt$/i, , false, /boolector|cvc4|mathsat5|opensmt|smtinterpol|smt-rat|stp|verit|yices2|z3/, /\.smt$/i],
  ["code-icon", ["light-cyan", "light-cyan"], /\.scxml$/i],
  ["code-icon", ["light-maroon", "light-maroon"], /\.sig$|\.wxl$/i],
  ["code-icon", ["light-orange", "light-orange"], /\.ux$|\.wxi$/i],
  ["code-icon", ["light-purple", "light-purple"], /\.vxml$/i],
  ["genshi-icon", ["medium-red", "medium-red"], /\.kid$/i, , false, , /\.genshi$/i, /^Genshi$|^xml\+(?:genshi|kid)$/i],
  ["gentoo-icon", ["dark-cyan", "dark-cyan"], /\.ebuild$/i, , false, , /\.ebuild$/i, /^Gentoo$/i],
  ["gentoo-icon", ["medium-blue", "medium-blue"], /\.eclass$/i],
  ["git-icon", ["medium-red", "medium-red"], /^\.git|^\.keep$|\.mailmap$/i, , false, , /\.git-(?:commit|config|rebase)$/i, /^Git$/i],
  ["git-commit-icon", ["medium-red", "medium-red"], /^COMMIT_EDITMSG$/],
  ["git-merge-icon", ["medium-red", "medium-red"], /^MERGE_(?:HEAD|MODE|MSG)$/],
  ["glade-icon", ["medium-green", "medium-green"], /\.glade$/i],
  ["pointwise-icon", ["medium-blue", "medium-blue"], /\.glf$/i],
  ["glyphs-icon", ["medium-green", "medium-green"], /\.glyphs$/i],
  ["gn-icon", ["dark-blue", "dark-blue"], /\.gn$/i, , false, /^gn$/, /\.gn$/i, /^gn$/i],
  ["gn-icon", ["medium-blue", "medium-blue"], /\.gni$/i],
  ["gnu-icon", ["medium-red", "dark-red"], /\.(?:gnu|gplv[23])$/i],
  ["graph-icon", ["medium-red", "medium-red"], /\.(?:gp|plo?t|gnuplot)$/i, , false, /^gnuplot$/, /\.gnuplot$/i, /^Gnuplot$/i],
  ["go-icon", ["medium-blue", "medium-blue"], /\.go$/i, , false, , /\.go(?:template)?$/i, /^Go$/i],
  ["golo-icon", ["medium-orange", "medium-orange"], /\.golo$/i, , false, , /\.golo$/i, /^Golo$/i],
  ["gosu-icon", ["medium-blue", "medium-blue"], /\.gs$/i, , false, , /\.gosu(?:\.\d+)?$/i, /^Gosu$/i],
  ["gosu-icon", ["medium-green", "medium-green"], /\.gst$/i],
  ["gosu-icon", ["dark-green", "dark-green"], /\.gsx$/i],
  ["gosu-icon", ["dark-blue", "dark-blue"], /\.vark$/i],
  ["gradle-icon", ["medium-blue", "medium-blue"], /\.gradle$/i, , false, , /\.gradle$/i, /^Gradle$/i],
  ["gradle-icon", ["dark-purple", "dark-purple"], /gradlew$/i],
  ["gf-icon", ["medium-red", "medium-red"], /\.gf$/i],
  ["graphql-icon", ["medium-pink", "medium-pink"], /\.graphql$/i, , false, , /\.graphql$/i, /^GraphQL$/i],
  ["graphql-icon", ["medium-purple", "medium-purple"], /\.gql$/i],
  ["graphviz-icon", ["medium-blue", "medium-blue"], /\.gv$/i, , false, , /\.dot$/i, /^Graphviz$/i],
  ["graphviz-icon", ["dark-cyan", "dark-cyan"], /\.dot$/i],
  ["groovy-icon", ["light-blue", "light-blue"], /\.(?:groovy|grt|gtpl|gsp|gvy)$/i, , false, /^groovy$/, /\.groovy$/i, /^Groovy$|^gsp$/i],
  ["hack-icon", ["medium-orange", "medium-orange"], /\.hh$/i, , false, , /\.hack$/i, /^Hack$/i],
  ["haml-icon", ["medium-yellow", "medium-yellow"], /\.haml$/i, , false, /^haml$/, /\.haml$/i, /^haml$/i],
  ["haml-icon", ["medium-maroon", "medium-maroon"], /\.hamlc$/i, , false, /^hamlc$/, /\.hamlc$/i, /^Haml$|^hamlc$/i],
  ["harbour-icon", ["dark-blue", "dark-blue"], /\.hb$/i, , false, , /\.harbour$/i, /^Harbour$/i],
  ["hashicorp-icon", ["dark-purple", "dark-purple"], /\.hcl$/i, , false, , /(?:^|\.)(?:hcl|hashicorp)(?:\.|$)/i, /^Hashicorp Configuration Language$/i],
  ["haskell-icon", ["medium-purple", "medium-purple"], /\.hs$/i, , false, /^runhaskell$/, /\.source\.haskell$/i, /^Haskell$/i],
  ["haskell-icon", ["medium-blue", "medium-blue"], /\.hsc$/i, , false, , /\.hsc2hs$/i, /^Haskell$/i],
  ["haskell-icon", ["dark-purple", "dark-purple"], /\.c2hs$/i, , false, , /\.c2hs$/i, /^Haskell$|^C2hs(?:\s*Haskell)?$/i],
  ["haskell-icon", ["dark-blue", "dark-blue"], /\.lhs$/i, , false, , /\.latex\.haskell$/i, /^Haskell$|^(?:lhaskell|lhs|Literate\s*Haskell)$/i],
  ["haxe-icon", ["medium-orange", "medium-orange"], /\.hx(?:[sm]l|)?$/, , false, , /(?:^|\.)haxe(?:\.\d+)?$/i, /^Haxe$/i],
  ["heroku-icon", ["medium-purple", "medium-purple"], /^Procfile$/],
  ["heroku-icon", ["light-purple", "light-purple"], /\.buildpacks$/i],
  ["heroku-icon", ["dark-purple", "dark-purple"], /^\.vendor_urls$/],
  ["html5-icon", ["medium-orange", "medium-orange"], /\.x?html?$/i, , false, , /\.html\.basic$/i, /^HTML$|^(?:xhtml|htm)$/i],
  ["html5-icon", ["medium-red", "medium-red"], /\.cshtml$|\.latte$/i, , false, /^latte$/, /\.latte$/i],
  ["html5-icon", ["medium-green", "medium-green"], /\.ejs$|\.kit$|\.swig$/i, , false, /^swig$/, /\.swig$/i],
  ["html5-icon", ["dark-blue", "dark-blue"], /\.gohtml$|\.phtml$/i, , false, /^gohtml$/, /\.gohtml$/i, /^HTML$|^g[0o]html$/i],
  ["html5-icon", ["medium-purple", "medium-purple"], /\.html\.eex$|\.jsp$/i, , false, , /\.jsp$/i],
  ["html5-icon", ["medium-cyan", "medium-cyan"], /\.shtml$/i],
  ["html5-icon", ["dark-red", "dark-red"], /\.scaml$/i, , false, /^scaml$/, /\.scaml$/i, /^HTML$|^scaml$/i],
  ["html5-icon", ["medium-red", "medium-red"], /\.vash$/i, , false, /^vash$/, /\.vash$/i, /^HTML$|^vash$/i],
  ["html5-icon", ["medium-blue", "medium-blue"], /\.dtml$/i, , false, /^dtml$/, /\.dtml$/i, /^HTML$|^dtml$/i],
  ["hy-icon", ["dark-blue", "dark-blue"], /\.hy$/i, , false, , /\.hy$/i, /^Hy$|^hylang$/i],
  ["idl-icon", ["medium-blue", "medium-blue"], /\.dlm$/i, , false, , /\.idl$/i, /^IDL$/i],
  ["idris-icon", ["dark-red", "dark-red"], /\.idr$/i, , false, , /\.(?:idris|ipkg)$/i, /^Idris$/i],
  ["idris-icon", ["medium-maroon", "medium-maroon"], /\.lidr$/i],
  ["igorpro-icon", ["dark-red", "dark-red"], /\.ipf$/i],
  ["image-icon", ["medium-orange", "medium-orange"], /\.a?png$|\.svgz$/i, , false, , , , /^.PNG\r\n\x1A\n/],
  ["image-icon", ["medium-yellow", "medium-yellow"], /\.gif$|\.ora$|\.sgi$/i, , false, , , , /^GIF8[97]a/],
  ["image-icon", ["medium-green", "medium-green"], /\.je?pg$/i, , false, , , , /^\xFF\xD8\xFF[\xDB\xE0\xE1]|(?:JFIF|Exif)\0|^\xCF\x84\x01|^\xFF\xD8.+\xFF\xD9$/],
  ["image-icon", ["medium-blue", "medium-blue"], /\.ico$/i, , false, , , , /^\0{2}\x01\0/],
  ["image-icon", ["dark-blue", "dark-blue"], /\.webp$|\.iff$|\.lbm$|\.liff$|\.nrrd$|\.pcx$|\.vsdx?$/i, , false, , , , /^RIFF.{4}WEBPVP8/],
  ["image-icon", ["medium-red", "medium-red"], /\.bmp$/i, , false, , , , /^BM/],
  ["image-icon", ["medium-red", "medium-red"], /\.bpg$/i, , false, , , , /^BPG\xFB/],
  ["image-icon", ["medium-orange", "medium-orange"], /\.cin$/i, , false, , , , /^\x80\x2A\x5F\xD7/],
  ["image-icon", ["dark-green", "dark-green"], /\.cd5$/i, , false, , , , /^_CD5\x10\0/],
  ["image-icon", ["light-yellow", "light-yellow"], /\.cpc$/i],
  ["image-icon", ["medium-orange", "medium-orange"], /\.cr2$/i, , false, , , , /^II\*\0\x10\0{3}CR/],
  ["image-icon", ["medium-pink", "medium-pink"], /\.dcm$|\.mpo$|\.pbm$/i, , false, , , , /^.{128}DICM/],
  ["image-icon", ["dark-green", "dark-green"], /\.dds$/i, , false, , , , /^DDS \|\0{3}/],
  ["image-icon", ["medium-purple", "medium-purple"], /\.djvu?$|\.pxr$/i, , false, , , , /^AT&TFORM/],
  ["image-icon", ["dark-orange", "dark-orange"], /\.dpx$|\.raw$/i, , false, , , , /^(?:SDPX|XPDS)/],
  ["image-icon", ["light-blue", "light-blue"], /\.ecw$|\.sct$/i],
  ["image-icon", ["dark-yellow", "dark-yellow"], /\.exr$/i, , false, , , , /^v\/1\x01/],
  ["image-icon", ["medium-cyan", "medium-cyan"], /\.fits?$|\.fts$/i, , false, , , , /^SIMPLE  =/],
  ["image-icon", ["dark-red", "dark-red"], /\.flif$|\.hdp$|\.heic$|\.heif$|\.jxr$|\.wdp$/i, , false, , , , /^FLIF/],
  ["image-icon", ["medium-blue", "medium-blue"], /\.hdr$/i, , false, , , , /^#\?RADIANCE\n/],
  ["image-icon", ["medium-pink", "medium-pink"], /\.icns$/i, , false, , , , /^icns/],
  ["image-icon", ["dark-green", "dark-green"], /\.(?:jp[f2xm]|j2c|mj2)$/i, , false, , , , /^\0{3}\fjP {2}/],
  ["image-icon", ["dark-cyan", "dark-cyan"], /\.jps$/i],
  ["image-icon", ["medium-orange", "medium-orange"], /\.mng$/i, , false, , , , /^.MNG\r\n\x1A\n/],
  ["image-icon", ["light-red", "light-red"], /\.pgf$/i],
  ["image-icon", ["light-purple", "light-purple"], /\.pict$/i],
  ["image-icon", ["dark-orange", "dark-orange"], /\.tga$/i, , false, , , , /TRUEVISION-XFILE\.\0$/],
  ["image-icon", ["medium-red", "medium-red"], /\.tiff?$/i, , false, , , , /^II\x2A\0|^MM\0\x2A/],
  ["image-icon", ["dark-maroon", "dark-maroon"], /\.wbm$/i],
  ["inform7-icon", ["medium-blue", "medium-blue"], /\.ni$/i, , false, , /\.inform-?7?$/i, /^Inform 7$|^i7$/i],
  ["inform7-icon", ["dark-blue", "dark-blue"], /\.i7x$/i],
  ["inno-icon", ["dark-blue", "dark-blue"], /\.iss$/i, , false, , /\.inno$/i, /^Inno Setup$/i],
  ["io-icon", ["dark-purple", "dark-purple"], /\.io$/i, , false, /^io$/, /^source\.io$/i, /^Io$/i],
  ["ioke-icon", ["medium-red", "medium-red"], /\.ik$/i, , false, /^ioke$/],
  ["isabelle-icon", ["dark-red", "dark-red"], /\.thy$/i, , false, , /\.isabelle\.theory$/i, /^Isabelle$/i],
  ["isabelle-icon", ["dark-blue", "dark-blue"], /^ROOT$/],
  ["j-icon", ["light-blue", "light-blue"], /\.ijs$/i, , false, /^jconsole$/, /\.j$/i, /^J$/i],
  ["jade-icon", ["medium-red", "medium-red"], /\.jade$/i, , false, , /\.jade$/i, /^Jade$/i],
  ["jake-icon", ["medium-maroon", "dark-maroon"], /^Jakefile$/],
  ["jake-icon", ["medium-yellow", "dark-yellow"], /\.jake$/i],
  ["java-icon", ["medium-purple", "medium-purple"], /\.java$/i, , false, , /\.java$/i, /^Java$/i],
  ["js-icon", ["medium-yellow", "dark-yellow"], /\.js$|\.es6$|\.es$/i, , false, /^(?:node|iojs)$/, /\.js$/i, /^JavaScript$|^(?:js|node)$/i],
  ["js-icon", ["medium-orange", "dark-orange"], /\._js$/i],
  ["js-icon", ["medium-maroon", "dark-maroon"], /\.jsb$|\.dust$/i],
  ["js-icon", ["medium-blue", "dark-blue"], /\.jsm$|\.mjs$|\.xsjslib$/i],
  ["js-icon", ["medium-green", "dark-green"], /\.jss$/i],
  ["js-icon", ["medium-pink", "dark-pink"], /\.sjs$/i],
  ["js-icon", ["medium-red", "dark-red"], /\.ssjs$/i],
  ["js-icon", ["medium-purple", "dark-purple"], /\.xsjs$/i],
  ["jenkins-icon", ["medium-red", "dark-red"], /^Jenkinsfile$/],
  ["jinja-icon", ["dark-red", "dark-red"], /\.jinja$/i, , false, , /\.jinja$/i, /^Jinja$|^(?:django|htmldjango|html\+django\/jinja|html\+jinja)$/i],
  ["jinja-icon", ["medium-red", "medium-red"], /\.jinja2$/i],
  ["jsonld-icon", ["medium-blue", "medium-blue"], /\.jsonld$/i],
  ["sql-icon", ["medium-blue", "medium-blue"], /\.jq$/i, , false, , /\.jq$/i, /^JSONiq$/i],
  ["jsx-icon", ["medium-blue", "dark-blue"], /\.jsx$/i, , false, , /\.jsx$/i, /^JSX$/i],
  ["julia-icon", ["medium-purple", "medium-purple"], /\.jl$/i, , false, , /\.julia$/i, /^Julia$/i],
  ["jupyter-icon", ["dark-orange", "dark-orange"], /\.ipynb$/i, , false, , /\.ipynb$/i, /^(?:ipynb|(?:Jupyter|IPython)\s*Notebook)$/i],
  ["jupyter-icon", ["dark-cyan", "dark-cyan"], /^Notebook$/],
  ["keynote-icon", ["medium-blue", "medium-blue"], /\.keynote$/i],
  ["keynote-icon", ["dark-blue", "dark-blue"], /\.knt$/i],
  ["kivy-icon", ["dark-maroon", "dark-maroon"], /\.kv$/i, , false, , /\.kv$/i, /^Kivy$/i],
  ["earth-icon", ["medium-green", "medium-green"], /\.kml$/i],
  ["kotlin-icon", ["dark-blue", "dark-blue"], /\.kt$/i, , false, /^kotlin$/, /\.kotlin$/i, /^k[0o]tlin$/i],
  ["kotlin-icon", ["medium-blue", "medium-blue"], /\.ktm$/i],
  ["kotlin-icon", ["medium-orange", "medium-orange"], /\.kts$/i],
  ["krl-icon", ["medium-blue", "medium-blue"], /\.krl$/i, , false, , /\.krl$/i, /^KRL$/i],
  ["labview-icon", ["dark-blue", "dark-blue"], /\.lvproj$/i],
  ["laravel-icon", ["medium-orange", "medium-orange"], /\.blade\.php$/i, , false, , /\.php\.blade$/i, /^Laravel$/i],
  ["lasso-icon", ["dark-blue", "dark-blue"], /\.lasso$|\.las$/i, , false, , /\.lasso$/i, /^Lasso$|^lass[0o]script$/i],
  ["lasso-icon", ["medium-blue", "medium-blue"], /\.lasso8$/i],
  ["lasso-icon", ["medium-purple", "medium-purple"], /\.lasso9$/i],
  ["lasso-icon", ["medium-red", "medium-red"], /\.ldml$/i],
  ["lean-icon", ["dark-purple", "dark-purple"], /\.lean$/i, , false, /^lean$/, /\.lean$/i, /^lean$/i],
  ["lean-icon", ["dark-red", "dark-red"], /\.hlean$/i],
  ["lfe-icon", ["dark-red", "dark-red"], /\.lfe$/i],
  ["lightwave-icon", ["medium-red", "medium-red"], /\.lwo$/i],
  ["lightwave-icon", ["medium-blue", "medium-blue"], /\.lws$/i],
  ["lisp-icon", ["medium-red", "medium-red"], /\.lsp$/i, , false, /^newlisp$/, /\.newlisp$/i, /^Lisp$|^newlisp$/i],
  ["lisp-icon", ["dark-red", "dark-red"], /\.lisp$/i, , false, /^lisp$/, /\.lisp$/i, /^lisp$/i],
  ["lisp-icon", ["medium-maroon", "medium-maroon"], /\.l$|\.nl$/i, , false, /picolisp|pil/],
  ["lisp-icon", ["medium-blue", "medium-blue"], /\.ny$|\.sexp$/i],
  ["lisp-icon", ["medium-purple", "medium-purple"], /\.podsl$/i],
  ["ls-icon", ["medium-blue", "medium-blue"], /\.ls$/i, , false, , /\.livescript$/i, /^LiveScript$|^(?:ls|live-script)$/i],
  ["ls-icon", ["dark-blue", "dark-blue"], /\._ls$/i],
  ["ls-icon", ["medium-green", "medium-green"], /^Slakefile$/],
  ["llvm-icon", ["dark-green", "dark-green"], /\.ll$/i, , false, /^llvm$/, /\.llvm$/i, /^llvm$/i],
  ["llvm-icon", ["medium-yellow", "dark-yellow"], /\.clang-format$/i],
  ["mobile-icon", ["dark-blue", "dark-blue"], /\.xm$/i, , false, /^logos$/, /\.logos$/i, /^l[0o]g[0o]s$/i],
  ["mobile-icon", ["dark-red", "dark-red"], /\.xi$/i],
  ["logtalk-icon", ["medium-red", "medium-red"], /\.(?:logtalk|lgt)$/i, , false, , /\.logtalk$/i, /^Logtalk$/i],
  ["lookml-icon", ["medium-purple", "medium-purple"], /\.lookml$/i],
  ["lsl-icon", ["medium-cyan", "medium-cyan"], /\.lsl$/i, , false, /^lsl$/, /\.lsl$/i, /^lsl$/i],
  ["lsl-icon", ["dark-cyan", "dark-cyan"], /\.lslp$/i],
  ["lua-icon", ["medium-blue", "medium-blue"], /\.lua$/i, , false, /^lua$/, /\.lua$/i, /^lua$/i],
  ["lua-icon", ["dark-blue", "dark-blue"], /\.pd_lua$/i],
  ["lua-icon", ["dark-purple", "dark-purple"], /\.rbxs$/i],
  ["lua-icon", ["dark-red", "dark-red"], /\.wlua$/i],
  ["checklist-icon", ["medium-yellow", "medium-yellow"], /^Makefile|^makefile$/, , false, /^make$/, /\.makefile$/i, /^Makefile$|^(?:bsdmake|make|mf)$/i],
  ["checklist-icon", ["medium-yellow", "medium-yellow"], /\.(?:mk|mak|make)$|^mkfile$/i],
  ["checklist-icon", ["medium-red", "medium-red"], /^BSDmakefile$|\.am$/i],
  ["checklist-icon", ["medium-green", "medium-green"], /^GNUmakefile$/i],
  ["checklist-icon", ["medium-blue", "medium-blue"], /^Kbuild$/],
  ["checklist-icon", ["dark-blue", "dark-blue"], /\.bb$/i],
  ["checklist-icon", ["dark-blue", "dark-blue"], /^DEPS$/],
  ["checklist-icon", ["medium-blue", "medium-blue"], /\.mms$/i],
  ["checklist-icon", ["light-blue", "light-blue"], /\.mmk$/i],
  ["checklist-icon", ["dark-purple", "dark-purple"], /\.pri$/i],
  ["mako-icon", ["dark-blue", "dark-blue"], /\.mak?o$/i, , false, , /\.mako$/i, /^Mako$/i],
  ["manpage-icon", ["dark-green", "dark-green"], /\.(?:1(?:[bcmsx]|has|in)?|[24568]|3(?:avl|bsm|3c|in|m|qt|x)?|7(?:d|fs|i|ipp|m|p)?|9[efps]?|chem|eqn|groff|man|mandoc|mdoc|me|mom|n|nroff|pic|tmac|tmac-u|tr|troff)$/i, , false, /man|mandoc|(?:[gnt]|dit)roff/i, /\.[gt]?roff$/i, /^Manual Page$|^(?:[gtn]?roff|manpage)$/i, /^\.TH[ \t]+(?:\S+)|^'\\" [tre]+(?=\s|$)/],
  ["manpage-icon", ["dark-maroon", "dark-maroon"], /\.(?:rnh|rno|roff|run|runoff)$/i, , false, /^runoff$/, /\.runoff$/i, /^Manual Page$|^run[0o]ff$/i],
  ["mapbox-icon", ["medium-cyan", "medium-cyan"], /\.mss$/i, , false, , /\.mss$/i, /^Mapbox$|^Carto(?:CSS)?$/i],
  ["markdown-icon", ["medium-blue", "medium-blue"], /\.(?:md|mdown|markdown|mkd|mkdown|mkdn|rmd|ron)$/i, , false, , /\.gfm$/i, /^Markdown$/i],
  ["mathematica-icon", ["dark-red", "dark-red"], /\.mathematica$|\.nbp$/i, , false, , /\.mathematica$/i, /^Mathematica$|^mma$/i],
  ["mathematica-icon", ["medium-red", "medium-red"], /\.cdf$/i],
  ["mathematica-icon", ["medium-orange", "medium-orange"], /\.ma$/i],
  ["mathematica-icon", ["medium-maroon", "medium-maroon"], /\.mt$/i],
  ["mathematica-icon", ["dark-orange", "dark-orange"], /\.nb$/i],
  ["mathematica-icon", ["medium-yellow", "medium-yellow"], /\.wl$/i],
  ["mathematica-icon", ["dark-yellow", "dark-yellow"], /\.wlt$/i],
  ["matlab-icon", ["medium-yellow", "medium-yellow"], /\.matlab$/i, , false, , /\.(?:matlab|octave)$/i, /^MATLAB$|^[0o]ctave$/i],
  ["max-icon", ["dark-purple", "dark-purple"], /\.maxpat$/i],
  ["max-icon", ["medium-red", "medium-red"], /\.maxhelp$/i],
  ["max-icon", ["medium-blue", "medium-blue"], /\.maxproj$/i],
  ["max-icon", ["medium-purple", "medium-purple"], /\.mxt$/i],
  ["max-icon", ["medium-green", "medium-green"], /\.pat$/i],
  ["maxscript-icon", ["dark-blue", "dark-blue"], /\.ms$/i, , false, , /\.maxscript$/i, /^MAXScript$/i],
  ["maxscript-icon", ["dark-purple", "dark-purple"], /\.mcr$/i],
  ["maxscript-icon", ["medium-red", "medium-red"], /\.mce$/i],
  ["maxscript-icon", ["dark-cyan", "dark-cyan"], /\.max$/i],
  ["maxscript-icon", ["medium-cyan", "medium-cyan"], /\.3ds$/i],
  ["maya-icon", ["dark-cyan", "dark-cyan"], /\.mb$/i],
  ["maya-icon", ["dark-blue", "dark-blue"], /\.mel$/i],
  ["maya-icon", ["dark-purple", "dark-purple"], /\.mcf[ip]$/i],
  ["mediawiki-icon", ["medium-yellow", "medium-yellow"], /\.mediawiki$/i, , false, /^mediawiki$/, /\.mediawiki$/i, /^mediawiki$/i],
  ["mediawiki-icon", ["medium-orange", "medium-orange"], /\.wiki$/i],
  ["bullhorn-icon", ["medium-orange", "medium-orange"], /^\.mention-bot$/i],
  ["mercury-icon", ["medium-cyan", "medium-cyan"], /\.moo$/i, , false, /^mmi$/, /\.mercury$/i, /^Mercury$/i],
  ["metal-icon", ["dark-cyan", "dark-cyan"], /\.metal$/i],
  ["access-icon", ["dark-maroon", "dark-maroon"], /\.accda$/i],
  ["access-icon", ["medium-maroon", "medium-maroon"], /\.accdb$/i],
  ["access-icon", ["medium-green", "medium-green"], /\.accde$/i],
  ["access-icon", ["medium-red", "medium-red"], /\.accdr$/i],
  ["access-icon", ["dark-red", "dark-red"], /\.accdt$/i],
  ["access-icon", ["light-maroon", "light-maroon"], /\.adn$|\.laccdb$/i],
  ["access-icon", ["dark-purple", "dark-purple"], /\.mdw$/i],
  ["excel-icon", ["dark-orange", "dark-orange"], /\.xls$/i],
  ["excel-icon", ["dark-green", "dark-green"], /\.xlsx$/i],
  ["excel-icon", ["medium-green", "medium-green"], /\.xlsm$/i],
  ["excel-icon", ["medium-red", "medium-red"], /\.xlsb$/i],
  ["excel-icon", ["dark-cyan", "dark-cyan"], /\.xlt$/i],
  ["onenote-icon", ["dark-purple", "dark-purple"], /\.one$/i],
  ["powerpoint-icon", ["dark-red", "dark-red"], /\.pps$/i],
  ["powerpoint-icon", ["medium-orange", "medium-orange"], /\.ppsx$/i],
  ["powerpoint-icon", ["dark-orange", "dark-orange"], /\.ppt$/i],
  ["powerpoint-icon", ["medium-red", "medium-red"], /\.pptx$/i],
  ["powerpoint-icon", ["medium-maroon", "medium-maroon"], /\.potm$/i],
  ["powerpoint-icon", ["dark-green", "dark-green"], /\.mpp$/i],
  ["word-icon", ["medium-blue", "medium-blue"], /\.doc$/i],
  ["word-icon", ["dark-blue", "dark-blue"], /\.docx$/i],
  ["word-icon", ["medium-maroon", "medium-maroon"], /\.docm$/i],
  ["word-icon", ["dark-cyan", "dark-cyan"], /\.docxml$/i],
  ["word-icon", ["dark-maroon", "dark-maroon"], /\.dotm$/i],
  ["word-icon", ["medium-cyan", "medium-cyan"], /\.dotx$/i],
  ["word-icon", ["medium-orange", "medium-orange"], /\.wri$/i],
  ["minecraft-icon", ["dark-green", "dark-green"], /^mcmod\.info$/i, , false, , /\.forge-config$/i, /^Minecraft$/i],
  ["mirah-icon", ["medium-blue", "medium-blue"], /\.dr?uby$/g, , false, /^mirah$/, /\.mirah$/i, /^mirah$/i],
  ["mirah-icon", ["light-blue", "light-blue"], /\.mir(?:ah)?$/g],
  ["model-icon", ["medium-red", "medium-red"], /\.obj$/i, , false, , /\.wavefront\.obj$/i],
  ["model-icon", ["dark-blue", "dark-blue"], /\.mtl$/i, , false, , /\.wavefront\.mtl$/i],
  ["model-icon", ["dark-green", "dark-green"], /\.stl$/i],
  ["model-icon", ["medium-orange", "medium-orange"], /\.u3d$/i],
  ["circle-icon", ["light-red", "light-red"], /\.mo$/i, , false, , /\.modelica(?:script)?$/i, /^Modelica$/i],
  ["modula2-icon", ["medium-blue", "medium-blue"], /\.mod$/i, , false, , /(?:^|\.)modula-?2(?:\.|$)/i, /^Modula-2$/i],
  ["modula2-icon", ["medium-green", "medium-green"], /\.def$/i],
  ["modula2-icon", ["medium-red", "medium-red"], /\.m2$/i],
  ["monkey-icon", ["medium-maroon", "medium-maroon"], /\.monkey$/i, , false, , /\.monkey$/i, /^Monkey$/i],
  ["moon-icon", ["medium-yellow", "medium-yellow"], /\.moon$/i, , false, /^moon$/, /\.moon$/i, /^MoonScript$/i],
  ["mruby-icon", ["medium-red", "medium-red"], /\.mrb$/i, , false, /^mruby$/],
  ["msql-icon", ["medium-purple", "medium-purple"], /\.dsql$/i],
  ["mupad-icon", ["medium-red", "medium-red"], /\.mu$/i],
  ["music-icon", ["medium-orange", "medium-orange"], /\.chord$/i],
  ["music-icon", ["dark-blue", "dark-blue"], /\.midi?$/i, , false, , , , /^MThd/],
  ["music-icon", ["medium-green", "medium-green"], /\.ly$/i, , false, , /\.(?:At)?lilypond-/i, /^Lily\s*Pond$/i],
  ["music-icon", ["dark-green", "dark-green"], /\.ily$/i],
  ["music-icon", ["dark-red", "dark-red"], /\.pd$/i],
  ["mustache-icon", ["medium-orange", "medium-orange"], /\.(?:hbs|handlebars|mustache)$/i, , false, , /(?:^|\.)(?:mustache|handlebars)(?:\.|$)/i, /^Mustache$|^(?:hbs|htmlbars|handlebars)$/i],
  ["nant-icon", ["medium-orange", "medium-orange"], /\.build$/i, , false, , /\.nant-build$/i, /^NAnt$/i],
  ["earth-icon", ["medium-green", "medium-green"], /\.ncl$/i, , false, , /\.ncl$/i, /^NCAR Command Language \(NCL\)$/i],
  ["neko-icon", ["medium-orange", "medium-orange"], /\.neko$/i, , false, /^neko$/, /\.neko$/i, /^nek[0o]$/i],
  ["amx-icon", ["medium-blue", "medium-blue"], /\.axs$/i],
  ["amx-icon", ["dark-blue", "dark-blue"], /\.axi$/i],
  ["netlogo-icon", ["medium-red", "medium-red"], /\.nlogo$/i],
  ["nginx-icon", ["medium-green", "medium-green"], /\.nginxconf$/i, , false, , /\.nginx$/i, /^NGINX$|^nginx[\W_ \t]?c[0o]nfigurati[0o]n[\W_ \t]?file$/i],
  ["nib-icon", ["dark-orange", "dark-orange"], /\.nib$/i],
  ["nimrod-icon", ["medium-green", "medium-green"], /\.nim(?:rod)?$/i, , false, , /\.nim$/i, /^Nimrod$/i],
  ["shuriken-icon", ["medium-blue", "medium-blue"], /\.ninja$/i, , false, /^ninja$/, /\.ninja$/i, /^ninja$/i],
  ["nit-icon", ["dark-green", "dark-green"], /\.nit$/i, , false, , /\.nit$/i, /^Nit$/i],
  ["nix-icon", ["medium-cyan", "medium-cyan"], /\.nix$/i, , false, , /\.nix$/i, /^Nix$|^nix[0o]s$/i],
  ["nmap-icon", ["dark-blue", "dark-blue"], /\.nse$/i, , false, , /\.nmap$/i, /^Nmap$/i],
  ["node-icon", ["medium-green", "medium-green"], /\.njs$|\.nvmrc$/i],
  ["node-icon", ["dark-green", "dark-green"], /\.node-version$/i],
  ["nsis-icon", ["medium-purple", "medium-purple"], /\.nsi$/i, , false, /^nsis$/, /\.nsis$/i, /^nsis$/i],
  ["nsis-icon", ["dark-cyan", "dark-cyan"], /\.nsh$/i],
  ["recycle-icon", ["light-green", "light-green"], /\.nu$/i, , false, /^nush$/, /\.nu$/i, /^Nu$|^nush$/i],
  ["recycle-icon", ["dark-green", "dark-green"], /^Nukefile$/],
  ["nuget-icon", ["medium-blue", "medium-blue"], /\.nuspec$/i],
  ["nuget-icon", ["dark-purple", "dark-purple"], /\.pkgproj$/i],
  ["numpy-icon", ["dark-blue", "dark-blue"], /\.numpy$/i],
  ["numpy-icon", ["medium-blue", "medium-blue"], /\.numpyw$/i],
  ["numpy-icon", ["medium-orange", "medium-orange"], /\.numsc$/i],
  ["nunjucks-icon", ["dark-green", "dark-green"], /\.(?:nunjucks|njk)$/i],
  ["objc-icon", ["medium-blue", "medium-blue"], /\.mm?$/i, , false, , /\.objc(?:pp)?$/i, /^Objective-C$|^(?:Obj-?C|ObjectiveC)(?:\+\+)?$/i],
  ["objc-icon", ["dark-red", "dark-red"], /\.pch$/i],
  ["objc-icon", ["dark-green", "dark-green"], /\.x$/i],
  ["objj-icon", ["dark-orange", "dark-orange"], /\.j$/i, , false, , /\.objj$/i, /^Objective-J$|^(?:Obj-?J|ObjectiveJ)$/i],
  ["objj-icon", ["dark-red", "dark-red"], /\.sj$/i],
  ["ocaml-icon", ["medium-orange", "medium-orange"], /\.ml$/i, , false, /ocaml(?:run|script)?/, /\.ocaml$/i, /^OCaml$/i],
  ["ocaml-icon", ["dark-orange", "dark-orange"], /\.mli$/i],
  ["ocaml-icon", ["medium-red", "medium-red"], /\.eliom$/i],
  ["ocaml-icon", ["dark-red", "dark-red"], /\.eliomi$/i],
  ["ocaml-icon", ["medium-green", "medium-green"], /\.ml4$/i],
  ["ocaml-icon", ["dark-green", "dark-green"], /\.mll$/i, , false, /^ocamllex$/, /\.ocamllex$/i, /^OCaml$|^[0o]camllex$/i],
  ["ocaml-icon", ["dark-yellow", "dark-yellow"], /\.mly$/i, , false, /^menhir$/, /\.menhir$/i, /^OCaml$|^menhir$/i],
  ["ooc-icon", ["medium-green", "medium-green"], /\.ooc$/i, , false, , /\.ooc$/i, /^OOC$/i],
  ["opa-icon", ["medium-blue", "medium-blue"], /\.opa$/i, , false, , /\.opa$/i, /^Opa$/i],
  ["opencl-icon", ["medium-red", "medium-red"], /\.opencl$/i, , false, , /\.opencl$/i, /^OpenCL$/i],
  ["progress-icon", ["medium-red", "medium-red"], /\.p$/i, , false, , /\.abl$/i, /^OpenEdge ABL$|^(?:progress|openedge|abl)$/i],
  ["openoffice-icon", ["medium-blue", "medium-blue"], /\.odt$/i],
  ["openoffice-icon", ["dark-blue", "dark-blue"], /\.ott$/i],
  ["openoffice-icon", ["dark-purple", "dark-purple"], /\.fodt$/i],
  ["openoffice-icon", ["medium-green", "medium-green"], /\.ods$/i],
  ["openoffice-icon", ["dark-green", "dark-green"], /\.ots$/i],
  ["openoffice-icon", ["dark-cyan", "dark-cyan"], /\.fods$/i],
  ["openoffice-icon", ["medium-purple", "medium-purple"], /\.odp$/i],
  ["openoffice-icon", ["dark-pink", "dark-pink"], /\.otp$/i],
  ["openoffice-icon", ["medium-pink", "medium-pink"], /\.fodp$/i],
  ["openoffice-icon", ["medium-red", "medium-red"], /\.odg$/i],
  ["openoffice-icon", ["dark-red", "dark-red"], /\.otg$/i],
  ["openoffice-icon", ["dark-orange", "dark-orange"], /\.fodg$/i],
  ["openoffice-icon", ["medium-maroon", "medium-maroon"], /\.odf$/i],
  ["openoffice-icon", ["light-pink", "light-pink"], /\.odb$/i],
  ["scad-icon", ["medium-orange", "medium-orange"], /\.scad$/i, , false, , /\.scad$/i, /^OpenSCAD$/i],
  ["scad-icon", ["medium-yellow", "medium-yellow"], /\.jscad$/i],
  ["org-icon", ["dark-green", "dark-green"], /\.org$/i],
  ["osx-icon", ["medium-red", "medium-red"], /\.dmg$/i, , false, , , , /^\x78\x01\x73\x0D\x62\x62\x60/],
  ["ox-icon", ["medium-cyan", "dark-cyan"], /\.ox$/i, , false, , /\.ox$/i, /^Ox$/i],
  ["ox-icon", ["medium-green", "dark-green"], /\.oxh$/i],
  ["ox-icon", ["medium-blue", "dark-blue"], /\.oxo$/i],
  ["oxygene-icon", ["medium-cyan", "dark-cyan"], /\.oxygene$/i, , false, , /\.oxygene$/i, /^Oxygene$/i],
  ["oz-icon", ["medium-yellow", "medium-yellow"], /\.oz$/i, , false, , /\.oz$/i, /^Oz$/i],
  ["pan-icon", ["medium-red", "medium-red"], /\.pan$/i],
  ["papyrus-icon", ["medium-green", "medium-green"], /\.psc$/i, , false, , /(?:^|\.)(?:papyrus\.skyrim|compiled-?papyrus|papyrus-assembly)(?:\.|$)/i, /^Papyrus$/i],
  ["parrot-icon", ["medium-green", "medium-green"], /\.parrot$/i, , false, /^parrot$/],
  ["parrot-icon", ["dark-green", "dark-green"], /\.pasm$/i, , false, , /\.parrot\.pasm$/i, /^Parrot$|^pasm$/i],
  ["parrot-icon", ["dark-blue", "dark-blue"], /\.pir$/i, , false, , /\.parrot\.pir$/i, /^Parrot$|^pir$/i],
  ["pascal-icon", ["medium-purple", "medium-purple"], /\.pas(?:cal)?$/i, , false, /pascal|instantfpc/, /\.pascal$/i, /^Pascal$/i],
  ["pascal-icon", ["medium-blue", "medium-blue"], /\.dfm$/i],
  ["pascal-icon", ["dark-blue", "dark-blue"], /\.dpr$/i],
  ["pascal-icon", ["dark-purple", "dark-purple"], /\.lpr$/i],
  ["patch-icon", ["medium-green", "medium-green"], /\.patch$/i],
  ["pawn-icon", ["medium-orange", "medium-orange"], /\.pwn$/i, , false, , /\.pwn$/i, /^PAWN$/i],
  ["pdf-icon", ["medium-red", "medium-red"], /\.pdf$/i, , false, , , , /^%PDF/],
  ["perl-icon", ["medium-blue", "medium-blue"], /\.p(?:er)?l$|\.t$/i, , false, /^perl$/, /\.perl$/i, /^perl$/i],
  ["perl-icon", ["dark-purple", "dark-purple"], /\.ph$/i],
  ["perl-icon", ["medium-purple", "medium-purple"], /\.plx$/i],
  ["perl-icon", ["dark-blue", "dark-blue"], /\.pm$/i],
  ["perl-icon", ["medium-red", "medium-red"], /\.(?:psgi|xs)$/i],
  ["perl6-icon", ["medium-purple", "medium-purple"], /\.pl6$/i, , false, /^perl6$/, /(?:^|\.)perl6(?:fe)?(?=\.|$)/, /^(?:pl6|Perl\s*6)$/i],
  ["perl6-icon", ["light-blue", "light-blue"], /\.[tp]6$|\.6pl$/i],
  ["perl6-icon", ["dark-pink", "dark-pink"], /\.(?:pm6|p6m)$/i],
  ["perl6-icon", ["dark-cyan", "dark-cyan"], /\.6pm$/i],
  ["perl6-icon", ["dark-purple", "dark-purple"], /\.nqp$/i],
  ["perl6-icon", ["medium-blue", "medium-blue"], /\.p6l$/i],
  ["perl6-icon", ["dark-green", "dark-green"], /\.pod6$/i],
  ["perl6-icon", ["medium-green", "medium-green"], /^Rexfile$/],
  ["phalcon-icon", ["medium-cyan", "medium-cyan"], /\.volt$/i, , false, , /\.volt$/i, /^Phalcon$/i],
  ["php-icon", ["dark-blue", "dark-blue"], /\.php(?:[st\d]|_cs)?$/i, , false, /^php$/, /\.php$/i, /^PHP$/i, /^<\?php/],
  ["php-icon", ["dark-green", "dark-green"], /^Phakefile/],
  ["pickle-icon", ["dark-cyan", "dark-cyan"], /\.pkl$/i],
  ["pike-icon", ["dark-cyan", "dark-cyan"], /\.pike$/i, , false, /^pike$/],
  ["pike-icon", ["medium-blue", "medium-blue"], /\.pmod$/i],
  ["sql-icon", ["medium-red", "medium-red"], /\.(?:pls|pck|pks|plb|plsql|pkb)$/i, , false, , /\.plsql(?:\.oracle)?(?:\.|$)/i, /^PLSQL$/i],
  ["pod-icon", ["dark-blue", "dark-blue"], /\.pod$/i],
  ["pogo-icon", ["medium-orange", "dark-orange"], /\.pogo$/i, , false, , /\.pogoscript$/i, /^PogoScript$/i],
  ["pony-icon", ["light-maroon", "light-maroon"], /\.pony$/i, , false, , /\.pony$/i, /^Pony$/i],
  ["postcss-icon", ["dark-red", "dark-red"], /\.p(?:ost)?css$/i, , false, /^postcss$/, /\.postcss$/i, /^p[0o]stcss$/i],
  ["postcss-icon", ["dark-pink", "dark-pink"], /\.sss$/i, , false, /^sugarss$/, /\.sugarss$/i, /^PostCSS$|^sugarss$/i],
  ["postcss-icon", ["medium-orange", "dark-orange"], /\.postcssrc$/i],
  ["postscript-icon", ["medium-red", "medium-red"], /\.ps$/i, , false, , /\.postscript$/i, /^PostScript$|^p[0o]stscr$/i, /^%!PS/],
  ["postscript-icon", ["medium-orange", "medium-orange"], /\.eps$/i],
  ["postscript-icon", ["dark-blue", "dark-blue"], /\.pfa$/i],
  ["postscript-icon", ["medium-green", "medium-green"], /\.afm$/i],
  ["povray-icon", ["dark-blue", "dark-blue"], /\.pov$/i],
  ["powerbuilder-icon", ["medium-blue", "medium-blue"], /\.pbl$|\.sra$/i],
  ["powerbuilder-icon", ["dark-blue", "dark-blue"], /\.pbt$/i],
  ["powerbuilder-icon", ["medium-red", "medium-red"], /\.srw$/i],
  ["powerbuilder-icon", ["medium-orange", "medium-orange"], /\.sru$/i],
  ["powerbuilder-icon", ["medium-maroon", "medium-maroon"], /\.srp$/i],
  ["powerbuilder-icon", ["medium-purple", "medium-purple"], /\.srj$/i],
  ["powershell-icon", ["medium-blue", "medium-blue"], /\.ps1$/i, , false, , /\.powershell$/i, /^PowerShell$|^p[0o]sh$/i],
  ["powershell-icon", ["dark-blue", "dark-blue"], /\.psd1$/i],
  ["powershell-icon", ["medium-purple", "medium-purple"], /\.psm1$/i],
  ["powershell-icon", ["dark-purple", "dark-purple"], /\.ps1xml$/i],
  ["print-icon", ["dark-cyan", "dark-cyan"], /\.ppd$/i],
  ["processing-icon", ["dark-blue", "dark-blue"], /\.pde$/i, , false, , /\.processing$/i, /^Processing$/i],
  ["prolog-icon", ["medium-blue", "medium-blue"], /\.pro$/i, , false, /^swipl$/, /\.prolog$/i, /^Prolog$/i],
  ["prolog-icon", ["medium-cyan", "medium-cyan"], /\.prolog$/i],
  ["prolog-icon", ["medium-purple", "medium-purple"], /\.yap$/i, , false, /^yap$/],
  ["propeller-icon", ["medium-orange", "medium-orange"], /\.spin$/i, , false, , /\.spin$/i, /^Propeller Spin$/i],
  ["pug-icon", ["medium-red", "medium-red"], /\.pug$/i, , false, , /\.pug$/i, /^Pug$/i],
  ["puppet-icon", ["medium-purple", "medium-purple"], /\.pp$/i, , false, /^puppet$/, /\.puppet$/i, /^puppet$/i],
  ["puppet-icon", ["dark-blue", "dark-blue"], /Modulefile$/i],
  ["purebasic-icon", ["medium-red", "medium-red"], /\.pb$/i, , false, /^purebasic$/, /\.purebasic$/i, /^purebasic$/i],
  ["purebasic-icon", ["dark-orange", "dark-orange"], /\.pbi$/i],
  ["purescript-icon", ["dark-purple", "dark-purple"], /\.purs$/i, , false, , /\.purescript$/i, /^PureScript$/i],
  ["python-icon", ["dark-blue", "dark-blue"], /\.py$|\.bzl$|\.py3$|\.?(?:pypirc|pythonrc|python-venv)$/i, , false, /python[\d.]*/, /\.python$/i, /^Python$|^rusth[0o]n$/i],
  ["python-icon", ["medium-blue", "medium-blue"], /\.ipy$/i],
  ["python-icon", ["dark-green", "dark-green"], /\.isolate$|\.gypi$|\.pyt$/i],
  ["python-icon", ["medium-orange", "medium-orange"], /\.pep$|\.pyde$/i, , false, /^pep8$/, /\.pep8$/i, /^Python$|^pep8$/i],
  ["python-icon", ["medium-green", "medium-green"], /\.gyp$/i],
  ["python-icon", ["dark-purple", "dark-purple"], /\.pyp$/i],
  ["python-icon", ["medium-maroon", "medium-maroon"], /\.pyw$/i],
  ["python-icon", ["dark-pink", "dark-pink"], /\.tac$/i],
  ["python-icon", ["dark-red", "dark-red"], /\.wsgi$/i],
  ["python-icon", ["medium-yellow", "dark-yellow"], /\.xpy$/i],
  ["python-icon", ["medium-pink", "medium-pink"], /\.rpy$/i, , false, , /\.renpy$/i, /^Python$|^Ren'?Py$/i],
  ["python-icon", ["dark-green", "dark-green"], /^(?:BUCK|BUILD|SConstruct|SConscript)$/],
  ["python-icon", ["medium-green", "medium-green"], /^(?:Snakefile|WATCHLISTS)$/],
  ["python-icon", ["dark-maroon", "dark-maroon"], /^wscript$/],
  ["r-icon", ["medium-blue", "medium-blue"], /\.(?:r|Rprofile|rsx|rd)$/i, , false, /^Rscript$/, /\.r$/i, /^R$|^(?:Rscript|splus|Rlang)$/i],
  ["racket-icon", ["medium-red", "medium-red"], /\.rkt$/i, , false, /^racket$/, /\.racket$/i, /^racket$/i],
  ["racket-icon", ["medium-blue", "medium-blue"], /\.rktd$/i],
  ["racket-icon", ["light-red", "light-red"], /\.rktl$/i],
  ["racket-icon", ["dark-blue", "dark-blue"], /\.scrbl$/i, , false, /^scribble$/, /\.scribble$/i, /^Racket$|^scribble$/i],
  ["raml-icon", ["medium-cyan", "medium-cyan"], /\.raml$/i, , false, , /\.raml$/i, /^RAML$/i],
  ["rascal-icon", ["medium-yellow", "medium-yellow"], /\.rsc$/i, , false, , /\.rascal$/i, /^Rascal$/i],
  ["rdoc-icon", ["medium-red", "medium-red"], /\.rdoc$/i, , false, , /\.rdoc$/i, /^RDoc$/i],
  ["xojo-icon", ["medium-green", "medium-green"], /\.rbbas$/i],
  ["xojo-icon", ["dark-green", "dark-green"], /\.rbfrm$/i],
  ["xojo-icon", ["dark-cyan", "dark-cyan"], /\.rbmnu$/i],
  ["xojo-icon", ["medium-cyan", "medium-cyan"], /\.rbres$/i],
  ["xojo-icon", ["medium-blue", "medium-blue"], /\.rbtbar$/i],
  ["xojo-icon", ["dark-blue", "dark-blue"], /\.rbuistate$/i],
  ["reason-icon", ["medium-red", "medium-red"], /\.re$/i, , false, /^reason$/, /\.reason$/i, /^reas[0o]n$/i],
  ["reason-icon", ["medium-orange", "medium-orange"], /\.rei$/i],
  ["rebol-icon", ["dark-green", "dark-green"], /\.reb(?:ol)?$/i, , false, /^rebol$/, /\.rebol$/i, /^reb[0o]l$/i],
  ["rebol-icon", ["dark-red", "dark-red"], /\.r2$/i],
  ["rebol-icon", ["dark-blue", "dark-blue"], /\.r3$/i],
  ["red-icon", ["medium-red", "medium-red"], /\.red$/i, , false, , /\.red$/i, /^Red$|^red\/?system$/i],
  ["red-icon", ["light-red", "light-red"], /\.reds$/i],
  ["red-hat-icon", ["medium-red", "medium-red"], /\.rpm$/i],
  ["red-hat-icon", ["dark-red", "dark-red"], /\.spec$/i],
  ["regex-icon", ["medium-green", "medium-green"], /\.regexp?$/i, , false, , /(?:\.|^)regexp?(?:\.|$)/i, /^RegExp$/i],
  ["android-icon", ["dark-maroon", "dark-maroon"], /\.rsh$/i],
  ["rst-icon", ["dark-blue", "dark-blue"], /\.re?st(?:\.txt)?$/i, , false, , /\.restructuredtext$/i, /^reStructuredText$|^re?st$/i],
  ["rexx-icon", ["medium-red", "medium-red"], /\.rexx?$/i, , false, /rexx|regina/i, /\.rexx$/i, /^REXX$/i],
  ["rexx-icon", ["medium-blue", "medium-blue"], /\.pprx$/i],
  ["riot-icon", ["medium-red", "medium-red"], /\.tag$/i, , false, , /\.riot$/i, /^RiotJS$/i],
  ["robot-icon", ["medium-purple", "medium-purple"], /\.robot$/i],
  ["clojure-icon", ["medium-red", "medium-red"], /\.rg$/i],
  ["rss-icon", ["medium-orange", "medium-orange"], /\.rss$/i],
  ["ruby-icon", ["medium-red", "medium-red"], /\.(?:rb|ru|ruby|erb|gemspec|god|mspec|pluginspec|podspec|rabl|rake|opal)$|^\.?(?:irbrc|gemrc|pryrc|rspec|ruby-(?:gemset|version))$/i, , false, /(?:mac|j)?ruby|rake|rbx/, /\.ruby$/i, /^Ruby$|^(?:rbx?|rake|jruby|macruby)$/i],
  ["ruby-icon", ["medium-red", "medium-red"], /^(?:Appraisals|(?:Rake|Gem|[bB]uild|Berks|Cap|Danger|Deliver|Fast|Guard|Jar|Maven|Pod|Puppet|Snap)file(?:\.lock)?)$|^rails$/],
  ["ruby-icon", ["dark-red", "dark-red"], /\.(?:jbuilder|rbuild|rb[wx]|builder)$/i],
  ["ruby-icon", ["dark-yellow", "dark-yellow"], /\.watchr$/i],
  ["rust-icon", ["medium-maroon", "medium-maroon"], /\.rs$/i, , false, /^rust$/, /\.rust$/i, /^rust$/i],
  ["rust-icon", ["light-maroon", "light-maroon"], /\.rlib$/i],
  ["sage-icon", ["medium-blue", "medium-blue"], /\.sage$/i, , false, /^sage$/, /\.sage$/i, /^sage$/i],
  ["sage-icon", ["dark-blue", "dark-blue"], /\.sagews$/i],
  ["saltstack-icon", ["medium-blue", "dark-blue"], /\.sls$/i, , false, , /\.salt$/i, /^SaltStack$|^Salt(?:State)?$/i],
  ["sas-icon", ["medium-blue", "medium-blue"], /\.sas$/i, , false, , /\.sas$/i, /^SAS$/i],
  ["sass-icon", ["light-pink", "light-pink"], /\.scss$/i, , false, /^scss$/, /\.scss$/i, /^Sass$|^scss$/i],
  ["sass-icon", ["dark-pink", "dark-pink"], /\.sass$/i, , false, /^sass$/, /\.sass$/i, /^sass$/i],
  ["sbt-icon", ["dark-purple", "dark-purple"], /\.sbt$/i],
  ["scala-icon", ["medium-red", "medium-red"], /\.(?:sc|scala)$/i, , false, /^scala$/, /\.scala$/i, /^Scala$/i],
  ["scheme-icon", ["medium-red", "medium-red"], /\.scm$/i, , false, /guile|bigloo|chicken/, /\.scheme$/i, /^Scheme$/i],
  ["scheme-icon", ["medium-blue", "medium-blue"], /\.sld$/i],
  ["scheme-icon", ["medium-purple", "medium-purple"], /\.sps$/i],
  ["scilab-icon", ["dark-purple", "dark-purple"], /\.sci$/i, , false, /^scilab$/, /\.scilab$/i, /^scilab$/i],
  ["scilab-icon", ["dark-blue", "dark-blue"], /\.sce$/i],
  ["scilab-icon", ["dark-cyan", "dark-cyan"], /\.tst$/i],
  ["secret-icon", [null, null], /\.secret$/i],
  ["self-icon", ["dark-blue", "dark-blue"], /\.self$/i, , false, , /\.self$/i, /^Self$/i],
  ["graph-icon", ["light-red", "light-red"], /\.csv$/i, , false, , /(?:^|\.)csv(?:\.semicolon)?(?:\.|$)/i],
  ["graph-icon", ["light-green", "light-green"], /\.(?:tab|tsv)$/i],
  ["graph-icon", ["medium-green", "medium-green"], /\.dif$/i],
  ["graph-icon", ["medium-cyan", "medium-cyan"], /\.slk$/i],
  ["sf-icon", ["light-orange", "light-orange"], /\.sfproj$/i],
  ["terminal-icon", ["medium-purple", "medium-purple"], /\.(?:sh|rc|bats|bash|tool|install|command)$/i, , false, /bash|sh|zsh|rc/, /\.shell$/i, /^(?:sh|shell|Shell-?Script|Bash)$/i],
  ["terminal-icon", ["dark-purple", "dark-purple"], /^(?:\.?bash(?:rc|[-_]?(?:profile|login|logout|history|prompt))|_osc|config|install-sh|PKGBUILD)$/i],
  ["terminal-icon", ["dark-yellow", "dark-yellow"], /\.ksh$/i],
  ["terminal-icon", ["medium-yellow", "dark-yellow"], /\.sh-session$/i, , false, , /\.shell-session$/i, /^(?:Bash|Shell|Sh)[-\s]*(?:Session|Console)$/i],
  ["terminal-icon", ["medium-blue", "medium-blue"], /\.zsh(?:-theme|_history)?$|^\.?(?:antigen|zpreztorc|zlogin|zlogout|zprofile|zshenv|zshrc)$|\.tmux$/i],
  ["terminal-icon", ["medium-green", "medium-green"], /\.fish$|^\.fishrc$|\.tcsh$/i, , false, /^fish$/, /\.fish$/i, /^fish$/i],
  ["terminal-icon", ["medium-red", "medium-red"], /\.inputrc$/i],
  ["terminal-icon", ["medium-red", "medium-red"], /^(?:configure|config\.(?:guess|rpath|status|sub)|depcomp|libtool|compile)$/],
  ["terminal-icon", ["dark-purple", "dark-purple"], /^\/(?:private\/)?etc\/(?:[^\/]+\/)*(?:profile$|nanorc$|rc\.|csh\.)/i, , true],
  ["terminal-icon", ["medium-yellow", "medium-yellow"], /\.csh$/i],
  ["shen-icon", ["dark-cyan", "dark-cyan"], /\.shen$/i],
  ["shopify-icon", ["medium-green", "medium-green"], /\.liquid$/i],
  ["sigils-icon", ["dark-red", "dark-red"], /\.sigils$/i],
  ["silverstripe-icon", ["medium-blue", "medium-blue"], /\.ss$/i, , false, , /(?:^|\.)ss(?:template)?(?:\.|$)/i, /^SilverStripe$/i],
  ["sketch-icon", ["medium-orange", "medium-orange"], /\.sketch$/i],
  ["slash-icon", ["dark-blue", "dark-blue"], /\.sl$/i, , false, , /\.slash$/i, /^Slash$/i],
  ["android-icon", ["medium-green", "medium-green"], /\.smali$/i, , false, , /\.smali$/i, /^Smali$/i],
  ["smarty-icon", ["medium-yellow", "dark-yellow"], /\.tpl$/i, , false, , /\.smarty$/i, /^Smarty$/i],
  ["snyk-icon", ["dark-purple", "dark-purple"], /\.snyk$/i],
  ["clojure-icon", ["medium-yellow", "dark-yellow"], /\.(?:sma|sp)$/i, , false, , /\.sp$/i, /^SourcePawn$|^s[0o]urcem[0o]d$/i],
  ["sparql-icon", ["medium-blue", "medium-blue"], /\.sparql$/i, , false, , /\.rq$/i, /^SPARQL$/i],
  ["sparql-icon", ["dark-blue", "dark-blue"], /\.rq$/i],
  ["sqf-icon", ["dark-maroon", "dark-maroon"], /\.sqf$/i, , false, /^sqf$/, /\.sqf$/i, /^sqf$/i],
  ["sqf-icon", ["dark-red", "dark-red"], /\.hqf$/i],
  ["sql-icon", ["medium-orange", "medium-orange"], /\.(?:my)?sql$/i, , false, /^sql$/, /\.sql$/i, /^sql$/i],
  ["sql-icon", ["medium-blue", "medium-blue"], /\.ddl$/i],
  ["sql-icon", ["medium-green", "medium-green"], /\.udf$/i],
  ["sql-icon", ["dark-cyan", "dark-cyan"], /\.viw$/i],
  ["sql-icon", ["dark-blue", "dark-blue"], /\.prc$/i],
  ["sql-icon", ["medium-purple", "medium-purple"], /\.db2$/i],
  ["sqlite-icon", ["medium-blue", "medium-blue"], /\.sqlite$/i],
  ["sqlite-icon", ["dark-blue", "dark-blue"], /\.sqlite3$/i],
  ["sqlite-icon", ["medium-purple", "medium-purple"], /\.db$/i],
  ["sqlite-icon", ["dark-purple", "dark-purple"], /\.db3$/i],
  ["squirrel-icon", ["medium-maroon", "medium-maroon"], /\.nut$/i, , false, , /\.nut$/i, /^Squirrel$/i],
  ["key-icon", ["medium-yellow", "medium-yellow"], /\.pub$/i],
  ["key-icon", ["medium-orange", "medium-orange"], /\.pem$/i],
  ["key-icon", ["medium-blue", "medium-blue"], /\.key$|\.crt$/i],
  ["key-icon", ["medium-purple", "medium-purple"], /\.der$/i],
  ["key-icon", ["medium-red", "medium-red"], /^id_rsa/],
  ["key-icon", ["medium-green", "medium-green"], /\.glyphs\d*License$|^git-credential-osxkeychain$/i],
  ["key-icon", ["dark-green", "dark-green"], /^(?:master\.)?passwd$/i],
  ["stan-icon", ["medium-red", "medium-red"], /\.stan$/i, , false, , /\.stan$/i, /^Stan$/i],
  ["stata-icon", ["medium-blue", "medium-blue"], /\.do$/i, , false, /^stata$/, /\.stata$/i, /^stata$/i],
  ["stata-icon", ["dark-blue", "dark-blue"], /\.ado$/i],
  ["stata-icon", ["light-blue", "light-blue"], /\.doh$/i],
  ["stata-icon", ["medium-cyan", "medium-cyan"], /\.ihlp$/i],
  ["stata-icon", ["dark-cyan", "dark-cyan"], /\.mata$/i, , false, /^mata$/, /\.mata$/i, /^Stata$|^mata$/i],
  ["stata-icon", ["light-cyan", "light-cyan"], /\.matah$/i],
  ["stata-icon", ["medium-purple", "medium-purple"], /\.sthlp$/i],
  ["storyist-icon", ["medium-blue", "medium-blue"], /\.story$/i],
  ["strings-icon", ["medium-red", "medium-red"], /\.strings$/i, , false, , /\.strings$/i, /^Strings$/i],
  ["stylus-icon", ["medium-green", "medium-green"], /\.styl$/i, , false, , /\.stylus$/i, /^Stylus$/i],
  ["sublime-icon", ["medium-orange", "medium-orange"], /\.(?:stTheme|sublime[-_](?:build|commands|completions|keymap|macro|menu|mousemap|project|settings|theme|workspace|metrics|session|snippet))$/i],
  ["sublime-icon", ["dark-orange", "dark-orange"], /\.sublime-syntax$/i],
  ["scd-icon", ["medium-red", "medium-red"], /\.scd$/i, , false, /sclang|scsynth/, /\.supercollider$/i, /^SuperCollider$/i],
  ["svg-icon", ["dark-yellow", "dark-yellow"], /\.svg$/i, , false, , /\.svg$/i, /^SVG$/i],
  ["swift-icon", ["light-orange", "light-orange"], /\.swift$/i, , false, , /\.swift$/i, /^Swift$/i],
  ["sysverilog-icon", ["medium-blue", "dark-blue"], /\.sv$/i],
  ["sysverilog-icon", ["medium-green", "dark-green"], /\.svh$/i],
  ["sysverilog-icon", ["medium-cyan", "dark-cyan"], /\.vh$/i],
  ["tag-icon", ["medium-blue", "medium-blue"], /\.?c?tags$/i],
  ["tag-icon", ["medium-red", "medium-red"], /\.gemtags/i],
  ["tcl-icon", ["dark-orange", "dark-orange"], /\.tcl$/i, , false, /tclsh|wish/, /\.tcl$/i, /^Tcl$/i],
  ["tcl-icon", ["medium-orange", "medium-orange"], /\.adp$/i],
  ["tcl-icon", ["medium-red", "medium-red"], /\.tm$/i],
  ["coffee-icon", ["medium-orange", "medium-orange"], /\.tea$/i, , false, , /\.tea$/i, /^Tea$/i],
  ["tt-icon", ["medium-blue", "medium-blue"], /\.tt2?$/i],
  ["tt-icon", ["medium-purple", "medium-purple"], /\.tt3$/i],
  ["tern-icon", ["medium-blue", "medium-blue"], /\.tern-project$/i],
  ["terraform-icon", ["dark-purple", "dark-purple"], /\.tf(?:vars)?$/i, , false, , /\.terra(?:form)?$/i, /^Terraform$/i],
  ["tex-icon", ["medium-blue", "dark-blue"], /\.tex$|\.ltx$|\.lbx$/i, , false, , /(?:^|\.)latex(?:\.|$)/i, /^TeX$|^latex$/i],
  ["tex-icon", ["medium-green", "dark-green"], /\.aux$|\.ins$/i],
  ["tex-icon", ["medium-red", "dark-red"], /\.sty$|\.texi$/i, , false, , /(?:^|\.)tex(?:\.|$)/i, /^TeX$/i],
  ["tex-icon", ["medium-maroon", "dark-maroon"], /\.dtx$/i],
  ["tex-icon", ["medium-orange", "dark-orange"], /\.cls$|\.mkiv$|\.mkvi$|\.mkii$/i],
  ["text-icon", ["medium-blue", "medium-blue"], /\.te?xt$|\.irclog$|\.uot$/i, , false, , , , /^\xEF\xBB\xBF|^\xFF\xFE/],
  ["text-icon", ["medium-maroon", "medium-maroon"], /\.log$|^Terminal[-_\s]Saved[-_\s]Output$|\.brf$/i],
  ["text-icon", ["dark-red", "dark-red"], /\.git[\/\\]description$/, , true],
  ["text-icon", ["medium-red", "medium-red"], /\.err$|\.no$|^(?:bug-report|fdl|for-release|tests)$/i],
  ["text-icon", ["dark-red", "dark-red"], /\.rtf$|\.uof$/i],
  ["text-icon", ["dark-blue", "dark-blue"], /\.i?nfo$/i],
  ["text-icon", ["dark-purple", "dark-purple"], /\.abt$|\.sub$/i],
  ["text-icon", ["dark-orange", "dark-orange"], /\.ans$/i],
  ["text-icon", ["medium-yellow", "medium-yellow"], /\.etx$/i],
  ["text-icon", ["medium-orange", "medium-orange"], /\.msg$/i],
  ["text-icon", ["medium-purple", "medium-purple"], /\.srt$|\.uop$/i],
  ["text-icon", ["medium-cyan", "medium-cyan"], /\.(?:utxt|utf8)$/i],
  ["text-icon", ["medium-green", "medium-green"], /\.weechatlog$|\.uos$/i],
  ["textile-icon", ["medium-orange", "medium-orange"], /\.textile$/i, , false, , /\.textile$/i, /^Textile$/i],
  ["textmate-icon", ["dark-green", "dark-green"], /\.tmcg$/i],
  ["textmate-icon", ["dark-purple", "dark-purple"], /\.tmLanguage$/i],
  ["textmate-icon", ["medium-blue", "medium-blue"], /\.tmCommand$/i],
  ["textmate-icon", ["dark-blue", "dark-blue"], /\.tmPreferences$/i],
  ["textmate-icon", ["dark-orange", "dark-orange"], /\.tmSnippet$/i],
  ["textmate-icon", ["medium-pink", "medium-pink"], /\.tmTheme$/i],
  ["textmate-icon", ["medium-maroon", "medium-maroon"], /\.tmMacro$/i],
  ["textmate-icon", ["medium-orange", "medium-orange"], /\.yaml-tmlanguage$/i],
  ["textmate-icon", ["medium-purple", "medium-purple"], /\.JSON-tmLanguage$/i],
  ["thor-icon", ["medium-orange", "medium-orange"], /\.thor$/i],
  ["thor-icon", ["dark-orange", "dark-orange"], /^Thorfile$/i],
  ["tsx-icon", ["light-blue", "light-blue"], /\.tsx$/i, , false, , /\.tsx$/i, /^TSX$/i],
  ["turing-icon", ["medium-red", "medium-red"], /\.tu$/i, , false, , /\.turing$/i, /^Turing$/i],
  ["twig-icon", ["medium-green", "medium-green"], /\.twig$/i, , false, , /\.twig$/i, /^Twig$/i],
  ["txl-icon", ["medium-orange", "medium-orange"], /\.txl$/i, , false, , /\.txl$/i, /^TXL$/i],
  ["ts-icon", ["medium-blue", "medium-blue"], /\.ts$/i, , false, , /\.ts$/i, /^(?:ts|Type[-\s]*Script)$/i],
  ["unity3d-icon", ["dark-blue", "dark-blue"], /\.anim$/i, , false, /^shaderlab$/, /\.shaderlab$/i, /^Unity3D$|^shaderlab$/i],
  ["unity3d-icon", ["dark-green", "dark-green"], /\.asset$/i],
  ["unity3d-icon", ["medium-red", "medium-red"], /\.mat$/i],
  ["unity3d-icon", ["dark-red", "dark-red"], /\.meta$/i],
  ["unity3d-icon", ["dark-cyan", "dark-cyan"], /\.prefab$/i],
  ["unity3d-icon", ["medium-blue", "medium-blue"], /\.unity$/i],
  ["unity3d-icon", ["medium-maroon", "medium-maroon"], /\.unityproj$/i],
  ["uno-icon", ["dark-blue", "dark-blue"], /\.uno$/i],
  ["unreal-icon", [null, null], /\.uc$/i, , false, , /\.uc$/i, /^UnrealScript$/i],
  ["link-icon", ["dark-blue", "dark-blue"], /\.url$/i],
  ["urweb-icon", ["medium-maroon", "medium-maroon"], /\.ur$/i, , false, , /\.ur$/i, /^UrWeb$|^Ur(?:\/Web)?$/i],
  ["urweb-icon", ["dark-blue", "dark-blue"], /\.urs$/i],
  ["vagrant-icon", ["medium-cyan", "medium-cyan"], /^Vagrantfile$/i],
  ["gnome-icon", ["medium-purple", "medium-purple"], /\.vala$/i, , false, /^vala$/, /\.vala$/i, /^vala$/i],
  ["gnome-icon", ["dark-purple", "dark-purple"], /\.vapi$/i],
  ["varnish-icon", ["dark-blue", "dark-blue"], /\.vcl$/i, , false, , /(?:^|\.)(?:varnish|vcl)(?:\.|$)/i, /^VCL$/i],
  ["verilog-icon", ["dark-green", "dark-green"], /\.v$/i, , false, /^verilog$/, /\.verilog$/i, /^veril[0o]g$/i],
  ["verilog-icon", ["medium-red", "medium-red"], /\.veo$/i],
  ["vhdl-icon", ["dark-green", "dark-green"], /\.vhdl$/i, , false, /^vhdl$/, /\.vhdl$/i, /^vhdl$/i],
  ["vhdl-icon", ["medium-green", "medium-green"], /\.vhd$/i],
  ["vhdl-icon", ["dark-blue", "dark-blue"], /\.vhf$/i],
  ["vhdl-icon", ["medium-blue", "medium-blue"], /\.vhi$/i],
  ["vhdl-icon", ["dark-purple", "dark-purple"], /\.vho$/i],
  ["vhdl-icon", ["medium-purple", "medium-purple"], /\.vhs$/i],
  ["vhdl-icon", ["dark-red", "dark-red"], /\.vht$/i],
  ["vhdl-icon", ["dark-orange", "dark-orange"], /\.vhw$/i],
  ["video-icon", ["medium-blue", "medium-blue"], /\.3gpp?$/i, , false, , , , /^.{4}ftyp3g/],
  ["video-icon", ["dark-blue", "dark-blue"], /\.(?:mp4|m4v|h264)$/i, , false, , , , /^.{4}ftyp/],
  ["video-icon", ["medium-blue", "medium-blue"], /\.avi$/i, , false, , , , /^MLVI/],
  ["video-icon", ["medium-cyan", "medium-cyan"], /\.mov$/i, , false, , , , /^.{4}moov/],
  ["video-icon", ["medium-purple", "medium-purple"], /\.mkv$/i, , false, , , , /^\x1AEß£\x93B\x82\x88matroska/],
  ["video-icon", ["medium-red", "medium-red"], /\.flv$/i, , false, , , , /^FLV\x01/],
  ["video-icon", ["dark-blue", "dark-blue"], /\.webm$/i, , false, , , , /^\x1A\x45\xDF\xA3/],
  ["video-icon", ["medium-red", "medium-red"], /\.mpe?g$/i, , false, , , , /^\0{2}\x01[\xB3\xBA]/],
  ["video-icon", ["dark-purple", "dark-purple"], /\.(?:asf|wmv)$/i, , false, , , , /^0&²u\x8EfÏ\x11¦Ù\0ª\0bÎl/],
  ["video-icon", ["medium-orange", "medium-orange"], /\.(?:ogm|og[gv])$/i, , false, , , , /^OggS/],
  ["vim-icon", ["medium-green", "medium-green"], /\.(?:vim|n?vimrc)$/i, , false, /Vim?/i, /\.viml$/i, /^(?:VimL?|NVim|Vim\s*Script)$/i],
  ["vim-icon", ["dark-green", "dark-green"], /^[gn_]?vim(?:rc|info)$/i],
  ["vs-icon", ["medium-blue", "medium-blue"], /\.(?:vba?|fr[mx]|bas)$/i, , false, , /\.vbnet$/i, /^Visual Studio$|^vb\.?net$/i],
  ["vs-icon", ["medium-red", "medium-red"], /\.vbhtml$/i],
  ["vs-icon", ["medium-green", "medium-green"], /\.vbs$/i],
  ["vs-icon", ["dark-blue", "dark-blue"], /\.csproj$/i],
  ["vs-icon", ["dark-red", "dark-red"], /\.vbproj$/i],
  ["vs-icon", ["dark-purple", "dark-purple"], /\.vcx?proj$/i],
  ["vs-icon", ["dark-green", "dark-green"], /\.vssettings$/i],
  ["vs-icon", ["medium-maroon", "medium-maroon"], /\.builds$/i],
  ["vs-icon", ["medium-orange", "medium-orange"], /\.sln$/i],
  ["vue-icon", ["light-green", "light-green"], /\.vue$/i, , false, , /\.vue$/i, /^Vue$/i],
  ["owl-icon", ["dark-blue", "dark-blue"], /\.owl$/i],
  ["windows-icon", ["medium-purple", "medium-purple"], /\.bat$|\.cmd$/i, , false, , /(?:^|\.)(?:bat|dosbatch)(?:\.|$)/i, /^(?:bat|(?:DOS|Win)?Batch)$/i],
  ["windows-icon", [null, null], /\.(?:exe|com|msi)$/i],
  ["windows-icon", ["medium-blue", "medium-blue"], /\.reg$/i],
  ["x10-icon", ["light-maroon", "light-maroon"], /\.x10$/i, , false, , /\.x10$/i, /^X10$|^xten$/i],
  ["x11-icon", ["medium-orange", "medium-orange"], /\.X(?:authority|clients|initrc|profile|resources|session-errors|screensaver)$/i],
  ["xmos-icon", ["medium-orange", "medium-orange"], /\.xc$/i],
  ["appstore-icon", ["medium-blue", "medium-blue"], /\.(?:pbxproj|pbxuser|mode\dv\3|xcplugindata|xcrequiredplugins)$/i],
  ["xojo-icon", ["medium-green", "medium-green"], /\.xojo_code$/i],
  ["xojo-icon", ["medium-blue", "medium-blue"], /\.xojo_menu$/i],
  ["xojo-icon", ["medium-red", "medium-red"], /\.xojo_report$/i],
  ["xojo-icon", ["dark-green", "dark-green"], /\.xojo_script$/i],
  ["xojo-icon", ["dark-purple", "dark-purple"], /\.xojo_toolbar$/i],
  ["xojo-icon", ["dark-cyan", "dark-cyan"], /\.xojo_window$/i],
  ["xpages-icon", ["medium-blue", "medium-blue"], /\.xsp-config$/i],
  ["xpages-icon", ["dark-blue", "dark-blue"], /\.xsp\.metadata$/i],
  ["xmos-icon", ["dark-blue", "dark-blue"], /\.xpl$/i],
  ["xmos-icon", ["medium-purple", "medium-purple"], /\.xproc$/i],
  ["sql-icon", ["dark-red", "dark-red"], /\.(?:xquery|xq|xql|xqm|xqy)$/i, , false, , /\.xq$/i, /^XQuery$/i],
  ["xtend-icon", ["dark-purple", "dark-purple"], /\.xtend$/i, , false, , /\.xtend$/i, /^Xtend$/i],
  ["yang-icon", ["medium-yellow", "medium-yellow"], /\.yang$/i, , false, , /\.yang$/i, /^YANG$/i],
  ["zbrush-icon", ["dark-purple", "dark-purple"], /\.zpr$/i],
  ["zephir-icon", ["medium-pink", "medium-pink"], /\.zep$/i],
  ["zimpl-icon", ["medium-orange", "medium-orange"], /\.(?:zimpl|zmpl|zpl)$/i],
  ["apple-icon", ["medium-blue", "medium-blue"], /^com\.apple\./, 0.5],
  ["apache-icon", ["medium-red", "medium-red"], /^httpd\.conf/i, 0],
  ["checklist-icon", ["medium-yellow", "medium-yellow"], /TODO/, 0],
  ["config-icon", [null, null], /config|settings|option|pref/i, 0],
  ["doge-icon", ["medium-yellow", "medium-yellow"], /\.djs$/i, 0, false, , /\.dogescript$/i, /^Dogescript$/i],
  ["gear-icon", [null, null], /^\./, 0],
  ["book-icon", ["medium-blue", "medium-blue"], /\b(?:changelog|copying(?:v?\d)?|install|read[-_]?me)\b|^licen[sc]es?[-._]/i, 0],
  ["book-icon", ["dark-blue", "dark-blue"], /^news(?:[-_.]?[-\d]+)?$/i, 0],
  ["v8-icon", ["medium-blue", "medium-blue"], /^(?:[dv]8|v8[-_.][^.]*|mksnapshot|mkpeephole)$/i, 0]],
  [[69, 147, 152, 154, 169, 192, 195, 196, 197, 198, 204, 217, 239, 244, 249, 251, 253, 258, 287, 292, 293, 303, 304, 309, 331, 333, 336, 343, 347, 353, 362, 380, 395, 398, 416, 420, 421, 422, 424, 431, 434, 448, 451, 465, 467, 468, 471, 480, 481, 482, 485, 486, 487, 525, 526, 529, 534, 555, 565, 570, 571, 572, 578, 580, 584, 586, 590, 601, 602, 626, 629, 658, 669, 670, 681, 688, 694, 696, 709, 714, 715, 745, 748, 755, 760, 769, 772, 778, 779, 798, 800, 803, 805, 808, 811, 822, 823, 826, 836, 838, 848, 854, 858, 860, 864, 865, 867, 868, 871, 881, 886, 903, 905, 924, 928, 936, 944, 987, 1000, 1003, 1005, 1023], [42, 57, 69, 105, 120, 121, 124, 126, 129, 143, 145, 147, 149, 151, 152, 154, 156, 157, 158, 166, 167, 169, 174, 192, 194, 195, 196, 197, 198, 204, 206, 210, 211, 213, 215, 216, 217, 223, 224, 225, 229, 230, 234, 236, 237, 238, 239, 242, 243, 244, 249, 251, 253, 255, 256, 258, 275, 285, 286, 287, 288, 290, 291, 292, 293, 294, 295, 297, 300, 301, 303, 304, 309, 312, 314, 326, 330, 336, 341, 342, 343, 346, 347, 350, 351, 352, 353, 359, 362, 365, 380, 381, 382, 383, 386, 390, 392, 394, 395, 398, 400, 416, 422, 439, 440, 442, 448, 451, 452, 453, 454, 458, 461, 463, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 479, 482, 485, 486, 487, 488, 489, 490, 522, 524, 525, 527, 529, 530, 533, 534, 543, 546, 547, 548, 549, 553, 555, 558, 560, 561, 565, 570, 571, 575, 578, 580, 582, 584, 586, 590, 600, 601, 602, 603, 604, 605, 612, 618, 626, 629, 657, 658, 664, 665, 668, 669, 675, 678, 679, 680, 681, 685, 687, 688, 689, 690, 691, 694, 696, 704, 707, 709, 714, 715, 716, 717, 718, 719, 734, 738, 741, 742, 744, 746, 747, 748, 753, 755, 760, 768, 769, 774, 776, 777, 778, 779, 781, 792, 797, 798, 801, 802, 803, 805, 807, 808, 811, 818, 822, 823, 826, 827, 828, 829, 836, 838, 841, 845, 847, 848, 850, 854, 858, 860, 862, 863, 864, 865, 867, 868, 871, 875, 881, 884, 886, 894, 896, 897, 898, 900, 901, 903, 905, 915, 923, 924, 928, 932, 933, 936, 937, 938, 944, 947, 951, 952, 954, 970, 982, 983, 984, 985, 986, 987, 995, 997, 1000, 1002, 1003, 1005, 1023, 1025, 1034, 1036, 1039, 1053, 1054, 1055, 1063], [41, 150, 282, 283, 284, 321, 889, 959], [42, 57, 69, 105, 120, 121, 124, 126, 129, 143, 145, 147, 149, 151, 152, 154, 156, 157, 158, 166, 167, 169, 174, 192, 194, 195, 196, 197, 198, 204, 206, 210, 211, 213, 215, 216, 217, 223, 224, 225, 229, 230, 234, 236, 237, 238, 239, 242, 243, 244, 249, 251, 253, 255, 256, 258, 275, 276, 285, 286, 287, 288, 290, 291, 292, 293, 294, 295, 297, 300, 301, 303, 304, 309, 311, 312, 314, 319, 326, 330, 336, 341, 342, 343, 346, 347, 350, 351, 352, 353, 359, 362, 365, 380, 381, 382, 383, 386, 390, 392, 394, 395, 398, 400, 412, 416, 418, 420, 421, 422, 424, 431, 432, 434, 439, 440, 442, 448, 451, 452, 453, 454, 458, 461, 463, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 479, 480, 481, 482, 483, 485, 486, 487, 488, 489, 490, 522, 524, 525, 527, 529, 530, 533, 534, 543, 546, 547, 548, 549, 553, 555, 558, 560, 561, 565, 570, 571, 575, 578, 580, 582, 584, 586, 590, 600, 601, 602, 603, 604, 605, 612, 618, 626, 629, 657, 658, 660, 661, 664, 665, 668, 669, 675, 678, 679, 680, 681, 685, 687, 688, 689, 690, 691, 694, 696, 704, 707, 709, 714, 715, 716, 717, 718, 719, 734, 738, 741, 742, 744, 746, 747, 748, 753, 755, 760, 768, 769, 774, 776, 777, 778, 779, 781, 792, 797, 798, 801, 802, 803, 805, 807, 808, 811, 818, 822, 823, 826, 827, 828, 829, 836, 838, 841, 845, 847, 848, 850, 854, 858, 860, 862, 863, 864, 865, 867, 868, 871, 875, 876, 881, 884, 886, 894, 896, 897, 898, 900, 901, 903, 905, 915, 923, 924, 928, 932, 933, 936, 937, 938, 944, 947, 951, 952, 954, 970, 982, 983, 984, 985, 986, 987, 995, 997, 1000, 1002, 1003, 1005, 1023, 1025, 1034, 1036, 1039, 1053, 1054, 1055, 1063], [106, 138, 178, 179, 180, 181, 182, 183, 184, 185, 186, 188, 189, 235, 261, 262, 263, 264, 265, 268, 273, 348, 372, 373, 374, 375, 376, 377, 410, 411, 493, 494, 495, 496, 497, 498, 499, 500, 501, 503, 504, 505, 506, 507, 509, 510, 511, 512, 513, 514, 516, 519, 520, 601, 674, 737, 754, 769, 781, 957, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 1021, 1022]]]
];

var cache = {
  directoryName: {},
  directoryPath: {},
  fileName: {},
  filePath: {},
  interpreter: {},
  scope: {},
  language: {},
  signature: {}
};

/* ---------------------------------------------------------------------------
  * Icon
  * ------------------------------------------------------------------------- */

/**
 * Create Icon instance
 *
 * @param {Number}  index - Index of the icon's appearance in the enclosing array
 * @param {Array}   data - icon's data points that contains the following,
 *
 * @property {Icon} icon - Icon's CSS class (e.g., "js-icon")
 * @property {Array} colour - Icon's colour classes
 * @property {RegExp} match - Pattern for matching names or pathnames
 * @property {Numeric} [priority=1] -  priority that determined icon's order of appearance
 * @property {Boolean} [matchPath=false] - Match against system path instead of basename
 * @property {RegExp} [interpreter=null] -  to match executable names in hashbangs
 * @property {RegExp} [scope=null] -  to match grammar scope-names
 * @property {RegExp} [lang=null] -  to match alias patterns
 * @property {RegExp} [sig=null] -  to match file signatures
 *
 * @constructor
 */
class Icon {
  constructor(index, data) {
    this.index = index;
    this.icon = data[0];
    this.colour = data[1];
    this.match = data[2];
    this.priority = data[3] || 1;
    this.matchPath = data[4] || false;
    this.interpreter = data[5] || null;
    this.scope = data[6] || null;
    this.lang = data[7] || null;
    this.signature = data[8] || null;
  }

  /**
   * Return the CSS classes for displaying the icon.
   *
   * @param {Number|null} colourMode
   * @param {Boolean} asArray
   * @return {String}
   */
  getClass(colourMode, asArray) {
    colourMode = colourMode !== undefined ? colourMode : null;
    asArray = asArray !== undefined ? asArray : false;

    // No colour needed or available
    if (colourMode === null || this.colour[0] === null) return asArray ? [this.icon] : this.icon

    return asArray ? [this.icon, this.colour[colourMode]] : this.icon + " " + this.colour[colourMode]
  }
}


/* ---------------------------------------------------------------------------
  * IconTables
  * ------------------------------------------------------------------------- */

/**
 * Create IconTables instance
 *
 * @param {Array}   data - Icons database
 *
 * @property {Array} directoryIcons - Icons to match directory-type resources.
 * @property {Array} fileIcons      - Icons to match file resources.
 * @property {Icon}  binaryIcon     - Icon for binary files.
 * @property {Icon}  executableIcon - Icon for executables.
 * @class
 * @constructor
 */
class IconTables {
  constructor(data) {
    this.directoryIcons = this.read(data[0]);
    this.fileIcons = this.read(data[1]);
    this.binaryIcon = this.matchScope("source.asm");
    this.executableIcon = this.matchInterpreter("bash");
  }

  /**
   * Populate icon-lists from a icons data table.
   *
   * @param {Array} table
   * @return {Object}
   * @private
   */
  read(table) {
    var icons = table[0];
    var indexes = table[1];

    icons = icons.map((icon, index) => new Icon(index, icon));

    // Dereference Icon instances from their stored offset
    indexes = indexes.map(index => index.map(offset => icons[offset]));

    return {
      byName: icons,
      byInterpreter: indexes[0],
      byLanguage: indexes[1],
      byPath: indexes[2],
      byScope: indexes[3],
      bySignature: indexes[4]
    }
  }

  /**
   * Match an icon using a resource's basename.
   *
   * @param {String} name - Name of filesystem entity
   * @param {Boolean} [directory=false] - Match folders instead of files
   * @return {Icon}
   */
  matchName(name, directory) {
    directory = directory !== undefined ? directory : false;
    var cachedIcons = directory ? this.cache.directoryName : cache.fileName;
    var icons = directory ? this.directoryIcons.byName : this.fileIcons.byName;

    if (cachedIcons[name]) return cachedIcons[name]

    for (var i in icons) {
      var icon = icons[i];
      if (icon.match.test(name)) return cachedIcons[name] = icon
    }

    return null
  }

  /**
   * Match an icon using a resource's system path.
   *
   * @param {String} path - Full pathname to check
   * @param {Boolean} [directory=false] - Match folders instead of files
   * @return {Icon}
   */
  matchPath(path, directory) {
    directory = directory !== undefined ? directory : false;
    var cachedIcons = directory ? cache.directoryName : cache.fileName;
    var icons = directory ? this.directoryIcons.byPath : this.fileIcons.byPath;

    if (cachedIcons[name]) return cachedIcons[name]

    for (var i in icons) {
      var icon = icons[i];
      if (icon.match.test(path)) return cachedIcons[path] = icon
    }

    return null
  }

  /**
   * Match an icon using the human-readable form of its related language.
   *
   * Typically used for matching modelines and Linguist-language attributes.
   *
   * @example IconTables.matchLanguage("JavaScript")
   * @param {String} name - Name/alias of language
   * @return {Icon}
   */
  matchLanguage(name) {
    if (cache.language[name]) return cache.language[name]

    for (var i in this.fileIcons.byLanguage) {
      var icon = this.fileIcons.byLanguage[i];
      if (icon.lang.test(name)) return cache.language[name] = icon
    }

    return null
  }

  /**
   * Match an icon using the grammar-scope assigned to it.
   *
   * @example IconTables.matchScope("source.js")
   * @param {String} name
   * @return {Icon}
   */
  matchScope(name) {
    if (cache.scope[name]) return cache.scope[name]

    for (var i in this.fileIcons.byScope) {
      var icon = this.fileIcons.byScope[i];
      if (icon.scope.test(name)) return cache.scope[name] = icon
    }

    return null
  }

  /**
   * Match an icon using the name of an interpreter which executes its language.
   *
   * Used for matching interpreter directives (a.k.a., "hashbangs").
   *
   * @example IconTables.matchInterpreter("bash")
   * @param {String} name
   * @return {Icon}
   */
  matchInterpreter(name) {
    if (cache.interpreter[name]) return cache.interpreter[name]

    for (var i in this.fileIcons.byInterpreter) {
      var icon = this.fileIcons.byInterpreter[i];
      if (icon.interpreter.test(name)) return cache.interpreter[name] = icon
    }

    return null
  }

  /**
   * Match an icon using a resource's file signature.
   *
   * @example IconTables.matchSignature("\x1F\x8B")
   * @param {String} data
   * @return {Icon}
   */
  matchSignature(data) { }
}

/* ---------------------------------------------------------------------------
 * FileIcons
 * ------------------------------------------------------------------------- */

const db = new IconTables(icondb);

/**
 * Get icon class name of the provided filename. If not found, default to text icon.
 *
 * @param {string} name - file name
 * @return {string}
 * @public
 */
const getClass = (name, match = db.matchName(name)) => match ? match.getClass() : null;


/**
 * Get icon class name of the provided filename with color. If not found, default to text icon.
 *
 * @param {string} name - file name
 * @return {string}
 * @public
 */
const getClassWithColor = (name, match = db.matchName(name)) => match ? match.getClass(0) : null;

var fileIcons = /*#__PURE__*/Object.freeze({
  __proto__: null,
  db: db,
  getClass: getClass,
  getClassWithColor: getClassWithColor
});

// Because the sidebar also use the file icons, So I put this file out of floatBox directory.
console.log('import file icon: ', fileIcons);

var css_248z = ".ag-list-picker {\n  width: 140px;\n  max-height: 156px;\n  padding: 8px 0;\n  overflow-y: auto;\n  box-sizing: border-box;\n  font-size: 14px;\n}\n\n.ag-list-picker ul,\n.ag-list-picker li {\n  margin: 0;\n  padding: 0;\n}\n\n.ag-list-picker .item {\n  height: 28px;\n  display: flex;\n  list-style: none;\n}\n\n.ag-list-picker:hover .active {\n  background: transparent;\n}\n\n.ag-list-picker .item .language {\n  color: var(--editorColor);\n}\n\n.ag-list-picker .item:hover,\n.ag-list-picker .item.active {\n background-color: var(--floatHoverColor);\n}\n\n.ag-list-picker .item .icon-wrapper {\n  width: 28px;\n  height: 28px;\n  display: flex;\n  justify-content: space-around;\n  align-items: center;\n}\n\n.ag-list-picker .item .icon-wrapper span:before {\n  font-size: 14px;\n}\n\n.ag-list-picker .icon-wrapper > svg {\n  width: 14px;\n  height: 14px;\n  fill: var(--iconColor);\n}\n\n.ag-list-picker .item .icon-wrapper img {\n  width: 14px;\n  height: 14px;\n}\n\n.ag-list-picker .item .language {\n  color: var(--editorColor);\n  font-size: 14px;\n  line-height: 28px;\n  margin-left: 5px;\n}\n";
styleInject(css_248z);

const defaultOptions = {
  placement: 'bottom-start',
  modifiers: {
    offset: {
      offset: '0, 0'
    }
  },
  showArrow: false
};

class CodePicker extends BaseScrollFloat {
  constructor(muya, options = {}) {
    const name = 'ag-list-picker';
    const opts = Object.assign({}, defaultOptions, options);
    super(muya, name, opts);
    this.renderArray = [];
    this.oldVnode = null;
    this.activeItem = null;
    this.listen();
  }

  listen() {
    super.listen();
    const {
      eventCenter
    } = this.muya;
    eventCenter.subscribe('muya-code-picker', ({
      reference,
      lang,
      cb
    }) => {
      const modes = search(lang);

      if (modes.length && reference) {
        this.show(reference, cb);
        this.renderArray = modes;
        this.activeItem = modes[0];
        this.render();
      } else {
        this.hide();
      }
    });
  }

  render() {
    const {
      renderArray,
      oldVnode,
      scrollElement,
      activeItem
    } = this;
    let children = renderArray.map(item => {
      let iconClassNames;

      if (item.ext && Array.isArray(item.ext)) {
        for (const ext of item.ext) {
          iconClassNames = fileIcons.getClassWithColor(`fackname.${ext}`);
          if (iconClassNames) break;
        }
      } else if (item.name) {
        iconClassNames = fileIcons.getClassWithColor(item.name);
      } // Because `markdown mode in Codemirror` don't have extensions.
      // if still can not get the className, add a common className 'atom-icon light-cyan'


      if (!iconClassNames) {
        iconClassNames = item.name === 'markdown' ? fileIcons.getClassWithColor('fackname.md') : 'atom-icon light-cyan';
      }

      const iconSelector = 'span' + iconClassNames.split(/\s/).map(s => `.${s}`).join('');
      const icon = h('div.icon-wrapper', h(iconSelector));
      const text = h('div.language', item.name);
      const selector = activeItem === item ? 'li.item.active' : 'li.item';
      return h(selector, {
        dataset: {
          label: item.name
        },
        on: {
          click: () => {
            this.selectItem(item);
          }
        }
      }, [icon, text]);
    });

    if (children.length === 0) {
      children = h('div.no-result', 'No result');
    }

    const vnode = h('ul', children);

    if (oldVnode) {
      patch(oldVnode, vnode);
    } else {
      patch(scrollElement, vnode);
    }

    this.oldVnode = vnode;
  }

  getItemElement(item) {
    const {
      name
    } = item;
    return this.floatBox.querySelector(`[data-label="${name}"]`);
  }

}

CodePicker.pluginName = 'codePicker';

module.exports = CodePicker;
//# sourceMappingURL=index.js.map
