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
import React from "react";
import { Context } from "../store/StateContext";
import styles from "./TransformComponent.module.css";
var TransformComponent = /** @class */ (function (_super) {
    __extends(TransformComponent, _super);
    function TransformComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.wrapperRef = React.createRef();
        _this.contentRef = React.createRef();
        return _this;
    }
    TransformComponent.prototype.componentDidMount = function () {
        var nodes = this.context.nodes;
        nodes.setWrapperComponent(this.wrapperRef.current);
        nodes.setContentComponent(this.contentRef.current);
    };
    TransformComponent.prototype.render = function () {
        var children = this.props.children;
        var _a = this.context.state, positionX = _a.positionX, positionY = _a.positionY, scale = _a.scale, _b = _a.options, wrapperClass = _b.wrapperClass, contentClass = _b.contentClass, wrapperStyle = _b.wrapperStyle, contentStyle = _b.contentStyle;
        var style = __assign({ WebkitTransform: "translate(" + positionX + "px, " + positionY + "px) scale(" + scale + ")", transform: "translate(" + positionX + "px, " + positionY + "px) scale(" + scale + ")" }, contentStyle);
        return (React.createElement("div", { ref: this.wrapperRef, style: wrapperStyle, className: "react-transform-component " + styles.container + " " + wrapperClass },
            React.createElement("div", { ref: this.contentRef, className: "react-transform-element " + styles.content + " " + contentClass, style: style }, children)));
    };
    return TransformComponent;
}(React.Component));
TransformComponent.contextType = Context;
export { TransformComponent };
//# sourceMappingURL=TransformComponent.js.map