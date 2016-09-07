/*
*! -----------------------------------------------------------------------------**
*! elphelButtons.js
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
*!  $Log: elphelButtons2.js,v $
*!  Revision 1.4  2008/12/11 06:37:57  elphel
*!  Added animated refresh button
*!
*!  Revision 1.3  2008/12/10 22:07:12  elphel
*!  Made all buttons but drop-down to treat mouseout as mouseup (so if the toggle button was pressed and that caused the screen to redraw that caused the button to slide out of the mouse - that will count as mouse pressed and released)
*!
*!  Revision 1.2  2008/12/09 16:29:54  elphel
*!  Added event.preventDefault() here and there. Really helped - with the current FF buttons were dragged away like images (before I could only fight it using background images, not the regular ones)
*!
*!  Revision 1.1.1.1  2008/11/27 20:04:03  elphel
*!
*!
*!  Revision 1.1  2008/04/24 18:18:12  elphel
*!  2-state regular button upgraded to 3-state one - with optional disabled state
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
function createButton (id,          // id of DIV tag to make a button of
                       widthHeight, // {w:xxx, h:yyy} - if empty will use the ones specified in DIV in HTML code
                       imageURL,    // URL of the image file name. Should consist of equal size images of the (WxH - see widthHeight)
                                    // with the each column corresponding to one button, rows - different button states
                                    // alternative - array of array of styles (outer - for numbers, inner - for states
                                    // CSS buttons will use imageURL+"_"+n+"_"+s as class name for number/state
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
                      actOnLateRelease,
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

 if (!document.all){ // normal browsers
  document.auto="auto"; // z-index
  document.setAttrStyle="style";
  document.setAttrClass="class";
} else { // obsolete browsers
  document.auto="0";
  document.setAttrStyle="cssText"
  document.setAttrClass="className";
}


document.buTtonDblclickTimerID=null;
document.buTtonHoldTimerID=null;
document.BuTtonSimulated=false; // not a real key-press but a simulated one,

function createButton (id,          // id of DIV tag to make a button of
                       widthHeight, // {w:xxx, h:yyy} - if empty will use the ones specified in DIV in HTML code
                       imageURL,    // URL of the image file name. Should consist of equal size images of the (WxH - see widthHeight)
                                    // with the each column corresponding to one button, rows - different button states
                                    // alternative - array of array of styles (outer - for numbers, inner - for states
                                    // CSS buttons will use imageURL+"_"+n+"_"+s as class name for number/state
//TODO: - think of a "cover" for the <span> element to prevent selection of the text. 
                       buttonNum,   // number of button column in imageURL (starting from 0)
                       buttonType,  // "" - just a single static image, no changes              
                                    // "b" - regular button with two states - released (row 0) and pressed (row 1) disabled - row2
                                    //       all other states (for animations are considered same as not pressed)
                                    //  - removed- "tN" (N - number, may be empty) - toggle between N ( "t", "t1" parsed as "t2") states on each mouseDown
                                    // "TN" (N - number, may be empty) - toggle between N ( "t", "t1" parsed as "t2") states on each mouseUp,
                                    //      mousedown just turnes button to next row as "pressed"
                                    //  - removed- "dN" - drop-down of N buttons, no pressed state. With the long press the whole column is displayed,
                                    //      the one on which the mouse was released stays
                                    // "DN" - drop-down, each button has pressed state in the next column (so button uses 2 column/numbers)
                                    // "R" - radio button, then dropdownMask used to hold ID of the next in chain
                      dropdownMask, //string of "0" and "1" showing which button will stay after drop-down released              
                                    // if buttonType="", dropdownMask can specify the row of static buttons to make the overall image more compact
                      actOnPress,   // action on press ("alert("id="+id+" state="+state);" will show button id (see first argument) and state for
                                    // toggle/drop-down buttons. Should not use " inside, just '
                      actOnEarlyRelease, // - after short hold
                      actOnHold,    // - after long hold timer expires (automatic for drop-down)
                      actOnLateRelease, // if "*" - use actOnEarlyRelease
                      actOnDblClick,   // on double click
                      actAfterRelease) { // after actually released
//document.title="*** "+id+" ***";
if (!document.getElementById(id)) alert ("button container ID="+id+" does not exist");
  if (widthHeight.w) document.getElementById(id).style.width=widthHeight.w;
  if (widthHeight.h) document.getElementById(id).style.height=widthHeight.h;
  if (typeof (imageURL)!="string") {
//    alert(imageURL[0][0]);
    var i,j;
    s="";
    for (i=0;i<imageURL.length;i++) for (j=0;j<imageURL[i].length;j++)  s+='<input type="hidden" id="'+id+'_' +i+'_'+j+'" value="'+ imageURL[i][j] +'"/>\n';
     s+='<input type="hidden" id="'+id+'_n" value="'+ 0 +'"/>\n';
     s+='<input type="hidden" id="'+id+'_s" value="'+ 0 +'"/>\n';
    document.getElementById(id).innerHTML+=s;
  } else {
    document.getElementById(id).style.backgroundImage="url("+imageURL+")";
  }  
  var s=0;
  if (typeof(buttonType) =="undefined") buttonType="";
  if (buttonType) {
    buttonTypeMod=buttonType.substr(1);
    buttonType=buttonType.substr(0,1);
    buttonTypeMod=buttonTypeMod?parseInt(buttonTypeMod):0;
    if (typeof(dropdownMask)     =="undefined") dropdownMask="";
    if (typeof(actOnPress)       =="undefined") actOnPress ="";
    if (typeof(actOnEarlyRelease)=="undefined") actOnEarlyRelease ="";
    if (typeof(actOnHold)        =="undefined") actOnHold ="";
    if (typeof(actOnLateRelease) =="undefined") actOnLateRelease ="";
    if (typeof(actOnDblClick)    =="undefined") actOnDblClick ="";
    if (typeof(actAfterRelease)    =="undefined") actAfterRelease ="";
/*
    var ev ='document.getElementById(id).onmousedown= function()      {buTtonOnMouseDown("'+id+'","'+buttonNum+'","'+buttonType+'","'+buttonTypeMod+'","'+dropdownMask+'","'+actOnPress+'","'+actOnEarlyRelease+'","'+actOnHold+'","'+actOnLateRelease+'","'+actOnDblClick+'","'+actAfterRelease+'");}';*/
    var ev ='document.getElementById(id).onmousedown= function(event)      {buTtonOnMouseDown(event,"'+id+'","'+buttonNum+'","'+buttonType+'","'+buttonTypeMod+'","'+dropdownMask+'","'+actOnPress+'","'+actOnEarlyRelease+'","'+actOnHold+'","'+actOnLateRelease+'","'+actOnDblClick+'","'+actAfterRelease+'");}';
