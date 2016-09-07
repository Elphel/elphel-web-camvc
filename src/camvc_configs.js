/*
** -----------------------------------------------------------------------------**
** camvc_configs.js
**
** Copyright 2006 Elphel, Inc.
**
** -----------------------------------------------------------------------------**
**  camvc_configs.js is free software; you can redistribute it and/or modify it under
**  the terms of the GNU General Public License as published by the Free Software
**  Foundation; either version 2 of the License, or (at your option) any later version.
** 
**  camvc_configs.js is distributed in the hope that it will be useful,
**  but WITHOUT ANY WARRANTY; without even the implied warranty of
**  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
**  GNU General Public License for more details.
** 
**  You should have received a copy of the GNU General Public License
**  along with camvc_configs.js; if not, write to the Free Software
**  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
** -----------------------------------------------------------------------------**
*/
/*
*! -----------------------------------------------------------------------------**
*! camvc_configs.js
*!
*! Copyright (C) 2006-2007 Elphel, Inc.
*!
*! -----------------------------------------------------------------------------**
*!
*!  This program is free software: you can redistribute it and/or modify
*!  it under the terms of the GNU General Public License as published by
*!  the Free Software Foundation, either version 3 of the License, or
*!  (at your option) any later version.
*!
*!  This program is distributed in the hope that it will be useful,
*!  but WITHOUT ANY WARRANTY; without even the implied warranty of
*!  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*!  GNU General Public License for more details.
*!
*!  You should have received a copy of the GNU General Public License
*!  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*! -----------------------------------------------------------------------------**
*!  $Log: camvc_configs.js,v $
*!  Revision 1.3  2008/12/09 19:25:17  elphel
*!  After disabling default actions onmousedown - enabled all input text fields:  onmousedown="this.select()" (otherwise they did not get focus when clicking them)
*!
*!  Revision 1.2  2008/12/09 07:51:52  elphel
*!  Partial support of ccam.ftp added alerts on non-yet-ported control tabs. Temporary launches autocampars to save selected parameters fro next autostart
*!
*!  Revision 1.1.1.1  2008/11/27 20:04:03  elphel
*!
*!
*!  Revision 1.2  2008/11/10 19:55:51  elphel
*!  8.0.alpha15 - first camvc working with 8.0 (just basic features - no autoexposure, white balance, ...), but it is now really possible (again after it was broken for quite a while) to move sliders and navigator windows without fighting with the camera that tried to move them back
*!
*!  Revision 1.3  2008/01/28 18:05:24  spectr_rain
*!  fix URL to save image settings for the streamer
*!
*!  Revision 1.2  2008/01/28 17:10:23  spectr_rain
*!  autostart of streamer if selected
*!
*!  Revision 1.1.1.1  2007/09/19 04:51:17  elphel
*!  This is a fresh tree based on elphel353-2.10
*!
*!  Revision 1.2  2007/09/19 04:51:17  elphel
*!  Upgraded license (header)
*!
*!
*/

configs_sync = -3;
configs_idle = -2;
configs_start = -1;
configs_rwNone = 0;
configs_rwNeedsReading = 1;
configs_rwReadOK = 2;
configs_rwReadError = 3;
configs_rwReadTimeout = 4;
configs_rwNeedsWriting = 5;
configs_rwWriteOK = 6;
configs_rwWriteError = 7;
configs_rwWriteTimeout = 8;
var configXML_req;
document.configNeedsSync=false;

