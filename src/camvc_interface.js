/*
*! -----------------------------------------------------------------------------**
*! FILE NAME  : camvc_interface.js
*! DESCRIPTION: Provides connection between ajax camera communication and camvc
*!              interface elements
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
*!  $Log: camvc_interface.js,v $
*!  Revision 1.18  2010/08/01 19:30:24  elphel
*!  new readonly parameter FRAME_SIZE and it support in the applications
*!
*!  Revision 1.17  2010/06/08 21:47:39  elphel
*!  fixed new bug in regular cameras caused by multi-sensor additions
*!
*!  Revision 1.16  2010/06/06 04:27:26  elphel
*!  Fixed updating of flipX/flipY checkboxes  when the orientation is changed in the camera (or flip* was set when the program started)
*!
*!  Revision 1.15  2010/06/04 01:56:51  elphel
*!  Initial support for the multi-sensor operation
*!
*!  Revision 1.14  2008/12/13 23:38:42  elphel
*!  Support fro SnapFulll button
*!
*!  Revision 1.13  2008/12/11 07:24:35  elphel
*!  debug output (commented out anyway)
*!
*!  Revision 1.12  2008/12/11 06:39:11  elphel
*!  reduced number of unneeded requests, corrected start when the compressor is stopped
*!
*!  Revision 1.11  2008/12/10 22:09:37  elphel
*!  Skipping histogram refresh (and hiding it) when compressor is stopped (fro circbuf navigation)
*!
*!  Revision 1.10  2008/12/09 22:11:56  elphel
*!  Fixed resizing, changed color/mono checkbox to mode selector
*!
*!  Revision 1.9  2008/12/09 07:51:52  elphel
*!  Partial support of ccam.ftp added alerts on non-yet-ported control tabs. Temporary launches autocampars to save selected parameters fro next autostart
*!
*!  Revision 1.8  2008/12/07 23:07:17  elphel
*!  Fixing few remaining "fights" between user and the camera (when some parameter is changed and camera changes it back)
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
*!  Revision 1.4  2008/12/02 01:10:30  elphel
*!  fixed white balance color correction sliders
*!
*!  Revision 1.3  2008/12/02 00:28:13  elphel
*!  multiple bugfixes, making white balance to work and work with camvc
*!
*!  Revision 1.2  2008/12/01 07:33:03  elphel
*!  Added gains, scales, white balance control
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
var gInterface;
document.dcm={dh:0,dv:0,bh:0,bv:0,dhs:0,dvs:0,bhs:0,bvs:0};   // waiting for camera to respond
document.multisensor={msens:0,mseq:0,mmod:0,msel:0};


function initInterface() {
 var i;
 initParams(camParamsList);
 gInterface=new camInterface(gPRoot,gRequests);
 gRequests.setInterfacePointers(gInterface.gotShadow,gInterface.gotHistogram);
// requestsNextState(false);
}
function camInterface(proot,req) {
//  this.pRoot=   proot;
//  this.requests=req;
  this.imgPort="8081";
}

function toggleCompressorRun() {
  if (gPRoot["comp_run"].getValue() == 'run') {
    circbufRun(false);
    gPRoot["comp_run"].setValue("stop");
    hideStreamPage();
  } else {
    circbufRun(true);
    gPRoot["comp_run"].setValue("run");
  }
  gInterface.onCompSensRun(); /// to reduce latency - will be updated when data received from the camera
}

camInterface.prototype.onCompSensRun=   function () {
   var isRunning=(gPRoot["comp_run"].getValue()=="run") && (gPRoot["sens_run"].getValue()=="run");
   updateCircbufControls();
   ignoreStreamerShow();
   if (gPRoot["comp_run"].getValue() == 'run') {
     document.getElementById("idInfoLabelRunning").style.display="";
     document.getElementById("idInfoLabelStopped").style.display="none";
     if ( (getBuTton('idEnableHist_CB').s !=0 ) && (document.getElementById("idDivHist").style.display == 'none')) {
       document.divVisibility['idDivHist']='';
       showWindow();
     }
   } else {
     document.getElementById("idInfoLabelRunning").style.display="none";
     document.getElementById("idInfoLabelStopped").style.display="";
     if (document.getElementById("idDivHist").style.display != 'none') {
       document.divVisibility['idDivHist']='none';
       showWindow();
     }
   }
};
// called when histogram controls are updated
function updateHistControls() {
//  if (document.histogramEnabled) {
  if (getBuTton('idEnableHist_CB').s!=0) {
     if ((gPRoot["comp_run"].getValue() == 'run') && (document.getElementById("idDivHist").style.display == 'none')) {
       document.divVisibility['idDivHist']='';
       showWindow();
       setBuTtonState("idEnableHist_CB",true); /// hack - fighting control that slides out of the mouse when histogram window opens 
//       alert ("set to 1! - "+getBuTton('idEnableHist_CB').s);
//       alert ("set to 1! - "+getBuTton('idEnableHist_CB').s);
     }
     gInterface.makeHistURL();
     startRefresh();
  }  
}

function enableImageRefreshClicked(){imageHistEnableClicked();}

function imageHistEnableClicked() {
       var imageEnabled=(getBuTton("idEnableImageRefresh_CB").s!=0);
//       document.histogramEnabled=document.getElementById("idCBEnableHistogramRefresh").checked;
//  if ((document.getElementById("idCBEnableImageRefresh").checked &&
  if ((imageEnabled &&
       !document.imageIsCurrent &&
       (document.getElementById("idDivCameraImage").style.display != 'none')) ||
       ((getBuTton('idEnableHist_CB').s!=0) &&
       !document.histogramIsCurrent &&
       (document.getElementById("idDivHist").style.display != 'none'))) startRefresh ();
//   document.EnableHist_CB_state=getBuTton('idEnableHist_CB').s;
}
/*

function imageHistEnableReleased() {
   setBuTtonState("idEnableHist_CB",document.EnableHist_CB_state);
}

*/


