import { boundLimiter, checkIsNumber } from "../utils";
export function checkZoomBounds(zoom, minScale, maxScale, zoomPadding, enablePadding) {
    var scalePadding = enablePadding ? zoomPadding : 0;
    var minScaleWithPadding = minScale - scalePadding;
    if (!isNaN(maxScale) && zoom >= maxScale)
        return maxScale;
    if (!isNaN(minScale) && zoom <= minScaleWithPadding)
        return minScaleWithPadding;
    return zoom;
}
export function checkPositionBounds(positionX, positionY, bounds, limitToBounds, paddingValue, wrapperComponent) {
    var minPositionX = bounds.minPositionX, minPositionY = bounds.minPositionY, maxPositionX = bounds.maxPositionX, maxPositionY = bounds.maxPositionY;
    var paddingX = wrapperComponent
        ? (paddingValue * wrapperComponent.offsetWidth) / 100
        : 0;
    var paddingY = wrapperComponent
        ? (paddingValue * wrapperComponent.offsetHeight) / 100
        : 0;
    var x = boundLimiter(positionX, minPositionX - paddingX, maxPositionX + paddingX, limitToBounds);
    var y = boundLimiter(positionY, minPositionY - paddingY, maxPositionY + paddingY, limitToBounds);
    return { x: x, y: y };
}
export function getDelta(event, customDelta) {
    var deltaY = event ? (event.deltaY < 0 ? 1 : -1) : 0;
    var delta = checkIsNumber(customDelta, deltaY);
    return delta;
}
export function wheelMousePosition(event, contentComponent, scale) {
    var contentRect = contentComponent.getBoundingClientRect();
    // mouse position x, y over wrapper component
    var mouseX = (event.clientX - contentRect.left) / scale;
    var mouseY = (event.clientY - contentRect.top) / scale;
    if (isNaN(mouseX) || isNaN(mouseY))
        console.error("No mouse or touch offset found");
    return {
        mouseX: mouseX,
        mouseY: mouseY,
    };
}
export function getComponentsSizes(wrapperComponent, contentComponent, newScale) {
    var wrapperWidth = wrapperComponent.offsetWidth;
    var wrapperHeight = wrapperComponent.offsetHeight;
    var contentWidth = contentComponent.offsetWidth;
    var contentHeight = contentComponent.offsetHeight;
    var newContentWidth = contentWidth * newScale;
    var newContentHeight = contentHeight * newScale;
    var newDiffWidth = wrapperWidth - newContentWidth;
    var newDiffHeight = wrapperHeight - newContentHeight;
    return {
        wrapperWidth: wrapperWidth,
        wrapperHeight: wrapperHeight,
        newContentWidth: newContentWidth,
        newDiffWidth: newDiffWidth,
        newContentHeight: newContentHeight,
        newDiffHeight: newDiffHeight,
    };
}
export function handleCalculatePositions(mouseX, mouseY, newScale, bounds, limitToBounds) {
    var _a = this.stateProvider, scale = _a.scale, positionX = _a.positionX, positionY = _a.positionY, transformEnabled = _a.options.transformEnabled;
    var scaleDifference = newScale - scale;
    if (typeof mouseX !== "number" || typeof mouseY !== "number")
        return console.error("Mouse X and Y position were not provided!");
    if (!transformEnabled)
        return { newPositionX: positionX, newPositionY: positionY };
    var calculatedPositionX = positionX - mouseX * scaleDifference;
    var calculatedPositionY = positionY - mouseY * scaleDifference;
    // do not limit to bounds when there is padding animation,
    // it causes animation strange behaviour
    var newPositions = checkPositionBounds(calculatedPositionX, calculatedPositionY, bounds, limitToBounds, 0, null);
    return newPositions;
}
//# sourceMappingURL=utils.js.map