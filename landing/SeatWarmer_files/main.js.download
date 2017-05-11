
var data;
var cities;
var cur_res;
var map;
var directionsDisplay;
var directionsService;
var smokes = false;
var stops = 3;

var stops_map = {
    "stops-any": 3,
    "stops-none": 0,
    "stops-1": 1,
    "stops-2": 2
};

var smoking_map = {
    "smoking": 1,
    "non-smoking": -1,
    "smoking-any": 0
};

var filters = {
    "smoking-filter": 0,
    "stops-filter": 3,
    "requested": 0
};

var sorts = {
    "sortby-price-low": function (a, b)
    {
        return a.cost - b.cost;
    },

    "sortby-price-high": function (a, b)
    {
        return b.cost - a.cost;
    },

    "sortby-dur-low": function (a, b)
    {
        return a.duration - b.duration;
    },

    "sortby-dur-high": function (a, b)
    {
        return b.duration - a.duration;
    },

    "sortby-rating": function (a, b)
    {
        return b.rating - a.rating;
    }

};

var sort_func = undefined;

function enable_filters()
{
    $("#stops-filter a").click(function(e)
    {
        filters["stops-filter"] = stops_map[e.currentTarget.id];
        $("#stops-name").html($(e.currentTarget).html())
        filter_data();
    });

    $("#smoking-filter a").click(function(e)
    {
        filters["smoking-filter"] = smoking_map[e.currentTarget.id];
        $("#smoking-name").html($(e.currentTarget).html())
        filter_data();
    });

}

function enable_sorts()
{
    $("#sort-by a").click(function(e)
    {
        $("#sort-name").html(": " + $(e.currentTarget).html());
        sort_func = sorts[e.currentTarget.id];
        filter_data();
    });
}

function initMap() {
	var center = {lat: 35, lng: -79};
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 4,
		center: center
	});

    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);
}

function hash_route_info(route_info)
{
    return route_info.name + " " +
        route_info.ori + " " + route_info.dst + " " +
        route_info.day;
}

