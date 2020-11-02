#!/bin/bash

glib-compile-schemas schemas/
zip -r notification-timeout@chlumskyvaclav.gmail.com.zip . --exclude=po/\* --exclude=.git/\* --exclude=*.sh --exclude=*.zip

