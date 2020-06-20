const defRoles = require('definitions.roles')();
require('prototype.creep')();

module.exports = function(creep) {
    
    if (creep.RenewIfNeeded(300)) {
        return;
    }
    
    const creepsToPull = _.filter(Game.creeps, (c) => c.GetPullTowards() && !c.spawning);
    if (creepsToPull.length) {
        creep.say('Hauling');
        const closest = creep.pos.findClosestByPath(creepsToPull, {ignoreCreeps: true});
        if (!closest && creepsToPull.length && !creep.pos.isNearTo(creepsToPull[0])) {
            creep.moveTo(creepsToPull[0]);
        }
        // Доехали до крипа, которого будем толкать
        if (creep.pos.isNearTo(closest)) 
        {
            //console.log(closest.GetPullTowards());
            const path = creep.pos.findPathTo(closest.GetPullTowardsObject(), {ignoreCreeps: true});
            if (path.length > 2) {
                // Едем
                creep.moveByPath(path);
            } else {
                // Приехали, меняемся местами 
                creep.move(creep.pos.getDirectionTo(closest));
                //closest.ClearPullTowards();
            }
            creep.pull(closest);
            closest.move(creep);
        }
        else {
            // Едем толкать крипа
            creep.moveTo(closest);
        }
        
    }
    else {
        
        creep.Idle();
    }
    
    
};