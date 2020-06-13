var creepManager = require('creep.manager');
require('prototype.creep')();

/** @param {Creep} creep **/
module.exports = function(creep) {

    if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.harvesting = true;
        creep.ClearDestination();
        creep.say('⛏ harvest');
    }
    if (creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
        creep.memory.harvesting = false;
        creep.ClearDestination();
        creep.say('📦 deliver');
    }
    
    if(!creep.memory.harvesting) {
        var targets = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.my &&
                    (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
        if(targets.length > 0) {
            // Едем вливать энергию в ближайшую постройку
            var closest = creep.pos.findClosestByPath(targets, {ignoreCreeps: true});
            if(creep.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            // Все пристройки и важные здания заполнены энергией
            creep.Idle();
        }
    }
    else {
        creep.FetchEnergy();
    }
	
};