//  setBuTtonState("idEnableHist_CB",document.histogramEnabled);
//       document.histogramEnabled=document.getElementById("idCBEnableHistogramRefresh").checked;
//{id:"idEnableHist_CB",               n:30, t:"T2",dm:"",  aop:"document.hist.enable=(getBuTton(id).s!=0);updateHistControls();"},

//    document.divVisibility[id]="none";
//       (document.getElementById("idDivHist").style.display != 'none'))) startRefresh ();


camInterface.prototype.onSensor=        function () {
   document.sensorID=   gPRoot['SENSOR'].getValue();
   if (document.sensorID) {
     document.sensorType= gPRoot['sensor'].getValue();
// parse sensor type/specs      
     document.getElementById("idSensorWidth").innerHTML="<b>"+gPRoot['SENSOR_WIDTH'].getValue()+"</b>";
     document.getElementById("idSensorHeight").innerHTML="<b>"+gPRoot['SENSOR_HEIGHT'].getValue()+"</b>";
     document.decimationXMask=gPRoot['decXmask'].getValue();
     document.decimationYMask=gPRoot['decYmask'].getValue();
     document.binningXMask=   gPRoot['binXmask'].getValue();
     document.binningYMask=   gPRoot['binYmask'].getValue();
  } else {
     document.sensorType= "none";
  }
 document.getElementById("idSensorType").innerHTML="<b>"+document.sensorType+"</b>";
 document.multisensor.msens=gPRoot['msens'].getValue();
 showMultiVisibility ("idMultiSensor",document.multisensor.msens);

};

camInterface.prototype.onFPS=           function () {
   document.sensorFPS=gPRoot['fps'].getValue();
   document.getElementById("idSpanFPS").innerHTML=document.sensorFPS;
   setInfoFPS();

   document.skipStatusData=0;
   var fpslm=gPRoot['fpsflags'].getValue();
// when the following lines are enabled, they overwrite variables too soon. But it is still better to fix functionality
// so changing from another computer will chnage here too
//TODO: still fires to early and overwrites user selection - find out why
   document.fpslim=(fpslm & 1)?1:0;
   document.fpsmtn=(fpslm & 2)?1:0;
   showFPSLimit();
}

camInterface.prototype.onGotWindow=     function () {
   if (gPRoot['msens'].getValue()!=0) {
     document.multisensor.msens=gPRoot['msens'].getValue();
     document.multisensor.mseq= gPRoot['mseq' ].getValue();
     document.multisensor.mmod= gPRoot['mmod' ].getValue();
     document.multisensor.msel= gPRoot['msel' ].getValue();
   }

   document.getElementById("idFileSize").innerHTML="<b>"+(Math.round(gPRoot['FRAME_SIZE'].getValue()/1024))+"K</b>";
   document.getElementById("idActualWidth").innerHTML="<b>"+gPRoot['ACTUAL_WIDTH'].getValue()+"</b>";
   document.getElementById("idActualHeight").innerHTML="<b>"+gPRoot['ACTUAL_HEIGHT'].getValue()+"</b>";
   document.getElementById("idInfoWidth").innerHTML=gPRoot['ACTUAL_WIDTH'].getValue();
   document.getElementById("idInfoHeight").innerHTML=gPRoot['ACTUAL_HEIGHT'].getValue();
///NOTE: gets here with undefined frAmeselGetOuter ???

   frAmeselSetOuterScaled ("idMagnifier_frAmesel",{w:gPRoot['ACTUAL_WIDTH'].getValue(),h:gPRoot['ACTUAL_HEIGHT'].getValue()});
//document.title+="<"+document.actualWidth+":"+frAmeselGetOuter("idAexp_frAmesel").toSource()+":"+frAmeselGetInner ("idAexp_frAmesel").toSource()+"/";


   frAmeselSetOuterScaled ("idAexp_frAmesel",{w:gPRoot['ACTUAL_WIDTH'].getValue(),h:gPRoot['ACTUAL_HEIGHT'].getValue()});

//document.title+=frAmeselGetInner ("idAexp_frAmesel").toSource()+">";   
   document.dcm.dh=   gPRoot['dh'].getValue();
   document.dcm.dv=   gPRoot['dv'].getValue();
   document.dcm.bh=   gPRoot['bv'].getValue();
   document.dcm.bv=   gPRoot['bh'].getValue();
//TODO:  allow to switch window and resolution simultaneously, so the result image size stays the same?
   document.receivedGeometry.w=gPRoot['ww'].getValue();
   document.receivedGeometry.h=gPRoot['wh'].getValue();
   document.receivedGeometry.dh=document.dcm.dh;
   document.receivedGeometry.dv=document.dcm.dv;

   document.flipX=   gPRoot['fliph'].getValue(); ///Was missing - did it have some reason?
   document.flipY=   gPRoot['flipv'].getValue(); ///Was missing - did it have some reason?


   setBuTtonState("idFlipHor_CB",document.flipX?1:0);
   setBuTtonState("idFlipVert_CB",document.flipY?1:0);
   document.receivedGeometry.flipX=document.flipX;
   document.receivedGeometry.flipY=document.flipY;

   var i;
   var n=-1;
   for (i=0; i< document.getElementById("idImageSize").options.length; i++) {
    if (document.getElementById("idImageSize").options[i].value==(gPRoot['ww'].getValue()+"x"+gPRoot['wh'].getValue())){
     n=i;
      document.getElementById("idImageSize").options[i].selected=true;      
    }  else document.getElementById("idImageSize").options[i].selected=false;
   }
   if (n<0) {
    if ((gPRoot['ww'].getValue()==gPRoot['SENSOR_WIDTH'].getValue()) && (gPRoot['wh'].getValue()==gPRoot['SENSOR_HEIGHT'].getValue())) document.getElementById("idImageSize").options[1].selected=true;
    else document.getElementById("idImageSize").options[0].selected=true;
   }
   // move it back to when image is acquired if the resize frame will not "behave well" - don't agree to the mouse
//alert ("onGotWindow\ngPRoot['SENSOR_WIDTH'].getValue()="+gPRoot['SENSOR_WIDTH'].getValue()+"\ngPRoot['SENSOR_HEIGHT'].getValue()="+gPRoot['SENSOR_HEIGHT'].getValue()+"\ngPRoot['ww'].getValue()="+gPRoot['ww'].getValue()+"\ngPRoot['wh'].getValue()="+gPRoot['wh'].getValue()+"\ngPRoot['wl'].getValue()="+gPRoot['wl'].getValue()+"\ngPRoot['wt'].getValue()="+gPRoot['wt'].getValue());
//document.title+=" ##"+gPRoot['SENSOR_WIDTH'].getValue()+":"+gPRoot['SENSOR_HEIGHT'].getValue()+" ";
   frAmeselSetOuter ("idWindow_frAmesel",{w:gPRoot['SENSOR_WIDTH'].getValue(),h:gPRoot['SENSOR_HEIGHT'].getValue()});
//+=" $$"+gPRoot['ww'].getValue()+":"+gPRoot['wh'].getValue()+" "+gPRoot['wl'].getValue()+":"+gPRoot['wt'].getValue()+" ";
   frAmeselSetInner ("idWindow_frAmesel",{w:gPRoot['ww'].getValue(),h:gPRoot['wh'].getValue(),l:gPRoot['wl'].getValue(),t:gPRoot['wt'].getValue()});
   showDCMBin ("idDCMhor", document.decimationXMask,document.dcm.dh);
   showDCMBin ("idDCMvert",document.decimationYMask,document.dcm.dv);
   showDCMBin ("idBINhor", document.binningXMask,document.dcm.bh);
   showDCMBin ("idBINvert",document.binningYMask,document.dcm.bv);
   if (gPRoot['msens'].getValue()!=0) showMulti ("idMultiSensor",document.multisensor.mmod,document.multisensor.mseq,document.multisensor.msel);

}
/*
     document.multisensor.msens=gPRoot['msens'].getValue();
     document.multisensor.mseq= gPRoot['mseq' ].getValue();
     document.multisensor.mmod= gPRoot['mmod' ].getValue();
     document.multisensor.msel= gPRoot['msel' ].getValue();

*/

