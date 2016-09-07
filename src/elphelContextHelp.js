/*
*! -----------------------------------------------------------------------------**
*! elphelContextHelp.js
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
*!  elphelContextHelp.js
*!
*/

// tooltips
/*
  document.debugHelp=true;    // will show ID trace until the content help is reached

*/


function createTooltips (id,
                         w, // size of a rounding element (corner will be twice bigger)
                         url, // for all the images (0/25/75/100%)
                         color, // will be used for semitransparent colors (0/25/75/100%) (currently "fffdd00"
                         color_prefix, // currently "images/bg_" ->images/bg_fffdd0_25.png
                         maxwidth) { // width can be limited by the outer bow size, but this is the maximum it will go if the outer box is big

   var pw=parseInt(document.getElementById(id).style.width);
   if (!(pw>(4*w))) {
     pw=4*w;
     document.getElementById(id).style.width=pw+"px";
   } 
   var w2=2*w;
   var mw=pw-2*w2;
   
   var s= '<div id="'+id+'_maskb" style="position: fixed;"><!'+'-- --'+'></div>\n'+
          '<div id="'+id+'_maskc" style="position: fixed;"><!'+'-- --'+'></div>\n';
                         
       s+= '<div id="'+id+'_nw"   style="position: absolute; left:0;top:0;width:'+(w2)+';height:'+(w2)+';background-image:url('+url+');"><!'+'-- --'+'></div>\n'+
          '<div id="'+id+'_n"    style="position: absolute; left:'+(w2)+';top:'+(w)+';width:'+(mw)+';height:'+(w)+';"><!'+'-- --'+'></div>\n'+
          '<div id="'+id+'_ne"   style="position: absolute; left:'+(pw-w2)+';top:'+(0)+';width:'+(w2)+';height:'+(w2)+';background-image:url('+url+');"><!'+'-- --'+'></div>\n'+
          '<div id="'+id+'_w"    style="position: absolute; left:'+(w)+';top:'+(w2)+';width:'+(w)+';"><!'+'-- --'+'></div>\n'+
          '<div id="'+id+'_body" style="position: absolute; left:'+(w2)+';top:'+(w2)+';width:'+(mw)+';">&nbsp;</div>\n'+
          '<div id="'+id+'_e" style="position: absolute; left:'+(pw-w2)+';top:'+(w2)+';width:'+(w)+';"><!'+'-- --'+'></div>\n'+
          '<div id="'+id+'_sw"   style="position: absolute; left:0;width:'+(w2)+';height:'+(w2)+';background-image:url('+url+');"><!'+'-- --'+'></div>\n'+
          '<div id="'+id+'_s"    style="position: absolute; left:'+(w2)+';width:'+(mw)+';height:'+(w)+';"><!'+'-- --'+'></div>\n'+
          '<div id="'+id+'_se"   style="position: absolute; left:'+(pw-w2)+';width:'+(w2)+';height:'+(w2)+';background-image:url('+url+');"><!'+'-- --'+'></div>\n'+
          '<input type="hidden" id="'+id+'_bgColor" value="'+ color +'"/>\n'+  
          '<input type="hidden" id="'+id+'_bgColorPrefix" value="'+ color_prefix +'"/>\n'+  
          '<input type="hidden" id="'+id+'_transparency" value="-1"/>\n'+
          '<input type="hidden" id="'+id+'_corner" value="ne"/>\n'+
          '<input type="hidden" id="'+id+'_maxwidth" value="'+maxwidth+'"/>\n';
   document.getElementById(id).innerHTML=s;  
   document.getElementById(id).style.display="none"; // don't show it yet
}                         
function resizeTooltips(id) { // update dimensions (heights) to accomodate content of the _body
// just in case if the width was changed too
  var w2=parseInt(document.getElementById(id+"_nw").style.width);
  w=Math.round(w2/2);
  var pw=parseInt(document.getElementById(id).style.width);
  var mw=pw-2*w2;
  document.getElementById(id+"_body").style.width=mw+"px";
  document.getElementById(id+"_n").style.width=mw+"px";
  document.getElementById(id+"_s").style.width=mw+"px";
// lefts too  
  document.getElementById(id+"_ne").style.left=(pw-w2)+"px";
  document.getElementById(id+"_e").style.left= (pw-w2)+"px";
  document.getElementById(id+"_se").style.left=(pw-w2)+"px";
// should be measured after width was changed  
  var mh=parseInt(document.getElementById(id+"_body").offsetHeight);
  document.getElementById(id).style.height=(2*w2+mh)+"px";
  document.getElementById(id+"_w").style.height=mh+"px";
  document.getElementById(id+"_e").style.height=mh+"px";
  document.getElementById(id+"_sw").style.top=(w2+mh)+"px";
  document.getElementById(id+"_s").style.top= (w2+mh)+"px";
  document.getElementById(id+"_se").style.top=(w2+mh)+"px";

}


