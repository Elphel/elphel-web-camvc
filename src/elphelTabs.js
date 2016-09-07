/*
*! -----------------------------------------------------------------------------**
*! elphelTabs.js
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
*!  $Log: elphelTabs.js,v $
*!  Revision 1.1.1.1  2008/11/27 20:04:03  elphel
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

Two functions are used to manipulate tabs.
One - creates them, the other changes transparency


function createTabs ( id, // parent DIV id - dimensions will be used for other elements
                      bhw, // border image half width (full width for the rightmost and leftmost tab sides)
                      tabs_array, // each element is {url:"header_image_in_tabs",id:"div_id_to_show"}
                      tabs_img_pref, // prefix for all the tabs borders
                      tabs_img_suff, // suffix for all the tabs borders (normally just ".png"
                      tabs_shape,
                      tabs_onChange, // function to call when tabs are changed (i.e redraw screen to adjust to new dimensions)
                      tabs_resize)   // if true, will resize the height of the parent element when the tabs are changed 
                      

 There should be multuiple images prepare to use with the tabs. they may have different prefixes and suffixes, the middle parts are
 as following (bhw - is half-width of the border between 2 tabs):
 
_left_sel      - image of the left side of the leftmost tab when the tab is selected (width= bhw)
_left_unsel    - image of the left side of the leftmost tab when the tab is not selected (width= bhw)
_right_sel     - image of the right side of the rightmost tab when the tab is selected (width= bhw)
_right_unsel   - image of the right side of the rightmost tab when the tab is not selected (width= bhw)
_sel           - image of the middle of the tab header when the tab is selected - width= 1px usually, will be spread over the middle part of the tab header
_unsel         - same when the tab us not selected
_sel_unsel     - border between selected tab (to the left) and unselected tab (to the right)- width=2*bhw
_unsel_sel     - border between unselected tab (to the left) and selected tab (to the right)- width=2*bhw
_unsel_unsel   - border between two unselected tabs - width=2*bhw

Example: with following files:
images/tabs16x24_left_sel.png    (8x24)
images/tabs16x24_left_unsel.png  (8x24)
images/tabs16x24_right_sel.png   (8x24)
images/tabs16x24_right_unsel.png (8x24)
images/tabs16x24_sel.png         (1x24)
images/tabs16x24_unsel.png       (1x24)
images/tabs16x24_sel_unsel.png   (16x24)
images/tabs16x24_unsel_sel.png   (16x24)
images/tabs16x24_unsel_unsel.png (16x24)

tabs_img_pref="images/tabs16x24"
tabs_img_suff=".png"
bhw=8
and tabs_shape is an 8-element array (same as bhw) taat describes the shape of the tabs borders ("t" - top, "b" - bottom, counted from the top of the image)
                   ({b:21,t:1},{b:21,t:2},{b:20,t:2},{b:20,t:3},{b:19,t:4},{b:17,t:6},{b:15,t:8},{b:13,t:10})
                      
The create Tabs function receives the DIV element ID that is designated for the tabs headers, each tab data is provided in an array of records with the following fields:
{url:"image_to_show_in_the_tab_header", - this image will be centered in the tab header
id:"DIV_element_ID_ for_the_tab_body", - ID of the tab itself that will be shown when the tab is opened
bg:"dddd88"}, - color of the tab (there should be semi-transparent 1x1 pixel images available for each color and each transparency used

The next function will set the colors to match transparency value. for each color and transparency value (except 0% and 100%) there should be 1x1 semi-transparent png image with the name:
<prefix>_RRGGBB_<opacity_in_percents=100-transparency>.png
 function setTabsTransparency(tID,transp, prefix);
 

document.webcamsTabsShape=new Array ({b:21,t:1},{b:21,t:2},{b:20,t:2},{b:20,t:3},{b:19,t:4},{b:17,t:6},{b:15,t:8},{b:13,t:10});

function initAllTabs() {
  createTabs ("idNetworkTabs",
              8,
              document.webcamsTabs,
              "images/tabs16x24",
              ".png",
              document.webcamsTabsShape); 
}


*/

