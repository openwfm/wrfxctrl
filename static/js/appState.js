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
        ignitionPoint() {
            return "1";
        }
        ignitionArea() {
            return "2";
        }

        isPerimeter() {
            return this.ignitionType == this.ignitionPerimeter();
        }

        isArea() {
            return this.ignitionType == this.ignitionArea();
        }

        isPoints() {
            return this.ignitionType == this.ignitionPoint();
        }
    }
    return new appState();
})();