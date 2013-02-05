const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;

const GRUB_CFG = "/boot/grub/grub.cfg";
//~ const GRUB_ENV = "/boot/grub/grubenv";

let chooserItem = null;

function parseGrubConfig() {
    result = [];
    let f = Gio.file_new_for_path(GRUB_CFG);
    let success, content;
    [success, content] = f.load_contents(null, null);
    let lines = String(content).split("\n");
    let line, delimiter, endIndex, newLabel, newCommand;
    let counter = 1;
    for (i in lines) {
        line = lines[i];
        if (line.substring(0,9) == "menuentry") {
            delimiter = line.charAt(10);
            endIndex = line.indexOf(delimiter, 11);
            newLabel = line.substring(11, endIndex);
            newCommand = "pkexec grub-reboot " + delimiter + newLabel + delimiter;
            result.push({label: newLabel, index: counter, command: newCommand});
            counter ++;
        }
    }
    return result;
}

//~ function parseGrubEnv() {
    //~ let f = Gio.file_new_for_path(GRUB_ENV);
    //~ let success, content;
    //~ [success, content] = f.load_contents(null, null);
    //~ let lines = String(content).split("\n");
    //~ let line, delimiter, endIndex, newLabel, newCommand;
    //~ let counter = 1;
    //~ for (i in lines) {
        //~ line = lines[i];
        //~ if (line.substring(0,12) == "saved_entry=") {
            //~ return line.substring(12, line.length);
        //~ }
    //~ }
//~ }

function rebootInto(system) {
    return function () {
        GLib.spawn_async(null, ["sh", "-c", system.command], null, GLib.SpawnFlags.SEARCH_PATH, null, null);
    }
}

function init() {}

function enable() {
    let systems = parseGrubConfig();
    //~ let defaultSystem = parseGrubEnv();
    
    //~ Main.notify("Default system: " + defaultSystem);
    
    let userMenu = Main.panel._statusArea.userMenu;
    let children = userMenu.menu._getMenuItems();
    chooserItem = new PopupMenu.PopupSubMenuMenuItem("Reboot into ...");
    userMenu.menu.addMenuItem(chooserItem, children.length - 1);
    
    let newItem = null;
    for (var i = 0; i < systems.length; i++) {
        newItem = new PopupMenu.PopupMenuItem(systems[i].label);
        newItem.connect("activate", rebootInto(systems[i]));
        chooserItem.menu.addMenuItem(newItem, i);
    }
}

function disable() {
    let children = chooserItem.menu._getMenuItems()
    for (i in children) {
        children[i].destroy();
    }
    chooserItem.destroy();
}
