
var being_shown = {};
var data;
var cities;
var cur_res;
var map;
var directionsDisplay;
var directionsService;
var smokes = false;
var stops = 3;

var viewing_req_tab = false;
var requested_trips = {};
var requests = new Array();

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

$.extend({
    getUrlVars: function() {
        var vars = [], pair;
        var pairs = window.location.search.substr(1).split('&');
        for (var i = 0; i < pairs.length; i++) {
            pair = pairs[i].split('=');
            vars.push(pair[0]);
            vars[pair[0]] = pair[1] &&
                    decodeURIComponent(pair[1].replace(/\+/g, ' '));
        }
        return vars;
    },
    getUrlVar: function(name) {
        return $.getUrlVars()[name];
    }
});

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
    ori = route_info.ori.split(" ").join("-");
    dst = route_info.dst.split(" ").join("-");

    return route_info.name + " " +
        ori + " " + dst + " " +
        route_info.day;
}

function hash_route_info_with_date(ri)
{
    ori = ri.ori.split(" ").join("-");
    dst = ri.dst.split(" ").join("-");
    return ori.split(",")[0] + "-" + dst.split(",")[0]
        + "-" + ri.date.replace(/\//g, "-");
}

function add_request(route_info)
{
    // var requests = Cookies.getJSON("requests");
    // route_info["date"] = $("#pickup-date").val();
    // var ri_hash = hash_route_info(route_info);
    // requests.push(ri_hash);
    // Cookies.set("requests", requests);
    // Cookies.set(ri_hash, route_info);

    route_info["date"] = $("#pickup-date").val();
    console.log(route_info);
    var ri_hash = hash_route_info_with_date(route_info);
    if (!(ri_hash in requested_trips))
    {
        requested_trips[ri_hash] = new Array();
    }

    requested_trips[ri_hash].push(route_info);
    requests.push(route_info);
}

function remove_request(route_info)
{
    // var requests = Cookies.getJSON("requests");
    // var ri_hash = hash_route_info(route_info);
    // requests.splice(requests.indexOf(ri_hash), 1);
    // Cookies.set("requests", requests);
    // Cookies.remove(ri_hash);

    var ri_hash = hash_route_info_with_date(route_info);
    requested_trips[ri_hash].splice(
            requested_trips[ri_hash].indexOf(route_info), 1);
    requests.splice(requests.indexOf(route_info), 1);
    return requested_trips[ri_hash].length;
}

function is_requested(route_info)
{
    // var requests = Cookies.getJSON("requests");
    return $.inArray(route_info, requests) >= 0;
}

function on_contact_click(e)
{
    var index = +e.currentTarget.id.split("-")[1];
    var trip_data = cur_res[index];
    $("#msg-modal").modal();
}

function on_requested_tab_click(e)
{
    viewing_req_tab = true;
    var reqs = requests;
    var trips_ul = $("#trips-list");
    trips_ul.html("");
    for (var i = 0; i < reqs.length; i++)
    {
        var route_info = reqs[i];
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

        add_msg_modal_callback("requested-" + i, route_info);
    }

    $(".preview-route-btn").click(on_preview_route_click);
    $(".contact-btn").click(on_contact_click);
    $(".request-btn").click(on_request_click);

}

function on_request_click(e)
{
    var route_info;
    var index;
    var in_trips_tab = false;

    if (e.currentTarget.id.includes("requested"))
    {
        var reqs = requests;
        index = +e.currentTarget.id.split("-")[2];
        route_info = reqs[index];
        in_trips_tab = true;
    }
    else
    {
        index = +e.currentTarget.id.split("-")[1];
        route_info = cur_res[index];
    }

    var btn = $(e.currentTarget);

    if (btn.hasClass("requested-link"))
    {
        btn.html("Request");
        btn.removeClass("requested-link");
        btn.removeClass("red");
        btn.addClass("blue");
        btn.addClass("unrequested-link");
        var rem = remove_request(route_info);
        if (in_trips_tab)
        {
            if (rem == 0)
            {
                var ri_hash = hash_route_info_with_date(route_info);
                $("#" + ri_hash + "-li").remove();
            }
            else
            {
                $("#card-requested-" + index).remove();
            }
        }
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

    var trip_data;

    if (e.currentTarget.id.includes("requested"))
    {
        var reqs = requests;
        var index = +e.currentTarget.id.split("-")[2];
        trip_data = reqs[index];
    }
    else
    {
        var index = +e.currentTarget.id.split("-")[1];
        trip_data = cur_res[index];
    }

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

function create_msg_modal(ri_hash, ri)
{
    var template = $("#msg-modal-template").html();
    var msg_modal = Mustache.to_html(template, {
        id: ri_hash,
        img: ri.img,
        name: ri.name.split(" ")[0]
    });
    return msg_modal;
}

function hash_name(ri)
{
    var names = ri.name.split(" ");
    var hash = names[0] + "-" + names[names.length - 1];
    return hash;
}

function add_msg_modal_callback(index, route_info)
{
    var ri_hash = hash_route_info(route_info);

    $("#card-" + index + " .new-msg-btn").click(function ()
    {
        var nh = hash_name(route_info);
        var msg_modal = $("#msg-modal-" + nh);

        if (msg_modal.length == 0)
        {
            var msg_modal_html = create_msg_modal(nh, route_info);
            $("body").append(msg_modal_html);
            $("#msg-modal-" + nh).modal({
                ready: function(modal, trigger)
                {
                    being_shown[nh] = true;
                },
                complete: function()
                {
                    being_shown[nh] = false;
                }
            });
            var msg_modal_id = "#msg-modal-" + nh;

            $(msg_modal_id + " .msg-entry").keypress(function (e)
            {
                if (e.which == 13)
                {
                    e.preventDefault();
                    var msg_item = create_msg_item(nh, route_info);

                    if ($(".no-msgs-yet").length > 0)
                    {
                        $("#msg-dropdown").html(msg_item);
                    }
                    else
                    {
                        $("#msg-dropdown").append(msg_item);
                    }
                    $("#msg-stub-" + nh).click(function (e)
                    {
                        e.stopPropagation();
                        $("#msg-modal-" + nh).modal("open");
                        $("#msg-stub-" + nh + " .notif-svg").css("display",
                            "none");
                        if ($(".notif-collection:visible").length == 0)
                        {
                            $("#msg-notif-svg").css("display", "none");
                        }
                    });

                    var msg = $(msg_modal_id + " .msg-entry").val();
                    $(msg_modal_id + " .msg-body").append(
                        "<p class='msg-box my-msg'>"
                        + msg + "</p>");
                    $(msg_modal_id + " .msg-body").scrollTop(
                        $(msg_modal_id + " .msg-body")[0].scrollHeight);
                    $(msg_modal_id + " .msg-entry").val("");
                    $("#msg-stub-" + nh + " .msg-stub-preview").html();

                    setTimeout(function()
                    {
                        if (is_requested(route_info))
                        {
                            var msg;
                            if (Math.random() < 0.5)
                            {
                                msg = "In preparation for our ride, please make sure to wear deoderant";
                            }
                            else
                            {
                                msg = "Please dont bring food with you, I'm on a diet.";
                            }

                            $(msg_modal_id + " .msg-body").append(
                                "<p class='msg-box their-msg'>"
                                + msg + "</p>");
                            $("#msg-stub-" + nh + " .msg-stub-preview").html(msg.slice(0, 35) + "...");
                            if (!being_shown[nh])
                            {
                                $("#msg-stub-" + nh + " .notif-svg").css("display",
                                    "block");
                                $("#msg-notif-svg").css("display", "block");
                            }
                        }
                    }, 20000);

                    setTimeout(function()
                    {
                        var msg;
                        if (Math.random() < 0.5)
                        {
                            msg = "Of course, no problem :D";
                        }
                        else
                        {
                            msg = "No, I hate dogs!"
                        }

                        $(msg_modal_id + " .msg-body").append(
                            "<p class='msg-box their-msg'>"
                            + msg + "</p>");
                        $("#msg-stub-" + nh + " .msg-stub-preview").html(msg);
                        if (!being_shown[nh])
                        {
                            $("#msg-stub-" + nh + " .notif-svg").css("display",
                                "block");
                            $("#msg-notif-svg").css("display", "block");
                        }
                    }, 2000);
                }
            });

        }

        $("#msg-modal-" + nh).modal("open");
    });
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

    var trip = new Array();
    var trip_html = "";
    for (var i = 0; i < route_info.trip.length; i++)
    {
        trip.push(route_info.trip[i].split(",")[0]);
        if (i > 0 && i < route_info.trip.length - 1)
        {
            trip_html += '<br><span class="waypoint">';
            trip_html += '<i class="fa fa-arrow-right" aria-hidden="true"></i>';
            trip_html += route_info.trip[i].split(",")[0];
            trip_html += '</span>';
        }
        else if (i == 0)
        {
            trip_html += route_info.trip[i].split(",")[0];
        }
        else
        {
            trip_html += '<br><i class="fa fa-arrow-right" aria-hidden="true"></i>';
            trip_html += route_info.trip[i].split(",")[0];
        }
    }

    if (trip.length > 2)
    {
        var trip_html = trip.join(
                '<br>&nbsp;<i class="fa fa-arrow-right" aria-hidden="true"></i> ');
    }

    if (trip.length == 2)
    {
        var trip_html = trip.join(
            ' <i class="fa fa-arrow-right" aria-hidden="true"></i> ');
    }

    pretty_info.trip_html = trip_html;
    pretty_info.name = first;
    pretty_info.cost = Math.floor(route_info.cost);
    pretty_info.rating = prettify_rating(route_info.rating);
    var template = $("#card-template").html();
    var info = Mustache.to_html(template, pretty_info);
    return info;
}

function create_msg_item(nh, ri)
{
    var template = $("#msg-stub-template").html();
    var msg_item = Mustache.to_html(template, {
        id: nh,
        img: ri.img,
        name: ri.name.split(" ")[0],
        ori: ri.ori.split(",")[0],
        dst: ri.dst.split(",")[0]
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

    if (viewing_req_tab)
    {
        viewing_req_tab = false;
        $("#routes-tab").click();
    }


    var results = $(data).filter(function(i, n)
    {
        var ok_day = day % 4 == n.day % 4;
        var ok_ori = n.ori.toLowerCase().includes(ori.toLowerCase());
        var ok_dst = n.dst.toLowerCase().includes(dst.toLowerCase());
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
        $("#routes-div").append(card);
        add_msg_modal_callback(i, results[i]);
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
    // var requests = Cookies.get("requests");
    // if (!requests)
    // {
    //     Cookies.set("requests", new Array());
    // }
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
            autoFocus: false,
            delay: 0,
        });
    });
}

(function()
{
    var ori = $.getUrlVar("ori");
    var dst = $.getUrlVar("dst");
    $("#origin").val(ori);
    $("#destination").val(dst);
    $(".datepicker").datepicker();
    $("ul.tabs").tabs();
    $("#requested-tab-btn").click(on_requested_tab_click);
    $("#routes-tab").click(function()
    {
        $("#routes-div .preview-route-btn").click(on_preview_route_click);
        $("#routes-div .contact-btn").click(on_contact_click);
        $("#routes-div .request-btn").click(on_request_click);
        viewing_req_tab = false;
        filter_data();
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
