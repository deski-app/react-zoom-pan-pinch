import { availableAnimations } from "./utils";
export function handleDisableAnimation() {
    if (!this.mounted)
        return;
    if (this.animation) {
        cancelAnimationFrame(this.animation);
    }
    this.animate = false;
    this.animation = false;
    this.velocity = false;
}
export function animate(animationName, animationTime, callback) {
    var _this = this;
    if (!this.mounted)
        return;
    var startTime = new Date().getTime();
    var lastStep = 1;
    // if another animation is active
    handleDisableAnimation.call(this);
    // new animation
    this.animation = function () {
        if (!_this.animation || !_this.mounted)
            return;
        var frameTime = new Date().getTime() - startTime;
        var animationProgress = frameTime / animationTime;
        var animationType = availableAnimations[animationName];
        var step = animationType(animationProgress);
        if (frameTime >= animationTime) {
            callback(lastStep);
            _this.animation = null;
        }
        else {
            callback(step);
            requestAnimationFrame(_this.animation);
        }
    };
    requestAnimationFrame(this.animation);
}
export function animateComponent(_a) {
    var _this = this;
    var targetState = _a.targetState, speed = _a.speed, type = _a.type;
    var _b = this.stateProvider, scale = _b.scale, positionX = _b.positionX, positionY = _b.positionY;
    var scaleDiff = targetState.scale - scale;
    var positionXDiff = targetState.positionX - positionX;
    var positionYDiff = targetState.positionY - positionY;
    if (speed === 0) {
        this.stateProvider.previousScale = this.stateProvider.scale;
        this.stateProvider.scale = targetState.scale;
        this.stateProvider.positionX = targetState.positionX;
        this.stateProvider.positionY = targetState.positionY;
        this.applyTransformation();
    }
    else {
        // animation start timestamp
        animate.call(this, type, speed, function (step) {
            _this.stateProvider.previousScale = _this.stateProvider.scale;
            _this.stateProvider.scale = scale + scaleDiff * step;
            _this.stateProvider.positionX = positionX + positionXDiff * step;
            _this.stateProvider.positionY = positionY + positionYDiff * step;
            // apply animation changes
            _this.applyTransformation();
        });
    }
}
//# sourceMappingURL=index.js.map