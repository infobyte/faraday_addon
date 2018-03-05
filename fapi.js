// Faraday api connections

var xhttp = new XMLHttpRequest();

var faraday_api = null;
var workspace 	= null;

function post(data, path){ // Post con ajax
    xhttp.open("POST", faraday_api + path, false);
  	xhttp.withCredentials = true;
  	//xhttp.timeout = 10000; // Timeout de 10 segundos
  	xhttp.setRequestHeader("User-Agent", "Faraddon");
  	xhttp.setRequestHeader("Content-type", "application/json");
  	xhttp.send(JSON.stringify(data));
  	return xhttp.responseText;
}

function get(path){ // Get con ajax
  	xhttp.open("GET", faraday_api + path, false);
  	xhttp.withCredentials = true;
 	//xhttp.timeout = 20000; // Timeout de 10 segundos
  	xhttp.setRequestHeader("User-Agent", "Faraddon");
  	xhttp.setRequestHeader("Content-type", "application/json");
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
	catch{
		return false;
	}	
}

function info(){ // Checkea el estado de faraday server
	try{
		ra = JSON.parse(get('/v2/info'));
		if(ra['Faraday Server'] == 'Running'){
			return true;
		}
	}
	catch{
		//console.log(err);
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
	catch{
		return false;
	}
}

function createHost(ip, hostname, os){
	try{
		host = JSON.parse(addHost(ip, hostname, os));
	}
	catch{
		return false;
	}	
	try{
    	host_id = host.message.indexOf('Existing value for unique columns') == 0 ? host.object.id : host.object.id;
    	return host_id;
  	}
	catch{
		if(host.type == 'Host'){
    		return host.id;
    	}
	}
}


function createService(name, port, host_id){
	try{
		service = JSON.parse(addService(name, port, host_id));
	}
	catch{
		return false; //Si arroja error al parsear el JSON quiere decir que hubo un error interno del servidor
	}
	try{
    	service_id = service.message.indexOf('Existing value for unique columns') == 0 ? service.object.id : service.object.id;
    	return service_id;
  	}
	catch{
    	if(service.status == 'open'){
    		return service.id;
    	}	
	}
}

function  createVuln(name, vuln_data, description, resolution, easeofresolution, request, response, severity, service_id, method, path, website, params, refs = []){
	try{
		vuln = JSON.parse(addVuln(name, vuln_data, description, resolution, easeofresolution, request, response, severity, service_id, method, path, website, params, refs));
	}
	catch{
		return '<div class="alert alert-danger"><strong>ERROR!</strong> Ocurrio un error interno en el servidor, asegurese de que aun se encuentra activo.</div>';
	}	
	try{
    	message = vuln.message.indexOf('Existing value for unique columns') == 0 ? vuln.message : vuln.message;
    	return '<div class="alert alert-danger"><strong>ERROR!</strong>' + message + '</div>';
  	}
	catch{
    	return '<div class="alert alert-success"><strong>Success!</strong> La vulnerabilidad ah sido agregada a faraday</div>';
	}
}