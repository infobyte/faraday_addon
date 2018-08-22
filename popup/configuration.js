var ws_selected = null;
var oldState = null;
var scope = null;

function getData(name, event){
	let gettingItem = browser.storage.local.get(name);
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
	browser.storage.local.set({conf})
  		.then(null, onError);
	page.target   = escapeRegExp(addscope);
	page.faraday_server = server;
}

function onRequestError(error) {
	console.log("Error");
	console.log(error);
}

function setLimitUrl(url, length){
	if (url.length > length){
		return url.substring(0, length) + "...";
	}
	else{
		return url;
	}
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
		$('#scope').html('<div class="form-group"><label for="comment">Add scope:</label><input class="form-control" id="addscope" type="text" value="" placeholder="Insert your domain scope ej: *.faradaysec.com, www.faradaysec.com"></div>');
		$("#buttons").html('<button type="button" id="save" class="btn btn-default btn-sm">Save</button>');
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
	getData("power", stateButton);
}

function stateButton(item){
	if(item.power.state){
		$('#power').bootstrapToggle('on');
	}
	else{
		$('#power').bootstrapToggle('off');
	}
}

function onSuccessConfig(page){
	getData("conf", onGot);
	
	setInterval(function(){
		if(page.faraday_api != null){ //Verifica si se seteo el servidor antes de hacer el checkeo
			var currentState = page.info();
			if (currentState != oldState) {
				oldState = currentState;
				getData("conf", onGot);
			}
		}
	}, 2000); //Checkea el estado del servidor cada 2 seg, si se cae vuelve a cargar

	function onGot(item){
		console.log(item.conf);
		$('#server').val(item.conf.server);
		scope = item.conf.scope;
		page.target = escapeRegExp(scope);
  		ws_selected = item.conf.workspace;
		if(ws_selected != null){
			Connect(page);
		}
	}

	$('#connect').bind('click', function(){ Connect(page);});
}
