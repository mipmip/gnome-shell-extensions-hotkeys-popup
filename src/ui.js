'use strict';

const { Gtk, GObject } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Uuid = Me.metadata.uuid.replace(/[^a-zA-Z]/g, '_');

/* exported Shortcut */
var Shortcut = GObject.registerClass({
  GTypeName: 'Gjs_%s_UI_Shortcut'.format(Uuid),
  Properties: {
    'shortcut': GObject.ParamSpec.jsobject('shortcut', 'shortcut', 'shortcut', GObject.ParamFlags.READWRITE, []),
  },
  Signals: {
    'changed': { param_types: [GObject.TYPE_STRING] },
  },
}, class Shortcut extends Gtk.Box {
  _init(shortcut) {
    super._init();
    let model = new Gtk.ListStore();
    model.set_column_types([GObject.TYPE_STRING]);
    let [_, key, mods] = Gtk.accelerator_parse(shortcut[0]);
    model.set(model.insert(0), [0], [Gtk.accelerator_get_label(key, mods)]);
    let tree = new Gtk.TreeView({ model: model, headers_visible: false });
    let acc = new Gtk.CellRendererAccel({ editable: true, accel_mode: Gtk.CellRendererAccelMode.GTK });
    let column = new Gtk.TreeViewColumn();
    column.pack_start(acc, false);
    column.add_attribute(acc, 'text', 0);
    tree.append_column(column);

    acc.connect('accel-edited', (acce, iter, key, mods) => {
      if(!key) return;
      let name = Gtk.accelerator_name(key, mods);
      let [, iterator] = model.get_iter_from_string(iter);
      model.set(iterator, [0], [Gtk.accelerator_get_label(key, mods)]);
      this.shortcut = [name];
      this.emit('changed', name);
    });
    this.append(tree);
  }
});

/* exported ListGrid */
var ListGrid = GObject.registerClass({
  GTypeName: 'Gjs_%s_UI_ListGrid'.format(Uuid),
} ,class ListGrid extends Gtk.Grid {
  _init() {
    super._init({
      hexpand: true,
      margin_end: 10,
      margin_top: 10,
      margin_start: 10,
      margin_bottom: 10,
      column_spacing: 18,
      row_spacing: 12,
    });
    this._count = 0;
  }

  _add(x, y, z) {
    this.attach(new Box().appends([x, y, z]), 0, this._count++, 2, 1);
    if(!(x instanceof Gtk.CheckButton)) return;
    if(y) x.bind_property('active', y, 'sensitive', GObject.BindingFlags.GET), y.set_sensitive(x.active);
    if(z) x.bind_property('active', z, 'sensitive', GObject.BindingFlags.GET), z.set_sensitive(x.active);
  }

  _att(x, y, z) {
    let r = this._count++;
    if(z) {
      this.attach(x, 0, r, 1, 1);
      this.attach(new Box().appends([y, z]), 1, r, 1, 1);
    } else if(y) {
      this.attach(x, 0, r, 1, 1);
      this.attach(y, 1, r, 1, 1);
    } else {
      this.attach(x, 0, r, 2, 1)
    }
  }
});

/* exported Box */
var Box = GObject.registerClass({
  GTypeName: 'Gjs_%s_UI_Box'.format(Uuid),
}, class Box extends Gtk.Box {
  _init(params) {
    super._init();
    if(params?.margins) this.set_margins(params.margins);
    if(params?.spacing) this.set_spacing(params.spacing);
    if(params?.vertical) this.set_orientation(Gtk.Orientation.VERTICAL);
  }

  set_margins(margins) {
    let set_mgns = mgns => {
      this.set_margin_top(mgns[0]);
      this.set_margin_end(mgns[1]);
      this.set_margin_bottom(mgns[2]);
      this.set_margin_start(mgns[3]);
    };
    switch(margins.length) {
      case 4: set_mgns(margins); break;
      case 3: set_mgns(margins.concat(margins[1])); break;
      case 2: set_mgns(margins.concat(margins)); break;
      case 1: set_mgns(Array(4).fill(margins[0])); break;
    }
  }

  appends(widgets) {
    widgets.forEach(w => { if(w) this.append(w); });
    return this;
  }

  appendS(widgets) {
    widgets.forEach((w, i, arr) => {
      if(!w) return;
      this.append(w);
      if(!Object.is(arr.length - 1, i)) this.append(new Gtk.Separator());
    });
    return this;
  }
});

/* exported Frame */
var Frame = GObject.registerClass({
  GTypeName: 'Gjs_%s_UI_Frame'.format(Uuid),
}, class Frame extends Gtk.Frame {
  _init(widget, label) {
    super._init({
      margin_end: 60,
      margin_top: 30,
      margin_start: 60,
      margin_bottom: 30,
    });

    this.set_child(widget);
    if(!label) return;
    this.set_label_widget(new Gtk.Label({ use_markup: true, label: '<b><big>' + label + '</big></b>', }));
  }
});

/* exported Check */
var Check = GObject.registerClass({
  GTypeName: 'Gjs_%s_UI_Check'.format(Uuid),
}, class Check extends Gtk.CheckButton {
  _init(x, y) {
    super._init({
      label: x,
      hexpand: true,
      halign: Gtk.Align.START,
      tooltip_text: y ? y : '',
    });
  }
});

/* exported Label */
var Label = GObject.registerClass({
  GTypeName: 'Gjs_%s_UI_Label'.format(Uuid),
}, class Label extends Gtk.Label {
  _init(x, y) {
    super._init({
      label: x,
      hexpand: true,
      halign: Gtk.Align.START,
      tooltip_text: y ? y : '',
    });
  }
});

/* exported LargeLabel */
var LargeLabel = GObject.registerClass({
  GTypeName: 'Gjs_%s_UI_LargeLabel'.format(Uuid),
}, class LargeLabel extends Gtk.Label {
  _init(x, y) {
    super._init({
      label: '<span size="x-large">'+x+'</span>',
      use_markup: true,
      hexpand: true,
      halign: Gtk.Align.START,
      tooltip_text: y ? y : '',
    });
  }
});




