#!/usr/bin/env bash

read -p "Are you sure you want to publish (Y/N) $1? " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Publishing $1..."

    gulp build
    npm test
    git add . && git commit -a -m "Build dist"
#    npm version minor
    #update bower.json and package.json versions
    #add tag
    #commit and push

#    npm publish ./
fi