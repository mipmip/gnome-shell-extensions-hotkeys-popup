/*********************************************************************
* The Shortcuts is Copyright (C) 2016-2018 Kyle Robbertze
* African Institute for Mathematical Sciences, South Africa
*
* Shortcuts is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License version 3 as
* published by the Free Software Foundation
*
* Shortcuts is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Shortcuts.  If not, see <http://www.gnu.org/licenses/>.
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
        this.margin = 12;
        this.row_spacing = this.column_spacing = 6;
        this.set_orientation(Gtk.Orientation.VERTICAL);

        this._settings = Convenience.getSettings();

        this.customShortcutsFileCheckButton = new Gtk.CheckButton({
                                        label: _("Custom Shortcuts File") });
        this.attach(this.customShortcutsFileCheckButton, 0, 0, 2, 1);
        this._settings.bind('use-custom-shortcuts', this.customShortcutsFileCheckButton,
                                        'active', Gio.SettingsBindFlags.DEFAULT);

        /*
        this.shortcutsFile = new Gtk.FileChooserButton ({
                                        title: _("Select shortcut file"),
                                        action: Gtk.FileChooserAction.OPEN });
        this.shortcutsFile.select_uri("file://" + this._settings.get_string('shortcuts-file'));
        let shortcutsFileFilter = new Gtk.FileFilter();
        this.shortcutsFile.set_filter(shortcutsFileFilter);
        shortcutsFileFilter.add_mime_type("application/json");
        this.shortcutsFile.connect("selection_changed", Lang.bind(this, function(sw, data) {
            let path = String(this.shortcutsFile.get_uri()).slice(7);
            this._settings.set_string('shortcuts-file', path);
        }));
        this.attach(this.shortcutsFile, 3, 0, 1, 1);
        */

        let showIconCheckButton = new Gtk.CheckButton({ label: _("Show tray icon"),
                                                        margin_top: 6 });
        this._settings.bind('show-icon', showIconCheckButton, 'active',
                            Gio.SettingsBindFlags.DEFAULT);
        this.attach(showIconCheckButton, 0, 1, 2, 1)
    }
});
