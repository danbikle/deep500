#!/bin/bash

# ~/d5/public/wgetGSPC.bash
# This script depends on Anaconda Python which I get here:
# https://www.continuum.io/downloads

# This script should get prices at 12:50 Calif time.
# See crontab demo here:  crontab.txt

. ${HOME}/d5/public/d5env.bash

# cd ${HOME}/d5/public
mkdir -p ${D5}/csv
cd       ${D5}/csv

TKRH='%5EGSPC'
TKR='GSPC'
rm -f ${TKR}.csv ${TKR}.html

wget --output-document=${TKR}.csv http://ichart.finance.yahoo.com/table.csv?s=${TKRH}
cat ${TKR}.csv | awk -F, '{print $1 "," $5}' > ${TKR}2.csv
wget --output-document=${TKR}.html http://finance.yahoo.com/q?s=$TKRH
# I should extract recent prices from html using Anaconda Python:
python ${D5}/csv/extprice.py
# I should cat prices together
cat ${TKR}recent.csv ${TKR}2.csv|grep -v Date > ${TKR}3.csv
cat ${TKR}3.csv                               > ${TKR}2.csv 

# I need to delete any dups at the top
ln1=`sed -n 1p GSPC2.csv|awk -F, '{print $1}'`
ln2=`sed -n 2p GSPC2.csv|awk -F, '{print $1}'`

if [ $ln1 == $ln2 ]
then
  echo I have dups.
  sed -i 1d GSPC2.csv
  echo Dup should be gone now.
fi

echo 'var d5_recent_prices_a = ['                     > d5rp.js
head -101 GSPC2.csv|awk -F, "{print $1 $2}"|\
  sed '1,$s/^/["/'|sed '1,$s/,/",/'|sed '1,$s/$/],/' >> d5rp.js
echo ']'                           >> d5rp.js
cat                                   d5rp.js
set -x
edate=`date '+%s'`
cd $D5
rm -f d5rp*.js
# I should bust through the browser cache with a new js file:
mv csv/d5rp.js d5rp${edate}.js
sed -i "/d5rp/s/d5rp[0-9]*.js/d5rp${edate}.js/" ../met10.html
# Now, the browser should have a clean copy of d5rp${edate}.js which has most recent price.
exit
