/*
*! -----------------------------------------------------------------------------**
*! FILE NAME  : camvc_video.js
*! DESCRIPTION: Provides interface to a video plugin
*! Copyright (C) 2008 Elphel, Inc.
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
*!  $Log: camvc_video.js,v $
*!  Revision 1.5  2011/05/30 00:10:29  elphel
*!  Fixed embedding gecko-mediaplayer. Thanks, Kevin!
*!
*!  Revision 1.4  2010/02/26 17:04:23  dzhimiev
*!  1. corrected a couple of typos
*!
*!  Revision 1.3  2009/10/07 23:08:02  elphel
*!  removed alert box on stream end (now reports in title bar only)
*!
*!  Revision 1.2  2008/12/14 05:37:58  elphel
*!  Fixed resizing of the window when video plugin is running
*!
*!  Revision 1.1  2008/12/13 23:38:18  elphel
*!  split camvc2.html, - now only HTML code is in camvc2.html, all the javascript in in camvc_main.js, camvc_video.js and other files that were already separate
*!
*!
*/
document.videoSaved={viewer:1,image:1}; // save user selected values if changed by other conditions;
document.idVideoNIndex=-1;
document.idVideoNameIndex=-1;
document.videoMime="";
//  document.getElementById("idVideoR").innerHTML="L"+document.getElementById("idVideoObject").run;
//  document.getElementById("idVideoObject").run=1;


function streamerChangedByUser() {
 var n,i;
  startStopStreamV(0);// stop streamer if it was running
  for (i=0; i<document.getElementById("idVideoName_TX").options.length; i++) {
    if (document.getElementById("idVideoName_TX").options[i].selected) n=i+1;
  }
// change    idVideoN too.
  for (i=0; (i<document.configsData.length) && (document.idVideoNIndex<0); i++) {// first time - find index, later - just use stored
    if (document.configsData[i].id=="idVideoN") document.idVideoNIndex=i;
  }
  document.getElementById("idVideoN_TX").value=n;
  inputInChange(document.idVideoNIndex,null); // simulate that control change (will be hidden from user)
  showStreamerParams();
  if ((document.getElementById(document.TABS_video.id).style.display != "none") &&
      (getSelectedTab(document.TABS_video.id)==document.TABS_video.n)){
//      alert ("streamerChangedByUser:"+document.TABS_video.id+"/"+document.TABS_video.n);
       onClickTabs(document.TABS_video.id,document.TABS_video.n); // show it if the height changed
  }     
}

function streamerNumberRead() {
 var n,i;
  for (i=0; (i<document.configsData.length) && (document.idVideoNameIndex<0); i++) {// first time - find index, later - just use stored
    if (document.configsData[i].id=="idVideoName") document.idVideoNameIndex=i;
  }
  n=parseInt(document.getElementById("idVideoN_TX").value)-1; // starting from 0
  for (i=0; i<document.getElementById(document.configsData[document.idVideoNameIndex].id+"_TX").options.length; i++) {
    document.getElementById(document.configsData[document.idVideoNameIndex].id+"_TX").options[i].selected = (i==n);
  }
  inputInChange(document.idVideoNameIndex,null); // simulate that control change (will be hidden from user)
  showStreamerParams();
  if ((document.getElementById(document.TABS_video.id).style.display != "none") &&
      (getSelectedTab(document.TABS_video.id)==document.TABS_video.n)){
//       alert ("streamerNumberRead:"+document.TABS_video.id+"/"+document.TABS_video.n);
       onClickTabs(document.TABS_video.id,document.TABS_video.n); // show it if the height changed
  }     
 
}

function showStreamerParams() {
  var n = document.getElementById("idVideoN_TX").value; // should be string
  var i;
  for (i=0; i<document.configsData.length;i++) {
    if (typeof(document.configsData[i].sp) != "undefined") {
      document.getElementById(document.configsData[i].id+"All").style.display=(document.configsData[i].sp.indexOf(n)>=0)?"":"none";
    }
  }
 
}

function startStopStreamV(turnOn) { // true - on, false off
 if (!turnOn) hideStreamPage(); /// is it needed?
//  startStopStream(turnOn);
}

function clickedVideoRun() {
  var m=(getBuTton("idVideoRun_CB").s!=0);
  startStopStreamV(m);
}

function showStreamerRunning(){
  setBuTtonState("idVideoRun_CB",document.streamerIsRunning);
}

function streamerChangedState (n) { // 0 - stopped. called when streamer state is first acquired (initialy and after start/stop
  showVideoMode();
}


