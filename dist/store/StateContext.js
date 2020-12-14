var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import React, { Component } from "react";
import { initialState } from "./InitialState";
import { mergeProps, getDistance, handleCallback, handleWheelStop, getWindowScaleX, getWindowScaleY, } from "./utils";
import { handleZoomControls, handleDoubleClick, resetTransformations, handlePaddingAnimation, handleWheelZoom, handleCalculateBounds, } from "./zoom";
import { handleDisableAnimation, animateComponent } from "./animations";
import { handleZoomPinch } from "./pinch";
import { handlePanning, handlePanningAnimation } from "./pan";
import { handleFireVelocity, animateVelocity, calculateVelocityStart, } from "./velocity";
import makePassiveEventOption from "./makePassiveEventOption";
import { getValidPropsFromObject } from "./propsHandlers";
var Context = React.createContext({});
var wheelStopEventTimer = null;
var wheelStopEventTime = 180;
var wheelAnimationTimer = null;
var wheelAnimationTime = 100;
var StateProvider = /** @class */ (function (_super) {
    __extends(StateProvider, _super);
    function StateProvider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.mounted = true;
        _this.state = {
            wrapperComponent: undefined,
            contentComponent: undefined,
        };
        _this.stateProvider = __assign(__assign(__assign(__assign({}, initialState), mergeProps(initialState, _this.props.dynamicValues)), _this.props.defaultValues), { previousScale: _this.props.dynamicValues.scale ||
                _this.props.defaultValues.scale ||
                initialState.scale });
        _this.windowToWrapperScaleX = 0;
        _this.windowToWrapperScaleY = 0;
        // panning helpers
        _this.startCoords = null;
        _this.isDown = false;
        // pinch helpers
        _this.pinchStartDistance = null;
        _this.lastDistance = null;
        _this.pinchStartScale = null;
        _this.distance = null;
        _this.bounds = null;
        // velocity helpers
        _this.velocityTime = null;
        _this.lastMousePosition = null;
        _this.velocity = null;
        _this.offsetX = null;
        _this.offsetY = null;
        _this.throttle = false;
        // wheel helpers
        _this.previousWheelEvent = null;
        _this.lastScale = null;
        // animations helpers
        _this.animate = null;
        _this.animation = null;
        _this.maxBounds = null;
        //////////
        // Wheel
        //////////
        _this.handleWheel = function (event) {
            var _a = _this.stateProvider, scale = _a.scale, _b = _a.wheel, disabled = _b.disabled, wheelEnabled = _b.wheelEnabled, touchPadEnabled = _b.touchPadEnabled;
            var _c = _this.props, onWheelStart = _c.onWheelStart, onWheel = _c.onWheel, onWheelStop = _c.onWheelStop;
            var _d = _this.state, wrapperComponent = _d.wrapperComponent, contentComponent = _d.contentComponent;
            if (_this.isDown ||
                disabled ||
                _this.stateProvider.options.disabled ||
                !wrapperComponent ||
                !contentComponent)
                return;
            // ctrlKey detects if touchpad execute wheel or pinch gesture
            if (!wheelEnabled && !event.ctrlKey)
                return;
            if (!touchPadEnabled && event.ctrlKey)
                return;
            // Wheel start event
            if (!wheelStopEventTimer) {
                _this.lastScale = scale;
                handleDisableAnimation.call(_this);
                handleCallback(onWheelStart, _this.getCallbackProps());
            }
            // Wheel event
            handleWheelZoom.call(_this, event);
            handleCallback(onWheel, _this.getCallbackProps());
            _this.applyTransformation(null, null, null);
            _this.previousWheelEvent = event;
            // Wheel stop event
            if (handleWheelStop(_this.previousWheelEvent, event, _this.stateProvider)) {
                clearTimeout(wheelStopEventTimer);
                wheelStopEventTimer = setTimeout(function () {
                    if (!_this.mounted)
                        return;
                    handleCallback(onWheelStop, _this.getCallbackProps());
                    wheelStopEventTimer = null;
                }, wheelStopEventTime);
            }
            // cancel animation
            _this.animate = false;
            // fire animation
            _this.lastScale = _this.stateProvider.scale;
            clearTimeout(wheelAnimationTimer);
            wheelAnimationTimer = setTimeout(function () {
                if (!_this.mounted)
                    return;
                handlePaddingAnimation.call(_this, event);
            }, wheelAnimationTime);
        };
        //////////
        // Panning
        //////////
        _this.checkPanningTarget = function (event) {
            var disableOnTarget = _this.stateProvider.pan.disableOnTarget;
            return (disableOnTarget
                .map(function (tag) { return tag.toUpperCase(); })
                .includes(event.target.tagName) ||
                disableOnTarget.find(function (element) {
                    return event.target.classList.value.includes(element);
                }));
        };
        _this.checkIsPanningActive = function (event) {
            var disabled = _this.stateProvider.pan.disabled;
            var _a = _this.state, wrapperComponent = _a.wrapperComponent, contentComponent = _a.contentComponent;
            return (!_this.isDown ||
                disabled ||
                _this.stateProvider.options.disabled ||
                (event.touches &&
                    (event.touches.length !== 1 ||
                        Math.abs(_this.startCoords.x - event.touches[0].clientX) < 1 ||
                        Math.abs(_this.startCoords.y - event.touches[0].clientY) < 1)) ||
                !wrapperComponent ||
                !contentComponent);
        };
        _this.handleSetUpPanning = function (x, y) {
            var _a = _this.stateProvider, positionX = _a.positionX, positionY = _a.positionY;
            _this.isDown = true;
            _this.startCoords = { x: x - positionX, y: y - positionY };
            handleCallback(_this.props.onPanningStart, _this.getCallbackProps());
        };
        _this.handleStartPanning = function (event) {
            var _a = _this.stateProvider, wrapperComponent = _a.wrapperComponent, scale = _a.scale, _b = _a.options, minScale = _b.minScale, maxScale = _b.maxScale, limitToWrapper = _b.limitToWrapper, disabled = _a.pan.disabled;
            var target = event.target, touches = event.touches;
            if (disabled ||
                _this.stateProvider.options.disabled ||
                (wrapperComponent && !wrapperComponent.contains(target)) ||
                _this.checkPanningTarget(event) ||
                scale < minScale ||
                scale > maxScale)
                return;
            handleDisableAnimation.call(_this);
            _this.bounds = handleCalculateBounds.call(_this, scale, limitToWrapper);
            // Mobile points
            if (touches && touches.length === 1) {
                _this.handleSetUpPanning(touches[0].clientX, touches[0].clientY);
            }
            // Desktop points
            if (!touches) {
                _this.handleSetUpPanning(event.clientX, event.clientY);
            }
        };
        _this.handlePanning = function (event) {
            if (_this.isDown)
                event.preventDefault();
            if (_this.checkIsPanningActive(event))
                return;
            event.stopPropagation();
            calculateVelocityStart.call(_this, event);
            handlePanning.call(_this, event);
            handleCallback(_this.props.onPanning, _this.getCallbackProps());
        };
        _this.handleStopPanning = function () {
            if (_this.isDown) {
                _this.isDown = false;
                _this.animate = false;
                _this.animation = false;
                handleFireVelocity.call(_this);
                handleCallback(_this.props.onPanningStop, _this.getCallbackProps());
                var _a = _this.stateProvider, velocity = _a.pan.velocity, scale = _a.scale;
                // start velocity animation
                if (_this.velocity && velocity && scale > 1) {
                    animateVelocity.call(_this);
                }
                else {
                    // fire fit to bounds animation
                    handlePanningAnimation.call(_this);
                }
            }
        };
        //////////
        // Pinch
        //////////
        _this.handlePinchStart = function (event) {
            var scale = _this.stateProvider.scale;
            event.preventDefault();
            event.stopPropagation();
            handleDisableAnimation.call(_this);
            var distance = getDistance(event.touches[0], event.touches[1]);
            _this.pinchStartDistance = distance;
            _this.lastDistance = distance;
            _this.pinchStartScale = scale;
            _this.isDown = false;
            handleCallback(_this.props.onPinchingStart, _this.getCallbackProps());
        };
        _this.handlePinch = function (event) {
            _this.isDown = false;
            handleZoomPinch.call(_this, event);
            handleCallback(_this.props.onPinching, _this.getCallbackProps());
        };
        _this.handlePinchStop = function () {
            if (typeof _this.pinchStartScale === "number") {
                _this.isDown = false;
                _this.velocity = null;
                _this.lastDistance = null;
                _this.pinchStartScale = null;
                _this.pinchStartDistance = null;
                handlePaddingAnimation.call(_this);
                handleCallback(_this.props.onPinchingStop, _this.getCallbackProps());
            }
        };
        //////////
        // Touch Events
        //////////
        _this.handleTouchStart = function (event) {
            var _a = _this.stateProvider, wrapperComponent = _a.wrapperComponent, contentComponent = _a.contentComponent, scale = _a.scale, _b = _a.options, disabled = _b.disabled, minScale = _b.minScale;
            var touches = event.touches;
            if (disabled || !wrapperComponent || !contentComponent || scale < minScale)
                return;
            handleDisableAnimation.call(_this);
            if (touches && touches.length === 1)
                return _this.handleStartPanning(event);
            if (touches && touches.length === 2)
                return _this.handlePinchStart(event);
        };
        _this.handleTouch = function (event) {
            var _a = _this.stateProvider, pan = _a.pan, pinch = _a.pinch, options = _a.options;
            if (options.disabled)
                return;
            if (!pan.disabled && event.touches.length === 1)
                return _this.handlePanning(event);
            if (!pinch.disabled && event.touches.length === 2)
                return _this.handlePinch(event);
        };
        _this.handleTouchStop = function () {
            _this.handleStopPanning();
            _this.handlePinchStop();
        };
        //////////
        // Controls
        //////////
        _this.zoomIn = function (event) {
            var _a = _this.stateProvider, _b = _a.zoomIn, disabled = _b.disabled, step = _b.step, options = _a.options;
            var _c = _this.state, wrapperComponent = _c.wrapperComponent, contentComponent = _c.contentComponent;
            if (!event)
                throw Error("Zoom in function requires event prop");
            if (disabled || options.disabled || !wrapperComponent || !contentComponent)
                return;
            handleZoomControls.call(_this, 1, step);
        };
        _this.zoomOut = function (event) {
            var _a = _this.stateProvider, _b = _a.zoomOut, disabled = _b.disabled, step = _b.step, options = _a.options;
            var _c = _this.state, wrapperComponent = _c.wrapperComponent, contentComponent = _c.contentComponent;
            if (!event)
                throw Error("Zoom out function requires event prop");
            if (disabled || options.disabled || !wrapperComponent || !contentComponent)
                return;
            handleZoomControls.call(_this, -1, step);
        };
        _this.handleDbClick = function (event) {
            var _a = _this.stateProvider, options = _a.options, _b = _a.doubleClick, disabled = _b.disabled, step = _b.step;
            var _c = _this.state, wrapperComponent = _c.wrapperComponent, contentComponent = _c.contentComponent;
            if (!event)
                throw Error("Double click function requires event prop");
            if (disabled || options.disabled || !wrapperComponent || !contentComponent)
                return;
            handleDoubleClick.call(_this, event, 1, step);
        };
        _this.setScale = function (newScale, speed, type) {
            if (speed === void 0) { speed = 200; }
            if (type === void 0) { type = "easeOut"; }
            var _a = _this.stateProvider, positionX = _a.positionX, positionY = _a.positionY, scale = _a.scale, disabled = _a.options.disabled;
            var _b = _this.state, wrapperComponent = _b.wrapperComponent, contentComponent = _b.contentComponent;
            if (disabled || !wrapperComponent || !contentComponent)
                return;
            var targetState = {
                positionX: positionX,
                positionY: positionY,
                scale: isNaN(newScale) ? scale : newScale,
            };
            animateComponent.call(_this, {
                targetState: targetState,
                speed: speed,
                type: type,
            });
        };
        _this.setPositionX = function (newPosX, speed, type) {
            if (speed === void 0) { speed = 200; }
            if (type === void 0) { type = "easeOut"; }
            var _a = _this.stateProvider, positionX = _a.positionX, positionY = _a.positionY, scale = _a.scale, _b = _a.options, disabled = _b.disabled, transformEnabled = _b.transformEnabled;
            var _c = _this.state, wrapperComponent = _c.wrapperComponent, contentComponent = _c.contentComponent;
            if (disabled || !transformEnabled || !wrapperComponent || !contentComponent)
                return;
            var targetState = {
                positionX: isNaN(newPosX) ? positionX : newPosX,
                positionY: positionY,
                scale: scale,
            };
            animateComponent.call(_this, {
                targetState: targetState,
                speed: speed,
                type: type,
            });
        };
        _this.setPositionY = function (newPosY, speed, type) {
            if (speed === void 0) { speed = 200; }
            if (type === void 0) { type = "easeOut"; }
            var _a = _this.stateProvider, positionX = _a.positionX, scale = _a.scale, positionY = _a.positionY, _b = _a.options, disabled = _b.disabled, transformEnabled = _b.transformEnabled;
            var _c = _this.state, wrapperComponent = _c.wrapperComponent, contentComponent = _c.contentComponent;
            if (disabled || !transformEnabled || !wrapperComponent || !contentComponent)
                return;
            var targetState = {
                positionX: positionX,
                positionY: isNaN(newPosY) ? positionY : newPosY,
                scale: scale,
            };
            animateComponent.call(_this, {
                targetState: targetState,
                speed: speed,
                type: type,
            });
        };
        _this.setTransform = function (newPosX, newPosY, newScale, speed, type) {
            if (speed === void 0) { speed = 200; }
            if (type === void 0) { type = "easeOut"; }
            var _a = _this.stateProvider, positionX = _a.positionX, positionY = _a.positionY, scale = _a.scale, _b = _a.options, disabled = _b.disabled, transformEnabled = _b.transformEnabled;
            var _c = _this.state, wrapperComponent = _c.wrapperComponent, contentComponent = _c.contentComponent;
            if (disabled || !transformEnabled || !wrapperComponent || !contentComponent)
                return;
            var targetState = {
                positionX: isNaN(newPosX) ? positionX : newPosX,
                positionY: isNaN(newPosY) ? positionY : newPosY,
                scale: isNaN(newScale) ? scale : newScale,
            };
            animateComponent.call(_this, {
                targetState: targetState,
                speed: speed,
                type: type,
            });
        };
        _this.resetTransform = function () {
            var _a = _this.stateProvider.options, disabled = _a.disabled, transformEnabled = _a.transformEnabled;
            if (disabled || !transformEnabled)
                return;
            resetTransformations.call(_this);
        };
        _this.setDefaultState = function () {
            _this.animation = null;
            _this.stateProvider = __assign(__assign(__assign({}, _this.stateProvider), { scale: initialState.scale, positionX: initialState.positionX, positionY: initialState.positionY }), _this.props.defaultValues);
            _this.forceUpdate();
        };
        //////////
        // Setters
        //////////
        _this.setWrapperComponent = function (wrapperComponent) {
            _this.setState({ wrapperComponent: wrapperComponent });
        };
        _this.setContentComponent = function (contentComponent) {
            _this.setState({ contentComponent: contentComponent }, function () {
                var _a = _this.stateProvider, wrapperComponent = _a.wrapperComponent, _b = _a.options, centerContent = _b.centerContent, limitToBounds = _b.limitToBounds, limitToWrapper = _b.limitToWrapper, scale = _a.scale;
                var _c = _this.props.defaultValues, positionX = _c.positionX, positionY = _c.positionY;
                if ((limitToBounds && !limitToWrapper) ||
                    (centerContent && !positionX && !positionY)) {
                    var transform = "translate(25%, 25%) scale(" + scale + ")";
                    contentComponent.style.transform = transform;
                    contentComponent.style.WebkitTransform = transform;
                    // force update to inject state to the context
                    _this.forceUpdate();
                    var startTime_1 = new Date().getTime();
                    var maxTimeWait_1 = 2000;
                    var interval_1 = setInterval(function () {
                        if (wrapperComponent.offsetWidth) {
                            var bounds = handleCalculateBounds.call(_this, scale, false);
                            _this.stateProvider.positionX = bounds.minPositionX;
                            _this.stateProvider.positionY = bounds.minPositionY;
                            _this.applyTransformation(null, null, null);
                            clearInterval(interval_1);
                            interval_1 = null;
                        }
                        else if (new Date().getTime() - startTime_1 > maxTimeWait_1) {
                            clearInterval(interval_1);
                            interval_1 = null;
                        }
                    }, 20);
                }
                else {
                    _this.applyTransformation(null, null, null);
                }
            });
        };
        _this.applyTransformation = function (newScale, posX, posY) {
            if (!_this.mounted)
                return;
            var contentComponent = _this.state.contentComponent;
            var onZoomChange = _this.props.onZoomChange;
            var _a = _this.stateProvider, previousScale = _a.previousScale, scale = _a.scale, positionX = _a.positionX, positionY = _a.positionY;
            if (!contentComponent)
                return console.error("There is no content component");
            var transform = "translate(" + (posX || positionX) + "px, " + (posY ||
                positionY) + "px) scale(" + (newScale || scale) + ")";
            contentComponent.style.transform = transform;
            contentComponent.style.WebkitTransform = transform;
            // force update to inject state to the context
            _this.forceUpdate();
            if (onZoomChange && previousScale !== scale) {
                handleCallback(onZoomChange, _this.getCallbackProps());
            }
        };
        //////////
        // Props
        //////////
        _this.getCallbackProps = function () { return getValidPropsFromObject(_this.stateProvider); };
        return _this;
    }
    StateProvider.prototype.componentDidMount = function () {
        var passiveOption = makePassiveEventOption(false);
        // Panning on window to allow panning when mouse is out of wrapper
        window.addEventListener("mousedown", this.handleStartPanning, passiveOption);
        window.addEventListener("mousemove", this.handlePanning, passiveOption);
        window.addEventListener("mouseup", this.handleStopPanning, passiveOption);
    };
    StateProvider.prototype.componentWillUnmount = function () {
        var passiveOption = makePassiveEventOption(false);
        window.removeEventListener("mousedown", this.handleStartPanning, passiveOption);
        window.removeEventListener("mousemove", this.handlePanning, passiveOption);
        window.removeEventListener("mouseup", this.handleStopPanning, passiveOption);
        handleDisableAnimation.call(this);
    };
    StateProvider.prototype.componentDidUpdate = function (oldProps, oldState) {
        var _a = this.state, wrapperComponent = _a.wrapperComponent, contentComponent = _a.contentComponent;
        var dynamicValues = this.props.dynamicValues;
        if (!oldState.contentComponent && contentComponent) {
            this.stateProvider.contentComponent = contentComponent;
        }
        if (!oldState.wrapperComponent &&
            wrapperComponent &&
            wrapperComponent !== undefined) {
            this.stateProvider.wrapperComponent = wrapperComponent;
            this.windowToWrapperScaleX = getWindowScaleX(wrapperComponent);
            this.windowToWrapperScaleY = getWindowScaleY(wrapperComponent);
            // Zooming events on wrapper
            var passiveOption = makePassiveEventOption(false);
            wrapperComponent.addEventListener("wheel", this.handleWheel, passiveOption);
            wrapperComponent.addEventListener("dblclick", this.handleDbClick, passiveOption);
            wrapperComponent.addEventListener("touchstart", this.handleTouchStart, passiveOption);
            wrapperComponent.addEventListener("touchmove", this.handleTouch, passiveOption);
            wrapperComponent.addEventListener("touchend", this.handleTouchStop, passiveOption);
            document.addEventListener('dragstart', function (event) { return event.preventDefault(); }, true);
        }
        // set bound for animations
        if ((wrapperComponent && contentComponent) ||
            oldProps.dynamicValues !== dynamicValues) {
            this.maxBounds = handleCalculateBounds.call(this, this.stateProvider.scale, this.stateProvider.options.limitToWrapper);
        }
        // must be at the end of the update function, updates
        if (oldProps.dynamicValues && oldProps.dynamicValues !== dynamicValues) {
            this.animation = null;
            this.stateProvider = __assign(__assign({}, this.stateProvider), mergeProps(this.stateProvider, dynamicValues));
            this.applyTransformation(null, null, null);
        }
    };
    StateProvider.prototype.render = function () {
        var _a = this.state, wrapperComponent = _a.wrapperComponent, contentComponent = _a.contentComponent;
        /**
         * Context provider value
         */
        var value = {
            loaded: Boolean(wrapperComponent && contentComponent),
            state: this.getCallbackProps(),
            dispatch: {
                setScale: this.setScale,
                setPositionX: this.setPositionX,
                setPositionY: this.setPositionY,
                zoomIn: this.zoomIn,
                zoomOut: this.zoomOut,
                setTransform: this.setTransform,
                resetTransform: this.resetTransform,
                setDefaultState: this.setDefaultState,
            },
            nodes: {
                setWrapperComponent: this.setWrapperComponent,
                setContentComponent: this.setContentComponent,
            },
        };
        var children = this.props.children;
        var content = typeof children === "function"
            ? children(__assign(__assign({}, value.state), value.dispatch))
            : children;
        return React.createElement(Context.Provider, { value: value }, content);
    };
    return StateProvider;
}(Component));
export { Context, StateProvider };
//# sourceMappingURL=StateContext.js.map