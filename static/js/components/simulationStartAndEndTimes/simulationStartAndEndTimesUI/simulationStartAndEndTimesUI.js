import { appState } from '../../../appState.js';
import { simulationStartAndEndTimesHTML } from './simulationStartAndEndTimesHTML.js';

export class SimulationStartAndEndTimesUI extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = simulationStartAndEndTimesHTML;
        this.uiElements = {
            ignitionStartUI: this.querySelector('#start-time-input'),
            ignitionEndUI: this.querySelector('#end-time-input'),
        };
        this.startTimeId = '#start-time-input';
        this.endTimeId = '#end-time-input';
    }

    connectedCallback() {
        this.setUpStartEndDatePickers();
    }

    setUpStartEndDatePickers() {
        let now = moment();
        let oneHourFromNow = moment().add(1, 'h');

        $(this.startTimeId).datetimepicker({ value: now.utc(), formatTime: 'h:mm a', formatDate: 'm.d.Y', step:15, maxDate: oneHourFromNow.utc()});
        appState.changeStartTime(now);
        $(this.endTimeId).datetimepicker({ value: oneHourFromNow.utc(), formatTime: 'h:mm a', formatDate: 'm.d.Y', step:15, minDate: now.utc() });
        appState.changeEndTime(oneHourFromNow);

        $(this.startTimeId).change(() => {
            let startMoment = this.startTimeMoment();
            // $(this.endTimeId).datetimepicker({minDate: startMoment.utc()})
            appState.changeStartTime(startMoment);
        });

        $(this.endTimeId).change(() => {
            let endMoment = this.endTimeMoment();
            // $(this.startTimeId).datetimepicker({maxDate: endMoment.utc()})
            appState.changeEndTime(endMoment);
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
}

window.customElements.define('simulation-start-and-end-times', SimulationStartAndEndTimesUI);