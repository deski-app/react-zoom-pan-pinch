import { roundNumber, checkIsNumber, calculateBoundingArea } from "../utils";
import { animateComponent } from "../animations";
import { handlePanningAnimation } from "../pan";
import { initialState } from "../InitialState";
import { checkZoomBounds, getComponentsSizes, getDelta, wheelMousePosition, handleCalculatePositions, } from "./utils";
function handleCalculateZoom(delta, step, disablePadding, getTarget, isBtnFunction) {
    var _a = this.stateProvider, scale = _a.scale, _b = _a.options, maxScale = _b.maxScale, minScale = _b.minScale, _c = _a.scalePadding, size = _c.size, disabled = _c.disabled, wrapperComponent = _a.wrapperComponent;
    var targetScale = null;
    if (isBtnFunction) {
        var scaleFactor = window.innerWidth * 0.0001;
        var zoomFactor = delta < 0 ? 30 : 20;
        targetScale =
            scale + (step - step * scaleFactor) * delta * (scale / zoomFactor);
    }
    else {
        var wrapperToWindowScale = 2 - window.innerWidth / wrapperComponent.offsetWidth;
        var scaleFactor = Math.max(0.2, Math.min(0.99, wrapperToWindowScale));
        var zoomFactor = 20;
        targetScale =
            scale + step * delta * ((scale - scale * scaleFactor) / zoomFactor);
    }
    if (getTarget)
        return targetScale;
    var paddingEnabled = disablePadding ? false : !disabled;
    var newScale = checkZoomBounds(roundNumber(targetScale, 3), minScale, maxScale, size, paddingEnabled);
    return newScale;
}
export function handleCalculateBounds(newScale, limitToWrapper) {
    var _a = this.stateProvider, wrapperComponent = _a.wrapperComponent, contentComponent = _a.contentComponent;
    var _b = getComponentsSizes(wrapperComponent, contentComponent, newScale), wrapperWidth = _b.wrapperWidth, wrapperHeight = _b.wrapperHeight, newContentWidth = _b.newContentWidth, newDiffWidth = _b.newDiffWidth, newContentHeight = _b.newContentHeight, newDiffHeight = _b.newDiffHeight;
    var bounds = calculateBoundingArea(wrapperWidth, newContentWidth, newDiffWidth, wrapperHeight, newContentHeight, newDiffHeight, limitToWrapper);
    // Save bounds
    this.bounds = bounds;
    return bounds;
}
/**
 * Wheel zoom event
 */
export function handleWheelZoom(event) {
    var _a = this.stateProvider, scale = _a.scale, contentComponent = _a.contentComponent, limitToBounds = _a.options.limitToBounds, _b = _a.scalePadding, size = _b.size, disabled = _b.disabled, _c = _a.wheel, step = _c.step, limitsOnWheel = _c.limitsOnWheel;
    event.preventDefault();
    event.stopPropagation();
    var delta = getDelta(event, null);
    var newScale = handleCalculateZoom.call(this, delta, step, !event.ctrlKey);
    // if scale not change
    if (scale === newScale)
        return;
    var bounds = handleCalculateBounds.call(this, newScale, !limitsOnWheel);
    var _d = wheelMousePosition(event, contentComponent, scale), mouseX = _d.mouseX, mouseY = _d.mouseY;
    var isLimitedToBounds = limitToBounds && (disabled || size === 0 || limitsOnWheel);
    var _e = handleCalculatePositions.call(this, mouseX, mouseY, newScale, bounds, isLimitedToBounds), x = _e.x, y = _e.y;
    this.bounds = bounds;
    this.stateProvider.previousScale = scale;
    this.stateProvider.scale = newScale;
    this.stateProvider.positionX = x;
    this.stateProvider.positionY = y;
    this.applyTransformation();
}
/**
 * Zoom for animations
 */
export function handleZoomToPoint(isDisabled, scale, mouseX, mouseY, event) {
    var _a = this.stateProvider, contentComponent = _a.contentComponent, _b = _a.options, disabled = _b.disabled, minScale = _b.minScale, maxScale = _b.maxScale, limitToBounds = _b.limitToBounds, limitToWrapper = _b.limitToWrapper;
    if (disabled || isDisabled)
        return;
    var newScale = checkZoomBounds(roundNumber(scale, 2), minScale, maxScale, null, null);
    var bounds = handleCalculateBounds.call(this, newScale, limitToWrapper);
    var mousePosX = mouseX;
    var mousePosY = mouseY;
    // if event is present - use it's mouse position
    if (event) {
        var mousePosition = wheelMousePosition(event, contentComponent, scale);
        mousePosX = mousePosition.mouseX;
        mousePosY = mousePosition.mouseY;
    }
    var _c = handleCalculatePositions.call(this, mousePosX, mousePosY, newScale, bounds, limitToBounds), x = _c.x, y = _c.y;
    return { scale: newScale, positionX: x, positionY: y };
}
export function handlePaddingAnimation() {
    var _a = this.stateProvider, scale = _a.scale, wrapperComponent = _a.wrapperComponent, _b = _a.options, minScale = _b.minScale, limitToBounds = _b.limitToBounds, _c = _a.scalePadding, disabled = _c.disabled, animationTime = _c.animationTime, animationType = _c.animationType;
    var isDisabled = disabled || scale >= minScale;
    if (scale >= 1 || limitToBounds) {
        // fire fit to bounds animation
        handlePanningAnimation.call(this);
    }
    if (isDisabled)
        return;
    var mouseX = wrapperComponent.offsetWidth / 2;
    var mouseY = wrapperComponent.offsetHeight / 2;
    var targetState = handleZoomToPoint.call(this, false, minScale, mouseX, mouseY, null);
    animateComponent.call(this, {
        targetState: targetState,
        speed: animationTime,
        type: animationType,
    });
}
/**
 * Button zoom events
 */
