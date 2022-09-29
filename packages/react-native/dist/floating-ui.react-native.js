'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');
var core = require('@floating-ui/core');
var reactNative = require('react-native');

const ORIGIN$1 = {
  x: 0,
  y: 0
};
const createPlatform = _ref => {
  let {
    offsetParent,
    sameScrollView = true,
    scrollOffsets = ORIGIN$1
  } = _ref;
  return {
    getElementRects(_ref2) {
      let {
        reference,
        floating
      } = _ref2;
      return new Promise(resolve => {
        const onMeasure = function (offsetX, offsetY) {
          if (offsetX === void 0) {
            offsetX = 0;
          }

          if (offsetY === void 0) {
            offsetY = 0;
          }

          floating.measure((x, y, width, height) => {
            const floatingRect = {
              width,
              height,
              ...ORIGIN$1
            };
            const method = sameScrollView ? 'measure' : 'measureInWindow';
            reference[method]((x, y, width, height) => {
              const referenceRect = {
                width,
                height,
                x: x - offsetX,
                y: y - offsetY
              };
              resolve({
                reference: referenceRect,
                floating: floatingRect
              });
            });
          });
        };

        if (offsetParent.current) {
          offsetParent.current.measure(onMeasure);
        } else {
          onMeasure();
        }
      });
    },

    getClippingRect() {
      const {
        width,
        height
      } = reactNative.Dimensions.get('window');
      return Promise.resolve({
        width,
        height,
        ...(sameScrollView ? scrollOffsets : ORIGIN$1)
      });
    },

    convertOffsetParentRelativeRectToViewportRelativeRect(_ref3) {
      let {
        rect
      } = _ref3;
      return new Promise(resolve => {
        const onMeasure = function (offsetX, offsetY) {
          if (offsetX === void 0) {
            offsetX = 0;
          }

          if (offsetY === void 0) {
            offsetY = 0;
          }

          resolve({ ...rect,
            x: rect.x + offsetX,
            y: rect.y + offsetY
          });
        };

        if (offsetParent.current) {
          offsetParent.current.measure(onMeasure);
        } else {
          onMeasure();
        }
      });
    },

    getDimensions: element => new Promise(resolve => element.measure((x, y, width, height) => resolve({
      width,
      height
    })))
  };
};

// Fork of `fast-deep-equal` that only does the comparisons we need and compares
// functions
function deepEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (typeof a === 'function' && a.toString() === b.toString()) {
    return true;
  }

  let length, i, keys;

  if (a && b && typeof a == 'object') {
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;

      for (i = length; i-- !== 0;) {
        if (!deepEqual(a[i], b[i])) {
          return false;
        }
      }

      return true;
    }

    keys = Object.keys(a);
    length = keys.length;

    if (length !== Object.keys(b).length) {
      return false;
    }

    for (i = length; i-- !== 0;) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) {
        return false;
      }
    }

    for (i = length; i-- !== 0;) {
      const key = keys[i];

      if (key === '_owner' && a.$$typeof) {
        continue;
      }

      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  return a !== a && b !== b;
}

const ORIGIN = {
  x: 0,
  y: 0
};
const useFloating = function (_temp) {
  let {
    placement = 'bottom',
    middleware,
    sameScrollView = true
  } = _temp === void 0 ? {} : _temp;
  const reference = react.useRef();
  const floating = react.useRef();
  const offsetParent = react.useRef();
  const [data, setData] = react.useState({
    x: null,
    y: null,
    placement,
    strategy: 'absolute',
    middlewareData: {}
  });
  const [scrollOffsets, setScrollOffsets] = react.useState(ORIGIN);
  const platform = react.useMemo(() => createPlatform({
    offsetParent,
    scrollOffsets,
    sameScrollView
  }), [offsetParent, scrollOffsets, sameScrollView]);
  const [latestMiddleware, setLatestMiddleware] = react.useState(middleware);

  if (!deepEqual(latestMiddleware == null ? void 0 : latestMiddleware.map(_ref => {
    let {
      name,
      options
    } = _ref;
    return {
      name,
      options
    };
  }), middleware == null ? void 0 : middleware.map(_ref2 => {
    let {
      name,
      options
    } = _ref2;
    return {
      name,
      options
    };
  }))) {
    setLatestMiddleware(middleware);
  }

  const animationFrames = react.useRef([]);
  const isMountedRef = react.useRef(true);
  react.useLayoutEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const update = react.useCallback(() => {
    if (!reference.current || !floating.current) {
      return;
    }

    core.computePosition(reference.current, floating.current, {
      middleware: latestMiddleware,
      platform,
      placement
    }).then(data => {
      if (isMountedRef.current) {
        setData(data);
      }
    });
  }, [latestMiddleware, platform, placement]);
  react.useLayoutEffect(() => {
    const frames = animationFrames.current;
    frames.push(requestAnimationFrame(update));
    return () => {
      frames.forEach(cancelAnimationFrame);
      animationFrames.current = [];
    };
  }, [update]);
  const setReference = react.useCallback(node => {
    reference.current = node;
    animationFrames.current.push(requestAnimationFrame(update));
  }, [update]);
  const setFloating = react.useCallback(node => {
    floating.current = node;
    animationFrames.current.push(requestAnimationFrame(update));
  }, [update]);
  const setOffsetParent = react.useCallback(node => {
    offsetParent.current = node;
    animationFrames.current.push(requestAnimationFrame(update));
  }, [update]);
  const refs = react.useMemo(() => ({
    reference,
    floating,
    offsetParent
  }), []);
  return react.useMemo(() => ({ ...data,
    update,
    refs,
    offsetParent: setOffsetParent,
    reference: setReference,
    floating: setFloating,
    scrollProps: {
      onScroll: event => setScrollOffsets(event.nativeEvent.contentOffset),
      scrollEventThrottle: 16
    }
  }), [data, refs, setReference, setFloating, setOffsetParent, update]);
};
const arrow = options => {
  const {
    element,
    padding
  } = options;

  function isRef(value) {
    return Object.prototype.hasOwnProperty.call(value, 'current');
  }

  return {
    name: 'arrow',
    options,

    fn(args) {
      if (isRef(element)) {
        if (element.current != null) {
          return core.arrow({
            element: element.current,
            padding
          }).fn(args);
        }

        return {};
      } else if (element) {
        return core.arrow({
          element,
          padding
        }).fn(args);
      }

      return {};
    }

  };
};

Object.defineProperty(exports, 'autoPlacement', {
  enumerable: true,
  get: function () { return core.autoPlacement; }
});
Object.defineProperty(exports, 'detectOverflow', {
  enumerable: true,
  get: function () { return core.detectOverflow; }
});
Object.defineProperty(exports, 'flip', {
  enumerable: true,
  get: function () { return core.flip; }
});
Object.defineProperty(exports, 'hide', {
  enumerable: true,
  get: function () { return core.hide; }
});
Object.defineProperty(exports, 'inline', {
  enumerable: true,
  get: function () { return core.inline; }
});
Object.defineProperty(exports, 'limitShift', {
  enumerable: true,
  get: function () { return core.limitShift; }
});
Object.defineProperty(exports, 'offset', {
  enumerable: true,
  get: function () { return core.offset; }
});
Object.defineProperty(exports, 'shift', {
  enumerable: true,
  get: function () { return core.shift; }
});
Object.defineProperty(exports, 'size', {
  enumerable: true,
  get: function () { return core.size; }
});
exports.arrow = arrow;
exports.useFloating = useFloating;