function createTabs ( id, // parent DIV id - dimensions will be used for other elements
                      bhw, // border image half width (full width for the rightmost and leftmost tab sides)
                      tabs_array, // each element is {url:"header_image_in_tabs",id:"div_id_to_show"}
                      tabs_img_pref, // prefix for all the tabs borders
                      tabs_img_suff, // suffix for all the tabs borders (normally just ".png"
                      tabs_shape,
                      tabs_onChange, // function to call when tabs are changed (i.e redraw screen to adjust to new dimensions)
                      tabs_resize   // if true, will resize the height of the parent element when the tabs are changed 
){                      
  var w= parseInt(document.getElementById(id).style.width);
  var h= parseInt(document.getElementById(id).style.height);
  var n= tabs_array.length;
  var s="";
  var l=0;
  var miw;
  var l1;
  var dbgl;
  var i,j,t,b;
  for (i=0;i<n;i++) {
    dbgl=s.length;
    l1=l;
    if (i==0) {
      s+='<div id="'+id+'_lu" style="position:absolute; left:0; top:0;  width:'+bhw+'; height:'+h+'">\n';
      for (j=0;j<bhw;j++) {
       t=tabs_shape[bhw-1-j].t;
         s+='<div id="'+id+'_lu'+j+'" style="position:absolute; left:'+j+'; top:'+t+';width:1; height:'+(h-t)+';"><!-'+'- -'+'-></div>\n';
      }
      s+=   '<div style="position:absolute; top:0;left:0; width:'+bhw+';height:'+h+';"/>\n';
      s+=     '<img src="'+tabs_img_pref+'_left_unsel'+tabs_img_suff+'" style="width:'+bhw+';height:'+h+';"/>\n';
      s+=   '</div>\n';
      s+= '</div>\n';
      s+='<div id="'+id+'_ls" style="position:absolute; left:0; top:0;  width:'+bhw+'; height:'+h+'">\n';
      for (j=0;j<bhw;j++) { t=tabs_shape[bhw-1-j].t;
         s+='<div id="'+id+'_ls'+j+'" style="position:absolute; left:'+j+'; top:'+t+';width:1; height:'+(h-t)+';"><!-'+'- -'+'-></div>\n';
      } 
      s+='<div style="position:absolute; top:0;left:0; width:'+bhw+';height:'+h+';"/>\n';
      s+=   '<img src="'+tabs_img_pref+'_left_sel'+tabs_img_suff+'" style="width:'+bhw+';height:'+h+';"/>\n'+
           '</div>\n';
      s+= '</div>\n';
    }
    l+=bhw;
    miw= Math.round(w*(i+1)/n)-l-bhw;
    s+=  '<div id="'+id+'_'+i+'u" style="position:absolute; left:'+l+'; top:0;  width:'+miw+'; height:'+h+';">\n'+
            '<img src="'+tabs_img_pref+'_unsel'+tabs_img_suff+'" style="width:'+miw+';height:'+h+'"/>\n'+
         '</div>\n'+
         '<div id="'+id+'_'+i+'s" style="position:absolute; left:'+l+'; top:0;  width:'+miw+'; height:'+h+';">\n'+
            '<img src="'+tabs_img_pref+'_sel'+tabs_img_suff+'" style="width:'+miw+';height:'+h+'"/>\n'+
         '</div>\n';
    l+=miw;
    if (i<(n-1)) {
      s+='<div id="'+id+'_'+i+'uu" style="position:absolute; left:'+l+'; top:0;  width:'+(2*bhw)+'; height:'+h+'">\n';
      for (j=0;j<2*bhw;j++) {t=(j>=bhw)?(tabs_shape[2*bhw-1-j].b):(tabs_shape[j].t);
         s+='<div id="'+id+'_'+i+'uu'+j+'" style="position:absolute; left:'+j+'; top:'+t+';width:1; height:'+(h-t)+'"><!-'+'- -'+'-></div>\n';
      }
      for (j=0;j<bhw;j++)  {t= tabs_shape[bhw-1-j].t; b=tabs_shape[bhw-1-j].b;
         s+='<div id="'+id+'_'+i+'uu'+(j+2*bhw)+'" style="position:absolute; left:'+(j+bhw)+'; top:'+t+';width:1; height:'+(b-t)+'"><!-'+'- -'+'-></div>\n';
      }
      s+=   '<div  style="position:absolute; top:0;left:0; width:'+(2*bhw)+';height:'+h+';"/>\n';
      s+=      '<img src="'+tabs_img_pref+'_unsel_unsel'+tabs_img_suff+'" style="width:'+(2*bhw)+';height:'+h+'"/>\n';
      s+=   '</div>\n';
      s+= '</div>\n';
      
      s+='<div id="'+id+'_'+i+'su" style="position:absolute; left:'+l+'; top:0;  width:'+(2*bhw)+'; height:'+h+'">\n';
      for (j=0;j<2*bhw;j++) {t=(j>=bhw)?(tabs_shape[2*bhw-1-j].b):(tabs_shape[j].t);
         s+='<div id="'+id+'_'+i+'su'+j+'" style="position:absolute; left:'+j+'; top:'+t+';width:1; height:'+(h-t)+'"><!-'+'- -'+'-></div>\n';
      }
      for (j=0;j<bhw;j++)  {t= tabs_shape[bhw-1-j].t; b=tabs_shape[bhw-1-j].b;
         s+='<div id="'+id+'_'+i+'su'+(j+2*bhw)+'" style="position:absolute; left:'+(j+bhw)+'; top:'+t+';width:1; height:'+(b-t)+'"><!-'+'- -'+'-></div>\n';
      }
      s+=   '<div  style="position:absolute; top:0;left:0; width:'+(2*bhw)+';height:'+h+';"/>\n';
         s+=   '<img src="'+tabs_img_pref+'_sel_unsel'+tabs_img_suff+'" style="width:'+(2*bhw)+';height:'+h+'"/>\n';
      s+=   '</div>\n';
      s+= '</div>\n';
         
         
      s+='<div id="'+id+'_'+i+'us" style="position:absolute; left:'+l+'; top:0;  width:'+(2*bhw)+'; height:'+h+'">\n';
      for (j=0;j<2*bhw;j++) {t=(j>=bhw)?(tabs_shape[2*bhw-1-j].t):(tabs_shape[j].b);
         s+='<div id="'+id+'_'+i+'us'+j+'" style="position:absolute; left:'+j+'; top:'+t+';width:1; height:'+(h-t)+'"><!-'+'- -'+'-></div>\n';
      }
      for (j=0;j<bhw;j++)  {t= tabs_shape[j].t; b=tabs_shape[j].b;
         s+='<div id="'+id+'_'+i+'us'+(j+2*bhw)+'" style="position:absolute; left:'+j+'; top:'+t+';width:1; height:'+(b-t)+'"><!-'+'- -'+'-></div>\n';
      }
      s+=   '<div  style="position:absolute; top:0;left:0; width:'+(2*bhw)+';height:'+h+';"/>\n';
         s+='<img src="'+tabs_img_pref+'_unsel_sel'+tabs_img_suff+'" style="width:'+(2*bhw)+';height:'+h+'"/>\n';
      s+=   '</div>\n';
      s+= '</div>\n';
         
         
    } else { //last tab
    
      s+='<div id="'+id+'_ru" style="position:absolute; left:'+l+'; top:0;  width:'+bhw+'; height:'+h+'">\n';
      for (j=0;j<bhw;j++) { t=tabs_shape[j].t;
         s+='<div id="'+id+'_ru'+j+'" style="position:absolute; left:'+j+'; top:'+t+';width:1; height:'+(h-t)+'"><!-'+'- -'+'-></div>\n';
      } 
      s+=   '<div  style="position:absolute; top:0;left:0; width:'+bhw+';height:'+h+';"/>\n';
         s+=   '<img src="'+tabs_img_pref+'_right_unsel'+tabs_img_suff+'" style="width:'+bhw+';height:'+h+'"/>\n';
      s+=   '</div>\n';
      s+= '</div>\n';
         
      s+='<div id="'+id+'_rs" style="position:absolute; left:'+l+'; top:0;  width:'+bhw+'; height:'+h+'">\n';
      for (j=0;j<bhw;j++) { t=tabs_shape[j].t;
         s+='<div id="'+id+'_rs'+j+'" style="position:absolute; left:'+j+'; top:'+t+';width:1; height:'+(h-t)+'"><!-'+'- -'+'-></div>\n';
      } 
      s+=   '<div  style="position:absolute; top:0;left:0; width:'+bhw+';height:'+h+';"/>\n';
         s+=   '<img src="'+tabs_img_pref+'_right_sel'+tabs_img_suff+'" style="width:'+bhw+';height:'+h+'"/>\n';
      s+=   '</div>\n';
      s+= '</div>\n';
    }
    l+=bhw;
    if (tabs_array[i].url.substr(0,1)=="*") { // test title
       s+='<div id="'+id+'_'+i+'t" style="text-align: center; position:absolute; left:'+l1+'; top:4;  width:'+(l-l1)+'; height:'+h+';" onclick="onClickTabs('+"'"+id+"',"+i+');"/>\n'+
          tabs_array[i].url.substr(1)+'</div>\n'; // needs something to be in the div (comments OK). Split html comments tags to escape them if this code will be in html file.
    } else {    
       s+='<div id="'+id+'_'+i+'t" style="position:absolute; left:'+l1+'; top:0;  width:'+(l-l1)+'; height:'+h+
          '; background-image: url('+tabs_array[i].url+'); background-repeat:no-repeat; background-position: center center;" onclick="onClickTabs('+"'"+id+"',"+i+');"/>\n'+
          '<!-'+'- -'+'-></div>\n'; // needs something to be in the div (comments OK). Split html comments tags to escape them if this code will be in html file.
    }
      
      s+='<input type="hidden" id="'+id+'_'+i+'hi" value="'+ tabs_array[i].id +'"/>\n';
      s+='<input type="hidden" id="'+id+'_'+i+'bg" value="'+ tabs_array[i].bg +'"/>\n';  
    //alert ("i="+i+" l1="+l1+" miw="+miw+" l="+l);
    //alert(s.substr(dbgl,s.length-dbgl));
  }
  s+='<input type="hidden" id="'+id+'_numberOfTabs" value="'+ tabs_array.length +'"/>\n';
  s+='<input type="hidden" id="'+id+'_selected" value="-1"/>\n';
  s+='<input type="hidden" id="'+id+'_bhw" value="'+ bhw +'"/>\n';
  s+='<input type="hidden" id="'+id+'_chng" value="'+ tabs_onChange +'"/>\n';
  s+='<input type="hidden" id="'+id+'_resize" value="'+ (tabs_resize?"1":"")+'"/>\n';

  document.getElementById(id).innerHTML=s;
  onClickTabs(id,0,n,tabs_array[0].id);
}

 // will set the colors to match transparency value. for each color and transparency value (except 0% and 100%) there should be 1x1 semi-transparent png image with the name:
 // <prefix>_RRGGBB_<opacity_in_percents=100-transparency>.png
 function setTabsTransparency(tID,transp, prefix) {
   var i,j;
   var dID;
   var bg;
   var bgImg;
   var isTransparent=   (transp>0);
   var noBgImage=      (transp==100) || !isTransparent;
   if (!document.getElementById(tID+'_numberOfTabs')) return; // if this is called before tabs are created
   var nTab=parseInt(document.getElementById(tID+'_numberOfTabs').value);
   var bhw= parseInt(document.getElementById(tID+'_bhw').value);
   for (i=0;i<nTab;i++) {
     dID=document.getElementById(tID+'_'+i+'hi').value;
     bg=document.getElementById(tID+'_'+i+'bg').value;
     bgImg="url("+prefix+bg+"_"+(100-transp)+".png)";
     bg="#"+bg;
// tab pages     
     document.getElementById(dID).style.backgroundColor=isTransparent?"":bg;
     document.getElementById(dID).style.backgroundImage=noBgImage?"":bgImg;
// tab middle sections     
     document.getElementById(tID+'_'+i+'u').style.backgroundColor=isTransparent?"":bg;
     document.getElementById(tID+'_'+i+'u').style.backgroundImage=noBgImage?"":bgImg;
     document.getElementById(tID+'_'+i+'s').style.backgroundColor=isTransparent?"":bg;
     document.getElementById(tID+'_'+i+'s').style.backgroundImage=noBgImage?"":bgImg;
// left sides of the leftmost tab     
     if (i==0) {
       for (j=0;j<bhw;j++) {
         if (document.getElementById(tID+'_lu'+j)) document.getElementById(tID+'_lu'+j).style.backgroundColor=isTransparent?"":bg;
         if (document.getElementById(tID+'_lu'+j)) document.getElementById(tID+'_lu'+j).style.backgroundImage=noBgImage?"":bgImg;
         document.getElementById(tID+'_ls'+j).style.backgroundColor=isTransparent?"":bg;
         document.getElementById(tID+'_ls'+j).style.backgroundImage=noBgImage?"":bgImg;
       }
     } else {
//left side of other (not the leftmost) tabs     
       for (j=2*bhw;j<3*bhw;j++) {
         document.getElementById(tID+'_'+(i-1)+'uu'+j).style.backgroundColor=isTransparent?"":bg;
         document.getElementById(tID+'_'+(i-1)+'uu'+j).style.backgroundImage=noBgImage?"":bgImg;
         document.getElementById(tID+'_'+(i-1)+'su'+j).style.backgroundColor=isTransparent?"":bg;
         document.getElementById(tID+'_'+(i-1)+'su'+j).style.backgroundImage=noBgImage?"":bgImg;
       }
       for (j=0;j<2*bhw;j++) {
         document.getElementById(tID+'_'+(i-1)+'us'+j).style.backgroundColor=isTransparent?"":bg;
         document.getElementById(tID+'_'+(i-1)+'us'+j).style.backgroundImage=noBgImage?"":bgImg;
       }
     }     
// right sides of the leftmost tab     
     if (i==(nTab-1)) {
       for (j=0;j<bhw;j++) {
         document.getElementById(tID+'_ru'+j).style.backgroundColor=isTransparent?"":bg;
         document.getElementById(tID+'_ru'+j).style.backgroundImage=noBgImage?"":bgImg;
         document.getElementById(tID+'_rs'+j).style.backgroundColor=isTransparent?"":bg;
         document.getElementById(tID+'_rs'+j).style.backgroundImage=noBgImage?"":bgImg;
       }
     } else {
//right side of other (not the rightmost) tabs     
       for (j=0;j<2*bhw;j++) {
         document.getElementById(tID+'_'+i+'uu'+j).style.backgroundColor=isTransparent?"":bg;
         document.getElementById(tID+'_'+i+'uu'+j).style.backgroundImage=noBgImage?"":bgImg;
         document.getElementById(tID+'_'+i+'su'+j).style.backgroundColor=isTransparent?"":bg;
         document.getElementById(tID+'_'+i+'su'+j).style.backgroundImage=noBgImage?"":bgImg;
       }
       for (j=2*bhw;j<3*bhw;j++) {
         document.getElementById(tID+'_'+i+'us'+j).style.backgroundColor=isTransparent?"":bg;
         document.getElementById(tID+'_'+i+'us'+j).style.backgroundImage=noBgImage?"":bgImg;
       }
     }
   }
 }