function hash_route_info_with_date(ri)
{
    return ri.ori.split(",")[0] + "-" + ri.dst.split(",")[0]
        + "-" + ri.date.replace(/\//g, "-");
}

function add_request(ri)
{
    var requests = Cookies.getJSON("requests");
    var route_info = $.extend({}, ri);
    route_info["date"] = $("#pickup-date").val();
    var ri_hash = hash_route_info(route_info);
    requests.push(ri_hash);
    Cookies.set("requests", requests);
    Cookies.set(ri_hash, route_info);
}

function remove_request(route_info)
{
    var requests = Cookies.getJSON("requests");
    var ri_hash = hash_route_info(route_info);
    requests.splice(requests.indexOf(ri_hash), 1);
    Cookies.set("requests", requests);
    Cookies.remove(ri_hash);
}

function is_requested(route_info)
{
    var requests = Cookies.getJSON("requests");
    var ri_hash = hash_route_info(route_info);
    return $.inArray(ri_hash, requests) >= 0;
}

function on_contact_click(e)
{
    var index = +e.currentTarget.id.split("-")[1];
    var trip_data = cur_res[index];
    $("#msg-modal").modal();
}

function on_requested_tab_click(e)
{
    var reqs = Cookies.getJSON("requests");
    var trips_ul= $("#trips-list");
    trips_ul.html("");
    for (var i = 0; i < reqs.length; i++)
    {
        var route_info = Cookies.getJSON(reqs[i]);
        var card = create_card("requested-" + i, route_info);
        var template = $("#trip-template").html();
        var ri_hash = hash_route_info_with_date(route_info);
        var cbody = $("#" + ri_hash);
        if (cbody.length == 0)
        {
            var info = Mustache.to_html(template, {
                id: ri_hash,
                ori: route_info.ori,
                dst: route_info.dst,
                date: route_info.date});
            trips_ul.append(info);
            $("#" + ri_hash).html(card);
        }
        else
        {
            cbody.append(card);
        }
    }

    $(".preview-route-btn").click(on_preview_route_click);
    $(".contact-btn").click(on_contact_click);
    $(".request-btn").click(on_request_click);

}

function on_request_click(e)
{
    var index = +e.currentTarget.id.split("-")[1];
    var route_info = cur_res[index];
    var btn = $(e.currentTarget);

    if (btn.hasClass("requested-link"))
    {
        btn.html("Request");
        btn.removeClass("requested-link");
        btn.removeClass("red");
        btn.addClass("blue");
        btn.addClass("unrequested-link");
        remove_request(route_info);
    }
    else
    {
        btn.html("Cancel");
        btn.removeClass("unrequested-link");
        btn.removeClass("blue")
        btn.addClass("red")
        btn.addClass("requested-link");
        add_request(route_info);
    }
}

function on_preview_route_click(e)
{
    $("#over-map").css("display", "block");
    var index = +e.currentTarget.id.split("-")[1];
    var trip_data = cur_res[index];
    $(".card").removeClass("card-selected");
    $("#card-" + index).addClass("card-selected");
    var wps = new Array();

    if (trip_data.trip.length > 2)
    {
        for (var i = 1; i < trip_data.trip.length - 1; i++)
        {
            wps.push({
                location: trip_data.trip[i],
                stopover: false
            });
        }
    }

    var start = trip_data.ori;
    var end = trip_data.dst;
    var request = {
        origin: start,
        destination: end,
        waypoints: wps,
        travelMode: 'DRIVING'
    };

    var start = +new Date();

    directionsService.route(request, function(result, status)
    {
        var end = +new Date();
        var wait_time = 500 - end + start;
        if (wait_time < 0)
        {
            wait_time = 0;
        }

        setTimeout(function()
        {
            if (status == 'OK')
            {
                directionsDisplay.setDirections(result);
                $("#over-map").css("display", "none");
            }
        }, wait_time);
    });

    var loc_names = new Array();
    for (var i = 0; i < trip_data.trip.length; i++)
    {
        loc_names.push(trip_data.trip[i].split(",")[0]);
    }

    // $(".viewing-icon").css("display", "none");
    // $("#card-" + index + " .viewing-icon").css("display", "block");

    var arrow = ' <i class="fa fa-arrow-right" aria-hidden="true"></i> ';
    var trip_div_html = loc_names.join(arrow);
    $("#itinerary").html(trip_div_html);
}

function prettify_duration(hours_input)
{
    var days = Math.floor(hours_input / 24);
    var hours = Math.floor(hours_input - days * 24);
    var minutes = Math.floor((hours_input - Math.floor(hours_input)) * 60);

    var duration = new String();
    if (days > 0)
    {
        duration += "" + days + "d ";
    }

    if (hours > 0)
    {
        duration += "" + hours + "h ";
    }

    duration += "" + minutes + "m";

    return duration
}

function prettify_rating(rating)
{
    var pretty_rating = "";
    for (var i = 0; i < 5; i++)
    {
        if (i <= rating)
        {
            pretty_rating += '<i class="fa fa-star" aria-hidden="true"></i>';
        }
        else
        {
            pretty_rating += '<i class="fa fa-star-o" aria-hidden="true"></i>';
        }
    }

    return pretty_rating;
}

function create_card(index, route_info)
{
    var pretty_info = $.extend({}, route_info);
    pretty_info.duration = prettify_duration(route_info.duration);
    pretty_info.index = index;
    var names = route_info.name.split(" ");
    var first = names[0];
    var last = "";

    if (names.length > 1)
    {
        last = names[names.length - 1];
    }

    pretty_info.requested_css = "unrequested-link";
    pretty_info.requested_text = "Request";

    if (is_requested(route_info))
    {
        pretty_info.requested_css = "requested-link";
        pretty_info.requested_text = "Cancel";
    }

    pretty_info.name = first;
    pretty_info.cost = Math.floor(route_info.cost);
    pretty_info.rating = prettify_rating(route_info.rating);
    var template = $("#card-template").html();
    var info = Mustache.to_html(template, pretty_info);
    return info;
}

function create_msg_item(ri)
{
    var template = $("#msg-stub-template").html();
    var msg_item = Mustache.to_html(template, {
        img: ri.img,
        name: ri.name.split(" ")[0]
    });

    return msg_item;
}

function filter_data()
{
    var ori = $("#origin").val();
    var dst = $("#destination").val();
    var date = $("#pickup-date").val();
    var day = +date.split("/")[1];
    var total_ok = 0;
    var results = $(data).filter(function(i, n)
    {
        var ok_day = day % 4 == n.day % 4;
        var ok_ori = n.ori.includes(ori);
        var ok_dst = n.dst.includes(dst);
        var ok_smoker = n.smoker * filters["smoking-filter"] >= 0;
        var ok_stops = n.trip.length - 2 <= filters["stops-filter"];
        var ok = ok_day && ok_ori && ok_dst && ok_smoker && ok_stops;
        if (ok)
        {
            total_ok++;
        }

        return ok && total_ok < 20;
    }).get();

    if (sort_func)
    {
        results.sort(sort_func);
    }

    if (results.length == 0)
    {
        // $("#no-routes-found").css("display", "block");
    }
    else
    {
        $("#no-routes-found").css("display", "none");
    }

    $("#routes-div").html("");
    for (var i = 0; i < results.length; i++)
    {
        var card = create_card(i, results[i]);
        var msg_item = create_msg_item(results[i]);
        $("#routes-div").append(card);
        $("#msg-dropdown").append(msg_item);
        $("#msg-dropdown .collection-item").click(function (e)
        {
            e.stopPropagation();
            $("#msg-modal").modal("open");
        });
    }

    cur_res = results;

    $("#ori-label").html(ori);
    $("#dst-label").html(dst);
    $(".preview-route-btn").click(on_preview_route_click);
    $(".contact-btn").click(on_contact_click);
    $(".request-btn").click(on_request_click);
    $(".viewing-icon").css("display", "none");
    $(".collapsible").collapsible();
}

function init_cookies()
{
    var requests = Cookies.get("requests");
    if (!requests)
    {
        Cookies.set("requests", new Array());
    }
}

function init_data()
{
    $.getJSON("static/data/data-small.json", function(data_json)
    {
        data = data_json;
        $("#origin").on("keyup", filter_data);
        $("#destination").on("keyup", filter_data);
        $("#pickup-date").on("change", filter_data);
        filter_data();
    });

    $.getJSON("cities", function(cities_json)
    {
        cities = cities_json;
        $("input.autocomplete").autocomplete({
            source: cities["cities"],
            autoFocus: true,
            delay: 0,
        });
    });
}

(function()
{
    $(".datepicker").datepicker();
    $("ul.tabs").tabs();
    $("#msg-modal").modal();
    $("#requested-tab-btn").click(on_requested_tab_click);
    $("#routes-tab").click(function()
    {
        $("#routes-div .preview-route-btn").click(on_preview_route_click);
        $("#routes-div .contact-btn").click(on_contact_click);
        $("#routes-div .request-btn").click(on_request_click);
    });

    $("#msg-entry").keypress(function (e)
    {
        if (e.which == 13)
        {
            e.preventDefault();
            var msg = $("#msg-entry").val();
            $("#msg-body").append("<p class='msg-box my-msg'>" + msg + "</p>");
            $("#msg-body").scrollTop($("#msg-body")[0].scrollHeight);
            $("#msg-entry").val("");
            msg = "Of course, no problem :D";
            setTimeout(function()
            {
                $("#msg-body").append("<p class='msg-box their-msg'>" + msg + "</p>");
            }, 2000);
        }
    });

    $(".dropdown-button").dropdown({
        hover: true,
        belowOrigin: true,
        alignment: "right",
        constrainWidth: false,
    });

    init_cookies();
    init_data();

    enable_filters();
    enable_sorts();

})()
