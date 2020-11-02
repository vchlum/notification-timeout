'use strict';

/**
 * extension notification-timeout
 * JavaScript Gnome extension for setting same timeout for all notifications.
 *
 * @author Václav Chlumský
 * @copyright Copyright 2020, Václav Chlumský.
 */

 /**
 * @license
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Václav Chlumský
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
 
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const MessageTray = imports.ui.messageTray;
const Main = imports.ui.main;

let originalUpdateNotificationTimeout = null;
let originalUpdateStatus = null;

let settings;

let newTimeout = 1000;
let ignoreIdle = true;

/**
 * Reads settings
 * 
 * @method readSettings
 */
function readSettings() {
    ignoreIdle = settings.get_boolean("ignore-idle");
    newTimeout = settings.get_int("timeout");
}

/**
 * This function is called once the extension is loaded, not enabled.
 *
 * @method init
 */
function init() {
    settings = ExtensionUtils.getSettings("org.gnome.shell.extensions.notification-timeout");

    settings.connect("changed", () => {
        readSettings();
    });
}

/**
 * This function could be called after the extension is enabled.
 *
 * @method enable
 */
function enable() {

    readSettings();

    /**
     * Change _updateNotificationTimeout()
     */
    originalUpdateNotificationTimeout = MessageTray.MessageTray.prototype._updateNotificationTimeout;
    MessageTray.MessageTray.prototype._updateNotificationTimeoutOrig =  MessageTray.MessageTray.prototype._updateNotificationTimeout;

    MessageTray.MessageTray.prototype._updateNotificationTimeout = function(timeout) {

        if (timeout > 0) {
            timeout = newTimeout;
        }

        /* call the original _updateNotificationTimeout with new timeout */
        this._updateNotificationTimeoutOrig(timeout);
    }

    /**
     * Change _updateState()
     */
    originalUpdateStatus = MessageTray.MessageTray.prototype._updateState;
    MessageTray.MessageTray.prototype._updateStateOrig = MessageTray.MessageTray.prototype._updateState;

    MessageTray.MessageTray.prototype._updateState = function() {

        if (ignoreIdle) {
            this._userActiveWhileNotificationShown = true;
        }

        /* call the original _updateState anyway */
        this._updateStateOrig();
    }
}

/**
 * This function could be called after the extension is uninstalled,
 * disabled GNOME Tweaks, when you log out or when the screen locks.
 *
 * @method disable
 */
function disable() {

    /**
     * Reveret change _updateNotificationTimeout()
     */
    MessageTray.MessageTray.prototype._updateNotificationTimeout = originalUpdateNotificationTimeout;
    delete MessageTray.MessageTray.prototype._updateNotificationTimeoutOrig;

    /**
     * Reveret change _updateState()
     */
    MessageTray.MessageTray.prototype._updateState = originalUpdateStatus;
    delete MessageTray.MessageTray.prototype._updateStateOrig;

}
