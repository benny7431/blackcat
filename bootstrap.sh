if [ "$1" == "--ci" ]
then
  set -e
  for file in commands/*.js ; do
    node --check "$file"
  done
  node --check index.js
  node --check util/Util.js
  node --check include/player.js
elif [ "$1" == "--build" ]
then
  set -e
  echo "Installing pm2..."
  yarn global add pm2 --production=true --silent
  echo "Downloading latest ffmpeg static build..."
  curl -L -o ffmpeg.tar.xz https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
  echo "Extracting..."
  tar -xf ffmpeg.tar.xz
  echo "Copying ffmpeg..."
  cp ffmpeg-4.4-amd64-static/ffmpeg ./ffmpeg
  echo "Cleaning up..."
  rm -rf ffmpeg.tar.xz ffmpeg-4.4-amd64-static
  echo "Done!"
elif [ "$1" == "--init" ]
then
  yarn install --forzen-lockfile
elif [ "$1" == "--start" ]
then
  if [ -f "PM2_TOKEN" ]
  then
    source PM2_TOKEN
  fi
  pm2-runtime --secret "$PM2_SECRET" --public "$PM2_PUBLIC" --machine-name "Black cat Server" --deep-monitoring start process.json
fi
