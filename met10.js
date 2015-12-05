Mmodels = new Mongo.Collection("mmodels");

if (Meteor.isClient) {
  // This code only runs on the client

  Session.set("stopped",  true);

  Template.body.helpers({
    stopped: function(){return Session.get("stopped" )}
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
Meteor.methods({
  addmmodel: function(mm){
    // Demo: Meteor.call("addmmodel","hiThere")
    Mmodels.insert({
      mmodel:    mm,
      createdAt: new Date(),
      owner:     Meteor.userId(),
      username:  Meteor.user().username
    });
  }
});