/*
document.configs={
  en:0,     // enabled,
  line:-2,   // line number being processed (-1 - start, -2 - finished, idle)
  completed:1,
  timeout:3000,
  colorGood:    "#00dd00",
  colorModified:"#0000dd",
  colorBad:     "#dd0000",
  colorTimeout: "#dddd00",
  
  timeOutTimerID:   null,
  baseUrl:"/editconf.cgi?",
  url:"",
  onDone:null,
  buttonID:"",//  button pressed (will be released when done)
  wasCursor:""
};
*/
function initAllConfigs() {
//  initConfigRequests();
	document.configs.onDone = null;
	var s = "";
	var i, j;
	var bid;
	var onUsCh;
	var cl, t;

	for (i = 0; i < document.configsData.length; i++) {
		if (typeof(document.configsData[i].quote) == "undefined")
			document.configsData[i].quote = "";
		if (typeof(document.configsData[i].txWidth) == "undefined")
			document.configsData[i].txWidth = 8;
		if (typeof(document.configsData[i].onUpdate) == "undefined")
			document.configsData[i].onUpdate = null;
		if (typeof(document.configsData[i].onUserChange) == "undefined")
			document.configsData[i].onUserChange = null;
		if (typeof(document.configsData[i].onWriteConfig) == "undefined")
			document.configsData[i].onWriteConfig = null;
		if (typeof(document.configsData[i].enUpd) == "undefined")
			document.configsData[i].enUpd = 1;
		if (typeof(document.configsData[i].val) == "undefined")
			document.configsData[i].val = "";
		if (typeof(document.configsData[i].rwState) == "undefined")
			document.configsData[i].rwState = 0;
		if (typeof(document.configsData[i].stl) == "undefined")
			document.configsData[i].stl = "";
		if (typeof(document.configsData[i].disabled) == "undefined")
			document.configsData[i].disabled = 0;
		document.configsData[i].valio = "";
		with(document.configsData[i]) {
// add header/buttons if they do not yet exist ("_head and _LB" section should exist already
			if (document.getElementById(divId + '_head') && (!document.getElementById(divId + '_readThis'))) {
				s = "";
				if (document.getElementById(divId + '_autofill')) {
					s += '<div id="' + divId + '_auto" style="float:right;width:25;height:25;"></div>\n';
					document.buTtons[document.buTtons.length] = {
				  id: divId + "_auto", n: 48, t: "b", dm: "", aop:"pressedConfigsRw(id);"};
				}
				s += '<div id="' + divId + '_saveAll" style="float:right;width:25;height:25;"></div>\n';
				s += '<div id="' + divId + '_saveThis" style="float:right;width:25;height:25;"></div>\n';
				s += '<div id="' + divId + '_readAll" style="float:right;width:25;height:25;"></div>\n';
				s += '<div id="' + divId + '_readThis" style="float:right;width:25;height:25;"></div>\n';
				document.getElementById(divId + '_head').innerHTML += s;
				document.buTtons[document.buTtons.length] = {
			  id: divId + "_saveAll", n: 45, t: "b", dm: "", aop:"pressedConfigsRw(id);"};
				document.buTtons[document.buTtons.length] = {
			  id: divId + "_saveThis", n: 44, t: "b", dm: "", aop:"pressedConfigsRw(id);"};
				document.buTtons[document.buTtons.length] = {
			  id: divId + "_readAll", n: 47, t: "b", dm: "", aop:"pressedConfigsRw(id);"};
				document.buTtons[document.buTtons.length] = {
			  id: divId + "_readThis", n: 46, t: "b", dm: "", aop:"pressedConfigsRw(id);"};
			}					// needed header

			onUsCh = onUserChange ? "'" + onUserChange + "'" : "null";
			cl = (((typeof(document.configsData[i].stl) != "undefined")) && (stl != "")) ? (' style="' + stl + '"') : "";
			t = (((typeof(document.configsData[i].password) != "undefined")) && document.configsData[i].password) ? "password" : "text";
			var dsbl = disabled ? " disabled " : "";	// select between "disabled" and "readonly"

			if (frmt == 0) {	// custom formatting add extra filed
				s = custom;
			} else {
				s = '<div id="' + id + 'All" class="settings_item"><span id="' + id + '_LB" style="float:left;"></span>';
				if (frmt == 1) {	//text field
					s += '  <span style="float:right;"><input onmousedown="this.select()" type="' + t + '" id="' + id + '_TX" ' + dsbl;
					if (txWidth > 0)
						s += 'size="' + txWidth + '" ';
					s += 'onChange="inputInChange(' + i + ',' + onUsCh + ')"' + cl + '/></span>\n';
				} else if (frmt == 2) {	//checkbox
					bid = id + "_CB";
					s += '  <div id="' + bid + '" style="float:right;width:25;height:25;"></div><input type="hidden" id="' + id + '_TX"/>\n';
// create button in  document.buTtons array 
					document.buTtons[document.buTtons.length] = {
				  id: bid, n: txWidth, t: "T2", dm: "", aop:"inputInChange(" + i + "," + onUsCh + ");"};
//alert (document.buTtons[document.buTtons.length-1].aop);         
				} else if (frmt == 3) {	// ipv4
					s += '<div id="' + id + '_ipv4" style="float:right;">';
					s += '<input onmousedown="this.select()" type="' + t + '" id="' + id + '_TX1" ' + dsbl + 'size="3" onChange="inputInChange(' + i + ',' + onUsCh + ')"' + cl + '/>.';
					s += '<input onmousedown="this.select()" type="' + t + '" id="' + id + '_TX2" ' + dsbl + 'size="3" onChange="inputInChange(' + i + ',' + onUsCh + ')"' + cl + '/>.';
					s += '<input onmousedown="this.select()" type="' + t + '" id="' + id + '_TX3" ' + dsbl + 'size="3" onChange="inputInChange(' + i + ',' + onUsCh + ')"' + cl + '/>.';
					s += '<input onmousedown="this.select()" type="' + t + '" id="' + id + '_TX4" ' + dsbl + 'size="3" onChange="inputInChange(' + i + ',' + onUsCh + ')"' + cl + '/>';
					s += '</div>';
					s += ' <input type="hidden" id="' + id + '_TX"/>\n';
				} else if (frmt == 5) {	//Select
					s += '  <span style="float:right;"><select id="' + id + '_TX" ' + dsbl;
					if (txWidth > 0)
						s += 'size="' + txWidth + '" ';
					s += 'onChange="inputInChange(' + i + ',' + onUsCh + ')"' + cl + '>\n';
					for (j = 0; j < sel.length; j++)
						s += '<option value="' + sel[j] + '">' + sel[j] + '</option>\n';
					s += '</select></span>\n';
				} else if (frmt == 6) {	// MAC format (xx:xx:xx:xx:xx:xx)
					s += '<div id="' + id + '_mac" style="float:right;">';
					s += '<input onmousedown="this.select()" type="' + t + '" id="' + id + '_TX1" ' + dsbl + 'size="2" onChange="inputInChange(' + i + ',' + onUsCh + ')"' + cl + '/>:';
					s += '<input onmousedown="this.select()" type="' + t + '" id="' + id + '_TX2" ' + dsbl + 'size="2" onChange="inputInChange(' + i + ',' + onUsCh + ')"' + cl + '/>:';
					s += '<input onmousedown="this.select()" type="' + t + '" id="' + id + '_TX3" ' + dsbl + 'size="2" onChange="inputInChange(' + i + ',' + onUsCh + ')"' + cl + '/>:';
					s += '<input onmousedown="this.select()" type="' + t + '" id="' + id + '_TX4" ' + dsbl + 'size="2" onChange="inputInChange(' + i + ',' + onUsCh + ')"' + cl + '/>:';
					s += '<input onmousedown="this.select()" type="' + t + '" id="' + id + '_TX5" ' + dsbl + 'size="2" onChange="inputInChange(' + i + ',' + onUsCh + ')"' + cl + '/>:';
					s += '<input onmousedown="this.select()" type="' + t + '" id="' + id + '_TX6" ' + dsbl + 'size="2" onChange="inputInChange(' + i + ',' + onUsCh + ')"' + cl + '/>';
					s += '</div>';
					s += ' <input type="hidden" id="' + id + '_TX"/>\n';
				} else {		// error
					alert("Unknown format=" + frmt);
				}
				s += '</div>\n';
			}
			document.getElementById(divId).innerHTML += s;
		}
	}
}


