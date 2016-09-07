# -----------------------------------------------------------------------------**
# packages/web/353/Makefile
#
# Copyright (C) 2005-2008 Elphel, Inc.
#
# -----------------------------------------------------------------------------**
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <http://www.gnu.org/licenses/>.
# -----------------------------------------------------------------------------**
#  $Log: Makefile,v $
#  Revision 1.5  2009/03/23 18:14:06  elphel
#  making camvc.html as alias to camvc2.html
#
#  Revision 1.4  2008/12/13 23:38:18  elphel
#  split camvc2.html, - now only HTML code is in camvc2.html, all the javascript in in camvc_main.js, camvc_video.js and other files that were already separate
#
#  Revision 1.3  2008/12/10 22:08:38  elphel
#  make now removes temporary file camvc2.ts.html after usage to prevent KDevelop to use it in "find in files"
#
#  Revision 1.2  2008/12/05 03:30:26  elphel
#  Added camvc_circbuf.js to support circbuf/Exif , restoring functionality available in 7.1
#
#  Revision 1.1.1.1  2008/11/27 20:04:03  elphel
#
#
#  Revision 1.4  2008/11/17 06:48:04  elphel
#  removed camvc2_ccam.js that was already not used
#
#  Revision 1.3  2008/11/08 05:54:02  elphel
#  snapshot - working on camvc
#
#  Revision 1.2  2008/11/02 07:26:14  elphel
#  8.0.alpha11 - started to port ccam.php/camvc2.html
#
#  Revision 1.3  2008/04/24 18:51:15  elphel
#  added navigation through circbuf
#
#  Revision 1.2  2008/04/22 22:21:31  elphel
#  Started camvc2 that currently uses most of the same images and javascript files as camvc
#
#  Revision 1.1.1.1  2007/09/19 04:51:17  elphel
#  This is a fresh tree based on elphel353-2.10
#
#  Revision 1.3  2007/09/19 04:51:17  elphel
#  Upgraded license (header)
#
#


# Create directories for HTML pages
#
AXIS_USABLE_LIBS = UCLIBC GLIBC
include $(AXIS_TOP_DIR)/tools/build/Rules.axis

# set root as owned and group owner for all files

OWN = -o root -g root

DOCUMENTROOT = $(prefix)/mnt/flash/html
PRODROOT     = ../../..
INSTDOCS = 0644
INSTPROG = 0755
#DOCS = camvc.html
DOCS =  elphelTabs.js camvcUpgrade.html \
        elphelFrames.js elphelContextHelp.js closeme.html camvc_configs.js camvc_dvr.js \
        elphelSliders2.js camvc2_i18n.js elphelButtons2.js camvc_camcomm.js camvc_interface.js \
        camvc_circbuf.js  camvc_video.js camvc_main.js
PHPSCRIPTS= camvc.php
IMGS = images/slider_ball_13x25.png images/slider_ball_13x25_disabled.png images/slider_rail_1x25.png \
       images/slider_rail_right13x25.png images/slider_rail_left13x25.png \
       images/bg_000000_25.png images/bg_000000_50.png images/bg_000000_75.png \
       images/bg_ffffff_25.png images/bg_ffffff_50.png images/bg_ffffff_75.png \
       images/bg_dddddd_25.png images/bg_dddddd_50.png images/bg_dddddd_75.png \
       images/bg_dddd88_25.png images/bg_dddd88_50.png images/bg_dddd88_75.png \
       images/bg_dd88dd_25.png images/bg_dd88dd_50.png images/bg_dd88dd_75.png \
       images/bg_88dddd_25.png images/bg_88dddd_50.png images/bg_88dddd_75.png \
       images/bg_fffdd0_25.png images/bg_fffdd0_50.png images/bg_fffdd0_75.png \
       images/tabs16x24_left_sel.png images/tabs16x24_left_unsel.png \
       images/tabs16x24_right_sel.png images/tabs16x24_right_unsel.png \
       images/tabs16x24_sel.png images/tabs16x24_sel_unsel.png \
       images/tabs16x24_unsel.png images/tabs16x24_unsel_sel.png \
       images/tabs16x24_unsel_unsel.png \
       images/close_cross_9x9.png images/close_cross_dim_19x19.png \
       images/camvc_buttons.png images/empty.png \
       images/tooltips65x160.png images/bgmesh8x8.png images/elphel_logo256x256.png \
       images/running_25x7.gif images/stopped_25x7.png images/recording_5x5.gif
IMGSRC = images/camvc_buttons.xcf images/tabs16x24.xcf
TIMESTAMP:=$(shell echo $$RANDOM)
install:
############################################################################################################
# Replace links with randomized ones to prevent browser using cache for javascript/image files.            #
# If you need to manually update any of *.js *.png files - edit camvc.html,                                #
# Find .js?<some_ramdom_number> (in the file installed in the camera)                                      #
# or .js?_TIMESTAMP_ if you use original camvc.html file                                                   #
# and replace each occurence of "?_TIMESTAMP_" or "?<random_number_you_found>" with "?_something_different"#
# that will prevent camvc.html from using the old, cached values of javascript and image files             #
############################################################################################################
#	sed -e 's/_TIMESTAMP_/$(TIMESTAMP)/' camvc.html >camvc.ts.html
	sed -e 's/_TIMESTAMP_/$(TIMESTAMP)/' camvc2.html >camvc2.ts.html
#prepare some directories anyway
	$(INSTALL) $(OWN) -d $(DOCUMENTROOT)/images
#install files
	$(INSTALL) $(OWN) -m $(INSTDOCS) $(DOCS) $(DOCUMENTROOT)
	$(INSTALL) $(OWN) -m $(INSTDOCS) camvc2.ts.html $(DOCUMENTROOT)/camvc2.html
	ln -sf camvc2.html $(DOCUMENTROOT)/index.html
	ln -sf camvc2.html $(DOCUMENTROOT)/camvc.html
	$(INSTALL) $(OWN) -m $(INSTDOCS) $(IMGS) $(DOCUMENTROOT)/images
	$(INSTALL) $(OWN) -m $(INSTDOCS) $(IMGSRC) $(DOCUMENTROOT)/images
	$(INSTALL) $(OWN) -m $(INSTDOCS) $(PHPSCRIPTS)  $(DOCUMENTROOT)
	rm -f camvc2.ts.html
clean:
	rm -f *.bak ~*
