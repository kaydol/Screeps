var creepManager = require('creep.manager');
require('prototype.creep')();

/** @param {Creep} creep **/
module.exports = function(creep) {

    if(!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.harvesting = true;
        creep.say('⛏ harvest');
    }
    if(creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
        creep.memory.harvesting = false;
        creep.say('📦 deliver');
    }

    if(!creep.memory.harvesting) {
        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
        });
        if(targets.length > 0) {
            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            creep.Idle();
        }
    }
    else {
        creep.FetchEnergy();
    }
	
};