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
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter mmodels
        return Mmodels.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the mmodels
        return Mmodels.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Mmodels.find({checked: {$ne: true}}).count();
    }
  });

  Template.body.events({
    "submit .new-mmodel": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;

      // Insert a mmodel into the collection
      Meteor.call("addMmodel", text);

      // Clear form
      event.target.text.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
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
  addMmodel: function (text) {
    // Make sure the user is logged in before inserting a mmodel
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Mmodels.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
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
