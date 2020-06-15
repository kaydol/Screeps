
/*
    В массиве ROLES хранятся 
        spawnPriority - приоритет (очередность) постройки, чем ниже, тем важнее
        roleName - строковое название роли
        parts - массив частей,  из которых состоят представители роли
        amount - какое количество крипов данной роли нужно поддерживать
        condition - условие, которое должно быть истинным, для того, чтобы данный крип рассматривался для спавна
*/

ROLES = {
    HARVESTER : {spawnPriority: 0, roleName: 'Harvester', parts: [WORK,CARRY,CARRY,MOVE,MOVE], amount: 3, condition: true}, 
    HAULER : {spawnPriority: 1, roleName: 'Hauler', parts: [CARRY,MOVE,MOVE,MOVE,MOVE,MOVE], amount: 1, condition: 
        Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER }).length},
    MINEHEAD : {spawnPriority: 2, roleName: 'Minehead', parts: [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE], amount: 4, condition: 
        Game.spawns['Spawn1'].room.controller.level >= 2 && 
        Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER }).length},
    BUILDER : {spawnPriority: 3, roleName: 'Builder', parts: [WORK,CARRY,CARRY,MOVE,MOVE], amount: 6, condition: true}, // TODO спавнить строителей на основе общего количества хитпоинтов которые надо построить в комнате
    COBBLER : {spawnPriority: 4, roleName: 'Cobbler', parts: [WORK,WORK,CARRY,CARRY,MOVE,MOVE], amount: 2, condition: true},
    UPGRADER : {spawnPriority: 5, roleName: 'Upgrader', parts: [WORK,CARRY,CARRY,MOVE,MOVE], amount: 4, condition: true},
    LONG_DISTANCE_MINER : {spawnPriority: 6, roleName: 'LongDistanceMiner', parts: [WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], amount: 4, condition: 
        Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER || i.structureType == STRUCTURE_STORAGE }).length &&
        _.filter(Game.flags, (flag) => flag.color == COLOR_YELLOW).length 
    },
    CLAIMER : {spawnPriority: 7, roleName: 'Claimer', parts: [CLAIM,MOVE], amount: 0, condition: 
        _.filter(Game.flags, (flag) => flag.color == COLOR_YELLOW).length 
    }
};
// TODO
// Use Room.energyAvailable and Room.energyCapacityAvailable to determine how much energy all the spawns and extensions in the room contain.
// Game.gcl 

const _visualizeNextSpawnedUnit = function(role) {
    // Визуализация - оглашение следующего претендента на спавн
    if(!Game.spawns['Spawn1'].spawning) { 
        Game.spawns['Spawn1'].room.visual.text(
            '🎉 Next: ️' + role.roleName,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }
};
    
module.exports = {
    
    VisualizeSpawningUnits: function() {
        // Визуализация - показ юнита, который сейчас спавнится
        if(Game.spawns['Spawn1'].spawning) { 
            let spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
            Game.spawns['Spawn1'].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns['Spawn1'].pos.x + 1, 
                Game.spawns['Spawn1'].pos.y, 
                {align: 'left', opacity: 0.8});
        }
    },
    
    ClearDeadCreepsMemory: function() {
        // Очистка памяти умерших юнитов
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory: ', name);
            } 
            //else { delete Memory.creeps[name].paths; };
        }
    },
    
    SpawnUnitsIfNeeded: function() {
        
        const spawn = Game.spawns['Spawn1'];
        
        // Добавляем нехватающих крипов на основе их spawnPriority
        for(let role of _.sortBy(Object.values(ROLES),'spawnPriority')) {
            const roleMembers = _.filter(Game.creeps, (creep) => creep.GetRole() == role.roleName);
            // TODO добавить проверку "максимальное кол-ва доступной энергии <= затраты на постройку юнита"
            if(roleMembers.length < role.amount && role.condition) {
                const newName = role.roleName + Game.time;
                let errorCode = spawn.spawnCreep(role.parts, newName, { dryRun: true });
                if (errorCode == OK) {
                    console.log('Spawning new creep: ' + newName);
                    spawn.spawnCreep(role.parts, newName, { memory: {role: role.roleName, spawner: spawn.name}});
                    return; // очень важный return, чтобы spawnCreep не перезаписывался последующими итерациями в цикле (выходим, чтобы последующих итераций просто не было)
                }
                if (errorCode == ERR_NOT_ENOUGH_ENERGY) {
                    _visualizeNextSpawnedUnit(role);
                    return; // выходим, если не хватило эенергии на спавн приоритетного юнита (ждем пока появится энергия)
                }
            }
        }
    },
    
    Roles: ROLES
};