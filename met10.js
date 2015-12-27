Mmodels = new Mongo.Collection("mmodels")
var useMymodel; // I should use this var to get one mmodel from mongo for user.

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish mmodels that are public or belong to the current user
  Meteor.publish("mmodels", function(){
    return Mmodels.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    })
  })
}

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("mmodels")

  // I should use bgcharts_a to pull data out of mongo and then feed it to D3 for bgcharts
  bgcharts_a = []
  Session.set('needcharts', true)
  Template.body.helpers({
    mymodelsuffx: function(){
      var dnow = new Date(Date.now())
      var yr   = dnow.getFullYear()
      var mnth = dnow.getMonth()+1
      var dom  = dnow.getDate()
      var hod  = dnow.getHours()
      var moh  = dnow.getMinutes()
      return yr+'_'+mnth+'_'+dom+'_'+hod+'_'+moh
    },
    needcharts: Session.get('needcharts'), // does not work so use d3 remove()
    mmodels: function(){
      if(Session.get('show_mymodels') == true)
        return Mmodels.find({owner: Meteor.userId()}, {sort: {createdAt: -1}})
      else
        return Mmodels.find({}, {sort: {createdAt: -1}})
    },
    mmodelCount: function(){
      if(Session.get('show_mymodels') == true)
        return Mmodels.find({owner: Meteor.userId()}).count()
      else
        return Mmodels.find({}).count()
    }
  })

  Template.body.events({
    "click #show_mymodels": function(event){
    if(event.target.checked == true)
      Session.set('show_mymodels', true)
    else
      Session.set('show_mymodels', false)
    var show_mymodels_state = Session.get('show_mymodels')
    }
    ,"click #chartem": function(event){
      event.preventDefault()
      // I should declare vars to be used by RickShaw:
      var bgchartid, blue_a, green_a
      // I should have charts data inside bgcharts_a by now.
      // I should have used bgchart mmodel.helper() to fill bgcharts_a.
      bgcharts_a.forEach(function(chrt){
        // I should get bgchartid from chrt
        for (ky in chrt['blue_a_o'])
          bgchartid = ky
        // I should get blue_a, green_a from chrt and bgchartid
        blue_a  = chrt['blue_a_o' ][bgchartid]
        green_a = chrt['green_a_o'][bgchartid]
        // I should calculate chartmin
        var chartmin = 0.9 * d3.min(blue_a.concat(green_a).map(function(pt){return pt.y}))
        var chartmax = 1.1 * d3.max(blue_a.concat(green_a).map(function(pt){return pt.y}))
        if (d3.select('#'+bgchartid+ ' svg path')[0][0] == null){
          var bggraph = new Rickshaw.Graph({
            renderer: 'line'
            ,min: chartmin, max: chartmax
            ,element: document.getElementById(bgchartid)
            ,series:[{color: 'blue', data: blue_a},{color: 'green', data: green_a}]
          })
          var xAxis1 = new Rickshaw.Graph.Axis.Time({graph: bggraph})
          var yAxis1 = new Rickshaw.Graph.Axis.Y({graph:    bggraph})
          bggraph.render()
        }
      })
      'chartem done'
      // This should remove button but fails:
      Session.set('needcharts',false)
      // This should remove button:
      d3.select('#chartem').remove()
    }
    ,"click #button_newmodel": function(event){
      // Prevent default browser form submit
      event.preventDefault()
      // Get value from form element
      var fields = event.target.form.children
      var model_name     = fields.model_name.value
      var num_yrs = 25
      if(fields.ny05.checked == true)
        num_yrs = 5
      if(fields.ny10.checked == true)
        num_yrs = 10
      if(fields.ny15.checked == true)
        num_yrs = 15
      if(fields.ny20.checked == true)
        num_yrs = 20
      if(fields.ny25.checked == true)
        num_yrs = 25
      if(fields.ny30.checked == true)
        num_yrs = 30
      if(fields.ny35.checked == true)
        num_yrs = 35
      var num_candidates = 8
      if(fields.nc01.checked == true)
        num_candidates = 1
      if(fields.nc02.checked == true)
        num_candidates = 2
      if(fields.nc04.checked == true)
        num_candidates = 4
      if(fields.nc08.checked == true)
        num_candidates = 8
      if(fields.nc16.checked == true)
        num_candidates = 16
      if(fields.nc32.checked == true)
        num_candidates = 32
      var train_ratio  = 80
      if(fields.tr50.checked == true)
        train_ratio = 50
      if(fields.tr60.checked == true)
        train_ratio = 60
      if(fields.tr70.checked == true)
        train_ratio = 70
      if(fields.tr80.checked == true)
        train_ratio = 80
      if(fields.tr90.checked == true)
        train_ratio = 90
      var num_folds = 8
      if(fields.nf02.checked == true)
        num_folds   = 2
      if(fields.nf04.checked == true)
        num_folds   = 4
      if(fields.nf08.checked == true)
        num_folds   = 8
      if(fields.nf16.checked == true)
        num_folds   = 16
      if(fields.nf32.checked == true)
        num_folds   = 32
      var num_epochs = 32
      if(fields.ne002.checked == true)
        num_epochs   = 2
      if(fields.ne004.checked == true)
        num_epochs   = 4
      if(fields.ne008.checked == true)
        num_epochs   = 8
      if(fields.ne016.checked == true)
        num_epochs   = 16
      if(fields.ne032.checked == true)
        num_epochs   = 32
      if(fields.ne064.checked == true)
        num_epochs   = 64
      if(fields.ne128.checked == true)
        num_epochs   = 128
      if(fields.ne256.checked == true)
        num_epochs   = 256
      var num_ensembles = 4
      if(fields.nn002.checked == true)
        num_ensembles   = 2
      if(fields.nn004.checked == true)
        num_ensembles   = 4
      if(fields.nn008.checked == true)
        num_ensembles   = 8
      if(fields.nn016.checked == true)
        num_ensembles   = 16
      if(fields.nn032.checked == true)
        num_ensembles   = 32
      if(fields.nn064.checked == true)
        num_ensembles   = 64
      if(fields.nn128.checked == true)
        num_ensembles   = 128
      if(fields.nn256.checked == true)
        num_ensembles   = 256
      var neurons_min = 4
      if(fields.mn2.checked == true)
        neurons_min = 2
      if(fields.mn4.checked == true)
        neurons_min = 4
      var neurons_max = 16
      if(fields.mx04.checked == true)
        neurons_max = 4
      if(fields.mx08.checked == true)
        neurons_max = 8
      if(fields.mx16.checked == true)
        neurons_max = 16
      if(fields.mx32.checked == true)
        neurons_max = 32
      var hlayers = 2
      if(fields.hl2.checked == true)
        hlayers = 2
      if(fields.hl3.checked == true)
        hlayers = 3
      if(fields.hl4.checked == true)
        hlayers = 4
      var ltyr = 2014
      if(fields.ltyr2000.checked == true)
        ltyr = 2000
      if(fields.ltyr2001.checked == true)
        ltyr = 2001
      if(fields.ltyr2002.checked == true)
        ltyr = 2002
      if(fields.ltyr2003.checked == true)
        ltyr = 2003
      if(fields.ltyr2004.checked == true)
        ltyr = 2004
      if(fields.ltyr2005.checked == true)
        ltyr = 2005
      if(fields.ltyr2006.checked == true)
        ltyr = 2006
      if(fields.ltyr2007.checked == true)
        ltyr = 2007
      if(fields.ltyr2008.checked == true)
        ltyr = 2008
      if(fields.ltyr2009.checked == true)
        ltyr = 2009
      if(fields.ltyr2010.checked == true)
        ltyr = 2010
      if(fields.ltyr2011.checked == true)
        ltyr = 2011
      if(fields.ltyr2012.checked == true)
        ltyr = 2012
      if(fields.ltyr2013.checked == true)
        ltyr = 2013
      if(fields.ltyr2014.checked == true)
        ltyr = 2014
      // model_o should be global:
      model_o                     = {}
      model_o.featnames_o         = {}
      model_o.featnames_o.pctlag1 = fields.pctlag1.checked
      model_o.featnames_o.pctlag2 = fields.pctlag2.checked
      model_o.featnames_o.pctlag4 = fields.pctlag4.checked
      model_o.featnames_o.pctlag8 = fields.pctlag8.checked
      model_o.model_name     = model_name
      model_o.num_yrs        = +num_yrs
      model_o.num_candidates = +num_candidates
      model_o.train_ratio    = +train_ratio
      model_o.num_folds      = +num_folds
      model_o.num_epochs     = +num_epochs
      model_o.num_ensembles  = +num_ensembles
      model_o.neurons_min    = +neurons_min
      model_o.neurons_max    = +neurons_max
      model_o.hlayers        = +hlayers
      model_o.ltyr           = ltyr
      // Clear form
      fields.model_name.value     = ""
      // I should use model_o to build a model
      start_modelbuild()
    }
  })

  Template.mmodel.helpers({
    mnjson:   function(){return 'var mnjson = '+JSON.stringify(this.mnjson)}
    ,isOwner:  function(){return this.owner === Meteor.userId()            }
    ,accuracy: function(){return this.results_o.accuracy                   }
    ,pos_avg:  function(){return this.results_o.pos_avg                    }
    ,neg_avg:  function(){return this.results_o.neg_avg                    }
    ,pos_accuracy: function(){return this.results_o.pos_accuracy           }
    ,neg_accuracy: function(){return this.results_o.neg_accuracy           }
    ,truepos:  function(){return this.results_o.truepos                    }
    ,falsepos: function(){return this.results_o.falsepos                   }
    ,trueneg:  function(){return this.results_o.trueneg                    }
    ,falseneg: function(){return this.results_o.falseneg                   }
    ,train_start_date: function(){return this.results_o.train_start_date   }
    ,train_end_date:   function(){return this.results_o.train_end_date     }
    ,oos_start_date:   function(){return this.results_o.oos_start_date     }
    ,oos_end_date:     function(){return this.results_o.oos_end_date       }
    ,oos_size:         function(){return this.results_o.oos_size           }
    ,pcsv:             function(){return this.results_o.pcsv               }
    ,build_date:function(){return new Date(this.build_date).toString().slice(0,24)}
    ,featnames: function(){
      var trf_o = this.results_o.featnames_o
      var featnames_a = []
      for (ky in trf_o){
        if(trf_o[ky] == true)
          featnames_a.push(ky)
      }
      return featnames_a.toString()
    }
    ,bgchart:          function(){
      // I should collect chart data for D3 here.
      var blue_a_o              = {}
      var green_a_o             = {}
      blue_a_o[this.bgchartid]  = this.results_o.blue_a
      green_a_o[this.bgchartid] = this.results_o.green_a
      bgcharts_a.push({'blue_a_o':blue_a_o,'green_a_o':green_a_o})
      return this.bgchartid
    } // bgchart
    ,opinion: function(){
      if(this.results_o.opinion == 'good')
        return 'Model is Good Because Pos Avg > Neg Avg'
      else
        return 'Model is Bad  Because Neg Avg > Pos Avg'
    } // opinion
  }) //Template.mmodel.helpers

  Template.mmodel.events({
    "click .use_thismodel": function(event){
      // Prevent default browser form submit
      event.preventDefault()
      Meteor.call("useThisModel", this._id) // This should fill useMymodel
      usethis_o.useMymodel = useMymodel
      var mymnjson         = useMymodel.mnjson
      // I should get the radio buttons near the click.
      var fields = event.target.form.children
      var usryr = 2015 // I like 2015
      // Maybe user likes different year:
      for(cn=0; cn<fields.length;cn++){
        if(fields[cn].checked)
          usryr = +fields[cn].value
      }
      predictyr(mymnjson,usryr)
    }
    ,"click .toggle-checked": function(){
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked)
    }
    ,"click .delete": function(){
      Meteor.call("deleteMmodel", this._id)
    }
    ,"click .toggle-private": function(){
      Meteor.call("setPrivate", this._id, ! this.private)
    }
  })
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  })
}

