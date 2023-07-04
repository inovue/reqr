#!/bin/sh
# postCreateCommand.sh

echo "START Install"

sudo chown -R vscode:vscode .


echo -e "First of all, please execute the following command\n
-----------------------------------------------\n
git config --global user.name \"Your Name\"\n
git config --global user.email \"Your Email\"\n
-----------------------------------------------"


echo "FINISH Install"