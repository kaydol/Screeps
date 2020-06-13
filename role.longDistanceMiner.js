
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
    
    var homeRoom = Game.spawns['Spawn1'].room;
    
    var longDistanceMiningFlags = _.filter(Game.flags, (flag) => flag.color == COLOR_YELLOW);
    if (longDistanceMiningFlags.length) {
        
        var flag = longDistanceMiningFlags[0];
        
        if(!creep.memory.harvesting) {
            var targets = homeRoom.find(FIND_STRUCTURES, { // TODO комната в которую везем ресурсы захардкожена, убрать хардкод
                filter: (structure) => {
                    return ((structure.my && (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER))
                        || (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE)) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(targets.length > 0) {
                // Если мы не в той комнате, едем обратно в свою комнату
                if (creep.room != homeRoom) {
                    creep.moveTo(targets[0].pos); // Здесь не важен индекс массива, 
                }
                else {
                    // Едем вливать энергию в ближайшую постройку
                    var closest = creep.pos.findClosestByPath(targets, {ignoreCreeps: true});
                    if(creep.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            } else {
                // Все пристройки и важные здания заполнены энергией
                creep.Idle();
            }
        }
        else {
            if (!Game.rooms[flag.pos.roomName] || creep.room != Game.rooms[flag.pos.roomName]) {
                creep.moveTo(flag.pos);
            } else
                creep.FetchEnergy(flag.room);
        }
    } else {
        console.log(creep.name + ': place a yellow flag for long distance mining!');
    }
    
};