//alert(ev);    
    eval (ev);   
    document.getElementById(id).onmouseup=function (event) { buTtonOnMouseUp(event);};
//    document.getElementById(id).onmouseout=function () { releaseCurrentButton();};
    document.getElementById(id).onmouseout=function (event) { outOfCurrentButton(event);};
  } else {
    if (dropdownMask) s=parseInt(dropdownMask);
  }
  if (typeof (imageURL)!="string") {
    document.getElementById(id).setAttribute(document.setAttrStyle,imageURL[0][0]);
  } else {
    document.getElementById(id).style.backgroundRepeat="no-repeat";
    var l=-parseInt(document.getElementById(id).style.width)*buttonNum;
    document.getElementById(id).style.backgroundPosition= (-parseInt(document.getElementById(id).style.width)*buttonNum)+"px "+
                                                        (-parseInt(document.getElementById(id).style.height)*s)+"px"; 
    document.getElementById(id).innerHTML="<!"+"-- --"+">";                    
// Mozilla   FF seems not to process "0px 0px" correctly - skipping zero buttons ** update - not just "0px 0px" but any x=y **
  }
 if (buttonType) document.getElementById(id).style.cursor="pointer";
}                      
                                    
function outOfCurrentButton(event) {
  if (document.buTton) {
    switch (document.buTton.buttonType.substr(0,1))  {
       case 'D':
           releaseCurrentButton(); // do nothing
           break; 
       default: buTtonOnMouseUp(event); // same as mouse up?
    }
  }
}
function releaseCurrentButton() { //just release if it stuck - no action
  if (document.buTton) {
    document.getElementById(document.buTton.id).style.width=document.buTton.w+"px"; // not needed so far
    document.getElementById(document.buTton.id).style.height=document.buTton.h+"px"; // close drop-down if any
    setBuTton (document.buTton.id,document.buTton); // has extra members, but that's OK
    if (document.buTton.actAfterRelease) eval (document.buTton.actAfterRelease);
    document.buTton=null;
  }  
}

