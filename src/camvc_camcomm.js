/*
*! -----------------------------------------------------------------------------**
*! FILE NAME  : camvc_camcomm.js
*! DESCRIPTION: Provides communication with the camera
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
*!  $Log: camvc_camcomm.js,v $
*!  Revision 1.18  2010/08/01 19:30:24  elphel
*!  new readonly parameter FRAME_SIZE and it support in the applications
*!
*!  Revision 1.17  2010/06/04 01:56:51  elphel
*!  Initial support for the multi-sensor operation
*!
*!  Revision 1.16  2008/12/11 07:24:35  elphel
*!  debug output (commented out anyway)
*!
*!  Revision 1.15  2008/12/11 06:37:57  elphel
*!  Added animated refresh button
*!
*!  Revision 1.14  2008/12/10 22:09:37  elphel
*!  Skipping histogram refresh (and hiding it) when compressor is stopped (fro circbuf navigation)
*!
*!  Revision 1.13  2008/12/10 07:25:12  elphel
*!  fixing bugs that prevented this page work with Konqueror
*!
*!  Revision 1.12  2008/12/10 03:43:17  elphel
*!  Bug fix that prevented Konqueror to open camvc. Now it nearly works with it
*!
*!  Revision 1.11  2008/12/09 23:35:38  elphel
*!  Fixed handling Exif image description
*!
*!  Revision 1.10  2008/12/09 22:11:56  elphel
*!  Fixed resizing, changed color/mono checkbox to mode selector
*!
*!  Revision 1.9  2008/12/09 07:51:52  elphel
*!  Partial support of ccam.ftp added alerts on non-yet-ported control tabs. Temporary launches autocampars to save selected parameters fro next autostart
*!
*!  Revision 1.8  2008/12/08 22:19:17  elphel
*!  removed obsolete parts of ccamftp software
*!
*!  Revision 1.7  2008/12/05 08:10:19  elphel
*!  Fixed work (at least seems so) circbuf+Exif operation
*!
*!  Revision 1.6  2008/12/05 03:31:31  elphel
*!  Multiple changes, some cleanup and working on restoring circbuf/Exif functionality available in 7.1
*!
*!  Revision 1.5  2008/12/04 02:24:46  elphel
*!  Adding/debugging autoexposure controls
*!
*!  Revision 1.4  2008/12/02 00:28:13  elphel
*!  multiple bugfixes, making white balance to work and work with camvc
*!
*!  Revision 1.3  2008/12/01 07:33:03  elphel
*!  Added gains, scales, white balance control
*!
*!  Revision 1.2  2008/11/30 06:41:43  elphel
*!  changed default IP back to 192.168.0.9 (temporarily was 192.168.0.7)
*!
*!  Revision 1.1.1.1  2008/11/27 20:04:03  elphel
*!
*!
*!  Revision 1.4  2008/11/16 17:35:53  elphel
*!  restored histogram (autoexposure) window control
*!
*!  Revision 1.3  2008/11/10 19:55:51  elphel
*!  8.0.alpha15 - first camvc working with 8.0 (just basic features - no autoexposure, white balance, ...), but it is now really possible (again after it was broken for quite a while) to move sliders and navigator windows without fighting with the camera that tried to move them back
*!
*!  Revision 1.2  2008/11/08 23:59:23  elphel
*!  snapshot
*!
*!  Revision 1.1  2008/11/08 05:54:02  elphel
*!  snapshot - working on camvc
*!
*!
*/
document.cameraParametersAcquired=false; /// not used so far

var gNoMoreAlerts=false; //to prevent endless alert_onces
/// States of the parameters that er needed to be synchronized between the client and th camera
var STATE_DISABLED=   0; /// client is not yet synchronized with the camera, no client-initiated parameters changes are permitted
                         /// (until got parameters from the camera)
var STATE_DISABLED1=  1; /// client is in the process of synchronizing with the camera (received once), to client-initiated parameters changes are permitted
                         /// (until got parameters from the camera)
var STATE_IDLE=       2; /// Parameter was not modified by user (at least since it was updated from the camera) - only state for readonly parameters
var STATE_CLIENTMOD=  3; /// Parameter was modified by user, no related request sent to the camera yet
var STATE_REQUESTSENT=4; /// Request to modify the parameter was sent to the camera (timestamp of the request assigned parameter.timestamp
var STATE_REQUESTCONF=5; /// Request to modify the parameter was confirmed by the camera, parameter.target_frame assigned
/// Request states
var COMM_STATE_INIT=  0; /// not yet initialized
var COMM_STATE_IDLE=  1; /// initial state (send commands/request status)
var COMM_STATE_CMD=   2; /// command sent/status request sent, waiting for xmlresponse
var COMM_STATE_IMG=   3; /// image request sent, waiting for the image
var COMM_STATE_HIST=  4; /// histogram request sent, waiting for the histogram
var COMM_STATE_LAST=  COMM_STATE_HIST; /// last state