export function handleDoubleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    var _a = this.stateProvider, contentComponent = _a.contentComponent, scale = _a.scale, _b = _a.doubleClick, disabled = _b.disabled, mode = _b.mode, step = _b.step, animationTime = _b.animationTime, animationType = _b.animationType;
    if (mode === "reset") {
        return resetTransformations.call(this, event, animationTime);
    }
    var delta = mode === "zoomOut" ? -1 : 1;
    var newScale = handleCalculateZoom.call(this, delta, step, undefined, undefined, true);
    var _c = wheelMousePosition(event, contentComponent, scale), mouseX = _c.mouseX, mouseY = _c.mouseY;
    var targetState = handleZoomToPoint.call(this, disabled, newScale, mouseX, mouseY);
    if (targetState.scale === scale)
        return;
    var targetScale = handleCalculateZoom.call(this, delta, step, true, undefined, true);
    var time = getButtonAnimationTime(targetScale, newScale, animationTime);
    animateComponent.call(this, {
        targetState: targetState,
        speed: time,
        type: animationType,
    });
}
export function handleZoomControls(customDelta, customStep) {
    var _a = this.stateProvider, scale = _a.scale, positionX = _a.positionX, positionY = _a.positionY, wrapperComponent = _a.wrapperComponent, zoomIn = _a.zoomIn, zoomOut = _a.zoomOut;
    var wrapperWidth = wrapperComponent.offsetWidth;
    var wrapperHeight = wrapperComponent.offsetHeight;
    var mouseX = (wrapperWidth / 2 - positionX) / scale;
    var mouseY = (wrapperHeight / 2 - positionY) / scale;
    var newScale = handleCalculateZoom.call(this, customDelta, customStep, undefined, undefined, true);
    var isZoomIn = newScale > scale;
    var animationSpeed = isZoomIn
        ? zoomIn.animationTime
        : zoomOut.animationTime;
    var animationType = isZoomIn ? zoomIn.animationType : zoomOut.animationType;
    var isDisabled = isZoomIn ? zoomIn.disabled : zoomOut.disabled;
    var targetState = handleZoomToPoint.call(this, isDisabled, newScale, mouseX, mouseY);
    if (targetState.scale === scale)
        return;
    var targetScale = handleCalculateZoom.call(this, customDelta, customStep, true, undefined, true);
    var time = getButtonAnimationTime(targetScale, newScale, animationSpeed);
    animateComponent.call(this, {
        targetState: targetState,
        speed: time,
        type: animationType,
    });
}
export function resetTransformations(animationSpeed) {
    var _a = this.props.defaultValues, defaultScale = _a.defaultScale, defaultPositionX = _a.defaultPositionX, defaultPositionY = _a.defaultPositionY;
    var _b = this.stateProvider, scale = _b.scale, positionX = _b.positionX, positionY = _b.positionY, reset = _b.reset, _c = _b.options, disabled = _c.disabled, limitToBounds = _c.limitToBounds, centerContent = _c.centerContent, limitToWrapper = _c.limitToWrapper;
    if (disabled || reset.disabled)
        return;
    if (scale === defaultScale &&
        positionX === defaultPositionX &&
        positionY === defaultPositionY)
        return;
    var speed = typeof animationSpeed === "number" ? animationSpeed : reset.animationTime;
    var targetScale = checkIsNumber(defaultScale, initialState.scale);
    var newPositionX = checkIsNumber(defaultPositionX, initialState.positionX);
    var newPositionY = checkIsNumber(defaultPositionY, initialState.positionY);
    if ((limitToBounds && !limitToWrapper) || centerContent) {
        var bounds = handleCalculateBounds.call(this, targetScale, limitToWrapper);
        newPositionX = bounds.minPositionX;
        newPositionY = bounds.minPositionY;
    }
    var targetState = {
        scale: targetScale,
        positionX: newPositionX,
        positionY: newPositionY,
    };
    animateComponent.call(this, {
        targetState: targetState,
        speed: speed,
        type: reset.animationType,
    });
}
function getButtonAnimationTime(targetScale, newScale, time) {
    return time * (newScale / targetScale);
}
//# sourceMappingURL=index.js.map