function configs_cameraTimer(t) {
	document.configs.timeOutTimerID = self.setTimeout("configs_cameraTimeout()", t);
	document.configs.completed = 1;
}
function configs_cameraTimeout() {
	document.configs.completed = 0;
	configs_mainLoop();
}

function startConfigs() {
	if (document.configs.line != configs_idle) {
		alert("configs update is already in progress");
		return;					// will not start next update until the current is over
	}
	document.configs.line = configs_start;
	completed = 1;
	configs_mainLoop();
}

function configs_mainLoop() {
	var t = new Date();
	var v, i, j;

	with(document.configs) {
		// stop timeout timer if running
		if (timeOutTimerID) {
			clearTimeout(timeOutTimerID);
			timeOutTimerID = null;
		}
		if (line == configs_idle) {
			return;				// nothing to be done, exiting
		}
		if (line >= 0) {		// process the current line with the data received (will skip       if (line==configs_sync) {
			if (document.configsData[line].rwState == configs_rwNeedsReading) {
				if (!completed) {
					document.configsData[line].rwState = configs_rwReadTimeout;
				} else {
					// try to parse XML data
					if (!configXML_req.responseXML.getElementsByTagName('value')[0]) {
						document.configsData[line].val = "";	// for now - empty on any other errors (maybe really check on error type?
						document.configsData[line].rwState = configs_rwReadError;
						document.getElementById(document.configsData[line].id + "_TX").value = document.configsData[line].val;
					} else {
						document.configsData[line].val = configXML_req.responseXML.getElementsByTagName('value')[0].firstChild.nodeValue;
						document.configsData[line].rwState = configs_rwReadOK;
						// unquote
						if (document.configsData[line].val.substr(0, 1) == "\"")
							document.configsData[line].quote = "\"";	// set from config
						if (document.configsData[line].val.substr(0, 1) == "'")
							document.configsData[line].quote = "'";	// set from config
						if ((typeof(document.configsData[line].quote) != "undefined") && document.configsData[line].quote) {
//              if (document.configsData[line].val.substr(0,1)=="\"") {
//                 document.configsData[line].quote=1; // set from config

							while ((document.configsData[line].val.length > 0) && (document.configsData[line].val.substr(0, 1) == document.configsData[line].quote))
								document.configsData[line].val = document.configsData[line].val.substr(1);
							while ((document.configsData[line].val.length > 0)
								&& (document.configsData[line].val.substr(document.configsData[line].val.length - 1) == document.configsData[line].quote))
								document.configsData[line].val = document.configsData[line].val.substr(0, document.configsData[line].val.length - 1);
						}

						document.getElementById(document.configsData[line].id + "_TX").value = document.configsData[line].val;
						// substitute .yes and .no choices with "1" or "0"              
						if (document.configsData[line].no) {
							if (document.configsData[line].val == document.configsData[line].no)
								document.getElementById(document.configsData[line].id + "_TX").value = "0";
							else
								document.getElementById(document.configsData[line].id + "_TX").value = "1";
						}

						if (document.configsData[line].frmt == 3) {	//ip - split into 4 groups
							v = document.configsData[line].val;
							for (i = 1; (v != "") && (i <= 4) && ((j = v.indexOf(".")) > 0); i++) {
								document.getElementById(document.configsData[line].id + "_TX" + i).value = v.substr(0, j);
								v = v.substr(j + 1);
							}
							if (v)
								document.getElementById(document.configsData[line].id + "_TX" + i).value = v;
						}
						if (document.configsData[line].frmt == 5) {	// select
//document.title+=document.configsData[line].val;
							for (i = 0; i < document.getElementById(document.configsData[line].id + "_TX").options.length; i++) {
								if (document.getElementById(document.configsData[line].id + "_TX").options[i].value == document.configsData[line].val) {
									document.getElementById(document.configsData[line].id + "_TX").options[i].selected = true;
//                    document.getElementById(document.configsData[line].id+"_TX").style.color=document.configs.colorGood;
								} else {
									document.getElementById(document.configsData[line].id + "_TX").options[i].selected = false;
//                    document.getElementById(document.configsData[line].id+"_TX").style.color=document.configs.colorModified;
								}
//document.title+=" "+document.getElementById(document.configsData[line].id+"_TX").options[i].value+"/"+document.getElementById(document.configsData[line].id+"_TX").options[i].selected;
							}
//  alert(document.title);
						}
						if (document.configsData[line].frmt == 6) {	//mac - split into 6 groups
							v = document.configsData[line].val;
							for (i = 1; (v != "") && (i <= 6) && ((j = v.indexOf(":")) > 0); i++) {	// use configured (as an extra parameter in the table) separator, not just ":"?
								document.getElementById(document.configsData[line].id + "_TX" + i).value = v.substr(0, j);
								v = v.substr(j + 1);
							}
							if (v)
								document.getElementById(document.configsData[line].id + "_TX" + i).value = v;
						}
						// show checkbox state according to data read              
						if (document.configsData[line].frmt == 2) {	//checkbox, not text field
							setBuTtonState(document.configsData[line].id + "_CB", parseInt(document.getElementById(document.configsData[line].id + "_TX").value) ? 1 : 0);
						}
						// perform exteranal action if needed              
						if (document.configsData[line].onUpdate) {
							var tid = document.configsData[line].id + "_TX";

							eval(document.configsData[line].onUpdate);	// before converting to checkbox
						}
					}
//           document.getElementById("input_"+line).value=document.configsData[line].val;
				}
				document.configsData[line].valio = document.configsData[line].val;
			} else if (document.configsData[line].rwState == configs_rwNeedsWriting) {
				if (!completed) {
					document.configsData[line].rwState = configs_rwWriteTimeout;
				} else {
					// try to parse XML data
					if ((!configXML_req.responseXML.getElementsByTagName('error')[0])
						|| (parseInt(configXML_req.responseXML.getElementsByTagName('error')[0].firstChild.nodeValue) != 0)) {
						document.configsData[line].rwState = configs_rwWriteError;
					} else {
						document.configsData[line].rwState = configs_rwWriteOK;
						document.configsData[line].valio = document.configsData[line].val;	// valio has value last read/written to the camera
						// perform accosiated action after the config data is written to the camera
						if (document.configsData[line].onWriteConfig && (typeof(document.configsData[line].onWriteConfig) != "undefined")) {
							var tid = document.configsData[line].id + "_TX";
							eval(document.configsData[line].onWriteConfig);	// before converting to checkbox
						}
					}
				}
			} else
				alert_once("error #1 in configs_mainLoop(), document.configsData[" + line + "].rwState=" + document.configsData[line].rwState);
		}
      if (line==configs_sync) {
//        alert ("synced");
        document.configNeedsSync=false;
        line = document.configsData.length;
      } else {
        if (line < 0) {
          line = 0;
        } else line++;
        while ((line < document.configsData.length) && (((document.configsData[line].rwState != configs_rwNeedsReading) && (document.configsData[line].rwState != configs_rwNeedsWriting))
           || !document.configsData[line].enUpd)) {
          line++;
        }
      }
		if (line >= document.configsData.length) {
         if (document.configNeedsSync) {
            url = selfUrl + "sync" +  "&_time=" + t.getTime();
//            alert (url);
            line=configs_sync;
            startConfigsXML();
            return;
         }
			line = configs_idle;
			if (onDone)
				onDone();
			return;				//normal finish
		} else if (document.configsData[line].rwState == configs_rwNeedsReading) {
			// create read url       
         if (document.configsData[line].file=="internal") {
            url = selfUrl +                                              "key=" + document.configsData[line].key + "&_time=" + t.getTime();
         } else {
			   url = baseUrl + "file=" + document.configsData[line].file + "&key=" + document.configsData[line].key + "&_time=" + t.getTime();
         }


			startConfigsXML();
			return;
		} else if (document.configsData[line].rwState == configs_rwNeedsWriting) {
			// create write url       
         if (document.configsData[line].file=="internal") {
            url = selfUrl +                                              "key=" + document.configsData[line].key;
         } else {
			   url = baseUrl + "file=" + document.configsData[line].file + "&key=" + document.configsData[line].key;
            document.configNeedsSync=true;
         }
//          "&value="+(document.configsData[line].quote?"\"":"")+document.configsData[line].val+(document.configsData[line].quote?"\"":"")+
			if(document.configsData[line].quote || document.configsData[line].val) {
				url += "&value=" + document.configsData[line].quote + document.configsData[line].val + (document.configsData[line].quote ? "\"" : "");
				url += (document.configsData[line].eq ? "&eq=1" : "");
			} else {			// now quotes, empty string - remove the key copmpletely
				url += "&value=%23";	// %23 - same as #, but # in url has a special meaning
			}
			url += "&_time=" + t.getTime();
			startConfigsXML();
// moved where confiramtion is received, so external program can rely on the updated data in the config file        
//        if (document.configsData[line].onWriteConfig && (typeof(document.configsData[line].onWriteConfig)!="undefined")) {
//           var tid=document.configsData[line].id+"_TX";
//           eval (document.configsData[line].onWriteConfig); // before converting to checkbox
//        }  
			return;
		} else
			alert_once("error #2 in configs_mainLoop(), document.configsData[" + line + "].rwState=" + document.configsData[line].rwState);
	}							// with (document.configs)

}


