module.exports = function(creep) {
    
	if (creep.RenewIfNeeded(300, true)) {
        return;
    }
	
	const PULL_THRESHOLD = 2;
	
    if (!creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.harvesting = true;
        creep.say('⛏ harvest');
    }
    if (creep.memory.harvesting && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
        creep.memory.harvesting = false;
        creep.say('📦 deliver');
    }

    if (!creep.memory.harvesting) {
        // Шахтер заполнит ближайший к нему контейнер, после чего прекратит работать
        const closest = creep.FindClosestStorage(creep.room, [STRUCTURE_CONTAINER], canBeFull=true);
        if (closest) {
            let errorCode;
            // Чиним контейнер
            if (closest.hits < closest.hitsMax) {
                errorCode = creep.repair(closest);
            }
            if (errorCode == OK) {
                creep.say('Fixing');
                creep.ClearPullTowards();
                return;
            }
            
            // Если шахтер далеко от контейнера, просим его подтолкнуть
            let distance = creep.pos.getRangeTo(closest);
            
            if (distance > PULL_THRESHOLD)
                creep.SetPullTowards(closest);
            else
                creep.ClearPullTowards();
            
            if (errorCode == ERR_NOT_IN_RANGE) {
                creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
                return;
            }
            
            errorCode = creep.transfer(closest, RESOURCE_ENERGY);
            
            if (errorCode == ERR_NOT_IN_RANGE) {
                creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
                return;
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
            const currentRoom = creep.room;
	        // Рассматриваем только источники с контейнерами поблизости
	        const sources = _.filter(currentRoom.find(FIND_SOURCES), 
	            (source) => source.pos.findInRange(FIND_STRUCTURES, 3, {
                    filter: { structureType: STRUCTURE_CONTAINER }
                }).length
            );
	        
	        let dictionary = new Map(sources.map(src => [src.id, 0]));
	        
	        // Смотрим по сколько крипов забиндено на каждый источник
            for (let name in Memory.creeps) {
                if (Game.creeps[name]) {
                    let src = Game.creeps[name].GetBoundSource();
                    if (src && dictionary.has(src)) {
                        dictionary.set(src, dictionary.get(src) + 1);
                    }
                }
            }
            
            // TODO в случае, если > 1 источника с 0 рабочими, выбирать тот, который ближе
            
	        // Выбираем в качестве рабочего источника тот, на котором сейчас меньше всего рабочих
	        const sourceWithTheLeastWorkers = [...dictionary.entries()].reduce((a, e) => e[1] < a[1] ? e : a);
	        creep.SetBoundSource(sourceWithTheLeastWorkers[0]);
	        creep.SetPullTowards(sourceWithTheLeastWorkers[0]);
	        console.log('The chosen source is '+sourceWithTheLeastWorkers);
	        
	        
        } else {
            // У крипа есть свой источник
            const src = creep.GetBoundSourceObject();
            
            // Если шахтер далеко от источника, просим его подтолкнуть
            let distance = creep.pos.getRangeTo(src);
            
            if (distance > PULL_THRESHOLD)
                creep.SetPullTowards(src.id);
            else
                creep.ClearPullTowards();
                
            let errorCode = creep.harvest(src);
            
            if (errorCode == ERR_NOT_IN_RANGE) {
                creep.moveTo(src, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            if (errorCode == ERR_NOT_ENOUGH_RESOURCES) {
                creep.say('🕒');
            }
        }
    }
};
