Tasks = new Mongo.Collection("tasks");
Mmodels = new Mongo.Collection("mmodels");

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish mmodels that are public or belong to the current user
  Meteor.publish("mmodels", function () {
    return Mmodels.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });
}

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("mmodels");

  Template.body.helpers({
    mmodels: function () {
      return Mmodels.find({}, {sort: {createdAt: -1}});
    },
    mmodelCount: function () {
      return Mmodels.find({}).count();
    }
  });

  Template.body.events({
    "submit .new-mmodel": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var model_name = event.target.model_name.value;
      var num_folds  = event.target.num_folds.value;

      // Insert a mmodel into the collection
      Meteor.call("addMmodel", model_name,num_folds);

      // Clear form
      event.target.model_name.value = "";
    }
  });

  Template.mmodel.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  Template.mmodel.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteMmodel", this._id);
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addMmodel: function (model_name,num_folds) {
    // Make sure the user is logged in before inserting a mmodel
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Mmodels.insert({
      model_name: model_name,
      num_folds:  num_folds,
      createdAt:  new Date(),
      owner:      Meteor.userId(),
      username:   Meteor.user().username
    });
  },
  deleteMmodel: function (mmodelId) {
    var mmodel = Mmodels.findOne(mmodelId);
    if (mmodel.private && mmodel.owner !== Meteor.userId()) {
      // If the mmodel is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }

    Mmodels.remove(mmodelId);
  },
  setChecked: function (mmodelId, setChecked) {
    var mmodel = Mmodels.findOne(mmodelId);
    if (mmodel.private && mmodel.owner !== Meteor.userId()) {
      // If the mmodel is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }

    Mmodels.update(mmodelId, { $set: { checked: setChecked} });
  },
  setPrivate: function (mmodelId, setToPrivate) {
    var mmodel = Mmodels.findOne(mmodelId);

    // Make sure only the mmodel owner can make a mmodel private
    if (mmodel.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Mmodels.update(mmodelId, { $set: { private: setToPrivate } });
  }
});
