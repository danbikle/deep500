# n13.coffee

# This script should help me run ConvNetjS.
# Demo:
# coffee n13.coffee

# I should know when I start:
mn_start    = Date.now()
# I should use step_i, foldcntr_i to watch progress of magicNet:
step_i      = 0
foldcntr_i  = 0
steptotal_i = 0
# I should use mnopts_o to alter behavior of magicNet and carry num_folds to finishedFold()
mnopts_o = {} 

# The two lines below help me use the MagicNet API.
convnetjs = require("./convnetjs.js")
magicNet  = new convnetjs.MagicNet()
# I should use predict_o to help me report on magicNet accuracy
predict_o = {}  

# I should use this to specify which features I want:
featnames_o     =
  'pctlag1':     true
  'pctlag2':     true
  'pctlag4':     true
  'pctlag8':     true
  'pctlag16':    true
  'cpo4mvgAvg':  true
  'cpo8mvgAvg':  true
  'cpo16mvgAvg': true

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
  features_o = cp2ftr(cp_a,featnames_o)
  labels_a   = pctlead1(cp_a).map `function(x){if(x<train_median_n) return 0; else return 1}`
  train_o    = cr_train_o(train_start,train_end,features_o,labels_a)
  # I should collect data for later predictions.
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

  # what portion of data goes to train, 
  # in train/validation fold splits. Here, 0.7 means 70% 
  mnopts_o.train_ratio = 0.7
  # number of candidates to evaluate in parallel:
  mnopts_o.num_candidates = 4
  # number of folds to evaluate per candidate:
  mnopts_o.num_folds = 2
  # number of epochs to make through data per fold
  mnopts_o.num_epochs = 4
  # How many nets to average in the end for prediction? 
  # likely higher is better but slower:
  mnopts_o.ensemble_size = 2
  # Configure neurons_min, neurons_max
  mnopts_o.neurons_min   = 2
  mnopts_o.neurons_max   = 4
  # hlayers too
  mnopts_o.hlayers       = 2
  # I should start work on obsv_v which is a volume of observations
  fnum = -1
  # I need to know obsv_v size (which is the number of features) before I create it
  for ky_s,val_a of train_o
    fnum +=1
  # I know its size now.
  # I should create train_data which eventually should be array of vols I feed to MN:
  train_data = []
  # I should reuse syntax I wrote for mmodel.js which copies values from a 2D array,
  # into an array of Vol-objects.
  fillv = `function(){
    for(i =0;i<train_o[ky_s].length;i++){
      var widx   = 0
      var obsv_v = new convnetjs.Vol(1,1,fnum)
      // I should match a vol to a feature
      for (ky in train_o) {
        if (ky != 'label') {
          obsv_v.w[widx] = train_o[ky][i]
          widx += 1
        }
      }
      train_data.push(obsv_v)
    }
    return train_data
  }`
  # I should run the above JS syntax:
  fillv()
  # I should create a magicNet; I have all that I need:
  magicNet = new convnetjs.MagicNet(train_data, train_o.label, mnopts_o)
  magicNet.onFinishFold(finishedFold)
  magicNet.onFinishBatch(finishedBatch)
  # This function allows me to count steps as magicNet runs.
  mystep = ()->
    magicNet.step()
    step_i++
    if step_i % 2000 == 0
      clog 'I finished another 1000 steps, be patient.'
      widpct = 5.0
      hrleft = 10.0
      if(foldcntr_i > 0)
        # I should know steptotal now
        widpct   = 100*step_i/steptotal_i
        dnow     = Date.now()
        cdur     = dnow - mn_start
        msectot  = cdur * steptotal_i / step_i
        msecleft = msectot - cdur
        secleft  = msecleft / 1000.0
        minleft  = secleft  / 60.0
        hrleft   = secleft  / 60.0 / 60.0
        doneby_s = new Date(dnow+msecleft).toString()
        # I should report progress:
        clog 'Seconds left: '+secleft
        clog 'Hours left (secleft/3600): '+hrleft
        clog 'Done by: '+doneby_s
  clog 'I am working, be patient.'
  # Start training magicNet. During every step() call, all candidates train on one example.
  setInterval(mystep,0)
  return 'cr_mn() done'

# This function should be called when magicNet finishes a fold.
finishedFold = ()->
  foldcntr_i++
  clog 'I finished a fold'
  if foldcntr_i == 1
    clog 'I took this many steps: '+step_i
    # I should be able to calculate steptotal
    steptotal_i = step_i * mnopts_o.num_folds

# This function should be called when magicNet finishes a batch.
finishedBatch = ()->
  clog 'I finished a batch'
  # I should use json to help remember this model
  mnjson    = magicNet.toJSON()
  results_o = predict_oos(predict_o)
  process.exit(0)

