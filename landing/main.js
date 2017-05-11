
function initMap() {
	var uluru = {lat: 35, lng: -79};
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 4,
		center: uluru
	});

    $(".datepicker").datepicker();
    $("#login-btn").click(function()
    {
        $("#login-modal").modal("hide");
    });

	var coords = [
		{lat: 42, lng: -72.214},
		{lat: 25, lng: -80.821}
	];
	var path = new google.maps.Polyline({
		path: coords,
		geodesic: true,
		strokeColor: '#FF0000',
		strokeOpacity: 1.0,
		strokeWeight: 2
	});

    $(".card").click(function(ev)
    {
		console.log(ev);
		path.setMap(map);
    });

    $(".glyphicon").click(function()
    {
        $("#msg-modal").modal({backdrop: "static", keyboard: "false"});
    });

	$("#search-btn").click(function()
	{
	    $(".card").css("display", "block");
	});

	$("#send-btn").click(function()
	{
	    $("#msg-modal").modal("hide");
	});
}
