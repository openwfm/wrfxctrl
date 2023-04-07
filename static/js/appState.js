export const appState = (function makeAppState() {
    class appState {
        constructor() {
            this.ignitionType = this.ignitionPerimeter();
            this.subscribers = [];
        }

        subscribeComponent(component) {
            if (component.ignitionTypeChange) {
                this.subscribers.push(component);
            }
        }

        changeIgnitionType(ignitionType) {
            this.ignitionType = ignitionType;
            for (let subscriber of this.subscribers) {
                subscriber.ignitionTypeChange();
            }
        }

        ignitionPerimeter() {
            return "0";
        }
        ignitionPoints() {
            return "1";
        }
        ignitionLine() {
            return "2";
        }

        isPerimeter() {
            return this.ignitionType == this.ignitionPerimeter();
        }

        isLine() {
            return this.ignitionType == this.ignitionLine();
        }

        isPoints() {
            return this.ignitionType == this.ignitionPoints();
        }
    }
    return new appState();
})();