// ==UserScript==
// @name Ingress Intel enhance
// @description Enhances Ingress Intel, maybe
// @include http://www.ingress.com/intel
// @include http://*.ingress.com/intel
// ==/UserScript==

(function ()
{

var headID = document.getElementsByTagName("head")[0];         
    var newScript = document.createElement('script');
    newScript.type = 'text/javascript';
    newScript.id = 'myjQuery';
    newScript.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js';
    headID.appendChild(newScript);

    window.addEventListener('load', function (e)  {
    	var style = '<style>#enhance {position: absolute; left: 0px; top: 0px; display: block; background: #000; color: #59FBEA;}'+
    	'.button {cursor: pointer; background-color: #004F4A; color: #59FBEA; padding: 1px 15px; font-size: 13px; border: #59FBEA 1px solid; float: left;}'+
    	'#portaltitle {padding: 0px 10px; float: left; border: 1px solid #59FBEA; width: 427px; height: 23px; font-size: 12px;}'
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
    }, false);

})();
