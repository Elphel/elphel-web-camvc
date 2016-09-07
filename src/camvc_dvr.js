/*
*! -----------------------------------------------------------------------------**
*! camvc_dvr.js
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
*!  $Log: camvc_dvr.js,v $
*!  Revision 1.2  2008/11/30 06:41:43  elphel
*!  changed default IP back to 192.168.0.9 (temporarily was 192.168.0.7)
*!
*!  Revision 1.1.1.1  2008/11/27 20:04:03  elphel
*!
*!
*!  Revision 1.2  2008/09/28 00:28:25  elphel
*!  Default IP changed to 192.168.0.9
*!
*!  Revision 1.2  2007/12/04 01:15:36  spectr_rain
*!  added support of RTSP
*!
*!  Revision 1.1.1.1  2007/09/19 04:51:17  elphel
*!  This is a fresh tree based on elphel353-2.10
*!
*!  Revision 1.2  2007/09/19 04:51:17  elphel
*!  Upgraded license (header)
*!
*!
*/
document.dvrScript="/caminfo.php";
document.retransmitUrl="/xmlxmt.cgi";
document.dvrButton2Press=-1; // press this button after registering at the DB

//document.dvrDefaultModes={loop:0,cont:1,server:"192.168.0.1",maxFileSize:100,maxFileDur:60};
document.dvrDefaultModes={loop:0,cont:1,server:"",maxFileSize:100,maxFileDur:60};
//       if (getBuTton("idDVRLoop_CB").s) {
//       } else if (getBuTton("idDVRNextPlay_CB").s){

//document.dvrwasCursor="";
var DVRVideoStateStop= 0;
var DVRVideoStateLive= 1;
var DVRVideoStateLiveP=2;
var DVRVideoStatePlay= 3;
var DVRVideoStatePlayP=4;
var DVR_state_camTry =   1;
var DVR_state_camAdd =   2;
var DVR_state_camReTry = 3;
var DVR_state_camEdit =  4;
var DVR_state_sessions = 5; //read all/last sessions
var DVR_state_record =   6;
var DVR_state_stop   =   7;

//button numbers

var DVRBack=1;
var DVRPlay=2;
var DVRPause=3
var DVRStop=4;
var DVRForward=5
var DVRRecord=6;
var DVRList=7;
var DVRSettings=8;
var DVRStopRecord=9;
var DVRSearch=10;


document.DVRRetriesConfirmRecord=3; // number of retries to confirm recording start/stop
document.DVRRetriesConfirmRecordLeft=0; // 
//document.serverRoot="/vcr_lamp";
document.serverRoot="/dvr";


var DVRxml_req;
var DVRDBxml_req;

document.enableForwardRetry=true; // if true and forward hit the end of records - it will try to get DB data to sse if a newer record appeared
document.videoFiles=new Array(0);
document.sessions=null;
document.DVR_state=DVR_state_camTry;
//document.DVR_fileNum={ses:-1,fil:0,pos:0};
document.DVR_fileNum={len:-1,n:-1,fil:0,pos:0};

function dvrServerIpChanged() {
  document.DVR_state=DVR_state_camTry;
}

function searchDVR() {
  req_DVR();
}

function req_DVR() { // arg - "", "start", "stop"
 var t=new Date();
 var url="http://"+document.getElementById("idDVRServer_TX").value+document.dvrScript+
                                 "?camera="+ escape(document.getElementById("idDVRCameraID_TX").value)+
                                 "&start="+  escape(document.getElementById("idDVRStart_TX").value)+
                                 "&end="+    escape(document.getElementById("idDVREnd_TX").value)+
                                 "&_time="+t.getTime();
 checkBadUrl(url,"req_DVR");
//
// Cross-domain xmlHTTPRequests do not work because of the security limitations in Mozilla. We will use camera
// to re-transmit requests to the server and return the results back. It might be a waste, but xml files are supposed
// to be small ones.
// server URL should be IP, camera does not support DNS
//
 url=document.retransmitUrl+"?"+escape(url); 
// document.title=url;
  if(window.XMLHttpRequest) {
    DVRxml_req = new XMLHttpRequest();
    DVRxml_req.onreadystatechange = req_DVR_rec;
    DVRxml_req.open("GET", url, true);
    DVRxml_req.send(null);
  } else if(window.ActiveXObject) {
    DVRxml_req = new ActiveXObject("Microsoft.XMLHTTP");
    if(DVRxml_req) {
      DVRxml_req.onreadystatechange = req_DVR_rec;
      DVRxml_req.open("GET", url, true);
      DVRxml_req.send();
    }
  }
}

function req_DVR_rec() {
    if (typeof(DVRxml_req)=="undefined") return; //trying to fight "uncaught exceptions"  (happens when camera is setting it's date)
    if (DVRxml_req.readyState == 4) {
        // only if "OK"
        if (DVRxml_req.status == 200) { // if camera time was not set in advance, "uncaught exception" will be here
            // ...processing statements go here...
          req_DVR_rec_got(); // **** back to main loop ****
        } else {
            alert_once("There was a problem retrieving the XML data:\n" +
                DVRxml_req.statusText);
        }
    }
}

//AEXML_req.responseXML.getElementsByTagName('BPERC' )[0].firstChild.nodeValue
function req_DVR_rec_got() { // parse it here
  var i,l,j,s;
  var n=DVRxml_req.responseXML.getElementsByTagName("clip" ).length;
  var clips=new Array(n);
  alert ("n="+n);
  for (i=0;i<n;i++) {
    clips[i]={};
    l=DVRxml_req.responseXML.getElementsByTagName("clip" )[i].childNodes.length;
    for (j=0;j<l;j++) {
      if (DVRxml_req.responseXML.getElementsByTagName("clip" )[i].childNodes[j].nodeName !="#text") {
        clips[i][DVRxml_req.responseXML.getElementsByTagName("clip" )[i].childNodes[j].nodeName]=
                 DVRxml_req.responseXML.getElementsByTagName("clip" )[i].childNodes[j].childNodes[0].nodeValue;  
      }
     }
    }
//    alert ("i="+i+" l="+l+"\n"+s);
  
//alert(DVRxml_req.responseText);
  s="";
  for (i=0;i<n;i++) {
    s+=" camera_id="+clips[i].camera_id;
    s+=" file="+clips[i].file;
    s+=" startTime="+clips[i].startTime;
    s+=" duration="+clips[i].duration;
    s+=" frames="+clips[i].frames;
    s+=" width="+clips[i].width;
    s+=" height="+clips[i].height;
    s+="\n";
  }
  alert(s);
}


function setMac(){
  document.MAC="";
  var i,c;
  for (i=0;i<document.getElementById("idConfNetMac_TX").value.length;i++) {
     c=document.getElementById("idConfNetMac_TX").value.substr(i,1);
     if ("0123456789ABCDEF".indexOf(c) >=0) document.MAC+=c;
  }
  document.getElementById("idDVRCameraID_TX").value=document.MAC;
  parameresToSyncChanged();   
}

