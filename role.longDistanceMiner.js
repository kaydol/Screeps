
module.exports = function(creep) {
    
    if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.harvesting = true;
        creep.ClearDestination();
        creep.say('⛏ harvest');
        
        if (creep.memory.delivered == null) {
            creep.memory.delivered = 0;
        } else {
            creep.memory.delivered = creep.memory.delivered + creep.store.getCapacity();
            console.log('Long Distance Miner delivered ' + creep.memory.delivered + ' energy total');
        };
    }
    if (creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
        creep.memory.harvesting = false;
        creep.ClearDestination();
        creep.say('📦 deliver');
    }
    
    var homeRoom = creep.GetSpawnerObject().room;
    
    var longDistanceMiningFlags = _.filter(Game.flags, (flag) => flag.color == COLOR_YELLOW);
    if (longDistanceMiningFlags.length) {
        
        var flag = longDistanceMiningFlags[0];
        
        if(!creep.memory.harvesting) {
            if (creep.room != homeRoom) {
                creep.moveTo(homeRoom.controller.pos);
            } else {
                // Доехали, теперь едем вливать энергию в ближайшую постройку
                var closestStorage = creep.FindClosestStorage(homeRoom);
                if (closestStorage && creep.transfer(closestStorage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestStorage, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                else {
                    // Все пристройки и важные здания заполнены энергией
                    creep.Idle();
                }
            }
            
        }
        else {
            // Едем в комнату с флагом
            if (!Game.rooms[flag.pos.roomName] || creep.room != Game.rooms[flag.pos.roomName]) {
                creep.moveTo(flag.pos);
            } else
                creep.FetchEnergy(flag.room);
        }
    } else {
        console.log(creep.name + ': place a yellow flag for long distance mining!');
    }
    
};