export class ValidationError extends HTMLElement {
	/** ===== Initialization block ===== */
	constructor(header, message) {
		super();
		this.innerHTML = `
			<div class="validation-error">
                <span class="validation-error-header">${header}</span>
                <span class="validation-error-message">${message}</span>
			</div>
		`;
	}
}	

window.customElements.define('validation-error', ValidationError);