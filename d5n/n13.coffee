# n13.coffee

# This script should help me run ConvNetjS.
# Demo:
# coffee n13.coffee

convnetjs = require("./convnetjs.js")

# This function wraps console.log() inside of clog().
clog = (in_x)->
  console.log in_x

# This function should calculate the mean of an array of numbers.
mymean = (in_a)->
  mysum = 0
  in_a.forEach (x)->
    mysum += x
  return mysum / in_a.length

# I should read a csv file into global.myarray
rl = require('readline').createInterface(
  input: require('fs').createReadStream('../public/csv/GSPC.csv'))
global.myarray = []
rl.on 'line', (line)->
  global.myarray.push line
  return
# Upon close of reading the file, I should pass the array to a callback function.
rl.on 'close', ->
  cb1(global.myarray)
  return

# This function should accept an array and transform it into a model.
cb1 = (in_a)->
  # Yahoo data is in wrong order. I should check and reverse if nec.
  if in_a[0].split(',')[0] is 'Date' # This is what I expect.
    csv_s_a = in_a[1..]
  # I should check again
  csv_a_a = csv_s_a.map (row)->row.split(',')
  d1      = csv_a_a[1][0]
  d2      = csv_a_a[2][0]
  if (d1 > d2) # date1 > date2?
    csv_a_a.reverse()
  # I should get both dates and prices out of csv_s_a
  ydate_s_a = csv_a_a.map (row_s)->  row_s[0]
  cp_a      = csv_a_a.map (row_s)-> +row_s[4]

  # I should define boundries of out-of-sample, train data.
  train_end   = cp_a.length - 253  # 1 yr ago
  num_yrs     = 5 # 25
  train_size  = num_yrs * 252
  train_start = train_end - train_size
  # I should work with the data now that I know train_start,end.
  pctlead_a       = pctlead1(cp_a)
  pctlead_train_a = pctlead_a[train_start...train_end]
  # Now that I know pctlead_train, I can calculate train_median.
  train_median_n  = mymedian(pctlead_train_a)
  featnames_o     =
    'pctlag1':     true
    'pctlag2':     true
    'pctlag4':     true
    'pctlag8':     true
    'pctlag16':    true
    'cpo4mvgAvg':  true
    'cpo8mvgAvg':  true
    'cpo16mvgAvg': true
  features_o = cp2ftr(cp_a,featnames_o)


# end cb1()

# This function should convert array into object full of features:
cp2ftr = (cp_a, featnames_o)->
  features_o     = {}
  # I should hardcode in pctlag1 so I have at least 1 feature
  features_o.pctlag1 = pctlagn(1,cp_a)
  if featnames_o.pctlag2
    features_o.pctlag2 = pctlagn(2,cp_a)
  if featnames_o.pctlag4
    features_o.pctlag4 = pctlagn(4,cp_a)
  if featnames_o.pctlag8
    features_o.pctlag8 = pctlagn(8,cp_a)
  if featnames_o.pctlag16
    features_o.pctlag16 = pctlagn(16,cp_a)
  if featnames_o.cpo4mvgAvg
    features_o.cpo4mvgAvg = cpo_mvgmn(cp_a,4)
  if featnames_o.cpo8mvgAvg
    features_o.cpo8mvgAvg = cpo_mvgmn(cp_a,8)
  if featnames_o.cpo16mvgAvg
    features_o.cpo16mvgAvg = cpo_mvgmn(cp_a,16)
  return features_o

# This function should return 'moving-mean' of last n-elements of each element in in_a.
mvgmn = (in_a,n)->
  out_a = []
  `for(j=in_a.length;j>0;j--){
    var slice_start = j-n
    if(slice_start < 0)
       slice_start = 0
    var myslice=in_a.slice(slice_start,j)
    out_a.push(mymean(myslice))
  }`
  return out_a.reverse()

# This function should return cp / 'moving-mean' of last n-elements of each element in in_a.
cpo_mvgmn = (in_a,n)->
  out_a = mvgmn(in_a,n).map((x,j)-> return in_a[j]/x)
  return out_a

# This function should return array which lags my_a by n.
lagn = (n,my_a)->
  # I should get first n members:
  front_a = my_a[0...n]
  # I should remove last n members:
  back_a = my_a[0...my_a.length-n]
  lagn_a = front_a.concat(back_a)
  return lagn_a

# This function should return array full of percentages built from lagn_a:
pctlagn     = (n,in_a)->
  lagn_a    = lagn(n,in_a)
  pctlagn_a = []
  `for (i=0; i<in_a.length;i++)
     pctlagn_a.push(100.0*(in_a[i]-lagn_a[i])/lagn_a[i])`
  return pctlagn_a

# This function should calculate the median of an array of numbers.
mymedian = (in_a)->
  my_a   = in_a.sort()
  mylen  = my_a.length
  if(mylen %2 == 0)
    # If mylen is even I should pick two in the middle and average them
    mymiddle1 = mylen / 2
    mymiddle2 = mymiddle1 - 1
    mymiddle  = (my_a[mymiddle1] + my_a[mymiddle2] )/2
  else
    # If mylen is odd I should pick the elem in the middle.
    mymiddle = my_a[((mylen / 2) - 0.5)]
  return mymiddle

# This function should transform array into array of pctleads.
pctlead1 = (my_a)->
  lead_a    = my_a[1..].concat my_a[-1..]
  pctlead_a = []
  `for (i=0;i<my_a.length;i++)
    pctlead_a.push(100.0*(lead_a[i]-my_a[i])/my_a[i])`
  return pctlead_a

# end
