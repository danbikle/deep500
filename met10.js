
if (Meteor.isClient) {
  // This code only runs on the client

  // I should tell the UI that convnet is stopped.
  Session.set("stopped",  true);

  Template.mmodel.helpers({
//    mmodel: function(){return 'mmodel sposed 2be here'}
    mmodel: function(){return this} // I use 'this' to get elts
  });

  Template.body.helpers({
    stopped: function(){return Session.get("stopped" )},
    mmodels: function(){return ['hello','world']},
  });

  Template.body.events({
    "click #startbutton": function () {
      Session.set("stopped", false) // building now.
      start_modelbuild()
    },
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

} // if (Meteor.isClient)

// This code runs both on client and server
Mmodels = new Mongo.Collection("mmodels");
Meteor.methods({
  addmmodel: function(mopts,mm){
    // Demo: Meteor.call("addmmodel",{m1: 'yay'},"hiThere")
    Mmodels.insert({
      mopts:     mopts,
      mmodel:    mm,
      createdAt: new Date(),
      owner:     Meteor.userId(),
      username:  Meteor.user().username
    })
  }
});