/// sequence of actions matters
var camParamsList=Array (
                         {name:"sensor",        type:"s", act:"onSensor", delay:0},
                         {name:"SENSOR",        type:"i", act:"onSensor", delay:0},
                         {name:"SENSOR_WIDTH",  type:"i", act:"onSensor", delay:0},
                         {name:"SENSOR_HEIGHT", type:"i", act:"onSensor", delay:0},
                         {name:"e",             type:"f", act:"onGotExposure", delay:0},
                         {name:"color",         type:"i", act:"onGotColor", delay:0},
                         {name:"fliph",         type:"i", act:"onGotWindow", delay:0},
                         {name:"flipv",         type:"i", act:"onGotWindow", delay:0},
                         {name:"ww",            type:"i", act:"onGotWindow", delay:0},
                         {name:"wh",            type:"i", act:"onGotWindow", delay:0},
                         {name:"wl",            type:"i", act:"onGotWindow", delay:0},
                         {name:"wt",            type:"i", act:"onGotWindow", delay:0},
                         {name:"dh",            type:"i", act:"onGotWindow", delay:0},
                         {name:"dv",            type:"i", act:"onGotWindow", delay:0},
                         {name:"bh",            type:"i", act:"onGotWindow", delay:0},
                         {name:"bv",            type:"i", act:"onGotWindow", delay:0},
                         {name:"msens",         type:"i", act:"onSensor",    delay:0},
                         {name:"mseq",          type:"i", act:"onGotWindow", delay:0},
                         {name:"mmod",          type:"i", act:"onGotWindow", delay:0},
                         {name:"msel",          type:"i", act:"onGotWindow", delay:0},
                         {name:"ACTUAL_WIDTH",  type:"i", act:"onGotWindow", delay:0},
                         {name:"ACTUAL_HEIGHT", type:"i", act:"onGotWindow", delay:0},
                         {name:"FRAME_SIZE",    type:"i", act:"onGotWindow", delay:0},
                         {name:"iq",            type:"i", act:"onGotQuality", delay:0},
                         {name:"gr",            type:"f", act:"onGotGains", delay:0},
                         {name:"gg",            type:"f", act:"onGotGains", delay:0},
                         {name:"ggb",           type:"f", act:"onGotGains", delay:0},
                         {name:"gb",            type:"f", act:"onGotGains", delay:0},
                         {name:"rscale",        type:"f", act:"onGotScales", delay:0},
                         {name:"bscale",        type:"f", act:"onGotScales", delay:0},
                         {name:"gscale",        type:"f", act:"onGotScales", delay:0},
                         {name:"wbrs",          type:"f", act:"onGotWbScales", delay:0},
                         {name:"wbbs",          type:"f", act:"onGotWbScales", delay:0},
                         {name:"wbgs",          type:"f", act:"onGotWbScales", delay:0},
                         {name:"wben",          type:"i", act:"onGotWbEn", delay:0}, // change to wb
                         {name:"bit",           type:"i", act:"onGotBit", delay:0},
                         {name:"gam",           type:"f", act:"onGotGammaPxl", delay:0, linked:Array("pxl")},
                         {name:"pxl",           type:"f", act:"onGotGammaPxl", delay:0, linked:Array("gam")},
                         {name:"csb",           type:"f", act:"onGotSaturation", delay:0},
                         {name:"csr",           type:"f", act:"onGotSaturation", delay:0},
                         {name:"comp_run",      type:"s", act:"onCompSensRun", delay:0},
                         {name:"sens_run",      type:"s", act:"onCompSensRun", delay:0},
                         {name:"fps",           type:"f", act:"onFPS", delay:0},
                         {name:"fpslm",         type:"f", act:"onFPS", delay:0},
                         {name:"fpsflags",      type:"i", act:"onFPS", delay:0},
///TODO: Make some parameters only sent on startup?
                         {name:"decXmask",      type:"i", act:"onSensor", delay:0},
                         {name:"decYmask",      type:"i", act:"onSensor", delay:0},
                         {name:"binXmask",      type:"i", act:"onSensor", delay:0},
                         {name:"binYmask",      type:"i", act:"onSensor", delay:0},
                         {name:"hrw",           type:"f", act:"onHistWnd",   delay:0},
                         {name:"hrh",           type:"f", act:"onHistWnd",   delay:0},
                         {name:"hrl",           type:"f", act:"onHistWnd",   delay:0},
                         {name:"hrt",           type:"f", act:"onHistWnd",   delay:0},
                         {name:"ae",            type:"s", act:"onAexpOnOff", delay:0},
                         {name:"aef",           type:"f", act:"onAexp",      delay:0},
                         {name:"ael",           type:"f", act:"onAexp",      delay:0},
                         {name:"aemax",         type:"f", act:"onAexpMaxExp",delay:0},
                         {name:"ftp",           type:"s", act:"onFTPOnOff",  delay:0}
);
var gPRoot={};
var gRequests;
var gXML_req={}; //has to be global?

function initParams(list) {
  var i;
  gRequests= new Requests();
  for (i in list) {
    gPRoot[list[i].name] = new CamAPar (list[i].name,list[i].type, list[i].act,list[i].delay,list[i].linked);
    gRequests.addAction (list[i].act);
  }
}

