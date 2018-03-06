var countAnterior = 0;

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

	function countRequests(page){
		return Object.keys(page.requests).length;
	}

	showTable(page);

	setInterval(function(){
		countActual = countRequests(page);
		if (countActual != countAnterior){
			countAnterior = countActual;
			showTable(page);
		}

	}, 3000);

	function showTable(page){

		if(Object.keys(page.requests).length > 0){

			$('#resume-table').html('<table id="resume" class="table table-striped"><thead><tr><th>Method</th><th>Url</th><th>Actions</th></tr></thead><tbody>');

			for (const key of Object.keys(page.requests).reverse()) {
				$("#resume").append(
					$("<tr>").append($("<td>").text(page.requests[key].method))
						.append($("<td>").html('<a target="_blank" href="' + page.requests[key].url + '">' + page.requests[key].url + '</a>'))
						.append($("<td>").append(
								$("<button>",{class: "btn btn-default btn-sm"}).append($("<i>",{class:"fa fa-send"})).click(
								function (event) { sendRequestAndResponse(key); })
							)
						)
					);

			}

			$('#resume-table').append('</tbody></table>');
		}
		else{
			$('#resume-table').html('<div class="alert alert-info">No hay requests aun.</div>');
		}
	}		
}

function onError(error) {
	console.log(`Error: ${error}`);
}

$(document).ready(function () {

	var getting = browser.runtime.getBackgroundPage();
	getting.then(onGot, onError);	
});
