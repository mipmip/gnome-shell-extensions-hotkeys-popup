# Hotkeys Popup

Hotkeys Popup is a GNOME Shell Extension that displays currently configured
Gnome hotkeys in a popup. The popup is activated with <kbd>Super + S</kbd>.

*Tested with Gnome 40 en 41*. It might run correctly with other versions.

Currently it only shows some of the window manager shortcuts. In the future
versions it should show personally configured shortcuts.

## Features

- Shows popup with hotkeys of Gnome Shell and Gnome Window Manager
- Get configured shortcuts from GSettings
- Works with Gnome 40 and 41
- Transparency optional
- Set hotkey key binding in preference
- Choose which hotkeys should be displayed in popup
- Add custom shortcuts from json file

## Future

- Add more schema's
- Add shortcuts from non GTK applications
- Detect current active application to show it's shortcuts
- Filter shortcuts
- Colorize sections
- Themes

## Usage

### Configure

Open preferences and enable and disable the keys your want to display.

### Custom Hotkeys from JSON

Copy example json file to `~/.hotkeys-popup-custom.json`.

```
curl https://raw.githubusercontent.com/mipmip/gnome-shell-extensions-hotkeys-popup/main/hotkeys-popup-custom-example.json > ~/.hotkeys-popup-custom.json
```

Edit this with your own keys.


## Contributing

1. Fork it ( https://github.com/mipmip/gnome-shell-extensions-hotkeys-popup/fork )
1. Create your feature branch (git checkout -b my-new-feature)
1. Commit your changes (git commit -am 'Add some feature')
1. Push to the branch (git push origin my-new-feature)
1. Create a new Pull Request

## Credits

The idea of having an up to date hotkey popup window comes from AwesomeWM.

This extension is initially forked from [Shortcuts]
(https://gitlab.com/paddatrapper/shortcuts-gnome-extension).

### Install

You may need to restart GNOME (Alt + F2, r) before you see Shortcuts in your
list of extensions