function changedIP(n){ // 0 - camera ip, 1 - multi/uni- streamer IP, 2 - multi/uni port
  var     i=configsNumberById("idVideoDestIp")
//  var multicast=(document.configsData[i].val.substr(0,3)=="232");
  if (n==0) {
    document.getElementById("idDVRCameraIP1_TX").value = 
       document.configsData[configsNumberById("idConfNetIP")].val;
  } else if (n==1) {
    document.getElementById("idDVRCameraIP2_TX").value =  document.configsData[configsNumberById("idVideoDestIp")].val;
  } else if (n==2) {
    document.getElementById("idDVRCameraIP2Port_TX").value =  document.configsData[configsNumberById("idVideoDestPort")].val;
  }
  parameresToSyncChanged()
}

// - 3 try to register camera
// - 2 
function parameresToSyncChanged(){
// alert ("registering camera on server");
}

function DVRcursor(c) {
 if (document.getElementById("idDVRInfo").style.cursor!=c) {
   document.getElementById("idDVRInfo").style.cursor=    c;
   document.getElementById("idDVRButtons").style.cursor= c;
   document.getElementById("idDivDVR").style.cursor=     c;
 } 
}
/*
        <span id="idInfoWidth"  style="float:left;font-weight:bold; cursor:pointer;" onclick="released_btnPositioningShow(0);">0</span>
        <span id="idInfoHeight" style="float:left;font-weight:bold; cursor:pointer;" onclick="released_btnPositioningShow(0);">0</span>
        <span id="idSpanFPS"    style="color:green; float:left;font-weight:bold; cursor:pointer;" onclick="released_btnPhotoShow(3);">00.0</span>
var DVR_state_record =   6;
var DVR_state_stop   =   7;
      i=document.videoFiles[document.videoFiles.length-1].s;
      for (j=0;j<lastSessions.session.length;j++) {
//       alert ("i="+i+" j="+j+"\n"+lastSessions.session[j].toSource());
          document.sessions.session[i++]=lastSessions.session[j];

*/

/*
Always register before start and stop, make sure strat is not issued if it is running
*/
function dvrRegisterOnly() {
  document.dvrButton2Press=-1;
  dvrRegister();
}  

/*
http://166.70.153.79/vcr_lamp/camera.php?cmd=list
http://166.70.153.79/vcr_lamp/camera.php?cmd=list&mac=aabbccddeeff
http://166.70.153.79/vcr_lamp/camera.php?cmd=add&mac=a1b2c3d4e5f6&ip1=192.168.0.1&place=Dream+House

http://166.70.153.79/vcr_lamp/session.php?cmd=list
http://166.70.153.79/vcr_lamp/session.php?cmd=list&min_start_time=1142359996
http://166.70.153.79/vcr_lamp/session.php?cmd=list&min_start_time=1142359996&max_start_time=1142359996

http://166.70.153.79/vcr_lamp/session.php?cmd=start&mac=aabbccddeeff&strm_ip=232.168.0.9&strm_port=20000&fps=1&width=512&height=384
http://166.70.153.79/vcr_lamp/session.php?cmd=stop&mac=aabbccddeeff&ses_id=3

*/
document.lastDVRurl="";
function dvrRegister() {
 var t=new Date();
 DVRcursor("wait");
 var v;
 var url="http://"+document.getElementById("idDVRServer_TX").value;
   if (document.getElementById("idDVRServerPort_TX").value!="") url+=":"+document.getElementById("idDVRServerPort_TX").value;
//   alert (document.getElementById("idDVRServer_TX").value.length);
   if (document.getElementById("idDVRServer_TX").value=="") { // try to get IP of this computer from the camera
      DVRXMLHttpRequest(document.retransmitUrl); // no parameters, get environment
      return;
   }
   url+=document.serverRoot;
   if       ((document.DVR_state==DVR_state_camTry) || (document.DVR_state==DVR_state_camReTry)) {
     url+="/camera.php?cmd=list";
   } else if (document.DVR_state==DVR_state_camAdd)  {
     url+="/camera.php?cmd=add";
   } else if (document.DVR_state==DVR_state_camEdit)  {
     url+="/camera.php?cmd=edit";
   } else if (document.DVR_state==DVR_state_sessions)  {
     url+="/session.php?cmd=list";
   } else if (document.DVR_state==DVR_state_record)  {
     url+="/session.php?cmd=start";
     if ((document.sessions.session.length>0) && (parseInt(document.sessions.session[document.videoFiles[document.videoFiles.length-1].s].stop_stream) == 0)) {
       document.DVR_state=DVR_state_sessions;
       DVRcursor("");
       return; // stream already is being recorded
     }
     
   } else if (document.DVR_state==DVR_state_stop)  {
     url+="/session.php?cmd=stop";
     if ((document.sessions.session.length==0) ||(parseInt(document.sessions.session[document.videoFiles[document.videoFiles.length-1].s].stop_stream) > 0)) {
       document.DVR_state=DVR_state_sessions;
       DVRcursor("");
       return; // stream recording is already is stopped (or never started)
     }
   } else {
     alert("unexpected state of document.DVR_state = "+document.DVR_state);
     DVRcursor("");
     return;
   }
//   url+="?fmt=xml&mac="+escape(document.getElementById("idDVRCameraID_TX").value);
   url+="&fmt=xml&mac="+escape(document.getElementById("idDVRCameraID_TX").value);
   if (document.DVR_state==DVR_state_camEdit)  {
     if (document.getElementById("idDVRCameraIP1_TX").value!="") url+="&ip1="+escape(document.getElementById("idDVRCameraIP1_TX").value);
     if (document.getElementById("idDVRLocation_TX").value!="")  url+="&place="+escape(escape(document.getElementById("idDVRLocation_TX").value));
   } else   if ((document.DVR_state==DVR_state_sessions) && (document.videoFiles.length>0)) { // already registered - will continue
     url+="&min_start_time="+document.sessions.session[document.videoFiles[document.videoFiles.length-1].s].start_stream;
   } else if (document.DVR_state==DVR_state_record)  {
     url+="&strm_rtsp_ip=" +document.configsData[configsNumberById("idConfNetIP")].val;
     url+="&strm_ip=" +document.getElementById("idDVRCameraIP2_TX").value;
     url+="&strm_port=" +document.getElementById("idDVRCameraIP2Port_TX").value;
     url+="&width=" +document.getElementById("idInfoWidth").innerHTML;
     url+="&height="+document.getElementById("idInfoHeight").innerHTML;
     url+="&fps="+   document.getElementById("idSpanFPS").innerHTML;
     if       ((v=parseFloat(document.getElementById("idDVRMaxFileSize_TX").value))>0) {
       url+="&max_file_size="+   Math.round(v*1048510);
     }
//     alert("v="+v+"/"+document.getElementById("idDVRMaxFileSize_TX").value+"\n"+url);
   } else if (document.DVR_state==DVR_state_stop)  {
   parseInt(document.sessions.session[document.videoFiles[document.videoFiles.length-1].s].stop_stream)
     url+="&ses_id="+document.sessions.session[document.videoFiles[document.videoFiles.length-1].s].id; // id - text, here - OK
   }
   url+="&_time="+t.getTime();
   checkBadUrl(url,"dvrRegister");
//
// Cross-domain xmlHTTPRequests do not work because of the security limitations in Mozilla (if not specially enabled in profile). We will use camera
// to re-transmit requests to the server and return the results back. It might be a waste, but xml files are supposed
// to be small ones.
// server URL should be IP, camera does not support DNS
//

//alert (url);

 url=document.retransmitUrl+"?"+escape(url); 
// document.title=url; //********************
 DVRXMLHttpRequest(url);
}
function DVRXMLHttpRequest(url) {
document.lastDVRurl=url;
if (document.debug & 64) document.title=" url="+url;
if (document.debug & 512) document.title+=" "+url.substr(57,5);
//alert (url);
  if(window.XMLHttpRequest) {
    DVRDBxml_req = new XMLHttpRequest();
    DVRDBxml_req.onreadystatechange = dvrRegister_rec;
    DVRDBxml_req.open("GET", url, true);
    DVRDBxml_req.send(null);
  } else if(window.ActiveXObject) {
    DVRDBxml_req = new ActiveXObject("Microsoft.XMLHTTP");
    if(DVRDBxml_req) {
      DVRDBxml_req.onreadystatechange = dvrRegister_rec;
      DVRDBxml_req.open("GET", url, true);
      DVRDBxml_req.send();
    }
  }
}

