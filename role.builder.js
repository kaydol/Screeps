let creepManager = require('creep.manager');
require('prototype.creep')();

module.exports = function(creep) {
    
    if (creep.IsDying()) {
        creep.PrepareToDie();
        return;
    }
    
    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.building = false;
        creep.ClearDestination();
        creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
        creep.memory.building = true;
        creep.ClearDestination();
        creep.say('🚧 build');
    }

    if (creep.memory.building) {
        
        if (creep.GetDestination()) {
            const destination = creep.TryReachDestination();
            if (destination) {  
                const construction = Game.getObjectById(destination);
                let errorCode = creep.build(construction);
                if (errorCode == ERR_INVALID_TARGET) {
                    creep.ClearDestination();
                }
            }
        } else {
            // Дороги строим в последнюю очередь
            const constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
            const notRoads = _.filter(constructionSites, (construction) => construction.structureType != STRUCTURE_ROAD);
            
            let destination;
            if (notRoads.length) 
                destination = creep.pos.findClosestByPath(notRoads);
            else
                destination = creep.pos.findClosestByPath(constructionSites);
            
            if (destination)
                creep.SetDestination(destination.id);
        }
        if (!creep.GetDestination()) 
        {
            // Если строить нечего, автоматически прокладываем дороги
            if (creep.memory.paths) {
                // Если оптимальные пути уже расчитаны, выбираем точку и пытаемся поставить дорогу
                const paths = creep.memory.paths;
                const terrain = Game.map.getRoomTerrain(creep.room.name);
                        
                for (let path of paths) {
                    for (let point of path) {
                        if (
                            // НЕ строим дороги в стене, в которой стоит источник энергии
                            terrain.get(point.x, point.y) != TERRAIN_MASK_WALL && 
                            // НЕ строим дороги ближе чем 3 тайла до контроллера, так как к нему необязательно подъезжать вплотную    
                            !creep.room.controller.pos.inRangeTo(point.x, point.y, 3) &&
                            // Выполняем функцию createConstructionSite только если в этой точке нет построек
                            !(new RoomPosition(point.x, point.y, creep.room.name)).look().some((s) => s.type == 'structure') 
                        )
                        {
                            let errorCode = creep.room.createConstructionSite(point.x, point.y, STRUCTURE_ROAD)
                            if (errorCode == OK) {
                                console.log(`No buildings to build, placing a road at x=${point.x} y=${point.y}...`);
                                return;
                            }
                        }
                    }
                }
            } 
            else { 
                // Рассчитываем все пути для дорог только 1 раз в начале жизни крипа
                // Рассчитываем дороги от спавна к источникам
                let i = 0;
                let paths = [];
                const spawns = creep.room.find(FIND_MY_SPAWNS);
                const energySources = creep.room.find(FIND_SOURCES_ACTIVE); 
                if (spawns.length) {
                    for (let spawn of spawns) {
                        for (let source of energySources) {
                            const path = spawn.pos.findPathTo(source);
                            paths[i++] = path;
                        }
                    }
                    creep.memory.paths = paths;
                }
                // Рассчитываем дорогу от контроллера к ближайшему источнику
                if (creep.room.controller) {
                    const cpos = creep.room.controller.pos;
                    const path = cpos.findPathTo(cpos.findClosestByPath(creep.room.find(FIND_SOURCES)));
                    paths[i++] = path;
                }
                return;
            }
            // Если строить нечего и все авто-дороги проложены, переключаемся в режим снабжения башни 
            const closest = creep.FindClosestStorage(creep.room, [STRUCTURE_TOWER]);
            if (closest) {
                if(creep.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else
                creep.Idle(); 
        }
    }
    else {
        creep.FetchEnergy();
    }
	
};