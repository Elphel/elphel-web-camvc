<?php
/*!*******************************************************************************
*! FILE NAME  : camvc.php
*! DESCRIPTION: PHP companion of camvc
*! Copyright (C) 2008-2016 Elphel, Inc
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
*!  $Log: camvc.php,v $
*!  Revision 1.9  2010/06/04 01:56:51  elphel
*!  Initial support for the multi-sensor operation
*!
*!  Revision 1.8  2008/12/10 07:23:45  elphel
*!  Added "sleep=" parameter (for simulation of long camera responces)
*!
*!  Revision 1.7  2008/12/09 07:51:52  elphel
*!  Partial support of ccam.ftp added alerts on non-yet-ported control tabs. Temporary launches autocampars to save selected parameters fro next autostart
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
*!  Revision 1.2  2008/11/30 05:01:42  elphel
*!  new scale for gains
*!
*!  Revision 1.1.1.1  2008/11/27 20:04:03  elphel
*!
*!
*!  Revision 1.6  2008/11/17 23:42:46  elphel
*!  changed myval()o accept numbers in ""
*!
*!  Revision 1.5  2008/11/16 17:35:53  elphel
*!  restored histogram (autoexposure) window control
*!
*!  Revision 1.4  2008/11/13 05:40:45  elphel
*!  8.0.alpha16 - modified histogram storage, profiling
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
function out1x1gif() {
         header("Content-Type: image/gif");
         header("Content-Length: 35\n");
         echo "GIF87a\x01\x00\x01\x00\x80\x01\x00\x00\x00\x00".
              "\xff\xff\xff\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x4c".
              "\x01\x00\x3b";
 }
function myval ($s) {
  $s=trim($s,"\" ");
  if (strtoupper(substr($s,0,2))=="0X")   return intval(hexdec($s));
  else return intval($s);
}

/**
 * @brief Decode set=... parameters
 * @param $encoded_set - string representation of [frame]/parameter:value array
 */

function decodeSet ($encoded_set) {
  global $set,$allNative;
  $set=array();
  $frame=0;
  if (!$encoded_set) return;
  $done=explode("/",rtrim($encoded_set,'/'));
  foreach ($done as $term) {
    $term=explode(":",$term);
    if (count($term)==1) {
      $frame=$term[0];
    } else {
      if (($term[1]!="undefined") && ($term[1]!="NaN") && ($term[1]!=666)) { // debug - if the value is set to 666 it will not listen and client should resend it
//        $set[$term[0]]= array('value'=>is_array ($term[1])?$term[1]:(is_numeric($term[1])?(float)$term[1]:$term[1]), 'delay'=>$frame, 'native'=>abstractToNative($term[0]));
        $set[$term[0]]= array('value'=>$term[1], 'delay'=>$frame, 'native'=>abstractToNative($term[0]));
        foreach ($set[$term[0]]['native'] as $nat=>$natVal)  $allNative[$nat]=0; /// add to the parameters to be read
      }
    }
  }
}


function fixGammaBlack() {
  global $set;
  $gampxl=((array_key_exists('gam',$set))?1:0) |
          ((array_key_exists('pxl',$set))?2:0);
  if ($gampxl==0) return;
  else if ($gampxl==3) {
    $set['pxl']['delay']=  $set['gam']['delay']; /// make them have the same delay - just in case
     elphel_gamma_add ((int)$set['gam'], (int) $set['pxl']);
  } else { /// remove
    if ($gampxl & 1) unset ($set['gam']);
    if ($gampxl & 2) unset ($set['pxl']);
  }
}


