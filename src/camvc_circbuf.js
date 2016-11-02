/*
*! -----------------------------------------------------------------------------**
*! FILE NAME  : camvc_circbuf.js
*! DESCRIPTION: Retrieves and manipulates circbuf and Exif metadata
*!
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
*!  $Log: camvc_circbuf.js,v $
*!  Revision 1.6  2009/02/19 22:36:45  elphel
*!  don't show GPS lat/long/alt if 0.0
*!
*!  Revision 1.5  2008/12/11 06:39:11  elphel
*!  reduced number of unneeded requests, corrected start when the compressor is stopped
*!
*!  Revision 1.4  2008/12/10 07:25:12  elphel
*!  fixing bugs that prevented this page work with Konqueror
*!
*!  Revision 1.3  2008/12/09 23:35:38  elphel
*!  Fixed handling Exif image description
*!
*!  Revision 1.2  2008/12/05 08:10:19  elphel
*!  Fixed work (at least seems so) circbuf+Exif operation
*!
*!  Revision 1.1  2008/12/05 03:30:26  elphel
*!  Added camvc_circbuf.js to support circbuf/Exif , restoring functionality available in 7.1
*!
*!
*/


///Set circbuf/Exif related variables when comressor is started/stopped
function circbufRun(run) {
//  alert("circbufRun("+run+")");
  if (run) {
    gRequests.pointersAreCurrent=false;
    gRequests.pointersAreNeeded= false;
    gRequests.circbuf_frame_number=0;
    gRequests.ExifPage=0;
    gRequests.circbuf_fp="";
    gRequests.ExifNeeded=false;
    gRequests.ExifCircbufImgNeeded=false;
  } else {
    gRequests.pointersAreNeeded= true;
  }
}



function pressedCircbufSingle(id) {
//  document.title="pressedCircbufSingle(), id="+id;
  gRequests.pointersAreCurrent=false;
  gRequests.pointersAreNeeded= true;
  gRequests.circbuf_frame_number=0;
  gPRoot["comp_run"].setValue("single"); /// will start refresh 
///  gInterface.onCompSensRun();
//  startRefresh();
}

function pressedCircbufNav(delta) {
//document.title+="pressedCircbufNav("+delta+")";
//  document.title="pressedCircbufNav(), delta="+delta;
  if (!gRequests.pointersAreCurrent) {
    gRequests.pointersAreNeeded= true;
    gRequests.circbufNavigationPendingId=delta; /// was id???
    startRefresh(); // TODO:it is better to store the navigation command and re-issue it after pointers are updated - DONE?
  } else {
    gRequests.circbufNavigationPendingId="";
// actually do the navigation
  showCircbufFrame((gRequests.circbuf_frame_number?gRequests.circbuf_frame_number:gRequests.circbuf_count)+delta); // will take care of out of range
  }
//  showCircbufFrame(gRequests.circbuf_frame_number+delta); // will take care of out of range
//  startRefresh();
}

function pressedCircbufRun(id) {
//  document.title="pressedCircbufRun(), id="+id;
  toggleCompressorRun();
}




function updateCircbufControls() {
  if (gPRoot["comp_run"].getValue() == 'run') {
    setBuTtonState("btnCircbufPrevFirst",2);
    setBuTtonState("btnCircbufNextLast",2);
    setBuTtonState("btnCircbufRun",1);
    setBuTtonState("btnCircbufSingle",2);
  } else {
    setBuTtonState("btnCircbufPrevFirst",0);
    setBuTtonState("btnCircbufNextLast",0);
    setBuTtonState("btnCircbufRun",0);
    setBuTtonState("btnCircbufSingle",0);
  }
}


function getCircbuf(xmlNodes) {
//    alert (xmlNodes.toSource()+" xmlNodes.length="+xmlNodes.length);
    var circbuf=Array(xmlNodes.length);
    var i,frame_node,fp,ep;
    for (i=0;i<xmlNodes.length;i++) {
      circbuf[i]={fp:parseInt(xmlNodes[i].getElementsByTagName('circbuf_pointer')[0].firstChild.nodeValue),
                  ep:parseInt(xmlNodes[i].getElementsByTagName('exif_pointer')[0].firstChild.nodeValue)};
    }
    document.getElementById("idCircbufNumber_TX").value=xmlNodes.length;
    document.getElementById("idCircbufFrameNo_TX").value=xmlNodes.length; /// point to the last frame available
//document.title+="###";
//    if (gRequests.circbufNavigationPendingId!="") pressedCircbufNav(gRequests.circbufNavigationPendingId);
//    showCircbufFrame(xmlNodes.length);
  return circbuf;
}

