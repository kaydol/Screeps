
/*
    В массиве ROLES хранятся 
        spawnPriority - приоритет (очередность) постройки
        roleName - строковое название роли
        parts - массив частей,  из которых состоят представители роли
        amount - какое колиество крипов данной роли нужно поддерживать
        condition - условие, которое должно быть истинным, для того, чтобы данный крип рассматривался для спавна
*/
var ROLES = {
    HARVESTER : {spawnPriority: 0, roleName: 'Harvester', parts: [WORK,CARRY,CARRY,MOVE,MOVE], amount: 4, condition: true}, 
    MINEHEAD : {spawnPriority: 1, roleName: 'Minehead', parts: [WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE], amount: 2, condition: 
            Game.spawns['Spawn1'].room.controller.level >= 2 && 
            Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, { filter: (i) => i.structureType == STRUCTURE_CONTAINER }).length},
    BUILDER : {spawnPriority: 2, roleName: 'Builder', parts: [WORK,CARRY,CARRY,MOVE,MOVE], amount: 3, condition: true},
    COBBLER : {spawnPriority: 3, roleName: 'Cobbler', parts: [WORK,CARRY,CARRY,MOVE,MOVE], amount: 2, condition: true},
    UPGRADER : {spawnPriority: 4, roleName: 'Upgrader', parts: [WORK,CARRY,CARRY,MOVE,MOVE], amount: 6, condition: true}
};

var _visualizeNextSpawnedUnit = function(role) {
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
            var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
            Game.spawns['Spawn1'].room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                Game.spawns['Spawn1'].pos.x + 1, 
                Game.spawns['Spawn1'].pos.y, 
                {align: 'left', opacity: 0.8});
        }
    },
    
    ClearDeadCreepsMemory: function() {
        // Очистка памяти умерших юнитов
        for(var name in Memory.creeps) {
            if(!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory: ', name);
            }
        }
    },
    
    SpawnUnitsIfNeeded: function() {
        // Добавляем нехватающих крипов на основе их spawnPriority
        for(var role of _.sortBy(Object.values(ROLES),'spawnPriority')) {
            var roleMembers = _.filter(Game.creeps, (creep) => creep.GetRole() == role.roleName);
            // TODO добавить проверку "максимальное кол-ва доступной энергии <= затраты на постройку юнита"
            if(roleMembers.length < role.amount && role.condition) {
                var newName = role.roleName + Game.time;
                var errorCode = Game.spawns['Spawn1'].spawnCreep(role.parts, newName, { dryRun: true });
                if (errorCode == OK) {
                    console.log('Spawning new creep: ' + newName);
                    Game.spawns['Spawn1'].spawnCreep(role.parts, newName, { memory: {role: role.roleName, runner: role.behavior}});
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