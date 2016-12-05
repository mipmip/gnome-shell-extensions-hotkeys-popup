#!/bin/bash

set -e

if [ "$UID" = "0" ]; then
    echo 'This should not be run as root'
    exit 101
fi

NAME=Shortcuts\@kyle.aims.ac.za
DEST=~/.local/share/gnome-shell/extensions/$NAME

echo 'Compiling translations...'
for po in locale/*/LC_MESSAGES/*.po; do
    msgfmt -cv -o ${po%.po}.mo $po;
done

echo 'Compiling preferences...'
glib-compile-schemas --targetdir=src/schemas src/schemas

echo 'Installing...'
if [ -z $DEST ]; then
    mkdir $DEST
fi
cp -r src/* locale $DEST/

echo 'Done'
