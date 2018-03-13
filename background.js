// FALTA:

/*
- Boton off/onn funcionalidad
- Agregar buscador de templates y que autocomplete los campos al dar click - OK
- Ordenar requests, mostrar los ultimos arriba - OK
- Mejorar tiempo real, que se muestre lo que escribe mientras recarga - no era necesario, gracias a cesar
- Agregar tiempo real a los requests
- Mostrar los ultimos 15 requests en la ventana del icono - OK
- Agregar mas data a la vuln (method, params, website, path, reference si la hay etc) - OK
- Ordenar un poco el codigo
  - Mensajes de error en un array
  - Pasar los mensajes de error a ingles

*/

var target = "*://*/*";
var requests = {};
var tabId = 0;
var requests_tmp = {};


function returnRequests() {
	return requests;
}

function getRequestAndResponseBody(e) {
 if(tabId == e.tabId && e.url.match(target) != null){ // Verifico que el tabId dle request sea igual al tabId de donde estamos parados
 	requests_tmp = {'method': e.method, 'url': e.url,'requestBody': e }; //Creamos un array dentro del array requests, que tiene como nombre el requestId
 	console.log(e);

 	let filter = browser.webRequest.filterResponseData(e.requestId);
 	let decoder = new TextDecoder("utf-8");
 	let encoder = new TextEncoder();

 	filter.ondata = event => {
   		let str = decoder.decode(event.data, {stream: true});
   		requests_tmp['responseBody'] = str; //Guardamos el response body en el array requests, en su correspondiente requestId
   		requests[e.requestId] = requests_tmp; // Si hay data cargo todo en el objeto requests
   		filter.write(encoder.encode(str));
 	}

 	filter.onstop = event => { // Verifico que termine de enviar data y ahi desconecto, ya que el responseBody no estaba completo
    	console.log("finished");
    	filter.disconnect();
 	}

 	return {};

 }

}

function getResquestHeaders(e){
	if(tabId == e.tabId && e.url.match(target) != null){ // Verifico que el tabId del request sea igual al tabId de donde estamos parados
		try{  //Esto lo hago por que solo estoy creando un array a partir del main_frame, es decir el primer request
			requests_tmp['requestHeaders'] = e.requestHeaders; //Guardamos el request headers en el array requests, en su correspondiente requestId
			console.log(e);
		}
		catch{
			return false;
		}
	}
}

function getResponseHeaders(e){
	if(tabId == e.tabId && e.url.match(target) != null){ // Verifico que el tabId dle request sea igual al tabId de donde estamos parados
		try{  //Esto lo hago por que solo estoy creando un array a partir del main_frame, es decir el primer request
			requests_tmp['responseHeaders'] = e.responseHeaders; //Guardamos el response headers en el array requests, en su correspondiente requestId
			requests_tmp['statusLine'] = e.statusLine; //get status line
			requests_tmp['ip'] = e.ip // get ip
			requests_tmp['protoAndversion'] = e.statusLine.split(' ')[0]; // HTTP/version
}
		catch{
			return false;
	    }
    }
}

function handleActivated(e) {
  tabId = e.tabId; // Arroja el id del tab donde estes parado
  console.log(tabId);
}

browser.tabs.onActivated.addListener(handleActivated);

browser.webRequest.onBeforeRequest.addListener( //Este evento solo se ejecuta en el main_frame
 getRequestAndResponseBody,
 {urls: [target], types: ["main_frame", "xmlhttprequest"]},
 ["blocking", "requestBody"]
);

browser.webRequest.onBeforeSendHeaders.addListener( // Evento para caputar los request headers
  getResquestHeaders,
  {urls: [target], types: ["main_frame", "xmlhttprequest"]},
  ["blocking", "requestHeaders"]
);

browser.webRequest.onCompleted.addListener( // Una vez el request esta completo, podemos capturar los response headers
  getResponseHeaders,
  {urls: [target], types: ["main_frame", "xmlhttprequest"]},
  ["responseHeaders"]
);