function startConfigsXML() {
	configs_cameraTimer(document.configs.timeout);
	checkBadUrl(document.configs.url, "startConfigsXML");
	if (window.XMLHttpRequest) {
		configXML_req = new XMLHttpRequest();
		configXML_req.onreadystatechange = receivedConfigsXML;
		configXML_req.open("GET", document.configs.url, true);
		configXML_req.send(null);
		// branch for IE/Windows ActiveX version
	}
}

function receivedConfigsXML() {
	// only if req shows "loaded"
	if (typeof(configXML_req) == "undefined")
		return;					//trying to fight "uncaught exceptions" (happens when camera is setting it is date)
	if (configXML_req.readyState == 4) {
		// only if "OK"
               if (((configXML_req.status >= 200) && (configXML_req.status < 300)) || (configXML_req.status ==304) ||
                 ((typeof(configXML_req.status) =='undefined' ) && ((navigator.userAgent.indexOf("Safari")>=0) || (navigator.userAgent.indexOf("Konqueror")>=0))))
                  { //
			configs_mainLoop();	// **** back to main loop ****
		} else {
			alert_once("There was a problem retrieving the XML data:\n" + configXML_req.statusText);
		}
	}
}

//-----------------------------

function configInputsChanged() {
	var i;

	for (i = 0; i < document.configsData.length; i++)
		inputInChange(i, null);
}

