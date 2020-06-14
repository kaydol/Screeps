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
                var construction = creep.GetDestinationObject();
                var errorCode;
                if (construction) {
                    if (construction.structureType == STRUCTURE_TOWER)
                        errorCode = creep.transfer(construction, RESOURCE_ENERGY);
                    else {
                        errorCode = creep.repair(construction);
                        if (construction.hits >= construction.hitsMax)
                            creep.ClearDestination();
                    }
                } else
                    creep.ClearDestination();
            }
        }
        else 
        {
            // Если в комнате есть башни, переключаемся в режим снабжения башни энергией
            var towersInTheRoom = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            
            if (towersInTheRoom.length) {
                // Едем вливать энергию в самую пустую башню
                towersInTheRoom.sort((a,b) => a.getFreeCapacity(RESOURCE_ENERGY) - b.getFreeCapacity(RESOURCE_ENERGY))
                creep.SetDestination(towersInTheRoom[towersInTheRoom.length-1].id);
                return;
            }
            
            // Если башни в комнате нет, то выбираем самую битую постройку и едем ее чинить
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

