/*********************************************************************
 * Hotkeys Popup is Copyright (C) 2021 Pim Snel
 *
 * Hotkeys Popup is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Hotkeys Popup is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Hotkeys Popup.  If not, see <http://www.gnu.org/licenses/>.
 **********************************************************************/

const GObject = imports.gi.GObject;
const Shell = imports.gi.Shell;
const Meta = imports.gi.Meta;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;

const Gettext = imports.gettext;
const ExtensionUtils = imports.misc.extensionUtils;

const Main = imports.ui.main;

const Me = ExtensionUtils.getCurrentExtension();
const ShortLib = Me.imports.shortcutslib;
const _ = Gettext.gettext;

let button, stage, panel_panel, left_panel, right_panel, super_label;
let _iconWidgetIsAdded, _visible, _settings;
let background_class = "background-boxlayout";

/* exported init */
function init() {
  ExtensionUtils.initTranslations();
}

/* exported enable */
/* Enables the plugin by adding listeners and icons as necessary */
function enable() {

  _settings = ExtensionUtils.getSettings();
  _settings.connect("changed::show-icon",            _toggleIcon );
  _iconWidgetIsAdded = false;

  let flag = Meta.KeyBindingFlags.IGNORE_AUTOREPEAT;
  let mode = Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW;
  Main.wm.addKeybinding("keybinding-show-popup",_settings, flag, mode, () => {
    _toggleShortcuts();
  })

  _toggleIcon();

}


/* Removes all traces of the listeners and icons that the extension created */
/* exported disable */
function disable() {

  if (_iconWidgetIsAdded) {
    Main.panel._rightBox.remove_child(button);
    _iconWidgetIsAdded = false;
  }

  Main.wm.removeKeybinding("keybinding-show-popup");

  cleanupWidgets();
  _visible = false;
}

/**
 * Builds the pop-up and shows the shortcut description list
 */
function _toggleShortcuts() {
  if (!_visible) {
    _showPopup();
  } else {
    _hidePopup();
  }
}


/**
 * Reads the shortcuts from a file specified in the settings. If this is not
 * there then it defaults to the shortcuts file provided by the extension.
 */
function _readShortcuts() {

  let hideArray = _settings.get_strv("hide-array");

  shortcutsAll = [];
  let shortcutsTemp = {};

  let schemas = [
    'org.gnome.shell.keybindings',
    'org.gnome.desktop.wm.keybindings'
  ];

  schemas.forEach((schema)=>{
    let keybindingsSettings = new Gio.Settings({ schema: schema });
    let keys = keybindingsSettings.settings_schema.list_keys();

    keys.forEach((key)=>{
      if(keybindingsSettings.get_strv(key).length > 0){
        let val = keybindingsSettings.get_strv(key).toString();

        if(!hideArray.includes(key)){

          if(!shortcutsTemp[schema]){
            shortcutsTemp[schema] = [];
          }

          let shortCutEntry = {
            description: ShortLib.normalize_description(key),
            key: ShortLib.normalize_key(val)
          };

          shortcutsTemp[schema].push(shortCutEntry);
        }

      }
    })
  });

  Object.keys(shortcutsTemp).forEach((section)=> {

    shortcutsAll.push({
      name: ShortLib.translateSchemaNames(section),
      shortcuts: shortcutsTemp[section],
    });
  });

  let shortcuts = shortcutsAll;
  let shortcutLength = shortcuts.length;
  for (let i = 0; i < shortcuts.length; i++) {
    shortcutLength += shortcuts[i].shortcuts.length;
  }

  let listProgress = 0.0;
  for (let i = 0; i < shortcuts.length; i++) {

    listProgress += (shortcuts[i].shortcuts.length * 1.0) / shortcutLength;
    let panel = listProgress < 0.5 ? left_panel : right_panel;
    panel.add_actor(
      new St.Label({
        style_class: "shortcut-section",
        text: shortcuts[i].name,
      })
    );

    for (let j = 0; j < shortcuts[i].shortcuts.length; j++) {
      let item_panel = new St.BoxLayout({
        style_class: "item-boxlayout",
        pack_start: false,
        vertical: false,
      });
      let key = shortcuts[i].shortcuts[j].key;
      let description = _(shortcuts[i].shortcuts[j].description);
      item_panel.add(
        new St.Label({
          style_class: "shortcut-key-label",
          text: key,
        })
      );
      item_panel.add(
        new St.Label({
          style_class: "shortcut-description-label",
          text: description,
        })
      );
      panel.add_actor(item_panel);
    }
  }

}

