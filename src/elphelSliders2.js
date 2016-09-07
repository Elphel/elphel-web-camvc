/*
*! -----------------------------------------------------------------------------**
*! elphelSliders.js
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
*!  $Log: elphelSliders2.js,v $
*!  Revision 1.6  2008/12/13 23:39:16  elphel
*!  typo
*!
*!  Revision 1.5  2008/12/10 03:06:07  elphel
*!  Additional non-linear slider modes (there were only linear and logarithmic) to stretch scale near 100%
*!
*!  Revision 1.4  2008/12/09 19:25:17  elphel
*!  After disabling default actions onmousedown - enabled all input text fields:  onmousedown="this.select()" (otherwise they did not get focus when clicking them)
*!
*!  Revision 1.3  2008/12/09 16:29:54  elphel
*!  Added event.preventDefault() here and there. Really helped - with the current FF buttons were dragged away like images (before I could only fight it using background images, not the regular ones)
*!
*!  Revision 1.2  2008/12/07 23:07:17  elphel
*!  Fixing few remaining "fights" between user and the camera (when some parameter is changed and camera changes it back)
*!
*!  Revision 1.1.1.1  2008/11/27 20:04:03  elphel
*!
*!
*!  Revision 1.2  2008/11/10 19:48:47  elphel
*!  blocking text fields updates while they are in focus
*!
*!  Revision 1.1  2008/04/22 22:21:31  elphel
*!  Started camvc2 that currently uses most of the same images and javascript files as camvc
*!
*!  Revision 1.1.1.1  2007/09/19 04:51:17  elphel
*!  This is a fresh tree based on elphel353-2.10
*!
*!  Revision 1.2  2007/09/19 04:51:17  elphel
*!  Upgraded license (header)
*!
*!
*/

/*
 * Create slider into an existent DIV element (the name should end with the "slIder"
 * It is convenient to use an array for initialization, as shown in the code above - createAllslIders()
 */

