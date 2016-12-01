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
