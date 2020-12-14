var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/**
 * Rounds number to given decimal
 * eg. roundNumber(2.34343, 1) => 2.3
 */
export var roundNumber = function (num, decimal) {
    return Number(num.toFixed(decimal));
};
/**
 * Checks if value is number, if not it returns default value
 * 1# eg. checkIsNumber(2, 30) => 2
 * 2# eg. checkIsNumber(null, 30) => 30
 */
export var checkIsNumber = function (num, defaultValue) {
    return typeof num === "number" ? num : defaultValue;
};
/**
 * Keeps value between given bounds, used for limiting view to given boundaries
 * 1# eg. boundLimiter(2, 0, 3, true) => 2
 * 2# eg. boundLimiter(4, 0, 3, true) => 3
 * 3# eg. boundLimiter(-2, 0, 3, true) => 0
 * 4# eg. boundLimiter(10, 0, 3, false) => 10
 */
export var boundLimiter = function (value, minBound, maxBound, isActive) {
    if (!isActive)
        return roundNumber(value, 2);
    if (value < minBound)
        return roundNumber(minBound, 2);
    if (value > maxBound)
        return roundNumber(maxBound, 2);
    return roundNumber(value, 2);
};
/**
 * Returns relative coords of mouse on wrapper element, and provides
 * info about it's width, height, with same info about its content(zoomed component) element
 */
export var relativeCoords = function (event, wrapperComponent, contentComponent, panningCase) {
    var wrapperWidth = wrapperComponent.offsetWidth;
    var wrapperHeight = wrapperComponent.offsetHeight;
    var contentRect = contentComponent.getBoundingClientRect();
    var contentWidth = contentRect.width;
    var contentHeight = contentRect.height;
    var contentLeft = contentRect.left;
    var contentRight = contentRect.right;
    var diffHeight = wrapperHeight - contentHeight;
    var diffWidth = wrapperWidth - contentWidth;
    // mouse position x, y over wrapper component
    var x = panningCase ? event.clientX : event.clientX - contentRect.left;
    var y = panningCase ? event.clientY : event.clientY - contentRect.top;
    // Mobile touch event case
    if (isNaN(x) && event.touches && event.touches[0]) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
    }
    return {
        x: x,
        y: y,
        wrapperWidth: wrapperWidth,
        wrapperHeight: wrapperHeight,
        contentWidth: contentWidth,
        contentHeight: contentHeight,
        diffHeight: diffHeight,
        diffWidth: diffWidth,
        contentLeft: contentLeft,
        contentRight: contentRight,
    };
};
/**
 * Calculate bounding area of zoomed/panned element
 */
export var calculateBoundingArea = function (wrapperWidth, newContentWidth, diffWidth, wrapperHeight, newContentHeight, diffHeight, limitToWrapper) {
    var scaleWidthFactor = wrapperWidth > newContentWidth
        ? diffWidth * (limitToWrapper ? 1 : 0.5)
        : 0;
    var scaleHeightFactor = wrapperHeight > newContentHeight
        ? diffHeight * (limitToWrapper ? 1 : 0.5)
        : 0;
    var minPositionX = wrapperWidth - newContentWidth - scaleWidthFactor;
    var maxPositionX = scaleWidthFactor;
    var minPositionY = wrapperHeight - newContentHeight - scaleHeightFactor;
    var maxPositionY = scaleHeightFactor;
    return { minPositionX: minPositionX, maxPositionX: maxPositionX, minPositionY: minPositionY, maxPositionY: maxPositionY };
};
/**
 * Returns middle coordinates x,y of two points
 * Used to get middle point of two fingers pinch
 */
export var getMiddleCoords = function (firstPoint, secondPoint, contentComponent, scale) {
    var contentRect = contentComponent.getBoundingClientRect();
    return {
        x: ((firstPoint.clientX + secondPoint.clientX) / 2 - contentRect.left) /
            scale,
        y: ((firstPoint.clientY + secondPoint.clientY) / 2 - contentRect.top) /
            scale,
    };
};
/**
 * Returns middle position of PageX for touch events
 */
export var getMidPagePosition = function (firstPoint, secondPoint) {
    if (!firstPoint || !secondPoint)
        return console.warn("There are no points provided");
    return {
        x: (firstPoint.clientX + secondPoint.clientX) / 2,
        y: (firstPoint.clientY + secondPoint.clientY) / 2,
    };
};
/**
 * Returns distance between two points x,y
 */
export var getDistance = function (firstPoint, secondPoint) {
    return Math.sqrt(Math.pow(firstPoint.pageX - secondPoint.pageX, 2) +
        Math.pow(firstPoint.pageY - secondPoint.pageY, 2));
};
/**
 * Delete undefined values from object keys
 * Used for deleting empty props
 */
export var deleteUndefinedProps = function (value) {
    var newObject = __assign({}, value);
    Object.keys(newObject).forEach(function (key) { return newObject[key] === undefined && delete newObject[key]; });
    return newObject;
};
/**
 * Returns center zoom position, for computations, based on the relative center to content node
 */
export var getRelativeZoomCoords = function (_a) {
    var wrapperComponent = _a.wrapperComponent, contentComponent = _a.contentComponent, scale = _a.scale, positionX = _a.positionX, positionY = _a.positionY;
    var _b = relativeCoords(event, wrapperComponent, contentComponent, true), wrapperWidth = _b.wrapperWidth, wrapperHeight = _b.wrapperHeight;
    var x = (Math.abs(positionX) + wrapperWidth / 2) / scale;
    var y = (Math.abs(positionY) + wrapperHeight / 2) / scale;
    return { x: x, y: y };
};
/**
 * Fire callback if it's function
 */
export var handleCallback = function (callback, props) {
    if (callback && typeof callback === "function") {
        callback(props);
    }
};
export var handleWheelStop = function (previousEvent, event, stateProvider) {
    var scale = stateProvider.scale, _a = stateProvider.options, maxScale = _a.maxScale, minScale = _a.minScale;
    if (!previousEvent)
        return false;
    if (scale < maxScale || scale > minScale)
        return true;
    if (Math.sign(previousEvent.deltaY) !== Math.sign(event.deltaY))
        return true;
    if (previousEvent.deltaY > 0 && previousEvent.deltaY < event.deltaY)
        return true;
    if (previousEvent.deltaY < 0 && previousEvent.deltaY > event.deltaY)
        return true;
    if (Math.sign(previousEvent.deltaY) !== Math.sign(event.deltaY))
        return true;
    return false;
};
export var mergeProps = function (initialState, dynamicProps) {
    return Object.keys(initialState).reduce(function (acc, curr) {
        if (typeof dynamicProps[curr] === "object" && dynamicProps[curr] !== null) {
            acc[curr] = __assign(__assign({}, initialState[curr]), dynamicProps[curr]);
        }
        else {
            acc[curr] =
                dynamicProps[curr] === undefined
                    ? initialState[curr]
                    : dynamicProps[curr];
        }
        return acc;
    }, {});
};
export function getWindowScaleY(wrapper) {
    if (!wrapper)
        return 0;
    return window.innerHeight / wrapper.offsetHeight;
}
export function getWindowScaleX(wrapper) {
    if (!wrapper)
        return 0;
    return window.innerWidth / wrapper.offsetWidth;
}
//# sourceMappingURL=utils.js.map