camInterface.prototype.onGotGains=      function () {
   setSliderAndText("gainRed_slIder",  gPRoot['gr'].getValue());
   setSliderAndText("gainGreen_slIder",gPRoot['gg'].getValue());
   setSliderAndText("gainBlue_slIder", gPRoot['gb'].getValue());
};


camInterface.prototype.onGotGammaPxl=   function () {
   setSliderAndText("blackLev_slIder", gPRoot['pxl'].getValue());
   setSliderAndText("gamma_slIder",    gPRoot['gam'].getValue());
//alert("g-<"+gPRoot['gam'].getValue());
//document.title+="g-<"+gPRoot['gam'].getValue()+" ";


};

camInterface.prototype.onGotScales=     function () {
   setSliderAndText("gainRed2Green_slIder", gPRoot['rscale'].getValue());
   setSliderAndText("gainBlue2Green_slIder",gPRoot['bscale'].getValue());
///   setSliderAndText("gainGreen2Green_slIder",gPRoot['gscale'].getValue());///NOTE: does not exist yet
};

camInterface.prototype.onGotWbScales=     function () {
//alert ("onGotWbScales: "+gPRoot['wbrs'].getValue()+"/"+gPRoot['wbbs'].getValue());
   setSliderAndText("autoRed2Green_slIder", gPRoot['wbrs'].getValue());
   setSliderAndText("autoBlue2Green_slIder",gPRoot['wbbs'].getValue());
///   setSliderAndText("gainGreen2Green_slIder",gPRoot['wbgs'].getValue());///NOTE: does not exist yet
};
camInterface.prototype.onGotWbEn=     function () {
  showAWB();
//  if (gPRoot['wben'].getValue())
    updateFields();
};

camInterface.prototype.onGotBit=        function () {
   document.bit=   gPRoot['bit'].getValue();
///nothing to do here - just disable images?
};
camInterface.prototype.onGotColor=      function () {
  document.getElementById('idColorSelect').value=gPRoot['color'].getValue();
};
camInterface.prototype.onGotQuality=    function () {
   setSliderAndText("Quality_slIder", gPRoot['iq'].getValue());
};

camInterface.prototype.onGotExposure=   function () {
   setSliderAndText("exposure_slIder",gPRoot['e'].getValue());
};


camInterface.prototype.onGotSaturation= function () {
   var sat_blue= gPRoot['csb'].getValue();
   var sat_red=  gPRoot['csr'].getValue();
   if (sat_red<0)  sat_red=0;
   if (sat_blue<0) sat_blue=0;
   if (sat_red>5)  sat_red=5;
   if (sat_blue>5) sat_blue=5;
   var sat=sat_red; if (sat_blue > sat) sat= sat_blue;
   setSliderAndText("colorSat_slIder",sat);
   setSliderAndText("colorDiffSat_slIder",(sat_blue > sat_red) ? (1-(sat_red/sat_blue)): ((sat_blue/sat_red)-1));
};

camInterface.prototype.onHistWnd= function () {
    var aw=gPRoot['ACTUAL_WIDTH'].getValue();
    var ah=gPRoot['ACTUAL_HEIGHT'].getValue();
    var hw=Math.round (aw*gPRoot['hrw'].getValue());
    var hh=Math.round (ah*gPRoot['hrh'].getValue());
    frAmeselSetOuter ("idAexp_frAmesel",{w:aw,h:ah});
    frAmeselSetInner ("idAexp_frAmesel",{w:hw, h:hh,
                                         l:Math.round ((aw-hw)*gPRoot['hrl'].getValue()),
                                         t:Math.round ((ah-hh)*gPRoot['hrt'].getValue())});
}

