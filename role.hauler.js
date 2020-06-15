let creepManager = require('creep.manager');
require('prototype.creep')();

module.exports = function(creep) {
    
    const mineheads = _.filter(Game.creeps, (c) => c.GetRole() == creepManager.Roles.MINEHEAD.roleName && !c.IsNearBoundSource());
    if (mineheads.length) {
        creep.say('Hauling');
        const closest = creep.pos.findClosestByPath(mineheads, {ignoreCreeps: true});
        // Доехали до крипа, которого будем толкать
        if (creep.pos.isNearTo(closest)) 
        {
            const path = creep.pos.findPathTo(closest.GetBoundSourceObject());
            if (path.length > 1) {
                // Едем
                creep.moveByPath(path);
            } else {
                // Приехали, меняемся местами 
                creep.move(creep.pos.getDirectionTo(closest));
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