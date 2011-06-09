(function() {

  function message(subject, id, references) {
    return function(subject, id, references) {
      return {
        subject: subject,
        id: id,
        references: references
      }
    }(subject, id, references);
  }

  function messageContainer(message) {
    return function(message) {
      var children = [];
    
      function addChild(child) {
        if(child.parent) child.parent.removeChild(child);
        this.children.push(child);
        child.parent = this;
      }
    
      function removeChild(child) {
        this.children = _.without(this.children, child);
        delete child.parent;
      }
    
      function hasDescendant(container) {
        if (this === container) return true;
        if (this.children.length < 1) return false;
        var descendantPresent = false;
        _.each(this.children, function(child) {
          if(hasDescendant(child)) descendantPresent = true;
        })
        return descendantPresent;
      }
    
      return {
        message: message,
        children: children,
        addChild: addChild,
        removeChild: removeChild,
        hasDescendant: hasDescendant
      }
    }(message);
  }

  function messageThread() {
    return function() {
      var idTable = {};
    
      function thread(messages) {
        idTable = this.createIdTable(messages);
        var root = messageContainer();
        _.each(_.keys(idTable), function(id) {
          var container = idTable[id];
          if (!_.include(_.keys(container), "parent")) root.addChild(container);          
        })
        delete idTable;
        pruneEmpties(root);
        return root;
      }
    
      function pruneEmpties(parent) {
        for(var i = parent.children.length - 1; i >= 0; i--) {
          var container = parent.children[i];
          pruneEmpties(container);
          if (!container.message && container.children.length === 0) {
            parent.removeChild(container);
          } else if (!container.message && container.children.length > 0) {
            if (!parent.parent && container.children.length === 1) {
              promoteChildren(parent, container)
            } else if (!parent.parent && container.children.length > 1) {
              // do nothing
            } else {
              promoteChildren(parent, container)
            }
          }
        }
      }
    
      function promoteChildren(parent, container) {
        for(var i = container.children.length - 1; i >= 0; i--) {
          var child = container.children[i];
          parent.addChild(child);
        }
        parent.removeChild(container);
      }
    
      function createIdTable(messages) {
        idTable = {};
        _.map(messages, function(message) {
          var parentContainer = getContainer(message.id);
          parentContainer.message = message;
          var prev = null;
          _.each(message.references, function(reference) {
            var container = getContainer(reference);
            if (prev && !_.include(_.keys(container), "parent") && !container.hasDescendant(prev)) {
              prev.addChild(container);
            }
            prev = container;
          })
          if (prev && !parentContainer.hasDescendant(prev)) {
            prev.addChild(parentContainer);
          }
        })
        return idTable;
      }
    
      function getContainer(id) {
        if (_.include(_.keys(idTable), id)) {
          return idTable[id];
        } else {
          return createContainer(id);
        }
      }
    
      function createContainer(id) {
        var container = mail.messageContainer();
        idTable[id] = container;
        return container;
      }
    
      return {
        getContainer: getContainer,
        createContainer: createContainer,
        createIdTable: createIdTable,
        promoteChildren: promoteChildren,
        pruneEmpties: pruneEmpties,
        thread: thread,
        idTable: idTable
      }
    }();
  }
  
  var mail = this.mail = {
    message: message,
    messageContainer: messageContainer,
    messageThread: messageThread
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    _ = require('underscore');
    module.exports = mail;
  }
  
})();