var PopupBox = GObject.registerClass({
  Signals: {
    'hide-box': {},
  },
},
  class PopupBox extends St.BoxLayout{

    vfunc_key_press_event(event) {

      switch(event.keyval) {
        default:
          this.emit('hide-box');
          return Clutter.EVENT_PROPAGATE;
      }

      return super.vfunc_key_press_event(event);
    }
  }
);

function _showPopup(){
  if (!stage) {

    stage = new PopupBox({
      style_class: background_class,
      pack_start: false,
      vertical: true,
    });

    stage.hideId = stage.connect('hide-box', _hidePopup);

    panel_panel = new St.BoxLayout({
      style_class: "panel-boxlayout",
      pack_start: false,
      vertical: false,
    });

    stage.add_actor(panel_panel);

    left_panel = new St.BoxLayout({
      style_class: "left-boxlayout",
      pack_start: false,
      vertical: true,
    });

    right_panel = new St.BoxLayout({
      style_class: "right-boxlayout",
      pack_start: false,
      vertical: true,
    });

    panel_panel.add_actor(left_panel);
    panel_panel.add_actor(right_panel);

    _readShortcuts();

    super_label = new St.Label({
      style_class: "superkey-prompt",
      text: _("The super key is the Windows key on most keyboards"),
    })

    stage.add_actor( super_label);

    Main.pushModal(stage, { actionMode: Shell.ActionMode.NORMAL });
    Main.layoutManager.addTopChrome(stage);
  }

  centerBox();

  _visible = true;
}

function centerBox(){
  let monitor = Main.layoutManager.primaryMonitor;
  stage.set_position(
    monitor.x + Math.floor(monitor.width / 2 - stage.width / 2),
    monitor.y + Math.floor(monitor.height / 2 - stage.height / 2 )
  );
}

/**
 * Removes the actors used to make the pop-up describing the shortcuts.
 */
function _hidePopup() {

  if(stage.hideId) {
    stage.disconnect(stage.hideId);
    delete stage.hideId;
  }
  panel_panel.remove_actor(left_panel);
  panel_panel.remove_actor(right_panel);
  stage.remove_actor(panel_panel);
  stage.remove_actor(super_label);

  cleanupWidgets();

  _visible = false;
}

function cleanupWidgets(){
  left_panel = null;
  right_panel = null;
  panel_panel = null;
  super_label = null;
  if(stage) {
    stage.destroy();
    stage = null;
  }
}

/*
 * Shows or hides the icon in the right box of the top panel as the user
 * changes the setting
 */
function _toggleIcon() {
  let SHOW_ICON = _settings.get_boolean("show-icon");
  if (!SHOW_ICON) {
    if (_iconWidgetIsAdded) {
      Main.panel._rightBox.remove_child(button);
      _iconWidgetIsAdded = false;
    }
    return;
  }

  if (!_iconWidgetIsAdded) {
    button = new St.Bin({
      style_class: "panel-button",
      reactive: true,
      can_focus: true,
      x_expand: true,
      y_expand: false,
      track_hover: true,
    });

    let icon = new St.Icon({
      icon_name: "preferences-desktop-keyboard-shortcuts-symbolic",
      style_class: "system-status-icon",
    });

    button.set_child(icon);
    button.connect("button-press-event", _toggleShortcuts);

    Main.panel._rightBox.insert_child_at_index(button, 0);
    _iconWidgetIsAdded = true;
  }
}
