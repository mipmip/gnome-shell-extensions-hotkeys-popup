/*********************************************************************
 * The Hotkeys Popup is Copyright (C) 2016-2018 Kyle Robbertze
 * African Institute for Mathematical Sciences, South Africa
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

const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const Lang = imports.lang;
const Gettext = imports.gettext;
const _ = Gettext.gettext;
const Config = imports.misc.config;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

/**
 * Initialises the preferences widget
 */
function init() {
  Convenience.initTranslations();
}

/**
 * Builds the preferences widget
 */
function buildPrefsWidget() {
  let widget = new ShortcutsPrefsWidget();

  let current_version = Config.PACKAGE_VERSION.split(".");
  if (current_version[0] == 3 && current_version[1] < 38) {
    widget.show_all();
  }

  return widget;
}

/**
 * Describes the widget that is shown in the extension settings section of
 * GNOME tweek.
 */
const ShortcutsPrefsWidget = new GObject.Class({
  Name: 'Shortcuts.Prefs.Widget',
  GTypeName: 'ShortcutsPrefsWidget',
  Extends: Gtk.Grid,

  /**
   * Initalises the widget
   */
  _init: function(params) {
    this.parent(params);

    this.margin_top = 40;
    this.margin_start = 40;

    this.row_spacing = 20;
    this.column_spacing = 10;

    this.set_orientation(Gtk.Orientation.VERTICAL);

    this._settings = Convenience.getSettings();

    let showIconCheckButton = new Gtk.CheckButton({
      label: _("Show tray icon"),
      margin_top: 6 }
    );

    this._settings.bind('show-icon', showIconCheckButton, 'active', Gio.SettingsBindFlags.DEFAULT);
    this.attach(showIconCheckButton, 0, 1, 2, 1)

    let showTransparentCheckButton = new Gtk.CheckButton({
      label: _("Tranparent Popup"),
      margin_top: 40 }
    );

    this._settings.bind('transparent-popup', showTransparentCheckButton, 'active', Gio.SettingsBindFlags.DEFAULT);
    this.attach_next_to(showTransparentCheckButton, showIconCheckButton, 0, 1, 2, 1)


  }
});
