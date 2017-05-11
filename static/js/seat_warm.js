var cities;

(function() {

    $.getJSON("cities", function(cities_json)
    {
        cities = cities_json;
        console.log(cities);
        console.log($("input.autocomplete"));
        $("input.autocomplete").autocomplete({
            source: cities["cities"],
            autoFocus: true,
            delay: 0,
        });
    });

    // var input_origin = document.getElementById('origin');
    // var searchBox_origin = new google.maps.places.SearchBox(input_origin);
    // var input_dest = document.getElementById('destination');
    // var searchBox_destination = new google.maps.places.SearchBox(input_dest);

    //When the user enters a text box, the text highlights
    $("input:text").focus(function() { $(this).select(); } );

    $(".datepicker").datepicker();

    $("#search-btn").click(function (e)
    {
        window.location.replace(
            "http://wallarelvo-tower.csail.mit.edu:8000/search?ori="
            + $("#origin").val()
            + "&dst=" + $("#destination").val());
    });

    //When the user presses return x, the text highlights
    $("#origin").keypress(function(event){
      if(event.which == 13){
          $("#destination").focus()
      }
    });
    $("#destination").keypress(function(event){
      if(event.which == 13){
          $("#pickup-date").focus()
      }
    });
    $(document).keypress(function(event){
        if (event.which == 45){
           var prof = $('#profile-modal-Julia-Ormond');
           if(prof.css('display') == 'none'){
               prof.show();
           } else{
               prof.hide();
           }

       }
    });

    $("#origin").focus()

    })();



    var fb_id;
	  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "http://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
	js.onload = function(){
		 FB.init({
			appId: '978370115599993',
			status: true,
			cookie: true,
			xfbml: true,
			version: 'v2.9'
		});
		checkLoginState();
		}
  }(document, 'script', 'facebook-jssdk'));

  function setRating(it, it2){
      console.log(it);
      gg = it.parent();

      var chil = gg.children();
      for(i=0;i<chil.length;i++){
          if(i<3){
             chil[i].innerHTML = "&starf;"
          } else {
             chil[i].innerHTML = "&star;"
          }

      }
  }
  function highlightFeedback(item,hightlight){
      if(hightlight){
          item.children().css( "color", "red" );
      } else {
          item.children().css( "color", "black" );
      }

  }
  function showUserName(){
    FB.api('/me', function(response) {
        if(!!response.name){
            console.log(response.name);
            console.log(response.id);
            fb_id = response.id;
            var welcome_msg = document.getElementById('welcome_msg')
            welcome_msg.innerHTML = 'Welcome, '+response.name
            welcome_msg.style.display = "inline"
        }

    });
  }
  function showProfilePicture(){
      if(fb_id==null){
          showUserName();
      }
    FB.api("/"+fb_id+"/picture",
        function (response) {
          if (response && !response.error) {
              var profile_img = document.getElementById("profile_img");
                profile_img.src=response.data.url;
                profile_img.style.display="inline"
          }
    });
  }

function fb_login(){
    FB.login(function(response) {
        updateFBStatus(response.status === 'connected');
    });
}
function fb_logout(){
    FB.logout(function(response) {
        updateFBStatus(false);
    });
}
function updateFBStatus(isLoggedIn){
    if (isLoggedIn) {
        $('.waves-effect').show()
        $('.button--facebook').hide();
        showUserName();
        showProfilePicture();
        $('.fb-information').show();

    } else {
        $('.button--facebook').show();

        $('.waves-effect').hide()
        $('#welcome_msg').hide()
        $('#profile_img').hide()
    }
}

  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      updateFBStatus(response.status === 'connected')
    });
      FB.Event.subscribe('auth.authResponseChange', function (response) {
          updateFBStatus(response.status === 'connected')
    });
  }








  //google.maps.places.PlacesService()
     // var placeSearch, autocomplete;


      // function initAutocomplete() {
        // Create the autocomplete object, restricting the search to geographical
        // location types.
        // console.log($("#origin"));
        // ori_comp = new google.maps.places.Autocomplete(
        //     #<{(|* @type {!HTMLInputElement} |)}>#(document.getElementById('origin')),
        //     {types: ['geocode']});
        // dst_comp = new google.maps.places.Autocomplete(
        //    #<{(|* @type {!HTMLInputElement} |)}>#(document.getElementById('destination')),
        //     {types: ['geocode']});
        //
        // // When the user selects an address from the dropdown, populate the address
        // // fields in the form.
        // ori_comp.addListener('place_changed', function(){
		// 	console.log(ori_comp.getPlace());
        //
		// });
      // }


        // function geolocate() {
        // if (navigator.geolocation) {
        //   navigator.geolocation.getCurrentPosition(function(position) {
        //     var geolocation = {
        //       lat: position.coords.latitude,
        //       lng: position.coords.longitude
        //     };
        //     var circle = new google.maps.Circle({
        //       center: geolocation,
        //       radius: position.coords.accuracy
        //     });
        //     autocomplete.setBounds(circle.getBounds());
        //   });
        // }
      // }
