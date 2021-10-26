/*********************************************************************
 * The Hotkeys Popup is Copyright (C) 2021 Pim Snel
 *
 * Hotkeys Popup is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation
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
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const Gettext = imports.gettext;
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ShortLib = Me.imports.shortcutslib;

/**
 * Initialises the preferences widget
 */
/* exported init */
function init() {
  ExtensionUtils.initTranslations();
}

/**
 * Builds the preferences widget
 */
/* exported buildPrefsWidget */
function buildPrefsWidget() {

  let widget = new ShortcutsPrefsWidget();
  return widget;
}

function updateHideArrayAdd(itemKey){
  if(!this._settings){
    this._settings = ExtensionUtils.getSettings();
  }

  let hideArray = this._settings.get_strv("hide-array");
  const index = hideArray.indexOf(itemKey);

  if (index === -1) {
    hideArray.push(itemKey);
    this._settings.set_strv("hide-array", hideArray);
  }
}

function updateHideArrayRemove(itemKey){
  if(!this._settings){
    this._settings = ExtensionUtils.getSettings();
  }

  let hideArray = this._settings.get_strv("hide-array");
  const index = hideArray.indexOf(itemKey);

  if (index > -1) {
    hideArray.splice(index, 1);
    this._settings.set_strv("hide-array", hideArray);
  }
}

/**
 * Describes the widget that is shown in the extension settings section of
 * GNOME tweek.
 */
const ShortcutsPrefsWidget = new GObject.Class({
  Name: 'Shortcuts.Prefs.Widget',
  GTypeName: 'ShortcutsPrefsWidget',
  Extends: Gtk.ScrolledWindow,

  /**
   * Initalises the widget
   */
  _init: function() {
    this.parent(
      {
        valign: Gtk.Align.FILL,
        vexpand: true
      }
    );

    this.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);

    this._settings = ExtensionUtils.getSettings();

    this._grid = new Gtk.Grid();
    this._grid.margin_top = 20;
    this._grid.margin_start = 20;
    this._grid.row_spacing = 5;
    this._grid.column_spacing = 10;
    this._grid.set_orientation(Gtk.Orientation.VERTICAL);

    this.set_child(this._grid);

    let mainSettingsLabel = new Gtk.Label({
      label: '<span size="x-large">Main Settings</span>',
      use_markup: true,
      xalign: 0,
      hexpand: true
    });

    this._grid.attach(mainSettingsLabel, 0, 1, 1, 1)

    let showIconCheckButton = new Gtk.CheckButton({
      label: _("Show tray icon"),
      margin_top: 6 }
    );
    this._settings.bind('show-icon', showIconCheckButton, 'active', Gio.SettingsBindFlags.DEFAULT);
    this._grid.attach_next_to(showIconCheckButton, mainSettingsLabel, Gtk.PositionType.BOTTOM, 1, 2);

    let showTransparentCheckButton = new Gtk.CheckButton({
      label: _("Tranparent Popup"),
      margin_top: 6 }
    );
    this._settings.bind('transparent-popup', showTransparentCheckButton, 'active', Gio.SettingsBindFlags.DEFAULT);
    this._grid.attach_next_to(showTransparentCheckButton, showIconCheckButton, Gtk.PositionType.BOTTOM, 1, 2);

    let enableItemsLabel = new Gtk.Label({
      label: '<span size="x-large">enable shortcut items</span>',
      use_markup: true,
      xalign: 0,
      hexpand: true,
      margin_top: 6
    });
    this._grid.attach_next_to(enableItemsLabel, showTransparentCheckButton, Gtk.PositionType.BOTTOM, 1, 2);

    let hide_items = {};

    let hideArray = this._settings.get_strv("hide-array");
    let previous_item = enableItemsLabel;

    //WIP REPLACE LISTKEYS.SH
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

          hide_items[key] = new Gtk.CheckButton({
            label: key + " " + ShortLib.normalize_description(key) + " ("+ShortLib.normalize_key(val)+ ")",
            margin_top: 1
          });

          if(hideArray.includes(key)){
            hide_items[key].set_active(false);
          }
          else{
            hide_items[key].set_active(true);
          }

          hide_items[key].connect("toggled", ( w ) => {

            if(w.get_active()){
              updateHideArrayRemove(key);
            }
            else{
              updateHideArrayAdd(key);
            }
          });

          this._grid.attach_next_to(hide_items[key], previous_item, Gtk.PositionType.BOTTOM, 1, 2);
          previous_item = hide_items[key];

        }
      })
    });

  }
});
