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

import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

let newTimeout = 1000;
let alwaysNormal = true;
let ignoreIdle = true;

export default class NotificationTimeoutExtension extends Extension {

    readSettings() {
        ignoreIdle = this._settings.get_boolean("ignore-idle");
        alwaysNormal = this._settings.get_boolean("always-normal");
        newTimeout = this._settings.get_int("timeout");

    }

    _modifiedUpdateNotificationTimeout(timeout) {
        if (timeout > 0) {
            timeout = newTimeout;
        }

        /* call the original _updateNotificationTimeout with new timeout */
        this._updateNotificationTimeoutOrig(timeout);
    }

    _modifiedUpdateStatus() {
        if (ignoreIdle) {
            this._userActiveWhileNotificationShown = true;
        }

        /* call the original _updateState anyway */
        this._updateStateOrig();
    }

    _modifiedSetUrgency(urgency) {
        /* call the original setUrgency */
        if (newTimeout === 0) {
            this._setUrgencyOrig(MessageTray.Urgency.CRITICAL);
        } else if (alwaysNormal) {
            this._setUrgencyOrig(MessageTray.Urgency.NORMAL);
        } else {
            this._setUrgencyOrig(urgency);
        }
    }

    enable() {
        this._settings = this.getSettings();

        this.readSettings();
        this._settingsConnectId = this._settings.connect(
            "changed",
            () => {
                this.readSettings();
            }
        );
        
        /**
         * Change _updateNotificationTimeout()
         */
        MessageTray.MessageTray.prototype._updateNotificationTimeoutOrig =  MessageTray.MessageTray.prototype._updateNotificationTimeout;
        MessageTray.MessageTray.prototype._updateNotificationTimeout = this._modifiedUpdateNotificationTimeout;

        /**
         * Change _updateState()
         */
        MessageTray.MessageTray.prototype._updateStateOrig = MessageTray.MessageTray.prototype._updateState;
        MessageTray.MessageTray.prototype._updateState = this._modifiedUpdateStatus;

        /**
         * Change setUrgency()
         */
        MessageTray.Notification.prototype._setUrgencyOrig = MessageTray.Notification.prototype.setUrgency;
        MessageTray.Notification.prototype.setUrgency = this._modifiedSetUrgency;
    }

    disable() {
        this._settings.disconnect(this._settingsConnectId);
        this._settings = null;

        /**
         * Reveret change _updateNotificationTimeout()
         */
        MessageTray.MessageTray.prototype._updateNotificationTimeout = MessageTray.MessageTray.prototype._updateNotificationTimeoutOrig;
        delete MessageTray.MessageTray.prototype._updateNotificationTimeoutOrig;

        /**
         * Reveret change _updateState()
         */
        MessageTray.MessageTray.prototype._updateState = MessageTray.MessageTray.prototype._updateStateOrig;
        delete MessageTray.MessageTray.prototype._updateStateOrig;

        /**
         * Reveret change setUrgency()
         */
        MessageTray.Notification.prototype.setUrgency = MessageTray.Notification.prototype._setUrgencyOrig;
        delete MessageTray.Notification.prototype._setUrgencyOrig;
    }
}
