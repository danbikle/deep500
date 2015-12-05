Tasks = new Mongo.Collection("tasks");

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

Meteor.methods({

});
