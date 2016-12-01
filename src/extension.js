const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;
const St = imports.gi.St;

const Gettext = imports.gettext;
const Lang = imports.lang;
const Mainloop = imports.mainloop;

const ExtensionUtils = imports.misc.extensionUtils;

const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const _ = Gettext.gettext;

let button, stage, panel_panel, left_panel, right_panel;

function _hideShortcuts() {
    panel_panel.remove_actor(left_panel);
    panel_panel.remove_actor(right_panel);
    stage.remove_actor(panel_panel);
    Main.uiGroup.remove_actor(stage);
    left_panel = null;
    right_panel = null;
    panel_panel = null;
    stage = null;
}

function _runHideAnimation() {
    Tweener.addTween(stage,
                     { opacity: 0,
                       time: 1,
                       transition: 'easeOutQuad',
                       onComplete: _hideShortcuts });
}

function _showShortcuts() {
    if (!stage) {
        stage = new St.BoxLayout({ style_class: 'background-boxlayout',
                              pack_start: false,
                              vertical: true });
        panel_panel = new St.BoxLayout({ style_class: 'panel-boxlayout',
                              pack_start: false,
                              vertical: false});

        stage.add_actor(panel_panel);

        left_panel = new St.BoxLayout({
            style_class: 'left-boxlayout',
            pack_start: false,
            vertical: true });
        right_panel = new St.BoxLayout({
            style_class: 'right-boxlayout',
            pack_start: false,
            vertical: true });
        panel_panel.add_actor(left_panel);
        panel_panel.add_actor(right_panel);

        _readShortcuts();

        stage.add_actor(new St.Label({ 
            style_class: 'superkey-prompt', 
            text: _("The super key is the Windows key on most keyboards")
        }));

        Main.uiGroup.add_actor(stage);
    }

    let monitor = Main.layoutManager.primaryMonitor;

    stage.set_position(monitor.x + Math.floor(monitor.width / 2 - stage.width / 2),
                      monitor.y + Math.floor(monitor.height / 2 - stage.height / 2));
    Mainloop.timeout_add(10000, _runHideAnimation);
}

function _readShortcuts() {
    let SHORTCUTS_FILE = this._settings.get_string('shortcuts-file') || 
        Me.dir.get_child('shortcuts.json').get_path();
    if (!GLib.file_test(SHORTCUTS_FILE, GLib.FileTest.EXISTS)) {
        let msg = _("Shortcuts file not found: '%s'").format(SHORTCUTS_FILE);
        Main.notifyError(msg);
        return;
    }
    let file = Gio.file_new_for_path(SHORTCUTS_FILE);
    let [result, contents] = file.load_contents(null);
    if (!result) {
        let msg = _("Unable to read file: '%s'").format(SHORTCUTS_FILE);
        Main.notifyError(msg);
        return
    }

    let shortcuts = JSON.parse(contents);
    let shortcutLength = shortcuts.length;
    for (let i = 0; i < shortcuts.length; i++) {
        shortcutLength += shortcuts[i].shortcuts.length;
    }

    let listProgress = 0.0;
    for (let i = 0; i < shortcuts.length; i++) {
        listProgress += shortcuts[i].shortcuts.length * 1.0 / shortcutLength;
        let panel = (listProgress < 0.5) ? left_panel : right_panel;
        panel.add_actor(new St.Label({ 
            style_class: 'shortcut-section', 
            text: shortcuts[i].name
        }));
        for (let j = 0; j < shortcuts[i].shortcuts.length; j++) {
            let item_panel = new St.BoxLayout({
                style_class: 'item-boxlayout',
                pack_start: false,
                vertical: false });
            let key = shortcuts[i].shortcuts[j].key;
            let description = _(shortcuts[i].shortcuts[j].description); 
            item_panel.add(new St.Label({ 
                style_class: 'shortcut-key-label', 
                text: key
            }));
            item_panel.add(new St.Label({ 
                style_class: 'shortcut-description-label', 
                text: description
            }));
            panel.add_actor(item_panel);
        }
    }
}


function init() {
    Convenience.initTranslations();
    this._settings = Convenience.getSettings();
    this._settings.connect('changed::show-icon', Lang.bind(this, this._toggleIcon));
    this._settings.connect('changed::use-custom-shortcuts', 
        Lang.bind(this, this._setShortcutsFile));
}

function enable() {
    Main.overview._specialToggle = function (evt) {
        _showShortcuts();
    };
    Main.wm.setCustomKeybindingHandler('toggle-overview', 
        Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW, 
        Lang.bind(Main.overview, Main.overview._specialToggle));
    _toggleIcon();
}

function _toggleIcon() {
    let SHOW_ICON = this._settings.get_boolean('show-icon');
    if (!SHOW_ICON) {
        Main.panel._rightBox.remove_child(button);
        return;
    }
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    let icon = new St.Icon({ icon_name: 'preferences-desktop-keyboard-shortcuts-symbolic',
                             style_class: 'system-status-icon' });

    button.set_child(icon);
    button.connect('button-press-event', _showShortcuts);

    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function _setShortcutsFile() {
    if (!this._settings.get_boolean('use-custom-shortcuts')) {
        this._settings.set_string('shortcuts-file', 
            Me.dir.get_child('shortcuts.json').get_path());
    }
}

function disable() {
    Main.panel._rightBox.remove_child(button);
    Main.wm.setCustomKeybindingHandler('toggle-overview', 
        Shell.ActionMode.NORMAL, Lang.bind(Main.overview, Main.overview.toggle));
    delete Main.overview._specialToggle;
}