/// When display mode is selectd in the UI
 function changeStillVideo(vns){ //change here to be able to disable completely (0 - none, 1 - still, 2 - video)
   if ((document.videoMime=="") && (vns>1)) vns=1;
   document.videoSaved.viewer=(vns==2);
   document.videoSaved.image= (vns==1);
   showVideoMode();
 }


///Still does not work form start - trying to turn video when compressor is off causes "non", not "still"

function showVideoMode() {
// will add indication what display mode is now active
	if((document.videoSaved.viewer != 0) &&
		document.cameraParametersAcquired && // when the image size is known to create correct window
		(document.getElementById("idVideoViewer_outer").style.display == "none")) {
        if (gPRoot["comp_run"].getValue() == 'run') {
           makeStreamPage();
        } else {
				hideStreamPage();
        }
//      document.getElementById("idShieldControlsFromPlugin").style.display="block"; /// may be done once

	} else
		if(document.videoSaved.viewer == 0) {
			if(document.getElementById("idVideoViewer_outer").style.display != "none") {
				hideStreamPage();
//            document.getElementById("idShieldControlsFromPlugin").style.display="none"; /// may be done once
			} else
				if(document.videoSaved.image) {
					document.getElementById("idDivCameraImage").style.display = "";
					showWindow();
				}
			if(!document.videoSaved.image) {
				document.getElementById("idDivCameraImage").style.display = "none";
				showWindow();
			}
		}
}

// ----- Video viewer plugin functions ------
/* 
  document.videoSaved={viewer:1,image:1}; // save user selected values if changed by other conditions;
*/

function destroyStreamPage() {
  hideStreamPage();
  document.getElementById("idVideoViewer").innerHTML = "";
}
function hideStreamPage() {
   document.getElementById("idShieldControlsFromPlugin").style.display="none"; /// may be done once
//   if (document.getElementById("idEmbeddedVideo") && (typeof(document.getElementById("idEmbeddedVideo").Stop)!=undefined))
   if (document.getElementById("idEmbeddedVideo") && (typeof(document.getElementById("idEmbeddedVideo").Stop)!='undefined'))
         document.getElementById("idEmbeddedVideo").Stop();
	document.getElementById("idVideoR").style.display = "none"; // letter "R" in playback mode
//	document.getElementById("idVideoViewer").innerHTML = "";
	document.getElementById("idVideoViewer_outer").style.display = "none";
	if(document.videoSaved.image) {
		document.getElementById("idDivCameraImage").style.display = "";
      setBuTtonState("btnDisplayStill",1);
      setBuTtonState("btnDisplayNone",0);
//      clickBuTton("btnDisplayStill"); /// duplicate?
		showWindow();
	} else {
      setBuTtonState("btnDisplayStill",0);
      setBuTtonState("btnDisplayNone",1);
//       clickBuTton("btnDisplayNone");
   }
   setBuTtonState("btnDisplayVideo",0);
//   if      (  document.videoSaved.viewer)  clickBuTton("btnDisplayVideo");
//   else                                    clickBuTton("btnDisplayStill");

}

// will compare current pluging window size and change lowres if needed (rebuilding plugin)
// will check only the horizontal dimension of the window, not the vertical
function checkStreamPageSize(w, h) { // will possibly destroy and rebuild video viewer with new "lowres" parameter
	if(document.getElementById("idVideoViewer_outer").style.display == "none")
		return false; // just in case - we suppose player is running
	var lr = 0;
	if(gPRoot['ACTUAL_WIDTH'].getValue() >    w) lr = 1;
	if(gPRoot['ACTUAL_WIDTH'].getValue() > 2 * w) lr = 2; // enough ?
	if(gPRoot['ACTUAL_WIDTH'].getValue() > 4 * w) lr = 3;
	if(document.lowres != lr) {
		document.lowres = lr;
		document.getElementById("idVideoViewer").innerHTML = "";
		makeStreamRes();
		return true;
	}
	return false;
}

///TODO: Make "stop" if turning streamer off (or other

