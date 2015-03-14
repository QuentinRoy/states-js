'use strict';
var _ = require('underscore');

function State(name){
    this.states       = {};
    this.transitions  = {};
    this._name        = name;
    this._parent      = null;
    this._current     = null;
    this.initial      = null;
    this._active      = false;
}

State.prototype = {

    get current(){
        return this._current;
    },

    get name(){
        return this._name;
    },

    get isActive(){
        return this._active;
    },

    get parent(){
        return this._parent;
    },

    get root(){
        if(this.isRoot) {
            return this;
        } else {
            return this.parent.root;
        }
    },

    get isRoot(){
        return !this._parent;
    },

    get started(){
        return this._started;
    },

    addState: function(state){
        if(_.isString(state)){
            state = new State(state);
        }
        this.states[state.name] = state;
        state._parent = this;
    },

    currentState: function(){
        return this.states[this.current];
    },

    /*
     * Handle an event, causing or not a state transition.
     *
     */
    handle: function(event){
        // pass for not current state
        if(!this.isActive){
            throw 'Non active states cannot handle events';
        }
        var currentState = this.currentState();
        if(currentState && currentState.handle(event)){
            // pass event to current children (if any)
            return true;
        } else {
            // else handle the event himself
            var target = this.transitions[event];
            if(target){
                this.parent._stateTransition(target);
                return true;
            }
            return false;
        }
    },

    hasChild: function(){
        return !_.isEmpty(this.states);
    },

    init: function(){
        if(!this.isRoot){
            throw 'Only root state can be initialized';
        }
        this._enter();
    },

    /*
     * Set one or several transitions
     */
    setTransition: function(event, target){
        if(_.isString(event)){
            this._setTransition(event, target);
        } else {
            _.each(event, function(ttarget, tevent){
                this._setTransition(tevent, ttarget);
            }, this);
        }
    },

    _enter: function(){
        this._active = true;
        if(this.hasChild()){
            this._switchCurrent(this.initial);
        }
    },

    _leave: function(){
        this._active = false;
        var currentState = this.currentState();
        if(currentState){
            currentState._leave();
            this._current = null;
        }
    },

    /*
     * Set a transition.
     */
    _setTransition: function(event, target){
        this.transitions[event] = target;
    },

    /*
     * Called by children to trigger a state transition
     */
    _stateTransition: function(target){
        this._switchCurrent(target);
    },

    /*
     * Switch current state
     */
    _switchCurrent: function(targetName){
        var previousState = this.currentState();
        var targetState = this.states[targetName];
        if(!targetState){
            throw 'State unfound: "' + targetName + '"';
        }
        if(previousState){
            previousState._leave();
        }
        targetState._enter();
        this._current = targetName;
    }

};

module.exports  = State;
