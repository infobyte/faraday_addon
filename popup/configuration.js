var ws_selected = null;
var oldState = null;

function saveData(object){
	let setting = browser.storage.local.set({object});
	setting.then(null, onError);
}

function getData(event){
	let gettingItem = browser.storage.local.get();
	gettingItem.then(event, onError);
}

function onError(error){
  console.log(`Error: ${error}`);
}

function saveConfig(){
	server	   = $('#server')[0].value;
	workspace  = $('#workspace')[0].value;
	conf       = { server: server, workspace: workspace };
	saveData(conf);
}

function onRequestError(error) {
	console.log("Error");
	console.log(error);
}

function Connect(page){
	page.faraday_api = $("#server").val() + '/_api';
	ws = page.getAllWorkspaces();
	if(ws != false && ws.length > 0){
		options = '';
		for(var i = 0; i < ws.length; i++){
			if(ws[i] == ws_selected){
				options += '<option value="' + ws[i] + '" selected>' + ws[i] + '</option>';
				continue;
			}
			options += '<option value="' + ws[i] + '">' + ws[i] + '</option>';
		}
		$("#message").html('');
		$("#workspaces-list").html('<label for="comment">Workspaces:</label><select class="form-control" id="workspace">' + options + '</select>');
		$("#buttons").html('<button type="button" id="save" class="btn btn-default btn-sm"><i class="fa fa-send"></i>Save</button><button type="button" id="cancel" class="btn btn-default btn-sm"><i class="fa fa-cancel"></i>Cancel</button>');
		$('#save').bind('click', function(){ saveConfig();});
	}
	else if(ws != false && ws.length == 0){
		$("#message").html('<div id="message" class="alert alert-danger">No se encontraron wokspaces en el servidor</div>');
		$("#workspaces-list").html('');
		$("#buttons").html('');
	}
	else if(!ws){
		$("#message").html('<div id="message" class="alert alert-danger">Ocurrio un error al conectar al servidor</div>');
		$("#workspaces-list").html('');
		$("#buttons").html('');
	}
}

function Power(){ // On/Off Faraddon
	console.log($("#power").val());
}

function onSuccessConfig(page){
	getData(onGot);
	
	setInterval(function(){
		var currentState = page.info();
		if (currentState != oldState) {
			oldState = currentState;
			getData(onGot);
		}
	}, 2000); //Checkea el estado del servidor cada 2 seg, si se cae vuelve a cargar

	function onGot(item){
		$('#server').val(item.object.server);
  		ws_selected = item.object.workspace;
		if(ws_selected != null){
			Connect(page);
		}
	}

	$('#connect').bind('click', function(){ Connect(page);});
}