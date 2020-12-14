import { checkZoomBounds, handleCalculatePositions } from "../zoom/utils";
import { handleCalculateBounds } from "../zoom";
import { getDistance, roundNumber } from "../utils";
function round(number, decimal) {
    var roundNumber = Math.pow(10, decimal);
    return Math.round(number * roundNumber) / roundNumber;
}
function getCurrentDistance(event) {
    return getDistance(event.touches[0], event.touches[1]);
}
function checkIfInfinite(number) {
    return number === Infinity || number === -Infinity;
}
export function calculatePinchZoom(currentDistance, pinchStartDistance) {
    var _a = this.stateProvider, _b = _a.options, minScale = _b.minScale, maxScale = _b.maxScale, _c = _a.scalePadding, size = _c.size, disabled = _c.disabled;
    if (typeof pinchStartDistance !== "number" ||
        typeof currentDistance !== "number")
        return console.error("Pinch touches distance was not provided");
    if (currentDistance < 0)
        return;
    var touchProportion = currentDistance / pinchStartDistance;
    var scaleDifference = touchProportion * this.pinchStartScale;
    return checkZoomBounds(roundNumber(scaleDifference, 2), minScale, maxScale, size, !disabled);
}
export function calculateMidpoint(event, scale, contentComponent) {
    var contentRect = contentComponent.getBoundingClientRect();
    var touches = event.touches;
    var firstPointX = round(touches[0].clientX - contentRect.left, 5);
    var firstPointY = round(touches[0].clientY - contentRect.top, 5);
    var secondPointX = round(touches[1].clientX - contentRect.left, 5);
    var secondPointY = round(touches[1].clientY - contentRect.top, 5);
    return {
        mouseX: (firstPointX + secondPointX) / 2 / scale,
        mouseY: (firstPointY + secondPointY) / 2 / scale,
    };
}
export function handleZoomPinch(event) {
    var _a = this.stateProvider, scale = _a.scale, _b = _a.options, limitToBounds = _b.limitToBounds, limitToWrapper = _b.limitToWrapper, _c = _a.scalePadding, disabled = _c.disabled, size = _c.size, limitsOnWheel = _a.wheel.limitsOnWheel, pinch = _a.pinch;
    var contentComponent = this.state.contentComponent;
    if (pinch.disabled || this.stateProvider.options.disabled)
        return;
    if (event.cancelable) {
        event.preventDefault();
        event.stopPropagation();
    }
    // if one finger starts from outside of wrapper
    if (this.pinchStartDistance === null)
        return;
    // Position transformation
    var _d = calculateMidpoint(event, scale, contentComponent), mouseX = _d.mouseX, mouseY = _d.mouseY;
    // if touches goes off of the wrapper element
    if (checkIfInfinite(mouseX) || checkIfInfinite(mouseY))
        return;
    var currentDistance = getCurrentDistance(event);
    var newScale = calculatePinchZoom.call(this, currentDistance, this.pinchStartDistance);
    if (checkIfInfinite(newScale) || newScale === scale)
        return;
    // Get new element sizes to calculate bounds
    var bounds = handleCalculateBounds.call(this, newScale, limitToWrapper);
    // Calculate transformations
    var isLimitedToBounds = limitToBounds && (disabled || size === 0 || limitsOnWheel);
    var _e = handleCalculatePositions.call(this, mouseX, mouseY, newScale, bounds, isLimitedToBounds), x = _e.x, y = _e.y;
    this.lastDistance = currentDistance;
    this.stateProvider.positionX = x;
    this.stateProvider.positionY = y;
    this.stateProvider.scale = newScale;
    this.stateProvider.previousScale = scale;
    // update component transformation
    this.applyTransformation();
}
//# sourceMappingURL=index.js.map