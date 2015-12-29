/* deep500.js

This file should help me deal with data into/out-of ConvNetJS.
*/

// I should use global var to copy data inside d3.csv() callback:
usethis_o = {}

// debug

// This function should create a magicNet from JSON and then predict last 100 observations.
// This function is called by met10.js function: // "click .last100button"
function predict100(mymnjson){
  mymnjson
  usethis_o.magicNet = new convnetjs.MagicNet()
  usethis_o.magicNet.fromJSON(mymnjson)
  d5_recent_prices_a
  var cp_a = []
  d5_recent_prices_a.forEach(function(row){
    cp_a.push(row[1]
  )
  cp_a
  // I should convert cp_a into features.
  var features_o          = cp2ftr(cp_a,usethis_o.useMymodel.results_o.featnames_o)
  usethis_o.mypredictions = mn_predict( usethis_o.magicNet,features_o)
  var seeum = usethis_o.mypredictions
  seeum
  'done here'

}

// debug

// This function should create a magicNet from JSON and then predict a year of observations.
// This function is called by met10.js function: // "click .use_thismodel"
function predictyr(mymnjson,yr){
  usethis_o.useyr    = yr
  usethis_o.magicNet = new convnetjs.MagicNet()
  usethis_o.magicNet.fromJSON(mymnjson)
  // I should use d3.csv() here and place a call to yr2predictions(yr) inside cb2.
  d3.csv("/csv/GSPC.csv", cb2)
}
// I should create a callback for d3.csv()
// which shows predictions from a model for a specific year.
function cb2(err, csv_a){
  if (err) throw err
  yr2predictions(csv_a)
  // I should display the predictions
  var d3data = usethis_o.mypredictions
  // I should create and fill blue_a
  var blue_a = yr2blue(csv_a)
  // I should calculate green data for blue-green chart
  var green_a = cr_green_a(usethis_o.mypredictions, blue_a)
  // I should pass blue_a green_a to Rickshaw.
  // I should find min,max for Rickshaw.
  var chartmin = 0.9 * d3.min(blue_a.concat(green_a).map(function(pt){return pt.y}))
  var chartmax = 1.1 * d3.max(blue_a.concat(green_a).map(function(pt){return pt.y}))
  // I should use Date.now() to create a div-id for Rickshaw
  var mydn = Date.now()
  var utd4rg1 = d3.select('#usethis_'+usethis_o.useMymodel.bgchartid)
  var utd4rg2 = utd4rg1.append('div').attr('id','utrg'+mydn)
  utd4rg1.append('hr')
  var cb2graph = new Rickshaw.Graph({
    renderer: 'line'
    ,min: chartmin, max: chartmax
    ,element: document.getElementById('utrg'+mydn)
    ,series:[{color: 'blue', data: blue_a},{color: 'green', data: green_a}]
  })
  var xAxis1 = new Rickshaw.Graph.Axis.Time({graph: cb2graph})
  var yAxis1 = new Rickshaw.Graph.Axis.Y({graph:    cb2graph})
  cb2graph.render()
  // I should add a title which shows the year
  myrg   = d3.select('#utrg'+mydn)
  mysvg  = myrg.select('svg')
  mytext = mysvg.append('text')
    .attr('x','60')
    .attr('y','20')
    .attr('fill','black')
    .text(usethis_o.useyr)
} // function cb2(err, csv_a)

// This function should return an array of objects suitable for Rickshaw.
function yr2blue(csv_a){
  var myblue_a = []
  // Here, csv_a should be in date ascending order
  csv_a.forEach(function(row){
    if (+row['Date'].slice(0,4) == usethis_o.useyr)
      myblue_a.push({x:Date.parse(row['Date'])/1000, y:(+row['Close'])})
  })
  return myblue_a
}
// This function should create an array of predictions from a year.
function yr2predictions(csv_a){
  // Yahoo gives the data by date descending.
  // I should order it    by date ascending.
  csv_a.reverse()
  var cp_a = []
  csv_a.forEach(function(row){
    if (+row['Date'].slice(0,4) == usethis_o.useyr)
      cp_a.push(+row['Close'])
  })
  // I should convert cp_a into features.
  var features_o          = cp2ftr(cp_a,usethis_o.useMymodel.results_o.featnames_o)
  usethis_o.mypredictions = mn_predict( usethis_o.magicNet,features_o)
}
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