function makeStreamPage() {
	if(document.videoMime == "")
		return; // will not be used
	var availableWidth = parseInt(document.getElementById("DIV_ALL").style.width) - (controlsOverlap() ? 0 : document.controlsWidth);
	document.lowres = 0;
	if(gPRoot['ACTUAL_WIDTH'].getValue() >    availableWidth) document.lowres = 1;
	if(gPRoot['ACTUAL_WIDTH'].getValue() > 2 * availableWidth) document.lowres = 2; // enough ?
	if(gPRoot['ACTUAL_WIDTH'].getValue() > 4 * availableWidth) document.lowres = 3;
	makeStreamRes();
	document.videoSaved.image = (document.getElementById("idDivCameraImage").style.display != 'none'); // to be able to restore user selection
//	document.getElementById("idDivCameraImage").style.display = 'none'; // hide it - no need to hide, video will anyway be on top

	showWindow(); // recalculate/redisplay
//debugWindowShow(  document.getElementById("idVideoViewer_outer").innerHTML);
//debugWindowShow(  document.body.innerHTML);
} 

/// originally video output was not scaled - only used lowres.
/// Now it will be regular scaling
function makeStreamRes() {
	var availableWidth = parseInt(document.getElementById("DIV_ALL").style.width) - (controlsOverlap() ? 0 : document.controlsWidth);
	document.getElementById("idVideoR").style.display = ""; // letter "R/P/L" 
	document.getElementById("idVideoR").innerHTML = "L"; // letter "R/P/L" 
	if(document.videoMime == "")
		return; // will not be used
//	var w = (document.actualWidth >> document.lowres);
//	var h = (document.actualHeight >> document.lowres);
   var w = availableWidth;
   var h = availableWidth*gPRoot['ACTUAL_HEIGHT'].getValue()/gPRoot['ACTUAL_WIDTH'].getValue();


	document.getElementById("idVideoViewer").style.width = w;
	document.getElementById("idVideoViewer").style.height = h;
	document.getElementById("idVideoViewer_outer").style.display = "";
//	var fps = document.ccs.sensorFPS;
/*
	var fps = document.sensorFPS;
	if(!((fps > 0) && (fps < 10000)))
		fps = 0;
*/
//!FIXME 8.0
/*
	with(document.ccs.strstat) { 
		var target = "";
		if(document.videoMime == "application/x-elphel-ogm") {
			target = " href='" + ((multicast && (mp > 0)) ? ("rtp://" + mip + ":" + mp) : ("rtsp://" + ip + ":" + p)) + "'";
		} else {
			target = " data='" + "rtsp://" + ip + "/'";
		}
*/
/// tempoarary - get host ip/name from gRequests.imgsrv
      var ip=gRequests.imgsrv.substr(7,gRequests.imgsrv.length-13);
      var port="554";
   document.getElementById("idShieldControlsFromPlugin").style.display="none";
// was a typo: kength
//      if (!(document.getElementById("idVideoViewer").innerHTML.kength>0))	document.getElementById("idVideoViewer").innerHTML =
      if (document.getElementById("idVideoViewer").innerHTML.length>0)	document.getElementById("idVideoViewer").innerHTML =
      '<embed '+
      'style="z-index:-1;background-color: #6666aa;" '+
//      'style="z-index:-1;background-color: #6666aa;'+
//      'width:'+Math.round(w)+'px;height:'+Math.round(h)+'px;" '+
      'id="idEmbeddedVideo" '+
      'nocache="1" '+
      'showlogo="0" '+
      'type="application/x-mplayer2" '+
      'onMediaComplete="videoOnMediaComplete();" '+
      'onEndOfStream="videoOnEndOfStream();" '+
      'onVisible="videoOnVisible();" '+
      'onVisible="videoOnVisible();" '+
      'onHidden="videoOnHidden();" '+
      'onMouseDown="videoOnMouseDown();" '+
      'showcontrols="0" '+
      'autostart="1" '+
      'vo="xv" '+
      'framedrop="1" '+
      'src="rtsp://'+ip+':'+port+'"'+
      '  width="'+w+'" height="'+Math.round(h)+'"'+ //Oleg
      '/>';

/*
      'onDestroy="videoOnDestroy();" '+ // does not work - already not defined?

		"<object type=" + document.videoMime +
//		" href='" + ((multicast && (mp > 0)) ? ("rtp://" + mip + ":" + mp) : ("rtsp://" + ip + ":" + p)) + "/'" +
//		" href='" + ((multicast && (mp > 0)) ? ("rtp://" + mip + ":" + mp) : ("rtsp://" + ip + ":" + p)) + "'" +
//		" data='" + "rtsp://" + ip + "/'" +
		target +
		" width=" + w +
		" height=" + h +
		" lowres=" + document.lowres +
		" fps=" + fps +
		" onrun= 'onStreamViewerRun();'" +
		monitorFrameSkip() +
		" id='idVideoObject'></object>\n";
*/

	}
