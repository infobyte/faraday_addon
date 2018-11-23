$(document).ready(function() {
	var getting = browser.runtime.getBackgroundPage(); // Me traigo los background scripts
	getting.then(onSuccessConfig, onRequestError);
});