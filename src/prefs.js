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

// Combines the benefits of spawn_sync (easy retrieval of output)
// with those of spawn_async (non-blocking execution).
// Based on https://github.com/optimisme/gjs-examples/blob/master/assets/spawn.js.
function spawnWithCallback(workingDirectory, argv, envp, flags, childSetup, callback) {
  let [success, pid, stdinFile, stdoutFile, stderrFile] = GLib.spawn_async_with_pipes(
    workingDirectory, argv, envp, flags, childSetup);

  if (!success)
    return;

  GLib.close(stdinFile);
  GLib.close(stderrFile);

  let standardOutput = "";

  let stdoutStream = new Gio.DataInputStream({
    base_stream: new Gio.UnixInputStream({
      fd: stdoutFile
    })
  });

  readStream(stdoutStream, function(output) {
    if (output === null) {
      stdoutStream.close(null);
      callback(standardOutput);
    } else {
      standardOutput += output;
    }
  });
}
function readStream(stream, callback) {
  stream.read_line_async(GLib.PRIORITY_LOW, null, function(source, result) {
    let [line] = source.read_line_finish(result);

    if (line === null) {
      callback(null);
    } else {
      callback(imports.byteArray.toString(line) + "\n");
      readStream(source, callback);
    }
  });
}


function getShortcutKeys(){


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
  _init: function(params) {
    this.parent(
      {
        valign: Gtk.Align.FILL,
        vexpand: true
      }
    );

    this.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);

    this._settings = Convenience.getSettings();

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
    //this._settings.bind('show-icon', showIconCheckButton, 'active', Gio.SettingsBindFlags.DEFAULT);
    this._grid.attach_next_to(showIconCheckButton, mainSettingsLabel, Gtk.PositionType.BOTTOM, 1, 2);

    let showTransparentCheckButton = new Gtk.CheckButton({
      label: _("Tranparent Popup"),
      margin_top: 6 }
    );
    //this._settings.bind('transparent-popup', showTransparentCheckButton, 'active', Gio.SettingsBindFlags.DEFAULT);
    this._grid.attach_next_to(showTransparentCheckButton, showIconCheckButton, Gtk.PositionType.BOTTOM, 1, 2);

    let enableItemsLabel = new Gtk.Label({
      label: '<span size="x-large">enable shortcut items</span>',
      use_markup: true,
      xalign: 0,
      hexpand: true,
      margin_top: 6
    });
    this._grid.attach_next_to(enableItemsLabel, showTransparentCheckButton, Gtk.PositionType.BOTTOM, 1, 2);

    let scriptPath = Me.dir.get_child("listkeys.sh").get_path();
    let hide_items = {};

    let previous_item = enableItemsLabel;

    spawnWithCallback(null, [scriptPath],  null, GLib.SpawnFlags.SEARCH_PATH, null, function(standardOutput){

      let lines = standardOutput.split(/\r?\n/);

      lines.forEach(function(line){

        if(line.trim() !== ""){

          let entry = line.split(" ");
          log(entry);

          hide_items[entry[1]] = new Gtk.CheckButton({
            label: _(entry[1]),
            margin_top: 1
          });

          //this._settings.bind('binding-'+entry[1], showIconCheckButton, 'active', Gio.SettingsBindFlags.DEFAULT);
          this._grid.attach_next_to(hide_items[entry[1]], previous_item, Gtk.PositionType.BOTTOM, 1, 2);
          previous_item = hide_items[entry[1]];

        }

      }.bind(this));

    }.bind(this));

  }
});
