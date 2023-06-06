export const errorState = (function makeErrorState() {
    class ErrorState {
        constructor() {
            this.subscribers = [];
            this.errorUIComponent = null;
            this.validationErrors = [];
        }

        setErrorComponent(component) {
            this.errorUIComponent = component;
        }

        subscribeComponent(component) {
            if (component.validateForIgnition) {
                this.subscribers.push(component);
            }
        }

        igniteSimulation() {
            this.validateComponents();

            if (this.validationErrors.length > 0) {
                this.errorUIComponent.showErrors(this.validationErrors);
            } else {
                // have each component have a method for its json props that i use in buildJson
                this.buildJson();
                // have each component have a generate kml function
                this.writeKmlFiles();
            }
        }

        buildJson() {

        }

        writeKmlFiles() {

        }

        validateComponents() {
            this.validationErrors = [];
            for (let subscriber of this.subscribers) {
                let componentError = subscriber.validateForIgnition();
                if (componentError) {
                    this.validationErrors.push(componentError);
                }
            }

            let profileError = this.isProfileValid();
            if (profileError) {
                this.validationErrors.push(profileError);
            }
        }

        isProfileValid() {
            let profile = $('#profile').val();
            if (profile == "") {
              return {header:"Simulation Profile", message: "Please select a job profile." };
            }
            return null;
        }
    }
    return new ErrorState();
})();