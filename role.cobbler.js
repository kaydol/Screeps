var creepManager = require('creep.manager');
require('prototype.creep')();

module.exports = function(creep) {

    if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.repairing = false;
        creep.say('🔄 harvest');
    }
    
    if(!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
        creep.memory.repairing = true;
        creep.say('🔨 repair');
    }

    if(creep.memory.repairing) {
        if (creep.GetDestination()) 
        {
            var destination = creep.TryReachDestination();
            if (destination) {  
                var construction = Game.getObjectById(destination);
                var errorCode = creep.repair(construction);
            }
        }
        else 
        {
            var destination = creep.pos.findClosestByPath(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.hits < structure.hitsMax;
                }
            }));
            
            if (destination) {
                creep.SetDestination(destination.id);
            } else {
                creep.Idle();
            }
	    }
        
    }
    else {
        creep.FetchEnergy();
    }
};

