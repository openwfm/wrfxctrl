import { appState } from '../../../appState.js';
import { ignitionLineHTML } from './ignitionLineHTML.js';
import { AppStateSubscriber } from '../../appStateSubscriber.js';

export class IgnitionLineUI extends AppStateSubscriber {
    constructor() {
        super();
        this.innerHTML = ignitionLineHTML;
        this.uiElements = {
            ignitionStartUI: this.querySelector('#start-time-input'),
            ignitionEndUI: this.querySelector('#end-time-input'),
            ignitionLineComponentUI: this.querySelector('#ignition-line-component'),
            ignitionLineMarkersListUI: this.querySelector('#ignition-line-markers'),
            startEndCheckboxUI: this.querySelector('#start-end-checkbox'),
            startEndWrapperUI: this.querySelector('#start-end-dates'),
        };
        this.startTimeId = '#start-time-input';
        this.endTimeId = '#end-time-input';
    }

    connectedCallback() {
        this.setVisibilityFromAppState();
        this.setUpStartEndCheckbox();
        this.setUpStartEndDatePickers();
    }

    evenSplitCheck() { 
        const { startEndCheckboxUI } = this.uiElements;
        return startEndCheckboxUI.checked;
    }

    setVisibilityFromAppState() {
        let { ignitionLineComponentUI } = this.uiElements;
        if (appState.isLine()) {
            this.showComponent(ignitionLineComponentUI);
        } else {
            this.hideComponent(ignitionLineComponentUI);
        }
    }

    setUpStartEndCheckbox() {
        let { startEndCheckboxUI } = this.uiElements;
        startEndCheckboxUI.checked = false;
        startEndCheckboxUI.onclick = () => {
            this.setStartAndEndDateVisibility();
        }
    }

    setUpStartEndDatePickers() {
        let now = moment().utc();
        let oneHourFromNow = moment().add(1, 'h').utc();
        $(this.startTimeId).datetimepicker({ value: now, formatTime: 'h:mm a', formatDate: 'm.d.Y', step:15, maxDate: oneHourFromNow});
        $(this.endTimeId).datetimepicker({ value: oneHourFromNow, formatTime: 'h:mm a', formatDate: 'm.d.Y', step:15, minDate: now });
        this.setStartAndEndDateVisibility();

        $(this.startTimeId).change(() => {
            $(this.endTimeId).datetimepicker({minDate: this.startTimeMoment().utc()})
            this.evenlySplitDateTimes();
        });

        $(this.endTimeId).change(() => {
            $(this.startTimeId).datetimepicker({maxDate: this.endTimeMoment().utc()})
            this.evenlySplitDateTimes();
        });
    }

    startTimeMoment() {
        let start = this.startTime();
        return moment(start);
    }

    startTime() {
        let { ignitionStartUI } = this.uiElements;
        return ignitionStartUI.value;
    }

    endTimeMoment() {
        let end = this.endTime();
        return moment(end);
    }

    endTime() {
        let { ignitionEndUI } = this.uiElements;
        return ignitionEndUI.value;
    }

    showComponent(component) {
        if (!this.isVisible(component)) {
            component.classList.remove('hidden');
        }
    }

    hideComponent(component) {
        if (this.isVisible(component)) {
            component.classList.add('hidden');
        }
    }
    
    setStartAndEndDateVisibility() {
        let { startEndWrapperUI } = this.uiElements;
        if (this.evenSplitCheck()) {
            this.showComponent(startEndWrapperUI);
        } else {
            this.hideComponent(startEndWrapperUI);
        }
    }

    evenlySplitDateTimes() {}

    isVisible(component) {
        return !component.classList.contains('hidden');
    }

    ignitionTypeChange() {
        this.setVisibilityFromAppState();
    }
}