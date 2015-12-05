Mmodels = new Mongo.Collection("mmodels");

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({

  });

  Template.body.events({

  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

// This code runs both on client and server
Meteor.methods({
  addmmodel: function(mm){
    // Demo: Meteor.call('addmmodel','hiThere')
    Mmodels.insert({createdAt: new Date(), hello: 'world'});
  }
});
