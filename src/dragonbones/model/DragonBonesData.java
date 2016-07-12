package dragonbones.model;

import java.util.Map;
import java.util.ArrayList;

/**
 *
 * @author mebius
 */
public class DragonBonesData {

    @Override
    public String toString() {
        return "[Class dragonBones.DragonBonesData]";
    }

    public boolean autoSearch;
    public double frameRate;
    public String name;
    public Map<String, ArmatureData> armatures;
    public ArrayList<String> _armatureNames;

    public DragonBonesData() {
    }

    //_onClear
    public ArmatureData getArmature(String name) {
        return this.armatures.get(name);
    }

    public void addArmature(ArmatureData value)
    {
        if(value!=null && value.name!="" && this.armatures.get(value.name)==null)
        {
            this.armatures.put(value.name, value);
            this._armatureNames.add(value.name);
        }else{
            throw new Error();
        }
    }
    
    public ArrayList<String> getArmatureNames()
    {
        return this._armatureNames;
    }
}