/// =============== constructor for Requests ======================
function Requests() {
  this.timeout=         10000; /// 20 seconds - may increase for the slow internet connections
  this.timeOutTimerID=   null;
  this.updateStatTimerID=null; /// once-a-second status update
  this.updateStatPeriod= 1000; /// update status while waiting for request
  this.lastRequestSent=     0;
  this.refreshDuration= 20000;
  this.refreshTimeOut=      0;
//  this.completed=        true; /// will be set to false by timout timer
  this.maxRetries=          2;
  this.retriesLeft=         2;
  this.inProgress=      false;

  this.state=COMM_STATE_INIT;
  this.cmdNeeded=0; /// reset when all actions are processed and allcamAPar.state==STATE_IDLE. Allow other requests (image, histogram) to proceed
  this.cmdRequsted=0; ///value of cmdNeeded when request was sent (do detect any parameters set between request sent and received)
  this.setStr='';
  this.getStr='';
  this.todo={};
  this.time=new Date();
  this.timestamp=this.time.getTime();
  this.actions={};
  this.php='camvc.php';
//  this.histogram="/pnghist.cgi?";
  this.histogram='/pnghist.cgi?';

  this.imgsrv=""; /// will be received from the camera - like http://192.168.0.9:8081/
  this.url='';
  this.imgUrl='bimg';
  this.histUrl='';
//  this.extraParameters='&out=all&dbgwait&sleep=2';
//  this.extraParameters='&out=all&dbgwait';
  this.extraParameters='&out=all';
  this.setTimeImage=new Image();
  var t1=new Date();
  this.setTimeImage.src=this.php+'?out=gif&_time='+t1.getTime(); // just set FPGA/system time (if was not set before)
  this.ExifPage=0; // 0 - current. else (stopped) - match current image
  this.pointersAreCurrent=false; // acquire circbuf pointers after compressor is stopped
  this.pointersAreNeeded= true;
  this.circbuf=Array();
  this.circbuf_count=0;
  this.circbufNavigationPendingId="";
  this.circbuf_fp="";
  this.circbuf_frame_number=0;// (0 - latest, 1...this.circbuf_count - from buffer)
  this.ExifNeeded=false;
  this.ExifCircbufImgNeeded=false;
  this.newDescription="";
  this.bgHist=new Image();
  this.shadowImage= new Image();
  this.emptyImg=new Image();
  this.emptyImg.src='/images/empty.png';


//  this.shadowImage.onload=gInterface.gotShadow;
//  this.bgHist.onload=     gInterface.gotHistogram;
  document.debug=0;
  this.numRequests={cmd:0,img:0,hist:0};  //not yet used
//  this.actualWidth=0;
//  this.actualHeight=0;
  this.lastImageWidth=1;
  this.lastImageHeight=1;
  document.imageEnabled=true;
  document.awbFlag=true;
  document.histogramEnabled=true;
  document.imageGot=false;
  document.userFPS=30; ///FIXME:
  document.hist={
            enabled:1,
            hght:128,
            aver:5,
            scale:1.0,
            sqr:1,
            r:1,g:1,b:1,w:0,g1:0,g2:0,
            stl:1,
            interp:2};
///  document.hist_out={hist_out_r:0,hist_out_g:0,hist_out_g2:0,hist_out_b:0};
///  document.hist_in={hist_in_r:0,hist_in_g:0,hist_in_g2:0,hist_in_b:0};
};

Requests.prototype.needsUpdate=function() {
  this.cmdNeeded++;
}


Requests.prototype.setInterfacePointers=function(onloadImage,onloadHistogram) {
   this.shadowImage.onload=onloadImage;
   this.bgHist.onload=     onloadHistogram;
}

function pressedRefresh(force) {
  dbgp(4," RFR"+gRequests.state+"(force="+force+")");
  if (force) {
    alert ("Ignoring current activity, resetting state to COMM_STATE_IDLE. (state was "+gRequests.state+")");
    gRequests.state=COMM_STATE_IDLE;
  }
  startRefresh();
}

function startRefresh() {
//document.title+=gRequests.state+"--"+gRequests.inProgress+"//"; //1--
if (document.debug & 32768) document.title+="#";
 gRequests.needsUpdate();
 var t=new Date();
 gRequests.refreshTimeOut=t.getTime()+ gRequests.refreshDuration; // start the refresh/timeout
 if (((gRequests.state==COMM_STATE_IDLE) || (gRequests.state==COMM_STATE_INIT)) && !gRequests.inProgress)  {
//    document.title+="%%";
    requestsNextState(gRequests.state==COMM_STATE_IDLE); // start from idle
//    document.title+="+++";
 } 
}