camInterface.prototype.onAexp= function () {
   setSliderAndText("idAexpLevels_slIder",gPRoot['ael'].getValue()*256);
   setSliderAndText("idAexpPercents_slIder",gPRoot['aef'].getValue()*100);
}

camInterface.prototype.onAexpMaxExp= function () {
   document.getElementById("idAEMax").value=Math.round(1000*parseFloat(gPRoot['aemax'].getValue()));
}

camInterface.prototype.onAexpOnOff= function () {
  showAutoexp();
}

camInterface.prototype.onGotHistOutG=function (val) {
  document.AePercentsToDisplay=100*val;
  showAutoexp(); // already done/will be?

}

camInterface.prototype.onFTPOnOff=function() {
//  alert ("gPRoot['ftp'].getValue()="+gPRoot['ftp'].getValue());
  setBuTtonState("idConfWebENABLE_CB", (gPRoot['ftp'].getValue()=="on") ? 1 : 0);
}
function onConfWebENABLE() {
//alert (getBuTton('idConfWebENABLE_CB').toSource());
gPRoot['ftp'].setValue((getBuTton('idConfWebENABLE_CB').s=='1')?'on':'off');
//   var win=window.open('/autocampars.php','Ssave/Restore parameters','scrollbars=no,resizable=yes,toolbar=no,location=no,directories=no,menubar=no,status=no' );
   var win=window.open('/autocampars.php','Ssave/Restore parameters','' );
        if (win) {
          win.focus();
        }  

}

 function muxHistLevel() {
   var ret=  (gPRoot['ae'].getValue()=='on')?
             (parseFloat(getSliderValue("idAexpMonitor_slIder"))/256):
             gPRoot['ael'].getValue();
   if (!isNaN(ret)) return ret;
   forceSliderAndText("idAexpMonitor_slIder", document.AeLevelToDisplayDefault);
   return document.AeLevelToDisplayDefault;
 }


function onChangeAexpSliders(n) {
  if        (n==0) { /// idAexpLevels"
     gPRoot['ael'].setValue(parseFloat(getSliderValue("idAexpLevels_slIder"))/256);
// document.title+="["+parseFloat(getSliderValue("idAexpLevels_slIder"))+"]";
  } else if (n==1) { ///idAexpPercents
     gPRoot['aef'].setValue(parseFloat(getSliderValue("idAexpPercents_slIder"))/100);
  } else if (n==2) {
  }
  setAEParameters();
}

function onDoubleClickAexpSliders(n) {
  var aexp_on= (gPRoot['ae'].getValue()=='on');
  if        (n==0) {
     document.AeLevelToControl=document.AeLevelToControlDefault;
     forceSliderAndText("idAexpLevels_slIder", document.AeLevelToControl);
//document.title+="("+document.AeLevelToControl+")";
  } else if (n==1) {
    if (aexp_on) forceSliderAndText("idAexpPercents_slIder", document.AePercentsToControlDefault);
  } else if (n==2) forceSliderAndText("idAexpMonitor_slIder", document.AeLevelToDisplayDefault); // add at startup?
//  setAEParameters();  // send to camera
}

function toggleAexp(){ // from other toggle controls (double click on exposure slider, click on brightness icon near exposure slider)
    setBuTtonState("idAexpOn_CB", !getBuTton("idAexpOn_CB").s);
    setAexp(getBuTton("idAexpOn_CB").s!=0);
}

function setAexp(state){ // form Autoexposure checkbox
    var aexp_on= (gPRoot['ae'].getValue()=='on');
    gPRoot['ae'].setValue(state? "on":"off");
    showAutoexp();
    setAEParameters();  // send to camera
}  

function showAutoexp(){ // received from camera, it already set document.xxxx values according to received XML data
   var aexp_on= (gPRoot['ae'].getValue()=='on');
   setBuTtonState("idAexpOn_CB",         aexp_on);  // make sure there is no race between user and camera. Can it be avoided?
   enableSlider("exposure_slIder",       !aexp_on); // manual only
   enableSlider("idAexpLevels_slIder",   1); // always
   enableSlider("idAexpPercents_slIder", aexp_on); // auto only
   enableSlider("idAexpMonitor_slIder",  aexp_on); // auto only
   document.getElementById("idAexpInfoPercentsValue").innerHTML=Math.round(100*document.AePercentsToDisplay)/100;
   document.getElementById("idAexpInfoLevelsValue").innerHTML=Math.round(
           ((gPRoot['ae'].getValue()=='on')?(parseFloat(getSliderValue("idAexpMonitor_slIder"))):(256*gPRoot['ael'].getValue()))
           );
   if (!aexp_on) setSliderAndText("idAexpPercents_slIder", document.AePercentsToDisplay);

}




camInterface.prototype.initHistControls= function () {
//   alert ("missing gInterface.initHistControls()");
//  setBuTtonState("idEnableHist_CB",document.hist.enabled);
  setBuTtonState("idHistColorsR", document.hist.r);
  setBuTtonState("idHistColorsG", document.hist.g);
  setBuTtonState("idHistColorsB", document.hist.b);
  setBuTtonState("idHistColorsW", document.hist.w);
  setBuTtonState("idHistColorsG1",document.hist.g1);
  setBuTtonState("idHistColorsG2",document.hist.g2);
  if (document.hist.sqr) clickBuTton("idHistSqrt");
  else                   clickBuTton("idHistLin");

  if      (document.hist.stl==0) clickBuTton("idHistStyleDots");
  else if (document.hist.stl==1) clickBuTton("idHistStyleLine");
  else if (document.hist.stl==2) clickBuTton("idHistStyleFilled");

  if      (document.hist.stl==0) clickBuTton("idHistInterpGaps");
  else if (document.hist.stl==1) clickBuTton("idHistInterpSteps");
  else if (document.hist.stl==2) clickBuTton("idHistInterpLin");
  
  document.getElementById("idHistScale_TX").value=document.hist.scale;
  document.getElementById("idHistAver_TX").value=document.hist.aver;
  document.getElementById("idHistHeight_TX").value=document.hist.hght;

};

