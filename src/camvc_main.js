/*
*! -----------------------------------------------------------------------------**
*! FILE NAME  : camvc_main.js
*! DESCRIPTION: main javascript functions and arrays
*! Copyright (C) 2008-2016 Elphel, Inc.
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
*!  $Log: camvc_main.js,v $
*!  Revision 1.4  2010/06/04 01:56:51  elphel
*!  Initial support for the multi-sensor operation
*!
*!  Revision 1.3  2009/10/12 19:20:24  elphel
*!  Added "Content-Disposition" support to suggest filenames to save images
*!
*!  Revision 1.2  2008/12/14 05:37:58  elphel
*!  Fixed resizing of the window when video plugin is running
*!
*!  Revision 1.1  2008/12/13 23:38:18  elphel
*!  split camvc2.html, - now only HTML code is in camvc2.html, all the javascript in in camvc_main.js, camvc_video.js and other files that were already separate
*!
*!
*/
  document.DVRSoftware="elphel_update.1.0.2.tar.gz";
  document.MAC="";
  document.EnableResise=false;
document.style_conf_inp="text-align:left; font-weight:bold;"; // class in input did not work, have to use style
document.style_conf_inpr="text-align:right;font-weight:bold;";
  document.contextHelpOn=0;
  document.t=new Date();
  document.i18nLanguage="en"; // add ?lang= (as was in beam.html) to select language at startup
  document.controlsWidth=256;
  document.upgradeWidth=512;  
  document.upgradeHeight=512;
  document.upgradeHTML="/camvc2Upgrade.html?_TIMESTAMP_";
  document.upgradeBg="#ffbbbb";
  document.playbackUpdateInterval=200;

  document.updateURL="";
  document.commonParameters="";
  document.commonOptions= (document.debugRequests)? "@vh":"vh";

  document.slidersWidth=196;
  document.slidersExtra=4;
  document.fineTune=1; // normal moving
  document.fineTuneScale=0.2;
  document.borderX=-1;
  document.borderY=-1;  
  
  document.refreshExpires=0;
  document.extraReadsAfterWrite=0; // after command write que is emptied - read this number of times before updating controls 
                                   // trying to prevent camera "fighting back" - you change parameter and camera immediately restores it if you are not fast enough
  document.extraReadsLeft=0;                                 
  
  document.imageIsCurrent=false;     // is received after the last parameters update
  document.histogramIsCurrent=false; // is received after the last parameters update
  document.ignoreResize=false; // to distinguish between manual resize and resize by program
  
  document.buttonHoldDelay = 500; //1000; // ms to consider button long-pressed
  document.doubleclickDelay=300; //ms
  
  document.translucency=50; // -1 - no overlap;
  
//TODO: make controls be above image frames if the translucency is 0  
//  document.parametersGotOnce=false;  // to prevent controls to send any data out until correct camera data is read in (responce to html=10)
  document.frameNumber=0;
  document.transparentTooltips=0;
  document.streamerIsRunning=false;
  document.receivedGeometry={w:0,h:0,dh:1,dv:1,flipX:0,flipY:0}; // changing those parameters can harm player/compressor (JPEGQ - may interfere with compressor too)
  document.aecmd_queued=""; //just a single AE set command that can be overwritten (so intemediate commands lost)
  document.flipX=0;
  document.flipY=0;

//  document.aecmd_blocked=false; // use to block updating from the camera if some command to change camera parameters are pending;
  document.highBandwidth=0;
  
// ******************** interface parameters to adjust
//tab numbers start from 0, not from 1 !!!
document.TABS_dvr=  {id:"idSettingsTabs", n:0};
document.TABS_photo={id:"idSettingsTabs", n:1};
document.TABS_video={id:"idSettingsTabs", n:2};
document.TABS_autoexp={id:"idSettingsTabs", n:3};
document.TABS_geometry={id:"idSettingsTabs", n:4};
document.TABS_histogram={id:"idSettingsTabs", n:5};
document.TABS_setOther={id:"idSettingsTabs", n:6};
document.TABS_network={id:"idNetworkTabs", n:0};
document.TABS_ftpServer={id:"idNetworkTabs", n:1};
document.TABS_webcam={id:"idNetworkTabs", n:2};
document.TABS_webAexp={id:"idNetworkTabs", n:3};




document.MagnifierMode=2;
document.MagnifierZoomDefault=4.0;
document.MagnifierZoom=document.MagnifierZoomDefault;

document.debugHelp=false;    // will show ID trace until the content help is reached
document.debugRequests=false;
document.debug=8192;
document.showAexpFrame=2; // should be 1 or 2, not 0 here (at least one position variant should be initialized)
  
document.qualityDefault=70;
document.blackLevDefault=10;
document.ignoreStreamer=true;

document.AeLevelToControlDefault=210;    // level of the output pixels (16..254?) that will be used to maintain automatically
document.AePercentsToControlDefault=90;  // percents of pixels at specified level of the output pixels that will be used to maintain automatically
document.AeLevelToDisplayDefault=250;    // level to display percents


document.AeLevelToControl=document.AeLevelToControlDefault;        // level of the output pixels (16..254?) that will be used to maintain automatically

document.AeLevelToDisplay=document.AeLevelToDisplayDefault;        // level to display percents
document.AePercentsToDisplay=0;    // will be received from the camera
document.AePercentsToDisplaySaved=document.AePercentsToDisplay; // When AE is off, this monitor channel is used to select "index" "percent" User value for "iperc" is saved sdata is saved 

//document.AeShortcut=false; // If false - then after each send/receive to Ae will go to a bigger loop (camera parameters, ...)

  
document.playbackUpdated=0;

// communication with the camera (image - related)
// global var as constants;
// assuming code is not interrupted w/o i/o events
var ccs_idle=  0;
var ccs_cmd=   1; // command sent, waiting for xml
var ccs_rstat= 2; // status request sent, waiting for xml
var ccs_aecmd= 3; // autoexposure command sent, waiting for xml
var ccs_aestat=4; // autoexposure status request sent, waiting for xml
var ccs_img=   5; // image request sent, waiting for the image
var ccs_hist=  6; // histogram request sent, waiting for the histogram

// histograms and images will be acquired if visible and timer not expired  
  
