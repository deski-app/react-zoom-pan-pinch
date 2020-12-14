export var propsList = [
    "previousScale",
    "scale",
    "positionX",
    "positionY",
    "defaultPositionX",
    "defaultPositionY",
    "defaultScale",
    "onWheelStart",
    "onWheel",
    "onWheelStop",
    "onPanningStart",
    "onPanning",
    "onPanningStop",
    "onPinchingStart",
    "onPinching",
    "onPinchingStop",
    "onZoomChange",
    "options",
    "wheel",
    "scalePadding",
    "pan",
    "pinch",
    "zoomIn",
    "zoomOut",
    "doubleClick",
    "reset",
];
export var getValidPropsFromObject = function (props) {
    return Object.keys(props).reduce(function (acc, key) {
        if (propsList.includes(key)) {
            acc[key] = props[key];
        }
        return acc;
    }, {});
};
//# sourceMappingURL=propsHandlers.js.map