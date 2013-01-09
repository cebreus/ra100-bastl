// ==UserScript==
// @name Ingress Intel enhance
// @description Enhances Ingress Intel, maybe
// @include http://www.ingress.com/intel
// @match http://www.ingress.com/intel
// ==/UserScript==
(function ()
{
	var players = [];
	var portals = [];
	var time = 0; //unix epoch timestamp in miliseconds
	var portalUrl = "http://www.ingress.com/intel?latE6=!LAT!&lngE6=!LNG!&z=18";
	var getThinnedEntitiesV2 = {};
	
// execute code on load
    window.addEventListener('load', function (e)  {

		$(document).ajaxSend(function(event, jqxhr, settings) {
			if (settings.url == "/rpc/dashboard.getThinnedEntitiesV2") getThinnedEntitiesV2 = $.parseJSON(settings.data);
		});

		$(document).ajaxComplete(function(event, xhr, settings) {
			if (settings.url == "/rpc/dashboard.getThinnedEntitiesV2") {
				ing_processPortals($.parseJSON(xhr.responseText));
			}
		});

    	var style = '<style>#enhance {z-index: 2000; position: absolute; left: 0px; top: 0px; display: block; background: #000; color: #59FBEA;}'+
    	'.button {cursor: pointer; background-color: #004F4A; color: #59FBEA; padding: 1px 15px; font-size: 13px; border: #59FBEA 1px solid; float: left;}'+
    	'#portaltitle {padding: 0px 10px; float: left; border: 1px solid #59FBEA; width: 200px; height: 23px; font-size: 12px;}'
    	+'#log {clear: both; float: left; width: 770px; max-height: 500px; overflow: auto; background: #000; color: #59FBEA; border: #59FBEA 1px solid; z-index: 20; display: block; font-size: 11px; min-height: 12px;}'+
    	'.row {clear: both; float: left;}'+
    	'.team {clear: both; float: left; font-weight: bold; font-size: 12px;}'+
    	'.name {font-weight: bold; padding-right: 5px;}'+
    	'.level {font-color: red; padding-right: 10px;}'+
    	'.areas {padding-left: 5px;}'+
    	'.area {padding-left: 5px; padding-right: 5px;}' +
    	'.message {clear: both; float: left; font-size: 12px; width: auto; margin-left: 5px; margin-right: 5px;}'+
    	'#textarea {display: none; position: absolute; z-index: 2000; color: #eee; background-color: #000; border: #59FBEA 1px solid; }'   	
    	+'</style>';

		$("head").append(style);
		$("body").prepend('<div id="enhance"></div>');
		$("#nav").empty();
		$("#enhance").append('<div class="button" id="copytitle">copy portal name</div>');
		$("#copytitle").click(function() {
			$("#portaltitle").val($("#portal_primary_title").text());
		});
		$("#enhance").append('<input class="text" id="portaltitle" type="text"></input>');

		$("#enhance").append('<div class="button" id="loaddata">Get agents</div>');
		$("#loaddata").click(function() {
			ing_getAgents();
		});

		$("#enhance").append('<div class="button" id="flushagents">Flush agents</div>');
		$("#flushagents").click(function() {
			players = [];
			ing_addLog('agents flushed');
		});

		$("#enhance").append('<div class="button" id="flushportals">Flush portals</div>');
		$("#flushportals").click(function() {
			portals = [];
			ing_addLog('portals flushed');
		});
		
		$("#enhance").append('<div class="button" id="showlog">LOG</div>');
		$("#showlog").click(function() {
			$("#log").toggle();
		});
		
		$("body").append('<textarea rows="20" cols="90" id="textarea"></textarea>');
		$("#enhance").append('<div class="button" id="showtextarea">TEXT</div>');
		$("#showtextarea").click(function() {
			$("#textarea").toggle();
		});	
		
		$("body").append('<textarea rows="20" cols="60" id="textarea"></textarea>');
		
		$("#enhance").append('<div id="log"></div>');
		$("#log").show();

    }, false);

	
/*
	function ing_ajaxLoadPortals() {
		ing_addLog("loading portals...");

		$.ajax({
			type: "POST",
			url: "/rpc/" + "dashboard.getThinnedEntitiesV2",
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(getThinnedEntitiesV2),
			success: function(a) {
				ing_processPortals(a);
			},
			error: function(e) {
				ing_addLog("request failed");
			},
			complete: function(a) {
			}
		});	
	}
*/

	function ing_ajaxGetNames(guids) {
		ing_addLog("getting codenames...");
		var requestdata = {"guids":	guids,
				"method":"dashboard.getPlayersByGuids"};

		$.ajax({
			type: "POST",
			url: "/rpc/" + "dashboard.getPlayersByGuids",
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(requestdata),
			success: function(a) {
				ing_processUsers(a);
			},
			error: function(e) {
				ing_addLog("request failed");
			},
			complete: function(a) {
			}
		});	
	}

	function ing_processPortals(data) {
		var count = 0;
		var processed = 0;

		if (data.result == undefined) { 
			ing_addLog('error: '+data.error);
			return;
		}

		$.each(data.result.map, function(i, dat) {
			$.each(dat.gameEntities, function(j, data) {
				if (data[1] > time) {
					portals[data[0]] = [];
					portals[data[0]]["team"] = "NEUTRAL";
					portals[data[0]]["address"] = "";
					portals[data[0]]["resonators"] = "";
					if (data[2].resonatorArray) {portals[data[0]]["resonators"] = data[2].resonatorArray.resonators};
					portals[data[0]]["team"] = data[2].controllingTeam.team;
					if (data[2].portalV2) {portals[data[0]]["address"] = ing_findPraguePart(data[2].portalV2.descriptiveText.ADDRESS);} 
					processed = processed +1;
				};
				count = count +1;
			});
		});

		var total = 0;
		for (i in portals) {
			total++;
		}

		ing_addLog(processed+' portals processed from '+count+' loaded. Total portals: '+total );
		
	}

	function ing_getAgents() {
		ing_addLog('extracting agents from portals...');
		for (key in portals) {
			var portal = portals[key];
			var area = portal["address"];
			var team = portal["team"];
			for (ires in portal["resonators"]) {
				var res = portal["resonators"][ires];
				if (res != null) {
					var level = res.level;
					ing_saveRes(res.ownerGuid, level, area, team);
				}
			}
		};

		var guids = [];

		for (key in players) {
			guids.push(key);
		}

		ing_ajaxGetNames(guids);
	}
	
	function ing_addLog(str) {
		$("#log").append('<span class="message">'+str+'</span>');
	}
	
	function ing_processUsers(data) {
		$.each(data.result, function(i, users) {
			players[users.guid]["name"] = users.nickname;
		});
		ing_addLog("codenames loaded");
		ing_showPlayers();
		
	}
	
	function ing_showPlayers() {
		$("#textarea").val($("#textarea").val()+'ENLIGHTENED\n');
		
		for (i in players) {
			var player = players[i];
			if (player.team == "ALIENS") {
				var	areas = "";
				for (j in player["areas"]) {
					areas = areas+j+" L"+player["areas"][j]+'\t';
				}
				if (player["name"] == "") player["name"] = i;
				$("#textarea").val($("#textarea").val()+player["name"]+'\t'+player["level"]+'\t'+areas+'\n');
			}
		}
		$("#textarea").val($("#textarea").val()+'\nRESISTANCE\n');
		for (i in players) {
			var player = players[i];
			if (player.team == "RESISTANCE") {
				var	areas = "";
				for (j in player["areas"]) {
					areas = areas+j+" L"+player["areas"][j]+'\t';
				}
				if (player["name"] == "") player["name"] = i;
				$("#textarea").val($("#textarea").val()+player["name"]+'\t'+player["level"]+'\t'+areas+'\n');
			}
		}
		$("#textarea").show();
	}
 
 
	function ing_saveRes(uid, level, area, team) {
		if (players[uid] != undefined) {
			//
		} else {
			players[uid] = [];
			players[uid]["team"] = team;
			players[uid]["level"] = 0;
			players[uid]["name"] = "";
			players[uid]["areas"] = [];
		}
		
		if (players[uid]["areas"][area] != undefined) {
			if (players[uid]["areas"][area] < level) {
				players[uid]["areas"][area] = level;
			}
		} else {
			players[uid]["areas"][area] = level;
		}
		
		if (level > players[uid]["level"]) players[uid]["level"] = level;
	}
	


	function ing_findPraguePart(address) {
		var ind = address.indexOf("Prague-Prague");
		var addr = "non-Prague"
		if (ind == -1) {
			ind = address.indexOf("Prague"); 
			if (ind == -1){ addr = "NA";}
			else {addr = address.substr(ind+7,2);}
		} else {addr = address.substr(ind+14,2);}
		if (addr.substr(1,1) == ",") addr = addr.substr(0,1);
		if (addr.substr(1,1) == "-") addr = addr.substr(0,1);
		return addr;
	}
	
	

})();

