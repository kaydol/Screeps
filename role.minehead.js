module.exports = function(creep) {
	    
    if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.harvesting = true;
        creep.say('⛏ harvest');
    }
    if (creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
        creep.memory.harvesting = false;
        creep.say('📦 deliver');
    }

    if (!creep.memory.harvesting) {
        // Шахтер заполнит ближайший к нему контейнер, после чего прекратит работать
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER);
            }
        });
        // TODO заполнять блиайший незаполненный контейнер
        if (targets.length > 0) {
            var closest = creep.pos.findClosestByPath(targets, {ignoreCreeps: true})
            var errorCode = creep.transfer(closest, RESOURCE_ENERGY);
            if (errorCode == ERR_NOT_IN_RANGE) {
                creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            if (errorCode == ERR_FULL) {
                creep.say('😊 Full');
            }
        } else {
            creep.Idle();
        }
    }
    else {
        if (!creep.GetBoundSource()) {
            // Назначаем крипу источник на котором он будет трудиться всю жизнь
            var currentRoom = creep.room;
	        // Рассматриваем только источники с контейнерами поблизости
	        var sources = _.filter(currentRoom.find(FIND_SOURCES), 
	            (source) => source.pos.findInRange(FIND_STRUCTURES, 3, {
                    filter: { structureType: STRUCTURE_CONTAINER }
                }).length
            );
	        
	        var dictionary = new Map(sources.map(src => [src.id, 0]));
	        
	        // Смотрим по сколько крипов забиндено на каждый источник
            for (var name in Memory.creeps) {
                if (Game.creeps[name]) {
                    var src = Game.creeps[name].GetBoundSource();
                    if (src && dictionary.has(src)) {
                        dictionary.set(src, dictionary.get(src) + 1);
                    }
                }
            }
            
            // TODO в случае, если > 1 источника с 0 рабочими, выбирать тот, который ближе
            
	        // Выбираем в качестве рабочего источника тот, на котором сейчас меньше всего рабочих
	        var sourceWithTheLeastWorkers = [...dictionary.entries()].reduce((a, e) => e[1] < a[1] ? e : a);
	        creep.SetBoundSource(sourceWithTheLeastWorkers[0]);
	        console.log('The chosen source is '+sourceWithTheLeastWorkers);
        } else {
            // У крипа есть свой источник
            var src = creep.GetBoundSourceObject();
            if (creep.harvest(src) == ERR_NOT_IN_RANGE) {
                creep.moveTo(src, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};
