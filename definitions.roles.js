/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('definitions.roles');
 * mod.thing == 'a thing'; // true
 */

const roles = {
    HARVESTER :'Harvester', 
    HAULER : 'Hauler',
    MINEHEAD : 'Minehead',
    BUILDER : 'Builder',
    COBBLER : 'Cobbler',
    UPGRADER : 'Upgrader',
    LONG_DISTANCE_MINER : 'LongDistanceMiner',
    CLAIMER : 'Claimer'//,
    //GUARD_
};

module.exports = function() {
    return roles;
};