function dvrRegister_rec() {
    if (typeof(DVRDBxml_req)=="undefined") return; //trying to fight "uncaught exceptions"  (happens when camera is setting it's date)
    if (DVRDBxml_req.readyState == 4) {
        // only if "OK"
        if (DVRDBxml_req.status == 200) { // if camera time was not set in advance, "uncaught exception" will be here
            // ...processing statements go here...
          dvrRegister_rec_got(); // **** back to main loop ****
        } else {
            DVRcursor("");
            alert_once("There was a problem retrieving the XML data\nurl="+document.lastDVRurl+"\n result:\n" +
                DVRDBxml_req.statusText);
        }
    }
}

function dvrRegister_rec_got() { // parse it here
// alert ("state="+document.DVR_state+"\n"+DVRDBxml_req.responseText)
if (document.debug & 512) document.title+=" dvrr="+document.DVR_state;
  var i,n,l,j,s,id;
  if (document.getElementById("idDVRServer_TX").value=="") { // try to get IP of this computer from the camera
    if (DVRDBxml_req.responseXML.getElementsByTagName('REMOTE_ADDR' ).length>0) {
      document.getElementById("idDVRServer_TX").value=DVRDBxml_req.responseXML.getElementsByTagName('REMOTE_ADDR' )[0].firstChild.nodeValue;
      document.DVR_state=DVR_state_camTry;
      dvrRegister();
    } else   {
      DVRcursor("");
      alert ("error trying to get IP of this computer from the camera\nurl="+document.lastDVRurl+"\n  - returned:\n"+DVRDBxml_req.responseText);
    }
    return;
  } else if (document.DVR_state==DVR_state_record) { // start record
    if (DVRDBxml_req.responseXML.getElementsByTagName('id' ).length>0) {
      i=parseInt(DVRDBxml_req.responseXML.getElementsByTagName('id' )[0].firstChild.nodeValue);
// alert ("dvrRegister_rec_got() id=="+i); 
if (document.debug & 65536) document.title+=" rid="+i;
      document.DVR_state=DVR_state_sessions;
      document.dvrButton2Press=-1; // no buttons to simulate press to
      document.DVRRetriesConfirmRecordLeft=document.DVRRetriesConfirmRecord; // maybe - not needed, but I suspect that record indicator sometimes did not come up (record did started) because of
      // some delay on a server;
if (document.debug & 512) document.title+=" started";
      
      dvrRegister();
    } else {
      DVRcursor("");
      alert ("error starting a recording session\nurl="+document.lastDVRurl+"\n returned:\n"+DVRDBxml_req.responseText);
      document.dvrButton2Press=-1; // no buttons to simulate press to
      document.DVR_state=DVR_state_sessions;
    }
    return;
  } else if (document.DVR_state==DVR_state_stop) { // stop record
    if ((DVRDBxml_req.responseXML.getElementsByTagName('stop' ).length>0) && (DVRDBxml_req.responseXML.getElementsByTagName('stop' )[0].firstChild.nodeValue=="OK")) {
      document.DVR_state=DVR_state_sessions;
      document.dvrButton2Press=-1; // no buttons to simulate press to
      document.DVRRetriesConfirmRecordLeft=-document.DVRRetriesConfirmRecord; // maybe - not needed, but I suspect that record indicator sometimes did not come up (record did started) because of
      // some delay on a server;
if (document.debug & 512) document.title+=" stoped";
      dvrRegister();
      return;
    } else {
      DVRcursor("");
      alert ("error terminating a recording session\nurl="+document.lastDVRurl+"\n returned:\n"+DVRDBxml_req.responseText);
      document.dvrButton2Press=-1; // no buttons to simulate press to
      document.DVR_state=DVR_state_sessions;
      return;
    }
  
  } else if (document.DVR_state==DVR_state_camAdd) {
//    alert(typeof (DVRDBxml_req.responseXML.getElementsByTagName('add' )));
//    alert(DVRDBxml_req.responseXML.getElementsByTagName('add' ).toSource());
//    alert(typeof (DVRDBxml_req.responseXML.getElementsByTagName('add' ).length));
//    alert(DVRDBxml_req.responseXML.getElementsByTagName('add' ).length);
   if ((typeof (DVRDBxml_req.responseXML.getElementsByTagName('add' ).length)=="undefined")||
        (DVRDBxml_req.responseXML.getElementsByTagName('add' ).length==0)) {
      id=document.getElementById(document.TABS_dvr.id).parentNode.id;
// show settings with the link to the DVR software download      
      document.divVisibility[id]="";
      document.getElementById(id).style.display=document.divVisibility[id];
      onClickTabs(document.TABS_dvr.id,document.TABS_dvr.n);
      showWindow();
      alert(document.getElementById("h_idDVRServerInstall").innerHTML);
      document.DVR_state=DVR_state_camTry;
      document.getElementById("idDVRSoftwareAll").style.display="";
      return;
    }
// was getting error if no server responded  (or wrong server)
//Error: no element found
//Source File: http://192.168.0.9/xmlxmt.cgi?http%3A//192.168.0.18/vcr_lamp/camera.php%3Fcmd%3Dlist%26fmt%3Dxml%26mac%3D000E6404014A%26_time%3D1142468269396
//Line: 1, Column: 1
//Source Code:
    if (DVRDBxml_req.responseXML.getElementsByTagName('add' )[0].firstChild.nodeValue=="OK") {
      document.DVR_state=DVR_state_camReTry;
      dvrRegister();
      return;
    } else {
      DVRcursor("");
      alert ("error adding camera to db\nurl="+document.lastDVRurl+"\nreturned:\n"+DVRDBxml_req.responseText);
      return;
    }
    
  } else if (document.DVR_state == DVR_state_camEdit) { // edit
    if (DVRDBxml_req.responseXML.getElementsByTagName('edit' )[0].firstChild.nodeValue=="OK") {
      document.DVR_state = DVR_state_sessions;
//  alert ("camera registered with the DVR server");
      dvrRegister();
    } else {
      DVRcursor("");
      alert ("error editing camera info in db\nurl="+document.lastDVRurl+"\nreturned:\n"+DVRDBxml_req.responseText);
    }
    return;
  } else if (document.DVR_state == DVR_state_sessions) { // read sessions
    document.getElementById("idDVRSoftwareAll").style.display="none";  // server is working, no need for the software
    var n=DVRDBxml_req.responseXML.getElementsByTagName('session' ).length;
    if (n>0) { // number of 'session' tags >0 
// main parsing here
      var  lastSessions=parseXmlResponce(DVRDBxml_req.responseXML.getElementsByTagName('recorder')[0].childNodes);
      if (typeof(lastSessions.session.length)=="undefined") { // just one session
        lastSessions.session=new Array(lastSessions.session);
      }
if (document.debug & 65536) document.title+=" ("+lastSessions.session.length+")";     
      if ((!document.sessions) || (document.sessions.session.length == 0)) {
        document.sessions=lastSessions;
      } else { // merge
        i=(document.videoFiles.length>0)?document.videoFiles[document.videoFiles.length-1].s : 0;
        for (j=0;j<lastSessions.session.length;j++) {
          document.sessions.session[i++]=lastSessions.session[j];
        }    
      }
      processSessions();
if (document.debug & 512) document.title+=" btp="+document.dvrButton2Press;
      
      if ((document.dvrButton2Press!=DVRRecord) &&(document.dvrButton2Press!=DVRStopRecord)) { // do not update record indicator before the on/off command is executed
        dvrShowRecording();
      }
      
      DVRcursor(""); // is it OK to release here?
      if (document.dvrButton2Press >= 0) {
        dvrButtonContinue(document.dvrButton2Press); //continue with the button pressed that caused first registration
      }
      return; // ************************ everything is in sync with DB *******************************
    } else { //zero length
      DVRcursor("");
// below - it can just be OK - just empty database      
//      alert ("problems reading session info\nurl="+document.lastDVRurl+"\nreturned:\n"+DVRDBxml_req.responseText+"\nIt can be OK - just a new database with no records");
      document.title="**** Empty database ****";
// try to make an empty session (OK for recording)      
      document.sessions={session:new Array()};
      processSessions();
      if ((document.dvrButton2Press!=DVRRecord) &&(document.dvrButton2Press!=DVRStopRecord)) { // do not update record indicator before the on/off command is executed
        dvrShowRecording();
      }
      
      DVRcursor(""); // is it OK to release here?
if (document.debug & 64) document.title+=" <"+document.dvrButton2Press+">";
      
      if (document.dvrButton2Press >= 0) {
        dvrButtonContinue(document.dvrButton2Press); //continue with the button pressed that caused first registration
      }
      return; // ************************ everything is in sync with DB *******************************
    }
  } else if ((document.DVR_state==DVR_state_camTry) || (document.DVR_state==DVR_state_camReTry)) {
    if (DVRDBxml_req.responseXML.getElementsByTagName('camera' ).length>0) { // number of 'camera' tags >0 (we now are interested in just 1)
// main parsing here
      document.cameraDbInfo={};
      l=DVRDBxml_req.responseXML.getElementsByTagName('camera' )[0].childNodes.length;
      for (j=0;j<l;j++) {
//        alert ("l="+l+" j="+j+"\n"+DVRDBxml_req.responseXML.getElementsByTagName('camera' )[0].childNodes[j].nodeName);
        if (DVRDBxml_req.responseXML.getElementsByTagName('camera' )[0].childNodes[j].nodeName !="#text") {
          document.cameraDbInfo[DVRDBxml_req.responseXML.getElementsByTagName('camera' )[0].childNodes[j].nodeName]=
              DVRDBxml_req.responseXML.getElementsByTagName('camera' )[0].childNodes[j].childNodes.length?
                                unescape(unescape(DVRDBxml_req.responseXML.getElementsByTagName('camera' )[0].childNodes[j].childNodes[0].nodeValue)):""; 
        }
      }
     if ((document.cameraDbInfo.ip1!="") && (document.getElementById("idDVRCameraIP1_TX").value==""))   document.getElementById("idDVRCameraIP1_TX").value=document.cameraDbInfo.ip1;
     if ((document.cameraDbInfo.place!="") && (document.getElementById("idDVRLocation_TX").value =="") ) document.getElementById("idDVRLocation_TX").value=document.cameraDbInfo.place;
     document.DVR_state=DVR_state_camEdit;
     dvrRegister();
     return;     
    } else {
       if (document.DVR_state==DVR_state_camTry) {
         document.DVR_state=DVR_state_camAdd;
         dvrRegister(); // run "add camera"
         return; 
       } else {
         DVRcursor("");
         alert ("Error: could not list camera after adding it");
         return;
       }
    }
  } else {
     DVRcursor("");
     alert("unexpected state of in dvrRegister_rec_got() document.DVR_state  - "+document.DVR_state);
     return;
  }
}
function dvrShowRecording() {
  if (document.videoFiles.length>0) {
    var lastSes=document.videoFiles[document.videoFiles.length-1].s;
    if  (parseInt(document.sessions.session[lastSes].stop_stream)==0) { // recording in progress
      setBuTtonState("btnDVRRecord", 1);    
      setBuTtonState("btnDVRRecord_L", 1);    
      document.getElementById("idRecOff").style.display="none";
      document.getElementById("idRecOn").style.display="";
      document.getElementById("idDVRRecordingSinceAll").style.color="#ff0000";
      document.getElementById("idDVRRecordingSince").innerHTML=printDateTime(fromEpoch (parseInt(document.sessions.session[lastSes].start_stream)));
    } else {
      setBuTtonState("btnDVRRecord", 0);    
      setBuTtonState("btnDVRRecord_L", 0);    
      document.getElementById("idRecOff").style.display="";
      document.getElementById("idRecOn").style.display="none";
      document.getElementById("idDVRRecordingSinceAll").style.color="";
      document.getElementById("idDVRRecordingSince").innerHTML="---";
    } 
  } else {
      setBuTtonState("btnDVRRecord", 0);    
      setBuTtonState("btnDVRRecord_L", 0);    
      document.getElementById("idRecOff").style.display="";
      document.getElementById("idRecOn").style.display="none";
      document.getElementById("idDVRRecordingSinceAll").style.color="";
      document.getElementById("idDVRRecordingSince").innerHTML="---";
  }  
}