/// start with (state==COMM_STATE_INIT) requestsNextState(false) - it will "retry" initialization
//Requests.prototype.nextState=function(success) {
function requestsNextState(success) {
//document.title="=="+gRequests.state+"("+success+")";
//document.title+=' '+gRequests.state;
    gRequests.inProgress= false;
    gRequests.clearTimeouts();
    stopRequestsStatusUpdateTimer();

    if (!success) {
/// abort any requests in progress
      if (gXML_req && (typeof(gXML_req.abort) == "function")) gXML_req.abort(); /// Aborting XML request (if any)
/// Add aborting image/histogram here
      if      (gRequests.state==COMM_STATE_IMG)  gRequests.shadowImage.src=gRequests.emptyImg.src; /// hope there will be no onLoad!
      else if (gRequests.state==COMM_STATE_HIST) gRequests.bgHist.src=     gRequests.emptyImg.src;

      gRequests.retriesLeft--;
      if (gRequests.retriesLeft<0) {
        gInterface.statusUpdate();
        gRequests.state= COMM_STATE_IDLE;
        alert ("Aborted as retry counter expired");
        return;      /// ****** will stop updating. 
      }
    } else { /// Previous request was a success. Need to go to the next one
      switch (gRequests.state) { /// current state
        case COMM_STATE_INIT: /// Here - after first successfully received status data from the camera
          circbufRun(gPRoot["comp_run"].getValue() == 'run');
          gRequests.state= COMM_STATE_CMD;
          break;
        case COMM_STATE_IDLE: /// What was that? Just awaken
          gRequests.state= COMM_STATE_CMD;
          break;
        case COMM_STATE_CMD:
          if (gRequests.cmdNeeded) gRequests.state= COMM_STATE_CMD; /// Need to send command/get status now
          else                     gRequests.state= COMM_STATE_IMG;
          break;
/// requests for Image and histogram will return to the requestsNextState(true) - they check conditions there
        case COMM_STATE_IMG:
          if (gRequests.cmdNeeded) gRequests.state= COMM_STATE_CMD; /// Need to send command/get status now
          else                gRequests.state= COMM_STATE_HIST;
          break;
        case COMM_STATE_HIST:
          if (gRequests.cmdNeeded) gRequests.state= COMM_STATE_CMD; /// Need to send command/get status now
          else { /// see if the refresh time expired
//                            gRequests.state= COMM_STATE_CMD;
                          gRequests.state= COMM_STATE_IDLE;
          }
          break;
      }
/// find out - what will be the next state
      gRequests.retriesLeft=gRequests.maxRetries;
    }
/// See if restart is needed
    var t=new Date();
/// writing small  numbers to gRequests.refreshTimeOut will cause that number of update cycles to run, then stop
    if (gRequests.state == COMM_STATE_IDLE) {
//document.title="*"+(gRequests.refreshTimeOut-t.getTime())+"*";
      if ( gRequests.cmdNeeded ||
          ((gPRoot["comp_run"].getValue() == 'run')?
              (gRequests.refreshTimeOut > t.getTime()):
              (!gRequests.pointersAreCurrent && gRequests.pointersAreNeeded))) {
         gRequests.state= COMM_STATE_CMD;
      }
//document.title+="("+gRequests.state+")";
    }

/// for all states, but idle
    if (gRequests.state!= COMM_STATE_IDLE) {
      gRequests.clearTimeouts(); // just in case
      gRequests.timeOutTimerID=setTimeout(requestsNextState, gRequests.timeout,false);
      startRequestsStatusUpdateTimer();
    }

//    var t=new Date();
    gRequests.lastRequestSent=t.getTime();
    switch (gRequests.state) { /// send next request...
      case COMM_STATE_IDLE: /// will stop refreshing
        break;
      case COMM_STATE_INIT: /// see if
      case COMM_STATE_CMD:
         gRequests.sendHttpReq();     /// Will trigger either requestsNextState(true) or requestsNextState(false)
      break;
      case COMM_STATE_IMG:
         //console.log("Getting new image @ "+Date.now()/1000);
         gRequests.getImage();
/// start image loading, onLoad/timeout  should trigger either requestsNextState(true) or requestsNextState(false)
        break;
      case COMM_STATE_HIST:
         gRequests.getHistogram();
/// start histogram loading, onLoad/timeout  should trigger either requestsNextState(true) or requestsNextState(false)
        break;
    }
    return;
//  }
}


Requests.prototype.clearTimeouts=function() {
  if (this.timeOutTimerID) { /// Clear it in any case - timeout or not
      clearTimeout(this.timeOutTimerID);
      this.timeOutTimerID=null; /// stop timer
  }
}

/**
 * @brief Prepare and send HTTP request
 */
