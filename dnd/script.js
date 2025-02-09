/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ Cookie-"Database"                                                            │
└──────────────────────────────────────────────────────────────────────────────┘
*/

const EXPIRE_2038 = new Date(Date.now() + 2147483647 * 1000).toUTCString();

const C_PLAYER_NAME = "player-name";
const C_PLAYER_HP_TOTAL = "player-hp-total";
const C_PLAYER_HP_CURRENT = "player-hp-current";
const C_PLAYER_HP_TEMP_BONUS = "player-hp-temp-bonus";
const C_SPELL_LIST = "spell-list";
const C_SPELL_PRE = "spell-";
const C_SPELL_NAME = "-name";
const C_SPELL_CASTING_TIME = "-casting-time";
const C_SPELL_RANGE = "-range";
const C_SPELL_LEVEL = "-level";
const C_SPELL_SCHOOL = "-school";
const C_SPELL_COMPONENTS = "-comp";
const C_SPELL_DURATION = "-duration";
const C_SPELL_DESCRIPTION = "-description";
const C_INVENTORY_LIST = 'inventory-list';

function _set_cookie(name, value) {
  let encoded_value = encodeURIComponent(value);
  console.debug(`db: set cookie <${name}> = <${encoded_value}>`);
  document.cookie = `${name}=${encoded_value}; expires=${EXPIRE_2038}; SameSite=Strict;`;
}

function _get_cookie(name) {
  let cookie_list = document.cookie.split(';');
  let cookie = cookie_list
    .map((e) => { return e.startsWith(' ') ? e.substring(1) : e; })
    .find((e) => { return e.startsWith(name + '='); });

  if (cookie == undefined) {
    console.warn(`Cookie <${name}> could not be retrieved and might not exist.`);
    return "";
  } else {
    let value = cookie.substring(name.length + 1);
    console.debug("Before decoding: " + value);
    value = decodeURIComponent(value);
    console.debug("After decoding: " + value);
    console.debug(`db: get cookie <${name}> = <${value}>`);
    return value;
  }
}

// Player

function get_player_name() { return _get_cookie(C_PLAYER_NAME); }
function set_player_name(name) { _set_cookie(C_PLAYER_NAME, name); }
function get_player_hp_total() { return _get_cookie(C_PLAYER_HP_TOTAL); }
function set_player_hp_total(hp) { _set_cookie(C_PLAYER_HP_TOTAL, hp); }
function get_player_hp_current() { return _get_cookie(C_PLAYER_HP_CURRENT); }
function set_player_hp_current(hp) { _set_cookie(C_PLAYER_HP_CURRENT, hp); }
function get_player_hp_temp_bonus() { return _get_cookie(C_PLAYER_HP_TEMP_BONUS); }
function set_player_hp_temp_bonus(hp) { return _set_cookie(C_PLAYER_HP_TEMP_BONUS, hp); }

// Spells
function get_spell_list() {
  let spell_list = _get_cookie(C_SPELL_LIST);
  if (spell_list == undefined || spell_list.length == 0) {
    return [];
  } else {
    return spell_list.split(',');
  }
}
function get_spell_name(i) { return _get_cookie(C_SPELL_PRE + i + C_SPELL_NAME); }
function set_spell_name(i, value) { _set_cookie(C_SPELL_PRE + i + C_SPELL_NAME, value); }
function get_spell_casting_time(i) { return _get_cookie(C_SPELL_PRE + i + C_SPELL_CASTING_TIME); }
function set_spell_casting_time(i, value) { _set_cookie(C_SPELL_PRE + i + C_SPELL_CASTING_TIME, value); }
function get_spell_range(i) { return _get_cookie(C_SPELL_PRE + i + C_SPELL_RANGE); }
function set_spell_range(i, value) { _set_cookie(C_SPELL_PRE + i + C_SPELL_RANGE, value); }
function get_spell_level(i) { return _get_cookie(C_SPELL_PRE + i + C_SPELL_LEVEL); }
function set_spell_level(i, value) { _set_cookie(C_SPELL_PRE + i + C_SPELL_LEVEL, value); }
function get_spell_school(i) { return _get_cookie(C_SPELL_PRE + i + C_SPELL_SCHOOL); }
function set_spell_school(i, value) { _set_cookie(C_SPELL_PRE + i + C_SPELL_SCHOOL, value); }
function get_spell_components(i) { return _get_cookie(C_SPELL_PRE + i + C_SPELL_COMPONENTS); }
function set_spell_components(i, value) { _set_cookie(C_SPELL_PRE + i + C_SPELL_COMPONENTS, value); }
function get_spell_duration(i) { return _get_cookie(C_SPELL_PRE + i + C_SPELL_DURATION); }
function set_spell_duration(i, value) { _set_cookie(C_SPELL_PRE + i + C_SPELL_DURATION, value); }
function get_spell_description(i) { return _get_cookie(C_SPELL_PRE + i + C_SPELL_DESCRIPTION); }
function set_spell_description(i, value) { _set_cookie(C_SPELL_PRE + i + C_SPELL_DESCRIPTION, value); }