document.slIderDragging=false; // for some reasons without such assignment (only functions) none of the functions gets visible
function createSlider (id, //my1_slIder -should end with "_slIder"
                       buttonWidth, // there will be a image button to the left of the slider
                       buttonUrl, //supports switching between *.* and *_press.* (fixed some problems in original code
                       pointerWidth,  // width of the slider pointer
                       pointerUrl,    // url of the pointer image
//                       pointerDisabledURL, // pointer for the disabled slider (indicator only)
                       
                       sliderLength,   // length of a slider itself (the rest will be used fro input text field
                       railLeftUrl, // left end of rail image (should be same width as pointer_width)
                       railRightUrl, // right end of rail image (should be same width as pointer_width)
                       railMiddleUrl,// may be 1 pixel wide - will be streched as needed
                       dummyImageUrl, // 1x1 pixel transparent image to fill empty div (maybe will remove it)
                       textFieldSize,
                       textFieldMaxlen,
                       textFieldStyle,
                       textFieldUnits, // to be written after the input window
                       textFieldUnitsStyle,
                       lowLimit,
                       highLimit,
                       logarithm, /// 0 - linear, 1 - logarithmic scale, 2 - highLimit*Math.pow(k, lowLimit), 3 - highLimit*(1-Math.pow((1-k), lowLimit))
                       decimals, // number of decimals after the point in the text field
                       fineControl, // percents of the slider height used for fine control - positive - top, negative - bottom
// in the following actions id is defined as the outer DIV id. so "alert(id)" as the value will work
                       actionOnChange, // action to be "eval()" when slider is moved. id is defined as the outer DIV id
                       actionOnDone,   // action when text field is changed or slider button released
                       actionOnButton,      // action when (right) button is pressed
                       actionOnDoubleclick) {//action on slider double click (i.e. auto on/off)

 var h=document.getElementById(id).style.height;
 var iHTML= "";
//   <div id="my1_slIder" style="position:absolute; left:100; top:50; width:356; height:25;">
 if (buttonWidth>0) {
 iHTML+=
     '<div id="'+id+'_button" style="position:absolute; left:0; top:0; width:'+buttonWidth+'; height:'+h+';">\n';
 if (buttonUrl)
// if buttonURL is not specified - just the room will be left for the button that should be generated separately
 iHTML+=      '<img id="'+id+'_buttonImg" src="'+buttonUrl+'" onmousedown="slIderButtonMouse(this.id,'+"'on'"+',event);" onmouseup="slIderButtonMouse(this.id,'+"'off'"+',event);"/>\n';
      iHTML+='</div>\n';
 }     
 iHTML+=
     '<div id="'+id+'_slider" style="cursor:pointer;position:absolute; left:'+buttonWidth+'; top:0; width:'+sliderLength+'; height:'+h+';">\n'+
      '<div id="'+id+'_divbackground" style="position:absolute; left:0; top:0; width:'+sliderLength+'; height:'+h+';">\n'+
         '<div id="'+id+'_1" style="position:absolute; left:0; top:0; width:'+pointerWidth+'; height:'+h+';">\n'+
           '<img id="'+id+'_1i" src="'+railLeftUrl+'" style="width:'+pointerWidth+'; height:'+h+';">\n'+
         '</div>\n'+
         '<div id="'+id+'_2" style="position:absolute; left:'+pointerWidth+'; top:0; width:'+(sliderLength-2*pointerWidth)+'; height:'+h+';">\n'+
           '<img id="'+id+'_2i" src="'+railMiddleUrl+'" style="width:'+(sliderLength-2*pointerWidth)+'; height:'+h+';">\n'+
         '</div>\n'+
         '<div id="'+id+'_3" style="position:absolute; left:'+(sliderLength-pointerWidth)+'; top:0; width:'+pointerWidth+'; height:'+h+';">\n'+
           '<img id="'+id+'_3i" src="'+railRightUrl+'" style="width:'+pointerWidth+'; height:'+h+';">\n'+
         '</div>\n'+
      '</div>\n'+
      '<div id="'+id+'_divslider" style="position:absolute; left:0; top:0; width:'+pointerWidth+'; height:'+h+'; z-index:1;">\n'+
        '<img id="'+id+'_divsliderimg" src="'+pointerUrl+'" style="width:'+pointerWidth+';height:'+h+'">\n'+
      '</div>\n'+
      '<div id="'+id+'_divcover" style="position:absolute; left:0;top:0;width:100%;height:100%;z-index:2;" >\n'+
        '<img src="'+dummyImageUrl+'" style="width:1; height:1">\n'+
      '</div>\n'+
     '</div>\n'+
     '<div id="'+id+'_divText" style="float:right;">\n'+
       '<input type="text" id="'+id+'_Text" style="'+textFieldStyle+'"  size="'+textFieldSize+'" maxlength="'+textFieldMaxlen+'" value="" onChange="updateSliderFromTextID(this.id);" onfocus="this.myfocus=true;" onblur="this.myfocus=false;updateSliderFromTextID(this.id);"  onmousedown="this.select();" >\n';

 if (textFieldUnits) iHTML+=
      '<span id="'+id+'_Units" style="'+textFieldUnitsStyle+'">'+textFieldUnits+'</span>\n';
 iHTML+=
      '</div>\n'+
      '<input type="hidden" style="display:none" id="'+id+'_lastValueSet"  value="">\n'+
      '<input type="hidden" style="display:none" id="'+id+'_forceUpdate"  value="">\n'+
      '<input type="hidden" style="display:none" id="'+id+'_lowLimit"  value="'+lowLimit+'">\n'+
      '<input type="hidden" style="display:none" id="'+id+'_highLimit" value="'+highLimit+'">\n'+
      '<input type="hidden" style="display:none" id="'+id+'_logarithm" value="'+logarithm+'">\n'+
      '<input type="hidden" style="display:none" id="'+id+'_Decimals"     value="'+decimals+'">\n'+
      '<input type="hidden" style="display:none" id="'+id+'_actionOnChange" value="'+actionOnChange+'">\n'+
      '<input type="hidden" style="display:none" id="'+id+'_actionOnDone" value="'+actionOnDone+'">\n'+
      '<input type="hidden" style="display:none" id="'+id+'_actionOnDoubleclick" value="'+actionOnDoubleclick+'">\n'+
      '<input type="hidden" style="display:none" id="'+id+'_actionOnButton" value="'+actionOnButton+'">\n'+
      '<input type="hidden" style="display:none" id="'+id+'_fineControl" value="'+fineControl+'">\n'+
      '<input type="hidden" style="display:none" id="'+id+'_sliderValue" value="">\n'+
    '</div>\n';
// If you uncomment the following alert, it will show all the HTML code generated for each slider    
//    alert(iHTML);
  document.getElementById(id).innerHTML=iHTML;
  document.sliderTimerID=null;
}