Requests.prototype.sendHttpReq=function() {
  this.time=new Date(); ///only for parameters request
  this.timestamp=this.time.getTime();
  this.prepGetStr();
  this.prepTodo();
  this.serialize();
  this.url=this.php+"?";
  this.url+="sensor_port="+document.sensor_port.toString()+"&";
  this.cmdRequsted=this.cmdNeeded; ///value of cmdNeeded when request was sent (do detect any parameters set between request sent and received)

  if (this.setStr.length) {
   this.url+="set="+this.setStr+"&";
  }
  this.url+="get="+this.getStr;
//  this.url+="&hout="+((gPRoot['ae'].getValue()=='on')?(document.AeLevelToDisplay/256):gPRoot['ael'].getValue());
//  this.url+="&hout="+((gPRoot['ae'].getValue()=='on')?(parseFloat(getSliderValue("idAexpMonitor_slIder"))/256):gPRoot['ael'].getValue());
  this.url+="&hout="+muxHistLevel();
//  if ((gPRoot['comp_run'].getValue()!='run') &&

//document.title+="("+this.pointersAreCurrent+":"+this.pointersAreNeeded+")";
  if ((gPRoot['comp_run'].getValue()=='stop') &&
                   !this.pointersAreCurrent &&
                     this.pointersAreNeeded &&
          (!(this.setStr.indexOf('comp_run')>=0))) { /// it is better to wait for the confirmation compressor is actually stopped. otherwise - too early
    this.url+="&circbuf";
  }
  if (this.newDescription) {
     this.url+="&description="+this.newDescription;
     this.newDescription="";
  }

  if (gPRoot['comp_run'].getValue()=='run')  this.url+="&exif=0";
  else if (this.ExifNeeded)                 this.url+="&exif="+this.ExifPage;

//     gPRoot['ael'].setValue(parseFloat(getSliderValue("idAexpLevels_slIder"))/256);
//getSliderValue("idAexpMonitor_slIder")
  this.url+=this.extraParameters;
  this.url+="&_time="+this.timestamp;
  if (this.imgsrv=="") this.url+="&imgsrv";
  
  checkBadUrl(this.url,"Requests.prototype.sendHttpReq");
  
  gXML_req=new XMLHttpRequest();
  gXML_req.open("GET", this.url, true);
  gXML_req.reqObject = this;
  gXML_req.onreadystatechange = function() {  // "this" does not work here with Konqueror, but gXML_req.status still fails
    if (typeof(gXML_req)=="undefined") return; /// trying to fight "uncaught exceptions"  (happens when camera is setting it's date)
    if (gXML_req.readyState == 4) {
        if (((gXML_req.status >= 200) && (gXML_req.status < 300)) || (gXML_req.status ==304) ||
             ((typeof(gXML_req.status) =='undefined' ) && ((navigator.userAgent.indexOf("Safari")>=0) || (navigator.userAgent.indexOf("Konqueror")>=0))))
          { // if camera time was not set in advance, "uncaught exception" will be here
          gXML_req.reqObject.parseXML(gXML_req.responseXML);
//          requestsNextState(true); // **** back to the main loop: GOOD
        } else {
          if ((document.cameraParametersAcquired) || (gXML_req.status)) /// Status 0 is common when the page is reloaded with some request pending
             if (gXML_req.status || document.cameraParametersAcquired) { /// Ignoring stray responces when page is reloaded
             alert_once("There was a problem retrieving the XML data:\nRequests.prototype.sendHttpReq\n" + this.url+"\n"+(gXML_req.status?gXML_req.statusText:"gXML_req.status==0")+ ", document.cameraParametersAcquired="+document.cameraParametersAcquired+
             "\nYou may safely ignore this message if you just reloaded this page");
          }
        }
    }
  }
  gXML_req.send(null);
  this.inProgress= true;
}


