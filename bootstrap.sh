if [ "$1" == "test" ]
then
  for file in commands/*.js ; do 
    node --check "$file"
    if [ "$?" != "0" ]
    then
      echo "Check failed on $file"
      exit 1
    fi
    node --check index.js
    node --check util/Util.js
    node --check include/play.js
  done
else
  pm2-runtime --secret $PM2_SECRET --public $PM2_PUBLIC --machine-name "Black cat Server" --deep-monitoring start /home/process.json
fi
