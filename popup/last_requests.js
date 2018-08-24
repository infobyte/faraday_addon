function onCreatedSendReqNResp(data) {
	console.log('Success:');
	console.log(data);
}

function onErrorSendReqNResp(error) {
	console.log('Error:');
	console.log(error);
}

function sendRequestAndResponse(requestId) {

  //var popupURL = browser.extension.getURL("popup/send_request.html");
  var creating = browser.tabs.create({
    url: "/popup/send_request.html?requestId="+requestId });
  creating.then(onCreatedSendReqNResp, onErrorSendReqNResp);

}

function onGot(page) {
	getData("conf", onData);

	function onData(item){ // Muestro el current workspace
		try{
			current_workspace = item.conf.workspace;
			$('#current-workspace').html(current_workspace);
		}
		catch(err){
			$('#current-workspace').html('No workspace selected');
		}
	}

	if(Object.keys(page.requests).length > 0){

		count = 0;
		$('#resume-table').html('<table id="resume" class="table table-striped"><thead><tr><th>Method</th><th>URL</th><th class="text-right">Actions</th></tr></thead><tbody>');

		for (const key of Object.keys(page.requests).reverse()) {
			count += 1;
			$("#resume").append(
				$("<tr>").append($("<td>").text(page.requests[key].method))
					.append($("<td>").html('<a target="_blank" href="' + page.requests[key].url + '">' + setLimitUrl(page.requests[key].url, 45) + '</a>'))
					.append($("<td align=\"right\">").append(
							$("<button>",{class: "btn btn-default btn-sm"}).append($("<i>",{class:"fa fa-send"})).click(
							function (event) { sendRequestAndResponse(key); })
						)
					)
				);
			if(count == 15){ // Solo lista hasta los utlimos 15 requests
				break;
			}

		}

		$('#resume-table').append('</tbody></table>');
	}
	else{
		$('#resume-table').html(alerts.noRequestsFound);
	}		
}

function onError(error) {
	console.log(`Error: ${error}`);
}

$(document).ready(function () {
	
	Power();

	// triggered each time a field changes status
	$('body').delegate('.lcs_check', 'lcs-statuschange', function() {
  		var status = ($(this).is(':checked')) ? true : false;
  		power = {state: status};
		browser.storage.local.set({power})
  			.then(null, onError);
	});

	var getting = browser.runtime.getBackgroundPage();
	getting.then(onGot, onError);	
});
