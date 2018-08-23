#! /bin/sh

# svn ci -m "..."

make clean
make "$@" ../release/WebVisu.html

make clean
make "$@" ../release/WebVisuPlus.html

make clean
make "$@" ../release/WebVisuPlusConfig.html

make clean

# cd ..
# svn ci -m "Release r87"
# svn cp svn+ssh://benkfra@svn.code.sf.net/p/webvisu/code/trunk svn+ssh://benkfra@svn.code.sf.net/p/webvisu/code/tags/v087_20180602 -m "Tagging r87"

