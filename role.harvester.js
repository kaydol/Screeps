var creepManager = require('creep.manager');
require('prototype.creep')();

/** @param {Creep} creep **/
module.exports = function(creep) {
    
    if (creep.IsDying()) {
        creep.PrepareToDie();
        return;
    }

    if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.harvesting = true;
        creep.ClearDestination();
        creep.say('⛏ harvest');
    }
    if (creep.memory.harvesting && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
        creep.memory.harvesting = false;
        creep.ClearDestination();
        creep.say('📦 deliver');
    }
    
    if(!creep.memory.harvesting) {
        // Едем вливать энергию в ближайшую постройку
        var closest = creep.FindClosestStorage(creep.room, [STRUCTURE_EXTENSION, STRUCTURE_SPAWN]);
        if (closest) {
            if(creep.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
        }
        else {
            // Если нет никаких других подходящих целей для влива энергии, пытаемся вливать в башню
            var closest = creep.FindClosestStorage(creep.room, [STRUCTURE_TOWER]);
            if (closest) {
                if(creep.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else {
                // Все пристройки и важные здания заполнены энергией
                creep.Idle();
            }
            
        }
    }
    else {
        creep.FetchEnergy();
    }
	
};