/*
 * Functions for interaction with the slider. "id" here is the parent DIV id 
 */

/*
 * Set inernal value, slider and text to specified value
 */ 
function setSliderLow(id,value) {
  var v=getSliderValue(id);
  document.getElementById(id+"_lowLimit").value=value;
  setSliderAndText(id,v);
}
function setSliderHigh(id,value) {
  var v=getSliderValue(id);
  document.getElementById(id+"_highLimit").value=value;
  setSliderAndText(id,v);
}
function getSliderLow(id) {
  return document.getElementById(id+"_lowLimit").value;
}
function getSliderHigh(id) {
  return document.getElementById(id+"_highLimit").value;
}

function forceSliderAndText(id,value) {
//document.title+="+";
// if ((document.slIderDragging) && (document.slIderName==id)) return; // no updating position by external command while dragging
  setSliderValueOnly(id,value);
  document.getElementById(id+"_lastValueSet").value=document.getElementById(id+"_sliderValue").value; // to prevent triggering "onDone" "onChange" if the data did not change
  document.getElementById(id+"_forceUpdate").value=1; /// perform actOnDone in any case
  setSliderText(id);
  updateSliderFromValue(id);
  sliderActOnDone (id); /// Seeems nothing triggers it otherwise?
}

/**
 * @brief this function will not generate action on done if result will be the same as set here. See forceSliderAndText()
 * @param id slider Id
 * @param value value to set slider to
 */

function setSliderAndText(id,value) {
//document.title+="-";
 if ((document.slIderDragging) && (document.slIderName==id)) return; // no updating position by external command while dragging
  setSliderValueOnly(id,value);
  document.getElementById(id+"_lastValueSet").value=document.getElementById(id+"_sliderValue").value; // to prevent triggering "onDone" "onChange" if the data did not change
  document.getElementById(id+"_forceUpdate").value=0; /// only perform actOnDone if the velue will be different
  setSliderText(id);
  updateSliderFromValue(id);
//  sliderActOnDone (id);  
}

/*
 * returns float value
 */
// uses internal value of 0..1
function getSliderValue(id) {
  var llm=parseFloat(document.getElementById(id+"_lowLimit").value);
  var hlm=parseFloat(document.getElementById(id+"_highLimit").value);
  var v=parseFloat(document.getElementById(id+"_sliderValue").value);
if (document.debug & 128) document.title=id+":"+v;
  switch (document.getElementById(id+"_logarithm").value) {
    case '0':
      return llm+ v* (hlm-llm);
    case '1':
      llm=Math.log(llm);
      hlm=Math.log(hlm);
      return Math.exp(llm+ v* (hlm-llm));
    case '2':
      return hlm*Math.pow(v,llm);
    case '3':
      return hlm*(1.0-Math.pow((1.0-v),llm));
  }
}
 
