/* exported normalize_description */
function normalize_description(str) {
  str = str.replaceAll("-", " ");
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* exported normalize_key */
function normalize_key(str) {
  return str.replace("['","").replace("']","").replaceAll(",","").replaceAll("'","").replaceAll(">","> ");
}

/* exported translateSchemaNames */
function translateSchemaNames(schema){

  let translations = {
    "org.gnome.shell.keybindings": "Shell",
    "org.gnome.desktop.wm.keybindings": "Window Manager"
  }

  return translations[schema];
}