function inputInChange(i, act) {
//  var i=parseInt(id.substr(6));
	var n, v, s, v0, indx, vi, j;
	var id = document.configsData[i].id + "_TX";

	if (document.configsData[i].disabled)
		return;
	if (document.configsData[i].frmt == 2) {	//checkbox, not text field
//    setBuTtonState(document.configsData[line].id+"_CB", parseInt(document.configsData[line].val)?1:0);
		document.getElementById(id).value = getBuTton(document.configsData[i].id + "_CB").s ? "1" : "0";
		if (document.configsData[i].yes) {	// "no" may be empty, while "yes" is not. In that case the key/value pair may be removed completely
			document.getElementById(id).value = getBuTton(document.configsData[i].id + "_CB").s ? document.configsData[i].yes : document.configsData[i].no;
		}
	} else if (document.configsData[i].frmt == 3) {	// ipv4
		s = "";
		v0 = document.configsData[i].valio;
		for (n = 1; n <= 4; n++) {
			indx = v0.indexOf(".");
			if (indx < 0)
				indx = v0.length;
			vi = parseInt(v0.substr(0, indx));
			v = parseInt(document.getElementById(id + n).value);
			if (!((v >= 0) && (v < 256)))
				v = vi;
			document.getElementById(id + n).value = v;
			s += v;
			if (n < 4)
				s += ".";
			if (v != vi)
				document.getElementById(id + n).style.color = document.configs.colorModified;
			else
				document.getElementById(id + n).style.color = document.configs.colorGood;
			v0 = v0.substr(indx + 1);
		}
		document.getElementById(id).value = s;
	} else if (document.configsData[i].frmt == 6) {	// mac
		s = "";
		v0 = document.configsData[i].valio;
		for (n = 1; n <= 6; n++) {
			indx = v0.indexOf(":");
			if (indx < 0)
				indx = v0.length;
// Make hex verification later if needed      
//      vi=parseInt(v0.substr(0,indx));
//      v=parseInt(document.getElementById(id+n).value);
//      if (!((v>=0) && (v<256))) v=vi;
			vi = v0.substr(0, indx);
			v = document.getElementById(id + n).value;
			if (v.length == 2)
				v = vi;
			document.getElementById(id + n).value = v;
			s += v;
			if (n < 6)
				s += ":";
			if (v != vi)
				document.getElementById(id + n).style.color = document.configs.colorModified;
			else
				document.getElementById(id + n).style.color = document.configs.colorGood;
			v0 = v0.substr(indx + 1);
		}
		document.getElementById(id).value = s;
	}
	if (act)
		eval(act);
	if (document.configsData[i].frmt == 5) {
		for (j = 0; j < document.getElementById(id).options.length; j++) {
			if (document.getElementById(id).options[j].selected) {
				document.configsData[i].val = document.getElementById(id).options[j].value;
			}
		}
	} else {
		document.configsData[i].val = document.getElementById(id).value;
	}
//document.title=  document.configsData[i].val+"/"+document.configsData[i].valio;
	if (document.configsData[i].val != document.configsData[i].valio) {
//    if (document.configsData[i].frmt!=5)
		document.getElementById(document.configsData[i].id + "_TX").style.color = document.configs.colorModified;
		document.configsData[i].rwState = configs_rwNeedsWriting;
	} else {					// restored to an old (synchronized with camera) value
//    if (document.configsData[i].frmt!=5) 
		document.getElementById(document.configsData[i].id + "_TX").style.color = document.configs.colorGood;
		document.configsData[i].rwState = configs_rwNone;	//set to the old read/written value
	}
}

