/*
mmodel.js
This file should help me build ConvNetJS MagicNet Models.
*/

// I should use predict_o to carry data into predict_oos()
var predict_o = {}

// This function should start model build
function start_modelbuild(){
  d3.select('body div.container').remove()
  d3.select('#divspinner')
    .html('<div id="a_spinner"><h1>Busy... Learning... (Please Wait)</h1><img src="/spinner.gif"></img></div>')
  d3.csv("/csv/GSPC.csv", cb1)
}

// I should create a callback for d3.csv():
function cb1(err, csv_a) {
  if (err) throw err
  // Yahoo gives the data by date descending.
  // I should order it    by date ascending.
  csv_a.reverse()
  // I should get dates for reporting and charting:
  model_o.ydate_a = csv_a.map(function(row){return Date.parse(row['Date'])/1000})
  model_o.ydate_s_a = csv_a.map(function(row){return  row['Date' ]             })
  model_o.cp_a      = csv_a.map(function(row){return +row['Close']             })
  var cp_a          = model_o.cp_a
  // I should define boundries of out-of-sample, train data
  var train_end     = csv_a.length - 253  // 1 yr ago
  var train_size    = model_o.num_yrs * 252
  var train_start   = train_end - train_size
  var pctlead       = pctlead1(cp_a)
  var pctlead_train = pctlead.slice(train_start,train_end)
  // Now that I know pctlead_train, I can calculate train_median
  var train_median = d3.median(pctlead_train)
  // I should capture train_median for the UI:
  model_o.train_median = d3.round(train_median,4)
  var features_o   = cp2ftr(cp_a)
  var labels_a     = cp2label(train_median,cp_a)
  var train_o      = cr_train_o(train_start,train_end,features_o,labels_a)
  // I should collect data for later predictions.
  predict_o.cp_a         = cp_a
  predict_o.train_start  = train_start
  predict_o.train_end    = train_end
  predict_o.train_median = train_median
  // I should use train_o to create and train a new magicNet
  cr_mn(train_o)
}

// This function should create training data from features, labels:
function cr_train_o(train_start,train_end,features_o,labels_a) {
  var train_o = {}
  // I should get inside features_o and slice each feature
  for (ky in features_o) {
    train_o[ky] = features_o[ky].slice(train_start,train_end)
  }
  // To train, I should get label too:
  train_o.label = labels_a.slice(train_start,train_end)
  return train_o
}

// This function should use train_o to create and train a new magicNet.
function cr_mn(train_o) {
  // The MagicNet class performs fully-automatic prediction on your data.
  // options struct:
  var opts = {} 
  /* what portion of data goes to train, 
  in train/validation fold splits. Here, 0.7 means 70% */
  opts.train_ratio = 0.7 
  // number of candidates to evaluate in parallel:
  opts.num_candidates = 3
  // number of folds to evaluate per candidate:
  opts.num_folds = model_o.num_folds
  // number of epochs to make through data per fold
  opts.num_epochs = model_o.num_epochs
  /* how many nets to average in the end for prediction? 
  likely higher = better but slower: */
  opts.ensemble_size = model_o.num_ensembles

  // I should start work on obsv_v which is a volume of observations
  var fnum = -1
  // I need to know obsv_v size before I create it
  for (ky in train_o) {fnum +=1}
  // I know its size now.
  // I should create train_data which eventually should be array of vols I feed to MN:
  var train_data = []
  for(i =0;i<train_o[ky].length;i++){
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

  var magicNet = new convnetjs.MagicNet(train_data, train_o.label, opts)
  var mn_start = Date.now()
  model_o.bgchartid = 'bg'+mn_start // Useful for charting
  // On finish, I should call finishedBatch()
  magicNet.onFinishBatch(finishedBatch)
   
  /* start training MagicNet. 
  Every call trains all candidates in current batch on one example: */
  setInterval(function(){ magicNet.step() },0)
  var json_state = 'need json'
  function finishedBatch() {
    // Now that I am done, I should remove spinner:
    d3.select('#a_spinner').remove()
    if (json_state == 'need json'){
      model_o.mnjson    = magicNet.toJSON()
      json_state        = 'have json'
      model_o.build_duration = d3.round((Date.now()-mn_start)/60.0/1000.0,3)
      predict_o.mymn    = magicNet
      model_o.results_o = predict_oos(predict_o)
      Meteor.call("addMmodel", model_o)
      // window.location   = '/'
      document.location.reload(true);  // Better way?
    }
    'finishedBatch done'
  }
  // This function should predict out-of-sample data
  function predict_oos(predict_o){
    var cp_a         = predict_o.cp_a
    var train_end    = predict_o.train_end
    var train_start  = predict_o.train_start
    var train_median = predict_o.train_median
    // I should ensure train data and out-of-sample data do not mix:
    var oos_start    = train_end +   1
    var oos_end      = cp_a.length
    var oos_size     = oos_end - oos_start
    var features_o   = cp2ftr(cp_a)
    var labels_a     = cp2label(train_median,cp_a)
    // I should get out-of-sample data ready:
    var oos_o         = cr_oos_o(oos_start,oos_end,features_o)
    var predictions_a = mn_predict(predict_o.mymn, oos_o)
    var labels_oos_a  = labels_a.slice(oos_start,oos_end)
    var pctlead_a     = pctlead1(cp_a)
    var pctlead_oos_a = pctlead_a.slice(oos_start,oos_end)
    var results_o     = calc_results(predictions_a,labels_oos_a,pctlead_oos_a)
    results_o.train_start_date = model_o.ydate_s_a[train_start]
    results_o.train_end_date   = model_o.ydate_s_a[train_end]
    results_o.oos_start_date   = model_o.ydate_s_a[oos_start]
    results_o.oos_end_date     = model_o.ydate_s_a[oos_end-1]
    results_o.oos_size         = oos_size
    var pcsv = "date,price,prediction\n"
    for (p=0; p<oos_size;p++){
      var pdate = model_o.ydate_s_a[oos_start+p]
      var cp    = d3.round(cp_a[oos_start+p],2)
      var prd   = predictions_a[p]
      var row   = pdate+','+cp+','+prd+"\n"
      pcsv      = pcsv + row
    }
    results_o.pcsv = pcsv
    return results_o
    'predict_oos done'
  }
}

'end'
