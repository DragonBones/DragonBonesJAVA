package dragonbones.model;


import dragonbones.core.BaseObject;
import java.util.ArrayList;
import dragonbones.core.DragonBones.ActionType;

/**
 *
 * @author mebius
 */
public class ActionData extends BaseObject{
    
    @Override
    public String toString()
    {
        return "[Class dragonBones.ActionData]";
    }
    
    public ActionType type;
    public ArrayList<Object> data;
    public BoneData bone;
    public SlotData slot;
    
    public ActionData(){}
    
    //_onClear
}