function showCircbufFrame(frame_num) {
//document.title+="showCircbufFrame("+frame_num+":"+gRequests.pointersAreCurrent+") ";
//alert("showCircbufFrame("+frame_num+":"+gRequests.pointersAreCurrent+") ");
  if (!gRequests.pointersAreCurrent) {
    gRequests.circbuf_frame_number=0;
    return;
  }
  if      (!(frame_num<=gRequests.circbuf_count)) frame_num = gRequests.circbuf_count; // to catch NaN
  else if (frame_num < 1) frame_num = 1;
  gRequests.circbuf_frame_number=frame_num;
  document.getElementById("idCircbufFrameNo_TX").value=gRequests.circbuf_frame_number;
  gRequests.ExifPage=  gRequests.circbuf[gRequests.circbuf_frame_number-1].ep;
  gRequests.circbuf_fp=gRequests.circbuf[gRequests.circbuf_frame_number-1].fp+"/";
  gRequests.ExifNeeded=true;
  gRequests.ExifCircbufImgNeeded=true;
  startRefresh();
}

function parseExif(xml) {
    var v,f;
    var needsRedraw=false;
    if (typeof(xml.getElementsByTagName('ImageDescription' )[0])=='undefined') {
       if (document.getElementById('idImageDescription_ALL').style.display !='none') needsRedraw=true;;
       document.getElementById('idImageDescription_ALL').style.display ='none';
    } else {
       if (document.getElementById('idImageDescription_ALL').style.display =='none') needsRedraw=true;;
       document.getElementById('idImageDescription_ALL').style.display ='';
       v=         getIfDefinedFCNV(xml.getElementsByTagName('ImageDescription' )[0]);
       if (v == "")  document.getElementById("idImageDescription").innerHTML="--no description--";
       else          document.getElementById("idImageDescription").innerHTML=v;
    }

    v=         getIfDefinedFCNV(xml.getElementsByTagName('DateTimeOriginal' )[0]);
    if (v == "") {
       if (document.getElementById('idTimestamp_ALL').style.display !='none') needsRedraw=true;;
       document.getElementById("idTimestamp_ALL").style.display ="none";
    } else {
       if (document.getElementById('idTimestamp_ALL').style.display =='none') needsRedraw=true;;
       document.getElementById("idTimestamp_ALL").style.display ="";
       document.getElementById("idTimestamp").innerHTML=v;
    }

    v=         getIfDefinedFCNV(xml.getElementsByTagName('FrameNumber' )[0]);
    if (v == "") {
       if (document.getElementById('idExifFrameNumber_ALL').style.display !='none') needsRedraw=true;;
       document.getElementById("idExifFrameNumber_ALL").style.display ="none";
    } else {
       if (document.getElementById('idExifFrameNumber_ALL').style.display =='none') needsRedraw=true;;
       document.getElementById("idExifFrameNumber_ALL").style.display ="";
       f=parseInt(v) & 15;
       document.getElementById("idExifFrameNumber").innerHTML=parseInt(v)+" ("+((f<10)?" ":"")+f+")";
    }

    v=         getIfDefinedFCNV(xml.getElementsByTagName('ExposureTime' )[0]);
    if (v == "") {
       if (document.getElementById('idExifExposure_ALL').style.display !='none') needsRedraw=true;;
       document.getElementById("idExifExposure_ALL").style.display ="none";
    } else {
       if (document.getElementById('idExifExposure_ALL').style.display =='none') needsRedraw=true;;
       document.getElementById("idExifExposure_ALL").style.display ="";
       document.getElementById("idExifExposure").innerHTML=parseFloat(v);
    }

    v=          getIfDefined0FCNV(xml.getElementsByTagName('GPSLatitude' ));
    v1=         getIfDefined0FCNV(xml.getElementsByTagName('GPSLongitude' ));
    if ((v == "") || (v1 == "") || (v=="nan") || (v1=="nan") || ((v==0) && (v1==0))) {
       if (document.getElementById('idGPSLatLong_ALL').style.display !='none') needsRedraw=true;;
       document.getElementById("idGPSLatLong_ALL").style.display ="none";
       v='nan';
    } else {
       if (document.getElementById('idGPSLatLong_ALL').style.display =='none') needsRedraw=true;;
       document.getElementById("idGPSLatLong_ALL").style.display ="";
       document.getElementById("idGPSLatLong").innerHTML=
         "<a href='http://maps.google.com/maps?q="+v+","+v1+"' target='_blank'>"+v+","+v1+"</a>";
    }
    if (v !='nan') {
      v=          getIfDefined0FCNV(xml.getElementsByTagName('GPSAltitude' ));
      v1=         getIfDefined0FCNV(xml.getElementsByTagName('GPSMeasureMode' ));
    }
    if ((v == "") || (v1 == ""  || (v=="nan") || (v1=="nan"))) {
       if (document.getElementById('idGPSAltitudeMode_ALL').style.display !='none') needsRedraw=true;;
       document.getElementById("idGPSAltitudeMode_ALL").style.display ="none";
    } else {
       if (document.getElementById('idGPSAltitudeMode_ALL').style.display =='none') needsRedraw=true;;
       document.getElementById("idGPSAltitudeMode_ALL").style.display ="";
       document.getElementById("idGPSAltitude").innerHTML=v+"m";
       document.getElementById("idGPSMode").innerHTML=v1+"d";
    }
    v=         getIfDefined0FCNV(xml.getElementsByTagName('GPSDateTime' ));
//alert("{"+document.getElementById('idGPSTime_ALL').style.display+"}");
    if (v == "") {
       if (document.getElementById('idGPSTime_ALL').style.display !='none') needsRedraw=true;;
       document.getElementById("idGPSTime_ALL").style.display ="none";
    } else {
       if (document.getElementById('idGPSTime_ALL').style.display =='none') needsRedraw=true;;
       document.getElementById("idGPSTime_ALL").style.display ="";
       document.getElementById("idGPSTime").innerHTML=v;
    }
    v=         getIfDefined0FCNV(xml.getElementsByTagName('CompassDirection' ));
    if (v == "") {
       if (document.getElementById('idCompassDirection_ALL').style.display !='none') needsRedraw=true;;
       document.getElementById("idCompassDirection_ALL").style.display ="none";
    } else {
       if (document.getElementById('idCompassDirection_ALL').style.display =='none') needsRedraw=true;;
       document.getElementById("idCompassDirection_ALL").style.display ="";
       document.getElementById("idCompassDirection").innerHTML=v+"&deg; magnetic";
    }
    v=         getIfDefined0FCNV(xml.getElementsByTagName('CompassPitch' ));
    v1=          getIfDefined0FCNV(xml.getElementsByTagName('CompassRoll' ));
    if ((v == "") || (v1 == "")) {
       if (document.getElementById('idCompassPitchRoll_ALL').style.display !='none') needsRedraw=true;;
       document.getElementById("idCompassPitchRoll_ALL").style.display ="none";
    } else {
       if (document.getElementById('idCompassPitchRoll_ALL').style.display =='none') needsRedraw=true;;
       document.getElementById("idCompassPitchRoll_ALL").style.display ="";
       document.getElementById("idCompassPitch").innerHTML=v+"&deg";
       document.getElementById("idCompassRoll").innerHTML=v1+"&deg";
    }
    if (needsRedraw) showWindow();
//NOTE: goes on to have circbuf in xml - should stop!
/*
    if (!document.pointersAreCurrent) {
      if (getIfDefinedFCNV(xml.getElementsByTagName('circbuf_count' )[0]) != "" ) getCircbuf();
    }
*/
}

function ExifModifyDescription() {
  var default_string=document.getElementById("idImageDescription").innerHTML;
//    i=document.getElementById(id).value.indexOf("x");
  if (default_string.indexOf ('no description')>=0) default_string="";
  var newDescription=window.prompt("Image description",default_string);
  if (newDescription!=null) {
  gRequests.newDescription=escape(newDescription);
    startRefresh();
  }
}