Requests.prototype.parseXML=function(xml) {
//    gRequests.clearTimeouts();
//    stopRequestsStatusUpdateTimer();
//  document.title+=" D";
//  document.title+="--> ";
  if (this.cmdNeeded==this.cmdRequsted)  this.cmdNeeded=0; /// No parameter changes/requests were made between xml request and responce
  this.allPars={};    /// array of "abstarct" parameters/values received
  this.allNatPars={}; /// array of native parameters/values received
  this.allSet={};
//  this.allSetXML=xml.getElementsByTagName('set'); // just for the fireBug - it sometimes nulls the xml structure
  var iter, inat, setName;
  var i, ep;
//  var nativeGot=xml.getElementsByTagName('nativeGot');
  if (xml.getElementsByTagName('nativeGot').length>0) {
    for (iter= xml.getElementsByTagName('nativeGot')[0].firstChild; iter; iter=iter.nextSibling) this.allNatPars[iter.tagName]=parseInt(iter.firstChild.nodeValue);
  }
  if (xml.getElementsByTagName('get').length>0) {
    for (iter= xml.getElementsByTagName('get')[0].firstChild; iter; iter=iter.nextSibling) this.allPars[iter.tagName]=iter.firstChild.nodeValue;
  }
  if (xml.getElementsByTagName('set').length>0) {
    for (iter= xml.getElementsByTagName('set')[0].firstChild; iter; iter=iter.nextSibling) {
       setName=iter.tagName;
       this.allSet[setName]={};
       if (iter.getElementsByTagName('frame').length>0) this.allSet[setName]['frame']=parseInt(iter.getElementsByTagName('frame')[0].firstChild.nodeValue);
       this.allSet[setName]['native']={};
       if (iter.getElementsByTagName('native').length>0) {
         for (inat= iter.getElementsByTagName('native')[0].firstChild; inat; inat=inat.nextSibling) {
            this.allSet[setName]['native'][inat.tagName]=(inat.firstChild==null)?null:inat.firstChild.nodeValue;
         }
       }
    }
  }
  this.receivedFrame=this.allNatPars['FRAME'];
  if ((xml.getElementsByTagName('req_ts').length>0) && (xml.getElementsByTagName('req_ts')[0].firstChild)) {
     this.receivedTimestamp=parseInt(xml.getElementsByTagName('req_ts')[0].firstChild.nodeValue);
  }
/// Process sent parameters confirmations
  for (iter in this.allSet) {
    gPRoot[iter].conf(this.receivedTimestamp, this.allSet[iter].frame, this.allSet[iter].native);
  }

/// Process parameter chnages
  for (iter in this.allPars) { //.receivedTimestamp is used to detect missing confirmation of the request sent
    gPRoot[iter].received(this.receivedTimestamp, this.allPars[iter],this.receivedFrame,this.allNatPars);
  }
///Receive circuf data if any
  if ((xml.getElementsByTagName('circbuf').length>0) && (xml.getElementsByTagName('circbuf')[0].childNodes.length>0)) {
    this.circbuf_count=xml.getElementsByTagName('circbuf')[0].childNodes.length;
    this.circbuf=getCircbuf(xml.getElementsByTagName('circbuf')[0].childNodes);
    this.pointersAreCurrent=true;
    showCircbufFrame(this.circbuf_count);
//document.title+="pending:"+this.circbufNavigationPendingId+" ";
    if (this.circbufNavigationPendingId!=="") {
       pressedCircbufNav(this.circbufNavigationPendingId);
    }

  }
///Receive Exif data if any
//  if ((gPRoot['comp_run'].getValue()!='on') && (parseInt( getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('Exif_page' )[0]) ) ==  this.ExifPage))
//          this.ExifNeeded=false;

  if ((xml.getElementsByTagName('Exif').length>0)) {
    ep=parseExif(xml.getElementsByTagName('Exif')[0]); // calculate always!
    if ((gPRoot['comp_run'].getValue()!='on') && (ep == this.ExifPage)) this.ExifNeeded=false;
  }
///sent
  this.doActions();
/// receive histogram data:
  if ((xml.getElementsByTagName('hist_out_g').length>0) && (xml.getElementsByTagName('hist_out_g')[0].firstChild)) {
       gInterface.onGotHistOutG(parseFloat(xml.getElementsByTagName('hist_out_g')[0].firstChild.nodeValue));
  }

  if ((this.imgsrv=="") && (xml.getElementsByTagName('imgsrv').length>0))
     this.imgsrv= xml.getElementsByTagName('imgsrv')[0].firstChild.nodeValue;
  if (!document.cameraParametersAcquired) {
    parametersInitialized();
    document.cameraParametersAcquired=true;
  }
// btnRefresh
// setBuTtonState("idEnableHist_CB",true); /// hack - fighting control that slides out of the mouse when histogram window opens 
//       alert ("set to 1! - "+getBuTton('idEnableHist_CB').s);
//  this.receivedFrame=this.allNatPars['FRAME'];
  var refreshButtonState=getBuTton('btnRefresh').s;

  if ((refreshButtonState!=1) && (refreshButtonState!=2)) { /// not pressed and not disabled
//    setBuTtonState('btnRefresh',(4+(this.receivedFrame & 3)));
    setBuTtonState('btnRefresh',(4+((refreshButtonState+1) & 3)));

  }

  requestsNextState(true); // **** back to the main loop: GOOD
}


function getIfDefinedFCNV(obj) {return (typeof(obj)!="undefined")?((obj.firstChild)?obj.firstChild.nodeValue:""):"";}
function getIfDefined0FCNV(obj) {return (obj.length && (typeof(obj[0])!="undefined"))?((obj[0].firstChild)?obj[0].firstChild.nodeValue:""):"";}

var veryFirstImage = true;

Requests.prototype.getImage=function() {
//  if (!document.imageEnabled) { requestsNextState(true); return; } // **** back to the main loop: SKIPPED
  if (getBuTton('idEnableImageRefresh_CB').s==0) { requestsNextState(true); return; } /// **** back to the main loop: SKIPPED

  var t=new Date();
///       document.requests.img++; debugComm(8192);
  if (gPRoot["comp_run"].getValue() == 'run'){
    this.shadowImage.src=  this.imgsrv+this.imgUrl+"&_time="+t.getTime();
    // for TIFF format there will be no onload event, need to fire it manually
    if (gPRoot["color"].getValue()==15 && veryFirstImage){
        var e = document.createEvent('HTMLEvents');
        e.initEvent("load", false, true);
        this.shadowImage.dispatchEvent(e);
        //$(this.shadowImage).trigger("onload");
    }
    veryFirstImage = false;
//    document.title+="bimg";
  } else if (this.ExifCircbufImgNeeded) {
    var newUrl=this.imgsrv+this.circbuf_fp+this.imgUrl;
//alert(newUrl+"---"+this.shadowImage.src);
    if (newUrl==this.shadowImage.src) {
//      alert ("--same image--");
      requestsNextState(true);  // **** back to the main loop: SKIPPED
      return; 
    }
    this.shadowImage.src=  this.imgsrv+this.circbuf_fp+this.imgUrl;
//    document.title+=this.circbuf_fp+"bimg";
  } else {
//   document.title+="#";
    requestsNextState(true);
    return;
  } // **** back to the main loop: SKIPPED
  this.inProgress= true;
}

