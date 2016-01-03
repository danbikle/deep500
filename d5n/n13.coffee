# n13.coffee

# This script should help me run ConvNetjS.
# Demo:
# coffee n13.coffee



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
  labels_a   = pctlead1(cp_a).map `function(x){if(x<train_median_n) return 0; else return 1}`
  train_o    = cr_train_o(train_start,train_end,features_o,labels_a)
  # I should collect data for later predictions.
  predict_o              = {}  
  predict_o.cp_a         = cp_a
  predict_o.train_start  = train_start
  predict_o.train_end    = train_end
  predict_o.train_median = train_median_n
  # I should use train_o to create and train a new magicNet.
  cr_mn(train_o)

# end cb1()

# This function should use train_o to create and train a new magicNet.
cr_mn = (train_o)->
  # The MagicNet class performs fully-automatic prediction on your data.
  # options struct:
  opts = {} 
  # what portion of data goes to train, 
  # in train/validation fold splits. Here, 0.7 means 70% 
  opts.train_ratio = 0.7
  # number of candidates to evaluate in parallel:
  opts.num_candidates = 8
  # number of folds to evaluate per candidate:
  opts.num_folds = 8
  # number of epochs to make through data per fold
  opts.num_epochs = 16
  # How many nets to average in the end for prediction? 
  # likely higher = better but slower:
  opts.ensemble_size = 4
  # Configure neurons_min, neurons_max
  opts.neurons_min   = 4
  opts.neurons_max   = 16
  # hlayers too
  opts.hlayers       = 4
  # I should start work on obsv_v which is a volume of observations
  fnum = -1
  # I need to know obsv_v size (which is the number of features) before I create it
  for ky_s,val_a in train_o
    fnum +=1
  # I know its size now.
  # I should create train_data which eventually should be array of vols I feed to MN:
  train_data = []
  convnetjs = require("./convnetjs.js")
  `for(i =0;i<train_o[ky].length;i++){
    var widx   = 0
    var obsv_v = new convnetjs.Vol(1,1,fnum)
    # I should match a vol to a feature
    for (ky in train_o) {
      if (ky != 'label') {
        obsv_v.w[widx] = train_o[ky][i]
        widx += 1
      }
    }
    train_data.push(obsv_v)
  }`

  #magicNet = new convnetjs.MagicNet(train_data, train_o.label, opts)
  #mn_start = Date.now()

  # On finish of fold I should update the UI to show progress
  #debug  magicNet.onFinishFold(finishedFold)
  # On finish, I should call finishedBatch()
  #debug  magicNet.onFinishBatch(finishedBatch)
  # Start training MagicNet. 
  # Every call trains all candidates in current batch on one example:

  return 'done'

# This function should create training data from features, labels:
cr_train_o = (train_start,train_end,features_o,labels_a)->
  train_o = {}
  for ky_s,val_a of features_o
    train_o[ky_s] = val_a[train_start...train_end]
  # To train, I should get label too:
  train_o.label = labels_a[train_start...train_end]
  return train_o

# This function should return a subset of data from features_o:
cr_oos_o = (oos_start,oos_end,features_o)->
  oos_o = {}
  `for (ky in features_o){
    oos_o[ky] = features_o[ky].slice(oos_start,oos_end)
  }`
  return oos_o

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