///TODO: Don't forget to load gamma tables used - done
function prepSetNative() {
  global $set,$allNative,$setNative;
  $setNative=array();
  foreach ($set as $absPar=>$value) {
    $delay= $value['delay'];
    $natArr=$value['native']; // array of name/scale pairs
    if (!array_key_exists($delay,$setNative)) $setNative[$delay]=array();
    switch ($absPar) {
      case "comp_run":
        $nat=($value['value']=='single')?'COMPRESSOR_SINGLE':'COMPRESSOR_RUN';
        $scale=reset ($natArr);
        $val=array_search ($value['value'],$scale);
        if ($val !== false) $setNative[$delay][$nat]= (int) $val;
        break; 
      case "sens_run":
        $nat=($value['value']=='single')?'SENSOR_SINGLE':'SENSOR_RUN';
        $scale=reset ($natArr);
        $val=array_search ($value['value'],$scale);
        if ($val !== false) $setNative[$delay][$nat]= (int) $val;
        break;
      case "gam":///   return array ("GTAB_R__0816"=>100,"GTAB_G__0816"=>100,"GTAB_GB__0816"=>100,"GTAB_B__0816"=>100);
        $k= (float) $value['value'];
        $setNative[$delay]["GTAB_R__0816"] =(int) round($natArr["GTAB_R__0816"]  * $k);
        $setNative[$delay]["GTAB_G__0816"] =(int) round($natArr["GTAB_G__0816"]  * $k);
        $setNative[$delay]["GTAB_B__0816"] =(int) round($natArr["GTAB_B__0816"]  * $k);
        $setNative[$delay]["GTAB_GB__0816"]=(int) round($natArr["GTAB_GB__0816"] * $k);
        break; 
      case "pxl":///   return array ("GTAB_R__0824"=>100,"GTAB_G__0824"=>100,"GTAB_GB__0824"=>100,"GTAB_B__0824"=>100);
        $k= (float) $value['value'];
        $setNative[$delay]["GTAB_R__0824"] =(int) round($natArr["GTAB_R__0824"]  * $k);
        $setNative[$delay]["GTAB_G__0824"] =(int) round($natArr["GTAB_G__0824"]  * $k);
        $setNative[$delay]["GTAB_B__0824"] =(int) round($natArr["GTAB_B__0824"]  * $k);
        $setNative[$delay]["GTAB_GB__0824"]=(int) round($natArr["GTAB_GB__0824"] * $k);
        break; 
      default:
///******************************
        $scale=reset ($natArr);
        if (is_array($scale)) {
          $val=array_search ($value['value'],$scale);
//echo "<pre>scale=";print_r($scale);echo "value="; print_r($value);echo " val=$val \n</pre>";
          if ($val !== false) $setNative[$delay][key($natArr)]= (int) $val;
        } else $setNative[$delay][key($natArr)]= (int) round(((float) $value['value']) * $scale);
        break;
    } ///switch ($absPar)
  } ///foreach ($set as $absPar=>$value)
/// second pass - copy native values back to the $set array (to be reported to the client to compare to the values read later
  foreach ($set as $absPar=>$value) {
    $delay= $value['delay'];
    $natArr=$value['native']; // array of name/scale pairs
    foreach ($natArr as $natName => $natValue) {
      $set[$absPar]['native'][$natName]=$setNative[$delay][$natName];
    }
  } ///foreach ($set as $absPar=>$value) 
}
function applySetNative($ahead) {
  global $set,$setNative,$pgmFrameNumber;
  $pgmFrameNumber=elphel_get_frame($GLOBALS['sensor_port'])+$ahead;
///NOTE: no verification (and no waiting) that the trget frame is not too far in the future
  foreach ($setNative as $since=>$pgmpars) {
     elphel_set_P_arr($GLOBALS['sensor_port'],$pgmpars, $pgmFrameNumber+$since);
  }
}

/**
 * @brief Scan commands for possible changing gamma tables, calculate them in advance
 * (driver can only scale gamma, not calculate prototypes)
 * @param todo - array of arrays of parameter chnages
 */

function  addGammas() {
   global $setNative,$gammas; /// $gammas made global - just for debugging
   $gammas=array();
   foreach ($setNative as $pars) {
     if (array_key_exists('GTAB_R', $pars)) $gammas[$pars['GTAB_R' ]>>16]=1; /// duplicates will be eliminated
     if (array_key_exists('GTAB_G', $pars)) $gammas[$pars['GTAB_G' ]>>16]=1;
     if (array_key_exists('GTAB_GB',$pars)) $gammas[$pars['GTAB_GB']>>16]=1;
     if (array_key_exists('GTAB_B', $pars)) $gammas[$pars['GTAB_B' ]>>16]=1;

     if (array_key_exists('GTAB_R__0816',  $pars)) $gammas[$pars['GTAB_R__0816']  |  ($pars['GTAB_R__0824']  << 8)]=1; /// duplicates will be eliminated
     if (array_key_exists('GTAB_G__0816',  $pars)) $gammas[$pars['GTAB_G__0816']  |  ($pars['GTAB_G__0824']  << 8)]=1; /// duplicates will be eliminated
     if (array_key_exists('GTAB_GB__0816', $pars)) $gammas[$pars['GTAB_GB__0816'] |  ($pars['GTAB_GB__0824'] << 8)]=1; /// duplicates will be eliminated
     if (array_key_exists('GTAB_B__0816',  $pars)) $gammas[$pars['GTAB_B__0816']  |  ($pars['GTAB_B__0824']  << 8)]=1; /// duplicates will be eliminated
   }
//   var_dump($gammas);
   foreach ($gammas as $gamma_black=>$whatever) {
     $black=($gamma_black>>8) & 0xff;
     $gamma=($gamma_black & 0xff)*0.01;
     elphel_gamma_add($gamma, $black);
   }
}

