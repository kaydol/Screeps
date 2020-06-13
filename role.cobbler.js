var creepManager = require('creep.manager');
require('prototype.creep')();

module.exports = function(creep) {

    if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.repairing = false;
        creep.ClearDestination();
        creep.say('🔄 harvest');
    }
    if (!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
        creep.memory.repairing = true;
        creep.ClearDestination();
        creep.say('🔨 repair');
    }

    if (creep.memory.repairing) {
        if (creep.GetDestination()) 
        {
            var destination = creep.TryReachDestination();
            if (destination) {
                var construction = Game.getObjectById(destination);
                var errorCode = creep.repair(construction);
                //creep.say(construction.structureType);
                if (construction.hits >= construction.hitsMax)
                    creep.ClearDestination();
            }
        }
        else 
        {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.hits < structure.hitsMax;
                }
            });
            
            if (targets) {
                targets.sort((a,b) => a.hits - b.hits);
                creep.SetDestination(targets[0].id);
            } else {
                creep.Idle();
            }
	    }
        
    }
    else {
        creep.FetchEnergy();
    }
};

