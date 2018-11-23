var estadoAnterior = null;
var vulnerabilities_names = [];
var vulnerabilities = {};

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function cancel() {
	var winId = browser.windows.WINDOW_ID_CURRENT;
	var removing = browser.windows.remove(winId);
}

var requestNumber = null;
var request = null;

function returnBeautyHeaders(header){ // Esta funcion parsea las headers y devuelve un string
	headers = '';
	for(i = 0; i < header.length; i++){
		headers += header[i]['name'] + ': ' + header[i]['value'] + "\r\n";
	}
	return headers;
}

function decodeArrayBuffer(buffer){
	enc = new TextDecoder();
    return enc.decode(buffer);
}

function returnRequestBody(requestBody){ // Esta funcion es para parsear los datos enviados por POST
	params = new Array();
	if(requestBody.requestBody != null){
    	if('formData' in requestBody.requestBody){
    		for (var key in requestBody.requestBody.formData) {
  				params.push(key + '=' + requestBody.requestBody.formData[key][0]);
            }
            request.params = params.join('&');
            return request.params;
    	}
    	if('raw' in requestBody.requestBody){
        	request.params = decodeArrayBuffer(requestBody.requestBody.raw[0].bytes);
        	return request.params;
    	}
	}
	else{
		request.params = getUrlParams();
		return '';
	}
}

function methodAndPath(request){
	url = setUrl();
    request.pathname = url.pathname;
    line = request.method + ' ' + url.pathname + url.search + ' ' + request.protoAndversion + "\r\n";
    return line;
}


function getPort(){
	url = setUrl();
    if(url.port != ""){
    	port = url.port;
    	return parseInt(port);
    }
    else{
    	port = url.protocol.indexOf('https') == 0 ? 443 : 80; 
    	return port;
    }
}

function setUrl(){
	url = document.createElement('a');
    url.href = request.url;
    return url;
}

function getHost(){
	url = setUrl();
    return url.host;
}

function getUrlParams(){
	url = setUrl();
    params = url.search.split('?')[1];
    return params;
}

function sendToFaraday(page){
	var message = null;
	host_id = page.createHost(request.ip, getHost(), '');
	if(!host_id){
    	message = alerts.internalErrorServer;
    }
	else{
		service_id = page.createService(request.statusLine.split('/')[0].toLowerCase(), getPort(), host_id);
		if(!service_id){
			message = alerts.internalErrorServer;		
		}
		else{
			name 			 = $('#name')[0].value;
			vuln_data 		 = $('#data')[0].value;
			description 	 = $('#description')[0].value;
			easeofresolution = $('#easeofresolution')[0].value;
			resolution		 = $("#resolution")[0].value;
			severity	     = $('#severity')[0].value;
			host_request     = $('#request')[0].value;
			host_response    = $('#response')[0].value;
			references		 = $('#references')[0].value == "" ? [] : $('#references')[0].value.split(',');

			message = page.createVuln(name, vuln_data, description, resolution, easeofresolution, host_request, host_response, severity, service_id, request.method, request.pathname, getHost(), request.params, references);
		}
	}

	$("#message").html(message);   
}

function setInputDisabled(val){
	
	$("input, textarea, button, select").prop("disabled",val);
}

function enableInputs(){

	setInputDisabled(false);	
}

function disableInputs(msg){
	
	setInputDisabled(true);
	$('#header-message').html('<div class="alert alert-danger"><strong>ERROR! </strong>' + msg + '</div>');
}

function fillContent(request) {
	$("#request").text(methodAndPath(request) + returnBeautyHeaders(request.requestHeaders) + "\r\n" + returnRequestBody(request.requestBody));
	$("#response").text(request.statusLine + "\r\n" + returnBeautyHeaders(request.responseHeaders) + "\r\n" + request.responseBody);

}

function autoCompleteInputs(vuln_name){

	$("#name").val(vulnerabilities[vuln_name].name);
	$("#description").val(vulnerabilities[vuln_name].description);
	$("#resolution").val(vulnerabilities[vuln_name].resolution);
	$("#severity").val(vulnerabilities[vuln_name].exploitation).change();
	$("#references").val(vulnerabilities[vuln_name].references);

}

function onSuccess(page) {
	getData("conf", onData);

	$('#faraday_send').bind('click', function(){ 
		sendToFaraday(page);
	});
	
	for (var i in page.requests) {
		if (i == requestNumber){
			request = page.requests[i];
			fillContent(page.requests[i]);		
		}
	}

	$("#tags").click(function(){
		j_vuln = page.getVulnerabilitiesTemplates();
		for(i = 0; i < j_vuln.length; i++){
			vuln = j_vuln[i].doc;
			vulnerabilities_names[i] = vuln.name;
			vulnerabilities[vuln.name] = {'name': vuln.name, 'description': vuln.description, 'resolution': vuln.resolution, 'exploitation': vuln.exploitation, 'references': vuln.refs};
		}	
	});

	setInterval(function(){

		var estadoActual = page.info();
		if (estadoActual != estadoAnterior) {
			estadoAnterior = estadoActual;
			getData(onData);
		}
	}, 4000); //Checkea el estado del servidor cada 2 seg, si se cae vuelve a cargar

	$( function() {
    
    $( "#tags" ).autocomplete({
      source: vulnerabilities_names,
	  
	  select: function (e, ui) {

        autoCompleteInputs(ui.item.value);
    		}
    	});
  	} );

	function onData(item){

		try{
			if(page.checkIsDataIsEmpty(item.conf.server, item.conf.workspace)){

				page.faraday_api = item.conf.server + '/_api';
				page.workspace 	 = item.conf.workspace;

				state_info = page.info();
				//estadoAnterior = state_info;
	            //alert(state_info);
				if(state_info){
					$('#header-message').html('');
					enableInputs();
					if(!page.checkIsWorkspaceIsValid()){
						disableInputs(alerts.workspaceNoExist); //Workspace invalido
						$('#message').html('');
					}
				}
				else{
					disableInputs(alerts.internalErrorServer2); // Servidor caido o no esta logueado
					$('#message').html('');
				}

			}
		}	
		catch(err){
			disableInputs(alerts.noConfigData); // No se seteó data en la config

		}
	}
}		

function onRequestError(error) {
	console.log("Error");
	console.log(error);
}

$(document).ready(function() {
	requestNumber = getUrlParameter('requestId');
	var getting = browser.runtime.getBackgroundPage();
	getting.then(onSuccess, onRequestError);	
});