var creepManager = require('creep.manager');
var defenceManager = require ('defence.manager');

var roleHarvester = require('role.harvester');
var roleMineHead = require('role.minehead');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleCobbler = require('role.cobbler');

// Здесь определяется какое поведение выполнять на крипах с соответствующей ролью
var runners = [
    {name: creepManager.Roles.HARVESTER.roleName, runner: roleHarvester},
    {name: creepManager.Roles.MINEHEAD.roleName, runner: roleMineHead},
    {name: creepManager.Roles.UPGRADER.roleName, runner: roleUpgrader},
    {name: creepManager.Roles.BUILDER.roleName, runner: roleBuilder},
    {name: creepManager.Roles.COBBLER.roleName, runner: roleCobbler}
];
var dictionary = runners.reduce((r, o) => Object.assign(r, { [o.name]: o }), {})

module.exports.loop = function () {
    
    creepManager.VisualizeSpawningUnits();
    creepManager.ClearDeadCreepsMemory();
    creepManager.SpawnUnitsIfNeeded();
    
    defenceManager.EngageTowers();
    
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        dictionary[creep.GetRole()].runner(creep);
    }
}
