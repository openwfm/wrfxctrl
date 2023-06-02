export const appState = (function makeAppState() {
    class appState {
        constructor() {
            this.ignitionType = this.ignitionPerimeter();
            this.subscribers = [];
            this.igniteSubscribers = [];
            this.startTimeMoment = null;
            this.endTimeMoment = null;
        }

        subscribeComponent(component) {
            if (component.ignitionTypeChange) {
                this.subscribers.push(component);
            }

            if (component.validateForIgnition) {
                this.igniteSubscribers.push(component);
            }
        }

        changeIgnitionType(ignitionType) {
            this.ignitionType = ignitionType;
            for (let subscriber of this.subscribers) {
                subscriber.ignitionTypeChange();
            }
        }

        igniteSimulation() {
            for (let subscriber of this.subscribers) {
                subscriber.validateForIgnition();
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
        domainCenter() {
            return "3";
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

        isDomain() {
            return this.ignitionType == this.domainCenter();
        }
    }
    return new appState();
})();