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
            this.validationErrors = [];
            for (let subscriber of this.subscribers) {
                let errorMessage = subscriber.validateForIgnition();
                if (errorMessage) {
                    this.validationErrors.push(errorMessage);
                }
            }

            let profileErrorMessage = this.isProfileValid();
            if (profileErrorMessage) {
                this.validationErrors.push(profileErrorMessage);
            }

            if (this.validationErrors.length > 0) {
                this.errorUIComponent.showErrors(this.validationErrors);
                return false;
            }
            return true;
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