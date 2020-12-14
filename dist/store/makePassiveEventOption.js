// We want to make event listeners non-passive, and to do so have to check
// that browsers support EventListenerOptions in the first place.
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
var passiveSupported = false;
function makePassiveEventOption(passive) {
    return passiveSupported ? { passive: passive } : passive;
}
export default makePassiveEventOption;
//# sourceMappingURL=makePassiveEventOption.js.map