function buTtonDblclickTimerExpired(){
  clearTimeout(document.buTtonDblclickTimerID);
  document.buTtonDblclickTimerID=null;
}
function buTtonHoldTimerExpired() {
    clearTimeout(document.buTtonHoldTimerID);
    document.buTtonHoldTimerID=null;
    if (!document.buTton) return;
    if (document.buTton.buttonType == "D")  {
     setBuTton (document.buTton.id,{n:document.buTton.n+1,s:0});
     document.getElementById(document.buTton.id).style.height=(document.buTton.h * document.buTton.buttonTypeMod)+"px"; // close drop-down if any
//      open drop-down buttons
    }
    var id=document.buTton.id;
    var ns ={n:document.buTton.n,s:document.buTton.s};
    var simulated= document.buTton.simulated;
    if (document.buTton.actOnHold) eval (document.buTton.actOnHold);
}

function buTtonOnMouseUp(e) {
 if (!document.buTton) return; // just in case. Needed for releasing disabled button?
if (document.debug & 8) document.title+="buTtonOnMouseUp t="+document.buTton.buttonType;
  var late= true;
  if (document.buTtonHoldTimerID) {
    clearTimeout(document.buTtonHoldTimerID);
    document.buTtonHoldTimerID=null;
    late=false;
  }
  var ns ={n:document.buTton.n,s:document.buTton.s};
  if (document.buTton.buttonType == "D")  {
    if (!e) {
       var e = window.event;
       e.pageX=event.clientX;
       e.pageY=event.clientY;
    }
    var offsetTrail =document.getElementById(document.buTton.id);
    var absY0 = 0;
    while (offsetTrail){
       absY0 += parseInt(offsetTrail.offsetTop);
       offsetTrail = offsetTrail.offsetParent;
    }
    if ((navigator.userAgent.indexOf('Mac') != -1) && typeof(document.body.leftMargin) != 'undefined') {
       absY0 += parseInt(document.body.topMargin);
    }   
    document.buTton.s=Math.floor((e.pageY-absY0)/document.buTton.h);
    ns.s=document.buTton.s;
     while ((document.buTton.s>0) && (document.buTton.dropdownMask.substr(document.buTton.s,1)=="0")) document.buTton.s--;
  } else if ((document.buTton.buttonType == "T") || (document.buTton.buttonType == "R")) {
    
     document.buTton.s= getBuTton (document.buTton.id).s;
     ns.s=document.buTton.s;
  }
  var id=document.buTton.id;
  var simulated= document.buTton.simulated;
  if (  late  && document.buTton.actOnLateRelease && (document.buTton.actOnLateRelease!="*")) eval (document.buTton.actOnLateRelease);
  if (((!late) || (document.buTton.actOnLateRelease=="*")) && document.buTton.actOnEarlyRelease) eval (document.buTton.actOnEarlyRelease);
//  var aar=document.buTton.actAfterRelease;
  releaseCurrentButton();
//  if (aar) eval (aar);
}

function clickBuTton(id) { // simulate mouse click (for now - don't care on where to release - anyway no long press)
  document.getElementById(id).onmousedown();
  document.getElementById(id).onmouseup({pageX:0,pageY:0});
  document.BuTtonSimulated=true;
}
  

