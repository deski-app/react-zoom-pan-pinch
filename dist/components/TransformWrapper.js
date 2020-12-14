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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from "react";
import { StateProvider } from "../store/StateContext";
import { deleteUndefinedProps } from "../store/utils";
import { getValidPropsFromObject } from "../store/propsHandlers";
var TransformWrapper = function (_a) {
    var children = _a.children, defaultPositionX = _a.defaultPositionX, defaultPositionY = _a.defaultPositionY, defaultScale = _a.defaultScale, onWheelStart = _a.onWheelStart, onWheel = _a.onWheel, onWheelStop = _a.onWheelStop, onPanningStart = _a.onPanningStart, onPanning = _a.onPanning, onPanningStop = _a.onPanningStop, onPinchingStart = _a.onPinchingStart, onPinching = _a.onPinching, onPinchingStop = _a.onPinchingStop, onZoomChange = _a.onZoomChange, rest = __rest(_a, ["children", "defaultPositionX", "defaultPositionY", "defaultScale", "onWheelStart", "onWheel", "onWheelStop", "onPanningStart", "onPanning", "onPanningStop", "onPinchingStart", "onPinching", "onPinchingStop", "onZoomChange"]);
    var props = __assign({}, rest);
    if (props.options && props.options.limitToWrapper) {
        props.options.limitToBounds = true;
    }
    return (React.createElement(StateProvider, { defaultValues: deleteUndefinedProps({
            positionX: defaultPositionX,
            positionY: defaultPositionY,
            scale: defaultScale,
        }), dynamicValues: deleteUndefinedProps(getValidPropsFromObject(props)), onWheelStart: onWheelStart, onWheel: onWheel, onWheelStop: onWheelStop, onPanningStart: onPanningStart, onPanning: onPanning, onPanningStop: onPanningStop, onPinchingStart: onPinchingStart, onPinching: onPinching, onPinchingStop: onPinchingStop, onZoomChange: onZoomChange }, children));
};
export { TransformWrapper };
//# sourceMappingURL=TransformWrapper.js.map