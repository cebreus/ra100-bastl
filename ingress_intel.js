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
    	var style = '<style>#enhance {position: fixed; left: 0px; top: 0px; display: block; background: #fff; color: #000; width: 500px; height: 50px;}</style>';
		var tag = '<div id="enhance"></div>';
		$("head").append(style);
		$("body").prepend(tag);
		$("#enhance").append('<div class="button" id="copytitle">copy</div>');
		$("#copytitle").click(function() {
			$("#portaltitle").text($("#portal_primary_title").text());
		});
		$("#enhance").append('<div class="text" id="portaltitle"></div>');
    }, false);

})();
