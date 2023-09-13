# notification-timeout

## Gnome Shell extension
notification-timeout is a Gnome Shell extension that allows configuring the same timeout for all notifications. It also allows ignoring the idle state, which means all the notification can timeout even if the system is idle.

## Supported Gnome Shell version
This extension supports Gnome Shell verison 45 and above.

## Installation from e.g.o
https://extensions.gnome.org/extension/3795/notification-timeout/

## Manual installation

 1. `git clone https://github.com/vchlum/notification-timeout.git`
 1. `cd notification-timeout`
 1. `make build`
 1. `make install`
 1. Log out & Log in
 1. `gnome-extensions enable notification-timeout@chlumskyvaclav.gmail.com`

## Install dependencies
  - These are only required to install from source
  - `make`
  - `gnome-shell` (`gnome-extensions` command)