function set_initstring(s) {
//	u = "/editconf.cgi?file=/etc/streamers.conf"
//	u = "/strconf.cgi?out=/etc/image.conf&in=/var/state/image.conf"
	u = "/imconf_save.php"
//	u += s;
	if (window.XMLHttpRequest) {
		configXML_req = new XMLHttpRequest();
//		configXML_req.onreadystatechange = receivedConfigsXML;
		configXML_req.open("GET", u, true);
		configXML_req.send(null);
	}
}

function update_initstrings() {
	var s = "&init_1=\'"+document.init_1+"\'";
	s += "&init_2=\'"+document.init_2+"\'";
	set_initstring(s);
/*
	if(_init_1 != document.init_1) {
		_init_1 = document.init_1;
		var s = "&key=init_1&value=\'"+_init_1+"\'"
		set_initstring(s);
		// ...
	}
	if(_init_2 != document.init_2) {
		_init_2 = document.init_2;
		var s = "&key=init_2&value=\'"+_init_2+"\'"
		set_initstring(s);
		// ...
	}
	alert("bla-bla!");
*/
}

function pressedConfigsRw(id) {
	var i, j;

	if (document.configs.buttonID != "") {
		return;					//button already will get to state 2
	}

	if ((id.indexOf("_save") > 0) && !document.shiftKey) {
		alert(document.getElementById("h_idShiftWarn").innerHTML);	// alert causes error here in Mozilla FF
		if (document.buTton)
			document.buTton.s = 0;
		return;
	}
	document.configs.buttonID = id;
	if (document.buTton)
		document.buTton.s = 1;	// a hack to prevent button go to released state when it is released
	document.configs.wasCursor = document.body.style.cursor;
	document.body.style.cursor = "wait";
	if ((j = id.indexOf("_readThis")) > 0) {
		for (i = 0; i < document.configsData.length; i++) {
			if (id.substr(0, j) == document.configsData[i].divId) {
				document.configsData[i].rwState = configs_rwNeedsReading;
				document.configsData[i].enUpd = 1;
			} else {
				document.configsData[i].enUpd = 0;
			}
		}
		document.configs.onDone = readConfigsDone;
		startConfigs();
	} else if ((j = id.indexOf("_readAll")) > 0) {
		for (i = 0; i < document.configsData.length; i++) {
			document.configsData[i].rwState = configs_rwNeedsReading;
			document.configsData[i].enUpd = 1;
		}
		document.configs.onDone = readConfigsDone;
		startConfigs();
	} else if ((j = id.indexOf("_saveThis")) > 0) {
		for (i = 0; i < document.configsData.length; i++) {
			if (id.substr(0, j) == document.configsData[i].divId) {
				document.configsData[i].enUpd = document.configsData[i].disabled ? 0 : 1;
			} else {
				document.configsData[i].enUpd = 0;
			}
		}
		document.configs.onDone = writeConfigsDone;
		startConfigs();
// TODO!
		if(id == "idSettingsTabs_div3_saveThis") {
			update_initstrings();
		}
	} else if ((j = id.indexOf("_saveAll")) > 0) {
		for (i = 0; i < document.configsData.length; i++) {
			document.configsData[i].enUpd = document.configsData[i].disabled ? 0 : 1;
		}
		document.configs.onDone = writeConfigsDone;
		startConfigs();
		update_initstrings();
	} else if ((j = id.indexOf("_auto")) > 0) {

		if (document.getElementById(id.substr(0, j) + "_autofill")) {
			eval(document.getElementById(id.substr(0, j) + "_autofill").value);
		}
//   configsAutoFill(id.substr(0,j)); // argument - section name
		if (document.buTton)
			document.buTton.s = 0;	// a hack to prevent button go to released state when it is released
		setBuTtonState(document.configs.buttonID, 0);
		document.configs.buttonID = "";
		document.body.style.cursor = document.configs.wasCursor;
	} else {
		alert("unrecognized id=" + id);
		if (document.buTton)
			document.buTton.s = 0;	// a hack to prevent button go to released state when it is released
		setBuTtonState(document.configs.buttonID, 0);
		document.configs.buttonID = "";
		document.body.style.cursor = document.configs.wasCursor;
	}
}