//function ccs_makeHistURL() {
camInterface.prototype.makeHistURL= function () {
   gRequests.histUrl=gRequests.histogram;
   gRequests.histUrl+="sensor_port="+document.sensor_port+"&";
   gRequests.histUrl+="sqrt="+(document.hist.sqr?"1":"0")+"&";
   var sc=parseFloat(document.getElementById("idHistScale_TX").value);
   if (!((sc>0.001) &&  (sc< 1000))) {
     sc=1.0
     document.getElementById("idHistScale_TX").value=sc;
     document.hist.scale=sc;
   }  
   gRequests.histUrl+="scale="+(5/sc)+"&";
   var av=parseInt(document.getElementById("idHistAver_TX").value);
   if (!((av>=0) &&  (av< 256))) {
     av=5;
     document.getElementById("idHistAver_TX").value=av;
     document.hist.aver=av;
   }  
   gRequests.histUrl+="average="+av+"&";
   var hh=parseInt(document.getElementById("idHistHeight_TX").value);
   if (!((hh>0) && (hh<=256))) {
     hh=128;
     document.getElementById("idHistHeight_TX").value=hh;
     document.hist.hght=hh;
   }
   gRequests.histUrl+="height="+hh+"&";
   if (hh != parseInt(document.getElementById("idDivHist").style.height)) {
     document.getElementById("idDivHist").style.height=hh;
     document.getElementById("imgHistogram").height=hh;
     showWindow(); // show with new histogram height
   }
   gRequests.histUrl+="fillz="+   ((document.hist.interp==1)?"1":"0")+"&";
   gRequests.histUrl+="linterpz="+((document.hist.interp==2)?"1":"0")+"&";
   gRequests.histUrl+="draw="+    (document.hist.stl ^ (document.hist.stl? 3 : 0))+"&"; //0->0, 1->2, 2->1
   var colors=(document.hist.r? 1 : 0) +
              (document.hist.g1? 2 : 0) +
              (document.hist.g2? 4 : 0) +
              (document.hist.b? 8 : 0) +
              (document.hist.w? 16 : 0) +
              (document.hist.g? 32 : 0);
   gRequests.histUrl+="colors="+colors;
//   document.title=document.ccs.hist.url;
}


// read streamer parameters
/*
//TODO: Add to ccam.php? TODO:
   with (document.streamStat) {
    var nam=         getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('S_name' )[0]);
    var multicast=   (getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('S_multicast' )[0])=="true")?1:0;
    var destport=    parseInt(getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('S_dest_port' )[0]));
    var ipstack=     (getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('S_ip_stack' )[0])=="true")?1:0;
    var circbuf=     (getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('S_circbuf' )[0])=="true")?1:0;
    var mmap=        (getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('S_mmap' )[0])=="true")?1:0;
    var fps=         parseInt(getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('S_fps' )[0]));
    var maxfps=      parseInt(getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('S_maxfps' )[0]));
    var verbose=     (getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('S_verbosy' )[0])=="true")?1:0;
    var n=           parseInt(getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('S_n' )[0]));
    var autostart=  (getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('S_autostart' )[0])=="true")?1:0;
    var destip=      getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('S_dest_ip' )[0]);
    var stream=      parseInt(getIfDefinedFCNV(XML_req.responseXML.getElementsByTagName('S_STREAM' )[0]));
    document.streamerIsRunning=stream;
    showStreamerRunning();
    document.cameraStrParametersAcquired=1;
    changeStreamPars();
   } //with (document.streamStat)
   document.cameraParametersAcquired=1;
   dbgp(4," Srw");
//alert ("ccs_rcv_rstat_rw - 1028");
}
*/

camInterface.prototype.gotHistogram=function() {
// document.requests.hist--;  debugComm(8192);
//  alert ("gotHistogram:typeof(this)="+typeof(this)+"\ntypeof(gRequests)="+typeof(gRequests));
  gRequests.inProgress= false;
//document.title+='R';
  document.getElementById("imgHistogram").src=gRequests.bgHist.src;
  requestsNextState(true); // **** back to the main loop: GOOD
}

var jp4obj;

