let creepManager = require('creep.manager');
require('prototype.creep')();

module.exports = function(creep) {
        
    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.upgrading = false;
        creep.ClearDestination();
        creep.say('🔄 harvest');
    }
    if (!creep.memory.upgrading && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
        creep.memory.upgrading = true;
        creep.ClearDestination();
        creep.say('⚡ upgrade');
    }

    if (creep.memory.upgrading) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
    else {
        creep.FetchEnergy();
    }
	
};