function dvrShowStartStopping(strt) { // 1 - show starting, 0 - show stopping
    if  (strt) { // recording in progress
      setBuTtonState("btnDVRRecord", 1);    
      setBuTtonState("btnDVRRecord_L", 1);    
//      document.getElementById("idRecOff").style.display="none";
//      document.getElementById("idRecOn").style.display="";
      document.getElementById("idDVRRecordingSinceAll").style.color="#ff0000";
      document.getElementById("idDVRRecordingSince").innerHTML="starting...";
    } else {
      setBuTtonState("btnDVRRecord", 0);    
      setBuTtonState("btnDVRRecord_L", 0);    
//      document.getElementById("idRecOff").style.display="";
//      document.getElementById("idRecOn").style.display="none";
      document.getElementById("idDVRRecordingSinceAll").style.color="#ff0000";
      document.getElementById("idDVRRecordingSince").innerHTML="stopping...";
    } 
}
// will skip all text except the terminal strings in tags

function parseXmlResponce(xmlObj) {
  var n,i,nam,t,j;
//  var nm;
  n=xmlObj.length;
//  if (!(n>0)) return null; // "undefined" OK too
  if (!(n>0)) return ""; // "undefined" OK too
  if ((n==1) && (xmlObj[0].nodeName =="#text")) return xmlObj[0].nodeValue; 
  var obj={};
  j=0;
  for (i=0;i<n;i++) if ((nam=xmlObj[i].nodeName) !="#text") {
    if      ((t=typeof(obj[nam]))=="undefined") { // new named element
      j++;
//      nm=nam;
      obj[nam]=    parseXmlResponce(xmlObj[i].childNodes);
    } else if ( obj[nam].length>1)  obj[nam][obj[nam].length]= parseXmlResponce(xmlObj[i].childNodes);
    else obj[nam]=                 new Array (obj[nam],      parseXmlResponce(xmlObj[i].childNodes)); // was text, not array
  }
  
//  if      (j==0) return null;
  if      (j==0) return "";
  
  else return obj;
}

