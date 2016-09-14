#set shell to bash, othewise $RANDOM may not work (with dash)
SHELL=/bin/bash

# Create directories for HTML pages

# set root as owned and group owner for all files

#in NC353 following config files were used (camvc_main.js):
#document.configs_NetworkFile="/etc/conf.d/net.eth0";
#document.configs_Mac="/etc/conf.d/mac";
#document.configs_WebcamFile= "/etc/conf.d/ccamftp.conf";
#document.configs_FtpFile= "/etc/conf.d/ccamftp.conf";
#document.configs_VideoFile= "/var/state/streamer.conf";

OWN = -o root -g root

DOCUMENTROOT=/www/pages
INSTDOCS = 0644
INSTPROG = 0755
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
#TIMESTAMP:=$(shell echo $$RANDOM)
TIMESTAMP=$(shell echo $$RANDOM)
#should be before install - not to run make install during bitbake -c compile (permissions)
all:
	@echo "make all in src"

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
	$(INSTALL) $(OWN) -d $(DESTDIR)$(DOCUMENTROOT)
	$(INSTALL) $(OWN) -d $(DESTDIR)$(DOCUMENTROOT)/images
#install files
	$(INSTALL) $(OWN) -m $(INSTDOCS) $(DOCS) $(DESTDIR)$(DOCUMENTROOT)
	$(INSTALL) $(OWN) -m $(INSTDOCS) camvc2.ts.html $(DESTDIR)$(DOCUMENTROOT)/camvc2.html
#	ln -sf camvc2.html $(DESTDIR)$(DOCUMENTROOT)/index.html
	ln -sf camvc2.html $(DESTDIR)$(DOCUMENTROOT)/camvc.html
	$(INSTALL) $(OWN) -m $(INSTDOCS) $(IMGS) $(DESTDIR)$(DOCUMENTROOT)/images
	$(INSTALL) $(OWN) -m $(INSTDOCS) $(IMGSRC) $(DESTDIR)$(DOCUMENTROOT)/images
	$(INSTALL) $(OWN) -m $(INSTDOCS) $(PHPSCRIPTS)  $(DESTDIR)$(DOCUMENTROOT)
	rm -f camvc2.ts.html
clean:
	rm -f *.bak ~*
