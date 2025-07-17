export const appState = (function makeAppState() {
  class appState {
    constructor() {
      this.ignitionType = this.ignitionPerimeter();
      this.lineTabIndex = 0;
      this.perimeterTabIndex = 0;
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
      return (this.simulationStartAndStartTimes = component);
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

    domainCenter() {
      return "0";
    }
    ignitionPoints() {
      return "1";
    }
    ignitionLine() {
      return "2";
    }
    ignitionPerimeter() {
      return "3";
    }

    isDomain() {
      return this.ignitionType == this.domainCenter();
    }

    isPoints() {
      return this.ignitionType == this.ignitionPoints();
    }

    isLine() {
      return this.ignitionType == this.ignitionLine();
    }

    isPerimeter() {
      return this.ignitionType == this.ignitionPerimeter();
    }
  }
  return new appState();
})();
