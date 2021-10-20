# Hotkeys Popup

Hotkeys Popup is a GNOME Shell Extension that displays currently configured
Gnome hotkeys in a popup. The popup is activated with <kbd>Super + S</kbd>.

*Only tested with Gnome 40*. It might run correctly with other versions.

Currently it only shows some of the window manager shortcuts. In the future
versions it should show personally configured shortcuts.

## Features/Todo

### Version 1 WIP

- [x] Shows popup with hotkeys
- [x] works with Gnome 40
- [x] transparency optional
- [x] retrieve keybindings from Gsettings not a json file
  - [x] get extdir
  - [x] parse gsettings output
- [x] fix window position
- [x] escape should also close the popup
- [x] hardcoded hide shortcuts
- [x] show shell keybindings
- [ ] preferences hide description array (v1)

### Next

- [ ] create sub sections inside window manager keys
- [ ] move spawncunfunctions to shared file
- [ ] preferences hide description array (v2)
  - [ ] list found shortcuts with enable-toggle per applications/schema
- [ ] preferences add shortcuts from other Gnome apps
  - [ ] use widget like in "auto move windows" preferences
- [ ] get keys without shellscript
- [ ] map gsettings to paragraphs
- [ ] autohide
- [ ] localized
- [ ] configure scope of keybinding app
- [ ] configure toggle keybinding
- [ ] preferences add shortcuts from other Apps
- [ ] preferences detect currently running application and show it's shortcuts.
  - [ ] inkspace
  - [ ] vim
  - [ ] tmux

## Credits

The idea of having an up to date hotkey popup window comes from AwesomeWM.

This extension is initially forked from [Shortcuts]
(https://gitlab.com/paddatrapper/shortcuts-gnome-extension).

### Install

You may need to restart GNOME (Alt + F2, r) before you see Shortcuts in your
list of extensions