camInterface.prototype.gotShadow=function() {

//  alert ("gotShadow: typeof(this)="+typeof(this)+"\ntypeof(gRequests)="+typeof(gRequests));
  if ((gPRoot["comp_run"].getValue() != 'run') && (gRequests.shadowImage.src.indexOf(gRequests.circbuf_fp)>=0)) {
    gRequests.ExifCircbufImgNeeded=false;
  }
  gRequests.inProgress= false;
  document.imageGot=    true;
  
  document.getElementById("idCameraImage").src=gRequests.shadowImage.src;
  
  var tmp = gRequests.imgsrv;
  tmp = tmp.split(":");
  
  var img_addr = tmp[1].replace(/\//ig,"");
  var img_port = tmp[2].replace(/\//ig,"");
  
  var circbuf_fp = gRequests.circbuf_fp;
  if (circbuf_fp){
    img_port = img_port+"/"+circbuf_fp.replace(/\//ig,"");
  }
  
  if (jp4obj!=undefined){
	  
	var tmp = jp4obj.data.getAddr();
	if (img_port!=tmp[1]){
		jp4obj.data.setAddr(img_addr,img_port);
	}
    
	var format = jp4obj.data.getFormat();
	var format_note = document.getElementById("format_note");
	
	if (format!="JPEG"){
		if (format_note==null){
			format_note = document.createElement("div");
			format_note.setAttribute("id","format_note");
			format_note.style.cssText = "position:absolute;top:5px;right:5px;color:white;font-size:16px;text-shadow:0px 0px 1px rgba(50,50,50,0.5);opacity:0.7;";
			document.getElementById("idDivCameraImage").appendChild(format_note);
			
		}
		format_note.innerHTML = format;
	}else{
		if(format_note!=null) format_note.remove();
	}
	
	//jp4obj.data.refresh();
	jp4obj.data.resize(document.getElementById("idDivCameraImage").offsetWidth);
	
  }else{
    // this requires jquery
    jp4obj = $("#idCameraImage_div").jp4({ip:img_addr,port:img_port,width:document.getElementById("idDivCameraImage").offsetWidth,fast:true,lowres:1,note:true});
  }
  
  document.getElementById("idImageLink").href= gRequests.shadowImage.src;
//  frAmeselSetImage ("idMagnifier_frAmesel",    gRequests.shadowImage.src);
/// copy to navigator   
/// restore it here if the resize frame will not "behave well" - don't agree to the mouse
//  frAmeselSetImage ("idWindow_frAmesel",gRequests.shadowImage.src);
  if ((gRequests.lastImageWidth != gPRoot['ACTUAL_WIDTH'].getValue()) ||
      (gRequests.lastImageHeight != gPRoot['ACTUAL_HEIGHT'].getValue())) {
    var ix=parseInt(document.getElementById("DIV_ALL").style.width);
    var iy=parseInt(document.getElementById("DIV_ALL").style.height);
    if (!controlsOverlap()) ix-=document.controlsWidth;
// now ix*iy what can be used for an image - no, iy may be more than wanted. But for now - stay with it.
    gRequests.lastImageWidth= gPRoot['ACTUAL_WIDTH'].getValue();
    gRequests.lastImageHeight=gPRoot['ACTUAL_HEIGHT'].getValue();
    if (ix > (iy*gRequests.lastImageWidth/gRequests.lastImageHeight))
         ix= (iy*gRequests.lastImageWidth/gRequests.lastImageHeight);
    else iy =(ix*gRequests.lastImageHeight/gRequests.lastImageWidth);
    ix=Math.round(ix);
    iy=Math.round(iy);
//document.title+=" ##"+ix+":"+iy+" ";
    document.getElementById("idDivCameraImage").style.width=ix;
    document.getElementById("idDivCameraImage").style.height=iy;
//    resizeMainWindow();
    showWindow();
    dbgp(4," Inew");
    
   } else  {
     dbgp(4," Iold");
   }
  
  $($("#idCameraImage_div").find("#working")[0]).off("canvas_ready").on("canvas_ready",function(){
	  var newsrc = ($("#idCameraImage_div").find("#display")[0]).toDataURL();
	  frAmeselSetImage ("idMagnifier_frAmesel", newsrc);
      frAmeselSetImage ("idWindow_frAmesel", newsrc);
      var format = jp4obj.data.getFormat();
      if (format=="TIFF"){
        $(gRequests.shadowImage).trigger("load");
      }
  });
  
  
  //new src
  var newsrc = ($("#idCameraImage_div").find("#display")[0]).toDataURL();
  
  //frAmeselSetImage ("idMagnifier_frAmesel",    gRequests.shadowImage.src);
  //frAmeselSetImage ("idWindow_frAmesel",gRequests.shadowImage.src);
  
  frAmeselSetImage ("idMagnifier_frAmesel", newsrc);
  frAmeselSetImage ("idWindow_frAmesel", newsrc);
  
  requestsNextState(true); // **** back to the main loop: GOOD
  
}

camInterface.prototype.statusUpdate=function() {
//document.title+=" ##1:"+gRequests.inProgress+" ";
  var t=new Date();
  if (gRequests.inProgress) {
    document.getElementById("idCommStat_Free").style.display="none";
    document.getElementById("idCommStat_Waiting").style.display="";
    document.getElementById("idCommStat_None").style.display="none";
    document.getElementById("idCommStatRequest_active").style.display="";
    if (gRequests.state == COMM_STATE_INIT) document.getElementById("idCommStat_Command").style.display="";   ///chnage to "Init"
    else                               document.getElementById("idCommStat_Command").style.display="none";
    if (gRequests.state == COMM_STATE_CMD)  document.getElementById("idCommStat_Status").style.display="";   ///command/status
    else                               document.getElementById("idCommStat_Status").style.display="none";
    if (gRequests.state == COMM_STATE_IMG)  document.getElementById("idCommStat_Image").style.display="";
    else                               document.getElementById("idCommStat_Image").style.display="none";
    if (gRequests.state == COMM_STATE_HIST) document.getElementById("idCommStat_Histogram").style.display="";
    else                               document.getElementById("idCommStat_Histogram").style.display="none";
///obsolete
/*
                                       document.getElementById("idCommStat_AECommand").style.display="none";
                                       document.getElementById("idCommStat_AEStatus").style.display="none";
                                       document.getElementById("idCommStat_StrCommand").style.display="none";
                                       document.getElementById("idCommStat_StrStatus").style.display="none";
*/
    document.getElementById("idCommStatTimePassed").innerHTML=""+(Math.round((t.getTime()-gRequests.lastRequestSent)/1000))

  } else {
    document.getElementById("idCommStat_Free").style.display="";
    document.getElementById("idCommStat_Waiting").style.display="none";
    document.getElementById("idCommStat_None").style.display="";
    document.getElementById("idCommStatRequest_active").style.display="none";
// sometimes when the program is starting, cursor remains in "wait" state for some time. try to reset it additionally
    document.body.style.cursor=document.contextHelpOn?"help":"";
  }

}
/// Removing all nonstop, nostreamer
/// Setting all parameters together - TODO: separate them
// lets risk and try them as streamer-ok 

function toggleAWB() {
  gPRoot['wben'].setValue(gPRoot['wben'].getValue()?0:1);
  showAWB();
//  alert (gPRoot['wben'].getValue());
}

function showAWB() {
  var whiteBalanceEnabed= gPRoot['wben'].getValue();
  enableSlider("gainRed2Green_slIder",!whiteBalanceEnabed);
  enableSlider("gainBlue2Green_slIder",!whiteBalanceEnabed);
  enableSlider("gainRed_slIder",!whiteBalanceEnabed);
  enableSlider("gainBlue_slIder",!whiteBalanceEnabed);
  document.divVisibility["idDivWB"]=whiteBalanceEnabed? "" : "none";
//  document.getElementById("idDivWB").style.display = document.divVisibility["idDivColors"];
  showWindow();
}

function toggleGainScale() {
  if (document.getElementById("gainRed").style.display == "none") {
    document.getElementById("gainRed").style.display = "";
    document.getElementById("gainBlue").style.display = "";
    document.getElementById("gainRed2Green").style.display = "none";
    document.getElementById("gainBlue2Green").style.display = "none";
  } else {
    document.getElementById("gainRed").style.display = "none";
    document.getElementById("gainBlue").style.display = "none";
    document.getElementById("gainRed2Green").style.display = "";
    document.getElementById("gainBlue2Green").style.display = "";
  }
}

function updateQuality() {
  gPRoot['iq'].setValue(parseInt(getSliderValue('Quality_slIder')));
} 

function updateColor() {
  gPRoot['color'].setValue(parseInt(document.getElementById('idColorSelect').value));
} 


function updateFlipX() {
  gPRoot['fliph'].setValue((getBuTton('idFlipHor_CB').s!=0)?1:0);
} 
function updateFlipY() {
  gPRoot['flipv'].setValue((getBuTton('idFlipVert_CB').s!=0)?1:0);
} 

function updateGammaBlack() {
//alert("g->"+getSliderValue('gamma_slIder'));
   gPRoot['gam'].setValue(parseFloat(getSliderValue('gamma_slIder')));
   gPRoot['pxl'].setValue(parseFloat(getSliderValue('blackLev_slIder')));
//document.title+="g->"+getSliderValue('gamma_slIder')+" ";
}
//updateBlackLev()
function updateExposure() {
   if (!(gPRoot['ae'].getValue()=='on')) {
     gPRoot['e'].setValue(parseFloat(getSliderValue("exposure_slIder")));
   }
}

function updateAnalogGains() {
  var gg=parseFloat(getSliderValue("gainGreen_slIder"));
  gPRoot['gg'].setValue(gg);
//  gPRoot['ggb'].setValue(gg);
  if (!gPRoot['wben'].getValue()) { /// No update in the auto white balance mode!
    gPRoot['gr'].setValue(parseFloat(getSliderValue("gainRed_slIder")));
    gPRoot['ggb'].setValue(parseFloat(getSliderValue("gainGreen_slIder")));
    gPRoot['gb'].setValue(parseFloat(getSliderValue("gainBlue_slIder")));
  }
}

function updateSaturation() {
   var csat=     parseFloat(getSliderValue("colorSat_slIder"));
   var dsat=     parseFloat(getSliderValue("colorDiffSat_slIder"));
   var sat_red=  csat*((dsat>0)? (1-dsat): 1);
   var sat_blue= csat*((dsat>0)? 1: (1+dsat));
   gPRoot['csb'].setValue(sat_blue);
   gPRoot['csr'].setValue(sat_red);
}

function updateScales() {
  if (!gPRoot['wben'].getValue()) { /// No update in the auto white balance mode!
    gPRoot['rscale'].setValue(parseFloat(getSliderValue("gainRed2Green_slIder")));
    gPRoot['bscale'].setValue(parseFloat(getSliderValue("gainBlue2Green_slIder")));
    gPRoot['gscale'].setValue(1.0);
  }
}

function updateWbScales() {
  gPRoot['wbrs'].setValue(parseFloat(getSliderValue("autoRed2Green_slIder")));
  gPRoot['wbbs'].setValue(parseFloat(getSliderValue("autoBlue2Green_slIder")));
  gPRoot['wbgs'].setValue(1.0);
}



function updateWOI() {
   var wnd=frAmeselGetInner ("idWindow_frAmesel");
// adjust window size (after decimation, actual) to multiple of 16x16 pixels
   if (!((document.dcm.dh>=1) && (document.dcm.dh<=16))) document.dcm.dh=1;
   if (!((document.dcm.dv>=1) && (document.dcm.dv<=16))) document.dcm.dv=1;
   wnd.w=document.dcm.dh*16*Math.round(wnd.w/document.dcm.dh/16);
   wnd.h=document.dcm.dv*16*Math.round(wnd.h/document.dcm.dv/16);
   gPRoot['ww'].setValue(wnd.w);
   gPRoot['wh'].setValue(wnd.h);
   gPRoot['wl'].setValue(wnd.l);
   gPRoot['wt'].setValue(wnd.t);
   gPRoot['dh'].setValue(document.dcm.dh);
   gPRoot['dv'].setValue(document.dcm.dv);
   gPRoot['bh'].setValue((document.dcm.bh)?document.dcm.bh:0);
   gPRoot['bv'].setValue((document.dcm.bv)?document.dcm.bv:0);
   document.dcm.dhs=document.dcm.dh;
   document.dcm.dvs=document.dcm.dv;
   document.dcm.bhs=document.dcm.bh;
   document.dcm.bvs=document.dcm.bv;
   if (document.multisensor.msens) {
//document.title="updateWOI(),document.multisensor.mseq="+document.multisensor.mseq+"  gPRoot['mseq'].getValue="+gPRoot['mseq'].getValue ();
//document.title+=" mmod="+document.multisensor.mmod+"  gPRoot['mmod'].getValue="+gPRoot['mmod'].getValue ();
//document.title+=" msel="+document.multisensor.msel+"  gPRoot['msel'].getValue="+gPRoot['msel'].getValue ();
     gPRoot['mseq'].setValue(document.multisensor.mseq);
     gPRoot['mmod'].setValue(document.multisensor.mmod);
     gPRoot['msel'].setValue(document.multisensor.msel);
   }
}



function setDefaultGain(n) { // n =0..2 (gainGR/gainR2G/gainB2G), m=-1,0,+1 (dec, set, inc)
//  if      (n==0) document.getElementById("idGainG").value = 4.0; // medium mvalue
//  else if (n==1) document.getElementById("idGainR2G").value =1.0; 
//  else if (n==2) document.getElementById("idGainB2G").value =1.0;
  if      (n==0)  {gPRoot['gg'].setValue(4.0); forceSliderAndText("gainGreen_slIder",      4.0); }
  else if (n==1)  {gPRoot['rscale'].setValue(1.0); forceSliderAndText ("gainRed2Green_slIder",  1.0);} 
  else if (n==2)  {gPRoot['bscale'].setValue(1.0);forceSliderAndText("gainBlue2Green_slIder",1.0);}
  else if (n==3)  {gPRoot['wbrs'].setValue(1.0);forceSliderAndText("autoRed2Green_slIder",1.0);}
  else if (n==4)  {gPRoot['wbbs'].setValue(1.0); forceSliderAndText("autoBlue2Green_slIder",1.0);}
  else if (n==5)  forceSliderAndText("gainRed_slIder",parseFloat(getSliderValue("gainGreen_slIder")));
  else if (n==6)  forceSliderAndText("gainBlue_slIder",parseFloat(getSliderValue("gainGreen_slIder")));
  updateAnalogGains();
}


function setSat(m) { //  Color Saturation  m=0 (set) -1 (dec sat), +1 (inc sat), -2 (dec blue, inc red), +2 (inc blue, dec red)
//  if      (m==0) document.getElementById("idTextSat").value = 2.0
//  else if (m==3) document.getElementById("idTextDiffSat").value = 0;
  if      (m==0) forceSliderAndText("colorSat_slIder", 2.0);
  else if (m==3) forceSliderAndText("colorDiffSat_slIder", 0);
//  updateSaturation();
}


function setG(m){ //  Gamma m=-1,0,+1 (dec, set, inc)
//  document.getElementById("idGamma").value=0.5;
  forceSliderAndText("gamma_slIder",0.5);
//updateGammaBlack();
}
// sets variables from text fields, tnen - again sliders and links
function updateFields() { // is it needed?
 updateQuality();
 updateColor();
 updateFlipX();
 updateFlipY();
 updateGammaBlack();
 updateExposure();
 updateAnalogGains();
 updateSaturation();
 updateScales();
 updateWbScales();
 updateWOI();
}


function setInfoFPS() {
    var k= document.sensorFPS * getSliderValue("exposure_slIder");
    if (document.fpslim && (document.sensorFPS > (0.99 * document.userFps))) {
       document.getElementById("idSpanFPS").style.color="blue";
    } else if (k>990) {
       document.getElementById("idSpanFPS").style.color="red";
    } else {
       document.getElementById("idSpanFPS").style.color="green";
    }
}

function updateFromSizeSelector(id) {
  var i;
  var ww, wh;
  var wnd=frAmeselGetInner ("idWindow_frAmesel"); 
//  document.title="$$w="+wnd.w +" h="+wnd.h+" l="+wnd.l +" t="+wnd.t;
  if (document.getElementById(id).value == "full window") {
    ww=gPRoot['SENSOR_WIDTH'].getValue();
    wh=gPRoot['SENSOR_HEIGHT'].getValue();
  } else {
    i=document.getElementById(id).value.indexOf("x");
    if (i>0){
      ww=parseInt(document.getElementById(id).value);
      wh=parseInt(document.getElementById(id).value.substr(i+1));
    }
  }
  var diff= (wnd.w!=ww) || (wnd.h!=wh);
//  document.title+=" ww="+ww+" wh="+wh;
  wnd.l+=Math.round((wnd.w-ww)/2);
  wnd.t+=Math.round((wnd.h-wh)/2);
  wnd.w=ww;
  wnd.h=wh;
  if (wnd.l<0) wnd.l=0;
  if (wnd.l>(gPRoot['SENSOR_WIDTH'].getValue()-wnd.w)) wnd.l= gPRoot['SENSOR_WIDTH'].getValue()-wnd.w;
  if (wnd.t<0) wnd.t=0;
  if (wnd.t>(gPRoot['SENSOR_HEIGHT'].getValue()-wnd.h)) wnd.t= gPRoot['SENSOR_HEIGHT'].getValue()-wnd.h;
//  document.title+="w="+wnd.w +" h="+wnd.h+" l="+wnd.l +" t="+wnd.t;
  frAmeselSetInner ("idWindow_frAmesel",wnd);    
//  alert ("ww="+ww+" wh="+wh+" diff="+diff);
  if (diff) updateWOI();///TODO: only update what is needed
}

function setAEMax() {
   gPRoot['aemax'].setValue(0.001*parseInt(document.getElementById("idAEMax").value));
}

function setAEParameters() {
 updateHistWnd();
}

function updateHistWnd() { /// send histogram window to teh camera
   var wnd=frAmeselGetInner ("idAexp_frAmesel");  
   var aw=gPRoot['ACTUAL_WIDTH'].getValue();
   var ah=gPRoot['ACTUAL_HEIGHT'].getValue();
   gPRoot['hrw'].setValue(wnd.w/aw);
   gPRoot['hrh'].setValue(wnd.h/ah);
   gPRoot['hrl'].setValue((wnd.w>=aw)?0.5:(wnd.l/(aw-wnd.w)));
   gPRoot['hrt'].setValue((wnd.h>=ah)?0.5:(wnd.t/(ah-wnd.h)));
}