//document.videoFiles=new Array(0);
function processSessions() {
 var i,j,tx,k;
 var sorted,ep0;
 var ts;
 var f;
 document.videoFiles=new Array(0);
// alert(document.sessions.session.toSource());
 for (i=0; i<document.sessions.session.length;i++) {
// document.title+=" "+i+"/"+document.sessions.session[i].files.file.length;
   if (typeof (document.sessions.session[i].files.file)=="undefined") {
          document.sessions.session[i].files={file:new Array(0)}; // no files in a session
   } else if (typeof (document.sessions.session[i].files.file.length)=="undefined") {
               document.sessions.session[i].files.file=new Array(document.sessions.session[i].files.file);
   }  
   sorted=true; // session files seem to be sorted, but is it always so?
   ep0=0;
// alert(document.sessions.session[i].toSource());
   for (j=0;j<document.sessions.session[i].files.file.length;j++) {
      tx=document.sessions.session[i].files.file[j].url;
// remove directory part and ".ogm" (only one dot)    
      while ((k=tx.indexOf("/"))>=0) tx=tx.substr(k+1);
      tx=tx.substr(0,tx.indexOf("."));
      tx=tx.split("-");
//alert (tx.toSource());
//      tx=tx.substr(tx.indexOf(".")-15,15);
//      document.sessions.session[i].files.file[j].epoch=toEpoch (textToDate(tx));
      document.sessions.session[i].files.file[j].epoch=   toEpoch (textToDate(tx[0]+"-"+tx[1]));
      document.sessions.session[i].files.file[j].epochEnd=toEpoch (textToDate(tx[2]+"-"+tx[3]));
      document.sessions.session[i].files.file[j].dur=document.sessions.session[i].files.file[j].epochEnd-document.sessions.session[i].files.file[j].epoch;
      document.sessions.session[i].files.file[j].frames=  parseInt(tx[4]);
      if (document.sessions.session[i].files.file[j].epoch<ep0){
//        alert ("unsorted, "+document.sessions.session[i].files.file[j].epoch+"<"+ ep0 +" i="+i+" j="+j+"\n"+document.sessions.session[i].toSource());
        sorted=false;
      }  
      ep0=document.sessions.session[i].files.file[j].epoch;
   }
   if (!sorted) {
//     alert ("Session files are not sorted - please add the sorting code to camvc_dvr.js");
//     debugWindowShow(document.sessions.toSource());
     while (!sorted) {
       sorted=true;
       for (j=0;j<(document.sessions.session[i].files.file.length-1);j++) {
         if (document.sessions.session[i].files.file[j+1].epoch < document.sessions.session[i].files.file[j].epoch) {
           f=document.sessions.session[i].files.file[j+1];
           document.sessions.session[i].files.file[j+1]=document.sessions.session[i].files.file[j];
           document.sessions.session[i].files.file[j]=f;
           sorted=false;
         }
       }
     }
   }
// includes possible time zone difference and latency
   if (document.sessions.session[i].files.file.length>0) {
/*   
     ts=document.sessions.session[i].files.file[0].epoch-parseInt(document.sessions.session[i].start_stream);
     for (j=0;j<document.sessions.session[i].files.file.length-1;j++) {
       document.sessions.session[i].files.file[j].dur=document.sessions.session[i].files.file[j+1].epoch-document.sessions.session[i].files.file[j].epoch; //(might be 0)
     }
     document.sessions.session[i].files.file[document.sessions.session[i].files.file.length-1].dur=
       parseInt(document.sessions.session[i].stop_stream) + ts -
        document.sessions.session[i].files.file[document.sessions.session[i].files.file.length-1].epoch; //<0 - unfinished
*/        
     for (j=0;j<document.sessions.session[i].files.file.length;j++) {
       document.videoFiles[document.videoFiles.length]={s:i,f:j};
     }
   }      
 }
// alert ("document.videoFiles.length="+document.videoFiles.length+"\n"+document.videoFiles.toSource());

 if (document.videoFiles.length>0) {
   if (document.DVR_fileNum.len!=document.videoFiles.length) { // number of files actually changed since last time
     document.DVR_fileNum.len=document.videoFiles.length;
     if (document.DVR_fileNum.n<0) { // only if was not registered before
       document.DVR_fileNum.n=document.DVR_fileNum.len-1; // point to last record
     }
     if (document.videoFiles.length>1) {
       setSliderHigh("idDVRSlider_slIder",document.DVR_fileNum.len-1);
       setSliderAndText("idDVRSlider_slIder", document.DVR_fileNum.n); // needed in any case - slider should be redrawn even if only .len changed, not .n
       document.divVisibility["idDVRSlider"]="";
       document.getElementById("idDVRSlider").style.display="";
       enableSlider("idDVRSlider_slIder",1);
       showWindow();
    }   
  }     
 } else {
   document.divVisibility["idDVRSlider"]="none";
   document.getElementById("idDVRSlider").style.display="none";
   document.DVR_fileNum.len=-1;
   document.DVR_fileNum.n=-1;
   enableSlider("idDVRSlider_slIder",0); //disable until registered OK
   
 }
 showDVRInfoAll();
}