function setTooltipsCorner(id,
                       corner) {  // only "nw","ne","se","sw"
// first check if we really need to change anything
   if (corner != document.getElementById(id+"_corner").value) {
      document.getElementById(id+"_corner").value=corner;
      setTooltipsBg(id);
   }
 }  
   
function setTooltipsTransparency(id,
                       transp)  // only 0/25/50/75/100 are supported
                        {
   transp=25*Math.round(transp/25);
   if (transp<0) transp=0;
   if (transp>100) transp=100;
   if (!((transp>=0) && (transp<=100))) transp=50; // if NaN
// first check if we really need to change anything

   if (transp != parseInt(document.getElementById(id+"_transparency").value)) {
     document.getElementById(id+"_transparency").value=transp;
     setTooltipsBg(id);
   }
}   
   
function setTooltipsBg(id) {
   
   var transp=parseInt(document.getElementById(id+"_transparency").value);
   var corner = document.getElementById(id+"_corner").value;
   var bg_url="url("+document.getElementById(id+"_bgColorPrefix").value+document.getElementById(id+"_bgColor").value+"_"+(100-transp)+".png)";
   var bg_col="#"+document.getElementById(id+"_bgColor").value;
   if ((transp==0) || (transp==100))  bg_url="";
   if (transp!=0) bg_col="";
                                       
   document.getElementById(id+"_n"   ).style.backgroundColor=bg_col;
   document.getElementById(id+"_n"   ).style.backgroundImage=bg_url;
   document.getElementById(id+"_e"   ).style.backgroundColor=bg_col;
   document.getElementById(id+"_e"   ).style.backgroundImage=bg_url;
   document.getElementById(id+"_s"   ).style.backgroundColor=bg_col;
   document.getElementById(id+"_s"   ).style.backgroundImage=bg_url;
   document.getElementById(id+"_w"   ).style.backgroundColor=bg_col;
   document.getElementById(id+"_w"   ).style.backgroundImage=bg_url;
   document.getElementById(id+"_body").style.backgroundImage=bg_url;
   document.getElementById(id+"_body").style.backgroundColor=bg_col;
   var w2=parseInt(document.getElementById(id+"_nw").style.width);
   var shft_right=2*w2;
   var shft_down= 2*w2*(transp/25); // top - non-transparent

   var nw=(-1     -((corner=="nw")?shft_right:0))+"px "+ (0     -shft_down)+"px";  
   var ne=(-1 -w2 -((corner=="ne")?shft_right:0))+"px "+ (0     -shft_down)+"px";  
   var se=(-1 -w2 -((corner=="se")?shft_right:0))+"px "+ (0 -w2 -shft_down)+"px";  
   var sw=(-1     -((corner=="sw")?shft_right:0))+"px "+ (0 -w2 -shft_down)+"px"; 

   document.getElementById(id+"_nw"   ).style.backgroundPosition= nw;
   document.getElementById(id+"_ne"   ).style.backgroundPosition= ne;
   document.getElementById(id+"_se"   ).style.backgroundPosition= se;
   document.getElementById(id+"_sw"   ).style.backgroundPosition= sw;
   

}
function showTooltipsMask(id) {
// to be able to hover over plugin
 var l= parseInt (document.getElementById(id).style.left);
 var t= parseInt (document.getElementById(id).style.top);
// var bw=parseInt (document.getElementById(id+"_body").style.width);
// var bh=parseInt (document.getElementById(id+"_body").style.height);
 var w2=parseInt(document.getElementById(id+"_nw").style.width);
 w=Math.round(w2/2);
 var pw=parseInt(document.getElementById(id).style.width);
 var ph=parseInt(document.getElementById(id).style.height);
 var corner =   document.getElementById(id+"_corner").value; // nw,ne/sw/se

 document.getElementById(id+"_maskb"  ).style.left=  l+w+"px";
 document.getElementById(id+"_maskb"  ).style.top=   t+w+"px";
 document.getElementById(id+"_maskb"  ).style.width= pw-w2+"px";
 document.getElementById(id+"_maskb"  ).style.height=  ph-w2+"px";
 document.getElementById(id+"_maskc"  ).style.left=
   l+parseInt(document.getElementById(id+"_"+corner).style.left)+"px";
 document.getElementById(id+"_maskc"  ).style.top=
   t+parseInt(document.getElementById(id+"_"+corner).style.top)+"px";
 document.getElementById(id+"_maskc"  ).style.width= w2+"px";
 document.getElementById(id+"_maskc"  ).style.height=w2+"px";

} 
function showTooltipsAt (id,      // tooltips outer DIV id
                        lt,      // {l:,t:} where to point (relative to the tooltips DIV parent (DIV_ALL?)
                        dist)  {  // distance (x) from the xy to the pointer of the tooltip box
   var maxwidth=parseInt(document.getElementById(id+"_maxwidth").value)+dist;
//   var w=maxwidth;
//alert ("id="+id);
//alert ("pid="+id);

// let's first see if there is very short message that is one line and does not need the full width.
   document.getElementById(id+"_body").style.width=""; // free it
   document.getElementById(id).style.width="100%";
//   resizeTooltips(id);
//document.title+="**"+document.getElementById(id+"_body").offsetWidth+"/"+document.getElementById(id+"_body").offsetHeight;  
   var w=parseInt(document.getElementById(id+"_body").offsetWidth)+2*parseInt(document.getElementById(id+"_nw").style.width)+dist;
   if (w < maxwidth) maxwidth = w;
   else w=maxwidth;
   var ow=parseInt(document.getElementById(id).parentNode.style.width);
   var oh=parseInt(document.getElementById(id).parentNode.style.height);
   var flipX=false;
   var flipY=false;
   if ((ow-lt.l) < maxwidth) {
    flipX=((2*lt.l) > ow);
    w=flipX?((lt.l>maxwidth)?maxwidth:lt.l):(ow-lt.l)
   }
//now let's set the width and see how high will be the box
   w-=dist;
   document.getElementById(id).style.width=w+"px";
   resizeTooltips(id);
   var h=parseInt(document.getElementById(id).style.height)+dist;
   if ((oh-lt.t) < h) {
    flipY=((2*lt.t) > oh);
   }
   h-=dist;
   document.getElementById(id).style.left= lt.l+(flipX? (-w-dist):(dist))+"px";
   document.getElementById(id).style.top=  lt.t+(flipY? (-h-dist):(dist))+"px";
   var corner=(flipX?(flipY?"se":"ne"):(flipY?"sw":"nw"));
   setTooltipsCorner(id,corner);
   showTooltipsMask(id); // protect against plugin
}                        