function resizeVideo (w,h) {
  if (document.getElementById('idEmbeddedVideo') && (document.getElementById('idEmbeddedVideo').width>0)) {
    document.title+= "set:"+w+":"+h+" ";
    document.getElementById("idEmbeddedVideo").width=w;
    document.getElementById("idEmbeddedVideo").height=h;
    document.getElementById("idVideoViewer").style.width=w+"px";
    document.getElementById("idVideoViewer").style.height=h+"px";
  }
}
function getSizeVideo () {
  if (document.getElementById('idEmbeddedVideo') && (document.getElementById('idEmbeddedVideo').width>0)) {
    document.title+= "got:"+parseInt(document.getElementById("idEmbeddedVideo").width)+":"+parseInt(document.getElementById("idEmbeddedVideo").height)+" ";
    return  {width: parseInt(document.getElementById("idEmbeddedVideo").width),
             height:parseInt(document.getElementById("idEmbeddedVideo").height)};
  } else {
     document.title+= "got: nothing";
     return {width:0,height:0};
  }
}


//function videoOnEndOfStream() {alert ("videoOnEndOfStream");onVideoStateChange('videoOnEndOfStream');}
function videoOnEndOfStream() {document.title="*** videoOnEndOfStream ***";}


//function videoOnMediaComplete() {alert ("videoOnMediaComplete");onVideoStateChange('videoOnMediaComplete');}
function videoOnMediaComplete() {onVideoStateChange('videoOnMediaComplete');}
//function videoOnVisible() {onVideoStateChange('videoOnVisible');}
function videoOnVisible() {
return;
 if (document.getElementById("idShieldControlsFromPlugin").style.display=="none") {
     document.getElementById("idShieldControlsFromPlugin").style.display="block"; /// may be done once
//     alert ( document.getElementById("idVideoViewer").innerHTML);
 } 
 onVideoStateChange('videoOnVisible');
}
function videoOnHidden() {onVideoStateChange('onHidden');}
function videoOnDestroy() {onVideoStateChange('onDestroy');}

function onVideoStateChange(ev) {
  document.title="**ev="+ev+" play="+document.getElementById("idEmbeddedVideo").playState;
  if (!document.getElementById("idEmbeddedVideo").isplaying()) hideStreamPage();
}

function videoOnMouseDown(){
//  var wasHidden=document.getElementById("idShieldControlsFromPlugin").style.display=="none";
  document.getElementById("idShieldControlsFromPlugin").style.display=(document.getElementById("idShieldControlsFromPlugin").style.display=="none")?"block":"none";
//  document.title=wasHidden?"controls hidden":"controls visible";
}


/* obsolete */
function onStreamViewerRun(){
//alert("onStreamViewerRun")
	if(document.getElementById("idVideoObject") != null)
		if(!(parseInt(document.getElementById("idVideoObject").run) == 1))
			document.getElementById("idVideoObject").run = 1;
/*
  var t=new Date();
document.title+= " "+ document.getElementById("idVideoObject").run+"("+t.getTime()+")";
  alert(document.getElementById("idVideoObject").run+"("+t.getTime()+")");
*/
}
//document.ccs.sensorFPS

function makeStreamPlayback(vw,vh,url) {
//alert("makeStreamPlayback")
	if(document.videoMime == "")
		return; // will not be used
	var availableWidth = parseInt(document.getElementById("DIV_ALL").style.width) - (controlsOverlap() ? 0 : document.controlsWidth);
	document.playbacklowres = 0;
	if(vw > availableWidth)
		document.playbacklowres = 1;
	if(vw > 2 * availableWidth)
		document.playbacklowres = 2; // enough ?
	if(vw > 4 * availableWidth)
		document.playbacklowres = 3;
	makeStreamPlaybackRes(vw, vh, url);
	document.videoSaved.image = (document.getElementById("idDivCameraImage").style.display != 'none'); // to be able to restore user selection
///	document.getElementById("idDivCameraImage").style.display = 'none'; // hide it - leave it (under video)
  
	showWindow(); // recalculate/redisplay

}

function monitorFrameSkip() {
	var fskip = parseInt(document.getElementById("idFPSReduce_TX").value) - 1;
	if(!((fskip >= 0) && (fskip < 10)))
		fskip = 0;
	document.getElementById("idFPSReduce_TX").value = fskip + 1;
	return fskip ? (" frameskip=" + fskip) : "";
}

function fpsReduceChanged() {
//TODO: will add restarting of either video (Live or Play)
}

