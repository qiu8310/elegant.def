#!/bin/sh

function exit_if_last_not_success() {
  if [[ "$?" != '0' ]] ; then
    [[ -n $1 ]] && echo $1
    exit $?
  fi
}

function get_package_version() {
  echo $(cat package.json | grep -F '"version"' |  awk '{print $2}' | sed 's/"//g' | sed 's/,//g')
}

which git-release > /dev/null
exit_if_last_not_success '\033[31m git-release required, install it in\033[0m \033[34mhttps://github.com/tj/git-extras\033[0m'

if test $# -gt 0; then

  npm test
  exit_if_last_not_success

  git pull
  exit_if_last_not_success

  cur_version=$(get_package_version)
  version=$1
  echo Current package version $cur_version, bump to $version
  sed -i ""  "s/\"version\": *\"${cur_version}\"/\"version\": \"${version}\"/g" package.json
  sed -i ""  "s/\"version\": *\"${cur_version}\"/\"version\": \"${version}\"/g" bower.json
  update_version=$(get_package_version)
  if [[ $update_version != $version ]] ; then
    echo '\033[31m version update failed \033[0m'
    exit 1
  fi
  gulp release \
    && git-changelog -t $1 \
    && git-release $1 \
    && echo 'update gh-pages' \
    && cp browser/* gh-pages && cd gh-pages && git add . -A && git commit -m "Release $1" \
    && git push origin gh-pages && cd .. \
    && echo 'npm publish ... ' \
    && npm publish
else
  echo '\033[31m version number required \033[0m'
  exit 1
fi