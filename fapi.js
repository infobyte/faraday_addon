// Faraday api connections

var alerts = {'internalErrorServer': '<div class="alert alert-danger"><strong>ERROR!</strong> An internal error occurred on the server, make sure you have logged in or are still active.</div>',
			  'messageAddVuln': '<div class="alert alert-success"><strong>Success!</strong> The vulnerability has been added to Faraday.</div>',
			 };

var faraday_api = null;
var workspace 	= null;

function post(data, path){ // Post con ajax
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", faraday_api + path, false);
  	xhttp.withCredentials = true;
  	//xhttp.timeout = 10000; // Timeout de 10 segundos
  	xhttp.setRequestHeader("User-Agent", "Faraddon");
  	xhttp.setRequestHeader("Content-Type", "application/json");
  	xhttp.send(JSON.stringify(data));
  	return xhttp.responseText;
}

function get(path){ // Get con ajax
  	var xhttp = new XMLHttpRequest();
  	xhttp.open("GET", faraday_api + path, false);
  	console.log(faraday_api + path);
  	xhttp.withCredentials = true;
 	//xhttp.timeout = 20000; // Timeout de 10 segundos
  	xhttp.setRequestHeader("User-Agent", "Faraddon");
  	xhttp.setRequestHeader("Content-Type", "application/json");
  	xhttp.send();
  	return xhttp.responseText;
}

function addHost(ip, hostname, os){ // Agrega un Host en el workspace
	data = {"ip": ip,
	        "hostnames":[hostname],
	        "mac":"00:00:00:00:00:00",
	        "description":"",
	        "default_gateway":"None",
	        "os": os,
	        "owned":false,
	        "owner":""};

	r = post(data, '/v2/ws/' + workspace + '/hosts/');
	//console.log(r);
	return r; // Retorna el id del host, necesario para agregar el servicio
}

function addService(name, port, host_id){ // Agrega un servicio al host
	data = {"name":name,
	        "description":"",
	        "owned":false,
	        "owner":"",
	        "ports":[port],
	        "protocol":name,
	        "parent":host_id,
	        "status":"open",
	        "version":"1.1",
	        "metadata":{"update_time":0,
	        "update_user":"",
	        "update_action":0,
	        "creator":"",
	        "create_time":0,
	        "update_controller_action":"UI Web New",
	        "owner":""},
	        "type":"Service"};

	r = post(data, '/v2/ws/' + workspace + '/services/');
	//console.log(r);
	return r; // Retorna el id del host + servicio, necesario para agregar la vuln        
}

function addVuln(name, vuln_data, description, resolution, easeofresolution, request, response, severity, service_id, method, path, website, params, refs = []){ // Le clava una vuln al host
	data = {"metadata":{"update_time":0,
	        "update_user":"",
	        "update_action":0,
	        "creator":"Web UI",
	        "create_time":0,
	        "update_controller_action":"UI Web New",
	        "owner":""},
	        "obj_id":"",
	        "owner":"",
	        "parent":service_id,
	        "parent_type":"Service",
	        "type":"VulnerabilityWeb",
	        "ws":workspace,
	        "confirmed":true,
	        "data":vuln_data,
	        "desc":description,
	        "easeofresolution":easeofresolution,
	        "impact":{"accountability":false,
	        "availability":false,
	        "confidentiality":false,
	        "integrity":false},
	        "name":name,
	        "owned":false,
	        "policyviolations":[],
	        "refs":refs,
	        "resolution":resolution,
	        "severity":severity,
	        "status":"opened",
	        "method":method,
	        "params":params,
	        "path":path,
	        "pname":"",
	        "query":"",
	        "request":request,
	        "response":response,
	        "website":website,
	        "_attachments":{},
	        "description":"",
	        "protocol":"",
	        "version":""};

	r = post(data, '/v2/ws/' + workspace + '/vulns/');
	return r;
	//console.log(r);        

}

function getAllWorkspaces(){ // Retorna un array con todos los workspaces ['test', 'example']
	try{
		workspaces = [];
		r = JSON.parse(get('/v2/ws/'));
		for(var i=0; i < r.length; i++){
			workspaces.push(r[i].name);
		}
		return workspaces;
	}
	catch(err){
		return false
	}	
}

function getVulnerabilitiesTemplates(){
	try{
		j = JSON.parse(get('/v2/vulnerability_template/'));
		return j.rows;
	}
	catch(err){
		return false;
	}	
}

function info(){ // Checkea el estado de faraday server
	var ra = null;
	try{
		ra = JSON.parse(get('/v2/info'));
		if(ra['Faraday Server'] === 'Running'){
			console.log(ra);
			return true;
		}
	
	}
	catch(error){
		console.log("Entro en el catch "+error);
		console.log(ra);
		return false;
	}	

}

function checkIsDataIsEmpty(server, workspace){
	if(server != '' && workspace != ''){
		return true;
	}
	else{
		return false;
	}
}

function checkIsWorkspaceIsValid(){
	try{
		JSON.parse(get('/v2/ws/' + workspace + '/'));
		return true;
	}
	catch(err){
		return false;
	}
}

function createHost(ip, hostname, os){
	try{
		host = JSON.parse(addHost(ip, hostname, os));
	}
	catch(err){
		return false;
	}	
	try{
    	host_id = host.message.indexOf('Existing value for unique columns') == 0 ? host.object.id : host.object.id;
    	return host_id;
  	}
	catch(err){
		if(host.type == 'Host'){
    		return host.id;
    	}
	}
}


function createService(name, port, host_id){
	try{
		service = JSON.parse(addService(name, port, host_id));
	}
	catch(err){
		return false; //Si arroja error al parsear el JSON quiere decir que hubo un error interno del servidor
	}
	try{
    	service_id = service.message.indexOf('Existing value for unique columns') == 0 ? service.object.id : service.object.id;
    	return service_id;
  	}
	catch(err){
    	if(service.status == 'open'){
    		return service.id;
    	}	
	}
}

function  createVuln(name, vuln_data, description, resolution, easeofresolution, request, response, severity, service_id, method, path, website, params, refs = []){
	try{
		vuln = JSON.parse(addVuln(name, vuln_data, description, resolution, easeofresolution, request, response, severity, service_id, method, path, website, params, refs));
	}
	catch(err){
		return alerts.internalErrorServer;
	}	
	try{
    	message = vuln.message.indexOf('Existing value for unique columns') == 0 ? vuln.message : vuln.message;
    	return '<div class="alert alert-danger"><strong>ERROR! </strong>' + message + '</div>';
  	}
	catch(err){
    	return alerts.messageAddVuln;
	}
}