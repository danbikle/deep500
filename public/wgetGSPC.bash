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
echo 'cdate,cp'                                > ${TKR}3.csv
cat ${TKR}recent.csv ${TKR}2.csv|grep -v Date >> ${TKR}3.csv
cat ${TKR}3.csv                                > ${TKR}2.csv 

echo 'var d5_recent_prices_s = "' > d5rp.js
head GSPC2.csv                   >> d5rp.js
echo '"'                         >> d5rp.js
cat                                 d5rp.js
set -x
edate=`date '+%s'`
cd $D5
rm -f d5rp*.js
mv csv/d5rp.js d5rp$edate.js
# I should use sed or other tool to edit ../met10.html so it links to d5rp$edate.js
exit