function abstractToNative($absPar) {
  switch ($absPar) {
    case "msens": return array ("SENS_AVAIL"=>1);
    case "mseq":  return array ("MULTI_SEQUENCE"=>1);
    case "mmod":  return array ("MULTI_MODE"=>1);
    case "msel":  return array ("MULTI_SELECTED"=>1);
    case "e":     return array ("EXPOS"=>1000);  /// exposure (e) in ms multiplied by 1000.0 to get internal EXPOS in usec
    case "ve":    return array ("VEXPOS"=>1);
    case "fps":   return array ("FP1000S"=>1000);
    case "fpslm": return array ("FP1000SLIM"=>1000);
    case "fpsflags": return array ("FPSFLAGS"=>1);
    case "color": return array ("COLOR"=>1);
    case "fliph": return array ("FLIPH"=>1);
    case "flipv": return array ("FLIPV"=>1);
    case "ww":    return array ("WOI_WIDTH"=>1);
    case "wh":    return array ("WOI_HEIGHT"=>1);
    case "wl":    return array ("WOI_LEFT"=>1);
    case "wt":    return array ("WOI_TOP"=>1);
    case "aw":    return array ("ACTUAL_WIDTH"=>1);
    case "ah":    return array ("ACTUAL_HEIGHT"=>1);
    case "dh":    return array ("DCM_HOR"=>1);
    case "dv":    return array ("DCM_VERT"=>1);
    case "bh":    return array ("BIN_HOR"=>1);
    case "bv":    return array ("BIN_VERT"=>1);
    case "iq":    return array ("QUALITY"=>1); // percents
    case "gr":    return array ("GAINR"=>0x10000);
    case "gg":    return array ("GAING"=>0x10000);
    case "ggb":   return array ("GAINGB"=>0x10000);
    case "gb":    return array ("GAINB"=>0x10000);
//    case "rscale":return array ("GTAB_R__1600"=>1024, "GTAB_G__1600"=>1024);
//    case "bscale":return array ("GTAB_B__1600"=>1024, "GTAB_G__1600"=>1024);
//    case "gscale":return array ("GTAB_GB__1600"=>1024,"GTAB_G__1600"=>1024);
    case "rscale":return array ("RSCALE"=>0x10000);
    case "bscale":return array ("BSCALE"=>0x10000);
    case "gscale":return array ("GSCALE"=>0x10000);

    case "wbrs":return array ("WB_SCALE_R" =>0x10000);
    case "wbgs":return array ("WB_SCALE_GB"=>0x10000);
    case "wbbs":return array ("WB_SCALE_B" =>0x10000);
    case "wben":return array ("WB_EN"=>1);

    case "bit":   return array ("BIT"=>1);
    case "gam":   return array ("GTAB_R__0816"=>100,"GTAB_G__0816"=>100,"GTAB_GB__0816"=>100,"GTAB_B__0816"=>100);// (0..1.0..)
    case "pxl":   return array ("GTAB_R__0824"=>1,  "GTAB_G__0824"=>  1,"GTAB_GB__0824"=>  1,"GTAB_B__0824"=>  1);
    case "csb":   return array ("COLOR_SATURATION_BLUE"=>100);
    case "csr":   return array ("COLOR_SATURATION_RED"=>100);
    case "comp_run": return array ("COMPRESSOR_RUN"=>array("stop","single","run"));
    case "sens_run": return array ("SENSOR_RUN"=>array("stop","single","run"));
    case "sensor":   return array ("SENSOR"=>array(56 => "MT9F002", 4 => "ZR32112", 8 => "ZR32212",32 => "KAC1310",36 => "KAC5000",48 => "MI1300",49 => "MT9M001",50 => "MT9D001",51 => "MT9T001",52 => "MT9P001",64 => "IBIS51300"));
    case "decXmask": return array ("SENSOR"=>array(56 => 255,       4 => 139,       8 => 139,      32 => 32907,    36 => 15,       48 => 139,     49 => 139,      50 => 139,      51 => 255,      52 => 255,      64 => 0));
    case "decYmask": return array ("SENSOR"=>array(56 => 255,       4 => 139,       8 => 139,      32 => 32907,    36 => 13,       48 => 139,     49 => 139,      50 => 139,      51 => 255,      52 => 255,      64 => 0));
    case "binXmask": return array ("SENSOR"=>array(56 => 255,       4 =>   0,       8 =>   0,      32 =>     0,    36 =>  3,       48 =>   0,     49 =>   0,      50 =>   0,      51 => 255,      52 => 255,      64 => 0));
    case "binYmask": return array ("SENSOR"=>array(56 => 255,       4 =>   0,       8 =>   0,      32 =>     0,    36 =>  3,       48 =>   0,     49 =>   0,      50 =>   0,      51 => 255,      52 => 255,      64 => 0));
    case "hrw":    return array ("HISTWND_RWIDTH"=>0x10000);
    case "hrh":    return array ("HISTWND_RHEIGHT"=>0x10000);
    case "hrl":    return array ("HISTWND_RLEFT"=>0x10000);
    case "hrt":    return array ("HISTWND_RTOP"=>0x10000);
    case "aef":    return array ("AEXP_FRACPIX"=>0x10000);
    case "ael":    return array ("AEXP_LEVEL"=>0x10000);
    case "ae":     return array ("AUTOEXP_ON" =>array("off","on"));
    case "ftp":    return array ("DAEMON_EN_CCAMFTP" =>array("off","on"));
    case "aemax":  return array ("AUTOEXP_EXP_MAX"=>1000000);
    default:      return elphel_parse_P_name($absPar)? array ($absPar=>1):array(); // suspecting native constant
  }
}


