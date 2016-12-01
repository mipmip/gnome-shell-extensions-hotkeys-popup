# Shortcuts
Shortcuts is a GNOME Shell Extension that displays shortcut descriptions from a
json file when Super + S is pressed. The default keyboard shortcuts are listed
in the main package.

## Install
### Dependencies:
Building Shortcuts from source requires:

 - Glib development files (`libglib2.0-dev`)
 - `intltool`
 - `automake`

### Install
From the repository directory run

    ./autogen.sh
    ./configure
    make local-install

You may need to restart GNOME (Alt + F2, r) before you see Shortcuts in your
list of extensions
