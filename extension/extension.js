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
let origUrgency = null;

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

        // CHANGE: Fix idle detection without crashing the loop.
        // Instead of patching _updateState (which runs every second and causes crashes),
        // we simply tell the tray that a user action happened *right now* when the notification appears.
        if (ignoreIdle) {
            this._userActiveWhileNotificationShown = true;
            
            // Updating the timestamp ensures that the next native _updateState check 
            // calculates "idle time" as 0, preventing it from resetting the active flag.
            if (global.get_current_time) {
                this._lastUserActionTime = global.get_current_time();
            }
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
         * Change urgency
         */
        origUrgency = Object.getOwnPropertyDescriptor(MessageTray.Notification.prototype, 'urgency');

        Object.defineProperty(MessageTray.Notification.prototype, 'urgency', {
            get: function() {
                return origUrgency.get.call(this);
            },
            set: function(urgency) {
                if (newTimeout === 0) {
                    origUrgency.set.call(this, MessageTray.Urgency.CRITICAL);
                } else if (alwaysNormal) {
                    origUrgency.set.call(this, MessageTray.Urgency.NORMAL);
                } else {
                    origUrgency.set.call(this, urgency);
                }
            }
        });
    }

    disable() {
        if (this._settings) {
            this._settings.disconnect(this._settingsConnectId);
            this._settings = null;
        }

        /**
         * Revert change _updateNotificationTimeout()
         */
        if (MessageTray.MessageTray.prototype._updateNotificationTimeoutOrig) {
            MessageTray.MessageTray.prototype._updateNotificationTimeout = MessageTray.MessageTray.prototype._updateNotificationTimeoutOrig;
            delete MessageTray.MessageTray.prototype._updateNotificationTimeoutOrig;
        }

        /**
         * Revert change urgency()
         */
        Object.defineProperty(MessageTray.Notification.prototype, 'urgency', origUrgency);
    }
}
