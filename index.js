'use strict';

var index = require('indexof');

var whitespaceRegexp = /\s+/;
var __toString = Object.prototype.toString;
var __slice = Array.prototype.slice;


/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element|NodeList|Array} el
 * @return {ClassList|Collection}
 * @api public
 */

module.exports = function(el) {
  if ('[object NodeList]' === __toString.call(el)) {
    el = __slice.call(el);
  }

  if ('[object Array]' === __toString.call(el)) {
    return new Collection(el);
  }

  return new ClassList(el);
};

/**
 * Initialize a ClassList collection for `elmts`
 *
 * @param {Array} elmts
 * @api private
 */

function Collection(elmts) {
  var classListProto = ClassList.prototype;
  var collectionProto = Collection.prototype;

  this.lists = elmts.map(function(el) {
    return new ClassList(el);
  });

  for (var propName in classListProto) {
    if (classListProto.hasOwnProperty(propName)) {
      collectionProto[propName] = (function(self, fnName) {
        return function() {
          var args = arguments;
          var i = self.lists.length;
          var arr = [];
          var item;

          while (i--) {
            item = self.lists[i];
            arr.push(item[fnName].apply(item, args));
          }

          return ('array' === fnName || 'has' === fnName)
            ? arr
            : self;
        };
      }(this, propName));
    }
  }
}

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el) {
    throw new Error('A DOM element reference is required');
  }

  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name) {
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);

  if (!~i) {
    arr.push(name);
  }

  this.el.className = arr.join(' ');

  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name) {
  if ('[object RegExp]' === __toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);

  if (~i) {
    arr.splice(i, 1);
  }

  this.el.className = arr.join(' ');

  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re) {
  var arr = this.array();
  var len = arr.length;

  for (var i = 0; i < len; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }

  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name) {
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    this.remove(name);
  } else {
    this.add(name);
  }

  return this;
};

/**
 * Swap `classA` for `classB`.
 *
 * @param {String} oldClass
 * @param {String} newClass
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.swap = function(oldClass, newClass){
  return this.remove(oldClass).add(newClass);
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function() {
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(whitespaceRegexp);

  if ('' === arr[0]) {
    arr.shift();
  }

  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name) {
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};
