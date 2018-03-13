var ws_selected = null;
var oldState = null;
var scope = null;

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

function saveConfig(page){
	server	   = $('#server')[0].value;
	workspace  = $('#workspace')[0].value;
	addscope   = $('#addscope')[0].value;
	conf       = { server: server, workspace: workspace, scope: addscope };
	saveData(conf);
	page.target = escapeRegExp(addscope);
}

function onRequestError(error) {
	console.log("Error");
	console.log(error);
}

function escapeRegExp(string){
    return string.replace(/([.+?^${}()|\[\]\/\\])/g, "\\$1").replace(/\*/g, "\.\*");
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
		$('#scope').html('<div class="form-group"><label for="comment">Add scope:</label><input class="form-control" id="addscope" type="text" value="" placeholder="Add target to scope"></div>');
		$("#buttons").html('<button type="button" id="save" class="btn btn-default btn-sm"><i class="fa fa-send"></i>Save</button>');
		$('#save').bind('click', function(){ saveConfig(page);});

		if(scope != null){
			$('#addscope').val(scope);
		}
	}
	else if(ws != false && ws.length == 0){
		$("#message").html(alerts.noWorkspaces);
		$("#workspaces-list").html('');
		$("#buttons").html('');
		$('#scope').html('');
	}
	else if(!ws){
		$("#message").html(alerts.errorConnectionServer);
		$("#workspaces-list").html('');
		$("#buttons").html('');
		$('#scope').html('');
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
		scope = item.object.scope;
		page.target = escapeRegExp(scope);
  		ws_selected = item.object.workspace;
		if(ws_selected != null){
			Connect(page);
		}
	}

	$('#connect').bind('click', function(){ Connect(page);});
}