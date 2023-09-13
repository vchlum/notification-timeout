'use strict';

/**
 * extension notification-timeout
 * JavaScript Gnome extension for setting same timeout for all notifications.
 *
 * @author Václav Chlumský
 * @copyright Copyright 2023, Václav Chlumský.
 */

 /**
 * @license
 * The MIT License (MIT)
 *
 * Copyright (c) 2023 Václav Chlumský
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export const PreferencesPage = GObject.registerClass({
    GTypeName: 'NotificationTimeoutPrefsWidget'
}, class PreferencesPage extends GObject.Object {
    _init(metadata, settings) {
        super._init();

        this._metadata = metadata;
        this._settings = settings;
        this._ignoreIdle = settings.get_boolean("ignore-idle");
        this._alwaysNormal = settings.get_boolean("always-normal");
        this._newTimeout = settings.get_int("timeout");
    }

    /**
     * Build Settings page with general settings
     * 
     * @method buildGeneralPage
     * @return {Object} widget for page in notebook
     */
    _buildGeneralPage() {

        let top = 1;
        let labelWidget = null;

        let generalPage = new Gtk.Grid(
            {
                hexpand: true,
                vexpand: true,
                halign:Gtk.Align.CENTER,
                valign:Gtk.Align.CENTER
            }
        );

        /**
         * Ignore idle
         */
        labelWidget = new Gtk.Label(
            {label: _("Ignore idle (always use timeout):")}
        );
        generalPage.attach(labelWidget, 1, top, 1, 1);


        let ignoreIdleSwitch = new Gtk.Switch(
            {
                active: this._ignoreIdle,
                hexpand: false,
                vexpand: false,
                halign:Gtk.Align.CENTER,
                valign:Gtk.Align.CENTER
            }
        );

        ignoreIdleSwitch.connect(
            "notify::active",
            () => {
                this._ignoreIdle = ignoreIdleSwitch.get_active();
                this._settings.set_boolean("ignore-idle", this._ignoreIdle);
            }
        )
        generalPage.attach_next_to(
            ignoreIdleSwitch,
            labelWidget,
            Gtk.PositionType.RIGHT,
            1,
            1
        );

        top++;

        /**
         * Notification' urgency is always normal
         */
        labelWidget = new Gtk.Label(
            {label: _("Timeouted notifications are always 'normal' ('critical' don't timeout):")}
        );
        generalPage.attach(labelWidget, 1, top, 1, 1);


        let alwaysNormalSwitch = new Gtk.Switch(
            {
                active: this._alwaysNormal,
                hexpand: false,
                vexpand: false,
                halign:Gtk.Align.CENTER,
                valign:Gtk.Align.CENTER
            }
        );

        alwaysNormalSwitch.connect(
            "notify::active",
            () => {
                this._alwaysNormal = alwaysNormalSwitch.get_active();
                this._settings.set_boolean("always-normal", this._alwaysNormal);
            }
        )
        generalPage.attach_next_to(
            alwaysNormalSwitch,
            labelWidget,
            Gtk.PositionType.RIGHT,
            1,
            1
        );

        top++;

        /**
         * Notification timeout
         */
        labelWidget = new Gtk.Label(
            {label: _("Notification timeout:")}
        );
        generalPage.attach(labelWidget, 1, top, 1, 1);

        let timeoutComboBox = new Gtk.ComboBoxText();

        timeoutComboBox.append("0", _("Don't timeout"));
        timeoutComboBox.append("500", _("500 ms"));
        timeoutComboBox.append("1000", _("1 s"));
        timeoutComboBox.append("2000", _("2 s"));
        timeoutComboBox.append("3000", _("3 s"));
        timeoutComboBox.append("4000", _("4 s"));
        timeoutComboBox.append("5000", _("5 s"));
        timeoutComboBox.append("6000", _("6 s"));
        timeoutComboBox.append("7000", _("7 s"));
        timeoutComboBox.append("8000", _("8 s"));
        timeoutComboBox.append("9000", _("9 s"));
        timeoutComboBox.append("10000", _("10 s"));
        timeoutComboBox.append("15000", _("15 s"));
        timeoutComboBox.append("20000", _("20 s"));
        timeoutComboBox.append("30000", _("30 s"));
        timeoutComboBox.append("45000", _("45 s"));
        timeoutComboBox.append("60000", _("1 min"));
        timeoutComboBox.append("120000", _("2 min"));
        timeoutComboBox.append("180000", _("3 min"));
        timeoutComboBox.append("240000", _("4 min"));
        timeoutComboBox.append("300000", _("5 min"));
        timeoutComboBox.append("600000", _("10 min"));
        timeoutComboBox.append("900000", _("15 min"));
        timeoutComboBox.append("1800000", _("30 min"));

        timeoutComboBox.set_active_id(this._newTimeout.toString());

        timeoutComboBox.connect(
            "changed",
            () => {
                this._newTimeout = parseInt(timeoutComboBox.get_active_id());
                this._settings.set_int("timeout", this._newTimeout);
            }
        );

        generalPage.attach_next_to(
            timeoutComboBox,
            labelWidget,
            Gtk.PositionType.RIGHT,
            1,
            1
        );

        top++;

        return generalPage;
    }

    /**
     * Build About page
     * 
     * @method buildGeneralPage
     * @return {Object} widget for page in notebook
     */
    _buildAboutPage() {

        let aboutWidget = new Gtk.Box(
            {
                hexpand: true,
                vexpand: true,
                halign:Gtk.Align.CENTER,
                valign:Gtk.Align.CENTER
            }
        );

        let labelWidget = new Gtk.Label(
            {label: `${this._metadata.name}, version: ${this._metadata.version}, Copyright (c) 2023 Václav Chlumský`}
        );

        aboutWidget.append(labelWidget);

        return aboutWidget;
    }

    /**
     * This function is called when the preferences window is first created to build
     * and return a Gtk widget.
     *
     * @method buildPrefsWidget
     * @return {Object} returns the prefsWidget
     */
    buildPrefsWidget() {

        let prefsPage = new Adw.PreferencesPage();
        let prefsGroup = new Adw.PreferencesGroup();

        let prefsMainBox = new Gtk.Box(
            {
                hexpand: true,
                vexpand: true,
                vexpand_set:true,
                hexpand_set: true,
                halign:Gtk.Align.FILL,
                valign:Gtk.Align.FILL
            }
        );

        let notebook = new Gtk.Notebook();

        let pageGeneral = this._buildGeneralPage();
        pageGeneral.border_width = 10;
        notebook.append_page(
            pageGeneral,
            new Gtk.Label({label: _("General settings")})
        );

        let pageAbout = this._buildAboutPage()
        pageAbout.border_width = 10;
        notebook.append_page(
            pageAbout,
            Gtk.Image.new_from_icon_name("help-about", Gtk.IconSize.MENU)
        );

        prefsMainBox.append(notebook);
        prefsGroup.add(prefsMainBox);
        prefsPage.add(prefsGroup);

        return prefsPage;
    }
});
