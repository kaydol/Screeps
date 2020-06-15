

module.exports = {
    
    EngageTowers: function() {
        for(let roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            const towers = Game.rooms[roomName].find(
                    FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}}
                );
            const hostiles = room.find(FIND_HOSTILE_CREEPS);
            
            if (hostiles.length > 0) {
                const username = hostiles[0].owner.username;
                Game.notify(`User ${username} spotted in room ${roomName}`);
                towers.forEach(tower => tower.attack(hostiles[0]));
            } else {
                // Чиним здания башней
                const targets = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.hits < structure.hitsMax;
                    }
                });
                if (targets.length) {
                    targets.sort((a,b) => a.hits - b.hits);
                    let hitPointsToRepair = 0; 
                    let i = targets.length; while (i--) hitPointsToRepair += targets[i].hitsMax - targets[i].hits;
                    // Возле башни рисуем количество HP, которые нужно отремонтировать в комнате
                    towers.forEach(tower => {
                        // Чиним только если в башне больше половины энергии
                        if (tower.store.getFreeCapacity(RESOURCE_ENERGY) < tower.store.getCapacity(RESOURCE_ENERGY) / 2.0)
                            tower.repair(targets[0]);
                        tower.room.visual.text(
                            hitPointsToRepair,
                            tower.pos.x + 1, 
                            tower.pos.y, 
                            {align: 'left', opacity: 0.8});
                    });
                    
                }
                
            }
        }
    }
    
};