# This function should predict and report on some out-of-sample data.
predict_oos = (predict_o)->
  cp_a         = predict_o.cp_a
  train_end    = predict_o.train_end
  train_start  = predict_o.train_start
  train_median = predict_o.train_median
  # I should ensure train data and out-of-sample data do not mix:
  oos_start  = train_end +   1
  oos_end    = cp_a.length
  oos_size   = oos_end - oos_start
  features_o = cp2ftr(cp_a,featnames_o)
  labels_a   = pctlead1(cp_a).map `function(x){if(x<train_median_n) return 0; else return 1}`

  # I should get out-of-sample data ready:
  oos_o         = cr_oos_o(oos_start,oos_end,features_o)
  predictions_a = mn_predict(predict_o.mymn, oos_o)
  labels_oos_a  = labels_a[oos_start...oos_end]
  pctlead_a     = pctlead1(cp_a)
  pctlead_oos_a = pctlead_a[oos_start...oos_end]
  results_o     = calc_results(predictions_a,labels_oos_a,pctlead_oos_a)
  results_o.train_start_date = ydate_s_a[train_start]
  results_o.train_end_date   = ydate_s_a[train_end]
  results_o.oos_start_date   = ydate_s_a[oos_start]
  results_o.oos_end_date     = ydate_s_a[oos_end-1]
  results_o.oos_size         = oos_size
  pcsv = "date,price,prediction\n"
  `for (p=0; p<oos_size;p++){
    var pdate = ydate_s_a[oos_start+p]
    var cp    = cp_a[oos_start+p]
    var prd   = predictions_a[p]
    var row   = pdate+','+cp+','+prd+"\n"
    pcsv      = pcsv + row
  }`
  results_o.pcsv        = pcsv
  results_o.featnames_o = featnames_o
  return results_o

`
// This function should help display results of predicting oos data:
function calc_results(predictions_a,labels_oos_a,pctlead_oos_a){
  // I should fill confusion matrix.
  var truepos = 0; falsepos = 0; trueneg = 0; falseneg = 0;
  var oos_size = predictions_a.length
  for (i=0;i<oos_size;i++){
    if ((predictions_a[i] == 1 ) && (labels_oos_a[i] == 1))
      truepos += 1;
    if ((predictions_a[i] == 1 ) && (labels_oos_a[i] == 0))
      falsepos += 1;
    if ((predictions_a[i] == -1) && (labels_oos_a[i] == 0))
      trueneg += 1;
    if ((predictions_a[i] == -1) && (labels_oos_a[i] == 1))
      falseneg += 1;
  }
  // should be true:
  chk = ((truepos+trueneg+falsepos+falseneg) == oos_size)
  var pos_accuracy = 100.0 * truepos / (truepos + falsepos)
  var neg_accuracy = 100.0 * trueneg / (trueneg + falseneg)
  var     accuracy = 100.0 * (truepos + trueneg) / oos_size
  // I should study pctlead dependence on predictions_a
  var posg_a = []; negg_a = [];
  for (i=0;i<oos_size;i++){
    if (predictions_a[i] == 1)
      posg_a.push(pctlead_oos_a[i])
    else
      negg_a.push(pctlead_oos_a[i])
  }
  chk = ((posg_a.length + negg_a.length) == oos_size) // should be true
  var pos_avg  = d3.mean(posg_a)
  var neg_avg  = d3.mean(negg_a)
  var results_o          = {}
  results_o.truepos      = truepos
  results_o.falsepos     = falsepos
  results_o.trueneg      = trueneg
  results_o.falseneg     = falseneg
  results_o.pos_accuracy = d3.round(pos_accuracy,1)
  results_o.neg_accuracy = d3.round(neg_accuracy,1)
  results_o.accuracy     = d3.round(accuracy    ,3)
  results_o.pos_avg      = d3.round(pos_avg     ,3)
  results_o.neg_avg      = d3.round(neg_avg     ,3)
  if (pos_avg > neg_avg)
    results_o.opinion    = 'good'
  else
    results_o.opinion    = 'bad';
  // I should start work on chart data
  var ydate_a   = model_o.ydate_a
  var oos_end   = ydate_a.length
  var oos_start = oos_end - oos_size
  var ydate_oos_a  = ydate_a.slice(oos_start,oos_end)
  var cp_oos_a     = model_o.cp_a.slice(oos_start,oos_end)
  // RickShaw should use blue_a later to create chart
  results_o.blue_a = []
  for(dy=0; dy<oos_size; dy++){
    results_o.blue_a.push({x:ydate_oos_a[dy], y:cp_oos_a[dy]})
  }
  // I should calculate green data for blue-green chart
  var green_a = cr_green_a(predictions_a, results_o.blue_a)
  results_o.green_a       = green_a
  results_o.predictions_a = predictions_a
  return results_o
}`

# This function should return array full of predictions:
mn_predict = (mymn, oos_o)->
  # I should start work on obsv_v which is a volume of observations
  fnum     = 0
  oos_size = 0
  # I need to know obsv_v size before I create it.
  # I need to know size of oos data:
  for ky,val of oos_o
    fnum++
    oos_size = val.length
  # I know its size now: fnum
  p01_a    = []
  # Each observation should get a vol:
  `for (i=0;i<oos_size;i++){
    var obsv_v = new convnetjs.Vol(1,1,fnum)
    var widx   = 0
    // I should match each vol to some features
    for (ky in oos_o){
      obsv_v.w[widx] = oos_o[ky][i]
      widx++
    }
    p01_a.push(mymn.predict(obsv_v))
  }`
  # I should transform 0 predictions into -1 for visualizations:
  predictions_a = p01_a.map `function(prd){if (prd==1) return 1; else return -1}`
  return  predictions_a

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
  for ky,val of features_o
    oos_o[ky] = val[oos_start...oos_end]
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

# This function wraps console.log() inside of clog().
clog = (in_x)->
  console.log in_x

# This function should calculate the mean of an array of numbers.
mymean = (in_a)->
  mysum = 0
  in_a.forEach (x)->
    mysum += x
  return mysum / in_a.length

# This function should round to 3 decimal points.
myround = (in_n)-> return (Math.round 1000*in_n)/1000

# end
