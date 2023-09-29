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
            if (this.validateComponents()) {
                this.buildJson();
                this.writeKmlFiles();
            } else {
                this.errorUIComponent.showErrors(this.validationErrors);
            }
        }

        buildJson() {
            let formData = {
                "profile": $('#profile').val()
            }
            for (let component of this.subscribers) {
                let componentFormData = component.jsonProps();
                formData = {...formData, ...componentFormData};
            }
            $.ajax({
                type:"post",
                dataType: 'json',
                data: formData
            });
        }

        writeKmlFiles() {

        }

        validateComponents() {
            this.validationErrors = [];
            let ignitionPointsAdded = false;
            for (let subscriber of this.subscribers) {
                let componentError = subscriber.validateForIgnition();
                ignitionPointsAdded ||= subscriber.ignitionPointsAdded();
                if (componentError.messages.length > 0) {
                    this.validationErrors.push(componentError);
                }
            }

            // if (!ignitionPointsAdded) {
            //     let errorMessage = "At least one point of Ignition must be created in either Ignition Line, or Multiple Ignitions";
            //     let ignitionError = {header: "Ignitions", messages: [errorMessage]};
            //     this.validationErrors.push(ignitionError);
            // }

            let profileError = this.isProfileValid();
            if (profileError.messages.length > 0) {
                this.validationErrors.push(profileError);
            }
            return this.validationErrors.length == 0;
        }

        isProfileValid() {
            let profile = $('#profile').val();
            let errorMessages = [];
            if (profile == "") {
                let errorMessage = "Please select a job profile."
                errorMessages.push(errorMessage);
            }
            return {header:"Simulation Profile", messages: errorMessages };
        }
    }
    return new ErrorState();
})();