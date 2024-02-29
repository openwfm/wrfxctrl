export const appState = (function makeAppState() {
    class appState {
        constructor() {
            this.ignitionType = this.ignitionPerimeter();
            this.subscribers = [];
            this.igniteSubscribers = [];
            this.simulationStartAndStartTimes = null;
            this.kmlPoints = {};
        }

        subscribeComponent(component) {
            if (component.ignitionTypeChange) {
                this.subscribers.push(component);
            }

            if (component.validateForIgnition) {
                this.igniteSubscribers.push(component);
            }
        }

        setSimulationStartAndStopTimeComponent(component) {
            return this.simulationStartAndStartTimes = component;
        }

        simulationStartTimeMoment() {
            return this.simulationStartAndStartTimes.startTimeMoment();
        }
       
        simulationEndTimeMoment() {
            return this.simulationStartAndStartTimes.endTimeMoment();
        }

        changeIgnitionType(ignitionType) {
            this.ignitionType = ignitionType;
            for (let subscriber of this.subscribers) {
                subscriber.ignitionTypeChange();
            }
        }

        processKml(kmlPoints) {
          this.kmlPoints = kmlPoints;
          for (let subscriber of this.subscribers) {
            if (subscriber.addKmlPoints) {
              subscriber.addKmlPoints();
            }
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
