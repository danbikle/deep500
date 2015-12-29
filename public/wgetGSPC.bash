#!/bin/bash

# ~/d5/public/wgetGSPC.bash

# This script should get prices at 12:50 Calif time.
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
# I should extract recent prices from html
python ${D5}/csv/extprice.py
# I should cat prices together
cat ${TKR}recent.csv ${TKR}2.csv|grep -v Date > ${TKR}3.csv
cat ${TKR}3.csv                               > ${TKR}2.csv 

echo 'var d5_recent_prices_s = ['   > d5rp.js
head GSPC2.csv|awk -F, "{print $1 $2}"|\
  sed '1,$s/^/["/'|sed '1,$s/,/",/'|sed '1,$s/$/],/' >> d5rp.js
echo ']'                           >> d5rp.js
cat                                   d5rp.js
set -x
edate=`date '+%s'`
cd $D5
rm -f d5rp*.js
mv csv/d5rp.js d5rp${edate}.js
sed -i "/d5rp/s/d5rp[0-9]*.js/d5rp${edate}.js/" ../met10.html
# Now, the browser should not have a cached copy of d5rp${edate}.js
exit
