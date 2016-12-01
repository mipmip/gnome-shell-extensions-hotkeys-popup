/*********************************************************************
* The LogOutButton is Copyright (C) 2016 Kyle Robbertze
* African Institute for Mathematical Sciences, South Africa
*
* LogOutButton is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* LogOutButton is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with LogOutButton.  If not, see <http://www.gnu.org/licenses/>.
**********************************************************************/

const Gettext = imports.gettext;
const Gio = imports.gi.Gio;
const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;

/**
 * Initialises the translation framework with the optional domain. It defaults
 * to the gettext domain specified in the extension's metadata.
 */
function initTranslations(domain) {
    let extension = ExtensionUtils.getCurrentExtension();
    domain = domain || extension.metadata['gettext-domain'];
    Gettext.textdomain(domain);
    /*
     * Tests if the extension is installed locally, in which case the 
     * translations will be in a subdirectory. If it is not, then we assume
     * that it is in the GNOME default Locale directory.
     */
    let localeDir = extension.dir.get_child('locale');
    if (localeDir.query_exists(null)) {
        Gettext.bindtextdomain(domain, localeDir.get_path());
    } else {
        Gettext.bindtextdomain(domain, Config.LOCALEDIR);
    }
}

/**
 * Initialises the settings that the extension uses.
 * It uses the schema given if it is provided, otherwise it defaults to the
 * schema specified in the extensions metadata.
 */
function getSettings(schema) {
    let extension = ExtensionUtils.getCurrentExtension();
    schema = schema || extension.metadata['settings-schema'];
    const GioSSS = Gio.SettingsSchemaSource;
    /*
     * The schema is expected to be in the subdirectory schemas in the
     * extension directory. If not we assume it is in the GNOME default.
     */
    let schemaDir = extension.dir.get_child('schemas');
    let schemaSource;
    if (schemaDir.query_exists(null)) {
        schemaSource = GioSSS.new_from_directory(schemaDir.get_path(),
                                                 GioSSS.get_default(),
                                                 false);
    } else {
        schemaSource = GioSSS.get_default();
    }

    let schemaObj = schemaSource.lookup(schema, true);
    if (!schemaObj) {
        global.log("Unable to find schema " + schema + " for extention " + extension.metadata.uuid);
        return undefined;
    }
    return new Gio.Settings({ settings_schema: schemaObj });
}