function abstractValue($absPar) {
  global $get,$allNative;
  switch ($absPar) {
    case "gam":///   return array ("GTAB_R__0816"=>100,"GTAB_G__0816"=>100,"GTAB_GB__0816"=>100,"GTAB_B__0816"=>100);
      return $allNative["GTAB_G__0816"]/$get[$absPar]["GTAB_G__0816"]; // just from green color
    case "pxl":///   return array ("GTAB_R__0824"=>100,"GTAB_G__0824"=>100,"GTAB_GB__0824"=>100,"GTAB_B__0824"=>100);
      return $allNative["GTAB_G__0824"]/$get[$absPar]["GTAB_G__0824"]; // just from green color
    default:
      $value=reset ($get[$absPar]);
      if (is_array($value)) return $value[$allNative[key($get[$absPar])]];
      else                  return $value?($allNative[key($get[$absPar])]/$value):'undefined';
  }
}




/**
 * @brief Decode set=... parameters
 * @param $encoded_get - string representation of /parameter/.. array
 */
function decodeGet ($encoded_get) {
  global $get,$allNative;
  if (!$encoded_get) return array();
  $encoded_get=explode("/",trim($encoded_get,'/'));
  foreach ($encoded_get as $name) {
    $get[$name]=abstractToNative($name);
    foreach ($get[$name] as $key=>$value) $allNative[$key]=0;
  }
  $allNative['FRAME'] = 0; /// always read frame number to reference read parameters to
}
///main()
         $MAX_EXECUTION_TIME=20;
         $GLOBALS['sensor_port']=0;
         if ($_GET['sensor_port']!=NULL){
         	$GLOBALS['sensor_port'] = myval($_GET['sensor_port']);
         }
         $GLOBALS['subcahannel']=0; // TODO NC393: handle! It applies to multiplexer mode, gammas, histograms and focus
                                           // Initially it all will be 0 (common) as it was in 353
         if ($_GET['subcahannel']!=NULL){
         	$GLOBALS['subcahannel'] = myval($_GET['subcahannel']);
         }
         
         $GLOBALS['imgsrv_port'] = 2323 + $GLOBALS['sensor_port']; // read port from some centralized place
              
         $deadline=time()+$MAX_EXECUTION_TIME;
///         set_time_limit(20); - /// does not work!
         $exif_get=false;
         $circbuf_get=false;
         $debug_arr=array();
         $toRead=array();
         $hist_in_thresh=0.0;
         $hist_out_thresh=0.0;
         $get=array();  /// abstract parameters to read  (i.e. e, ww, fliph)
         $set=array();  /// abstract parameters to write (i.e. e, ww, fliph)
         $setNative=array();  /// array (indexed by frame Numbers) of array of camera  parameters to write (i.e. EXPOS, WOI_WIDTH, FLIPH)