// input - the i/o value from low to high limit, possibly with logarithmic scale
function setSliderValueOnly(id,v) { // only sets internal value (0..1)
  var llm=parseFloat(document.getElementById(id+"_lowLimit").value);
  var hlm=parseFloat(document.getElementById(id+"_highLimit").value);
  var pwr=llm;
  if (parseInt(document.getElementById(id+"_logarithm").value)>1) llm=0;
  if (!((v>=llm) && (v<=hlm))) {
    if      (v>hlm) v=hlm;
    else if (v<llm) v=llm;
    else v= (llm+hlm)/2;
  }
  switch (document.getElementById(id+"_logarithm").value) {
    case '0':
      break;
    case '1':
      llm=Math.log(llm);
      hlm=Math.log(hlm);
      v=  Math.log(v);
      break;
    case '2':
      v=Math.pow((v/hlm), 1.0/pwr);
      hlm=1.0;
      break;
    case '3':
      v=1.0-Math.pow((1-(v/hlm)), 1.0/pwr);
      hlm=1.0;
      break;
  }

  document.getElementById(id+"_sliderValue").value=(v-llm)/(hlm-llm);  
}


/*
 * set slider text field to match internal value (0..1)
 */ 
function setSliderText(id) {
  var rs=Math.pow(10,parseInt(document.getElementById(id+"_Decimals").value));
  if (document.getElementById(id+"_Text").myfocus!=true) document.getElementById(id+"_Text").value=Math.round(getSliderValue(id)*rs)/rs;
}

/*
 * redraw the slider to match the internal value
 */ 
function updateSliderFromValue(id) {
   v=parseFloat(document.getElementById(id+"_sliderValue").value)
   if (!((v>=0) && (v<=1))) {
     if (v>1) v=1;
     else if (v<0) v=0;
     else v=0.5; // (if NaN)
   }
if (document.debug & 128) document.title=document.slIderName;
   var sliderLength=  
   document.getElementById(id+"_divslider").style.left=
           Math.round((parseInt(document.getElementById(id+"_slider").style.width)-
                       parseInt(document.getElementById(id+"_divslider").style.width))*v);
}


/*
 * Find correct ID (it is that of the text input field when called), update internal value slider and possibly call action on "done"
 */
function updateSliderFromTextID (id) {
 var id;
 if (id.indexOf("slIder")>=0) {
   id=id.substr(0,id.indexOf("slIder"))+"slIder";
   setSliderValueOnly(id,parseFloat(document.getElementById(id+"_Text").value));
   updateSliderFromValue(id);
   sliderActOnDone (id);
 }
}


/*
 * Enable (true) or disables (false) slider from dragging  and the text field from changing - it still can be controlled by the  setSliderAndText(id,value)
 */

function enableSlider(id,en) {
  var sliderImg=document.getElementById(id+"_divsliderimg").src;
  var i=sliderImg.indexOf("_disabled");
  if (i>=0) sliderImg=sliderImg.substr(0,i)+sliderImg.substr(i+9); // remove "_disabled" if any
  if (!en) sliderImg=sliderImg.substr(0,sliderImg.lastIndexOf("."))+"_disabled"+sliderImg.substr(sliderImg.lastIndexOf("."));
  document.getElementById(id+"_divsliderimg").src= sliderImg;
  document.getElementById(id+"_Text").disabled= !en;
}
function isEnabledSlider(id) {return !document.getElementById(id+"_Text").disabled;}
//        '<img id="'+id+'_divsliderimg" src="'+pointerUrl+'" style="width:'+pointerWidth+';height:'+h+'">\n'+

/*
 * Simple function to get the <img> element ID for the button (if you need to change it .src, i.e. for the toggle action)
 */

function getSliderButtonID(id) {
  return id+"_buttonImg";
}