function setTooltipsText (id, txt) {
  document.getElementById(id+"_body").innerHTML=txt;
}

function setTooltipsTextFromId (id, txt_id) {
  document.getElementById(id+"_body").innerHTML=document.getElementById(txt_id).innerHTML;
}

//============

// context help will look for invisible DIVs with the same name as the target with prefix "h_" and return the body of that DIV (innerHTML) as the body of the floating window.
// it will traverse the node tree up until some div is found, if document.debugHelp is true, the IDs of the traversed nodes will be displayed too

document.controlTypesList=new Array ("slIder","frAmesel");
function contextHelp(e) {
// if (document.getElementById("DIV_ALL").style.cursor)
   if (!e) {
      var e = window.event;
      e.pageX=event.clientX;
      e.pageY=event.clientY;
   }
   document.shiftKey=e.shiftKey;
   
   var targ;
   if (e.target) targ = e.target;
   else if (e.srcElement) targ = e.srcElement;
   if (targ.nodeType == 3) // defeat Safari bug
      targ = targ.parentNode;
   var nd=targ;
   var nd0id=nd.id;
   var txt="";   
/*   
   while (nd && ((!document.getElementById("h_"+nd.id)) || ( document.getElementById("h_"+nd.id).innerHTML.substr(0,1) == "*" ) )) {
     if (document.debugHelp) txt+= '<b>'+nd.id+'</b><br/>\n';
     if ( document.getElementById("h_"+nd.id).innerHTML.substr(0,1) == "*" ) txt+= document.getElementById("h_"+nd.id).value.substr(1);
     nd=nd.parentNode;
   }   
*/ 
   var ih;
   var cont;  
   while (nd) {
     if (document.getElementById("h_"+nd.id)) ih= document.getElementById("h_"+nd.id).innerHTML;
     else ih="";
     brk=(ih!="") && (ih.substr(0,1)!="*") ;
     if (!brk && (ih!="")) ih=ih.substr(1);
     if (document.debugHelp) {
      if (ih) txt+="<b>"+nd.id+":</b> "+ih;
      else    txt+="<b>"+nd.id+"</b><br/>\n"
     } else txt+=ih;
     if (brk) break;
     nd=nd.parentNode;
   }
// little hack - add help for the Elphel controls if applicable;
   var i,j;
   for (i=0; i<document.controlTypesList.length;i++) { 
       if ((nd0id.indexOf(document.controlTypesList[i])>0) && document.getElementById("h_"+document.controlTypesList[i])) {
// make it only accept just ending with a keyword or having "_"
         j= nd0id.indexOf(document.controlTypesList[i])+document.controlTypesList[i].length;
         if ((nd0id.length==j) || (nd0id.substr(j,1)=="_"))  txt+=document.getElementById("h_"+document.controlTypesList[i]).innerHTML;
       } 
   }    
   setTooltipsText ("idTooltips", txt);
   setTooltipsTransparency("idTooltips", getBuTton ("idTranspTooltips_CB").s? controlsTransparency():0);
   showTooltipsAt ("idTooltips", {l:e.pageX,t:e.pageY}, 10);
}
//idTranspTooltips_LB