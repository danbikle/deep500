/* deep500.js

This file should help me deal with data into/out-of ConvNetJS.
*/


// debug
// This function should create a magicNet from JSON and then predict a year of observations.
// This function is called by met10.js:
// "click .use_thismodel":
function predictyr(myjson,yr){
var magicNet  = new convnetjs.MagicNet()
yr            = 2015
predictions_a = []
magicNet.fromJSON(myjson)

// I should use d3.csv() here and place a call to yr2vols(yr) inside cb2.
d3.csv("/csv/GSPC.csv", cb2())

// This might be in the wrong place but have it here for now:
return predictions_a
}

// I should create a callback for d3.csv():
function cb2(err, csv_a){
  if (err) throw err
  // here I should call yr2vols() now that I have access to csv_a
  csv_a
  myvols = yr2vols(yr,csv_a)
}

// This function should create an array of vols from a year.
function yr2vols(yr, csv_a){
// How to get access to csv_a?
// I should use d3.csv()?
csv_a
yr
myvols = []
return myvols
}
// debug

// This function should create green_a from predictions_a and blue_a.
function cr_green_a(predictions_a, blue_a){
  var pl  = predictions_a.length
  var chk = (pl == blue_a.length) // should be true

  // I should start with an initial value for green_a
  var green_a = []
  green_a[0]  = blue_a[0]
  // I should use blue_a and predictions_a to calculate green_a
  for(p=0; p<(pl-1); p++){
    // I should get the date:
    var g_o = {}
    g_o.x   = blue_a[p].x
    // I should get the new price
    g_o.y   = green_a[p].y + (blue_a[p+1].y-blue_a[p].y)*predictions_a[p]
    green_a[p+1] = g_o
  }
  // I dont know blue_a[pl] yet, so I should show very last prediction result as flat
  green_a[pl-1].x =  blue_a[pl-1].x
  green_a[pl-1].y = green_a[pl-2].y
  return green_a
}
// This function should return array which lags my_a by n.
function lagn(n,my_a) {
  // I should get first n members:
  var front_a = my_a.slice(0,n)
  // I should remove last n members:
  var back_a = my_a.slice(0,my_a.length-n) 
  var lagn_a = front_a.concat(back_a)
  return lagn_a
}
// This function should return array full of percentages built from lagn_a:
function pctlagn(n,my_a) {
  var pctlagn_a = []
  var lagn_a    = lagn(n,my_a)
  for (i=0; i<my_a.length;i++) {
    pctlagn_a.push(100.0*(my_a[i]-lagn_a[i])/lagn_a[i])
  }
  return pctlagn_a
}
// This function should return array which leads my_a by 1:
function lead1(my_a){
  return my_a.slice(1).concat(my_a[my_a.length-1])
}
// This function should transform array into array of pctleads:
function pctlead1(my_a){
  var pctlead_a = []
  var lead_a    = lead1(my_a)
  for (i=0; i<my_a.length;i++){
    pctlead_a.push(100.0*(lead_a[i]-my_a[i])/my_a[i])
  }
  return pctlead_a
}
// This function should convert array into object full of features:
function cp2ftr(cp_a, featnames_o){
  var features_o     = {}
  // I should hardcode in pctlag1 so I have at least 1 feature
  features_o.pctlag1 = pctlagn(1,cp_a)
  if (featnames_o.pctlag2)
    features_o.pctlag2 = pctlagn(2,cp_a)
  if (featnames_o.pctlag4)
    features_o.pctlag4 = pctlagn(4,cp_a)
  if (featnames_o.pctlag8)
    features_o.pctlag8 = pctlagn(8,cp_a)
  return features_o
}
// This function should convert array into array of labels:
function cp2label(bndry,cp_a){
  var pctlead  = pctlead1(cp_a)
  var labels_a = pctlead.map(function(x){if (x<bndry) return 0; else return 1})
  return labels_a
}
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
}
// This function should help me display results_o
// NOT USED YET
function vwr(results_o){
  var cell00 = 'Opinion:';              cell01 = results_o.opinion
  var cell10 = 'True Positive Count:';  cell11 = results_o.truepos
  var cell20 = 'True Negative Count:';  cell21 = results_o.trueneg
  var cell30 = 'False Positive Count:'; cell31 = results_o.falsepos
  var cell40 = 'False Negative Count:'; cell41 = results_o.falseneg
  var cell50 = 'Positive Accuracy:';    cell51 = results_o.pos_accuracy
  var cell60 = 'Negative Accuracy:';    cell61 = results_o.neg_accuracy
  var cell70 = 'Accuracy:';             cell71 = results_o.accuracy
  var cell80 = 'Avg Gain of Positive Predictions:'; cell81 = results_o.pos_avg
  var cell90 = 'Avg Gain of Negative Predictions:'; cell91 = results_o.neg_avg
  var tr  = '<tr>'
  var td  = '<td>'
  var tdc = '</td>'
  var trc = '</tr>'
  var row0   = tr+td+cell00+tdc+td+cell01+tdc+trc
  var row1   = tr+td+cell10+tdc+td+cell11+tdc+trc
  var row2   = tr+td+cell20+tdc+td+cell21+tdc+trc
  var row3   = tr+td+cell30+tdc+td+cell31+tdc+trc
  var row4   = tr+td+cell40+tdc+td+cell41+tdc+trc
  var row5   = tr+td+cell50+tdc+td+cell51+tdc+trc
  var row6   = tr+td+cell60+tdc+td+cell61+tdc+trc
  var row7   = tr+td+cell70+tdc+td+cell71+tdc+trc
  var row8   = tr+td+cell80+tdc+td+cell81+tdc+trc
  var row9   = tr+td+cell90+tdc+td+cell91+tdc+trc
  var rows   = row0+row1+row2+row3+row4+row5+row6+row7+row8+row9
  d3.select('#myresults .results_o').html(rows)
}
// This function should return array full of predictions:
function mn_predict(mymn, oos_o){
  // I should start work on obsv_v which is a volume of observations
  var fnum = 0; oos_size = 0
  // I need to know obsv_v size before I create it.
  // I need to know size of oos data:
  for (ky in oos_o){fnum +=1; oos_size = oos_o[ky].length}
  // I know its size now: fnum
  var p01_a    = []
  // Each observation should get a vol:
  for (i=0;i<oos_size;i++){
    var obsv_v = new convnetjs.Vol(1,1,fnum)
    var widx   = 0
    // I should match each vol to some features
    for (ky in oos_o){
      obsv_v.w[widx] = oos_o[ky][i]
      widx += 1
    }
    p01_a.push(mymn.predict(obsv_v))
  }
  // I should transform 0 predictions into -1 for visualizations:
  var predictions_a = p01_a.map(function(prd){if (prd==1) return 1; else return -1})
  return  predictions_a
}
// This function should return a subset of data from features_o:
function cr_oos_o(oos_start,oos_end,features_o){
  oos_o = {}
  for (ky in features_o){
    oos_o[ky] = features_o[ky].slice(oos_start,oos_end)
  }
  return oos_o
}