function dvrPositionOnFile() {
//   setSliderAndText("idDVRSlider_slIder", document.DVR_fileNum.n);
   document.DVR_fileNum.n= parseInt(getSliderValue("idDVRSlider_slIder"));
   showDVRInfoAll();
   if (document.dvrWasVideoState==DVRVideoStatePlay) dvrStartPlay(); // play
}




function resetDVRPlay() {
 alert("stop and rewind file");
}
// ******************************
/*
document.videoFiles=new Array(0);
document.sessions=null;
document.DVR_state=DVR_state_camTry;
//document.DVR_fileNum={ses:-1,fil:0,pos:0};
document.DVR_fileNum={n:-1,fil:0,pos:0};
*/
function nextDVRfile () { //return true if bumps;
  if (document.DVR_fileNum.n<0) return true;
  document.DVR_fileNum.n++;
  if (document.DVR_fileNum.n >= document.videoFiles.length) {
    document.DVR_fileNum.n--;
    return true;
  }
  setSliderAndText("idDVRSlider_slIder", document.DVR_fileNum.n);
  showDVRInfoAll();
  return false;
}

function prevDVRfile () { //return true if bumps;
  if (document.DVR_fileNum.n<0) return true;
  document.DVR_fileNum.n--;
  if (document.DVR_fileNum.n <0) {
    document.DVR_fileNum.n=0;
    return true;
  }
  setSliderAndText("idDVRSlider_slIder", document.DVR_fileNum.n);
  showDVRInfoAll();
  return false;
}

//********************************************



function showDVRInfoAll() {
  var furl="http://"+document.getElementById("idDVRServer_TX").value;
  if (document.getElementById("idDVRServerPort_TX").value!="") furl+=":"+document.getElementById("idDVRServerPort_TX").value;
  var ss,f;
//  
 if (document.videoFiles.length>0) {
  with (document.sessions.session[document.videoFiles[document.DVR_fileNum.n].s].files.file[document.videoFiles[document.DVR_fileNum.n].f]) {
    var nm=name;
//document.title+=" "+nm+ " "+furl;    
    if (nm.length > 20) nm=nm.substr(0,3)+"..."+nm.substr(nm.length-14,14);
    document.getElementById("idDVRFileShortName").innerHTML=nm;
    document.getElementById("idDVRLink_LN").href=furl+url;
    document.getElementById("idDVRFileSize").innerHTML=Math.round(parseFloat(size)/10000)/100;
    document.getElementById("idDVRFileStart").innerHTML=(ss=printDateTime(fromEpoch (epoch)));
    document.getElementById("idDVRStart_TX").value=ss;
    
    if (dur>0) {
      document.getElementById("idDVRFileEnd").innerHTML=printDateTime(fromEpoch (epoch+dur));
      document.getElementById("idDVRFileDuration").innerHTML=printTime(fromEpoch (dur));
    } else if (dur==0) {
      document.getElementById("idDVRFileEnd").innerHTML=printDateTime(fromEpoch (epoch));
      document.getElementById("idDVRFileDuration").innerHTML="< 1 sec";
    } else { // <0
      document.getElementById("idDVRFileEnd").innerHTML="???";
      document.getElementById("idDVRFileDuration").innerHTML="???";
    }
    if (frames>=0) {
      document.getElementById("idDVRFileFrames").innerHTML=frames;
    } else { // <0
      document.getElementById("idDVRFileFrames").innerHTML="???";
    }
  
  
  
  }
  with (document.sessions.session[document.videoFiles[document.DVR_fileNum.n].s]) {
    if (typeof(file_format) != "undefined" )document.getElementById("idDVRFileFormat").innerHTML= file_format;
    document.getElementById("idDVRFrameWidth").innerHTML= width;
    document.getElementById("idDVRFrameHeight").innerHTML=height;
    document.getElementById("idDVRFPS").innerHTML=((f=parseFloat(fps))>0)?f:"---";
  }
 } 
  showDVRInfoPos();
//  showWindow(); // if the
}
document.lastPlaybackPosition=0;
function  showPlaybackPosition(v) {
  v=Math.round(v);
  if (document.lastPlaybackPosition !=v) {
    document.lastPlaybackPosition=v;
    document.getElementById("idDVRFilePosition").innerHTML=printTime(fromEpoch (v));
    return true;
  }
  return false;
}


function showDVRInfoPos() {
     document.getElementById("idDVRFilePosition").innerHTML=printTime(fromEpoch (document.DVR_fileNum.pos));
}