/*
 *
 * for direct access to the slider elements you may manually use the following suffixes of the element's IDs:
 *    _slIder - overall DIV element. May be "mouseover" between slider and the text field
 *    _slIder_divcover - covers all the slider itself (no button or text), but in IE will never trigger tooltips.
 *                       Instead use (in addition as other browsers will use _slIder_divcover):
 *    _slIder_2i - image of the middle part of the slider rails (let's not bother with the ends) and
 *    _slIder_divsliderimg - image of the slider pointer
 *    _slIder_buttonImg - button to the left of the slider (if it exists)
 *    _slIder_Text - text input field
 *    _slIder_Units - it is a <span> so title, style and innerHTML might be changed among others
 *
 */



/*
 * Below are private functions for the sliders functioning:
 */

/*
 * Here are the 3 mouse actions for the sliders mousdoun, mousmove and mouseup called from the main handlers.
 */
 
 //instead of the shift - use "Y" - i.e if you take slider by the top it will be fine tuning?
//    clearTimeout(document.buttonTimerID);
//    document.buttonTimerID=null;
//  if (document.buttonTimerID) {
//    clearTimeout(document.buttonTimerID);
//    document.buttonTimerID=null;
//  }
//  document.buttonTimerID = self.setTimeout("buttonLongPressed();", document.buttonDelay);
function sliderBallPressed(){
    if (document.sliderTimerID) {
      clearTimeout(document.sliderTimerID);
      document.sliderTimerID=null;
    }
} 
function slIderMousedownProcess(e) {
    var targ;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
      targ = targ.parentNode;
    document.slIderName=targ.id.substr(0,targ.id.indexOf("slIder"))+"slIder";
    var doubleclick=(document.sliderTimerID != null);
    if (document.sliderTimerID) {
      clearTimeout(document.sliderTimerID);
      document.sliderTimerID=null;
    }
    document.sliderTimerID = self.setTimeout("sliderBallPressed();", document.doubleclickDelay);
    if (doubleclick) {
       sliderActOnDoubleclick (document.slIderName);
       return;
    }   
           
    if (!document.getElementById(document.slIderName+"_Text").disabled) {
     document.slIderBall=       parseInt(document.getElementById(document.slIderName+"_divslider").style.width);
     document.slIderRailLeft=  Math.round(document.slIderBall/2);
     document.slIderRailLength=parseInt(document.getElementById(document.slIderName+"_slider").style.width)- document.slIderBall;
     var  slIderPos=   parseInt(document.getElementById(document.slIderName+"_divslider").style.left);
     var offsetTrail =document.getElementById(document.slIderName+"_slider");
     var absX0 = 0;
     var absY0 = 0;
     while (offsetTrail){
       absX0 += parseInt(offsetTrail.offsetLeft);
       absY0 += parseInt(offsetTrail.offsetTop);
       offsetTrail = offsetTrail.offsetParent;
     }
     if ((navigator.userAgent.indexOf('Mac') != -1) && typeof(document.body.leftMargin) != 'undefined') {
        absX0 += parseInt(document.body.leftMargin);
        absY0 += parseInt(document.body.topMargin);
     }   
     var x=e.pageX-absX0-document.slIderRailLeft;
     var y=e.pageY-absY0;
     var fc=parseInt(document.getElementById(document.slIderName+"_fineControl").value);
     if (fc) {
       var h=parseInt(document.getElementById(document.slIderName).style.height);
       fc=fc/100; if (fc>1) fc=1; else if (fc<-1) fc=-1;
       fc=  (
             ((fc>0) && (y < (h*fc))) ||
             ((fc<0) && (y > (h*(fc+1))))); // fine control
     }
     if ((x>=-document.slIderRailLeft) && (x<(document.slIderRailLength+document.slIderRailLeft))) { // else it is a button or text input
       if (e.shiftKey || fc ) document.slIderstartFine= slIderPos;
       else document.slIderstartFine=-1;
       if (Math.abs(x-slIderPos)>document.slIderRailLeft) { //clicked outside ball
         if (document.slIderstartFine>=0) x= (document.slIderFine*document.slIderstartFine+x)/(document.slIderFine+1);
         if (x<0) x=0;
         if (x>document.slIderRailLength) x=document.slIderRailLength;
         document.getElementById(document.slIderName+"_divslider").style.left=x;
       }
       document.slIderstartDX=(x+absX0)-parseInt(document.getElementById(document.slIderName+"_divslider").style.left)+document.slIderRailLeft;
       document.slIderDragging=true;
       mousemoveProcess(e);
      }
     }
}