// images and histograms will only be acquired if document.want_* and the image/histogram are visible. Imade will not be acquired if comressor is running
// variables will be zeroed when the data is requested from the camera
//  document.want_image;
//  document.want_histogram;
//  document.displayOptions={C:1,S:1,M:0,D:0,N:0,T:0,H:0};
//released_btnMainMenu(m,s)
  document.displayOptions=""; //"C"; //"SMDNTH"
  document.divVisibility={idDivMenu:""}; //will grow
  document.divShowList=new Array (
  {id:"idDivMenu",         opt:"*", bg:"ffffff",         dspl:1},
  {id:"idDivCameraMenu",   opt:"", // should be opt:"C", but I will try to get rid of these buttons completely - disable for now
   bg:"ffffff",         dspl:1,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDivInfo",         opt:"CSMDNT", bg:"ffffff",         dspl:1,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDivInfoPlus",     opt:"C", bg:"ffffff",         dspl:1,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idExifInfo",        opt:"C", bg:"dddd88",         dspl:1,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idCircbuf",         opt:"C", bg:"dd88dd",         dspl:1,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
 
  {id:"idDVRInfo",         opt:"D", bg:"88dddd",         dspl:1,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  
  {id:"idDivHist",         opt:"C",      bg:"000000",         dspl:1,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDVRButtons",      opt:"D",      bg:"88dddd",         dspl:1,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDVRSlider",       opt:"D",      bg:"88dddd",         dspl:0,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDivDVR",          opt:"D",      bg:"88dddd",         dspl:0,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
//  {id:"idDivHistControl",  bg:"dddddd",         dspl:0,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idWindow",          opt:"C",      bg:"dddddd",         dspl:1,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
//  {id:"idDivGeometry",     bg:"dddddd",         dspl:0,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
//  {id:"idDivPhotoControl", bg:"dddd88",         dspl:0,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDivVideo",        opt:"S",      bg:"dd88dd",         dspl:1,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
//  {id:"idDivVideoControl", bg:"dd88dd",         dspl:0,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDivWebcamControl",opt:"N",      bg:"*idNetworkTabs", dspl:1, vis_N:document.TABS_network.n, hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDivSettings",     opt:"CSMDNT",      bg:"*idSettingsTabs",
   dspl:0,
   vis_C:-2-document.TABS_geometry.n, // will not really open
   vis_S:-2-document.TABS_video.n, // will not really open
   vis_N:-2,
   vis_D:-2-document.TABS_dvr.n,
//   vis_S:document.TABS_video.n,
   vis_M:document.TABS_photo.n,
   vis_T:document.TABS_setOther.n,
  hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDivHelp",         opt:"H",      bg:"dddddd",         dspl:0,hoverSize: 19, crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDivLicense",      opt:"H",      bg:"ffffff",         dspl:0,hoverSize: 19, crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDivExposGamma",   opt:"C", bg:"ffffff",         dspl:1,hoverSize: 19, crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
//  {id:"idDivAutoexp",      bg:"88dddd",         dspl:0,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDivColors",       opt:"C",      bg:"ffffff",         dspl:1,hoverSize: 19, crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDivWB",         opt:"C",      bg:"ffffff",         dspl:1,hoverSize: 19, crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDivGains",       opt:"C",      bg:"ffffff",         dspl:1,hoverSize: 19, crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},
  {id:"idDivColorSat",       opt:"C",      bg:"ffffff",         dspl:1,hoverSize: 19, crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"});

document.tabsShape=new Array ({b:21,t:1},{b:21,t:2},{b:20,t:2},{b:20,t:3},{b:19,t:4},{b:17,t:6},{b:15,t:8},{b:13,t:10});

document.webcamsTabs=new Array (
{url:"*Net",id:"idNetworkTabs_div1", bg:"dddd88"}, // may use images for tab headers 
{url:"*FTP",id:"idNetworkTabs_div2", bg:"dd88dd"},
{url:"*WCAM",id:"idNetworkTabs_div3", bg:"88dddd"},
{url:"*W AE",id:"idNetworkTabs_div4", bg:"ffffff"});


document.settingsTabs=new Array (
{url:"*1",id:"idSettingsTabs_div1", bg:"88dddd"}, 
{url:"*2",id:"idSettingsTabs_div2", bg:"dd88dd"},
{url:"*3",id:"idSettingsTabs_div3", bg:"dd88dd"},
{url:"*4",id:"idSettingsTabs_div4", bg:"dddd88"},
{url:"*5",id:"idSettingsTabs_div5", bg:"dddddd"},
{url:"*6",id:"idSettingsTabs_div6", bg:"88dddd"},
{url:"*7",id:"idSettingsTabs_div7", bg:"dd88dd"});




document.sensors=new Array (
 4,"ZR32112",1288,1032,139,139,0,0,
 8,"ZR32212",1288,1032,139,139,0,0,
32,"KAC1310",1280,1024,32907,32907,0,0,
36,"KAC5000",2592,1944,15,13,3,3,
48,"MI1300", 1280,1024,139,139,0,0, 
49,"MT9M001", 1280,1024,139,139,0,0, 
50,"MT9D001", 1600,1200,139,139,0,0, 
51,"MT9T001", 2048,1536,255,255,255,255, // some horizontal binning modes do not work
52,"MT9P001", 2592,1936,255,255,255,255, // some horizontal binning modes do not work
64,"IBIS51300", 1280,1024,0,0,0,0
);

document.sensors_numpars=8;
document.sensors_numsensors=document.sensors.length/document.sensors_numpars;

document.slIderFine=10; // will drag 10 times slower whith SHFT pressed

//  Sliders definitions below do not include common parameters for clarity (defaults are assigned in a function below), but you may still overwrite
//  them in the table by providing specific fiels, like in the commented out example below.

document.slIdersArray=new Array(
{id:"exposure",buttonWidth:0,buttonUrl:"",lowLimit:0.01,highLimit:10000,logarithm:1,decimals:2,
     actionOnChange:"updateExposure();", actionOnDone:"updateExposure();",actionOnButton:"toggleAexp();",actionOnDoubleclick:"toggleAexp();",
     textFieldSize:6,textFieldMaxlen:6, textFieldUnits:"",sliderLength:150},
{id:"gamma",buttonWidth:0,buttonUrl:"",lowLimit:0.1,highLimit:1,logarithm:0,decimals:2,
     actionOnChange:"updateGammaBlack();", actionOnDone:"updateGammaBlack();",actionOnButton:"setG(0);",actionOnDoubleclick:"setG(0);",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},
{id:"blackLev",buttonWidth:0,buttonUrl:"",lowLimit:0,highLimit:50,logarithm:0,decimals:0,
     actionOnChange:"updateGammaBlack();",
     actionOnDone:"updateGammaBlack();",
     actionOnButton:"", // button is removed from here
//     actionOnDoubleclick:"document.blackLev=document.blackLevDefault;updateBlackLev();setSliderAndText('blackLev_slIder', document.blackLev);",
     actionOnDoubleclick:"setSliderAndText('blackLev_slIder', document.blackLevDefault);updateGammaBlack();",
     textFieldSize:2,textFieldMaxlen:2,textFieldUnits:"",sliderLength:150},
//balanceAnalogGains()
{id:"gainGreen",buttonWidth:0,buttonUrl:"",lowLimit:1,highLimit:16,logarithm:1,decimals:2,
     actionOnChange:"updateAnalogGains();", actionOnDone:"updateAnalogGains();",actionOnButton:"setDefaultGain(0);",actionOnDoubleclick:"toggleAWB();",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},

{id:"autoRed2Green",buttonWidth:0,buttonUrl:"",lowLimit:0.75,highLimit:1.333,logarithm:1,decimals:3,
     actionOnChange:"updateWbScales();", actionOnDone:"updateWbScales();",actionOnButton:"setDefaultGain(3);",actionOnDoubleclick:"setDefaultGain(3);",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},
{id:"autoBlue2Green",buttonWidth:0,buttonUrl:"",lowLimit:0.75,highLimit:1.333,logarithm:1,decimals:3,
     actionOnChange:"updateWbScales();", actionOnDone:"updateWbScales();",actionOnButton:"setDefaultGain(4);",actionOnDoubleclick:"setDefaultGain(4);",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},
{id:"gainRed",buttonWidth:0,buttonUrl:"",lowLimit:1,highLimit:16,logarithm:1,decimals:2,
     actionOnChange:"updateAnalogGains();", actionOnDone:"updateAnalogGains();",actionOnButton:"toggleGainScale();",actionOnDoubleclick:"setDefaultGain(5);",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},
{id:"gainBlue",buttonWidth:0,buttonUrl:"",lowLimit:1,highLimit:16,logarithm:1,decimals:2,
     actionOnChange:"updateAnalogGains();", actionOnDone:"updateAnalogGains();",actionOnButton:"toggleGainScale();",actionOnDoubleclick:"setDefaultGain(6);",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},

{id:"gainRed2Green",buttonWidth:0,buttonUrl:"",lowLimit:0.25,highLimit:4,logarithm:1,decimals:3,
     actionOnChange:"updateScales();", actionOnDone:"updateScales();",actionOnButton:"toggleGainScale();",actionOnDoubleclick:"setDefaultGain(1);",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},
{id:"gainBlue2Green",buttonWidth:0,buttonUrl:"",lowLimit:0.25,highLimit:4,logarithm:1,decimals:3,
     actionOnChange:"updateScales();", actionOnDone:"updateScales();",actionOnButton:"toggleGainScale();",actionOnDoubleclick:"setDefaultGain(2);",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},
{id:"colorSat",buttonWidth:0,buttonUrl:"",lowLimit:0,highLimit:5,logarithm:0,decimals:3,
     actionOnChange:"updateSaturation();", actionOnDone:"updateSaturation();",actionOnButton:"setSat(0);",actionOnDoubleclick:"setSat(0);",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},
{id:"colorDiffSat",buttonWidth:0,buttonUrl:"",lowLimit:-1,highLimit:1,logarithm:0,decimals:3,
     actionOnChange:"updateSaturation();", actionOnDone:"updateSaturation();",actionOnButton:"setSat(3);",actionOnDoubleclick:"setSat(3);",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},
{id:"MagnifierZoom",buttonWidth:0,buttonUrl:"",lowLimit:1,highLimit:16,logarithm:1,decimals:1,
     actionOnChange:"document.MagnifierZoom=parseFloat(getSliderValue('MagnifierZoom_slIder'));changeMagnifier(true);",
     actionOnDone:  "document.MagnifierZoom=parseFloat(getSliderValue('MagnifierZoom_slIder'));changeMagnifier(true);",
     actionOnDoubleclick:"document.MagnifierZoom=document.MagnifierZoomDefault;changeMagnifier(true);setSliderAndText('MagnifierZoom_slIder', document.MagnifierZoom);",
     textFieldSize:4,textFieldMaxlen:4,textFieldUnits:"X",sliderLength:115},
{id:"Quality",buttonWidth:0,buttonUrl:"",lowLimit:4,highLimit:100,logarithm:0,decimals:0,
     actionOnChange:"updateQuality();",
     actionOnDone:  "updateQuality();",
     actionOnDoubleclick:"setSliderAndText('Quality_slIder', document.qualityDefault);updateQuality();",
     textFieldSize:3,textFieldMaxlen:3,textFieldUnits:"%",sliderLength:100},
/*
{id:"idAexpLevels",buttonWidth:0,buttonUrl:"",lowLimit:1,highLimit:255,logarithm:0,decimals:0,
     actionOnChange:"onChangeAexpSliders(0);",
     actionOnDone:  "onChangeAexpSliders(0);",
     actionOnDoubleclick:"onDoubleClickAexpSliders(0);",
     textFieldSize:3,textFieldMaxlen:3,textFieldUnits:"&nbsp;",sliderLength:150},
{id:"idAexpPercents",buttonWidth:0,buttonUrl:"",lowLimit:1,highLimit:100,logarithm:0,decimals:2,
     actionOnChange:"onChangeAexpSliders(1);",
     actionOnDone:  "onChangeAexpSliders(1);",
     actionOnDoubleclick:"onDoubleClickAexpSliders(1);",
     textFieldSize:5,textFieldMaxlen:5,textFieldUnits:"%",sliderLength:150},
{id:"idAexpMonitor",buttonWidth:0,buttonUrl:"",lowLimit:1,highLimit:255,logarithm:0,decimals:0,
     actionOnChange:"onChangeAexpSliders(2);",
     actionOnDone:  "onChangeAexpSliders(2);",
     actionOnDoubleclick:"onDoubleClickAexpSliders(2);",
     textFieldSize:3,textFieldMaxlen:3,textFieldUnits:"&nbsp;",sliderLength:150},
*/
{id:"idAexpLevels",buttonWidth:0,buttonUrl:"",lowLimit:2, ///power
                                              highLimit:255,
                                              logarithm:3, /// 0 - linear, 1 - logarithmic scale, 2 - highLimit*Math.pow(k, lowLimit), 3 - highLimit*(1-Math.pow((1-k), lowLimit))
                                              decimals:0,
     actionOnChange:"onChangeAexpSliders(0);",
     actionOnDone:  "onChangeAexpSliders(0);",
     actionOnDoubleclick:"onDoubleClickAexpSliders(0);",
     textFieldSize:3,textFieldMaxlen:3,textFieldUnits:"&nbsp;",sliderLength:150},
{id:"idAexpPercents",buttonWidth:0,buttonUrl:"",lowLimit:3, ///power
                                                highLimit:100,
                                                logarithm:3,
                                                decimals:2,
     actionOnChange:"onChangeAexpSliders(1);",
     actionOnDone:  "onChangeAexpSliders(1);",
     actionOnDoubleclick:"onDoubleClickAexpSliders(1);",
     textFieldSize:5,textFieldMaxlen:5,textFieldUnits:"%",sliderLength:150},
{id:"idAexpMonitor",buttonWidth:0,buttonUrl:"",lowLimit:2, ///power
                                               highLimit:255,
                                               logarithm:3,
                                               decimals:0,
     actionOnChange:"onChangeAexpSliders(2);",
     actionOnDone:  "onChangeAexpSliders(2);",
     actionOnDoubleclick:"onDoubleClickAexpSliders(2);",
     textFieldSize:3,textFieldMaxlen:3,textFieldUnits:"&nbsp;",sliderLength:150},
{id:"idDVRSlider",buttonWidth:0,buttonUrl:"",lowLimit:0,highLimit:1,logarithm:0,decimals:0,
     actionOnChange:"dvrPositionOnFile();", actionOnDone:"dvrPositionOnFile();",actionOnButton:"dvrButton(7);",actionOnDoubleclick:"dvrRegister();",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150}
     

     
); 

    
function  debugWindowShow(t) {
     win = window.open("about:blank","","height=480,width=640");
     doc = win.document;
     doc.write(t);
     doc.close();
}


function createAllslIders() {
  var i;
  for (i=0;i<document.slIdersArray.length;i++)
createSlider (document.slIdersArray[i].id+ "_slIder",      //should end with "_slIder"
              document.slIdersArray[i].buttonWidth,        // there will be a image button to the left of the slider
              document.slIdersArray[i].buttonUrl,          //supports switching between *.* and *_press.* (fixed some problems in original code
              document.slIdersArray[i].pointerWidth?document.slIdersArray[i].pointerWidth:13,  // width of the slider pointer
              document.slIdersArray[i].pointerUrl?document.slIdersArray[i].pointerUrl:"images/slider_ball_13x25.png?_TIMESTAMP_",     // url of the pointer image
              document.slIdersArray[i].sliderLength,       // length of a slider itself (the rest will be used for input text field
              document.slIdersArray[i].railLeftUrl?document.slIdersArray[i].railLeftUrl:"images/slider_rail_left13x25.png?_TIMESTAMP_",  // left end of rail image (should be same width as pointer_width)
              document.slIdersArray[i].railRightUrl?document.slIdersArray[i].railRightUrl:"images/slider_rail_right13x25.png?_TIMESTAMP_", // right end of rail image (should be same width as pointer_width)
              document.slIdersArray[i].railMiddleUrl?document.slIdersArray[i].railMiddleUrl:"images/slider_rail_1x25.png?_TIMESTAMP_",  // may be 1 pixel wide - will be streched as needed
              "images/empty.png?_TIMESTAMP_", //document.slIdersArray[i].dummyImageUrl,      // 1x1 pixel transparent image to fill empty div (maybe will remove it)
              document.slIdersArray[i].textFieldSize,      // standard "size" attribute of the text input
              document.slIdersArray[i].textFieldMaxlen,    // standard "maxlen" attribute of the text input
//              document.slIdersArray[i].textFieldStyle?document.slIdersArray[i].textFieldStyle:"text-align:right; font-size: 12px; color:blue",     // style to be applied to text input field
              document.slIdersArray[i].textFieldStyle?document.slIdersArray[i].textFieldStyle:"text-align:right; font-size: 12px; color:blue; ",     // style to be applied to text input field
              document.slIdersArray[i].textFieldUnits,     // to be written after the input window (i.e. "sec", "mph", etc)
              document.slIdersArray[i].textFieldUnitsStyle?document.slIdersArray[i].textFieldUnitsStyle:"",// style to be applied to the units field (above)
              document.slIdersArray[i].lowLimit,           // minimal value in the text field, corresponds to the leftmost slider position
              document.slIdersArray[i].highLimit,          // maximal value in the text field, corresponds to the rightmost slider position
              document.slIdersArray[i].logarithm,          // 0 - linear, 1 - logarithmic scale for the slider
              document.slIdersArray[i].decimals,           // number of decimals after the point in the text field
              document.slIdersArray[i].fineControl?document.slIdersArray[i].fineControl:"50",      // percents of the slider height used for fine control - positive - top, negative - bottom
// in the following actions id is defined as the outer DIV id. so "alert(id)" as the value will work
              document.slIdersArray[i].actionOnChange,     // action to be "eval()" when slider is moved. id is defined as the outer DIV id
              document.slIdersArray[i].actionOnDone,        // action when text field is changed or slider button released
              document.slIdersArray[i].actionOnButton,      // action when (right) button is pressed
              document.slIdersArray[i].actionOnDoubleclick);//action on slider double click (i.e. auto on/off)
              
  showAWB(); 

}

document.buTtonsStyles=  new Array (new Array ("border:0; color:#666666;cursor:pointer;","border:1px solid #666666; font-weight:bold; font-style:italic; color:#000000;cursor:pointer;"));
document.buTtonsStylesT= new Array (new Array ("border:0; color:#666666;cursor:pointer;","border:1px solid #666666; font-weight:bold; font-style:italic; color:#000000;cursor:pointer;"),
                                    new Array ("border:0; color:#000000;cursor:pointer;","border:1px solid #000000; font-weight:bold; font-style:italic; color:#000000;cursor:pointer;"));

document.buTtons=new Array (
{id:"btnCameraShow",       n:52, t:"D3",dm:"100",  aoh:"shieldButtons(0,75);",aar:";shieldButtons(-1,0);", aoer:"released_btnMainMenu('C',ns.s);showWindow();",  aolr:"*"},
{id:"btnStreamersShow",    n:54, t:"D3",dm:"100",  aoh:"shieldButtons(25,75);",aar:";shieldButtons(-1,0);", aoer:"released_btnMainMenu('S',ns.s);showWindow()",  aolr:"*"},
{id:"btnMonitorShow",      n:56, t:"D3",dm:"100",  aoh:"shieldButtons(50,75);",aar:";shieldButtons(-1,0);", aoer:"released_btnMainMenu('M',ns.s);showWindow();",  aolr:"*"},
{id:"btnDVRShow",          n:58, t:"D3",dm:"100",  aoh:"shieldButtons(75,75);",aar:";shieldButtons(-1,0);", aoer:"released_btnMainMenu('D',ns.s);showWindow();",  aolr:"*"},
{id:"btnNetworkShow",      n:60, t:"D3",dm:"100",  aoh:"shieldButtons(100,75);",aar:";shieldButtons(-1,0);", aoer:"released_btnMainMenu('N',ns.s);showWindow();",  aolr:"*"},
{id:"btnSettingsShow",     n:62, t:"D3",dm:"100",  aoh:"shieldButtons(125,75);",aar:";shieldButtons(-1,0);", aoer:"released_btnMainMenu('T',ns.s);showWindow();",  aolr:"*"},
{id:"btnRefresh",          n:46, t:"b", dm:"",     aoer:"pressedRefresh(document.shiftKey);"},

{id:"btnCircbufPrevFirst", n:81, t:"b",  dm:"",    aolr:"*", aop:"pressedCircbufNav(document.shiftKey?-10:-1);",  aolr:"pressedCircbufNav(-100000);"},
{id:"btnCircbufNextLast",  n:82, t:"b",  dm:"",    aolr:"*", aop:"pressedCircbufNav(document.shiftKey? 10: 1);",  aolr:"pressedCircbufNav( 100000);"},
{id:"btnCircbufRun",       n:78, t:"T2", dm:"",    aolr:"*", aop:"pressedCircbufRun(id);"},
{id:"btnCircbufSingle",    n:80, t:"b",  dm:"",    aolr:"*", aop:"pressedCircbufSingle(id);"},


/*
aop:"document.hist.r= (getBuTton(id).s!=0);updateHistControls();
           <div id="btnCircbufFirst"     class="float_icon"></div>
           <div id="btnCircbufPrev"      class="float_icon"></div>
           <input type="text" onmousedown="this.select()" id="idCircbufFrameNo_TX"  size="3" value="000" class="input_text"/>
           <div id="btnCircbufSeparator" class="float_icon">of</div>
           <div id="btnCircbufNumber"    class="float_icon">123</div>
           <div id="btnCircbufNext"      class="float_icon"></div>
           <div id="btnCircbufLast"      class="float_icon"></div>
           <div id="btnCircbufRun"       class="float_icon"></div>
           <div id="btnCircbufSingle"    class="float_icon"></div>


*/

{id:"btnHistShow",          n:2, t:"D2",dm:"10",  aoer:"released_btnHistShow(ns.s);showWindow();",  aolr:"*"},
{id:"btnBrConShow",         n:4, t:"D2",dm:"10",  aoer:"released_btnBrConShow(ns.s);showWindow();", aolr:"*"},
{id:"btnColorShow",         n:6, t:"D2",dm:"10",  aoer:"released_btnColorShow(ns.s);showWindow();", aolr:"*"},
{id:"btnPhotoShow",         n:10,t:"D4",dm:"1010",aoer:"released_btnPhotoShow(ns.s);", aolr:"*"},
{id:"btnNetworkShow1",      n:12,t:"D1",dm:"",    aoer:"released_btnNetworkShow1(ns.s);showWindow();",aolr:"*"},
//{id:"btnInfoShow",          n:16,t:"D2",dm:"10",  aoh: "shieldButtons(150,50);", aar:";shieldButtons(-1,0);" ,aoer:"released_btnInfoShow(ns.s);showWindow();",  aolr:"*"},
{id:"btnSnapFull",          n:64,t:"D2",dm:"10",  aoh: "shieldButtons(150,50);", aar:";shieldButtons(-1,0);" ,aoer:"released_btnSnapFull(ns.s);",  aolr:"*"},
{id:"btnSettingsShow1",      n:18,t:"D1",dm:"",    aoer:"released_btnSettingsShow1(ns.s);showWindow();", aolr:"*"},
{id:"btnPositioningShow",   n:8, t:"D2",dm:"10",  aoer:"released_btnPositioningShow(ns.s);showWindow();",aolr:"*"},
//{id:"btnLanguage",          n:28,t:"D6",dm:"111111",aoh:"shieldButtons(200,150);",aar:";shieldButtons(-1,0);", aoer:"released_btnLanguage(ns.s);showWindow();",  aolr:"*"},
{id:"btnLanguage",          n:28,t:"D4",dm:"1111",aoh:"shieldButtons(200,100);",aar:";shieldButtons(-1,0);", aoer:"released_btnLanguage(ns.s);showWindow();",  aolr:"*"},
{id:"btnHelpShow",          n:14,t:"D3",dm:"100", aoer:"released_btnHelpShow(ns.s);showWindow();",  aolr:"*"},

{id:"btnTranslNo",          n:35, t:"R",dm:"btnTransl0",   aop:"document.translucency=-1;showWindow();"},
{id:"btnTransl0",           n:36, t:"R",dm:"btnTransl25",  aop:"document.translucency=0;showWindow();"},
{id:"btnTransl25",          n:37, t:"R",dm:"btnTransl50",  aop:"document.translucency=25;showWindow();"},
{id:"btnTransl50",          n:38, t:"R",dm:"btnTransl75",  aop:"document.translucency=50;showWindow();"},
{id:"btnTransl75",          n:39, t:"R",dm:"btnTransl100", aop:"document.translucency=75;showWindow();"},
{id:"btnTransl100",         n:40, t:"R",dm:"btnTranslNo",  aop:"document.translucency=100;showWindow();"},

{id:"btnDisplayNone",       n:66, t:"R",dm:"btnDisplayStill", aop:"changeStillVideo(0);"},
{id:"btnDisplayStill",      n:50, t:"R",dm:"btnDisplayVideo", aop:"changeStillVideo(1);"},
{id:"btnDisplayVideo",      n:51, t:"R",dm:"btnDisplayNone",  aop:"changeStillVideo(2);"},

{id:"btnMagnifierNo",       n:41, t:"R",dm:"btnMagnifierFrameless",  aop:"document.MagnifierMode=0;changeMagnifier(false);showWindow();"},
{id:"btnMagnifierFrameless",n:42, t:"R",dm:"btnMagnifierFramed",     aop:"document.MagnifierMode=1;changeMagnifier(false);showWindow();"},
{id:"btnMagnifierFramed",   n:43, t:"R",dm:"btnMagnifierNo",         aop:"document.MagnifierMode=2;changeMagnifier(false);showWindow();"},

// CSS radio buttons (no images)
{id:"idMultiSensor11",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensor12",   aop:"multiChanged ('seq1',1,simulated);"},
{id:"idMultiSensor12",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensor13",   aop:"multiChanged ('seq1',2,simulated);"},
{id:"idMultiSensor13",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensor11",   aop:"multiChanged ('seq1',3,simulated);"},

{id:"idMultiSensor20",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensor21",   aop:"multiChanged ('seq2',0,simulated);"},
{id:"idMultiSensor21",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensor22",   aop:"multiChanged ('seq2',1,simulated);"},
{id:"idMultiSensor22",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensor23",   aop:"multiChanged ('seq2',2,simulated);"},
{id:"idMultiSensor23",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensor20",   aop:"multiChanged ('seq2',3,simulated);"},

{id:"idMultiSensor30",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensor31",   aop:"multiChanged ('seq3',0,simulated);"},
{id:"idMultiSensor31",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensor32",   aop:"multiChanged ('seq3',1,simulated);"},
{id:"idMultiSensor32",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensor33",   aop:"multiChanged ('seq3',2,simulated);"},
{id:"idMultiSensor33",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensor30",   aop:"multiChanged ('seq3',3,simulated);"},

{id:"idMultiSensorModeM",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensorMode1",   aop:"multiChanged ('mode',0,simulated);"},
{id:"idMultiSensorMode1",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensorMode2",   aop:"multiChanged ('mode',1,simulated);"},
{id:"idMultiSensorMode2",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensorMode3",   aop:"multiChanged ('mode',2,simulated);"},
{id:"idMultiSensorMode3",   url:document.buTtonsStyles, n:0, t:"R",dm:"idMultiSensorModeM",   aop:"multiChanged ('mode',3,simulated);"},

{id:"idDCMhor1",   url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMhor2",   aop:"dcmChanged ('dh',1,simulated);"},
{id:"idDCMhor2",   url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMhor3",   aop:"dcmChanged ('dh',2,simulated);"},
{id:"idDCMhor3",   url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMhor4",   aop:"dcmChanged ('dh',3,simulated);"},
{id:"idDCMhor4",   url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMhor5",   aop:"dcmChanged ('dh',4,simulated);"},
{id:"idDCMhor5",   url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMhor6",   aop:"dcmChanged ('dh',5,simulated);"},
{id:"idDCMhor6",   url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMhor7",   aop:"dcmChanged ('dh',6,simulated);"},
{id:"idDCMhor7",   url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMhor8",   aop:"dcmChanged ('dh',7,simulated);"},
{id:"idDCMhor8",   url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMhor1",   aop:"dcmChanged ('dh',8,simulated);"},
{id:"idDCMvert1",  url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMvert2",   aop:"dcmChanged ('dv',1,simulated);"},
{id:"idDCMvert2",  url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMvert3",   aop:"dcmChanged ('dv',2,simulated);"},
{id:"idDCMvert3",  url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMvert4",   aop:"dcmChanged ('dv',3,simulated);"},
{id:"idDCMvert4",  url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMvert5",   aop:"dcmChanged ('dv',4,simulated);"},
{id:"idDCMvert5",  url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMvert6",   aop:"dcmChanged ('dv',5,simulated);"},
{id:"idDCMvert6",  url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMvert7",   aop:"dcmChanged ('dv',6,simulated);"},
{id:"idDCMvert7",  url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMvert8",   aop:"dcmChanged ('dv',7,simulated);"},
{id:"idDCMvert8",  url:document.buTtonsStyles, n:0, t:"R",dm:"idDCMvert1",   aop:"dcmChanged ('dv',8,simulated);"},
{id:"idBINhor1",   url:document.buTtonsStyles, n:0, t:"R",dm:"idBINhor2",   aop:"dcmChanged ('bh',1,simulated);"},
{id:"idBINhor2",   url:document.buTtonsStyles, n:0, t:"R",dm:"idBINhor3",   aop:"dcmChanged ('bh',2,simulated);"},
{id:"idBINhor3",   url:document.buTtonsStyles, n:0, t:"R",dm:"idBINhor4",   aop:"dcmChanged ('bh',3,simulated);"},
{id:"idBINhor4",   url:document.buTtonsStyles, n:0, t:"R",dm:"idBINhor5",   aop:"dcmChanged ('bh',4,simulated);"},
{id:"idBINhor5",   url:document.buTtonsStyles, n:0, t:"R",dm:"idBINhor6",   aop:"dcmChanged ('bh',5,simulated);"},
{id:"idBINhor6",   url:document.buTtonsStyles, n:0, t:"R",dm:"idBINhor7",   aop:"dcmChanged ('bh',6,simulated);"},
{id:"idBINhor7",   url:document.buTtonsStyles, n:0, t:"R",dm:"idBINhor8",   aop:"dcmChanged ('bh',7,simulated);"},
{id:"idBINhor8",   url:document.buTtonsStyles, n:0, t:"R",dm:"idBINhor1",   aop:"dcmChanged ('bh',8,simulated);"},
{id:"idBINvert1",  url:document.buTtonsStyles, n:0, t:"R",dm:"idBINvert2",   aop:"dcmChanged ('bv',1,simulated);"},
{id:"idBINvert2",  url:document.buTtonsStyles, n:0, t:"R",dm:"idBINvert3",   aop:"dcmChanged ('bv',2,simulated);"},
{id:"idBINvert3",  url:document.buTtonsStyles, n:0, t:"R",dm:"idBINvert4",   aop:"dcmChanged ('bv',3,simulated);"},
{id:"idBINvert4",  url:document.buTtonsStyles, n:0, t:"R",dm:"idBINvert5",   aop:"dcmChanged ('bv',4,simulated);"},
{id:"idBINvert5",  url:document.buTtonsStyles, n:0, t:"R",dm:"idBINvert6",   aop:"dcmChanged ('bv',5,simulated);"},
{id:"idBINvert6",  url:document.buTtonsStyles, n:0, t:"R",dm:"idBINvert7",   aop:"dcmChanged ('bv',6,simulated);"},
{id:"idBINvert7",  url:document.buTtonsStyles, n:0, t:"R",dm:"idBINvert8",   aop:"dcmChanged ('bv',7,simulated);"},
{id:"idBINvert8",  url:document.buTtonsStyles, n:0, t:"R",dm:"idBINvert1",   aop:"dcmChanged ('bv',8,simulated);"},

{id:"idHistLin",   url:document.buTtonsStyles, n:0, t:"R",dm:"idHistSqrt",   aop:"document.hist.sqr=0;updateHistControls();"},
{id:"idHistSqrt",  url:document.buTtonsStyles, n:0, t:"R",dm:"idHistLin",    aop:"document.hist.sqr=1;updateHistControls();"},

{id:"idHistStyleDots",   url:document.buTtonsStyles, n:0, t:"R",dm:"idHistStyleLine",   aop:"document.hist.stl=0;updateHistControls();"},
{id:"idHistStyleLine",   url:document.buTtonsStyles, n:0, t:"R",dm:"idHistStyleFilled", aop:"document.hist.stl=1;updateHistControls();"},
{id:"idHistStyleFilled", url:document.buTtonsStyles, n:0, t:"R",dm:"idHistStyleDots",   aop:"document.hist.stl=2;updateHistControls();"},

{id:"idHistInterpGaps",  url:document.buTtonsStyles, n:0, t:"R",dm:"idHistInterpSteps", aop:"document.hist.interp=0;updateHistControls();"},
{id:"idHistInterpSteps", url:document.buTtonsStyles, n:0, t:"R",dm:"idHistInterpLin",   aop:"document.hist.interp=1;updateHistControls();"},
{id:"idHistInterpLin",   url:document.buTtonsStyles, n:0, t:"R",dm:"idHistInterpGaps",  aop:"document.hist.interp=2;updateHistControls();"},
//css toggles
{id:"idHistColorsR",   url:document.buTtonsStylesT, n:0, t:"T2",dm:"",  aop:"document.hist.r= (getBuTton(id).s!=0);updateHistControls();"},
{id:"idHistColorsG",   url:document.buTtonsStylesT, n:0, t:"T2",dm:"",  aop:"document.hist.g= (getBuTton(id).s!=0);updateHistControls();"},
{id:"idHistColorsB",   url:document.buTtonsStylesT, n:0, t:"T2",dm:"",  aop:"document.hist.b= (getBuTton(id).s!=0);updateHistControls();"},
{id:"idHistColorsW",   url:document.buTtonsStylesT, n:0, t:"T2",dm:"",  aop:"document.hist.w= (getBuTton(id).s!=0);updateHistControls();"},
{id:"idHistColorsG1",  url:document.buTtonsStylesT, n:0, t:"T2",dm:"",  aop:"document.hist.g1=(getBuTton(id).s!=0);updateHistControls();"},
{id:"idHistColorsG2",  url:document.buTtonsStylesT, n:0, t:"T2",dm:"",  aop:"document.hist.g2=(getBuTton(id).s!=0);updateHistControls();"},

//updateHistControls()
// checkboxes
{id:"idSetDebugHelp_CB",             n:30, t:"T2",dm:"",  aop:"document.debugHelp=(getBuTton(id).s!=0);"},
{id:"idSetDebugRequests_CB",         n:30, t:"T2",dm:"",  aop:"document.debugRequests=(getBuTton(id).s!=0);"},
{id:"idEnableImageRefresh_CB",       n:30, t:"T2",dm:"",  aop:"enableImageRefreshClicked();"},
{id:"idShowAexpFrameMain_CB",        n:30, t:"T2",dm:"",  aop:"AexpFrameShowClicked(id);changeAexp();showWindow();"},
{id:"idShowAexpFrameNavigator_CB",   n:30, t:"T2",dm:"",  aop:"AexpFrameShowClicked(id);changeAexp();showWindow();"},
{id:"idFlipHor_CB",                  n:30, t:"T2",dm:"",  aop:"updateFlipX();"},
{id:"idFlipVert_CB",                 n:30, t:"T2",dm:"",  aop:"updateFlipY();"},
//{id:"idColor_CB",                    n:30, t:"T2",dm:"",  aop:"updateColor();"},
//{id:"idIgnoreStreamer_CB",           n:30, t:"T2",dm:"",  aop:"ignoreStreamerClicked();"},
{id:"idAexpOn_CB",                   n:30, t:"T2",dm:"",  aop:"setAexp(getBuTton(id).s!=0);"},
//{id:"idEnableHist_CB",               n:30, t:"T2",dm:"",  aop:"document.hist.enable=(getBuTton(id).s!=0);updateHistControls();"},
{id:"idEnableHist_CB",               n:30, t:"T2",dm:"",  aop:"updateHistControls();"},
{id:"idVideoLimitFPS_CB",            n:30, t:"T2",dm:"",  aop:"updateFPSLimit();"},
{id:"idVideoMaintainFPS_CB",         n:30, t:"T2",dm:"",  aop:"updateFPSLimit();"},

{id:"idVideoRun_CB",                 n:30, t:"T2",dm:"",  aop:"clickedVideoRun();"},
{id:"idDVRLoop_CB",                  n:30, t:"T2",dm:"",  aop:""},
{id:"idDVRNextPlay_CB",              n:30, t:"T2",dm:"",  aop:""},

{id:"idTranspTooltips_CB",           n:30, t:"T2",dm:"",  aop:""},

//plain buttons         
{id:"idSoftReset_BN",       n:27, t:"b",dm:"",   aoer:"cameraSoftReset();",aolr:"*"},
{id:"idSensorReset_BN",     n:27, t:"b",dm:"",   aoer:"cameraReset();",aolr:"*"},
{id:"idDumpTitle_BN",       n:27, t:"b",dm:"",   aop:"debugWindowShow(document.title);document.title='';"},
{id:"idUpgrade_BN",         n:27, t:"b",dm:"",   aop:"toggleUpgradeIframe();"},
//{id:"idDVRSearch_BN",       n:76, t:"b",dm:"",   aop:"searchDVR();"},
{id:"idDVRSearch_BN",       n:76, t:"b",dm:"",   aop:"dvrButton(10);"},

{id:"btnDVRBack",           n:68, t:"b",dm:"",   aoer:"dvrButton(1);",aolr:"*"},
{id:"btnDVRPlay",           n:69, t:"b",dm:"",   aoer:"dvrButton(2);",aolr:"*"},
{id:"btnDVRPause",          n:70, t:"b",dm:"",   aoer:"dvrButton(3);",aolr:"*"},
{id:"btnDVRStop",           n:71, t:"b",dm:"",   aoer:"dvrButton(4);",aolr:"*"},
{id:"btnDVRForward",        n:72, t:"b",dm:"",   aoer:"dvrButton(5);",aolr:"*"},
{id:"btnDVRRecord",         n:73, t:"T2",dm:"",   aoer:"dvrButton(getBuTton(id).s?6:9);",aolr:"*"},
//{id:"btnDVRList",           n:77, t:"b",dm:"",   aoer:"dvrButton(7);",aolr:"*"},
{id:"btnDVRList",           n:76, t:"b",dm:"",   aoer:"dvrButton(7);",aolr:"*"}, // same as search

{id:"btnDVRSettings",       n:75, t:"b",dm:"",   aoer:"dvrButton(8);",aolr:"*"},

{id:"btnDVRBack_P",         n:68, t:"b",dm:"",   aoer:"dvrButton(1);",aolr:"*"},
{id:"btnDVRPlay_P",         n:69, t:"b",dm:"",   aoer:"dvrButton(2);",aolr:"*"},
{id:"btnDVRPause_P",        n:70, t:"b",dm:"",   aoer:"dvrButton(3);",aolr:"*"},
{id:"btnDVRStop_P",         n:71, t:"b",dm:"",   aoer:"dvrButton(4);",aolr:"*"},
{id:"btnDVRForward_P",      n:72, t:"b",dm:"",   aoer:"dvrButton(5);",aolr:"*"},
{id:"btnDVRRecord_L",       n:73, t:"T2",dm:"",  aoer:"dvrButton(getBuTton(id).s?6:9);",aolr:"*"},
{id:"btnDVRStopRecord",     n:71, t:"b",dm:"",   aoer:"dvrButton(9);",aolr:"*"},


{id:"idDVRRegister_BN",     n:27, t:"b",dm:"",   aoer:"dvrRegisterOnly();"},
//


{id:"idTest1_BN",           n:27, t:"b",dm:"",   aop:"test1();"},

//slider buttons
{id:"exposure_button",      n:20, t:"b",dm:"",   aoer:"toggleAexp();",aolr:"*"},
{id:"gamma_button",         n:26, t:"b",dm:"",   aoer:"setG(0);",     aolr:"*"},
{id:"blackLev_button",      n:49, t:"b",dm:"",   aoer:"setSliderAndText('blackLev_slIder', document.blackLevDefault);updateGammaBlack();",     aolr:"*"},
{id:"gainGreen_button",     n:21, t:"b",dm:"",   aoer:"toggleAWB();",aolr:"*"},

{id:"autoRed2Green_button", n:87, t:"b",dm:"",   aoer:"setDefaultGain(3);",aolr:"*"},
{id:"autoBlue2Green_button",n:86, t:"b",dm:"",   aoer:"setDefaultGain(4);",aolr:"*"},
{id:"gainRed_button",       n:85, t:"b",dm:"",   aoer:"toggleGainScale();",aolr:"*"},
{id:"gainBlue_button",      n:84, t:"b",dm:"",   aoer:"toggleGainScale();",aolr:"*"},

/*
{id:"autoRed2Green_button", n:87, t:"b",dm:"",   aoer:"document.awbFlag=2;showAWB();startRefresh();",aolr:"*"},
{id:"autoBlue2Green_button",n:86, t:"b",dm:"",   aoer:"document.awbFlag=2;showAWB();startRefresh();",aolr:"*"},

{id:"autoRed2Green_button", n:87, t:"b",dm:"",   aoer:"document.awbFlag=2;showAWB();startRefresh();",aolr:"*"},
{id:"autoBlue2Green_button",n:86, t:"b",dm:"",   aoer:"document.awbFlag=2;showAWB();startRefresh();",aolr:"*"},
{id:"gainRed_button",       n:85, t:"b",dm:"",   aoer:"setDefaultGain(0);",aolr:"*"},
{id:"gainBlue_button",      n:84, t:"b",dm:"",   aoer:"setDefaultGain(0);",aolr:"*"},

{id:"autoRed2Green",buttonWidth:0,buttonUrl:"",lowLimit:0.25,highLimit:4,logarithm:1,decimals:3,
     actionOnChange:"updateScales();", actionOnDone:"updateScales();",actionOnButton:"setDefaultGain(1);",actionOnDoubleclick:"toggleAWB();",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},
{id:"autoBlue2Green",buttonWidth:0,buttonUrl:"",lowLimit:0.25,highLimit:4,logarithm:1,decimals:3,
     actionOnChange:"updateScales();", actionOnDone:"updateScales();",actionOnButton:"setDefaultGain(2);",actionOnDoubleclick:"toggleAWB();",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},
{id:"gainRed",buttonWidth:0,buttonUrl:"",lowLimit:1,highLimit:16,logarithm:1,decimals:2,
     actionOnChange:"updateAnalogGains();", actionOnDone:"updateAnalogGains();",actionOnButton:"setDefaultGain(0);",actionOnDoubleclick:"balanceAnalogGains();",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},
{id:"gainBlue",buttonWidth:0,buttonUrl:"",lowLimit:1,highLimit:16,logarithm:1,decimals:2,
     actionOnChange:"updateAnalogGains();", actionOnDone:"updateAnalogGains();",actionOnButton:"setDefaultGain(0);",actionOnDoubleclick:"balanceAnalogGains();",
     textFieldSize:6,textFieldMaxlen:6,textFieldUnits:"",sliderLength:150},

*/


{id:"gainRed2Green_button", n:23, t:"b",dm:"",   aoer:"toggleGainScale();",aolr:"*"}, //once color balance
{id:"gainBlue2Green_button",n:22, t:"b",dm:"",   aoer:"toggleGainScale();",aolr:"*"},
{id:"colorSat_button",      n:24, t:"b",dm:"",   aoer:"setSat(0);",   aolr:"*"},
{id:"colorDiffSat_button",  n:25, t:"b",dm:"",   aoer:"setSat(3);",   aolr:"*"},
// just images
{id:"idWindow_frAmeselT_Width_BTN",  n:33, dm:0},
{id:"idWindow_frAmeselT_Height_BTN", n:33, dm:1},
{id:"idWindow_frAmeselT_Left_BTN",   n:33, dm:2},
{id:"idWindow_frAmeselT_Top_BTN",    n:33, dm:3},
{id:"idAexp_frAmeselT_Width_BTN",    n:33, dm:0},
{id:"idAexp_frAmeselT_Height_BTN",   n:33, dm:1},
{id:"idAexp_frAmeselT_Left_BTN",     n:33, dm:2},
{id:"idAexp_frAmeselT_Top_BTN",      n:33, dm:3},
{id:"idFlipHor_LBTN",                n:34, dm:0},
{id:"idFlipVert_LBTN",               n:34, dm:1},
{id:"idColor_LBTN",                  n:33, dm:4},
{id:"idAexpLevels_LBTN",             n:34, dm:2},
{id:"idAexpPercents_LBTN",           n:34, dm:3},
{id:"idAexpMonitor_LBTN",            n:34, dm:4}


);

function updateInit() {
//alert("updateInit!");
}
  
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
  selfUrl:"/editconf.php?",
  url:"",
  onDone: updateInit,
  buttonID:"",//  button pressed (will be released when done)
  wasCursor:""
};


document.configs_NetworkFile="/etc/conf.d/net.eth0";
document.configs_Mac="/etc/conf.d/mac";
document.configs_WebcamFile= "/etc/conf.d/ccamftp.conf";
document.configs_FtpFile= "/etc/conf.d/ccamftp.conf";
document.configs_VideoFile= "/var/state/streamer.conf";
document.streamersList=new Array ("multicast","unicast");

document.configsData=new Array (
{file:         "internal",             // configuration file path
 key:          "DAEMON_EN_CCAMFTP",    // key  
 eq:           1,                      // use "=" between key and value (writing only)
 quote:        "",
 id:           "idConfWebENABLE",  // id of the control (id+"_LB" will be created for the text label (for i18n) Can be replaced with custom foramtting string
 divId:        document.TABS_ftpServer.id+"_div"+(document.TABS_ftpServer.n+1),           // element (div) where to install the control (after the static buttons - use - "before"?)
 frmt:         2,                      // 0 - custom, 1 - text, 2 - checkbox, 3 - ipv4
// custom:       "",                   // custom format
 txWidth:      30,                     // width of text field (if zero - not specified). also checkbox button number
 onUpdate:     null,                   // function to call when this record is read from the camera (if any) tid - input text field id
// onUserChange: null,                   // function to call when data in this line is updated by user (id equals id of the input text field
 onUserChange: "onConfWebENABLE();",   // function to call when data in this line is updated by user (id equals id of the input text field
 onWriteConfig:null,                   //action when the config data is written to the camera
 enUpd:        1,                      // enable update of this record to/from the config file
 val:          "",                     // value of this record
 rwState:      0,                     // read./write state of this record
 stl:          document.style_conf_inp }, //css class for the input
{file:document.configs_FtpFile, key: "INAME",  eq:1, quote:"",id:"idConfFtpINAME", divId:document.TABS_ftpServer.id+"_div"+(document.TABS_ftpServer.n+1),  frmt:1, txWidth:20, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inp},
{file:document.configs_FtpFile, key: "REMOTE_DIR",  eq:1, quote:"",id:"idConfFtpREMOTE_DIR", divId:document.TABS_ftpServer.id+"_div"+(document.TABS_ftpServer.n+1),  frmt:1, txWidth:22, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inp},
{file:document.configs_FtpFile, key: "REMOTE_CONF_DIR",  eq:1, quote:"",id:"idConfFtpREMOTE_CONF_DIR", divId:document.TABS_ftpServer.id+"_div"+(document.TABS_ftpServer.n+1),  frmt:1, txWidth:22, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inp},
{file:document.configs_FtpFile, key: "REMOTE_SCRIPT_PATH",  eq:1, quote:"",id:"idConfFtpSCRIPT_PATH", divId:document.TABS_ftpServer.id+"_div"+(document.TABS_ftpServer.n+1),  frmt:1, txWidth:22, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inp},
{file:document.configs_FtpFile, key: "SERVER",  eq:1, quote:"",id:"idConfFtpSERVER", divId:document.TABS_ftpServer.id+"_div"+(document.TABS_ftpServer.n+1),  frmt:3, txWidth:20, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inp},
{file:document.configs_FtpFile, key: "USER",  eq:1, quote:"",id:"idConfFtpUSER", divId:document.TABS_ftpServer.id+"_div"+(document.TABS_ftpServer.n+1),  frmt:1, txWidth:10, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inp},
{file:document.configs_FtpFile, key: "PASSWORD",  eq:1, quote:"",id:"idConfFtpPASSWORD", divId:document.TABS_ftpServer.id+"_div"+(document.TABS_ftpServer.n+1),  frmt:1, txWidth:10, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,password:1,stl:document.style_conf_inp},
{file:"internal", key: "FTP_PERIOD",   eq:1, quote:"",id:"idConfFtpPERIOD", divId:document.TABS_ftpServer.id+"_div"+(document.TABS_ftpServer.n+1),  frmt:1, txWidth:10, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inp},
{file:"internal",         key: "ftp_left_time", eq:1, quote:"",id:"idFTPLeftTime", divId:document.TABS_ftpServer.id+"_div"+(document.TABS_ftpServer.n+1),  frmt:1, disabled:1, txWidth:5, onUpdate:null,  onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:"internal", key: "FTP_TIMEOUT",  eq:1, quote:"",id:"idConfFtpTIMEOUT", divId:document.TABS_ftpServer.id+"_div"+(document.TABS_ftpServer.n+1),  frmt:1, txWidth:10, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inp},
{file:"internal", key: "FTP_UPDATE",   eq:1, quote:"",id:"idConfFtpUPDATE", divId:document.TABS_ftpServer.id+"_div"+(document.TABS_ftpServer.n+1),  frmt:1, txWidth:10, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inp},
{file:document.configs_FtpFile, key: "ENABLE",   eq:1, quote:"",id:"idConfFtpENABLE", divId:document.TABS_ftpServer.id+"_div"+(document.TABS_ftpServer.n+1),  frmt:2, txWidth:30, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inp},

/*
{file:document.configs_WebcamFile, key: "QUALITY",  eq:1, quote:"",id:"idConfWebQUALITY", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:4, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "OPT", eq:1, quote:"", id:"idConfWebOPT", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1), frmt:1, txWidth:5, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inp}, 
{file:document.configs_WebcamFile, key: "DH",  eq:1, quote:"",id:"idConfWebDH", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:2, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "DV",  eq:1, quote:"",id:"idConfWebDV", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:2, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "BH",  eq:1, quote:"",id:"idConfWebBH", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:2, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "BV",  eq:1, quote:"",id:"idConfWebBV", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:2, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "SENS",  eq:1, quote:"",id:"idConfWebSENS", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:4, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "RSCALE",  eq:1, quote:"",id:"idConfWebRSCALE", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:4, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "BSCALE",  eq:1, quote:"",id:"idConfWebBSCALE", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:4, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "WBTH",  eq:1, quote:"",id:"idConfWebWBTH", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:3, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "WBPC",  eq:1, quote:"",id:"idConfWebWBPC", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:3, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "CSR",  eq:1, quote:"",id:"idConfWebCSR", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:3, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "CSB",  eq:1, quote:"",id:"idConfWebCSB", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:3, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "GAM",  eq:1, quote:"",id:"idConfWebGAM", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:3, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "PXL",  eq:1, quote:"",id:"idConfWebPXL", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:3, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "E",  eq:1, quote:"",id:"idConfWebE", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:6, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "WW",  eq:1, quote:"",id:"idConfWebWW", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:4, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "WH",  eq:1, quote:"",id:"idConfWebWH", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:4, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "WL",  eq:1, quote:"",id:"idConfWebWL", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:4, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "WT",  eq:1, quote:"",id:"idConfWebWT", divId:document.TABS_webcam.id+"_div"+(document.TABS_webcam.n+1),  frmt:1, txWidth:4, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
*/
/*
{file:document.configs_WebcamFile, key: "AEXPEN",  eq:1, quote:"",id:"idConfWebAEXPEN", divId:document.TABS_webAexp.id+"_div"+(document.TABS_webAexp.n+1),  frmt:2, txWidth:30, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inp},
{file:document.configs_WebcamFile, key: "AEXPW",  eq:1, quote:"",id:"idConfWebAEXPW", divId:document.TABS_webAexp.id+"_div"+(document.TABS_webAexp.n+1),  frmt:1, txWidth:3, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "AEXPH",  eq:1, quote:"",id:"idConfWebAEXPH", divId:document.TABS_webAexp.id+"_div"+(document.TABS_webAexp.n+1),  frmt:1, txWidth:3, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "AEXPX",  eq:1, quote:"",id:"idConfWebAEXPX", divId:document.TABS_webAexp.id+"_div"+(document.TABS_webAexp.n+1),  frmt:1, txWidth:3, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "AEXPY",  eq:1, quote:"",id:"idConfWebAEXPY", divId:document.TABS_webAexp.id+"_div"+(document.TABS_webAexp.n+1),  frmt:1, txWidth:3, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "AEXPME",  eq:1, quote:"",id:"idConfWebAEXPME", divId:document.TABS_webAexp.id+"_div"+(document.TABS_webAexp.n+1),  frmt:1, txWidth:6, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
//{file:document.configs_WebcamFile, key: "AEXPOE",  eq:1, quote:"",id:"idConfWebAEXPOE", divId:document.TABS_webAexp.id+"_div"+(document.TABS_webAexp.n+1),  frmt:1, txWidth:2, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inp},
{file:document.configs_WebcamFile, key: "AEXPINDEX",  eq:1, quote:"",id:"idConfWebAEXPINDEX", divId:document.TABS_webAexp.id+"_div"+(document.TABS_webAexp.n+1),  frmt:1, txWidth:3, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_WebcamFile, key: "AEXPPERCENT",  eq:1, quote:"",id:"idConfWebAEXPPERCENT", divId:document.TABS_webAexp.id+"_div"+(document.TABS_webAexp.n+1),  frmt:1, txWidth:3, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
*/


{file:document.configs_NetworkFile, key: "BOOTPROTO",  eq:1, quote:"",id:"idConfNetBOOTPROTO", divId:document.TABS_network.id+"_div"+(document.TABS_network.n+1),  frmt:2, txWidth:30, no:"none",yes:"dhcp",onUpdate:"showIps();",onUserChange:"showIps();",enUpd:1,val:"", rwState: 0},
{file:document.configs_NetworkFile, key: "IP",  eq:1, quote:"",id:"idConfNetIP", divId:document.TABS_network.id+"_div"+(document.TABS_network.n+1),  frmt:3, txWidth:20, onUpdate: "changedIP(0);",onUserChange:"changedIP(0);",enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_NetworkFile, key: "NETMASK",  eq:1, quote:"",id:"idConfNetNETMASK", divId:document.TABS_network.id+"_div"+(document.TABS_network.n+1),  frmt:3, txWidth:20, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_NetworkFile, key: "BROADCAST",  eq:1, quote:"",id:"idConfNetBROADCAST", divId:document.TABS_network.id+"_div"+(document.TABS_network.n+1),  frmt:3, txWidth:20, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_NetworkFile, key: "GATEWAY",  eq:1, quote:"",id:"idConfNetGATEWAY", divId:document.TABS_network.id+"_div"+(document.TABS_network.n+1),  frmt:3, txWidth:20, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_Mac,         key: "MAC", eq:1, quote:"",id:"idConfNetMac", divId:document.TABS_network.id+"_div"+(document.TABS_network.n+1),  frmt:6, disabled:1, txWidth:20, onUpdate:"setMac();",  onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
// videocontrols

{file:document.configs_VideoFile, sp:"12", key: "name",  eq:1, quote:"",id:"idVideoName", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:5, sel:document.streamersList, txWidth:1, onUpdate: null,onUserChange:"streamerChangedByUser();",enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"", key: "n",     eq:1, quote:"",id:"idVideoN",    divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:1, txWidth:1, onUpdate: "streamerNumberRead();",onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"", key: "multicast",  eq:1, quote:"",id:"idVideoMulticast", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:2, txWidth:30, no:"false", yes:"true", onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"1", key: "dest_ip",   eq:1, quote:"",id:"idVideoDestIp", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:3, txWidth:20,  onUpdate: "changedIP(1);",onUserChange:"changedIP(1);",enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"1", key: "dest_port",  eq:1, quote:"",id:"idVideoDestPort", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:1, txWidth:5,  onUpdate:"changedIP(2);",onUserChange:"changedIP(2);",enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"", key: "addr_from_req",   eq:1, quote:"",id:"idVideoAddrFromReq", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:2, txWidth:30, no:"", yes:"1", onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"", key: "port_from_req",   eq:1, quote:"",id:"idVideoPortFromReq", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:2, txWidth:30, no:"", yes:"1", onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},

{file:document.configs_VideoFile, sp:"", key: "ipstack",   eq:1, quote:"",id:"idVideoIpStack", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:2, txWidth:30, no:"false", yes:"true", onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"", key: "circbuf",   eq:1, quote:"",id:"idVideoCircBuf", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:2, txWidth:30, no:"false", yes:"true", onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"", key: "mmap",   eq:1, quote:"",id:"idVideoMmap", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:2, txWidth:30, no:"false", yes:"true", onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},

{file:document.configs_VideoFile, sp:"", key:  "bw",   eq:1, quote:"",id:"idVideoBw", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:1, txWidth:4, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"", key: "maxfps",   eq:1, quote:"",id:"idVideoLimFps", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:2, txWidth:30, no:"", yes:"1", onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"", key: "fps",   eq:1, quote:"",id:"idVideoFps", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:1, txWidth:4, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"", key: "qt_compat", eq:1, quote:"",id:"idVideoQtCompat", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:2, txWidth:30, no:"", yes:"1", onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"", key: "scanning", eq:1, quote:"",id:"idVideoScanning", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:2, txWidth:30, no:"", yes:"1", onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"", key: "verbosy",   eq:1, quote:"",id:"idVideoVerbose", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:2, txWidth:30, no:"false", yes:"true", onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"12", key: "autostart", eq:1, quote:"",id:"idVideoAutostart", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:2, txWidth:30, no:"false", yes:"true", onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr},
{file:document.configs_VideoFile, sp:"", key: "initstring",   eq:1, quote:"'",id:"idInitstring", divId:document.TABS_video.id+"_div"+(document.TABS_video.n+1),  frmt:1, txWidth:20, onUpdate: null,onUserChange:null,enUpd:1,val:"", rwState: 0,stl:document.style_conf_inpr}


);
  
//idSettingsTabs_div3  
//document.TABS_video={id:"idSettingsTabs", n:2};

////clickBuTton('idDCMvert2');
//clickBuTton('idBINvert1');

function dcmChanged (g,n,simulated) { //"simulated" not needed anymore
  var upd=false;
  if      (g=="dh") {
     document.dcm.dh=n;
     clickBuTton('idDCMvert'+n); 
  } else if (g=="dv") {
     document.dcm.dv=n;
     if ((document.dcm.dh!=document.dcm.dhs) || (document.dcm.dv!=document.dcm.dvs)) updateWOI();
  } else if (g=="bh") {
     document.dcm.bh=n;
     clickBuTton('idBINvert'+n);
  } else if (g=="bv" ){
     document.dcm.bv=n;
     if ((document.dcm.bh!=document.dcm.bhs) || (document.dcm.bv!=document.dcm.bvs)) updateWOI();
  }
}


//idMultiSensor12
function multiChanged (g,n,simulated) { //"simulated" not needed anymore
// alert ("multiChanged,g="+g+", n="+n);
  if        (g=="seq1") {
    if ((document.multisensor.mseq & 3) !=n) {
      document.multisensor.mseq=(document.multisensor.mseq & ~3) | (n & 3);
      updateWOI();
    }
  } else if (g=="seq2") {
    if (((document.multisensor.mseq>>2) & 3) !=n) {
      document.multisensor.mseq=(document.multisensor.mseq & ~(3<<2)) | ((n & 3)<<2);
      if (n=0) clickBuTton('idMultiSensor30'); /// if second in sequence is 0, so should be the 3-rd
      updateWOI();
    }
  } else if (g=="seq3") {
    if (((document.multisensor.mseq>>4) & 3) !=n) {
      document.multisensor.mseq=(document.multisensor.mseq & ~(3<<4)) | ((n & 3)<<4);
      updateWOI();
    }
  } else if (g=="mode") {
     if (n==0) {
       if (document.multisensor.mmod==0) {
         document.multisensor.mmod=1;
         updateWOI();
       }
     } else {
       if ((document.multisensor.mmod!=0) || (document.multisensor.msel!=n))  {
         document.multisensor.mmod=0;
         document.multisensor.msel=n;
         updateWOI();
       }
     }
  }
}


function initButtons() {
  var i;
  for (i=0;i<document.buTtons.length;i++) {
         createButton (document.buTtons[i].id, //id,          // id of DIV tag to make a button of
                       {w:25, h:25}, //widthHeight, // {w:xxx, h:yyy} - if empty will use the ones specified in DIV in HTML code
                       (document.buTtons[i].url?document.buTtons[i].url:
                       "images/camvc_buttons.png?_TIMESTAMP_"),//imageURL,    // URL of the image file name. Should consist of equal size images of the (WxH - see widthHeight)
                                    // with the each column corresponding to one button, rows - different button states
                       document.buTtons[i].n, //buttonNum,   // number of button column in imageURL (starting from 0)
                       document.buTtons[i].t, //"b", //buttonType,  // "" - just a single static image, no changes
                                    // "b" - regular button with two states - released (row 0) and pressed (row 1)
                                    // "tN" (N - number, may be empty) - toggle between N ( "t", "t1" parsed as "t2") states on each mouseDown
                                    // "TN" (N - number, may be empty) - toggle between N ( "t", "t1" parsed as "t2") states on each mouseUp,
                                    //      mousedown just turnes button to next row as "pressed"
                                    // "dN" - drop-down of N buttons, no pressed state. With the long press the whole column is displayed,
                                    //      the one on which the mouse was released stays
                                    // "DN" - drop-down, each button has pressed state in the next column (so button uses 2 column/numbers)
                      document.buTtons[i].dm, //dropdownMask, //string of "0" and "1" showing which button will stay after drop-down released              
                      document.buTtons[i].aop, //"alert('actOnPress');", //actOnPress,   // action on press ("alert("id="+id+" state="+state);" will show button id (see first argument) and state for
                                    // toggle/drop-down buttons. Should not use " inside, just '
                      document.buTtons[i].aoer, //"alert('actOnEarlyRelease');", //actOnEarlyRelease, // - after short hold
                      document.buTtons[i].aoh, //"alert('actOnHold');", //actOnHold,    // - after long hold timer expires (automatic for drop-down)
                      document.buTtons[i].aolr, //"alert('actOnLateRelease');"); //actOnLateRelease) 
                      document.buTtons[i].aodc,  //,actOnDblClick);
                      document.buTtons[i].aar); // act after release
  }                      
}

//idAexpOn_CB

// the following two functions are trivial and rely on the camera for the feedback. Maybe will change it to local (showing new state in controls before sending)?





function initMouseActions() {
 if (!document.all){
     document.getElementById("DIV_ALL").addEventListener("mousedown", mousedownProcess, true);
     document.getElementById("DIV_ALL").addEventListener("mousemove", mousemoveProcess, true);
     document.getElementById("DIV_ALL").addEventListener("mouseup",   mouseupProcess,  true);
//     document.getElementById("DIV_ALL").addEventListener("mouseover", mouseoverProcess,  true);
//     document.getElementById("DIV_ALL").addEventListener("mouseout",  mouseupProcess,  true);
     
   } else {
     document.getElementById("DIV_ALL").onmousedown = mousedownProcess;
     document.getElementById("DIV_ALL").onmousemove = mousemoveProcess;
     document.getElementById("DIV_ALL").onmouseup   = mouseupProcess;
//     document.getElementById("DIV_ALL").onmouseout  = mouseupProcess; - don't work with IE selected is not the top div, but some image, so - mouseout events are generated when that element is leaved
    // from http://www.ditchnet.org/wp/2005/06/15/ajax-freakshow-drag-n-drop-events-2/
    // prevent IE text selection while dragging!!!
    // Little-known trick!
    // AF: I left it just in case - this code probably do not need that
     document.body.ondrag = function () { return false; };
     document.body.onselectstart = function () { return false; };
   }
}

function mousedownProcess(e) {
   if (!e) {
      var e = window.event;
      e.pageX=event.clientX;
      e.pageY=event.clientY;
   }
/// Too broad - prevent clicking the input fields
//   if (typeof(e)!="undefined") e.preventDefault();
//   if (typeof(e)!="undefined") document.title=e.toSource();
   document.shiftKey=e.shiftKey;
   document.startX=e.pageX;
   document.startY=e.pageY;
   document.deltaX=0;
   document.deltaY=0;
// just close them if they still were open (maybe do some actions?)   
   document.slIderDragging=false;
   document.frAmeselDragging=false;
   
   var targ;
   if (e.target) targ = e.target;
   else if (e.srcElement) targ = e.srcElement;
   if (targ.nodeType == 3) // defeat Safari bug
      targ = targ.parentNode;
// switch here between different action targets 
if (document.debug & 1) document.title=targ.id; 
if (document.debug & 1) document.title+="("+document.getElementById(targ.id).type+")"; 
//if (document.debug & 1) document.title+="("+targ.id.toSource+")"; 
   var ttype=document.getElementById(targ.id);
   if (ttype) ttype=ttype.type;
   if (( (!ttype) ||
          (typeof(ttype)=='undefined') ||  
           (!(ttype.indexOf('select')>=0) /* &&
            !(ttype.indexOf('text')>=0)*/
           )) && (typeof(e)!="undefined")) e.preventDefault();
   if      (targ.id.indexOf("slIder")>=0) slIderMousedownProcess(e);
   else if (targ.id.indexOf("frAmesel")>=0) frAmeselMousedownProcess(e);
   else { // process non-slider mouse actions here
   } // 
   return true;
}

function mousemoveProcess(e) {
   if (!e) {
      var e = window.event;
      e.pageX=event.clientX;
      e.pageY=event.clientY;
   }
/// Too broad - prevent clicking the input fields
   if (typeof(e)!="undefined") e.preventDefault();
   document.deltaX=e.pageX-document.startX;
   document.deltaY=e.pageY-document.startY;
   if         (document.slIderDragging) slIderMousemoveProcess(e);
   else    if (document.frAmeselDragging) frAmeselMousemoveProcess(e);
//  if ((document.body) && (document.body.style.cursor == "help")) contextHelp(e);
  if (document.contextHelpOn) contextHelp(e);
  
  return true;
}


function mouseupProcess(e) {
   if (!e) {
      var e = window.event;
      e.pageX=event.clientX;
      e.pageY=event.clientY;
   }
   mousemoveProcess(e);
   if (document.slIderDragging) slIderMouseupProcess(e); 
   if (document.frAmeselDragging) frAmeselMouseupProcess(e);
   document.slIderDragging=false;
   document.frAmeselDragging=false;
   return true;
}
    
// ==================================================================================================


 
 


function resizeMainWindow () {
//trying removing it:
document.ignoreResize=false;

if (document.debug & 32) document.title +=" RSZ("+(document.ignoreResize?0:1)+")";
  if ((document.getElementById("idDivCameraImage").style.display != "none") ||
      (document.getElementById("idVideoViewer_outer").style.display!="none")) { // let it resize freely for debugging if no image is displayed
  var x,y,ix,iy;
    if (self.innerHeight) // all except Explorer 
    {
       x  = self.innerWidth;
       y  = self.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientHeight)
       // Explorer 6 Strict Mode
    {
       x  = document.documentElement.clientWidth;
       y  = document.documentElement.clientHeight;
    }
    else if (document.body) // other Explorers
    {
       x  = document.body.clientWidth;
       y  = document.body.clientHeight;
    }
    ix=x;iy=y;
if (document.debug & 32) document.title +=" ix="+ix+" iy="+iy;
//   document.ignoreResize=false; // disable this feature for now   
/*
  }  
  if (document.getElementById("idDivCameraImage").style.display != 'none') { // let it resize freely for debugging if no image is displayed
*/

if (document.debug & 32) document.title +=" liw="+gRequests.lastImageWidth+" lih="+gRequests.lastImageHeight;
   var imgVidSize=(document.getElementById("idVideoViewer_outer").style.display!="none")?
                   getSizeVideo ():
                   {width:parseInt(document.getElementById("idDivCameraImage").style.width),
                    height:parseInt(document.getElementById("idDivCameraImage").style.height)}; 

//    if (!document.getElementById("idCBOverlapControls").checked) ix-=document.controlsWidth;
/// relies on gRequests.lastImageWidth, gRequests.lastImageHeight even when live video is viewed
    if (!controlsOverlap()) ix-=document.controlsWidth;
    if ((imgVidSize.width* gRequests.lastImageHeight !=
         imgVidSize.height*gRequests.lastImageWidth) || !document.ignoreResize) {
         
      if (ix > (iy*gRequests.lastImageWidth/gRequests.lastImageHeight))
           ix= (iy*gRequests.lastImageWidth/gRequests.lastImageHeight);
      else iy =(ix*gRequests.lastImageHeight/gRequests.lastImageWidth);
      ix=Math.round(ix);
      iy=Math.round(iy);
      document.getElementById("idDivCameraImage").style.width=ix;
      document.getElementById("idDivCameraImage").style.height=iy;
if (document.debug & 32) document.title +=" DCI="+document.getElementById("idDivCameraImage").style.width+":"+document.getElementById("idDivCameraImage").style.height+"(d="+document.getElementById("idDivCameraImage").style.display+") ";
if (document.debug & 32) document.title +=" corr: ix="+ix+" iy="+iy;
      resizeVideo (ix,iy); /// will do nothing if video is off
      showWindow(); // will resize
    }
    document.ignoreResize=false; // to distinguish between manual resize and resize by program
/*
  } else   if (document.getElementById("idVideoViewer_outer").style.display!="none") {
    checkStreamPageSize(ix-(controlsOverlap()?0:document.controlsWidth),iy);
    showWindow(); //    showWindow(); // recalculate/redisplay
*/
  }  
}
/*
function resizeVideo (w,h) {
  if (document.getElementById("idVideoViewer").innerHTML.kength>0) {
    document.getElementById("idEmbeddedVideo").width=w;
    document.getElementById("idEmbeddedVideo").height=h;
  }
}
function getSizeVideo () {

resizeVideo (w,h)
*/

function controlsOverlap() {return document.translucency>=0;}
function controlsOpaqueLevel() {return 100-controlsTransparency();}

function controlsTransparency() {
  return (document.translucency >0)?document.translucency:0;
}

//==============================================================
function showDefaultVisibilty() {
  var i;
  for (i=0; i< document.divShowList.length; i++) {
    if (!(parseInt(document.getElementById(document.divShowList[i].id).style.zIndex)>1)) document.getElementById(document.divShowList[i].id).style.zIndex="1";  /// z-index should be defined to be used with iframes to shield from video plugin (>=1)
    document.getElementById(document.divShowList[i].id).style.display = document.divShowList[i].dspl?"": 'none';
    document.divVisibility[document.divShowList[i].id]=document.divShowList[i].dspl?"": 'none';
  }  
  showWindow();
}  

// to prevent jumping between different sizes that happened because of alternative resizes initiated by user.
// in responce to first user resize program calculated w1,h1 and resized, and exited
// immediately started srving pending user resize, calculated w2,h2 and resized to it, exited
// at that time the w1,h1 triggered onResize and program again resized to it
// again w2,h2 came and were resized to...
// idea is not to resize at the end of thonResize procedure, but rather delay it for a little (i.e. 0.5 sec) to give a chance for the pending onResize event
// to come through. If it will - first delayed resizeTo data will be overwritten
document.resizeDelays={
  delayTime:500,
  delayTimerID:null,
  x:-1,
  y:-1};

function delayedWindowResize(x,y) {
    if (!document.EnableResise) return;
    document.resizeDelays.x=x;
    document.resizeDelays.y=y;
if (document.debug & 32) document.title +=" DWR"+x+"/"+y;
    document.resizeDelays.delayTimerID = self.setTimeout("delayWindowResiseOver()", document.resizeDelays.delayTime);
}
function delayWindowResiseOver() {
    document.resizeDelays.delayTimerID=null;
//document.title+="T";    
if (document.debug & 32) document.title +=" DWR0"+document.resizeDelays.x+"/"+document.resizeDelays.y;
    top.resizeTo(document.resizeDelays.x,document.resizeDelays.y);
   
}

/*
  document.displayOptions="CS"; //"MDNTH"
  document.divShowList=new Array (
  {id:"idDivMenu",         opt:"CSMDNT", bg:"ffffff",         dspl:1},

*/
function showWindow() {
//document.title+="O";    
  var i,j,d,x,y;
  var h=0;
// clear pending resizeTo requests  
  if (document.resizeDelays.delayTimerID) {
      clearTimeout(document.resizeDelays.delayTimerID);
      document.resizeDelays.delayTimerID=null;
  }

  var w=document.controlsWidth;
  var isTransparent=(controlsOpaqueLevel()!="100") &&
                    controlsOverlap() &&
                    (document.getElementById("idDivCameraImage").style.display != 'none');
  
  var transp=controlsTransparency();
  var dopt=document.displayOptions+"*";
  for (i=0; i< document.divShowList.length; i++) {
// need to change everywhere where I was turning display on/off 
//    document.divVisibility[document.divShowList[i].id]=document.divShowList[i].dspl?"": 'none';
    d="none";
    if (document.divVisibility[document.divShowList[i].id]=="") {
    
// find out if the section is displayed
      for (j=0; j<dopt.length; j++) {
       if (document.divShowList[i].opt.indexOf(dopt[j])>=0) {
         d="";
         break;
       }
      }
//      document.getElementById(document.divShowList[i].id).style.display = document.divShowList[i].dspl?"": 'none';
    }
    document.getElementById(document.divShowList[i].id).style.display=d;
    
//    if (document.getElementById(document.divShowList[i].id).style.display != 'none') {
    if (d=="") {
      document.getElementById(document.divShowList[i].id).style.top=h+"px";
      h+=parseInt(document.getElementById(document.divShowList[i].id).offsetHeight);
      if (document.divShowList[i].bg.substr(0,1)=="*") {
        setTabsTransparency(document.divShowList[i].bg.substr(1),transp, "images/bg_");
      } else {
        document.getElementById(document.divShowList[i].id).style.backgroundColor=isTransparent?"":"#"+document.divShowList[i].bg;
        document.getElementById(document.divShowList[i].id).style.backgroundImage=(isTransparent && (controlsOpaqueLevel()!="0"))?
        ("url(images/bg_"+document.divShowList[i].bg+"_"+controlsOpaqueLevel()+".png?_TIMESTAMP_)"):"";
      }   
    }
  }
//  
//  document.getElementById("idShieldControlsFromPlugin").style.display="block"; /// may be done once - after videoplugin initialized !!!
  document.getElementById("idShieldControlsFromPlugin").style.width=document.controlsWidth;
  document.getElementById("idShieldControlsFromPlugin").style.height=h; //+++++++++++++++++++++++++++++++++++ 
  
//  document.getElementById("idShieldButtonsFrom_x").style.width=256;
//  document.getElementById("idShieldButtonsFrom_x").style.height=256;
  
  
  if (document.getElementById("idDivCameraImage").style.display != 'none') {
    if (parseInt(document.getElementById("idDivCameraImage").style.height) > h) h=parseInt(document.getElementById("idDivCameraImage").style.height);
    w=parseInt(document.getElementById("idDivCameraImage").style.width);

//    if (!document.getElementById("idCBOverlapControls").checked) {
    if (!controlsOverlap()) {
      w+=document.controlsWidth;
      document.getElementById("idDivCameraImage").style.left=document.controlsWidth+"px";
    } else  document.getElementById("idDivCameraImage").style.left="0px"; 
    
    if (w<document.controlsWidth) w=document.controlsWidth;
    frAmeselFillParent ("idMagnifier_frAmesel");
    frAmeselShow ("idMagnifier_frAmesel");
  }    
// show only when tab is open?    
  frAmeselFillParent ("idAexp_frAmesel");
  frAmeselShow ("idAexp_frAmesel");
    
  if (document.getElementById("idWindow").style.display != 'none') {
    frAmeselShow ("idWindow_frAmesel");
  }

//(document.getElementById("idUpgrade").style.display=="none")
if (document.debug & 16) document.title="idDivCameraImage("+document.getElementById("idDivCameraImage").style.display+")";
if (document.debug & 16) document.title+="idUpgrade("+document.getElementById("idUpgrade").style.display+")";
if (document.debug & 16) document.title+=" idVideoViewer_outer("+document.getElementById("idVideoViewer_outer").style.display+")";
  if (document.getElementById("idUpgrade").style.display!="none") {
    if (w < (document.controlsWidth+document.upgradeWidth)) w = document.controlsWidth+document.upgradeWidth;
    if (h < document.upgradeHeight) h = document.upgradeHeight;
    document.getElementById("idUpgrade").style.left=document.controlsWidth;
    document.getElementById("idUpgrade").style.width=w-document.controlsWidth;
    document.getElementById("idUpgrade").style.height=h;
  }
// do not increase window, only reduce - no, now - both ways (if needed)
// size if video viewer is on
//controlsOverlap()
  if (document.getElementById("idVideoViewer_outer").style.display!="none") {
    document.getElementById("idVideoViewer_outer").style.left=(controlsOverlap()?0:document.controlsWidth);  
    w = parseInt(document.getElementById("idVideoViewer").style.width)+(controlsOverlap()?0:document.controlsWidth);
    var hv=parseInt(document.getElementById("idVideoViewer").style.height)+
           ((document.getElementById("idVideoRunButtons").style.display!="none")? 
           parseInt(document.getElementById("idVideoRunButtons").style.height):0);
    if (h < hv) h=hv;
  }
// prevent reducing window size until the image (and rstat?) is acquired
  if (!document.imageGot) { //FIXME:
//  if (true) {
//  if (!document.ccs.img.got2) {
    if (h<parseInt (document.getElementById("DIV_ALL").style.height)) h=parseInt (document.getElementById("DIV_ALL").style.height);
    if (w<parseInt (document.getElementById("DIV_ALL").style.width))  w=parseInt (document.getElementById("DIV_ALL").style.width);
    
  }
      
//  d ocument.title="w="+w+" h="+h+">"+document.getElementById("idDivCameraImage").style.display+"<";
  document.getElementById("DIV_ALL").style.height=h+"px";
  document.getElementById("DIV_ALL").style.width=w+"px";
  if (!document.EnableResise) return;
if (document.debug & 32) document.title +=" daW="+w+" daH="+h+" dbX="+document.borderX;
if (document.debug & 32) document.title +=" siw="+self.innerWidth+" sow="+self.outerWidth+" sih="+self.innerHeight+" soh="+self.outerHeight;
// resize the whole window
// as it uses measures the borders we may make it once
  if (document.borderX<0) { // not yet know the browser window border
     if (self.innerHeight) {// all except Explorer 
       x  = w+self.outerWidth-self.innerWidth;
       y  = h+self.outerHeight-self.innerHeight;
     } else if (document.body) {// other Explorers
       top.resizeTo(w,h);
       x  = 2 * w - document.body.clientWidth;
       y  = 2 * h - document.body.clientHeight;
     }
     document.borderX=x-w;
     document.borderY=y-h;
    } else {
     x= document.borderX+w;
     y= document.borderY+h;
    } 
if (document.debug & 32) document.title +=" bW="+document.borderX+" bH="+document.borderY;
//d ocument.title+=" h="+h+"y="+y;    
    document.ignoreResize=true; // to distinguish between manual resize and resize by program
if (document.debug & 32) document.title +=" TopW="+x+" TopH="+y;
    delayedWindowResize(x,y)
//    top.resizeTo(x,y);
//  d ocument.title=  document.getElementById("idDivAutoexpTable").height+":"+document.getElementById("idDivAutoexpTable").style.height;
   showMoreLess();
   if ((document.debug==0) &&document.getElementById("h_idTitle") &&    (typeof (document.getElementById("h_idTitle"))!="undefined")) {
	   document.title=document.getElementById("h_idTitle").innerHTML+":"+document.sensor_port;
   }

 }  
  

//============================== 



function myAlert(s) {
  var sl=60;
  var i=0;

  while (i< s.length) {
   if ((s.length-i)<sl) sl=s.length-i;
   s=s.substr(0,i).concat("\n",s.substr(i, s.length-i));
   i+=sl+1;
  }
 alert (s);  
}

/// Show/hide multisensor controls,
/// hide non-existent sensors
function showMultiVisibility (idName,mask) { 
  var i;
  if (mask==0) { // no 10359 board, hide all multisensor related conrols
    document.getElementById(idName+"_LB").style.display="none";
    document.getElementById(idName+"Mode").style.display="none";
    document.getElementById(idName+"1").style.display="none";
    document.getElementById(idName+"2").style.display="none";
    document.getElementById(idName+"3").style.display="none";
  } else {
/// Show sections themselves
    for (i=1; i<=3; i++) {
      if (mask & (1<<(i-1))) {

        document.getElementById(idName+"1"+i+"_out").style.display="";
        document.getElementById(idName+"2"+i+"_out").style.display="";
        document.getElementById(idName+"3"+i+"_out").style.display="";
        document.getElementById(idName+"Mode"+i+"_out").style.display="";

      } else {
        document.getElementById(idName+"1"+i+"_out").style.display="none";
        document.getElementById(idName+"2"+i+"_out").style.display="none";
        document.getElementById(idName+"3"+i+"_out").style.display="none";
        document.getElementById(idName+"Mode"+i+"_out").style.display="none";
      }
    }
    document.getElementById(idName+"_LB").style.display="";
    document.getElementById(idName+"Mode").style.display="";
    document.getElementById(idName+"1").style.display="";
    document.getElementById(idName+"2").style.display="";
    document.getElementById(idName+"3").style.display="";
  }
}

//function showMulti (idName,mask,mode,sequence,sel) {// idName - "idMultiSensor", ... mask - msens (sensor bit mask, -0 - no 10359) 
function showMulti (idName, mode,sequence,sel) {// idName - "idMultiSensor", ... mask - msens (sensor bit mask, -0 - no 10359) 
  var i,v;
  for (i=1;i<=3;i++) {
    v= (sequence >> (2*(i-1))) & 3;
    if(!getBuTton((idName+i)+v).s)  clickBuTton((idName+i)+v);

  }
  v=(mode>0)?"M":sel;
  if(!getBuTton(idName+"Mode"+v).s)  clickBuTton(idName+"Mode"+v);
}


// show visibility of the selected type of decimation/binning (dh,dv,bh,bv) , available selections for this sensor, and selection itself
function showDCMBin (idName,m,v) {// idName - "idDCMhor", ... m - mask, 
  var numDivs=0; // number of allowed DIVs in this category
  var curDiv;
  var dw;
  for (i=1;i<=16;i++) {
    curDiv=document.getElementById(idName+i+"_out");
    if (curDiv) {
      if (m & (1<<(i-1))) {
        curDiv.style.display="";
        numDivs++;
      } else curDiv.style.display="none";
    }  
  }
// do we have  anything to select - if not - disable the whole section
// document.getElementById(idDiv).style.display= (numDivs>0)?"":"none";
 document.getElementById(idName).style.display= (numDivs>0)?"":"none";
 document.getElementById(idName+"_LB").style.display= (numDivs>0)?"":"none";


// spread divs across window  
  var thisleft=0;
  if (numDivs>0) {
    if(!v) v=1;
  
    if (!getBuTton (idName+v).s) clickBuTton(idName+v);
    
  } 
// now - select the right one  

}


/*
 * Create "close" cross in the top right corner of the specified element.
 * it will be dim until mouse hovers over a larger square (extends out of the parent element),
 * then becomes brighter (switches images). It hides parent element and triggers callback
 */
//      if (document.divShowList[i].bg.substr(0,1)=="*") {
//        setTabsTransparency(document.divShowList[i].bg.substr(1),transp, "images/bg_");


function createCrosses () {
  var i;
  var tID;
  for (i=0; i<document.divShowList.length; i++){
    if (document.divShowList[i].hoverSize >0) {
         tID=(document.divShowList[i].bg.substr(0,1)=="*") ? document.divShowList[i].bg.substr(1):"";
         createCloseCross (document.divShowList[i].id, //parent div id
                           document.divShowList[i].hoverSize, // size of overall (square) mouseover area that shows the cross
                           document.divShowList[i].crossSize, // size of cross image (square) in the middle of hover area
                           document.divShowList[i].hoverURL,  // hover image url (faint, barely visible cross)
                           document.divShowList[i].crossURL,  // cross that appears when mouse is over hover area
                           tID,                                   //tID,       // tabs ID (or "") - if present tabs will folded first - not closed
                           document.divShowList[i].callback   // function to be called when the cross is pressed (after hiding itself and parent element)
                           );
    }
  }
}
// move to .js
function createCloseCross (id, //parent div id
                           hoverSize, // size of overall (square) mouseover area that shows the cross
                           crossSize, // size of cross image (square) in the middle of hover area
                           hoverURL,  // hover image url (faint, barely visible cross)
                           crossURL,  // cross that appears when mouse is over hover area
                           tID,       // tabs ID (or "") - if present tabs will folded first - not closed
                           callback   // function to me called when the cross is pressed (after hiding itself and parent element)
                           ) {
  var pw=parseInt(document.getElementById(id).style.width);
  var s='<div id="'+id+'_close" style="position:absolute; left:'+(pw-Math.round((hoverSize+crossSize)/2))+
         ';top:'+Math.round((crossSize-hoverSize)/2)+'; width:'+hoverSize+'; height:'+hoverSize+'; z-index:50; background-image:url('+
             hoverURL+');" onmouseover="hoverCloseCross('+"'"+id+"'"+',1);" onmouseout="hoverCloseCross('+"'"+id+"'"+',0);">\n';
      s+='<div id="'+id+'_close_cross" style="display:none;position:absolute; left:'+Math.round((hoverSize-crossSize)/2)+'; top:'+Math.round((hoverSize-crossSize)/2)+
                    '; width:'+crossSize+'; height:'+crossSize+';background-image:url('+crossURL+');" onclick="clickCloseCross('+
                    "'"+id+"','"+callback+"','"+tID+"'"+');">'+
                    '<'+'!-- --'+'>'+
         '</div>\n'+
      '</div>\n';
//  alert (s+document.getElementById(id).innerHTML);  
  document.getElementById(id).innerHTML=s+document.getElementById(id).innerHTML;
}
function hoverCloseCross (id,show) {document.getElementById(id+'_close_cross').style.display=show?"":"none";}                        
//    document.divVisibility["idDivColors"]=(document.divVisibility["idDivColors"] == "none")? "" : "none";
//    document.getElementById("idDivColors").style.display = document.divVisibility["idDivColors"];

function clickCloseCross (id,act,tID) {
//alert (id + " " + tID + getSelectedTab(tID));
  if ((tID!="") && (getSelectedTab(tID)>=0)){
    onClickTabs(tID,-1);  // just fold, don't close
  } else {
    document.getElementById(id+'_close_cross').style.display="none";
    document.getElementById(id).style.display="none";
    document.divVisibility[id]="none";
    if (act) eval (act);
  }
}

/*
 * == end of "close" cross ==
 */
 
 
/*
Function declarations
function createFrameSel (id, // parent element ID (bare div), should have frAmesel in it's name
                          snap_hw, // shap half width
                          borderStyle, //
                          isRelative, // (0 - inner frame has absolute values, 1 - percents of the outer/range)
                          minWindth,
                          minHeight,
                          innerImage,  // "" if none (if there will be - provide just empty 1x1)
                          idWidth,     // external text field (or "") to represent (actual) width of the inner frame - onchange will be added automatically
                          idHeight,     // external text field (or "") to represent (actual) height of the inner frame
                          idLeft,
                          idTop,
                          onMove,       // call back function to run when frame is moved
                          onDone,      // to run if text filed is changed or the frame mouseup
                          onDobleClick
                          );

function frAmeselShow (id)
function frAmeselAllTextFromInternal (id);
function frAmeselSetResizeEn (id,en)
function frAmeselGetResizeEn (id)
function frAmeselSetRelative (id,r)
function frAmeselGetRelative (id)
function frAmeselSetOuter (id,wh)
function frAmeselFillParent (id)
function frAmeselGetOuter (id)
function frAmeselSetZindexHandles(id,z)
function frAmeselSetZindexFrame(id,z)
function frAmeselGetZindexHandles(id)
function frAmeselGetZindexFrame(id)
function frAmeselSetInner (id,whlt)
function frAmeselCenterInner (id)
function frAmeselGetInner (id)
function frAmeselSetMagnification (id,m)
function frAmeselGetMagnification (id)
function frAmeselSetSnap (id,m)
function frAmeselGetSnap (id)
function frAmeselSetBorderWidth (id,m)
function frAmeselGetBorderWidth (id)
function frAmeselSetBorderStyle (id,m)
function frAmeselGetBorderStyle (id)
function frAmeselSetImage (id,url)
function frAmeselSetBorderShow (id,showb)
// private functions
function frAmeselOnTextChange(iid,d)
// mouse functions
function frAmeselPressed()
function frAmeselMousedownProcess(e)
function frAmeselMousemoveProcess(e)
function frAmeselMouseupProcess(e)
//call back functions
function frAmeselActOnDone (id)
function frAmeselActOnChange (id)
function frAmeselActOnDoubleclick (id)



*/ 

function initMagnifier () {
               createFrameSel ("idMagnifier_frAmesel", // parent element ID (bare div), should have frAmesel in it's name
                        "", //"3px groove #ff0000",//  frameBorderStyle, // id of an optional div with a frame that will be resized when outer dimentions changed
                        3, //snap_hw, // shap half width
                        "3px groove #777777", //borderStyle, // 
                        1,               // isRelative, // (0 - inner frame has absolute values, 1 - percents of the outer/range)
                        32, //  minWindth,
                        32, //  minHeight,
                        "images/empty.png?_TIMESTAMP_", //innerImage,  // "" if none (if there will be - provide just empty 1x1)
                        "",     // external text field (or "") to represent (actual) width of the inner frame - onchange will be added automatically
                        "",     // external text field (or "") to represent (actual) height of the inner frame
                        "",
                        "",
                        "", //onMove,       // call back function to run when frame is moved
                        "", //onDone       // to run if text filed is changed or the frame mouseup
                        "magnifierOnDoubleClick();", //                          onDobleClick
//                        "alert ('doubleClick');" //                          onDobleClick
                        "" // onMouseDown
                        );
//alert ("1"); debugWindowShow(document.getElementById("idWindow_frAmesel").parentNode.innerHTML);
// startup magnifier size - move away
   frAmeselSetOuter ("idMagnifier_frAmesel",{w:2048,h:1536});
   frAmeselSetInner ("idMagnifier_frAmesel",{w:300,h:300,l:850,t:600});
   frAmeselSetSnap ("idMagnifier_frAmesel",5);
   frAmeselSetBorderWidth ("idMagnifier_frAmesel",3);
   frAmeselSetZindexHandles("idMagnifier_frAmesel",20);
//   frAmeselSetZindexFrame("idMagnifier_frAmesel",15);
   
   changeMagnifier(true);
//   frAmeselSetMagnification ("idMagnifier_frAmesel",1);
   
//   frAmeselShow ("idMagnifier_frAmesel");
  document.getElementById("idMagnifier_frAmesel_frameBorder").onmousedown=startRefresh;
}


function changeMagnifier(updateZoom) {
  document.getElementById("idMagnifier_frAmesel").style.display=(document.MagnifierMode>0)?"":"none";
  if (updateZoom) frAmeselSetMagnification ("idMagnifier_frAmesel",  document.MagnifierZoom);
  frAmeselSetBorderShow ("idMagnifier_frAmesel",(document.MagnifierMode>1));
  frAmeselShow ("idMagnifier_frAmesel");
}

function magnifierOnDoubleClick(){
 var z= frAmeselGetMagnification ("idMagnifier_frAmesel");
 if (z!=1) z=1;
 else {
//   z= parseInt(document.getElementById("idTXMagnifierZoom").value);
     z= document.MagnifierZoom;
//   if (z==1) z=4;
    if (z==1) {
       document.MagnifierZoom=document.MagnifierZoomDefault;
       setSliderAndText("_slIder", document.MagnifierZoom);
       z= document.MagnifierZoom;
    }   
 }
 frAmeselSetMagnification ("idMagnifier_frAmesel",z);
 frAmeselShow ("idMagnifier_frAmesel");
}



//=============================================================
function initCameraFrameSel () {
               createFrameSel ("idWindow_frAmesel", // parent element ID (bare div), should have frAmesel in it's name
                        "1px solid #bbbb77",//  frameBorderStyle, // id of an optional div with a frame that will be resized when outer dimentions changed
                        3, //snap_hw, // shap half width
                        "3px groove #777777", //borderStyle, // 
                        1,               // isRelative, // (0 - inner frame has absolute values, 1 - percents of the outer/range)
                        32, //  minWindth,
                        32, //  minHeight,
                        "images/empty.png?_TIMESTAMP_", //innerImage,  // "" if none (if there will be - provide just empty 1x1)
                        "idWindow_frAmeselT_TXWidth",     // external text field (or "") to represent (actual) width of the inner frame - onchange will be added automatically
                        "idWindow_frAmeselT_TXHeight",     // external text field (or "") to represent (actual) height of the inner frame
                        "idWindow_frAmeselT_TXLeft",
                        "idWindow_frAmeselT_TXTop",
                        "CameraFrameSelOnMove();", //onMove,       // call back function to run when frame is moved
                        "CameraFrameSelOnChange ();", //onDone       // to run if text filed is changed or the frame mouseup
                        "CameraFrameSelOnDoubleClick();", //                          onDobleClick
                        "ShowIdWindowOrAe(true);" // onMouseDown

                        );
//alert ("1"); debugWindowShow(document.getElementById("idWindow_frAmesel").parentNode.innerHTML);
   frAmeselSetOuter ("idWindow_frAmesel",{w:2048,h:1536});
   frAmeselSetInner ("idWindow_frAmesel",{w:800,h:600,l:500,t:300});
//   frAmeselSetMagnification ("idWindow_frAmesel",1);
   frAmeselSetSnap ("idWindow_frAmesel",3);
   frAmeselSetBorderWidth ("idWindow_frAmesel",3);
   frAmeselShow ("idWindow_frAmesel");
}






function CameraFrameSelOnMove (){
  dbgp(4,"-");
  updateWOI();
//  gInterface.sendParametersToCamera();///TODO: only update what is needed
}

function CameraFrameSelOnChange (){ // check if window size was not modified 
  dbgp(4," Cfsc");
  updateWOI();
//  gInterface.sendParametersToCamera();///TODO: only update what is needed
}

function CameraFrameSelOnDoubleClick(){
// alert ("CameraFrameSelOnDoubleClick");
  if (document.shiftKey) {
    var wo= frAmeselGetOuter ("idWindow_frAmesel");
    var wi= frAmeselGetInner ("idWindow_frAmesel");
    wi.w=wo.w;
    wi.h=wo.h;
    frAmeselSetInner ("idWindow_frAmesel",wi)
  }
  frAmeselCenterInner ("idWindow_frAmesel");
  frAmeselShow ("idWindow_frAmesel");
  CameraFrameSelOnChange (); // send to camera
}
/*
function updateWindow_frAmesel(){
  var r=document.getElementById("idWindow_frAmesel_Relative").checked;
  frAmeselSetRelative ("idWindow_frAmesel",r);
  document.getElementById("idWindow_frAmesel_Width_pxpc").innerHTML=r?"%":document.getElementById("idWindow_frAmesel_Pixels").innerHTML; //"px";
  document.getElementById("idWindow_frAmesel_Height_pxpc").innerHTML=r?"%":document.getElementById("idWindow_frAmesel_Pixels").innerHTML;
  document.getElementById("idWindow_frAmesel_Left_pxpc").innerHTML=r?"%":document.getElementById("idWindow_frAmesel_Pixels").innerHTML;
  document.getElementById("idWindow_frAmesel_Top_pxpc").innerHTML=r?"%":document.getElementById("idWindow_frAmesel_Pixels").innerHTML;
}
*/

//==Auto Exposure selection window====================

function initAexpFrame() { 
//  alert ("document.showAexpFrame="+document.showAexpFrame);   
  if      (document.showAexpFrame==1) AexpFrameSelected("idShowAexpFrameMain_CB");
  else if (document.showAexpFrame==2) AexpFrameSelected("idShowAexpFrameNavigator_CB");
  else {
    setBuTtonState("idShowAexpFrameMain_CB",0);
    setBuTtonState("idShowAexpFrameNavigator_CB",0);
    
  }
}

//{id:"idShowAexpFrameMain_CB",   n:30, t:"T2",dm:"",  aop:"document.showAexpFrame=(getBuTton(id).s!=0);changeAexp();showWindow();"},
//{id:"idShowAexpFrameNavigator_CB",   n:30, t:"T2",dm:"",  aop:"document.showAexpFrame=(getBuTton(id).s!=0);changeAexp();showWindow();"},
function AexpFrameShowClicked(id) {
  if (!getBuTton(id).s) {
    document.showAexpFrame=0;
    ShowIdWindowOrAe(true);
  } else {
    AexpFrameSelected(id);
    ShowIdWindowOrAe(false);
  }  
}

function AexpFrameSelected(id) {
   if        (id == "idShowAexpFrameMain_CB") {
     setBuTtonState("idShowAexpFrameMain_CB",1);      // to be able to simulate click (on init)
     setBuTtonState("idShowAexpFrameNavigator_CB",0); // can not show both yet
     initCameraAexpSel ("idDivCameraImage");
     document.showAexpFrame=1;
   } else if (id == "idShowAexpFrameNavigator_CB") {
     setBuTtonState("idShowAexpFrameNavigator_CB",1); // to be able to simulate click (on init)
     setBuTtonState("idShowAexpFrameMain_CB",0);      // can not show both yet
     initCameraAexpSel ("idWindow_frAmesel_frame_rootClip");
     document.showAexpFrame=2;
   } else {
     alert ("error - wrong button id - "+id);
     return;
   }
}


function initCameraAexpSel (where) { //where = "idWindow_frAmesel_frame_rootClip" or "idDivCameraImage"
//  alert ("where="+where);
// make it possible to re-create that frame in other place (not simultaneously as would be nicer)
      var savedOuter={w:2048,h:1536};
      var savedInner={w:800,h:600,l:500,t:300};
      
      if (document.getElementById("idAexp_frAmesel")) {
        savedOuter=frAmeselGetOuter ("idAexp_frAmesel");
        savedInner=frAmeselGetInner ("idAexp_frAmesel");
        
        if(document.getElementById("idAexp_frAmesel").parentNode.id==where) return; // already there - nothing to be done
//        var i=document.getElementById("where").innerHTML.indexOf('<!'+'--idAexp_frAmesel');
        var i=document.getElementById("idAexp_frAmesel").parentNode.innerHTML.indexOf('<!'+'--idAexp_frAmesel');
        if (i<0) alert ("error - could not find a child in a parent's body");
        document.getElementById("idAexp_frAmesel").parentNode.innerHTML=document.getElementById("idAexp_frAmesel").parentNode.innerHTML.substr(0,i);
      }
      document.getElementById(where).innerHTML+=
   '<!'+'--idAexp_frAmesel--'+'><div id="idAexp_frAmesel" style="position:absolute; left:25%; top:25%;  width:50%; height:50%;"></div>';
               
               createFrameSel ("idAexp_frAmesel", // parent element ID (bare div), should have frAmesel in it's name
                        "", //"1px solid #bbbb77",//  frameBorderStyle, // id of an optional div with a frame that will be resized when outer dimentions changed
                        2, //snap_hw, // shap half width
                        "3px groove #ff7700", //borderStyle, // 
                        1,               // isRelative, // (0 - inner frame has absolute values, 1 - percents of the outer/range)
                        32, //  minWindth,
                        32, //  minHeight,
                        "images/empty.png?_TIMESTAMP_", //innerImage,  // "" if none (if there will be - provide just empty 1x1)
                        "idAexp_frAmeselT_TXWidth",     // external text field (or "") to represent (actual) width of the inner frame - onchange will be added automatically
                        "idAexp_frAmeselT_TXHeight",     // external text field (or "") to represent (actual) height of the inner frame
                        "idAexp_frAmeselT_TXLeft",
                        "idAexp_frAmeselT_TXTop",
                        "CameraAexpSelOnMove();", //onMove,       // call back function to run when frame is moved
                        "CameraAexpSelOnChange ();", //onDone       // to run if text filed is changed or the frame mouseup
                        "CameraAexpSelOnDoubleClick();", //                          onDoubleClick
                        "ShowIdWindowOrAe(false);" // onMouseDown
                        );
//alert ("1"); debugWindowShow(document.getElementById("idAexp_frAmesel").parentNode.innerHTML);
   frAmeselSetOuter ("idAexp_frAmesel",savedOuter);
   frAmeselSetInner ("idAexp_frAmesel",savedInner);
//   frAmeselSetMagnification ("idAexp_frAmesel",1);
   frAmeselSetSnap ("idAexp_frAmesel",2);
   frAmeselSetBorderWidth ("idAexp_frAmesel",1);
   
   frAmeselShow ("idAexp_frAmesel");
   frAmeselSetZindexHandles("idAexp_frAmesel",20);


}



//"idSettingsTabs_div3"
function CameraAexpSelOnMove (){
if (document.debug & 2048) document.title+="M";
//    updateAeControls();
      setAEParameters();

}

function changeAexp() {
  document.getElementById("idAexp_frAmesel").style.display=(document.cameraAexpParametersAcquired && (document.showAexpFrame>0))?"":"none";
  frAmeselShow ("idMagnifier_frAmesel");
}


function CameraAexpSelOnChange (){ // check if window size was not modified 
if (document.debug & 2048) document.title+="C";
//    updateAeControls();
      setAEParameters();
//  gInterface.sendParametersToCamera();///TODO: only update what is needed
}

function CameraAexpSelOnDoubleClick(){
// alert ("CameraAexpSelOnDoubleClick");
  if (document.shiftKey) {
    var wo= frAmeselGetOuter ("idAexp_frAmesel");
    var wi= frAmeselGetInner ("idAexp_frAmesel");
    if (wi.h==wo.h) {
      wi.w=Math.round(wo.w/2);
      wi.h=Math.round(wo.h/2);
    } else  {
      wi.w=wo.w;
      wi.h=wo.h;
    }  
    frAmeselSetInner ("idAexp_frAmesel",wi)
  }
  frAmeselCenterInner ("idAexp_frAmesel");
  frAmeselShow ("idAexp_frAmesel");
  CameraAexpSelOnChange (); // send to camera
}

//  document.displayOptions="CS"; //"MDNTH"
//  document.divVisibility={idDivMenu:""}; //will grow
//  document.divShowList=new Array (
//  {id:"idDivMenu",         opt:"CSMDNT", bg:"ffffff",         dspl:1},
/*
  for (i=0; i< document.divShowList.length; i++) {
// need to change everywhere where I was turning display on/off 
//    document.divVisibility[document.divShowList[i].id]=document.divShowList[i].dspl?"": 'none';
    d="none";
    if (document.divVisibility[document.divShowList[i].id]=="") {
    
// find out if the section is displayed
      for (j=0; j<document.displayOptions.length; j++) {
       if (document.divShowList[i].opt.indexOf(document.displayOptions[j])>=0) {
         d="";
         break;
       }
      }
//      document.getElementById(document.divShowList[i].id).style.display = document.divShowList[i].dspl?"": 'none';
    }
    document.getElementById(document.divShowList[i].id).style.display=d;

 function getSelectedTab(tID) {
["vis_"+m    ]
      if (document.divShowList[i].bg.substr(0,1)=="*") {
        setTabsTransparency(document.divShowList[i].bg.substr(1),transp, "images/bg_");
    
    
*/
// == buttons ==
function saveTabsState() { // will save tabs open for the mode last open 
  var i, tID,iTab;
  if (document.displayOptions.length<1) return;
  var m=document.displayOptions.substr(document.displayOptions.length-1);
  for (i=0; i<document.divShowList.length; i++)  if (document.divShowList[i].bg.substr(0,1)=="*") {
    tID=document.divShowList[i].bg.substr(1);
    iTab=getSelectedTab(tID);
    if ((iTab>=-1) && (document.divVisibility[document.divShowList[i].id]=="none")) iTab=-iTab-3; // save invisible tab as negative number to be able to restore it with "open all"
    document.divShowList[i]["vis_"+m]=iTab;
  }
}
function restoreTabsState(dontClose) { // will restore tabs open for the mode last (just) open 
  var i, tID,iTab;
  if (document.displayOptions.length<1) return;
  var m=document.displayOptions.substr(document.displayOptions.length-1);
  for (i=0; i<document.divShowList.length; i++)  if (document.divShowList[i].bg.substr(0,1)=="*") {
    tID=document.divShowList[i].bg.substr(1);
    iTab=parseInt(document.divShowList[i]["vis_"+m]);
//alert ("vis_"+m+"  " +iTab);    
    if (isNaN(iTab)) iTab=-1; // was not open
    if ((iTab>=-1) || !dontClose) {
      document.divVisibility[document.divShowList[i].id]=(iTab<-1)?"none":"";
      document.getElementById(document.divShowList[i].id).style.display=document.divVisibility[document.divShowList[i].id];
//alert (i+ " "+tID+" "+iTab+" "+document.divShowList[i].id+":"+document.divVisibility[document.divShowList[i].id]+" dc="+dontClose);      
      if (iTab<-1) iTab=-3-iTab;
      onClickTabs(tID, iTab);
//alert (i+ " "+tID+" "+iTab+" "+document.divShowList[i].id+":"+document.divVisibility[document.divShowList[i].id]);      
    }  
  }
}

function released_btnMainMenu(m,s) {
  saveTabsState();
  if ((m=="S") || (m=="D")) alert ("These controls are not yet supported in the 8.0 software");
  if (s==0) { // toggle
    if (document.displayOptions.indexOf(m)>=0) { // if open - close all, if closed - open only this
      document.displayOptions="";
    } else {
      document.displayOptions=m;
      restoreTabsState(false);
    }
  } else if (s==1) { // open/close only this
    if (document.displayOptions.indexOf(m)>=0) { // if open - close, if closed - open only this
      var opt1="";
      var i;
      for (i=0; i< document.displayOptions.length;i++) if (document.displayOptions[i] != m) opt1+=document.displayOptions[i];
      document.displayOptions=opt1;
      restoreTabsState(false);
    } else {
      document.displayOptions+=m;
      restoreTabsState(true);
    }
  } else { // open all options in the current tab (add to selection
     if (document.displayOptions.indexOf(m)<0) document.displayOptions+=m; // change to replace ("=" instead of "+=")?
     var i;
     for (i=0; i< document.divShowList.length; i++) {
       if (document.divShowList[i].opt.indexOf(m)>=0) {
        document.divVisibility[document.divShowList[i].id]="";
        document.getElementById(document.divShowList[i].id).style.display=document.divVisibility[document.divShowList[i].id];
       } 
     }
     restoreTabsState(true);
  }
  showWindow();
}

function toggleHistControls() {
   var id=document.getElementById(document.TABS_histogram.id).parentNode.id;
   if ((document.getElementById(id).style.display=="") && (getSelectedTab(document.TABS_histogram.id)==document.TABS_histogram.n)) {
     document.divVisibility[id]="none";
     document.getElementById(id).style.display=document.divVisibility[id];
   } else {
     document.divVisibility[id]="";
     document.getElementById(id).style.display=document.divVisibility[id];
     onClickTabs(document.TABS_histogram.id,document.TABS_histogram.n);
   }
   showWindow();
}

//    iTab=getSelectedTab(tID);



function released_btnHistShow(s) {
  if (s) {
     var id=document.getElementById(document.TABS_histogram.id).parentNode.id;
     document.divVisibility[id]="";
//d ocument.title=  " '"+ document.getElementById(id).style.display+ "'";
     document.getElementById(id).style.display="";
// d ocument.title+=  " '"+ document.getElementById(id).style.display+ "'";
     onClickTabs(document.TABS_histogram.id,document.TABS_histogram.n);
// d ocument.title+=   " '"+ document.getElementById(id).style.display+ "'";

// alert ( "1: "+document.getElementById(id).style.display+"\n"+"2: "+id+"\n"+"3: "+document.divVisibility[id]);    
  } else {
     document.divVisibility["idDivHist"]=(document.divVisibility["idDivHist"] == "none")? "":"none";
     document.getElementById("idDivHist").style.display = document.divVisibility["idDivHist"];
     if (document.divVisibility["idDivHist"] != "none") startRefresh();
  }   
}
function released_btnBrConShow(s) {
  if (s) {
    var id=document.getElementById(document.TABS_autoexp.id).parentNode.id;
    document.divVisibility[id]="";
    document.getElementById(id).style.display="";
    onClickTabs(document.TABS_autoexp.id,document.TABS_autoexp.n);
  } else {
    document.divVisibility["idDivExposGamma"]=(document.divVisibility["idDivExposGamma"] == "none")? "":"none";
    document.getElementById("idDivExposGamma").style.display = document.divVisibility["idDivExposGamma"];
  }   
}

function released_btnColorShow(s) {
  if (s){
    document.divVisibility["idWhiteBalance"]=(document.divVisibility["idWhiteBalance"] == "none")? "" : "none";
    document.getElementById("idWhiteBalance").style.display = document.divVisibility["idWhiteBalance"];
  } else {
    document.divVisibility["idDivColors"]=(document.divVisibility["idDivColors"] == "none")? "" : "none";
    document.getElementById("idDivColors").style.display = document.divVisibility["idDivColors"];
  }   
}


function released_btnPhotoShow(s) {
  if (s ==3)  {
     var id=document.getElementById(document.TABS_video.id).parentNode.id;
     document.divVisibility[id]="";
     document.getElementById(id).style.display="";
     onClickTabs(document.TABS_video.id,document.TABS_video.n);
  } else if (s==2) {
    document.divVisibility["idDivVideo"]=(document.divVisibility["idDivVideo"] == "none")? "":"none";
    document.getElementById("idDivVideo").style.display = document.divVisibility["idDivVideo"];
  } else if (s==1) {
     var id=document.getElementById(document.TABS_photo.id).parentNode.id;
     document.divVisibility[id]="";
     document.getElementById(id).style.display="";
     onClickTabs(document.TABS_photo.id,document.TABS_photo.n);
  } else {
    document.divVisibility["idDivCameraImage"]=(document.divVisibility["idDivCameraImage"] == "none")? "":"none";
    document.getElementById("idDivCameraImage").style.display = document.divVisibility["idDivCameraImage"];
    if (document.divVisibility["idDivCameraImage"]!="none") startRefresh();
  }
  showWindow();   
}

// for now - do the same both sub-buttons. Add more stuff later
// onClickTabs(document.TABS_network.id,((document.TABS_network.n+1)-1));


function released_btnNetworkShow1(s) {
  if (s) {
    var id=document.getElementById(document.TABS_webcams.id).parentNode.id;
    document.divVisibility[id]="";
    document.getElementById(id).style.display="";
    onClickTabs(document.TABS_webcams.id,document.TABS_webcams.n);
    
  } else {
    var id=document.getElementById(document.TABS_network.id).parentNode.id;
    document.divVisibility[id]="";
    document.getElementById(id).style.display="";
    onClickTabs(document.TABS_network.id,document.TABS_network.n);
  }   
}

// Making visibility of idExifInfo - same as idDivInfoPlus

function released_btnInfoShow(s) {
  if (s){
    document.divVisibility["idDivInfoPlus"]=(document.divVisibility["idDivInfoPlus"] == "none")? "":"none";
    document.getElementById("idDivInfoPlus").style.display = document.divVisibility["idDivInfoPlus"];
  } else {
    if (document.divVisibility["idDivInfoPlus"] != "none") {
        document.divVisibility["idDivInfoPlus"] = "none";
        document.getElementById("idDivInfoPlus").style.display = "none";
    }else{
     document.divVisibility["idDivInfo"]=(document.divVisibility["idDivInfo"] == "none")? "":"none";
     document.getElementById("idDivInfo").style.display = document.divVisibility["idDivInfo"];
    }
  }
  document.divVisibility["idExifInfo"]=document.divVisibility["idDivInfoPlus"];
  document.getElementById("idExifInfo").style.display = document.divVisibility["idExifInfo"];
}

///TODO: Add settings tab for snapfull.php
function released_btnSnapFull(s) {
  if (s) {
    alert ("SnapFull settings are not implemented yet");
    return;
  }
  var frame=gRequests.receivedFrame; /// not the actual snapshot frame, just generating different title name
  var url="/snapfull.php?sensor_port="+document.sensor_port; /// no parameters yet
  if (document.shiftKey) url+='?save';
  var win=window.open(url,'Elphel 393 Snapshot image'+document.sensor_port+":"+frame,'scrollbars=no,resizable=yes,toolbar=no,location=no,directories=no,menubar=no,status=no' );
}
function released_btnSettingsShow1(s) {
     document.divVisibility["idDivSettings"]=(document.divVisibility["idDivSettings"] == "none")? "":"none";
     document.getElementById("idDivSettings").style.display = document.divVisibility["idDivSettings"];
}
function released_btnPositioningShow(s) {
  if (s) {
    var id=document.getElementById(document.TABS_geometry.id).parentNode.id;
    document.divVisibility[id]="";
    document.getElementById(id).style.display="";
    onClickTabs(document.TABS_geometry.id,document.TABS_geometry.n);
  } else {
     document.divVisibility["idWindow"]=(document.divVisibility["idWindow"] == "none")? "":"none";
     document.getElementById("idWindow").style.display = document.divVisibility["idWindow"];
     if (document.divVisibility["idWindow"] != 'none') startRefresh();
  }   
}

function released_btnLanguage(s) {
  if      (s==5)  document.i18nLanguage="es";
  else if (s==4)  document.i18nLanguage="de";
  else if (s==3)  document.i18nLanguage="cn";
  else if (s==2)  document.i18nLanguage="ru";
  else if (s==1)  document.i18nLanguage="fr";
  else            document.i18nLanguage="en";
  setI18nAll();
}

function init_btnLanguage(lang) {
  document.i18nLanguage=lang;
  var s=0; //en
  if (lang=="fr") s=1;
  else if (lang=="ru") s=2;
  else if (lang=="cn") s=3;
  else if (lang=="de") s=4;
  else if (lang=="es") s=5;
  setI18nAll();
  setBuTtonState("btnLanguage",s);
}
/*
//  if ((document.body) && (document.body.style.cursor == "help")) contextHelp(e);
  if (document.contextHelpOn) contextHelp(e);

*/

function released_btnHelpShow(s) {

 if (s==0) {
//   if (document.body.style.cursor!="help") {
   if (!document.contextHelpOn) {
     document.body.style.cursor="help";
     document.getElementById("idTooltips").style.display="";
     document.contextHelpOn=1;
   } else {
     document.body.style.cursor="";
     document.getElementById("idTooltips").style.display="none";
     document.contextHelpOn=0;
   }  
  } else if (s==1) { // just help
     document.divVisibility["idDivHelp"]=(document.divVisibility["idDivHelp"] == "none")? "":"none";
     document.getElementById("idDivHelp").style.display = document.divVisibility["idDivHelp"];
  }else if (s==2) { //license
     document.divVisibility["idDivLicense"]=(document.divVisibility["idDivLicense"] == "none")? "":"none";
     document.getElementById("idDivLicense").style.display = document.divVisibility["idDivLicense"];
  }
}


/*
function createButton (id,          // id of DIV tag to make a button of
                       widthHeight, // {w:xxx, h:yyy} - if empty will use the ones specified in DIV in HTML code
                       imageURL,    // URL of the image file name. Should consist of equal size images of the (WxH - see widthHeight)
                                    // with the each column corresponding to one button, rows - different button states
                       buttonNum,   // number of button column in imageURL (starting from 0)
                       buttonType,  // "" - just a single static image, no changes              
                                    // "b" - regular button with two states - released (row 0) and pressed (row 1)
                                    //  - removed- "tN" (N - number, may be empty) - toggle between N ( "t", "t1" parsed as "t2") states on each mouseDown
                                    // "TN" (N - number, may be empty) - toggle between N ( "t", "t1" parsed as "t2") states on each mouseUp,
                                    //      mousedown just turnes button to next row as "pressed"
                                    //  - removed- "dN" - drop-down of N buttons, no pressed state. With the long press the whole column is displayed,
                                    //      the one on which the mouse was released stays
                                    // "DN" - drop-down, each button has pressed state in the next column (so button uses 2 column/numbers)
                      dropdownMask, //string of "0" and "1" showing which button will stay after drop-down released              
                                    // if buttonType="", dropdownMask can specify the row of static buttons to make the overall image more compact
                      actOnPress,   // action on press ("alert("id="+id+" state="+state);" will show button id (see first argument) and state for
                                    // toggle/drop-down buttons. Should not use " inside, just '
                      actOnEarlyRelease, // - after short hold
                      actOnHold,    // - after long hold timer expires (automatic for drop-down)
                      actOnLateRelease, // if "*" - use actOnEarlyRelease
                      actOnDblClick)
// in actions you may use variable "simulated" - it will be true if the button was not really clicked, but rather software "clicked"
function clickBuTton(id) // simulate mouse click (for now - don't care on where to release - anyway no long press)
function setBuTton (id,ns)  // .n - number, .s - state (row) - will not change internal number/ actions associated with it
function getBuTton (id) // returns {n:xx, s:yy}
setBuTtonState(id,state)

relies on global:
  document.buttonHoldDelay = 500; //1000; // ms to consider button long-pressed
  document.doubleclickDelay=300; //ms

*/

function initToolTips() {
    createTooltips ("idTooltips",
                    8, //w, // size of a rounding element (corner will be twice bigger)
                    "images/tooltips65x160.png?_TIMESTAMP_", //url, // for all the images (0/25/50/75/100%)
                    "fffdd0", //color, // will be used for semitransparent colors (0/25/75/100%) (currently "fffdd00"
                    "images/bg_", //color_prefix, // currently "images/bg_" ->images/bg_fffdd0_25.png?_TIMESTAMP_
                    600);///maxwidth) { // width can be limited by the outer bow size, but this is the maximum it will go if the outer box is big
                    
}



function initNetworkTabs() {
  createTabs ("idNetworkTabs",
              8,
              document.webcamsTabs,
              "images/tabs16x24",
              ".png?_TIMESTAMP_",
              document.tabsShape,
              "showWindow()",           // call on tabs change
              true);                    // do tresize parent div that is supposed to have only tabs (headers and bodies)
}

function initSettingsTabs() {
  createTabs ("idSettingsTabs",
              8,
              document.settingsTabs,
              "images/tabs16x24",
              ".png?_TIMESTAMP_",
              document.tabsShape,
              "showWindow()",           // call on tabs change
              true);                    // do tresize parent div that is supposed to have only tabs (headers and bodies)
}

function setInitialTranslucencyButtons() {
   if      (document.translucency<0)   clickBuTton("btnTranslNo");
   else if (document.translucency<25)  clickBuTton("btnTransl0");
   else if (document.translucency<50)  clickBuTton("btnTransl25");
   else if (document.translucency<75)  clickBuTton("btnTransl50");
   else if (document.translucency<100) clickBuTton("btnTransl75");
   else                                clickBuTton("btnTransl100");
}
function setInitialMagnifierModeButtons() {
   if      (document.MagnifierMode==0) clickBuTton("btnMagnifierNo");
   else if (document.MagnifierMode==1) clickBuTton("btnMagnifierFrameless");
   else                                clickBuTton("btnMagnifierFramed");
}


// call library function setI18n() and then do what should be done after changing the language
function setI18nAll() { 
 setI18n();
 showPixPerc();
 showWindow();
}

document.clickableTextStyles={h:"font-weight:bold; color:#000000",o:"color:#666666;"};
document.windowsDimRelative=1;
document.pixPerc=new Array ("idWindow_frAmeselT_Left_pxpc",
                            "idWindow_frAmeselT_Top_pxpc",
                            "idWindow_frAmeselT_Width_pxpc",
                            "idWindow_frAmeselT_Height_pxpc",
                            "idAexp_frAmeselT_Left_pxpc",
                            "idAexp_frAmeselT_Top_pxpc",
                            "idAexp_frAmeselT_Width_pxpc",
                            "idAexp_frAmeselT_Height_pxpc",
                            "*idWindow_frAmesel",
                            "*idAexp_frAmesel");



function showPixPerc() {
  var pixLoc=(document.windowsDimRelative)?"%":document.getElementById("idPixel").innerHTML; // local name for "pix"
  var i;
  for (i=0; i<document.pixPerc.length;i++) {
      if (document.pixPerc[i].substr(0,1) !="*"){
         document.getElementById(document.pixPerc[i]).innerHTML=pixLoc;
      }   
      else frAmeselSetRelative (document.pixPerc[i].substr(1),document.windowsDimRelative);
  }    
 showWindow(); // if size changed after switching
  
}

function pix2perc1(a) {
 var i;
 var s = ((a=="h") || (a=="d"))? document.clickableTextStyles.h : document.clickableTextStyles.o;
 if      ((a=="h") || (a=="o") || (a=="u")) {
   for (i=0; i<document.pixPerc.length;i++) if (document.pixPerc[i].substr(0,1) !="*") document.getElementById(document.pixPerc[i]).setAttribute(document.setAttrStyle,s);
 } else if (a=="d") {
   document.windowsDimRelative=!document.windowsDimRelative;
   showPixPerc();
 }  
 showWindow(); // if size changed after switching
}

function ShowIdWindow(){ShowIdWindowOrAe(true);}
function ShowIdWindowOrAe(WndNotAe) { // true - window, false - AE
 var wasWndNotAe= (document.getElementById("idAexp_frAmeselT_WH").style.display == "none");
  if (WndNotAe) {
      document.getElementById("idWindow_frAmeselT_WH").style.display = "";
      document.getElementById("idAexp_frAmeselT_WH").style.display = "none";
      document.getElementById("idWindow_frAmeselT_U").style.display = "";
      document.getElementById("idAexp_frAmeselT_U").style.display = "none";
// see if the matching tab was opened. If yyes - switch to the new one, matching the new selection
      if ((!wasWndNotAe) && (document.getElementById(document.TABS_autoexp.id+"_div"+(document.TABS_autoexp.n+1)).offsetHeight > 0)) {
        onClickTabs(document.TABS_geometry.id,document.TABS_geometry.n); // show it
      } 
  
  } else {
      document.getElementById("idWindow_frAmeselT_WH").style.display = "none";
      document.getElementById("idAexp_frAmeselT_WH").style.display = "";
      document.getElementById("idWindow_frAmeselT_U").style.display = "none";
      document.getElementById("idAexp_frAmeselT_U").style.display = "";
      if ((wasWndNotAe) && (document.getElementById(document.TABS_geometry.id+"_div"+(document.TABS_geometry.n+1)).offsetHeight > 0)) {
        onClickTabs(document.TABS_autoexp.id,document.TABS_autoexp.n);
      } 
  }
  
  showWindow();
}
// todo - make it work with other items too
function    showMoreLess() {
// for autoexposuer
  if (document.getElementById(document.TABS_autoexp.id+"_div"+(document.TABS_autoexp.n+1)).offsetHeight > 0) { // visible on screen now
    document.getElementById("idAexp_frAmeselT_more").style.display="none";
    document.getElementById("idAexp_frAmeselT_less").style.display="";
  } else {
    document.getElementById("idAexp_frAmeselT_more").style.display="";
    document.getElementById("idAexp_frAmeselT_less").style.display="none";
  }
// for navigator  
  if (document.getElementById(document.TABS_geometry.id+"_div"+(document.TABS_geometry.n+1)).offsetHeight > 0) { // visible on screen now
    document.getElementById("idWindow_frAmeselT_more").style.display="none";
    document.getElementById("idWindow_frAmeselT_less").style.display="";
  } else {
    document.getElementById("idWindow_frAmeselT_more").style.display="";
    document.getElementById("idWindow_frAmeselT_less").style.display="none";
  }
// for video streamer  
  if (document.getElementById(document.TABS_video.id+"_div"+(document.TABS_video.n+1)).offsetHeight > 0) { // visible on screen now
    document.getElementById("idDivVideo_more").style.display="none";
    document.getElementById("idDivVideo_less").style.display="";
  } else {
    document.getElementById("idDivVideo_more").style.display="";
    document.getElementById("idDivVideo_less").style.display="none";
  }
}

function moreLess(whch,eventType) {

// if      (whch=="w") id="idWindow_frAmeselT_";
// else if (whch=="a") id="idAexp_frAmeselT_";
 var i=whch.indexOf("moreLess");
 if (i<0) {
   alert ("no 'moreLess' in "+whch+" eventType="+eventType);
   return;
 }
 var id=whch.substr(0,i);
// document.title+=whch;
// else {alert("error 1 in moreLess()");return;}
// document.title+="/"+id+"moreLess";

 var s = ((eventType=="h") || (eventType=="d"))? document.clickableTextStyles.h : document.clickableTextStyles.o;
 if      ((eventType=="h") || (eventType=="o") || (eventType=="u")) document.getElementById(id+"moreLess").setAttribute(document.setAttrStyle,s);
 else if (eventType=="d") {
  if (id=="idWindow_frAmeselT_") {
//  document.title+=">>W<<";
   if (document.getElementById(document.TABS_geometry.id+"_div"+(document.TABS_geometry.n+1)).offsetHeight > 0){
    document.divVisibility["idDivSettings"]= "none";
    document.getElementById("idDivSettings").style.display="none"; // just hide it, the rest will be done by showMoreLess() called from showWindow
     
   } else {
    document.divVisibility["idDivSettings"]= "";
    document.getElementById("idDivSettings").style.display=""; // show it so onClickTabs can correctly calculate height
//document.title+=  document.TABS_geometry.id +"/"+document.TABS_geometry.n;   
     onClickTabs(document.TABS_geometry.id,document.TABS_geometry.n); // show it
   }
   
  } else if (id=="idAexp_frAmeselT_") {
//   document.title+=">>A<<";
   if (document.getElementById(document.TABS_autoexp.id+"_div"+(document.TABS_autoexp.n+1)).offsetHeight > 0) {
     document.divVisibility["idDivSettings"]= "none";
     document.getElementById("idDivSettings").style.display="none"; // just hide it, the rest will be done by showMoreLess() called from showWindow
   } else {
     document.divVisibility["idDivSettings"]= "";
     document.getElementById("idDivSettings").style.display=""; // show it so onClickTabs can correctly calculate height
//document.title+=  document.TABS_autoexp.id +"/"+document.TABS_autoexp.n;   
     onClickTabs(document.TABS_autoexp.id,document.TABS_autoexp.n); // show it
   }  
  } else if (id=="idDivVideo_") {
//   document.title+=">>A<<";
   if (document.getElementById(document.TABS_video.id+"_div"+(document.TABS_video.n+1)).offsetHeight > 0) {
     document.divVisibility["idDivSettings"]= "none";
     document.getElementById("idDivSettings").style.display="none"; // just hide it, the rest will be done by showMoreLess() called from showWindow
   } else {
     document.divVisibility["idDivSettings"]= "";
     document.getElementById("idDivSettings").style.display=""; // show it so onClickTabs can correctly calculate height
//document.title+=  document.TABS_autoexp.id +"/"+document.TABS_autoexp.n;   
     onClickTabs(document.TABS_video.id,document.TABS_video.n); // show it
   }
  }// else   document.title+=">>???<<";

 } else {alert("error 2 in moreLess()");return;}
 showWindow();
}

function ignoreStreamerClicked() {
  document.ignoreStreamer=!document.ignoreStreamer;
  ignoreStreamerShow();
}
function ignoreStreamerShow() {
///  setBuTtonState("idIgnoreStreamer_CB",document.ignoreStreamer?1:0)
  frAmeselSetResizeEn('idWindow_frAmesel', (gPRoot["comp_run"].getValue() != 'run') || document.ignoreStreamer);
}

function updateFPSLimit() {
  document.fpslim= (getBuTton("idVideoLimitFPS_CB").s!=0)?1:0;
  document.fpsmtn= (getBuTton("idVideoMaintainFPS_CB").s!=0)?1:0;
  var fp1000s=1000*parseFloat(document.getElementById("idVideoFPSLimit_TX").value);
  if (!((fp1000s>=1) && (fp1000s<50000))) fp1000s=1000*document.userFps;
  document.userFps=0.001*fp1000s;
  updateFields(); // FIXME: make new function
  showFPSLimit();
  setInfoFPS();
  if ((document.getElementById(document.TABS_video.id).style.display != "none") &&
      (getSelectedTab(document.TABS_video.id)==document.TABS_video.n)){
//      alert ("updateFPSLimit:"+document.TABS_video.id+"/"+document.TABS_video.n);
       onClickTabs(document.TABS_video.id,document.TABS_video.n); // show it if the height changed
  }     
}     
function showFPSLimit() {
  document.getElementById("idVideoFPSLimitAll").style.display=document.fpslim?"":"none";
  setBuTtonState("idVideoLimitFPS_CB",document.fpslim?1:0);
  setBuTtonState("idVideoMaintainFPS_CB",document.fpsmtn?1:0);
  document.getElementById("idVideoFPSLimit_TX").value=document.userFps;
}     

function timeoutsChanged() { /// disabled in 8.0
/*
     document.ccs.cmd.timeout=      parseInt(document.getElementById("idTimeoutCmd_TX").value);
     document.ccs.rstat.timeout=    parseInt(document.getElementById("idTimeoutStat_TX").value);
     document.ccs.aecmd.timeout=    parseInt(document.getElementById("idTimeoutAecmd_TX").value);
     document.ccs.aestat.timeout=   parseInt(document.getElementById("idTimeoutAestat_TX").value);
     document.ccs.img.timeout=      parseInt(document.getElementById("idTimeoutImg_TX").value);
     document.hist.timeout=     parseInt(document.getElementById("idTimeoutHist_TX").value);
     document.ccs.quarentineTimeout=parseInt(document.getElementById("idTimeoutQuar_TX").value);
*/
}

function setTimeouts() { /// disabled in 8.0
/*
     document.getElementById("idTimeoutCmd_TX").value=    document.ccs.cmd.timeout;
     document.getElementById("idTimeoutStat_TX").value=   document.ccs.rstat.timeout;
     document.getElementById("idTimeoutAecmd_TX").value=  document.ccs.aecmd.timeout;
     document.getElementById("idTimeoutAestat_TX").value= document.ccs.aestat.timeout;
     document.getElementById("idTimeoutImg_TX").value=    document.ccs.img.timeout;
     document.getElementById("idTimeoutHist_TX").value=   document.hist.timeout;
     document.getElementById("idTimeoutQuar_TX").value=   document.ccs.quarentineTimeout;
*/
}

//configs


function showIps() {
// var d=parseInt(document.getElementById("idConfNetBOOTPROTO_TX").value)?"none":"";
 var d=  getBuTton("idConfNetBOOTPROTO_CB").s?"none":"";

 document.getElementById("idConfNetIPAll").style.display=d;
 document.getElementById("idConfNetNETMASKAll").style.display=d;
 document.getElementById("idConfNetBROADCASTAll").style.display=d;
 document.getElementById("idConfNetGATEWAYAll").style.display=d;
 
 onClickTabs(document.TABS_network.id,document.TABS_network.n);

}

// -----------
/*

*/

function autofillWebCam() {
  var wnd=frAmeselGetInner ("idWindow_frAmesel");  
// adjust window size (after decimation, actual) to multiple of 16x16 pixels
  wnd.w=document.dcm.dh*16*Math.round(wnd.w/document.dcm.dh/16);
  wnd.h=document.dcm.dv*16*Math.round(wnd.h/document.dcm.dv/16);
  var opt=getCommonURL();
  opt= ((opt.indexOf("c")>0)?"c":"")+
       ((opt.indexOf("x")>0)?"x":"")+
       ((opt.indexOf("y")>0)?"y":"");

  document.getElementById("idConfWebQUALITY_TX").value=gPRoot['iq'].getValue();
  document.getElementById("idConfWebOPT_TX").value=opt;
  document.getElementById("idConfWebDH_TX").value=document.dcm.dh; 
  document.getElementById("idConfWebDV_TX").value=document.dcm.dv; 
  document.getElementById("idConfWebBH_TX").value=((document.dcm.bh)?document.dcm.bh:1); 
  document.getElementById("idConfWebBV_TX").value=((document.dcm.bv)?document.dcm.bv:1); 
  document.getElementById("idConfWebSENS_TX").value=parseFloat(getSliderValue("gainGreen_slIder"));

/*!FIXME 8.0  
  if (document.whiteBalanceEnabed) {
    document.getElementById("idConfWebRSCALE_TX").value="auto";
    document.getElementById("idConfWebBSCALE_TX").value="auto";
  } else {
    document.getElementById("idConfWebRSCALE_TX").value=parseFloat(getSliderValue("gainRed2Green_slIder"));
    document.getElementById("idConfWebBSCALE_TX").value=parseFloat(getSliderValue("gainBlue2Green_slIder"));
  }
*/
  document.getElementById("idConfWebPXL_TX").value= gPRoot['pxl'].getValue(); // not adjusted yet - needs additional control  !!
  document.getElementById("idConfWebWBTH_TX").value= 250; // not adjusted yet - needs additional control !!
  document.getElementById("idConfWebWBPC_TX").value= 1.0; // not adjusted yet - needs additional control !!
   var csat=     parseFloat(getSliderValue("colorSat_slIder"));
   var dsat=     parseFloat(getSliderValue("colorDiffSat_slIder"));
  
  document.getElementById("idConfWebCSR_TX").value=Math.round(100* csat*((dsat>0)?(1-dsat):1));
  document.getElementById("idConfWebCSB_TX").value=Math.round(100* csat*((dsat>0)?1:(1+dsat)));
  document.getElementById("idConfWebGAM_TX").value=Math.round(parseFloat(getSliderValue("gamma_slIder")) * 100);
  document.getElementById("idConfWebE_TX").value=Math.round(parseFloat(getSliderValue("exposure_slIder")) * 10);
  document.getElementById("idConfWebWW_TX").value=wnd.w;
  document.getElementById("idConfWebWH_TX").value=wnd.h;
  document.getElementById("idConfWebWL_TX").value=wnd.l;
  document.getElementById("idConfWebWT_TX").value=wnd.t;
  
  configInputsChanged();
//  debugWindowShow(document.body.innerHTML);  
}


function autofillWebCamAexp() {
  document.getElementById("idConfWebAEXPEN_TX").value=getBuTton("idAexpOn_CB").s;
  setBuTtonState("idConfWebAEXPEN_CB", getBuTton("idAexpOn_CB").s);
  var wnd=frAmeselGetInner ("idAexp_frAmesel");  
  document.getElementById("idConfWebAEXPW_TX").value=Math.round(100*wnd.w/gPRoot['ww'].getValue());
  document.getElementById("idConfWebAEXPH_TX").value=Math.round(100*wnd.h/gPRoot['wh'].getValue());
  document.getElementById("idConfWebAEXPX_TX").value=Math.round(100*((gPRoot['ww'].getValue() > wnd.w)?(wnd.l/(gPRoot['ww'].getValue() - wnd.w)):0.5 ));
  document.getElementById("idConfWebAEXPY_TX").value=Math.round(100*((gPRoot['wh'].getValue() > wnd.h)?(wnd.t/(gPRoot['wh'].getValue() - wnd.h)):0.5 ));
  document.getElementById("idConfWebAEXPME_TX").value=Math.round(parseFloat (document.getElementById("idAEMax").value)*10);
  document.getElementById("idConfWebAEXPINDEX_TX").value=parseInt(getSliderValue("idAexpLevels_slIder"));
  document.getElementById("idConfWebAEXPPERCENT_TX").value=parseInt(getSliderValue("idAexpPercents_slIder"));
  configInputsChanged();
//  debugWindowShow(document.body.innerHTML);  
}

function startStopCcamftp(tid) {
  if (parseInt(document.getElementById(tid).value)) req_ccamftp("start");
  else req_ccamftp("stop");
}

//{id:"idUpgrade_BN",         n:27, t:"b",dm:"",   aop:"toggleUpgradeIframe();"},
//  <div id="idUpgrade" style="display:none;position:absolute;left:256;top:0;width:512;height:256;"></div>
/*
{id:"idDivInfo",         bg:"ffffff",         dspl:1,hoverSize: 19,crossSize:9,hoverURL:"images/close_cross_dim_19x19.png?_TIMESTAMP_",crossURL:"images/close_cross_9x9.png?_TIMESTAMP_",callback:"showWindow();"},

         createCloseCross (document.divShowList[i].id, //parent div id
                           document.divShowList[i].hoverSize, // size of overall (square) mouseover area that shows the cross
                           document.divShowList[i].crossSize, // size of cross image (square) in the middle of hover area
                           document.divShowList[i].hoverURL,  // hover image url (faint, barely visible cross)
                           document.divShowList[i].crossURL,  // cross that appears when mouse is over hover area
                           document.divShowList[i].callback   // function to me called when the cross is pressed (after hiding itself and parent element)
                           );

*/
function toggleUpgradeIframe(){
 createUpgradeIframe(document.getElementById("idUpgrade").style.display=="none");
}
//document.upgradeHTML="/upgrade.html";
//document.upgradeBg="#ffbbbb";
function createUpgradeIframe(c){
  if (c) {
//make it high enough or)
    document.getElementById("idUpgrade").style.display="";
    document.getElementById("idUpgrade").style.backgroundColor=document.upgradeBg;
    showWindow();
    document.getElementById("idUpgrade_iframe").innerHTML="<IFRAME src=\""+document.upgradeHTML+"\" width=\""+parseInt (document.getElementById("idUpgrade").style.width)+"\" "+
    "height=\""+parseInt (document.getElementById("idUpgrade").style.height)+"\" scrolling=\"auto\" frameborder=\"0\">\n"; 
  } else {
    document.getElementById("idUpgrade_iframe").innerHTML="";
    document.getElementById("idUpgrade").style.display="none";
    showWindow();
  }
}

function initUpgradeIframe() {
           createCloseCross ("idUpgrade", //parent div id
                           19, // size of overall (square) mouseover area that shows the cross
                           9, // size of cross image (square) in the middle of hover area
                           "images/close_cross_dim_19x19.png?_TIMESTAMP_",  // hover image url (faint, barely visible cross)
                           "images/close_cross_9x9.png?_TIMESTAMP_",  // cross that appears when mouse is over hover area
                           "createUpgradeIframe(false);"   // function to be called when the cross is pressed (after hiding itself and parent element)
                           );

}


// {id:"idTest1_BN",         n:27, t:"b",dm:"",   aop:"test1();"},
function test1() {
//idMagnifier
//debugWindowShow(  document.getElementById("idSettingsTabs_div2").innerHTML);
  alert(document.getElementById("idVideoViewer").innerHTML+"\n\n"+document.getElementById("idVideoObject").frame+"\nerror="+document.getElementById("idVideoObject").error+"\nrun="+document.getElementById("idVideoObject").run);
 if (document.shiftKey) {
   document.getElementById("idVideoObject").run=1;
 }
//alertStreamer();
}

function configsNumberById(id) { // find index of the array record about config variable by its id fireld
  var i;
  for (i=0;i<document.configsData.length;i++) if (document.configsData[i].id==id) return i;
  return -1;
}

function initControlsFromVars() {
  setBuTtonState("idSetDebugHelp_CB",document.debugHelp?1:0);
  setBuTtonState("idSetDebugRequests_CB",document.debugRequests?1:0);
  setInitialTranslucencyButtons();
  setInitialMagnifierModeButtons();
  setInitialVideoModeButtons();
 // after the next commands slider (and document.MagnifierZoom) will show 4.0, while actual zoom will be 1.0;
   setSliderAndText("MagnifierZoom_slIder", document.MagnifierZoom); document.MagnifierZoom=1.0;  changeMagnifier(true); showWindow();  document.MagnifierZoom=document.MagnifierZoomDefault;  //
  setBuTtonState("idEnableImageRefresh_CB",document.imageEnabled?1:0);
  document.getElementById("idEnableImageRefreshFor_TX").value = Math.round(gRequests.refreshDuration/100)/10;
  document.getElementById("idSetDebugOther_TX").value = document.debug;
//  setBuTtonState("idShowAexpFrame_CB",document.showAexpFrame?1:0);
//  document.getElementById("idCBEnableHistogramRefresh").checked=document.histogramEnabled;
  setBuTtonState("idEnableHist_CB",document.histogramEnabled);
  gInterface.initHistControls();
//  document.getElementById("idExtraReadsAfterWrite_TX").value=document.extraReadsAfterWrite;
  setSliderAndText("Quality_slIder", document.qualityDefault);
  setSliderAndText("blackLev_slIder", document.blackLevDefault);

//dvr
  setBuTtonState("idDVRLoop_CB",    document.dvrDefaultModes.loop?1:0);
  setBuTtonState("idDVRNextPlay_CB",document.dvrDefaultModes.cont?1:0);
  document.getElementById("idDVRServer_TX").value = document.dvrDefaultModes.server;
  enableSlider("idDVRSlider_slIder",0); //disable until registered
  setBuTtonState("idTranspTooltips_CB",document.transparentTooltips);
    
  ignoreStreamerShow();
  showStreamerRunning();
//  setBuTtonState("idIgnoreStreamer_CB",document.ignoreStreamer?1:0);
//  setBuTtonState("idFlipHor_CB",document.flipX?1:0); // not needed - should be set from camera;
//  setBuTtonState("idFlipVert_CB",document.flipY?1:0);
//  setBuTtonState("idShortcut_AE_CB",document.AeShortcut?1:0);
  ShowIdWindowOrAe(true); // show window selection, not autoexposure window
//  document.getElementById("idWindow_frAmesel_frameBorder").onmousedown=ShowIdWindow;
  showFPSLimit();
  setTimeouts();
  document.getElementById("idDVRMaxFileSize_TX").value = document.dvrDefaultModes.maxFileSize;
  document.getElementById("idDVRMaxFileDuration_TX").value = document.dvrDefaultModes.maxFileDur;
  document.transparentTooltips=0;
//  document.AeLevelToDisplay=document.AeLevelToDisplayDefault;
//  setSliderAndText("idAexpMonitor_slIder", document.AeLevelToDisplay);
  document.getElementById("idDVRSliderDelay_TX").value = document.playbackUpdateInterval;


}

//

function initOnLoad() {
  var url=location.href;
  if (url.indexOf("highBandwidth")>=0) document.highBandwidth=1;
  if (url.indexOf("//192.")>=0) document.highBandwidth=1;
  if (url.indexOf("//10.")>=0) document.highBandwidth=1;
  // NC393: need to read sensor_port=<0..3> parameter
  document.sensor_port = 0;
  if (url.indexOf("sensor_port=")>=0) {
	  document.sensor_port = parseInt(url.substr(url.indexOf("sensor_port=")+12,1), 10);
  }
  
  initVideoPlugin();

  initInterface();
  initMouseActions();
  createAllslIders();
  initNetworkTabs(); // will call showWindow();
  initSettingsTabs(); // will call showWindow();
  createCrosses ();

  initAllConfigs(); // should be before initButtons() ansd i18n
  initButtons(); // should be after createCrosses - onmouse functions are not copied in parentNode.innerHTML (not in FF at least)
  initMagnifier();
  initCameraFrameSel ();
  initAexpFrame();
//  initCameraAexpSel ();
  showDefaultVisibilty();
//  startRefresh();
//  initControlsFromVars();
  if (url.indexOf("lang=")>0) document.i18nLanguage=url.substr(url.indexOf("lang=")+5,2)
  else document.i18nLanguage="en";
  init_btnLanguage(document.i18nLanguage);
  initToolTips();
  if (url.indexOf("reload=0")<0) {
    if (url.indexOf("?")<0) url+="?reload=0";
    else                    url+="&reload=0";
    if ((!window.opener) ||(typeof(window.opener)=="undefined")) {
      if (window.confirm(document.getElementById("h_reload").innerHTML)) {
// unique window name (per url) so multiple cameras can be opened (url.substr(7) - just to skip 'http://')
        win=window.open(url,'Elphel 393 '+url.substr(7)+":"+document.sensor_port.toString(),'scrollbars=no,resizable=yes,toolbar=no,location=no,directories=no,menubar=no,status=no' );
        if (win) {
          win.focus();
          parent.window.location="closeme.html";// if did not close
        }  
      } // user rejected 
    } // else we are already loaded as a pop-up
  }
  document.EnableResise=true;
  startRefresh();
  initControlsFromVars();
//  debugWindowShow(  document.getElementById("idNetworkTabs_div1").innerHTML);
//alert(document.TABS_network.id+"_div"+(document.TABS_network.n+1)+"_readAll");
  pressedConfigsRw(document.TABS_network.id+"_div"+(document.TABS_network.n+1)+"_readAll"); // as if pressed readAll button
  //idNetworkTabs_div1_readAll
  
  //debugWindowShow(document.getElementById("idSettingsTabs_div2").innerHTML);
//  debugWindowShow(  document.getElementById("idWindow").innerHTML);
//  debugWindowShow(  document.getElementById("idSettingsTabs_div3").innerHTML);
//  debugWindowShow(  document.getElementById("idSettingsTabs_div4").innerHTML);
//  showPixPerc(); // will be called by setI18nAll;
initUpgradeIframe();
  document.title=document.getElementById("h_idTitle").innerHTML+":'"+document.sensor_port+"'";
  restoreTabsState(false); // open tabs at specific initial position
  document.getElementById("idStartup").style.display="none";
// debugWindowShow(  document.getElementById("idNetworkTabs_div4").innerHTML);
// debugWindowShow(  document.getElementById("idDivExposGamma").innerHTML);
// debugWindowShow(  document.getElementById("idUpgrade").innerHTML);
// debugWindowShow(document.getElementById("idDivDVR").innerHTML);
// debugWindowShow(document.getElementById("test_f1").innerHTML);
  initShieldButtons();
  hideStreamPage();
  document.getElementById("idDVRSoftware").href=document.DVRSoftware;

}
