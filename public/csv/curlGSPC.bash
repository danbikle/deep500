#!/bin/bash

# public/csv/curlGSPC.bash

# This script should get CSV data for S&P500.
curl ichart.finance.yahoo.com/table.csv?s=%5EGSPC > GSPC.csv
exit