function update_all() {
  update_player();
  update_c_display();
  update_spells();
  update_inventory();
}

function update_player() {
  let player_name = get_player_name();
  let player_name_node = document.getElementById('char-name');
  if (player_name != undefined && player_name.length != 0) {
    player_name_node.value = player_name;
  }
}

function toggle_spell_description(spell_id) {
  console.debug(`toggling spell desc for ID = ${spell_id}`);

  let spell_list_node = document.getElementById("spells-list");
  if (spell_list_node == undefined) {
    console.error(`Tried toggling spell ${spell_id}'s description, but the spell_list_node is undefined`);
    return;
  }

  let spell_node = undefined;
  for (i = 0; i < spell_list_node.childNodes.length; i++) {
    let cur_spell = spell_list_node.childNodes[i];
    let id = cur_spell.getElementsByClassName('id')[0].textContent;
    if (id == spell_id) {
      spell_node = cur_spell;
    }
  }

  if (spell_node == undefined) {
    console.error(`Tried toggling spell ${spell_id}'s description, but was unable to find it in the spell_list_node's children`);
    return;
  }

  let desc_node = spell_node.getElementsByClassName("description")[0];
  if (desc_node.classList.contains('hidden')) {
    desc_node.classList.remove('hidden');
  } else {
    desc_node.classList.add('hidden');
  }
}

function update_spells() {
  spell_list_node = document.getElementById("spells-list");
  spell_list_node.textContent = "";

  get_spell_list().forEach(function(spell_id) {
    if (spell_id != "") {
      let name = get_spell_name(spell_id);
      let casting_time = get_spell_casting_time(spell_id);
      let range = get_spell_range(spell_id);
      let level = get_spell_level(spell_id);
      let school = get_spell_school(spell_id);
      let components = get_spell_components(spell_id);
      let duration = get_spell_duration(spell_id);
      let description = get_spell_description(spell_id);

      let li = document.createElement("li");
      let brief = `<div  hidden class="id">${spell_id}</div><div onclick="toggle_spell_description(${spell_id});"><b>${name}</b> [ ${casting_time} | ${range} | ${school} ${level} | ${components} | ${duration} ]</div>`;
      let desc = `<pre class="description hidden">${description}</pre>`;
      li.innerHTML = `${brief}${desc}`;
      li.tabIndex = 0;
      li.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { toggle_spell_description(spell_id); } });
      spell_list_node.appendChild(li);
    }
  });
  if (spell_list_node.childNodes.length == 0) {
    spell_list_node.innerHTML = "No spells saved yet.";
  }
}

function btn_toggle_new_spell() {
  let container = document.getElementById("new-spell-fieldset-container");
  container.hidden = !container.hidden;

  let legend = document.getElementById("new-spell-fieldset").getElementsByTagName("legend")[0];
  let toggle = legend.getElementsByClassName("toggle")[0];
  toggle.textContent = container.hidden ? "▼" : "▲";
}

function btn_set_cookie() {
  let c_name = document.getElementById('c_name').value;
  let c_value = document.getElementById('c_value').value;
  _set_cookie(c_name, c_value);
  update_c_display();
}

function btn_get_cookie() {
  let c_name = document.getElementById('c_name');
  let c_value = document.getElementById('c_value');
  c = _get_cookie(c_name.value);
  c_value.value = c;
}

function btn_update_c_display() {
  update_c_display();
}

function update_c_display() {
  let c_display = document.getElementById('c_display');
  c_display.textContent = document.cookie.split("; ").join("\n");
}

function btn_export() {
  export_cookies_to_file();
}

function export_cookies_to_file() {
  let c_decoded = decodeURIComponent(document.cookie);
  console.log(c_decoded);
}

function delete_all_cookies() {
  document.cookie.split(";").forEach(function (cookie) {
    document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;path=cyberme0w.dev/;expires=" + new Date().toUTCString());
  });
  document.cookie = "";
}

function btn_reset() {
  if (confirm("This will clear all data from your browser cookies. Are you sure?")) {
    delete_all_cookies();
  }
  update_all();
}