/* 
 function isShownTabs(tID,iTab) {
 // try to see if it is visible regardless of what hides it (
 
 }
*/
 function onClickTabs(tID,iTab) {
// alert ("tID="+tID+" iTab="+iTab);
  var dID;
//document.title="tID="+tID+" iTab="+iTab;
  var nTab=parseInt(document.getElementById(tID+'_numberOfTabs').value);
  if (!((iTab>=0) && (iTab <nTab))) iTab=-1; // no tabs open
  for (i=0; i< nTab; i++) {
   dID=document.getElementById(tID+'_'+i+'hi').value;
   document.getElementById(dID).style.display=(i==iTab)?"":"none";
    if (i==iTab) {
      if (i==0) {
        document.getElementById(tID+'_lu').style.display="none";
        document.getElementById(tID+'_ls').style.display="";
      }
      document.getElementById(tID+'_'+i+'u').style.display="none"; 
      document.getElementById(tID+'_'+i+'s').style.display=""; 
      if (i<(nTab-1)) {
        document.getElementById(tID+'_'+i+'uu').style.display="none"; 
        document.getElementById(tID+'_'+i+'us').style.display="none"; 
        document.getElementById(tID+'_'+i+'su').style.display=""; 
      } else {
        document.getElementById(tID+'_ru').style.display="none";
        document.getElementById(tID+'_rs').style.display="";
      }
    }else {
      if (i==0) {
        document.getElementById(tID+'_lu').style.display="";
        document.getElementById(tID+'_ls').style.display="none";
      }
      document.getElementById(tID+'_'+i+'u').style.display=""; 
      document.getElementById(tID+'_'+i+'s').style.display="none"; 
      if (i<(nTab-1)) {
        document.getElementById(tID+'_'+i+'uu').style.display=(i==(iTab-1))?"none":"";
        document.getElementById(tID+'_'+i+'us').style.display=(i==(iTab-1))?"":"none"; 
        document.getElementById(tID+'_'+i+'su').style.display="none"; 
      } else {
        document.getElementById(tID+'_ru').style.display="";
        document.getElementById(tID+'_rs').style.display="none";
      }
    }
  }
  if (document.getElementById(tID+'_resize').value) {
// adjust the parent height to the height of the current tab
// maybe use offsetParent, not parentNode?
// offsetHeight works only if element is actually visible !!!
// (iTab<0) if no tab is selected - use only the header
    document.getElementById(tID).parentNode.style.height=(parseInt(document.getElementById(tID).style.height) +
       ((iTab>=0)?parseInt(document.getElementById(document.getElementById(tID+'_'+iTab+'hi').value).offsetHeight):0))+"px";
//alert ("tID="+tID+" iTab="+iTab+" height="+ (parseInt(document.getElementById(tID).style.height) + ((iTab>=0)?parseInt(document.getElementById(document.getElementById(tID+'_'+iTab+'hi').value).offsetHeight):0))+"px");    
  }

  document.getElementById(tID+'_selected').value=iTab;
  if (document.getElementById(tID+'_chng').value) eval (document.getElementById(tID+'_chng').value);
 }

 function getSelectedTab(tID) {
   return parseInt(document.getElementById(tID+'_selected').value);
 }