function slIderMousemoveProcess(e) {
   var x=e.pageX-document.slIderstartDX;
   if (document.slIderstartFine>=0) x= (document.slIderFine*document.slIderstartFine+x)/(document.slIderFine+1);
   if (x<0) x=0;
   if (x>document.slIderRailLength) x=document.slIderRailLength;
   document.getElementById(document.slIderName+"_divslider").style.left=Math.round(x);
   document.getElementById(document.slIderName+"_sliderValue").value= x /
                      (parseInt(document.getElementById(document.slIderName+"_slider").style.width)-
                       parseInt(document.getElementById(document.slIderName+"_divslider").style.width)); // (v =0..1)
   setSliderText(document.slIderName); // from internal value set above
   sliderActOnChange (document.slIderName);
}



function slIderMouseupProcess(e) {
   sliderActOnDone (document.slIderName);  
}

 
 
 

/*
 * Here is how slider calls external functions when the slider is "done" (mouse button released) or "changed" (moved ).
 * Changing the text field value also triggers function on "done"
 */

// action will not be performed if no changes since last external write to or same data was already sent out (does not matter - on change or on done)
 
function sliderActOnDone (id) {
  var act=  document.getElementById(id+"_actionOnDone").value;
// document.title+="?"+document.getElementById(id+"_forceUpdate").value;                                                                                           // (was set externally or already sent out) 
  if (act && ((document.getElementById(id+"_lastValueSet").value!=document.getElementById(id+"_sliderValue").value) ||
               (document.getElementById(id+"_forceUpdate").value !=0))) {
    eval (act);
    document.getElementById(id+"_lastValueSet").value=document.getElementById(id+"_sliderValue").value; // to prevent triggering "onDone" "onChange" if the data did not change
    document.getElementById(id+"_forceUpdate").value=0;
  }
}      
function sliderActOnChange (id) {
// document.title+="??"+document.getElementById(id+"_forceUpdate").value;                                                                                           // 
  var act=  document.getElementById(id+"_actionOnChange").value;
  if (act && ((document.getElementById(id+"_lastValueSet").value!=document.getElementById(id+"_sliderValue").value) ||
               (document.getElementById(id+"_forceUpdate").value !=0))){
    eval (act);
    document.getElementById(id+"_lastValueSet").value=document.getElementById(id+"_sliderValue").value; // to prevent triggering "onDone" "onChange" if the data did not change
    document.getElementById(id+"_forceUpdate").value=0;
  }
}

function sliderActOnDoubleclick (id) {
  var act=  document.getElementById(id+"_actionOnDoubleclick").value;
  if (act)   eval (act);
}
      
/*
 * process pressing on slider button
 */

function slIderButtonMouse(id,state,event) {
   if (typeof(event)!="undefined") event.preventDefault();
   slIderSetButtonState(id,state);
   if (id.indexOf("slIder")>=0) {
     id=id.substr(0,id.indexOf("slIder"))+"slIder";
     var act= document.getElementById(id+"_actionOnButton").value;
     if ((state=="on") && act) eval (act);
   }
   return false;
}

function slIderSetButtonState(id,state) { // specify state: on/off
 var zstr=document.getElementById(id).src;
 document.getElementById(id).src = ((zstr.lastIndexOf("_press")<0)?
                                    (zstr.substr(0,zstr.lastIndexOf("."))):
                                    (zstr.substr(0,zstr.lastIndexOf("_press")))) +
               
                                    ((state=="on")?"_press":"") +
                                    zstr.substr(zstr.lastIndexOf("."));
}