function btn_create_spell() {
  let spell_name = document.getElementById("new-spell-name");
  let spell_casting_time = document.getElementById("new-spell-casting-time");
  let spell_range = document.getElementById("new-spell-range");
  let spell_level = document.getElementById("new-spell-level");
  let spell_school = document.getElementById("new-spell-school");
  let spell_components = document.getElementById("new-spell-components");
  let spell_duration = document.getElementById("new-spell-duration");
  let spell_description = document.getElementById("new-spell-description");

  create_spell(
    spell_name.value,
    spell_casting_time.value,
    spell_range.value,
    spell_level.value,
    spell_school.value,
    spell_components.value,
    spell_duration.value,
    spell_description.value
  );

  let fieldset_container = document.getElementById("new-spell-fieldset-container");
  fieldset_container.childNodes.forEach(function(child) { child.value = "" })
}

function create_spell(name, casting_time, range, level, school, components, duration, description) {
  c_spells = _get_cookie(C_SPELL_LIST);
  let spell_id = 0;
  if (c_spells == undefined || c_spells == "") {
    _set_cookie(C_SPELL_LIST, spell_id);
  } else {
    let s_arr = c_spells.split(',');
    let last_s = parseInt(s_arr[s_arr.length - 1]);
    spell_id = last_s + 1;
    _set_cookie(C_SPELL_LIST, `${c_spells},${spell_id}`);
  }

  set_spell_name(spell_id, name);
  set_spell_casting_time(spell_id, casting_time);
  set_spell_range(spell_id, range);
  set_spell_level(spell_id, level);
  set_spell_school(spell_id, school);
  set_spell_components(spell_id, components);
  set_spell_duration(spell_id, duration);
  set_spell_description(spell_id, description);

  update_spells();
}

function btn_save_new_inventory_entry() {
  let item_string = document.getElementById('inv-new-entry').value;
  let inventory_list = document.getElementById('inventory-list');

  let li = document.createElement('li');
  li.textContent = item_string;
  inventory_list.appendChild(li);

  add_inventory_entry(item_string);
  update_inventory();
}

function get_inventory_list() {
  let inv_list = _get_cookie(C_INVENTORY_LIST);
  console.debug('inv_list: ', inv_list);

  let inv_list_split = inv_list.length > 0 ? inv_list.split('|') : [];
  console.debug('inv_list_split: ', inv_list_split);

  let inv_list_split_decoded = inv_list_split.map( (item) => { return decodeURIComponent(item); });
  console.debug('inv_list_split_decoded: ', inv_list_split_decoded);

  return inv_list_split_decoded;
}

function add_inventory_entry(item_string) {
  let inv = get_inventory_list();
  inv.push(item_string);
  set_inventory_list(inv);
}

function set_inventory_list(items) {
  let encoded_items = items.map( (item) => { return encodeURIComponent(item); });
  let cookie_value = encoded_items.join('|');
  _set_cookie(C_INVENTORY_LIST, cookie_value);
}

function onload_update() {
  update_all();
}

function toggle_debug_info() {
  let adv = document.getElementById("debug-info");
  adv.hidden = !adv.hidden;
}

function _open_tab(tabname) {
  let tabs = document.getElementById("tabs");
  let tab_buttons = document.getElementById("tab-buttons");

  let active_tabs = tabs.getElementsByClassName("active");

  for (let i = 0; i < active_tabs.length; i++) {
    active_tabs[i].classList.remove('active');
  }

  let active_tab_buttons = tab_buttons.getElementsByClassName("active");
  for (let i = 0; i < active_tab_buttons.length; i++) {
    active_tab_buttons[i].classList.remove('active');
  }

  let selected_tabs = tabs.getElementsByClassName(`tab-${tabname}`);
  if (selected_tabs != undefined && selected_tabs.length > 0) {
    selected_tabs[0].classList.add('active');
  }

  let selected_tab_buttons = tab_buttons.getElementsByClassName(`tab-button-${tabname}`);
  if (selected_tab_buttons != undefined && selected_tab_buttons.length > 0) {
    selected_tab_buttons[0].classList.add('active');
  }
}

/* TABS */
function open_spells_tab() { _open_tab('spells'); }
function open_character_tab() { _open_tab('character'); }
function open_inventory_tab() { _open_tab('inventory'); }
function open_advanced_tab() { _open_tab('advanced'); }

/* PLAYER TAB */
function save_player_name() {
  let name_node = document.getElementById('char-name');
  let name = name_node.value;
  set_player_name(name);
}

function update_inventory() {
  let inv_list = document.getElementById('inventory-list');
  inv_list.replaceChildren();

  let stored_inv_list = get_inventory_list();
  stored_inv_list.forEach( (item) => {
    let li = document.createElement('li');
    li.textContent = item;
    inv_list.append(li);
  });
}

/* BACKUP & RESTORE */
function restore_cookies_from_file() {
  let file_node = document.getElementById('restore-file');
}
