Mmodels = new Mongo.Collection("mmodels")

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish mmodels that are public or belong to the current user
  Meteor.publish("mmodels", function () {
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
    needcharts: Session.get('needcharts'), // does not work so use d3 remove()
    mmodels: function(){
      return Mmodels.find({}, {sort: {createdAt: -1}})
    },
    mmodelCount: function(){
      return Mmodels.find({}).count()
    }
  })

  Template.body.events({
    "click #chartem": function(event){
      event.preventDefault()
      var bgchartid, blue_a, green_a
      // I should have charts data inside bgcharts_a by now.
      // I should have used a helper to fill bgcharts_a.
      bgcharts_a.forEach(function(chrt){
        // I should get bgchartid from chrt
        for (x_ao in chrt) {
          for (ky in chrt[x_ao])
            bgchartid = ky
            // I should get blue_a, green_a from chrt
            blue_a  = chrt['blue_a_o' ][ky]
            green_a = chrt['green_a_o'][ky]
        }
        if (d3.select('#'+bgchartid+ ' svg path')[0][0] == null){

/*
          new Rickshaw.Graph({
            renderer: 'line'
            ,element: document.getElementById(bgchartid)
            ,series:[{color: 'blue', data: blue_a},{color: 'green', data: green_a}]
          }).render()
*/
          'graphing now'
        }
      })
      'chartem done'
      // This should remove button but fails:
      Session.set('needcharts',false)
      // This should remove button:
      d3.select('#chartem').remove()
    },
    "click #button_newmodel": function(event){
      // Prevent default browser form submit
      event.preventDefault()

      // Get value from form element
      var fields = event.target.form.children
      var model_name    = fields.model_name.value
      var num_days      = fields.num_days.value
      var num_folds     = fields.num_folds.value
      var num_epochs    = fields.num_epochs.value
      var num_ensembles = fields.num_ensembles.value

      model_o = {}
      model_o.model_name    = model_name
      model_o.num_days      = +num_days
      model_o.num_folds     = +num_folds
      model_o.num_epochs    = +num_epochs
      model_o.num_ensembles = +num_ensembles
      start_modelbuild()

      // Clear form
      fields.model_name.value     = ""
      fields.num_days.value       = ""
      fields.num_folds.value      = ""
      fields.num_epochs.value     = ""
      fields.num_ensembles.value  = ""
    }
  })

  Template.mmodel.helpers({
    mnjson:   function(){return 'var mnjson = '+JSON.stringify(this.mnjson)},
    isOwner:  function(){return this.owner === Meteor.userId()             },
    accuracy: function(){return this.results_o.accuracy                    },
    opinion:  function(){return this.results_o.opinion                     },
    true_avg: function(){return this.results_o.true_avg                    },
    false_avg:function(){return this.results_o.false_avg                   },
    pos_accuracy: function(){return this.results_o.pos_accuracy            },
    neg_accuracy: function(){return this.results_o.neg_accuracy            },
    truepos:  function(){return this.results_o.truepos                     },
    falsepos: function(){return this.results_o.falsepos                    },
    trueneg:  function(){return this.results_o.trueneg                     },
    falseneg: function(){return this.results_o.falseneg                    },
    bgchart:  function(){
      // I should collect chart data for D3 here.
      var blue_a_o              = {}
      var green_a_o             = {}
      blue_a_o[this.bgchartid]  = this.results_o.blue_a
      green_a_o[this.bgchartid] = this.results_o.green_a
      bgcharts_a.push({'blue_a_o':blue_a_o,'green_a_o':green_a_o})
      return this.bgchartid
    },
  })

  Template.mmodel.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked)
    },
    "click .delete": function () {
      Meteor.call("deleteMmodel", this._id)
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private)
    }
  })

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  })

}

Meteor.methods({
  getmodels: function (){return Mmodels.find({})},
  addMmodel: function (m_o){
    // Make sure the user is logged in before inserting a mmodel
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized")
    }
    Mmodels.insert({
      model_name:      m_o.model_name
      ,num_days:       m_o.num_days
      ,num_folds:      m_o.num_folds
      ,num_epochs:     m_o.num_epochs
      ,num_ensembles:  m_o.num_ensembles
      ,createdAt:      new Date()
      ,owner:          Meteor.userId()
      ,username:       Meteor.user().username
      ,build_duration: m_o.build_duration
      ,train_median:   m_o.train_median
      ,mnjson:         m_o.mnjson
      ,results_o:      m_o.results_o
      ,bgchartid:      m_o.bgchartid
    })
  },
  deleteMmodel: function (mmodelId) {
    var mmodel = Mmodels.findOne(mmodelId)
    // Only the owner should delete it
    if (mmodel.owner == Meteor.userId()) {
      Mmodels.remove(mmodelId)
    } else {throw new Meteor.Error("not-authorized")}
  },
  setChecked: function (mmodelId, setChecked) {
    var mmodel = Mmodels.findOne(mmodelId)
    if (mmodel.private && mmodel.owner !== Meteor.userId()) {
      // If the mmodel is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized")
    }
    Mmodels.update(mmodelId, { $set: { checked: setChecked} })
  },
  setPrivate: function (mmodelId, setToPrivate) {
    var mmodel = Mmodels.findOne(mmodelId)

    // Make sure only the mmodel owner can make a mmodel private
    if (mmodel.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized")
    }

    Mmodels.update(mmodelId, { $set: { private: setToPrivate } })
  }
})