//         $getNative=array();  /// array of the native camera parameters to read (i.e. EXPOS, WOI_WIDTH, FLIPH)
         $allNative=array();  /// all native parameters that are needed to be read
//         $ahead=3;
         $ahead=4;
         foreach($_GET as $key=>$value) {
           switch($key) {
/// _time - will look at FPGA time and program both FPGA and system, _stime - unconditionally program both
            case "_time":
              $toRead["req_ts"]=$value; /// Request time stamp, as received. Will be used by sender
              $a=((float) $value)/1000;
              if (abs(elphel_get_fpga_time()-$a) < 24*3600) break; // time already set
            case "_stime":
              $toRead["req_ts"]=$value;
              $a=((float) $value)/1000;
              elphel_set_fpga_time ($a); // set FPGA time
              exec("date -s ".@date("Y-m-d H:i:s.u",(int)$a),$out,$ret); // set system time
              exec("hwclock --systohc");
              break;
            case "imgsrv":
//              $toRead["imgsrv"]='http://'.$_SERVER['HTTP_HOST'].':8081/';
              $toRead["imgsrv"]='http://'.$_SERVER['HTTP_HOST'].':'.strval($GLOBALS['imgsrv_port']).'/';
              break;
            case "exif":
              $exif_get=$value+0; //page number
              break;
            case "description":
              if ( $value!==null)  elphel_set_exif_field($GLOBALS['sensor_port'], 0x10e, $value.chr(0));
              break;
            case "circbuf":
              $circbuf_get=true;
              break;
            case "hin": // calculate the input and output levels
             $hist_in_thresh=$value+0.0;
             break;
            case "hout": // calculate the input and output levels
             $hist_out_thresh=$value+0.0;
             break;
            case "ahead":
              $ahead= myval($value);
              break;
            case "set":
              decodeSet ($value);
              break;
            case "get":
              decodeGet ($value);
              break;
            case "timeout":
              $deadline=time()+$value;
              break;
            case "sleep":
              sleep ($value);
              break;

            }
         }

         if (array_key_exists("dbgwait",$_GET)) {
/// NOTE: DOES not notice if connection is reset by the client and keeps php busy !...
              while (elphel_get_P_value($GLOBALS['sensor_port'],ELPHEL_DEBUG+(1<<21)+(28<<16))) {
                elphel_skip_frames($GLOBALS['sensor_port'],1);
                if (time()>$deadline) {
                   error_log("Aborted due to custom timeout");
                   exit(1);
                }
              }
          }
/// Do whatever needed

  $allNative=elphel_get_P_arr($GLOBALS['sensor_port'],$allNative);
  $parVal=array();
//  foreach ($get as $key=>$value) $parVal[$key]= abstractValue($key);
  foreach ($get as $key=>$value) $parVal[$key]= abstractValue($key);
//  fixRGBScales();
  fixGammaBlack();
  prepSetNative();
  addGammas();
  applySetNative($ahead);

/// TODO:program parameters here, get frame when programmed

/// output result
         if ($_GET["out"]=="gif") {
              out1x1gif();
              exit (0);
         }
         if ($_GET["debug"]=="1") {
echo "<pre>\n";
echo "\nparVal\n"; print_r($parVal);
echo "\nallNative\n"; print_r($allNative);
echo "\nget\n"; print_r($get);
echo "\nsetNative\n"; print_r($setNative);
echo "\nset\n"; print_r($set);
echo "\ngammas\n"; print_r($gammas);
echo "</pre>\n";
              exit (0);
         }
         $xml = new SimpleXMLElement("<?xml version='1.0'?><pars/>");
         if (count($set)>0) {
           $xml->addChild ('set');
           foreach ($set as $parName=>$parPars) {
             $xParName=$xml->set->addChild ($parName);
             $xParName->addChild ('frame',$parPars['delay']+$pgmFrameNumber);
             $xNative=$xParName->addChild ('native');
             foreach ($parPars['native'] as $natName=>$natValue) {
                $xNative->addChild ($natName,$natValue);
             }
           }
         }

         if (count($parVal)>0) {
           $xml->addChild ('frame',$allNative['FRAME']);
           $xml->addChild ('get');
           foreach ($parVal as $parName=>$parValue) {
             $xml->get->addChild ($parName,$parValue);
           }
         }

         if (count($allNative)>0) {
           $xml->addChild ('nativeGot');
           foreach ($allNative as $natName=>$natValue) {
             $xml->nativeGot->addChild ($natName,$natValue);
           }
         }

