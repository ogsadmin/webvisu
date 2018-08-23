
SRC   = jquery-2.0.3.min.js \
        inflate.js zip.js sprintf.js jquery-ajax-blob-arraybuffer.js

# to process by preprocessor (gpp) first
PPSRC = codesys.pp.js drawing.pp.js utils.pp.js WebVisuDev.pp.html 
PPOBJ = codesys.oo.js drawing.oo.js utils.oo.js WebVisuDev.oo.html 

# steelseries
SSSRC = steelseries-min.js

TARGET1 = ../release/WebVisu.html
TARGET2 = ../release/WebVisuPlus.html
TARGET3 = ../release/WebVisuPlusConfig.html

PPFLAGS =

HTMLTITLE := WebVisu (r!svnversion!)

.PHONY: clean

all: $(TARGET1)

$(TARGET1): PPFLAGS =
$(TARGET1): $(SRC) $(PPOBJ) release.pl
	perl release.pl WebVisuDev.oo.html "$(HTMLTITLE)" > $(TARGET1)

$(TARGET2): PPFLAGS = -DUSE_STEELSERIES=1
$(TARGET2): $(SRC) $(PPOBJ) $(SSSRC) release.pl
	perl release.pl WebVisuDev.oo.html "$(HTMLTITLE)" > $(TARGET2)

$(TARGET3): PPFLAGS =
$(TARGET3): $(SRC) $(PPOBJ) release.pl
	perl release.pl WebVisuPlusConfig.html > $(TARGET3)
	
clean:
	rm -rf $(PPOBJ)
	
%.oo.js: %.pp.js
	gpp $(PPFLAGS) +s \' \' \\ +s \" \" \\ -o $@ $<
      
%.oo.html: %.pp.html
	gpp $(PPFLAGS) +s \' \' \\ +s \" \" \\ -o $@ $<
