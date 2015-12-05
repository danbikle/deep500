Mmodels = new Mongo.Collection("mmodels");

if (Meteor.isClient) {

  // This code only runs on the client
  Template.body.helpers({

  });

  Template.body.events({
    "click #startbutton": function () {
      // I should hide the button
      d3.select('#a_waiter').remove()
      // I should start building model 
      start_modelbuild()
      'done'
    },
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
// debug
//Meteor.call("addmmodel","hiThere")
// debug
}

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
