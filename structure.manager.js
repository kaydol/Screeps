
module.exports = {

    BuildStructures: function() {
        for(let roomName in Game.rooms) {
            const currentRoom = Game.rooms[roomName];
            const controller = currentRoom.controller;
            if (controller) {
                switch (controller.level) {
                    case 1:
                        // Строим дорогу вокруг каждого источника, чтобы улучшить доступ к нему
                        /* Как оказалось, поддерживать дороги в стенах слишком затратно и не стоит того
                        if (!currentRoom.memory.RoadRimsPlaced) 
                        {
                            const sources = currentRoom.find(FIND_SOURCES);
                            for(let src of sources) {
                                const radius = 1;
                                for(let dx = -radius; dx <= radius; dx++) {
                                    for(let dy = -radius; dy <= radius; dy++) {
                                        // Дорогу строим в виде квадрата со скошенными углами
                                        if (dx + dy != -radius*2 && // левый верхний угол 
                                            dx + dy != radius*2 && // правый нижний угол
                                            (dx == radius && dy != radius) && // правый нижний угол
                                            (dx == -radius && dy != radius) && // левый нижний угол
                                            !(dx == 0 && dy ==0) // не строим дорогу на месте источника
                                        )
                                            currentRoom.createConstructionSite(src.pos.x + dx, src.pos.y + dy, STRUCTURE_ROAD);
                                    }
                                }
                            }
                            currentRoom.memory.RoadRimsPlaced = true;
                            console.log('Placing 2-tile road rims around energy sources');
                        } */
                        break;
                    case 2:
                        // build ramps around controller
                        break;
                    case 3:
                        
                        break;
                    case 4:
                        
                        break;
                    case 5:
                        // построить storage, tower, link
                        break;
                    case 6:
                        // построить extractor, lab, terminal
                        break;
                    case 7:
                        // построить factory, spawn
                        break;
                    case 8:
                        // построить observer, power plant, nuker, spawn
                        break;
                    default:
                        
                        break;
                }
                
                // Строим рампу вокруг контроллера, чтобы вражеские крипы не могли прерывать апгрейд контроллера
                const radius = 1;
                const terrain = Game.map.getRoomTerrain(roomName);
                const pos = controller.pos;
                for(let dx = -radius; dx <= radius; dx++) {
                    for(let dy = -radius; dy <= radius; dy++) {
                        if (terrain.get(pos.x + dx, pos.y + dy) != TERRAIN_MASK_WALL && (dx != 0 && dy != 0)) {
                            currentRoom.createConstructionSite(pos.x + dx, pos.y + dy, STRUCTURE_RAMPART);
                        }
                    }
                }
            }
            
            
            
            
        }
        
        
    }


};