Requests.prototype.getHistogram=function() {
//document.title="*****************"+getBuTton('idEnableHist_CB').s;
//document.title+='G';
  
//  if (getBuTton('idEnableHist_CB').s==0) { requestsNextState(true); return; } /// **** back to the main loop: SKIPPED
  if (document.getElementById("idDivHist").style.display == 'none') { requestsNextState(true); return; } /// **** back to the main loop: SKIPPED
//  document.title+=" getHistogram()";
  this.inProgress= true;
  var t=new Date();
//       document.requests.hist++;  debugComm(8192);
//  this.bgHist.src=this.histUrl+"&_time="+t.getTime(); ///hist.url should be prepared
  this.bgHist.src=this.histUrl+"&_time="+t.getTime(); ///hist.url should be prepared
}


function  startRequestsStatusUpdateTimer() {
   stopRequestsStatusUpdateTimer(); // and update status on screen
   gRequests.updateStatTimerID = self.setTimeout("startRequestsStatusUpdateTimer()", gRequests.updateStatPeriod);
}

function  stopRequestsStatusUpdateTimer() {
  if (gRequests.updateStatTimerID) {
     clearTimeout(gRequests.updateStatTimerID);
     gRequests.updateStatTimerID=null;
  }
  gInterface.statusUpdate();
}

Requests.prototype.addAction=function(act) {
  this.actions[act]={frame:0,
                     needed:false,
                     func:null
                     };
  var  ev='this.actions["'+act+'"].func = function() {gInterface.'+act+'();};';
  eval (ev);
}
Requests.prototype.scheduleAction=function(act,frame) {
  if (this.actions[act].frame < frame) {
    this.actions[act].frame = frame;
    this.actions[act].needed =true;
  }
}

Requests.prototype.doActions=function() {
  var iAct;
  for (iAct in this.actions) if (this.actions[iAct].needed) {
//document.title+=">>"+iAct+"<< ";
    this.actions[iAct].func();
    this.actions[iAct].needed =false;
  }
  var iPar;
  for (iPar in gPRoot) gPRoot[iPar].clearNew(); // clear new flag for all parameters after they are used
}

/// Prepare serialized string to be sent as "&set=..."
Requests.prototype.prepGetStr=function() {
  var par;
  this.getStr="";
  for (par in gPRoot) {
    this.getStr+=gPRoot[par].getName()+"/";
  }
};
/**
 * @brief Prepare todo array (top indexes - relative delays in frames, below name/value pairs)
 */
Requests.prototype.prepTodo=function() { /// timestamp should be set
  var par;
  var lastDelay=0;
  this.todo={};
  for (par in gPRoot) {
    if (gPRoot[par].reqToSend()) {
      if (typeof(this.todo[gPRoot[par].getDelay()])=="undefined") this.todo[gPRoot[par].getDelay()]={};
      this.todo[gPRoot[par].getDelay()][gPRoot[par].getName()]=gPRoot[par].getValue();
      gPRoot[par].sent(this.timestamp);
    }
  }
};

Requests.prototype.serialize=function() {
  var dly, par;
  this.setStr="";
  for (dly in this.todo) {
     this.setStr+=dly+"/";
     for (par in this.todo[dly]) {
        this.setStr+=par+":"+this.todo[dly][par]+"/";
     }
  }
};


/// =============== constructor for CamAPar ======================

function CamAPar(name, varType, act, dly, linked) {
  this.name=name;
  this.varType=varType; // s - string, i - integer, f - float
  this.sValue=""; // string value, before parsing
  this.parValue=0; // parsed parameter value
  this.timestamp=0;
  this.frame=0;
  this.relatedNative={};
//  this.state=STATE_IDLE;
  this.state=STATE_DISABLED;
  this.delay=dly;   // maybe will be needed
  this.act=act;
  this.newValue;    /// when action was scheduled, this parameter was modified
//  this.linked=(typeof(linked) != "undefined")?linked:Array();
  this.linked=(linked)?linked:Array();
//  eval ('this.act = function() {'+act+'();};');

}

CamAPar.prototype.isNew=   function() {return this.newValue};
CamAPar.prototype.clearNew=function() {this.newValue=false};

CamAPar.prototype.getValue=function() {return this.parValue};
CamAPar.prototype.getName= function() {return this.name};
CamAPar.prototype.getDelay=function() {return this.delay};
CamAPar.prototype.getState=function() {return this.state};
CamAPar.prototype.setValue=function(val) {
  var i;
  var result=false;
//document.title+="setValue, this.state="+this.state+" this.name="+this.name+" val="+val;
//document.title="setValue, this.state="+this.state+" this.name="+this.name+" val="+val;
  if ((this.state!=STATE_DISABLED) && (this.state!=STATE_DISABLED1) && (this.parValue!=val)) {
   if (isBad(val)) alert ("this.state="+this.state+" setValue ("+val+":"+typeof(val)+"):"+this.toSource()); ///#####################################
   if (isBad(val))  return false;
    this.sValue=""+val;
//document.title+=this.name+":"+this.varType+" ";
    switch (this.varType) {
      case "i": this.parValue=parseInt  (this.sValue); break;
      case "f": this.parValue=parseFloat(this.sValue); break;
      default:  this.parValue=this.sValue;
    }
    if (isBad(this.parValue)) {
      alert("val=>"+val+", this.parValue="+this.parValue+", this.name="+this.name);
    }
//document.title=">>"+this.state+" val="+val;
//    this.parValue=val;
    this.state=STATE_CLIENTMOD;
    for (i in this.linked) {
      gPRoot[this.linked[i]].setValueModified();
    }
    result=true;
    gRequests.needsUpdate();
  }
  startRefresh();
  return result;
}
/// Set state as if the value was modified (for parameters that have to be sent together)
CamAPar.prototype.setValueModified=function() {
//document.title="setValue, this.state="+this.state+" this.name="+this.name+" val="+val;
  var result=false;
  if ((this.state!=STATE_DISABLED) && (this.state!=STATE_DISABLED1)) {
    this.state=STATE_CLIENTMOD;
    if (isBad(this.parValue)) {
      alert("setValueModified: val=>"+val+", this.parValue="+this.parValue);
    }
    result=true;
    gRequests.needsUpdate();
  }
  startRefresh();
  return result;
}

