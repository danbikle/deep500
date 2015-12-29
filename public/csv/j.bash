
# I need to delete any dups at the top
ln1=`sed -n 1p GSPC2.csv|awk -F, '{print $1}'`
ln2=`sed -n 2p GSPC2.csv|awk -F, '{print $1}'`

if [ $ln1 == $ln2 ]
then
  echo I have dups.
  sed -i 1d GSPC2.csv
  echo Dup should be gone now.
fi
