#!/bin/sh
set -e

TARGET_FSINOTIFYMAXUSERWATCHES=524288

cat <<-ENDF
[INFO]
This script is going to increment/modify your current system property of inotify watchers. This is neccessary to do, for example,
when the live-reload function of Webpack don't work.
For more information about:
- https://stackoverflow.com/a/33537743/3406552
- https://github.com/guard/listen/wiki/Increasing-the-amount-of-inotify-watchers
[INFO]
ENDF

echo "First, please give me superuser root powers!"
sudo echo "Done."
echo  "You currently have `sudo sysctl fs.inotify.max_user_watches` amount set to 'fs.inotify.mas_user_watches'... Want to modify to $TARGET_FSINOTIFYMAXUSERWATCHES amount? [Y/n]"
read answer

if [ "$answer" == "Y" ] || [ "$answer" == "y"  ]; then
    echo "Proceeding to temporary update the limit of 'fs.inotify.max_user_watches' amount to $TARGET_FSINOTIFYMAXUSERWATCHES."
    sudo sysctl fs.inotify.max_user_watches=524288
    echo "Reloading System properties..."
    sudo sysctl -p --system
else
    echo "Canceling operation. Exiting..."
fi
