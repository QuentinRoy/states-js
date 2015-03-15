/*global describe, it, afterEach, beforeEach */
/*eslint no-unused-expressions:0 */
'use strict';
var expect = require('chai').expect;
var State  = require('./states');

describe('Simple FSM Programmatically', function(){
    var stateMachine;
    afterEach(function() {
        stateMachine = null;
    });

    describe('States and substates Creation', function(){
        it('Should instantiate state machine', function(){
            stateMachine = new State();
            expect(stateMachine).to.be.instanceof(State);
        });
        it('Should respect state labels', function(){
            expect(new State('state')).to.have.property('name').to.equal('state');
        });
        it('Should add states to the FSM', function(){
            // create the states
            stateMachine = new State();
            var coldState = new State('cold');
            stateMachine.addState(coldState);
            stateMachine.addState(new State('warm'));
            stateMachine.addState('hot');

            expect(stateMachine.states).to.have.property('cold')
                .that.equal(coldState);
            expect(stateMachine.states).to.have.property('warm')
                .that.is.an.instanceof(State);
            expect(stateMachine.states).to.have.property('hot')
                .that.is.an.instanceof(State)
                .and.has.property('name')
                    .that.equal('hot');
        });
    });

    describe('Transitions', function(){

        beforeEach(function(){
            stateMachine = new State();
            stateMachine.addState('cold');
            stateMachine.addState('warm');
            stateMachine.addState('hot');
        });

        it('Should add state transition', function(){

            stateMachine.states.cold.setTransition('heat', 'warm');
            expect(stateMachine.states.cold)
                .to.have.property('transitions')
                .that.have.property('heat')
                .that.is.equal('warm');

            stateMachine.states.hot.setTransition('cool', 'warm');
            expect(stateMachine.states.hot)
                .to.have.property('transitions')
                .that.have.property('cool')
                .that.is.equal('warm');

            stateMachine.states.warm.setTransition({
                heat: 'hot',
                cool: 'cold'
            });
            expect(stateMachine.states.warm)
                .to.have.property('transitions')
                .that.have.property('heat')
                .that.is.equal('hot');
            expect(stateMachine.states.warm.transitions)
                .to.have.property('cool')
                .that.is.equal('cold');
        });

        it('Should respect the transitions', function(){
            stateMachine.states.cold.setTransition('heat', 'warm');
            stateMachine.states.hot.setTransition('cool', 'warm');
            stateMachine.states.warm.setTransition({
                heat: 'hot',
                cool: 'cold'
            });

            stateMachine.initial = 'cold';
            expect(stateMachine.isActive, 'stateMachine isActive').to.be.false;

            stateMachine.init();
            expect(stateMachine.isActive, 'stateMachine isActive').to.be.true;
            expect(stateMachine.current).to.be.equal('cold');
            expect(stateMachine.states.cold.isActive, 'cold isActive').to.be.true;

            stateMachine.handle('cool');
            expect(stateMachine.current).to.be.equal('cold');

            stateMachine.handle('heat');
            expect(stateMachine.current).to.be.equal('warm');
            expect(stateMachine.states.cold.isActive, 'cold isActive').to.be.false;

            stateMachine.handle('heat');
            expect(stateMachine.current).to.be.equal('hot');

            stateMachine.handle('heat');
            expect(stateMachine.current).to.be.equal('hot');

            stateMachine.handle('cool');
            expect(stateMachine.current).to.be.equal('warm');
        });
    });

    describe('Simple FSM Declaratively', function(){});

});
