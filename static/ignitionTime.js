class IgnitionTime extends HTMLElement {
	constructor(index) {
		super();
		this.innerHTML = `
			<div class="two fields" style="margin-bottom: 15px">
	          <div class="ignition-id" id="id-container">
	            <span id="ignition-time-id">${index}</span>
	          </div>
	          <div class="field">
	            <div class="ui input left icon">
	              <i class="calendar icon"></i>
	              <input name="ignition_time" id="ign-time" type="text" placeholder="YYYY-MM-DD_HH:MM:SS">
	            </div>
	            <span id="ignition-time-warning" class="not-valid-warning">The ignition time must be between 1/1/1979 and now in the format YYYY-MM-DD_HH:MM:SS</span>
	          </div>
	          <div class="field">
	              <select name="fc_hours" class="ui dropdown" id="fc-hours${index}">
	                  <option value="3">3</option>
	                  <option value="6">6</option>
	                  <option value="9">9</option>
	                  <option value="12">12</option>
	                  <option value="18">18</option>
	                  <option value="24">24</option>
	                  <option value="48">48</option>
	              </select>
	          </div>
	        </div>
		`;
		this.index = index;
	}
	connectedCallback() {
		$(`#fc-hours${this.index}`).dropdown();
		$(`#ign-time`).datetimepicker({ value: moment().utc(), formatTime: 'h:mm a', formatDate: 'm.d.Y', step:15 });
	}

	updateIndex(newIndex) {
		this.index = newIndex;
		this.querySelector('#ignition-time-id').innerText = newIndex;
	}

	hideIndex() {
		this.querySelector('#id-container').style.display = "none";
	}

	showIndex() {
		this.querySelector('#id-container').style.display = "inline-block";
	}

	isValid() {
		let ign_time_value = this.querySelector('#ign-time').value;
		this.querySelector(`#ignition-time-warning`).className = 'not-valid-warning';
		if(!isValidTime(ign_time_value)) {
			this.querySelector(`#ignition-time-warning`).className = 'not-valid-warning activate-warning';
			return false;
		}
		return true;
	}

	getIgnitionTimeAndDuration() {
		return [this.querySelector('#ign-time').value, parseInt(this.querySelector(`#fc-hours${this.index}`).value)];
	}
}
window.customElements.define('ignition-time', IgnitionTime);