//         if (count($toRead)>0) $toRead=elphel_get_P_arr($toRead);
         if ($_GET["STATE"]!==NULL) $toRead["STATE"]=elphel_get_state($GLOBALS['sensor_port']);
         if ($_GET["imgsrv"]!==NULL) $toRead["imgsrv"]='http://'.$_SERVER['HTTP_HOST'].':'.strval($GLOBALS['imgsrv_port']).'/';
        
         foreach ($debug_arr as $key=>$value) {
            $xml->addChild ($key,$value);
         }
$xml->addChild ("ELPHEL_DEBUG__0128",elphel_get_P_value($GLOBALS['sensor_port'],ELPHEL_DEBUG+(1<<21)+(28<<16)));
         foreach ($toRead as $key=>$value) {
            $xml->addChild ($key,$value);
         }
         if ($exif_get!==false) {
           $exif_got=elphel_get_exif_elphel($GLOBALS['sensor_port'],$exif_get);
           if ($exif_got) {
             $xml->addChild ('Exif');
             $xml->Exif->addChild ("Exif_page",$exif_get);
             foreach ($exif_got as $key=>$value) {
                $xml->Exif->addChild ($key,$value);
             }
           }
         }
/// Calculate and output histogram levels if requested (both input and output in the range of 0.0..1.0, inclusive)
/// here $hist_in_thresh corresponds to input signals as fractions of the full scale input data)
         if ($hist_in_thresh) {
              $xml->addChild ('hist_in');
              $xml->hist_in->addChild ('hist_in_thresh',$hist_in_thresh);
              $xml->hist_in->addChild ('hist_in_r', elphel_histogram($GLOBALS['sensor_port'], $GLOBALS['subcahannel'],0,elphel_gamma(0,$hist_in_thresh)));
              $xml->hist_in->addChild ('hist_in_g', elphel_histogram($GLOBALS['sensor_port'], $GLOBALS['subcahannel'],1,elphel_gamma(1,$hist_in_thresh)));
              $xml->hist_in->addChild ('hist_in_g2',elphel_histogram($GLOBALS['sensor_port'], $GLOBALS['subcahannel'],2,elphel_gamma(2,$hist_in_thresh)));
              $xml->hist_in->addChild ('hist_in_b', elphel_histogram($GLOBALS['sensor_port'], $GLOBALS['subcahannel'],3,elphel_gamma(3,$hist_in_thresh)));
         }
/// here $hist_out_thresh corresponds to output (8-bit) pixel values as fractions of the 8-bit full scale (255)
         if ($hist_out_thresh) {
              $xml->addChild ('hist_out');
              $xml->hist_out->addChild ('hist_out_thresh',$hist_out_thresh);
              $xml->hist_out->addChild ('hist_out_r', elphel_histogram($GLOBALS['sensor_port'], $GLOBALS['subcahannel'],0,$hist_out_thresh));
              $xml->hist_out->addChild ('hist_out_g', elphel_histogram($GLOBALS['sensor_port'], $GLOBALS['subcahannel'],1,$hist_out_thresh));
              $xml->hist_out->addChild ('hist_out_g2',elphel_histogram($GLOBALS['sensor_port'], $GLOBALS['subcahannel'],2,$hist_out_thresh));
              $xml->hist_out->addChild ('hist_out_b', elphel_histogram($GLOBALS['sensor_port'], $GLOBALS['subcahannel'],3,$hist_out_thresh));
         }
///circbuf+exif pointres
          if ($circbuf_get) {
            $xml->addChild ('circbuf');
             $circbuf=elphel_get_circbuf_pointers($GLOBALS['sensor_port']);
            if (is_array  ($circbuf)) {
              $circbuf_count=count($circbuf);
//              $xml->circbuf->addChild ('circbuf_count',$circbuf_count);
              for ($i=0;$i<$circbuf_count;$i++) {
                $xml->circbuf->addChild ('frame'.$i);
                $xml->circbuf->{'frame'.$i}->addChild ('frame'          ,$circbuf[$i]['frame']);
                $xml->circbuf->{'frame'.$i}->addChild ('circbuf_pointer',$circbuf[$i]['circbuf_pointer']);
                $xml->circbuf->{'frame'.$i}->addChild ('exif_pointer'   ,$circbuf[$i]['exif_pointer']);
              }
            }
          }
          $rslt=$xml->asXML();
          header("Content-Type: text/xml");
          header("Content-Length: ".strlen($rslt)."\n");
          header("Pragma: no-cache\n");
          printf($rslt);

?>