function makeStreamPlaybackRes(vw,vh,url) {
  if (document.videoMime=="") return; // will not be used
  var w=(vw >> document.playbacklowres);
  var h=(vh >> document.playbacklowres);
  document.getElementById("idVideoViewer").style.width = w;
  document.getElementById("idVideoViewer").style.height =h;
  document.getElementById("idVideoViewer_outer").style.display="";
  document.getElementById("idVideoViewer").innerHTML =
       "<object type="+document.videoMime+
//       " href='"+ url+"/'"+
       " href='"+ url+"'"+
       " width="+w+
       " height="+h+
       " lowres="+document.lowres+
       " onframe='onPlayerFrame();'"+
       " onrun=  'onPlayerRun();'"+
       monitorFrameSkip()+
       " id='idVideoObject'></object>\n";
//alert ( document.getElementById("idVideoViewer").innerHTML);
  document.getElementById("idVideoR").style.display="";
  document.getElementById("idVideoR").innerHTML="R";
//  document.getElementById("idVideoRunButtons").style.top=h;
  document.getElementById("VideoRun_slIder").style.width=w-125;
  document.getElementById("idVideoRunButtonsPlayback").style.display="";
//  createVideoSlider(w-200,document.sessions.session[document.DVR_fileNum.ses].files.file[document.DVR_fileNum.fil].dur);
//  createVideoSlider(w-225,document.sessions.session[document.videoFiles[document.DVR_fileNum.n].s].files.file[document.videoFiles[document.DVR_fileNum.n].f].dur);
  createVideoSlider(w-225,document.sessions.session[document.videoFiles[document.DVR_fileNum.n].s].files.file[document.videoFiles[document.DVR_fileNum.n].f].frames);
  
//  
  
  document.getElementById("idVideoRunButtonsLive").style.display="none";
//   debugWindowShow(document.getElementById("idVideoRunButtons").innerHTML);
} 
 
function stopStreamPlayback() {
//alert("stopStreamPlayback");
	document.getElementById("idVideoR").style.display = "none";
	document.getElementById("idVideoViewer").innerHTML = "";
	document.getElementById("idVideoViewer_outer").style.display = "none";
	showVideoMode(); // will show from camera - video or still
}

function onPlayerFrame() {
	var v, s;
	var t = new Date();
	t = t.getTime();
	if(t > (document.playbackUpdated + document.playbackUpdateInterval)) {
		document.playbackUpdated = t;
		document.playbackUpdateInterval = parseInt(document.getElementById("idDVRSliderDelay_TX").value);

		v = document.getElementById("idVideoObject").frame;
		v = v.substr(v.indexOf("/") + 1);
		while(v.substr(0, 1) == " ")
			v = v.substr(1);
		v = v.substr(0, v.indexOf(" "));
		if(showPlaybackPosition(v))
			setSliderAndText("VideoRun_slIder", parseInt(v)); // only once a second
	}
}