function writeConfigsDone() {	// red - errorsm green - written, others - don not touch
	var i, id, j;

	for (i = 0; i < document.configsData.length; i++) {
//    id=document.configsData[i].id+((document.configsData[i].frmt==3)?"_ipv4":"_TX");
		id = document.configsData[i].id + "_TX";
		if (document.configsData[i].frmt == 5) {
			for (j = 0; j < document.getElementById(id).options.length; j++) {
				if (document.getElementById(id).options[j].selected) {
					document.getElementById(id).options[j].style.color = document.configs.colorGood;
				} else {
					document.getElementById(id).options[j].style.color = document.configs.colorModified;
				}
			}
			document.getElementById(id).style.color = document.configs.colorGood;
		} else {
			for (j = 0; j < ((document.configsData[i].frmt == 3) ? 5 : 1); j++) {
				if (document.configsData[i].rwState == configs_rwWriteOK) {
					document.getElementById(id + (j ? j : "")).style.color = document.configs.colorGood;
				} else if (document.configsData[i].rwState == configs_rwWriteError) {
					document.getElementById(id + (j ? j : "")).style.color = document.configs.colorBad;
				} else if (document.configsData[i].rwState == configs_rwWriteTimeout) {
					document.getElementById(id + (j ? j : "")).style.color = document.configs.colorTimeout;
				} else {
				}
			}
		}
	}
	if (document.buTton)
		document.buTton.s = 0;	// a hack to prevent button go to released state when it is released
	setBuTtonState(document.configs.buttonID, 0);
	document.configs.buttonID = "";
	document.body.style.cursor = document.configs.wasCursor;
}



