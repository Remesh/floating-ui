import { useRef, useState, useMemo, useLayoutEffect, useCallback } from 'react';
import { computePosition, arrow as arrow$1 } from '@floating-ui/core';
export { autoPlacement, detectOverflow, flip, hide, inline, limitShift, offset, shift, size } from '@floating-ui/core';
import { Dimensions } from 'react-native';

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
      } = Dimensions.get('window');
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
  const reference = useRef();
  const floating = useRef();
  const offsetParent = useRef();
  const [data, setData] = useState({
    x: null,
    y: null,
    placement,
    strategy: 'absolute',
    middlewareData: {}
  });
  const [scrollOffsets, setScrollOffsets] = useState(ORIGIN);
  const platform = useMemo(() => createPlatform({
    offsetParent,
    scrollOffsets,
    sameScrollView
  }), [offsetParent, scrollOffsets, sameScrollView]);
  const [latestMiddleware, setLatestMiddleware] = useState(middleware);

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

  const animationFrames = useRef([]);
  const isMountedRef = useRef(true);
  useLayoutEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  const update = useCallback(() => {
    if (!reference.current || !floating.current) {
      return;
    }

    computePosition(reference.current, floating.current, {
      middleware: latestMiddleware,
      platform,
      placement
    }).then(data => {
      if (isMountedRef.current) {
        setData(data);
      }
    });
  }, [latestMiddleware, platform, placement]);
  useLayoutEffect(() => {
    const frames = animationFrames.current;
    frames.push(requestAnimationFrame(update));
    return () => {
      frames.forEach(cancelAnimationFrame);
      animationFrames.current = [];
    };
  }, [update]);
  const setReference = useCallback(node => {
    reference.current = node;
    animationFrames.current.push(requestAnimationFrame(update));
  }, [update]);
  const setFloating = useCallback(node => {
    floating.current = node;
    animationFrames.current.push(requestAnimationFrame(update));
  }, [update]);
  const setOffsetParent = useCallback(node => {
    offsetParent.current = node;
    animationFrames.current.push(requestAnimationFrame(update));
  }, [update]);
  const refs = useMemo(() => ({
    reference,
    floating,
    offsetParent
  }), []);
  return useMemo(() => ({ ...data,
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
          return arrow$1({
            element: element.current,
            padding
          }).fn(args);
        }

        return {};
      } else if (element) {
        return arrow$1({
          element,
          padding
        }).fn(args);
      }

      return {};
    }

  };
};

export { arrow, useFloating };