CamAPar.prototype.setDelay=function(val) {
  this.delay=val; // nothing else for now
}
CamAPar.prototype.reqToSend=  function() {return this.state==STATE_CLIENTMOD;};
CamAPar.prototype.sent=       function(ts) {
       this.state=STATE_REQUESTSENT;
       this.timestamp=ts;
}
CamAPar.prototype.conf=       function(ts,frame,relNat) {
   if (this.state!=STATE_REQUESTSENT) return false ; /// relying that cameras will always be re-requested for all paramer values?
   if (ts==this.timestamp) {
     this.relatedNative=relNat;     /// array (usually just one element) of camera native parameters linked to the current "abstruct" one
     this.frame=frame;              /// target frame number when the parameters are expected to change in response to the command
     this.state=STATE_REQUESTCONF; /// request confirmed, waiting for the value of the parameter from the specified (or later) frame
     return true;
   } else if (ts>this.timestamp) {  /// the request to modify this parameter seems to be lost - re-send the request
     this.state=STATE_CLIENTMOD;
     return false;
   }
   return false; /// confirmation from the earlier request - disregard it
};
CamAPar.prototype.received=   function(ts,val,frame,AllNatPars) {
//   if (this.name="comp_run") document.title+="-2("+this.state+":"+val+"/"+this.relatedNative['COMPRESSOR_RUN']+":"+AllNatPars['COMPRESSOR_RUN']+")";
   var key, modif;
   switch (this.state) {
     case STATE_REQUESTSENT: /// request sent, waiting (missed) confirmation
       if (ts>this.timestamp) this.state=STATE_CLIENTMOD; /// resend request
       return false;
     case STATE_IDLE:        /// unconditionally update the value 
     case STATE_DISABLED:    /// nothing yet received - this will be it - unconditionally update the value 
     case STATE_DISABLED1:   /// nothing yet received - this will be it - unconditionally update the value 
       break;
     case STATE_REQUESTCONF:
       if (frame < this.frame) return false; /// too early data - we are waiting for a later frame
///       see if any of the related native camera parameters did change
       modif=false;
       for (key in this.relatedNative) {
         if (this.relatedNative[key] != AllNatPars[key]) {
           modif=true;
           break;
         }
       }
       if (!modif) {
          this.state=STATE_IDLE;
          return false; ///none of the related native parameters did change
       }
       break;
     default: /// do nothing
       return false;
   }
   this.frame=frame;     /// is it needed? - just in case
   for (key in this.relatedNative) { /// is it needed? - just in case
     this.relatedNative[key]= AllNatPars[key];
   }
   if (this.sValue!=val) {
     this.sValue=""+val;
     switch (this.varType) {
       case "i": this.parValue=parseInt  (this.sValue); break;
       case "f": this.parValue=parseFloat(this.sValue); break;
       default:  this.parValue=this.sValue;
     }
     if (isBad(this.parValue)) {
       alert("val=>"+val+"< this.parValue="+this.parValue);
     }
     this.newVal=true;
     gRequests.scheduleAction(this.act,frame);
   }
   this.state=(this.state==STATE_DISABLED)?STATE_DISABLED1:STATE_IDLE;
   return true;
} 

/*! @brief is called when parameters are received first time from the camera, may perform some initialization now
 *
 */

function parametersInitialized() {
  if (gPRoot["comp_run"].getValue() != 'run')  pressedCircbufNav(0) ; /// load image from the buffer?
}

/// =================================

function checkBadUrl(url,f) {
  if (url.indexOf('NaN')>=0) alert_once ("Error: NaN in URL in "+f+"() - ("+url+")");
  if (url.indexOf('undefined')>=0) alert_once ("Error: \"undefined\" in URL in "+f+"() - ("+url+")");
  if (url=="")  alert_once ("Error: empty URL in "+f+"()");
}

function dbgp(mask,txt) {
  if (document.debug & mask) document.title +=txt;
}
function dbg(mask,txt) {
  if (document.debug & mask) document.title =txt;
}
function alert_once(t) {
  if (!gNoMoreAlerts) {
    alert (t);
    gNoMoreAlerts=true;
  }
}
function isBad (val) {return ((typeof(val)=="undefined")  || ((typeof(val)=="number") && isNaN(val)));}

