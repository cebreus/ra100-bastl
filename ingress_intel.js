// ==UserScript==
// @name Ingress Intel enhance
// @description Enhances Ingress Intel, maybe
// @include http://www.ingress.com/intel
// @include http://*.ingress.com/intel
// ==/UserScript==
(function ()
{
	var players = [];
	
	var headID = document.getElementsByTagName("head")[0];         
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.id = 'myjQuery';
    newScript.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js';
    headID.appendChild(newScript);

    window.addEventListener('load', function (e)  {
    	var style = '<style>#enhance {z-index: 2000; position: absolute; left: 0px; top: 0px; display: block; background: #000; color: #59FBEA;}'+
    	'.button {cursor: pointer; background-color: #004F4A; color: #59FBEA; padding: 1px 15px; font-size: 13px; border: #59FBEA 1px solid; float: left;}'+
    	'#portaltitle {padding: 0px 10px; float: left; border: 1px solid #59FBEA; width: 427px; height: 23px; font-size: 12px;}'
    	+'#log {clear: both; float: left; width: auto; max-height: 400px; overflow: auto; background: #000; color: #59FBEA; border: #59FBEA 1px solid; z-index: 20; display: block; font-size: 11px;}'
    	+'</style>';
		var tag = '<div id="enhance"></div>';
		$("head").append(style);
		$("body").prepend(tag);
		$("#nav").empty();
		$("#enhance").append('<div class="button" id="copytitle">copy portal name</div>');
		$("#copytitle").click(function() {
			$("#portaltitle").text($("#portal_primary_title").text());
		});
		$("#enhance").append('<div class="text" id="portaltitle"></div>');

		$("#enhance").append('<div class="button" id="loaddata">Get portals</div>');
		$("#loaddata").click(function() {
			ing_ajaxCall();
		});
		$("#enhance").append('<div class="button" id="showlog">Toggle log</div>');
		$("#showlog").click(function() {
			$("#log").toggle();
		});
		
		$("#enhance").append('<div id="log"></div>');

    }, false);

	

	function ing_ajaxCall() {
		var requestdata = {
			"minLevelOfDetail":-1,
			"boundsParamsList":	[{"id":"0120212302","minLatE6":49837982,"minLngE6":14062500,"maxLatE6":50289339,"maxLngE6":14765625,"qk":"0120212302"}],
			"method":"dashboard.getThinnedEntitiesV2"
		};

		$.ajax({
			type: "POST",
			url: "/rpc/" + "dashboard.getThinnedEntitiesV2",
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(requestdata),
			success: function(a) {
				ing_processData(a);
			},
			error: function(e) {
				console.log("error");
			},
			complete: function(a) {
				//console.log(a);
			}
		});	
	}
	
	function ing_ajaxGetNames(guids) {
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
				console.log("error");
			},
			complete: function(a) {
				//console.log(a);
			}
		});	
	}

	function ing_processData(data) {
		var portals = [];
		var count = 0;
		
		$.each(data.result.map, function(i, dat) {
			$.each(dat.gameEntities, function(j, data) {
				portals[data[0]] = [];
				portals[data[0]]["team"] = "NEUTRAL";
				portals[data[0]]["address"] = "";
				portals[data[0]]["resonators"] = "";
				if (data[2].resonatorArray) {portals[data[0]]["resonators"] = data[2].resonatorArray.resonators};
				portals[data[0]]["team"] = data[2].controllingTeam.team;
				if (data[2].portalV2) {portals[data[0]]["address"] = ing_findPraguePart(data[2].portalV2.descriptiveText.ADDRESS);} 
				count = count +1;
			});
		});

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
	
	function ing_processUsers(data) {
		$.each(data.result, function(i, users) {
			players[users.guid]["name"] = users.nickname;
		});
		console.log(players);
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
			if (ind == -1){ addr = "non-Prague";}
			else {addr = address.substr(ind+7,2);}
		} else {addr = address.substr(ind+14,2);}
		if (addr.substr(1,1) == ",") addr = addr.substr(0,1);
		return addr;
	}
	
	

})();