function searchVideoFile() {
  var i,j,e;
  var s0= document.getElementById("idDVRStart_TX").value;
  var s=""
  for (i=0;i<s0.length;i++) {
    if (" -:/".indexOf(s0.substr(i,1))>=0) {
      s+=" ";
    } else { 
      s+=s0.substr(i,1);
    } 
  }  
  s=s.split(" ");
  j=0;
  for (i=0;i<s.length;i++) {
    if (s[i]!="") {
      if (i>j) s[j]=s[i];
      j++; 
    }
  }
  j--;
  
//  dt=fromEpoch (document.sessions.session[document.DVR_fileNum.ses].files.file[document.DVR_fileNum.fil].epoch);
  dt=fromEpoch (document.sessions.session[document.videoFiles[document.DVR_fileNum.n].s].files.file[document.videoFiles[document.DVR_fileNum.n].f].epoch);
//document.title="j="+j+ " s="+s.toSource();
  if (j>=0) {
    dt.s=parseInt(s[j--]);
//document.title+=" dt.s="+dt.s;
    if ((dt.s<0) || (dt.s>59)) return false;// do nothing
  }
  if (j>=0) {
    dt.n=parseInt(s[j--]);
//document.title+=" dt.n="+dt.n;
    if ((dt.n<0) || (dt.n>59)) return false;// do nothing
  }
  if (j>=0) {
    dt.h=parseInt(s[j--]);
//document.title+=" dt.h="+dt.h;
    if ((dt.h<0) || (dt.h>23)) return false;// do nothing
  }
  if (j>=0) {
    dt.y=parseInt(s[j--]);
//document.title+=" dt.y="+dt.y;
    if (dt.y<1970) return false;// do nothing
  }
  if (j>=0) {
    dt.d=parseInt(s[j--]);
//document.title+=" dt.d="+dt.d;
    if ((dt.d<0) || (dt.d>31)) return false;// do nothing
  }
  if (j>=0) {
    dt.m=parseInt(s[j--]);
//document.title+=" dt.m="+dt.m;
    if ((dt.m<0) || (dt.m>11)) return false;// do nothing
  }
  e=toEpoch(dt);
// document.title+=" e="+e+" dt="+dt.toSource();
//  stopStreamPlayback();
  
//******************************************************  
//  if (document.DVR_fileNum.n=>document.videoFiles.length) {
//  createVideoSlider(w-200,document.sessions.session[document.videoFiles[document.DVR_fileNum.n].s].files.file[document.videoFiles[document.DVR_fileNum.n].f].dur);
  
//  document.DVR_fileNum={ses:0,fil:0,pos:0};
  for (document.DVR_fileNum.n=0;document.DVR_fileNum.n<document.videoFiles.length;document.DVR_fileNum.n++) {
// document.title+=" " +document.sessions.session[document.videoFiles[document.DVR_fileNum.n].s].files.file[document.videoFiles[document.DVR_fileNum.n].f].epoch; 
      if (document.sessions.session[document.videoFiles[document.DVR_fileNum.n].s].files.file[document.videoFiles[document.DVR_fileNum.n].f].epoch >= e) {
        setSliderAndText("idDVRSlider_slIder", document.DVR_fileNum.n);
        showDVRInfoAll();
        if (document.dvrWasVideoState==DVRVideoStatePlay) dvrStartPlay(); // play
        return true;
      }
  } 
//document.title+=" >- document.DVR_fileNum.n="+document.DVR_fileNum.n;
  setSliderAndText("idDVRSlider_slIder", document.DVR_fileNum.n);
  showDVRInfoAll();
  if (document.dvrWasVideoState==DVRVideoStatePlay) dvrStartPlay(); // play
  
  return true;
    
}
//*****************************************************

/*
var DVRVideoStateStop= 0;
var DVRVideoStateLive= 1;
var DVRVideoStateLiveP=2;
var DVRVideoStatePlay= 3;
var DVRVideoStatePlayP=4;
*/
document.dvrWasVideoState=0;
document.dvrButton2Press;
function onPlayerRun() {
     if (parseInt(document.getElementById("idVideoObject").run)==0) {
       if (getBuTton("idDVRLoop_CB").s) {
         document.getElementById("idVideoObject").run=1; // (run again)
       } else if (getBuTton("idDVRNextPlay_CB").s){
          document.dvrWasVideoState=DVRVideoStatePlay;
          document.enableForwardRetry=true;
          dvrButtonContinue (5); // forward
       } else {
         dvrButton (4); // stop
       }  
     }
}
// if ((dvrVideoState()== DVRVideoStatePlay) || (dvrVideoState()== DVRVideoStatePlayP))
function dvrVideoState() { // 0 - off, 1 - live, 2 live pause (not yet used), 3 - playing, 4 pause
  if ((!document.getElementById("idVideoObject")) || (typeof(document.getElementById("idVideoObject").pause)=="undefined")) return DVRVideoStateStop;
   var p=parseInt (document.getElementById("idVideoObject").pause);
   var l= document.getElementById("idVideoObject").href;
   l= (l.indexOf("rtp://")>=0) || (l.indexOf("rtsp://")>=0);
   if (l && !p) return DVRVideoStateLive;
   if (l && p) return DVRVideoStateLiveP;
   if (!p) return DVRVideoStatePlay;
   return DVRVideoStatePlayP;   
}
function dvrStartPlay() {
//document.sessions.session[document.videoFiles[document.DVR_fileNum.n]
    vw=parseInt(document.sessions.session[document.videoFiles[document.DVR_fileNum.n].s].width);
    vh=parseInt(document.sessions.session[document.videoFiles[document.DVR_fileNum.n].s].height);
    if (!(vh>1)) { // just something non-0 not to get stuck with zero-size
      vw=1024; 
      vh=768;
    }
    url=document.getElementById("idDVRLink_LN").href;
    makeStreamPlayback(vw,vh,url);  
}

function DVRButtonReady() {
  return ((document.getElementById("idDVRInfo").style.cursor != "wait") || document.shiftKey);
}


function dvrButton (n) { //
if (document.debug & 512) document.title=n;

  document.enableForwardRetry=true;
  document.dvrWasVideoState=dvrVideoState();
  var id;
  var vw, vh, url;
  if (!DVRButtonReady()) {
if (document.debug & 65536) document.title+=" ?";     
    dvrShowRecording(); // return the buttons as they should be
    return;
  }
  if ((n != DVRList) && (n != DVRSettings)) {
    if ((document.sessions==null) || (n==DVRRecord) || (n==DVRStopRecord)) { // will try to make automatic registration with default address (make a script in the camera to find out local "my" address)
                                   // localhost will not work - need real address as camera sees it
                                   // always re-register for record/stop record commands to have up-to-date session info
      if      (n==DVRRecord) dvrShowStartStopping(1);
      else if (n==DVRStopRecord) dvrShowStartStopping(0);
      document.dvrButton2Press=n;                             
//      alert("You need to register at the DVR server to be able to use it");
      dvrRegister();
      return;
    }
  }
  document.DVRRetriesConfirmRecordLeft=0; // 
  dvrButtonContinue (n);
 }
 
 function dvrButtonContinue (n) { // come here from the code, not just from the user command
  if ((document.sessions==null) && (n != DVRList) && (n != DVRSettings) ) {
     alert ("Unable to perform the command - could not register at DVR");
     return;
  }  
  if (n==DVRRecord) { //record
    document.DVR_state=DVR_state_record;
    document.dvrButton2Press=n;
    dvrRegister();
  } else if (n==DVRStopRecord){ //stop record
    document.DVR_state=DVR_state_stop;
    document.dvrButton2Press=n;
    dvrRegister();
  } else if (n==DVRBack){ //back
//    if ((dvrVideoState()==DVRVideoStatePlay) || (dvrVideoState()==DVRVideoStatePlayP)) stopStreamPlayback();
    prevDVRfile ();
    if (document.dvrWasVideoState==DVRVideoStatePlay) dvrStartPlay(); // play
  } else if (n==DVRForward){ //forward
//    if ((dvrVideoState()==DVRVideoStatePlay) || (dvrVideoState()==DVRVideoStatePlayP)) stopStreamPlayback();
    if (nextDVRfile ()) {
      if (!document.enableForwardRetry) {
        if ((dvrVideoState()== DVRVideoStatePlay) || (dvrVideoState()== DVRVideoStatePlayP)) stopStreamPlayback(); // just stop
      } else { // try re-register to get new files if any
        document.dvrButton2Press=n;
        document.enableForwardRetry=false; // will not loop if no new records
        dvrRegister();
      }
    } else {
      if (document.dvrWasVideoState==DVRVideoStatePlay) dvrStartPlay(); // play
    }  
  } else if (n==DVRPlay){ //play
    if (dvrVideoState()==DVRVideoStatePlayP) {
       document.getElementById("idVideoObject").pause=0;
       document.getElementById("idVideoR").innerHTML="R";
    } else {
       dvrStartPlay();
    }
  } else if (n==DVRPause){ //pause
     if (parseInt(document.getElementById("idVideoObject").pause)>0) {
       document.getElementById("idVideoObject").pause=0;
       document.getElementById("idVideoR").innerHTML="R";
        
     } else {
       document.getElementById("idVideoObject").pause=1;
       document.getElementById("idVideoR").innerHTML="P";
     }  
  } else if (n==DVRStop){ //stop
    
    stopStreamPlayback();
    
    
  } else if (n==DVRList) { // list
    id="idDivDVR";
    if (document.getElementById(id).style.display=="") {
      document.divVisibility[id]="none";
      document.getElementById(id).style.display=document.divVisibility[id];
    } else {
      document.divVisibility[id]="";
      document.getElementById(id).style.display=document.divVisibility[id];
    }
    showWindow();
    
  } else if (n==DVRSettings) { // settings
    id=document.getElementById(document.TABS_dvr.id).parentNode.id;
    if ((document.getElementById(id).style.display=="") && (getSelectedTab(document.TABS_dvr.id)==document.TABS_dvr.n)) {
      document.divVisibility[id]="none";
      document.getElementById(id).style.display=document.divVisibility[id];
    } else {
      document.divVisibility[id]="";
      document.getElementById(id).style.display=document.divVisibility[id];
      onClickTabs(document.TABS_dvr.id,document.TABS_dvr.n);
    }
    showWindow();
  } else if (n==DVRSearch) { // search
    searchVideoFile();
//    alert("was search");
  } else {
  }
}

