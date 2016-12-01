const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const Lang = imports.lang;
const Gettext = imports.gettext;
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

function init() {
    Convenience.initTranslations();
}

const ShortcutsPrefsWidget = new GObject.Class({
    Name: 'Shortcuts.Prefs.Widget',
    GTypeName: 'ShortcutsPrefsWidget',
    Extends: Gtk.Grid,

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

        let showIconCheckButton = new Gtk.CheckButton({ label: _("Show tray icon"),
                                                        margin_top: 6 });
        this._settings.bind('show-icon', showIconCheckButton, 'active',
                            Gio.SettingsBindFlags.DEFAULT);
        this.attach(showIconCheckButton, 0, 1, 2, 1)
    }
});

function buildPrefsWidget() {
    let widget = new ShortcutsPrefsWidget();
    widget.show_all();
    return widget;
}
