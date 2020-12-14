import { checkPositionBounds, handleCalculatePositions } from "../zoom/utils";
import { animateComponent } from "../animations";
export function getClientPosition(event) {
    var touches = event.touches;
    // Mobile points
    if (touches && touches.length === 1) {
        return { clientX: touches[0].clientX, clientY: touches[0].clientY };
    }
    // Desktop points
    if (!touches) {
        return { clientX: event.clientX, clientY: event.clientY };
    }
    return null;
}
export function handlePanning(event) {
    var _a = this.stateProvider, scale = _a.scale, positionX = _a.positionX, positionY = _a.positionY, _b = _a.options, limitToBounds = _b.limitToBounds, minScale = _b.minScale, _c = _a.pan, lockAxisX = _c.lockAxisX, lockAxisY = _c.lockAxisY, padding = _c.padding, paddingSize = _c.paddingSize, wrapperComponent = _a.wrapperComponent;
    if (!this.startCoords)
        return;
    var _d = this.startCoords, x = _d.x, y = _d.y;
    var positions = getClientPosition(event);
    if (!positions)
        return console.error("Cannot find mouse client positions");
    var clientX = positions.clientX, clientY = positions.clientY;
    // Get Position
    var mouseX = clientX - x;
    var mouseY = clientY - y;
    var newPositionX = lockAxisX ? positionX : mouseX;
    var newPositionY = lockAxisY ? positionY : mouseY;
    // padding
    var paddingValue = padding && scale >= minScale ? paddingSize : 0;
    // If position didn't change
    if (newPositionX === positionX && newPositionY === positionY)
        return;
    var calculatedPosition = checkPositionBounds(newPositionX, newPositionY, this.bounds, limitToBounds, paddingValue, wrapperComponent);
    // Save panned position
    handlePaddingAnimation.call(this, calculatedPosition.x, calculatedPosition.y);
}
export function handlePanningAnimation() {
    var _a = this.stateProvider, scale = _a.scale, minScale = _a.options.minScale, _b = _a.pan, disabled = _b.disabled, padding = _b.padding, panReturnAnimationTime = _b.panReturnAnimationTime, panReturnAnimationType = _b.panReturnAnimationType;
    var isDisabled = disabled || scale < minScale || !padding;
    if (isDisabled)
        return;
    var targetState = handlePanToBounds.call(this);
    animateComponent.call(this, {
        targetState: targetState,
        speed: panReturnAnimationTime,
        type: panReturnAnimationType,
    });
}
export function handlePanToBounds() {
    var _a = this.stateProvider, positionX = _a.positionX, positionY = _a.positionY, scale = _a.scale, _b = _a.options, disabled = _b.disabled, limitToBounds = _b.limitToBounds, limitToWrapper = _b.limitToWrapper;
    var wrapperComponent = this.state.wrapperComponent;
    if (disabled)
        return;
    var _c = this.bounds, maxPositionX = _c.maxPositionX, minPositionX = _c.minPositionX, maxPositionY = _c.maxPositionY, minPositionY = _c.minPositionY;
    var xChanged = positionX > maxPositionX || positionX < minPositionX;
    var yChanged = positionY > maxPositionY || positionY < minPositionY;
    var mouseX = positionX > maxPositionX
        ? wrapperComponent.offsetWidth
        : this.stateProvider.minPositionX || 0;
    var mouseY = positionY > maxPositionY
        ? wrapperComponent.offsetHeight
        : this.stateProvider.minPositionY || 0;
    var mousePosX = mouseX;
    var mousePosY = mouseY;
    var _d = handleCalculatePositions.call(this, mousePosX, mousePosY, scale, this.bounds, limitToBounds || limitToWrapper), x = _d.x, y = _d.y;
    return {
        scale: scale,
        positionX: xChanged ? x : positionX,
        positionY: yChanged ? y : positionY,
    };
}
function handlePaddingAnimation(positionX, positionY) {
    var padding = this.stateProvider.pan.padding;
    if (!padding)
        return;
    this.stateProvider.positionX = positionX;
    this.stateProvider.positionY = positionY;
    this.applyTransformation();
}
//# sourceMappingURL=index.js.map