/*
*! -----------------------------------------------------------------------------**
*! elphelFrames.js
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
*!  $Log: elphelFrames.js,v $
*!  Revision 1.1.1.1  2008/11/27 20:04:03  elphel
*!
*!
*!  Revision 1.2  2008/11/10 19:48:47  elphel
*!  blocking text fields updates while they are in focus
*!
*!  Revision 1.1.1.1  2007/10/10 20:11:00  elphel
*!
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
                          onDobleClick,
                          onMouseDown
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

function createFrameSel (id, // parent element ID (bare div), should have frAmesel in it's name
                          frameBorderStyle, // id of an optional div with a frame that will be resized when outer dimentions changed
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
                          onDobleClick,
                          onMouseDown
                          ) {
                         
  var s="";
      s+=   '\n<div id="'+id+'_frameBorder" style="position:absolute;'+ (frameBorderStyle?('border:'+frameBorderStyle+';'):'')+'">\n';
  
// add outer image and cover protection from dragging (if any)
  s+=   '\n<div id="'+id+'_frame_root" style="position:absolute; border:'+borderStyle+'">\n';
  s+= '  <div id="'+id+'_frame_rootClip" style="position:absolute;">\n';
  if (innerImage) {
    s+= '   <div id="'+id+'_frame_image" style="position:absolute;">\n'+
        '    <img id="'+id+'_frame_image_img" src="'+innerImage+'" style="width:100%;height:100%"/>\n'+
        '   </div>\n';
    s+= '   <div id="'+id+'_frame_cover" style="position:absolute;width:100%;height:100%">\n'+
        '    <!'+'-- --'+'>\n'+
        '   </div>\n';
  } else {
    s+= '<!'+'-- --'+'>\n';
  }
  s+=    '</div>\n'; 
  
  s+=   '</div>\n'; 
  s+=   '<div id="'+id+'_n"  style="position:absolute; cursor:n-resize"> <!'+'-- --'+'></div>\n';
  s+=   '<div id="'+id+'_ne" style="position:absolute; cursor:ne-resize"><!'+'-- --'+'></div>\n';
  s+=   '<div id="'+id+'_e"  style="position:absolute; cursor:e-resize"> <!'+'-- --'+'></div>\n';
  s+=   '<div id="'+id+'_se" style="position:absolute; cursor:se-resize"><!'+'-- --'+'></div>\n';
  s+=   '<div id="'+id+'_s"  style="position:absolute; cursor:s-resize"> <!'+'-- --'+'></div>\n';
  s+=   '<div id="'+id+'_sw" style="position:absolute; cursor:sw-resize"><!'+'-- --'+'></div>\n';
  s+=   '<div id="'+id+'_w"  style="position:absolute; cursor:w-resize"> <!'+'-- --'+'></div>\n';
  s+=   '<div id="'+id+'_nw" style="position:absolute; cursor:nw-resize"><!'+'-- --'+'></div>\n';
  s+=   '<div id="'+id+'_c"  style="position:absolute; cursor:move">     <!'+'-- --'+'></div>\n';
  s+=   '<input id="'+id+'_snap_hw"         type="hidden" style="display:none"  value="'+snap_hw+'">\n';
  s+=   '<input id="'+id+'_relative"        type="hidden" style="display:none"  value="'+(isRelative?"1":"")+'">\n';
  s+=   '<input id="'+id+'_minWidth"        type="hidden" style="display:none"  value="'+minWindth+'">\n';
  s+=   '<input id="'+id+'_minHeight"       type="hidden" style="display:none"  value="'+minHeight+'">\n';
  s+=   '<input id="'+id+'_magnifierScale"  type="hidden" style="display:none"  value="0">\n';
  s+=   '<input id="'+id+'_borderWidth"     type="hidden" style="display:none"  value="0">\n';
  s+=   '<input id="'+id+'_borderStyle"     type="hidden" style="display:none"  value="none">\n';
  s+=   '<input id="'+id+'_realOuterWidth"  type="hidden" style="display:none"  value="1">\n';
  s+=   '<input id="'+id+'_realOuterHeight" type="hidden" style="display:none"  value="1">\n';
  s+=   '<input id="'+id+'_outerPixelScale" type="hidden" style="display:none"  value="1">\n';
  s+=   '<input id="'+id+'_realInnerWidth"  type="hidden" style="display:none"  value="1">\n';
  s+=   '<input id="'+id+'_realInnerHeight" type="hidden" style="display:none"  value="1">\n';
  s+=   '<input id="'+id+'_realInnerLeft"   type="hidden" style="display:none"  value="1">\n';
  s+=   '<input id="'+id+'_realInnerTop"    type="hidden" style="display:none"  value="1">\n';
// last value set from outside (not to generate "onchange" if the ne value is the same as the old one  
  s+=   '<input id="'+id+'_lastInnerWidth"  type="hidden" style="display:none"  value="1">\n';
  s+=   '<input id="'+id+'_lastInnerHeight" type="hidden" style="display:none"  value="1">\n';
  s+=   '<input id="'+id+'_lastInnerLeft"   type="hidden" style="display:none"  value="1">\n';
  s+=   '<input id="'+id+'_lastInnerTop"    type="hidden" style="display:none"  value="1">\n';

  s+=   '<input id="'+id+'_text_w"          type="hidden" style="display:none"  value="'+idWidth+'">\n';
  s+=   '<input id="'+id+'_text_h"          type="hidden" style="display:none"  value="'+idHeight+'">\n';
  s+=   '<input id="'+id+'_text_l"          type="hidden" style="display:none"  value="'+idLeft+'">\n';
  s+=   '<input id="'+id+'_text_t"          type="hidden" style="display:none"  value="'+idTop+'">\n';
// last data  written to control (may be float)
  s+=   '<input id="'+id+'_textld_w"        type="hidden" style="display:none"  value="0">\n';
  s+=   '<input id="'+id+'_textld_h"        type="hidden" style="display:none"  value="0">\n';
  s+=   '<input id="'+id+'_textld_l"        type="hidden" style="display:none"  value="0">\n';
  s+=   '<input id="'+id+'_textld_t"        type="hidden" style="display:none"  value="0">\n';
//last image loaded
  s+=   '<input id="'+id+'_imageld_w"        type="hidden" style="display:none"  value="1">\n';
  s+=   '<input id="'+id+'_imageld_h"        type="hidden" style="display:none"  value="1">\n';
  s+=   '<input id="'+id+'_imageld_l"        type="hidden" style="display:none"  value="1">\n';
  s+=   '<input id="'+id+'_imageld_t"        type="hidden" style="display:none"  value="1">\n';
    
  s+=   '<input id="'+id+'_actionOnMove"     type="hidden" style="display:none"  value="'+onMove+'">\n';
  s+=   '<input id="'+id+'_actionOnDone"     type="hidden" style="display:none"  value="'+onDone+'">\n';
  s+=   '<input id="'+id+'_actionOnDoubleclick" type="hidden" style="display:none"  value="'+onDobleClick+'">\n';
  s+=   '<input id="'+id+'_actionOnMouseDown" type="hidden" style="display:none"  value="'+onMouseDown+'">\n';
  s+='</div>\n';
//document.title="=== "+id+" ==="+document.getElementById(id)+"===";
  
  document.getElementById(id).innerHTML=s+document.getElementById(id).innerHTML;     
  document.getElementById(id+"_borderStyle").value=document.getElementById(id+"_frame_root").style.borderStyle;
  document.getElementById(id+"_borderWidth").value=document.getElementById(id+"_frame_root").style.borderWidth;

}


function frAmeselShow (id) {
  if (!document.getElementById(id+"_snap_hw")) return;
  var snap_hw=parseInt(document.getElementById(id+"_snap_hw").value);
  var row=parseInt(document.getElementById(id+"_realOuterWidth" ).value);
  var roh=parseInt(document.getElementById(id+"_realOuterHeight").value);
  var riw=parseInt(document.getElementById(id+"_realInnerWidth" ).value);
  var rih=parseInt(document.getElementById(id+"_realInnerHeight").value);
  var ril=parseInt(document.getElementById(id+"_realInnerLeft"  ).value);
  var rit=parseInt(document.getElementById(id+"_realInnerTop"   ).value);
  var scale=parseFloat(document.getElementById(id+"_outerPixelScale").value)
 
  
  
  var bw= (document.getElementById(id+"_frame_root").style.borderStyle!="none")?parseInt (document.getElementById(id+"_frame_root").style.borderWidth):0;
  var ms= parseFloat(document.getElementById(id+"_magnifierScale" ).value);
  
  var ow =    Math.round (row*scale);
  var oh =    Math.round (roh*scale);
  var iw= Math.round (riw*scale);
  var ih= Math.round (rih*scale);
  var il= Math.round (ril*scale);
  var it= Math.round (rit*scale);
  var snap_hw2=2*snap_hw;
  document.getElementById(id+"_n" ).style.height=snap_hw2;
  document.getElementById(id+"_n" ).style.width= iw-snap_hw2;
  document.getElementById(id+"_n" ).style.left=  il+snap_hw;
  document.getElementById(id+"_n" ).style.top=   it-snap_hw;
  document.getElementById(id+"_ne").style.width= snap_hw2;
  document.getElementById(id+"_ne").style.height=snap_hw2;
  document.getElementById(id+"_ne").style.left=  il+iw-snap_hw;
  document.getElementById(id+"_ne").style.top=   it-snap_hw;
  document.getElementById(id+"_e" ).style.width= snap_hw2;
  document.getElementById(id+"_e" ).style.height=ih-snap_hw2;
  document.getElementById(id+"_e" ).style.left=  il+iw-snap_hw;
  document.getElementById(id+"_e" ).style.top=   it+snap_hw;
  document.getElementById(id+"_se").style.width= snap_hw2;
  document.getElementById(id+"_se").style.height=snap_hw2;
  document.getElementById(id+"_se").style.left=  il+iw-snap_hw;
  document.getElementById(id+"_se").style.top=   it+ih-snap_hw;
  document.getElementById(id+"_s" ).style.height=snap_hw2;
  document.getElementById(id+"_s" ).style.width= iw-snap_hw2;
  document.getElementById(id+"_s" ).style.left=  il+snap_hw;
  document.getElementById(id+"_s" ).style.top=   it+ih-snap_hw;
  document.getElementById(id+"_sw").style.width= snap_hw2;
  document.getElementById(id+"_sw").style.height=snap_hw2;
  document.getElementById(id+"_sw").style.left=  il-snap_hw;
  document.getElementById(id+"_sw").style.top=   it+ih-snap_hw;
  document.getElementById(id+"_w" ).style.width= snap_hw2;
  document.getElementById(id+"_w" ).style.height=ih-snap_hw2;
  document.getElementById(id+"_w" ).style.left=  il-snap_hw;
  document.getElementById(id+"_w" ).style.top=   it+snap_hw;
  document.getElementById(id+"_nw").style.width= snap_hw2;
  document.getElementById(id+"_nw").style.height=snap_hw2;
  document.getElementById(id+"_nw").style.left=  il-snap_hw;
  document.getElementById(id+"_nw").style.top=   it-snap_hw;
  document.getElementById(id+"_c").style.top=    it+snap_hw;
  document.getElementById(id+"_c").style.left=   il+snap_hw;
  document.getElementById(id+"_c").style.width=  iw-snap_hw2;
  document.getElementById(id+"_c").style.height= ih-snap_hw2;
  
  
  document.getElementById(id+"_frame_root").style.width=iw-bw;
  document.getElementById(id+"_frame_root").style.height=ih-bw;
  document.getElementById(id+"_frame_root").style.left=  il-Math.round(bw/2);
  document.getElementById(id+"_frame_root").style.top=   it-Math.round(bw/2);;
  if (document.getElementById(id+"_frame_image")) {
   if (ms>0) {
     document.getElementById(id+"_frame_image").style.width= Math.round(ms*row);
     document.getElementById(id+"_frame_image").style.height=Math.round(ms*roh);
     document.getElementById(id+"_frame_image").style.left= -Math.round(ril/(row-riw)*(ms*row -iw+bw));
     document.getElementById(id+"_frame_image").style.top=  -Math.round(rit/(roh-rih)*(ms*roh -ih+bw));
   } else {    
//     document.getElementById(id+"_frame_image").style.width="100%";
//     document.getElementById(id+"_frame_image").style.height="100%";
     document.getElementById(id+"_frame_image").style.width= Math.round(parseInt(document.getElementById(id+"_imageld_w").value)*scale);
     document.getElementById(id+"_frame_image").style.height=Math.round(parseInt(document.getElementById(id+"_imageld_h").value)*scale);
     document.getElementById(id+"_frame_image").style.left=  Math.round((parseInt(document.getElementById(id+"_imageld_l").value)-
                                                             parseInt(document.getElementById(id+"_realInnerLeft").value))*scale);
     document.getElementById(id+"_frame_image").style.top=   Math.round((parseInt(document.getElementById(id+"_imageld_t").value)-
                                                             parseInt(document.getElementById(id+"_realInnerTop").value))*scale);
   }
   document.getElementById(id+"_frame_rootClip").style.clip="rect("+0+"px, "+(iw-bw)+"px, "+(ih-bw)+"px, "+"0"+"px)"   
   document.getElementById(id+"_frame_rootClip").style.width=(iw-bw)+"px";
   document.getElementById(id+"_frame_rootClip").style.height=(ih-bw)+"px"   
   document.getElementById(id+"_frame_rootClip").style.left="0px";
   document.getElementById(id+"_frame_rootClip").style.top="0px";
  }
  frAmeselAllTextFromInternal (id);
}

function frAmeselAllTextFromInternal (id) {
  var rel= document.getElementById(id+"_relative").value?true:false;
  var ow=parseInt(document.getElementById(id+"_realOuterWidth" ).value);
  var oh=parseInt(document.getElementById(id+"_realOuterHeight").value);
  var iw=parseInt(document.getElementById(id+"_realInnerWidth" ).value);
  var ih=parseInt(document.getElementById(id+"_realInnerHeight").value);
  var il=parseInt(document.getElementById(id+"_realInnerLeft"  ).value);
  var it=parseInt(document.getElementById(id+"_realInnerTop"   ).value);
  if (rel) {
    il=(ow==iw)?50:Math.round(10000*il/(ow-iw))/100;
    it=(oh==ih)?50:Math.round(10000*it/(oh-ih))/100;
    iw=Math.round(10000*iw/ow)/100;
    ih=Math.round(10000*ih/oh)/100;
  }
  document.getElementById(id+'_textld_w').value=iw;
  document.getElementById(id+'_textld_h').value=ih;
  document.getElementById(id+'_textld_l').value=il;
  document.getElementById(id+'_textld_t').value=it;
         
  if (document.getElementById(id+'_text_w').value &&  (document.getElementById(document.getElementById(id+'_text_w').value).myfocus!=true))
      document.getElementById(document.getElementById(id+'_text_w').value).value=iw;
  if (document.getElementById(id+'_text_h').value &&  (document.getElementById(document.getElementById(id+'_text_h').value).myfocus!=true))
      document.getElementById(document.getElementById(id+'_text_h').value).value=ih;
  if (document.getElementById(id+'_text_l').value &&  (document.getElementById(document.getElementById(id+'_text_l').value).myfocus!=true))
      document.getElementById(document.getElementById(id+'_text_l').value).value=il;
  if (document.getElementById(id+'_text_t').value &&  (document.getElementById(document.getElementById(id+'_text_t').value).myfocus!=true))
      document.getElementById(document.getElementById(id+'_text_t').value).value=it;
}

function frAmeselSetResizeEn (id,en) { 
  document.getElementById(id+"_n" ).style.cursor=en?"n-resize":"move";
  document.getElementById(id+"_ne").style.cursor=en?"ne-resize":"move";
  document.getElementById(id+"_e" ).style.cursor=en?"e-resize":"move";
  document.getElementById(id+"_se").style.cursor=en?"se-resize":"move";
  document.getElementById(id+"_s" ).style.cursor=en?"s-resize":"move";
  document.getElementById(id+"_sw").style.cursor=en?"sw-resize":"move";
  document.getElementById(id+"_w" ).style.cursor=en?"w-resize":"move";
  document.getElementById(id+"_nw").style.cursor=en?"nw-resize":"move";
}
function frAmeselGetResizeEn (id) {return (document.getElementById(id+"_n" ).style.cursor!="move"); }

function frAmeselSetRelative (id,r) { 
  document.getElementById(id+"_relative" ).value=r?"1":"";
  frAmeselAllTextFromInternal (id);
}
function frAmeselGetRelative (id) { 
  return (document.getElementById(id+"_relative" ).value)?true:false;
}

function frAmeselSetOuterScaled (id,wh) { // preserve proportion of the frame to the whole window while changing window size
 var oldwh= frAmeselGetOuter (id);
 var ow=parseInt(document.getElementById(id).style.width);
 var oh=parseInt(document.getElementById(id).style.height);
 var bw=parseInt(document.getElementById(id+'_frameBorder').style.borderWidth);
 if (document.getElementById(id+'_frameBorder').style.borderStyle == 'none') bw=0;
 if (!(bw>0)) bw=0;
 ow-=2*bw;
 oh-=2*bw;
  
 var scale=ow/wh.w; if ((oh/wh.h) < scale) scale=oh/wh.h;
 document.getElementById(id+"_realOuterWidth" ).value=wh.w;
 document.getElementById(id+"_realOuterHeight").value=wh.h;
 document.getElementById(id+"_outerPixelScale").value=scale;
 document.getElementById(id+'_frameBorder').style.width=Math.round(wh.w*scale);
 document.getElementById(id+'_frameBorder').style.height=Math.round(wh.h*scale);
 var wi=frAmeselGetInner (id);
 wi.w=Math.round (wi.w*wh.w/oldwh.w);
 wi.h=Math.round (wi.h*wh.h/oldwh.h);
 wi.l=Math.round (wi.l*wh.w/oldwh.w);
 wi.t=Math.round (wi.t*wh.h/oldwh.h);
 frAmeselSetInner (id,wi);
}                          


function frAmeselSetOuter (id,wh) { 
 var ow=parseInt(document.getElementById(id).style.width);
 var oh=parseInt(document.getElementById(id).style.height);
 var bw=parseInt(document.getElementById(id+'_frameBorder').style.borderWidth);
 if (document.getElementById(id+'_frameBorder').style.borderStyle == 'none') bw=0;
 if (!(bw>0)) bw=0;
 ow-=2*bw;
 oh-=2*bw;
  
 var scale=ow/wh.w; if ((oh/wh.h) < scale) scale=oh/wh.h;
 document.getElementById(id+"_realOuterWidth" ).value=wh.w;
 document.getElementById(id+"_realOuterHeight").value=wh.h;
 document.getElementById(id+"_outerPixelScale").value=scale;
 document.getElementById(id+'_frameBorder').style.width=Math.round(wh.w*scale);
 document.getElementById(id+'_frameBorder').style.height=Math.round(wh.h*scale);
}                          


function frAmeselFillParent (id) { 
  if (!document.getElementById(id)) return;
  if (!document.getElementById(id+"_realOuterWidth" )) return;
  var ow=parseInt(document.getElementById(id).parentNode.style.width);
  var oh=parseInt(document.getElementById(id).parentNode.style.height);
  var wh={w:parseInt(document.getElementById(id+"_realOuterWidth" ).value),
          h:parseInt(document.getElementById(id+"_realOuterHeight").value)};
  document.getElementById(id).style.width= ow;
  document.getElementById(id).style.height= oh;
  document.getElementById(id).style.left=0;
  document.getElementById(id).style.top=0;
  var bw=parseInt(document.getElementById(id+'_frameBorder').style.borderWidth);
  if (document.getElementById(id+'_frameBorder').style.borderStyle == 'none') bw=0;
  if (!(bw>0)) bw=0;
  ow-=2*bw;
  oh-=2*bw;
 var scale=ow/wh.w; if ((oh/wh.h) < scale) scale=oh/wh.h;
 document.getElementById(id+"_outerPixelScale").value=scale;
 document.getElementById(id+'_frameBorder').style.width=Math.round(wh.w*scale);
 document.getElementById(id+'_frameBorder').style.height=Math.round(wh.h*scale);
}                          


function frAmeselGetOuter (id) {
 return {w:parseInt(document.getElementById(id+"_realOuterWidth" ).value),
         h:parseInt(document.getElementById(id+"_realOuterHeight").value)};
}                          

function frAmeselSetZindexHandles(id,z) {
  document.getElementById(id+"_n" ).style.zIndex=z;
  document.getElementById(id+"_ne").style.zIndex=z;
  document.getElementById(id+"_e" ).style.zIndex=z;
  document.getElementById(id+"_se").style.zIndex=z;
  document.getElementById(id+"_s" ).style.zIndex=z;
  document.getElementById(id+"_sw").style.zIndex=z;
  document.getElementById(id+"_w" ).style.zIndex=z;
  document.getElementById(id+"_nw").style.zIndex=z;
  document.getElementById(id+"_c" ).style.zIndex=z;
}
function frAmeselSetZindexFrame(id,z) {
  document.getElementById(id+"_frame_root" ).style.zIndex=z;
}
function frAmeselGetZindexHandles(id) {
  return parseInt(document.getElementById(id+"_n" ).style.zIndex);
}
function frAmeselGetZindexFrame(id) {
  return parseInt(document.getElementById(id+"_frame_root" ).style.zIndex);
}



function frAmeselSetInner (id,whlt) {
// alert (id);
// debugWindowShow(document.getElementById("idMagnifier_frAmesel").parentNode.innerHTML);
 document.getElementById(id+"_realInnerWidth" ).value=whlt.w;
 document.getElementById(id+"_realInnerHeight").value=whlt.h;
 document.getElementById(id+"_realInnerLeft" ).value= whlt.l;
 document.getElementById(id+"_realInnerTop").value=   whlt.t;
 document.getElementById(id+"_lastInnerWidth" ).value=whlt.w;
 document.getElementById(id+"_lastInnerHeight").value=whlt.h;
 document.getElementById(id+"_lastInnerLeft" ).value= whlt.l;
 document.getElementById(id+"_lastInnerTop").value=   whlt.t;
}

function frAmeselCenterInner (id) {
 var m= Math.round((parseInt(document.getElementById(id+"_realOuterWidth" ).value)-
                    parseInt(document.getElementById(id+"_realInnerWidth" ).value))/2);
 document.getElementById(id+"_realInnerLeft" ).value= m;
 document.getElementById(id+"_lastInnerLeft" ).value= m;
                    
 var m= Math.round((parseInt(document.getElementById(id+"_realOuterHeight" ).value)-
                    parseInt(document.getElementById(id+"_realInnerHeight" ).value))/2);
 document.getElementById(id+"_realInnerTop" ).value= m;
 document.getElementById(id+"_lastInnerTop" ).value= m;
}

function frAmeselGetInner (id) {
 return {w:parseInt(document.getElementById(id+"_realInnerWidth" ).value),
         h:parseInt(document.getElementById(id+"_realInnerHeight").value),
         l:parseInt(document.getElementById(id+"_realInnerLeft"  ).value),
         t:parseInt(document.getElementById(id+"_realInnerTop"   ).value)};
}

function frAmeselSetMagnification (id,m) {
  document.getElementById(id+"_magnifierScale" ).value=m;
}
function frAmeselGetMagnification (id) {
  return parseInt(document.getElementById(id+"_magnifierScale" ).value);
}

function frAmeselSetSnap (id,m) {
  document.getElementById(id+"_snap_hw" ).value=m;
}
function frAmeselGetSnap (id) {
  return parseInt(document.getElementById(id+"_snap_hw" ).value);
}

function frAmeselSetBorderWidth (id,m) {
  document.getElementById(id+"_borderWidth" ).value=m;
  document.getElementById(id+"_frame_root").style.borderWidth=m;
}
function frAmeselGetBorderWidth (id) {
  return parseInt(document.getElementById(id+"_borderWidth" ).value);
}

function frAmeselSetBorderStyle (id,m) {
  document.getElementById(id+"_borderStyle" ).value=m;
  document.getElementById(id+"_frame_root").style.borderStyle=m;
}
function frAmeselGetBorderStyle (id) {
  return parseInt(document.getElementById(id+"_borderStyle" ).value);
}

function frAmeselSetImage (id,url) {
  document.getElementById(id+"_frame_image_img" ).src=url;
  if (parseFloat(document.getElementById(id+"_magnifierScale" ).value) >0) {// magnifier mode
    document.getElementById(id+"_imageld_w").value=document.getElementById(id+"_realOuterWidth").value;
    document.getElementById(id+"_imageld_h").value=document.getElementById(id+"_realOuterHeight").value;
    document.getElementById(id+"_imageld_l").value=0;
    document.getElementById(id+"_imageld_t").value=0;
  } else { // mode WOI
    document.getElementById(id+"_imageld_w").value=document.getElementById(id+"_realInnerWidth").value;
    document.getElementById(id+"_imageld_h").value=document.getElementById(id+"_realInnerHeight").value;
    document.getElementById(id+"_imageld_l").value=document.getElementById(id+"_realInnerLeft").value;
    document.getElementById(id+"_imageld_t").value=document.getElementById(id+"_realInnerTop").value;
  }
  frAmeselShow (id); // isn't it duplicate? (at the end it updates text fields from the internal variables)
}

function frAmeselSetBorderShow (id,showb) {
  if (showb) document.getElementById(id+"_frame_root").style.borderStyle=document.getElementById(id+"_borderStyle" ).value; // stored style
  else       document.getElementById(id+"_frame_root").style.borderStyle="none";
}

function frAmeselOnTextChange(iid,d) { //"'+id+'","w")
  var id=iid.substr(0,iid.indexOf("frAmesel"))+"frAmesel";
  var v=document.getElementById(document.getElementById(id+'_text_'+d).value).value;
  if (v==document.getElementById(id+'_textld_'+d).value) return; // no change
  var rel= document.getElementById(id+"_relative").value?true:false;
  
  if (rel) v= Math.round(parseFloat(v)*100)/100;
  else     v=parseInt(v);
  
  if (isNaN(v)) {
    frAmeselAllTextFromInternal (id);
    return;
  }
  var minWidth;
  var ow, iw, il, iw0,il0;
  if ((d=="w") || (d=="l")) {
    minWidth=parseInt(document.getElementById(id+"_minWidth" ).value);
    ow=parseInt(document.getElementById(id+"_realOuterWidth" ).value);
    iw=parseInt(document.getElementById(id+"_realInnerWidth" ).value);
    il=parseInt(document.getElementById(id+"_realInnerLeft"  ).value);
  } else {
    minWidth=parseInt(document.getElementById(id+"_minHeight" ).value);
    ow=parseInt(document.getElementById(id+"_realOuterHeight" ).value);
    iw=parseInt(document.getElementById(id+"_realInnerHeight" ).value);
    il=parseInt(document.getElementById(id+"_realInnerTop"  ).value);
  }
  iw0=iw;
  il0=il;
  if ((d=="w") || (d=="h")) {
    if (rel) v=Math.round (v*ow/100);
    if (v>ow) v=ow;
    if (v<minWidth) v=minWidth;
// can fit without moving il?
    if (rel) {
      il-=Math.round ((v-iw0)/2);
      if (il<0) il =0;
      else if (il>(ow-v)) il= ow-v;
    } else {
      if (il>(ow-v)) il=ow-v;
    }
    iw=v;
  } else {
    if (rel) v=Math.round (v*(ow-iw)/100);
    if (v<0) v=0;
    if (v>ow-iw) v=ow-iw;
    il=v; 
  }
  if ((il != il0) || (iw != iw0)) {
    if ((d=="w") || (d=="l")) {
      document.getElementById(id+"_realInnerWidth" ).value=iw;
//      document.getElementById(id+"_lastInnerWidth" ).value=iw;
      document.getElementById(id+"_realInnerLeft"  ).value=il;
//      document.getElementById(id+"_lastInnerLeft"  ).value=il;
    } else {
      document.getElementById(id+"_realInnerHeight").value=iw;
//      document.getElementById(id+"_lastInnerHeight").value=iw;
      document.getElementById(id+"_realInnerTop"   ).value=il;
//      document.getElementById(id+"_lastInnerTop"   ).value=il;
    }
    frAmeselActOnDone(id);
  }
  frAmeselShow(id);
}

function frAmeselPressed(){
    if (document.frAmeselTimerID) {
      clearTimeout(document.frAmeselTimerID);
      document.frAmeselTimerID=null;
if (document.debug & 16) document.title+="^";      
    }
} 
function frAmeselMousedownProcess(e) {
    var targ;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
      targ = targ.parentNode;
    document.frAmeselName=targ.id.substr(0,targ.id.indexOf("frAmesel"))+"frAmesel";
    
    var doubleclick=(document.frAmeselTimerID != null);
if (document.debug & 16) document.title+=doubleclick?"D":"S";      
    
    if (document.frAmeselTimerID) {
      clearTimeout(document.frAmeselTimerID);
      document.frAmeselTimerID=null;
    }
    document.frAmeselTimerID = self.setTimeout("frAmeselPressed();", document.doubleclickDelay);
    if (doubleclick) {
       frAmeselActOnDoubleclick (document.frAmeselName);
       return;
    }   
    var t=targ.id.substr(document.frAmeselName.length+1);
    document.frAmeselStartDrag={x:e.pageX,y:e.pageY};
    var shiftPressed=e.shiftKey;
    var a=1/parseFloat(document.getElementById(document.frAmeselName+"_outerPixelScale").value); //a>1
    var b=e.shiftKey?1:a;

    if      (t=="n" ) document.frAmeselVector={l:0,t:1,w: 0,h:-1};
    else if (t=="ne") document.frAmeselVector={l:0,t:b,w: b,h:-b};
    else if (t=="e" ) document.frAmeselVector={l:0,t:0,w: 1,h: 0};
    else if (t=="se") document.frAmeselVector={l:0,t:0,w: b,h: b};
    else if (t=="s" ) document.frAmeselVector={l:0,t:0,w: 0,h: 1};
    else if (t=="sw") document.frAmeselVector={l:b,t:0,w:-b,h: b};
    else if (t=="w" ) document.frAmeselVector={l:1,t:0,w:-1,h: 0};
    else if (t=="nw") document.frAmeselVector={l:b,t:b,w:-b,h:-b};
    else if (t=="c" ) document.frAmeselVector={l:b,t:b,w: 0,h: 0};
    else return;
    document.frAmeselStartInternal={w:parseInt(document.getElementById(document.frAmeselName+"_realInnerWidth" ).value),
                                     h:parseInt(document.getElementById(document.frAmeselName+"_realInnerHeight").value),
                                     l:parseInt(document.getElementById(document.frAmeselName+"_realInnerLeft"  ).value),
                                     t:parseInt(document.getElementById(document.frAmeselName+"_realInnerTop"   ).value)};
    document.frAmeselDragging=true;
    mousemoveProcess(e);
    var act=  document.getElementById(document.frAmeselName+"_actionOnMouseDown").value;
    if (act)   eval (act);
}


function frAmeselMousemoveProcess(e) {
   var x=e.pageX-document.frAmeselStartDrag.x;
   var y=e.pageY-document.frAmeselStartDrag.y;
 if (document.debug & 32) document.title+=" x="+x + " y="+y;   
   var id=document.frAmeselName;
   var contW=true;  
   var contH=true;  
   if ((document.frAmeselVector.l!=0) || (document.frAmeselVector.w!=0)) { // just to save time
     var row=parseInt(document.getElementById(id+"_realOuterWidth").value);
     var riw=parseInt(document.getElementById(id+"_realInnerWidth").value);
     var ril=parseInt(document.getElementById(id+"_realInnerLeft").value);
     var mw= parseInt(document.getElementById(id+"_minWidth").value);
   }  
   if ((document.frAmeselVector.t!=0) || (document.frAmeselVector.h!=0)) { // just to save time
     var roh=parseInt(document.getElementById(id+"_realOuterHeight").value);
     var rih=parseInt(document.getElementById(id+"_realInnerHeight").value);
     var rit=parseInt(document.getElementById(id+"_realInnerTop").value);
     var mh=parseInt(document.getElementById(id+"_minHeight").value);
   }
   if (document.frAmeselVector.l!=0) {
     v= Math.round(document.frAmeselStartInternal.l+x*document.frAmeselVector.l);
     if (document.frAmeselVector.w==0) { // moving as a whole
       if (v>(row-riw)) v= row-riw;
     } else { // moving just left border
       if (v> (ril+riw-mw)) {
         v= ril+riw-mw;
       }
     }
     if (v<0) v=0;
     if (document.frAmeselVector.w!=0) { // just left moving
         document.getElementById(id+"_realInnerWidth").value= document.frAmeselStartInternal.l+document.frAmeselStartInternal.w-v;
         contW=false; // will not process that branch
     }
     ril=v;
     document.getElementById(id+"_realInnerLeft").value=  ril;
   }  
   
   if (document.frAmeselVector.t!=0) {
     v= Math.round(document.frAmeselStartInternal.t+y*document.frAmeselVector.t);
     if (document.frAmeselVector.h==0) {
       if (v>(roh-rih)) v= roh-rih;
     } else { // moving just top border
       if (v> (rit+rih-mh)) {
         v= rit+rih-mh;
       }
     }
     if (v<0) v=0;
     if (document.frAmeselVector.h!=0) { // just top moving
         document.getElementById(id+"_realInnerHeight").value= document.frAmeselStartInternal.t+document.frAmeselStartInternal.h-v;
         contH=false; // will not process that branch
     }
     rit=v;
     document.getElementById(id+"_realInnerTop").value=  rit;
   }  
   if (contW &&( document.frAmeselVector.w!=0)) {
     v= Math.round(document.frAmeselStartInternal.w+x*document.frAmeselVector.w);
     if (v>(row-ril)) v = row-ril;
     if (v<mw) v=mw;
     document.getElementById(id+"_realInnerWidth").value= v;
   }  
   if (contH && (document.frAmeselVector.h!=0)) {
     v= Math.round(document.frAmeselStartInternal.h+y*document.frAmeselVector.h);
     if (v>(roh-rit)) v = roh-rit;
     if (v<mh) v=mh;
     document.getElementById(id+"_realInnerHeight").value= v;
   }   
   frAmeselActOnChange (id);
   frAmeselShow (id);
}


function frAmeselMouseupProcess(e) {
   frAmeselActOnDone (document.frAmeselName);  
}


function frAmeselActOnDone (id) {
  var act=  document.getElementById(id+"_actionOnDone").value;
  
  if (act && (
             (document.getElementById(id+"_lastInnerWidth").value!= document.getElementById(id+"_realInnerWidth").value) ||
             (document.getElementById(id+"_lastInnerHeight").value!=document.getElementById(id+"_realInnerHeight").value) ||
             (document.getElementById(id+"_lastInnerLeft").value!=  document.getElementById(id+"_realInnerLeft").value) ||
             (document.getElementById(id+"_lastInnerTop").value!=   document.getElementById(id+"_realInnerTop").value))) {
      eval (act);
      document.getElementById(id+"_lastInnerWidth").value= document.getElementById(id+"_realInnerWidth").value;
      document.getElementById(id+"_lastInnerHeight").value=document.getElementById(id+"_realInnerHeight").value;
      document.getElementById(id+"_lastInnerLeft").value=  document.getElementById(id+"_realInnerLeft").value;
      document.getElementById(id+"_lastInnerTop").value=   document.getElementById(id+"_realInnerTop").value;
  }
}      
function frAmeselActOnChange (id) {
  var act=  document.getElementById(id+"_actionOnMove").value;
  if (act && (
             (document.getElementById(id+"_lastInnerWidth").value!= document.getElementById(id+"_realInnerWidth").value) ||
             (document.getElementById(id+"_lastInnerHeight").value!=document.getElementById(id+"_realInnerHeight").value) ||
             (document.getElementById(id+"_lastInnerLeft").value!=  document.getElementById(id+"_realInnerLeft").value) ||
             (document.getElementById(id+"_lastInnerTop").value!=   document.getElementById(id+"_realInnerTop").value)))
  {
      eval (act);
      document.getElementById(id+"_lastInnerWidth").value= document.getElementById(id+"_realInnerWidth").value;
      document.getElementById(id+"_lastInnerHeight").value=document.getElementById(id+"_realInnerHeight").value;
      document.getElementById(id+"_lastInnerLeft").value=  document.getElementById(id+"_realInnerLeft").value;
      document.getElementById(id+"_lastInnerTop").value=   document.getElementById(id+"_realInnerTop").value;
  }
}

function frAmeselActOnDoubleclick (id) {
  var act=  document.getElementById(id+"_actionOnDoubleclick").value;
  if (act)   eval (act);
}