function buTtonOnMouseDown(e,id,buttonNum,buttonType,buttonTypeMod,dropdownMask,actOnPress,actOnEarlyRelease,actOnHold,
                           actOnLateRelease,actOnDblClick,actAfterRelease) {
if (typeof(e)!="undefined") e.preventDefault();
if (document.debug & 8)   document.title+="."+id+".";
 if ((buttonType=="R") && (document.buTton)) {
    if  (id!=document.buTton.id) {
        setBuTton (id,{n:buttonNum,s:0});
      document.getElementById(dropdownMask).onmousedown();
    }
    document.buTton=null;
    return;
 }
 var ns=getBuTton(id); // to be able to use in actOnPress;
 if ((buttonType=="b") && (ns.s == 2)) {
    return; // state==2 -> disabled
 }
 if (document.buTton) {
   ns=getBuTton(document.buTton.id); // to be able to use in actOnPress;
   releaseCurrentButton();
 }  
 var doubleclick=(document.buTtonDblclickTimerID != null);
 if (document.buTtonDblclickTimerID) {
    clearTimeout(document.buTtonDblclickTimerID);
    document.buTtonDblclickTimerID=null;
 }
 if (document.buTtonHoldTimerID) {
    clearTimeout(document.buTtonHoldTimerID);
    document.buTtonHoldTimerID=null;
 }
 if (doubleclick && actOnDblClick) {
   var simulated= document.buTton.simulated;
   eval (actOnDblClick);
   return; // and do nothing more
 }
 document.buTtonDblclickTimerID = self.setTimeout("buTtonDblclickTimerExpired();", document.doubleclickDelay);
 document.buTtonHoldTimerID = self.setTimeout("buTtonHoldTimerExpired();", document.buttonHoldDelay);

 document.buTton={id:id,
                  simulated:document.BuTtonSimulated,
                  buttonNum:buttonNum,
                  buttonType:buttonType,
                  buttonTypeMod: (buttonTypeMod<1)?1:buttonTypeMod,
                  dropdownMask:dropdownMask,
                  actOnPress:actOnPress,
                  actOnEarlyRelease:actOnEarlyRelease,
                  actOnHold:actOnHold,
                  actOnLateRelease:actOnLateRelease,
                  actOnDblClick:actOnDblClick,
                  actAfterRelease:actAfterRelease,
                  w:parseInt(document.getElementById(id).style.width),
                  h:parseInt(document.getElementById(id).style.height),
// ns match the current button state when it was pressed                  
                  n:0,s:0
                  };
    if (document.getElementById(id+"_n")) {
      document.buTton.n=parseInt(document.getElementById(id+"_n").value);
      document.buTton.s=parseInt(document.getElementById(id+"_s").value);
    } else {
      document.buTton.n=-parseInt(document.getElementById(id).style.backgroundPosition.split(" ")[0])/parseInt(document.getElementById(id).style.width);
      document.buTton.s=-parseInt(document.getElementById(id).style.backgroundPosition.split(" ")[1])/parseInt(document.getElementById(id).style.height);
    }
                  
  if        (document.buTton.buttonType == "R")  {
    setBuTton (id,{n:document.buTton.n,s:1});
// release all the chain
    document.getElementById(dropdownMask).onmousedown();
  } else if (document.buTton.buttonType == "b")  {
    setBuTton (id,{n:document.buTton.n,s:document.buTton.s+1});
  } else if (document.buTton.buttonType == "D")  {
     setBuTton (id,{n:document.buTton.n+1,s:document.buTton.s});
  } else if (document.buTton.buttonType == "T")  {   
     setBuTton (id,{n:document.buTton.n+1,s:((document.buTton.s==(document.buTton.buttonTypeMod-1))?0:document.buTton.s+1)});
  } else {
   alert ("Unknown button type="+document.buTton.t);
  }
  var simulated= document.BuTtonSimulated; //document.BuTton.simulated may be destroyed by now
  if (actOnPress) eval(actOnPress); // may use ns record here
  if (document.debug&256) document.title+=">"+id+"<";
  document.BuTtonSimulated=false;              
  
}

function setBuTtonState(id,state) {
    if (!document.getElementById(id)) alert ("setBuTtonState: No button id="+id+" to setBuTtonState");
    if (document.getElementById(id+"_n")) {
      document.getElementById(id+"_s").value=state;
      document.getElementById(id).setAttribute(document.setAttrStyle, document.getElementById(id+"_"+parseInt(document.getElementById(id+"_n").value)+"_"+state).value);
    } else {
      document.getElementById(id).style.backgroundPosition=  parseInt(document.getElementById(id).style.backgroundPosition.split(" ")[0])+"px "+
                                                            (-parseInt(document.getElementById(id).style.height)*state)+"px";  
    }                                                        
}

function setBuTton (id,ns) { // .n - number, .s - state (row) - will not change internal number/ actions associated with it
    if (document.getElementById(id+"_n")) {
      document.getElementById(id+"_n").value=ns.n;
      document.getElementById(id+"_s").value=ns.s;
      document.getElementById(id).setAttribute(document.setAttrStyle,document.getElementById(id+"_"+ns.n+"_"+ns.s).value);
    } else {
      document.getElementById(id).style.backgroundPosition= (-parseInt(document.getElementById(id).style.width)*ns.n)+"px "+
                                                            (-parseInt(document.getElementById(id).style.height)*ns.s)+"px";  
    }                                                    
}
function getBuTton (id) {
    if (!document.getElementById(id)) alert ("getBuTton: No button id="+id);
    if (document.getElementById(id+"_n")) {
       return {n:parseInt(document.getElementById(id+"_n").value),
               s:parseInt(document.getElementById(id+"_s").value)};
    } else {
       return {n:-parseInt(document.getElementById(id).style.backgroundPosition.split(" ")[0])/parseInt(document.getElementById(id).style.width),
               s:-parseInt(document.getElementById(id).style.backgroundPosition.split(" ")[1])/parseInt(document.getElementById(id).style.height)};
    }           
}
