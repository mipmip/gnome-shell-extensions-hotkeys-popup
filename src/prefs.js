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
const UI = Me.imports.ui;
const _settings = ExtensionUtils.getSettings();

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
  if(!_settings){
    _settings = ExtensionUtils.getSettings();
  }

  let hideArray = _settings.get_strv("hide-array");
  const index = hideArray.indexOf(itemKey);

  if (index === -1) {
    hideArray.push(itemKey);
    _settings.set_strv("hide-array", hideArray);
  }
}

function updateHideArrayRemove(itemKey){
  if(!_settings){
    _settings = ExtensionUtils.getSettings();
  }

  let hideArray = _settings.get_strv("hide-array");
  const index = hideArray.indexOf(itemKey);

  if (index > -1) {
    hideArray.splice(index, 1);
    _settings.set_strv("hide-array", hideArray);
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


    this._grid = new UI.ListGrid();

    this.set_child(new UI.Frame(this._grid));

    let mainSettingsLabel = new UI.LargeLabel("Main Settings");
    this._grid._add(mainSettingsLabel)

    this._field_shortcut = new UI.Shortcut(_settings.get_strv("keybinding-show-popup"));
    let label_shortcut = new UI.Label('Shortcut Keybinding')
    this._grid._add(label_shortcut, this._field_shortcut);

    this._field_shortcut.connect('changed', (widget, keys) => { _settings.set_strv("keybinding-show-popup", [keys]); });

    let showIconCheckButton = new UI.Check("Show tray icon");
    _settings.bind('show-icon', showIconCheckButton, 'active', Gio.SettingsBindFlags.DEFAULT);
    this._grid._add(showIconCheckButton);

    let showTransparentCheckButton = new UI.Check("Transparent Background");
    _settings.bind('transparent-popup', showTransparentCheckButton, 'active', Gio.SettingsBindFlags.DEFAULT);
    this._grid._add(showTransparentCheckButton);

    let hide_items = {};
    let hide_schemas = {};

    let hideArray = _settings.get_strv("hide-array");

    let schemas = [
      'org.gnome.shell.keybindings',
      'org.gnome.desktop.wm.keybindings'
    ];

    schemas.forEach((schema)=>{
      let keybindingsSettings = new Gio.Settings({ schema: schema });
      let keys = keybindingsSettings.settings_schema.list_keys();

      hide_schemas[schema] = new UI.LargeLabel("Visible shortcut items for "+ ShortLib.translateSchemaNames(schema));
      this._grid._add(hide_schemas[schema]);

      keys.forEach((key)=>{
        if(keybindingsSettings.get_strv(key).length > 0){

          hide_items[key] = new Gtk.CheckButton({
            label: ShortLib.normalize_description(key),
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

          this._grid._add(hide_items[key]);

        }
      })
    });

  }
});
