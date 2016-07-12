package dragonbones.model;

import dragonbones.core.BaseObject;
import dragonbones.core.DragonBones.EventType;

/**
 *
 * @author mebius
 */
public class EventData extends BaseObject {
    
    @Override
    public String toString()
    {
        return "[Class dragonBones.EventData]";
    }
    
    public EventType type;
    public String name;
    public Object data;
    public BoneData bone;
    public SlotData slot;
    
    public EventData(){}
    
    //_onClear
}