function createVideoSlider(slen,dur) { // now dur - in frames
		createSlider ("VideoRun_slIder",	//should end with "_slIder"
		0,	// there will be a image button to the left of the slider
		"",	//supports switching between *.* and *_press.* (fixed some problems in original code
		13,	// width of the slider pointer
		"images/slider_ball_13x25.png?_TIMESTAMP_",     // url of the pointer image
		slen,	// length of a slider itself (the rest will be used for input text field
		"images/slider_rail_left13x25.png?_TIMESTAMP_",  // left end of rail image (should be same width as pointer_width)
		"images/slider_rail_right13x25.png?_TIMESTAMP_", // right end of rail image (should be same width as pointer_width)
		"images/slider_rail_1x25.png?_TIMESTAMP_",  // may be 1 pixel wide - will be streched as needed
		"images/empty.png?_TIMESTAMP_", //document.slIdersArray[i].dummyImageUrl,      // 1x1 pixel transparent image to fill empty div (maybe will remove it)
		5,		// standard "size" attribute of the text input
		5,		// standard "maxlen" attribute of the text input
		"text-align:right; font-size: 12px; color:blue; ",	// style to be applied to text input field
//              "sec",     // to be written after the input window (i.e. "sec", "mph", etc)
		"frm",	// to be written after the input window (i.e. "sec", "mph", etc)
		"",		// style to be applied to the units field (above)
		0,		// minimal value in the text field, corresponds to the leftmost slider position
		dur,	// maximal value in the text field, corresponds to the rightmost slider position
		0,		// 0 - linear, 1 - logarithmic scale for the slider
//              1,           // number of decimals after the point in the text field
		0,		// number of decimals after the point in the text field
		"50",	// percents of the slider height used for fine control - positive - top, negative - bottom
				// in the following actions id is defined as the outer DIV id. so "alert(id)" as the value will work
		"",		// action to be "eval()" when slider is moved. id is defined as the outer DIV id
		"",		// action when text field is changed or slider button released
		"",		// action when (right) button is pressed
	"");//action on slider double click (i.e. auto on/off)
	setSliderAndText("VideoRun_slIder", 0);            
	enableSlider("VideoRun_slIder", 0);
//  debugWindowShow(document.getElementById("idVideoViewer_outer").innerHTML);
}
     
     
function shieldButtons(l,h) {
//document.title="shieldButtons("+l+","+h+")";
	var i;
	if(l < 0) {
		for(i = 0; i < 250; i += 25)
			document.getElementById("idShieldButtonsFromPlugin_" + i).style.height = 25 + "px";
//		document.getElementById("idShieldButtonsFromPlugin").style.display="none";
//		document.getElementById("idShieldButtonsFromPlugin").style.height=25+"px";
//		document.getElementById("idShieldButtonsFromPlugin").style.left=0+"px";
//		document.getElementById("idShieldButtonsFromPlugin").style.width=256+"px";
	} else {
		document.getElementById("idShieldButtonsFromPlugin_" + l).style.height = h + "px";
//		document.getElementById("idShieldButtonsFromPlugin").style.display="";
//		document.getElementById("idShieldButtonsFromPlugin").style.height=(h)+"px";
//		document.getElementById("idShieldButtonsFromPlugin").style.left=l+"px";
//		document.getElementById("idShieldButtonsFromPlugin").style.width=25+"px";
//		document.getElementById("idShieldButtonsFromPlugin").style.top="0px";
	}
}

function initShieldButtons() {
//   alert ("function initShieldButtons()");
	var i;
	for(i = 0; i < 250; i += 25){
		document.getElementById("idShieldButtonsFromPlugin_" + i).style.height = 25 + "px";
		document.getElementById("idShieldButtonsFromPlugin_" + i).style.width = 25 + "px";
		document.getElementById("idShieldButtonsFromPlugin_" + i).style.left =i + "px";
		document.getElementById("idShieldButtonsFromPlugin_" + i).style.top = 0 + "px";
		document.getElementById("idShieldButtonsFromPlugin_" + i).style.display = "block";
	}
}

function initVideoPlugin() {
  document.videoMime= detectPlugin();
  document.getElementById("btnDisplayVideo").style.display=(document.videoMime!="")?"":"none";
  if (document.videoMime=="") document.videoSaved.viewer=0;

}

function detectPlugin() {
	var pluginmime = "";
//	var pluginmimes = ['application/x-elphel-ogm', 'video/mjpeg', 'video/mpeg'];
	var pluginmimes = ['application/x-mplayer2','application/x-elphel-mjpeg', 'application/x-elphel-ogm'];
//	var pluginmimes = ['application/x-elphel-mjpeg'];
	var i, mmime;
//alert (navigator.mimeTypes.length);
//alert (navigator.mimeTypes.namedItem('application/x-mplayer2'));// object mimeType
//alert ("description="+navigator.mimeTypes.namedItem('application/x-mplayer2').description);
//alert ("type="+navigator.mimeTypes.namedItem('application/x-mplayer2').type);
	for(i = 0; i < pluginmimes.length; i++) {
		mmime = navigator.mimeTypes[pluginmimes[i]];
		if((mmime != null) && (mmime.enabledPlugin)) {
			if(mmime.enabledPlugin)
				genresfound = (mmime.enabledPlugin.name.toLowerCase().indexOf("genres") >= 0);
			pluginmime = (genresfound || pluginmime == "" ? pluginmimes[i] : pluginmime);
			if(genresfound) {
//alert(pluginmime);
				return pluginmime;
			}
		}
	}
	return pluginmime;
}


// end of video plugin
function setInitialVideoModeButtons() {
   document.getElementById("idVideoRunButtonsPlayback").style.display = "none";
   document.getElementById("idVideoRunButtonsLive").style.display = "";
///FIXME: Tempoorary hide recorder control buttons
   document.getElementById("idVideoRunButtons").style.display = "none";
/*   if      (  document.videoSaved.viewer)  clickBuTton("btnDisplayVideo");
   else                                    clickBuTton("btnDisplayStill");
*/
   clickBuTton("btnDisplayStill");
}