Meteor.methods({
  addMmodel: function (m_o){
    // Make sure the user is logged in before inserting a mmodel
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized")
    }
    Mmodels.insert({
      model_name:      m_o.model_name
      ,num_yrs:        m_o.num_yrs
      ,num_candidates: m_o.num_candidates
      ,train_ratio:    m_o.train_ratio
      ,num_folds:      m_o.num_folds
      ,num_epochs:     m_o.num_epochs
      ,num_ensembles:  m_o.num_ensembles
      ,neurons_min:    m_o.neurons_min
      ,neurons_max:    m_o.neurons_max
      ,hlayers:        m_o.hlayers
      ,ltyr:           m_o.ltyr
      ,createdAt:      new Date()
      ,owner:          Meteor.userId()
      ,username:       Meteor.user().username
      ,build_duration: m_o.build_duration
      ,train_median:   m_o.train_median
      ,mnjson:         m_o.mnjson
      ,results_o:      m_o.results_o
      ,bgchartid:      m_o.bgchartid
      ,build_date:     m_o.build_date
    })
  }
  ,deleteMmodel: function (mmodelId) {
    var mmodel = Mmodels.findOne(mmodelId)
    // Only the owner should delete it
    if (mmodel.owner == Meteor.userId()) {
      Mmodels.remove(mmodelId)
    } else {throw new Meteor.Error("not-authorized")}
  }
  ,setChecked: function (mmodelId, setChecked) {
    var mmodel = Mmodels.findOne(mmodelId)
    if (mmodel.private && mmodel.owner !== Meteor.userId()) {
      // If the mmodel is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized")
    }
    Mmodels.update(mmodelId, { $set: { checked: setChecked} })
  }
  ,setPrivate: function (mmodelId, setToPrivate) {
    var mmodel = Mmodels.findOne(mmodelId)

    // Make sure only the mmodel owner can make a mmodel private
    if (mmodel.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized")
    }
    Mmodels.update(mmodelId, { $set: { private: setToPrivate } })
  }
  ,useThisModel: function (mmodelId){
    useMymodel = Mmodels.findOne(mmodelId)
  }
})