/*





{id:"btnDVRRecord",         n:73, t:"T2",dm:"",   aoer:"dvrButton(getBuTton(id).s?6:9);",aolr:"*"},
{id:"btnDVRRecord_L",       n:73, t:"T2",dm:"",  aoer:"dvrButton(getBuTton(id).s?6:9);",aolr:"*"},
{id:"btnDVRStopRecord",     n:71, t:"b",dm:"",   aoer:"dvrButton(9);",aolr:"*"},

//    setBuTtonState("idAexpOn_CB", !getBuTton("idAexpOn_CB").s);

*/
//http://www.comptechdoc.org/independent/web/cgi/javamanual/javadate.html
/*
    * Date() - Use the current date and time to create an instance of the object date.
    * Date(dateString) - Use the date specified by the string to create the instance of the date object. String format is "month day, year hours:minutes:seconds".
    * Date(year, month, day) - Create an instance of date with the specified values. Year is 0 to 99.
    * Date(year, month, day, hours, minutes, seconds) - Create an instance of date with the specified values. 

# getDate() - Get the day of the month. It is returned as a value between 1 and 31.
# getDay() - Get the day of the week as a value from 0 to 6
# getHours() - The value returned is 0 through 23.
# getMinutes() - The value returned is 0 through 59.
# getMonth() - Returns the month from the date object as a value from 0 through 11.
# getSeconds() - The value returned is 0 through 59.
# getTime() - The number of milliseconds since January 1, 1970. this function allows you to manipulate the date object based on a millisecond value then convert it back to the form you want. In the example below, it is # getTimeZoneOffset() - Time zone offset in hours which is the difference between GMT and local time.
# getYear() - Returns the numeric four digit value of the year.
# parse() - The number of milliseconds after midnight January 1, 1970 till the given date espressed as a string in the example which is IETF format.
var curdate = "Wed, 18 Oct 2000 13:00:00 EST"
# setDate(value) - Set the day of the month in the date object as a value from 1 to 31.
# setHours(value) - Set the hours in the date object with a value of 0 through 59.
# setMinutes(value) - Set the minutes in the date object with a value of 0 through 59.
# setMonth(value) - Set the month in the date object as a value of 0 through 11.
# setSeconds(value) - Set the seconds in the date object with a value of 0 through 59.
# setTime(value) - Sets time on the basis of number of milliseconds since January 1, 1970. The below example sets the date object to one hour in the future.


*/

// TODO: change date/time manipulation to standard functions listed above

//num22chr(n)
document.months=new Array (31,28,31,30,31,30,31,31,30,31,30,31);
//date <->epoch - no time zone, no daylight savings.
function textToDate (tx) { //yyyymmdd-hhmmss
  var dt={y:0,m:0,d:0,h:0, n:0, s:0};
  with (dt) {
    y=parseInt(tx.substr(0,4),10);
    m=parseInt(tx.substr(4,2),10);
    d=parseInt(tx.substr(6,2),10);
    h=parseInt(tx.substr(9,2),10);
    n=parseInt(tx.substr(11,2),10);
    s=parseInt(tx.substr(13,2),10);
    
  }  
  return dt;
}

function toEpoch (dat) { //{y,m,d,h,n,s}
   with (dat) {
     var dd=365*(y-1970)+Math.floor((y-1969)/4)+ (d-1);
     var i; for (i=1;i<m;i++) dd+=document.months[i-1];
     if ((y==(4*Math.floor(y/4))) && (m>2)) dd++;
     return dd*86400+h*3600+n*60+s;
   }  
}

function fromEpoch (epoch) { //yyyymmdd-hhmmss
  var dt={y:0,m:0,d:0,h:0, n:0, s:0};
  with (dt) {
    d=Math.floor(epoch/86400);
    s=epoch-86400*d;
    h=Math.floor(s/3600);
    s-=h*3600;
    n=Math.floor(s/60);
    s-=n*60;
    var y4=Math.floor(d/1461);
    d-= y4*1461;
    y=1970+4*y4;
    var lp=0;
    if (d>=365) {
      y++;d-=365;
      if (d>=365) {
        y++;d-=365;
        if (d>=366) {
         y++;d-=366;
        } else lp=1;
      }
    }
    var dm;
    for (m=1; d >= (dm=(document.months[m-1]+(((m==2) &&  lp)? 1:0))); d-=dm) m++;
    d++;
  }  
  return dt;
}

function num22chr(n) {
  var s=""+n;
  if (s.length<2) s="0"+s;
  return s;
}

function printDateTime(dt){
  return ((dt.m<10)?"0":"")+dt.m+"/"+((dt.d<10)?"0":"")+dt.d+"/"+dt.y+" "+
         ((dt.h<10)?"0":"")+dt.h+":"+((dt.n<10)?"0":"")+dt.n+":"+((dt.s<10)?"0":"")+dt.s;
}
function printTime(dt){
  return ((dt.h<10)?"0":"")+dt.h+":"+((dt.n<10)?"0":"")+dt.n+":"+((dt.s<10)?"0":"")+dt.s;
}