function readConfigsDone() {
	var i, id, j;

	for (i = 0; i < document.configsData.length; i++) {
//    id=document.configsData[i].id+((document.configsData[i].frmt==3)?"_ipv4":"_TX");
		id = document.configsData[i].id + "_TX";
		if (document.configsData[i].frmt == 5) {
			for (j = 0; j < document.getElementById(id).options.length; j++) {
				if (document.getElementById(id).options[j].selected) {
					document.getElementById(id).options[j].style.color = document.configs.colorGood;
				} else {
					document.getElementById(id).options[j].style.color = document.configs.colorModified;
				}
			}
		} else {
			for (j = 0; j < ((document.configsData[i].frmt == 3) ? 5 : 1); j++) {
				if (document.configsData[i].rwState == configs_rwReadOK) {
					document.getElementById(id).value = document.configsData[i].val;
					document.getElementById(id + (j ? j : "")).style.color = document.configs.colorGood;
				} else if (document.configsData[i].rwState == configs_rwReadError) {
					document.getElementById(id + (j ? j : "")).style.color = document.configs.colorBad;
				} else if (document.configsData[i].rwState == configs_rwReadTimeout) {
					document.getElementById(id + (j ? j : "")).style.color = document.configs.colorTimeout;
				} else {
//      document.getElementById(id).style.color="#000000";
				}
			}
		}
	}
	if (document.buTton)
		document.buTton.s = 0;	// a hack to prevent button go to released state when it is released
	setBuTtonState(document.configs.buttonID, 0);
	document.configs.buttonID = "";
	document.body.style.cursor = document.configs.wasCursor;
}
