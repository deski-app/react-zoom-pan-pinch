import { getClientPosition, handlePanningAnimation } from "../pan";
import { checkPositionBounds } from "../zoom/utils";
import { boundLimiter } from "../utils";
import { animate, handleDisableAnimation } from "../animations";
import { availableAnimations } from "../animations/utils";
var throttleTime = 30;
function velocityTimeSpeed(speed, animationTime) {
    var velocityEqualToMove = this.stateProvider.pan.velocityEqualToMove;
    if (velocityEqualToMove) {
        return animationTime - animationTime / Math.max(1, speed);
    }
    return animationTime;
}
function handleEnableVelocity() {
    this.setState({ startAnimation: false });
}
export function handleFireVelocity() {
    this.setState({ startAnimation: true });
}
export function animateVelocity() {
    var _this = this;
    var _a = this.stateProvider, positionX = _a.positionX, positionY = _a.positionY, limitToBounds = _a.options.limitToBounds, _b = _a.pan, velocityBaseTime = _b.velocityBaseTime, lockAxisX = _b.lockAxisX, lockAxisY = _b.lockAxisY, velocityAnimationType = _b.velocityAnimationType, panReturnAnimationTime = _b.panReturnAnimationTime, panReturnAnimationType = _b.panReturnAnimationType, padding = _b.padding, paddingSize = _b.paddingSize, wrapperComponent = _a.wrapperComponent;
    if (!this.mounted)
        return;
    if (!this.velocity || !this.bounds)
        return handleDisableAnimation.call(this);
    var _c = this.bounds, maxPositionX = _c.maxPositionX, minPositionX = _c.minPositionX, maxPositionY = _c.maxPositionY, minPositionY = _c.minPositionY;
    var _d = this.velocity, velocityX = _d.velocityX, velocityY = _d.velocityY, velocity = _d.velocity;
    var animationTime = velocityTimeSpeed.call(this, velocity, velocityBaseTime);
    if (!animationTime) {
        handlePanningAnimation.call(this);
        return;
    }
    var targetX = velocityX;
    var targetY = velocityY;
    // pan return animation
    var newAnimationTime = animationTime > panReturnAnimationTime
        ? animationTime
        : panReturnAnimationTime;
    var paddingValue = padding ? paddingSize : 0;
    var paddingX = wrapperComponent
        ? (paddingValue * wrapperComponent.offsetWidth) / 100
        : 0;
    var paddingY = wrapperComponent
        ? (paddingValue * wrapperComponent.offsetHeight) / 100
        : 0;
    var maxTargetX = maxPositionX + paddingX;
    var minTargetX = minPositionX - paddingX;
    var maxTargetY = maxPositionY + paddingY;
    var minTargetY = minPositionY - paddingY;
    var startPosition = checkPositionBounds(positionX, positionY, this.bounds, limitToBounds, paddingValue, wrapperComponent);
    var startTime = new Date().getTime();
    // animation start timestamp
    animate.call(this, velocityAnimationType, newAnimationTime, function (step) {
        var frameTime = new Date().getTime() - startTime;
        var animationProgress = frameTime / panReturnAnimationTime;
        var returnAnimation = availableAnimations[panReturnAnimationType];
        var customReturnStep = returnAnimation(animationProgress);
        if (frameTime > panReturnAnimationTime ||
            customReturnStep > 1 ||
            customReturnStep === Infinity ||
            customReturnStep === -Infinity)
            customReturnStep = 1;
        var currentPositionX = getPosition(lockAxisX, targetX, step, customReturnStep, minPositionX, maxPositionX, limitToBounds, positionX, startPosition.x, minTargetX, maxTargetX);
        var currentPositionY = getPosition(lockAxisY, targetY, step, customReturnStep, minPositionY, maxPositionY, limitToBounds, positionY, startPosition.y, minTargetY, maxTargetY);
        if (positionX !== currentPositionX || positionY !== currentPositionY) {
            // Save panned position
            _this.stateProvider.positionX = currentPositionX;
            _this.stateProvider.positionY = currentPositionY;
            // apply animation changes
            _this.applyTransformation();
        }
    });
}
export function calculateVelocityStart(event) {
    var _this = this;
    var _a = this.stateProvider, scale = _a.scale, disabled = _a.options.disabled, _b = _a.pan, velocity = _b.velocity, velocitySensitivity = _b.velocitySensitivity, velocityActiveScale = _b.velocityActiveScale, velocityMinSpeed = _b.velocityMinSpeed, wrapperComponent = _a.wrapperComponent;
    if (!velocity || velocityActiveScale >= scale || disabled)
        return;
    handleEnableVelocity.call(this);
    var now = Date.now();
    if (this.lastMousePosition) {
        var position_1 = getClientPosition(event);
        if (!position_1)
            return console.error("No mouse or touch position detected");
        var clientX = position_1.clientX, clientY = position_1.clientY;
        var distanceX = clientX - this.lastMousePosition.clientX;
        var distanceY = clientY - this.lastMousePosition.clientY;
        var interval = now - this.velocityTime;
        var wrapperToWindowScaleX = 2 - wrapperComponent.offsetWidth / window.innerWidth;
        var wrapperToWindowScaleY = 2 - wrapperComponent.offsetHeight / window.innerHeight;
        var scaledX = 20 * Math.max(velocityMinSpeed, Math.min(2, wrapperToWindowScaleX));
        var scaledY = 20 * Math.max(velocityMinSpeed, Math.min(2, wrapperToWindowScaleY));
        var velocityX = (distanceX / interval) * velocitySensitivity * scale * scaledX;
        var velocityY = (distanceY / interval) * velocitySensitivity * scale * scaledY;
        var speed = distanceX * distanceX + distanceY * distanceY;
        var velocity_1 = (Math.sqrt(speed) / interval) * velocitySensitivity;
        if (this.velocity && velocity_1 < this.velocity.velocity && this.throttle)
            return;
        this.velocity = { velocityX: velocityX, velocityY: velocityY, velocity: velocity_1 };
        // throttling
        if (this.throttle)
            clearTimeout(this.throttle);
        this.throttle = setTimeout(function () {
            if (_this.mounted)
                _this.throttle = false;
        }, throttleTime);
    }
    var position = getClientPosition(event);
    this.lastMousePosition = position;
    this.velocityTime = now;
}
function getPosition(isLocked, target, step, panReturnStep, minBound, maxBound, limitToBounds, offset, startPosition, minTarget, maxTarget) {
    if (limitToBounds) {
        if (startPosition > minBound && offset > maxBound) {
            var newPosition = startPosition - (startPosition - maxBound) * panReturnStep;
            if (newPosition > maxTarget)
                return maxTarget;
            if (newPosition < maxBound)
                return maxBound;
            return newPosition;
        }
        if (startPosition < minBound && offset < minBound) {
            var newPosition = startPosition - (startPosition - minBound) * panReturnStep;
            if (newPosition < minTarget)
                return minTarget;
            if (newPosition > minBound)
                return minBound;
            return newPosition;
        }
    }
    if (isLocked)
        return startPosition;
    var offsetPosition = offset + target * step;
    return boundLimiter(offsetPosition, minBound, maxBound, limitToBounds);
}
//# sourceMappingURL=index.js.map