package dragonbones.model;

import dragonbones.core.BaseObject;
import java.util.ArrayList;
/**
 *
 * @author mebius
 */
public class FrameData extends BaseObject{
    
    public double position;
    public double duration;
    public FrameData next;
    public FrameData prev;
    
    public ArrayList<ActionData> actions;
    public ArrayList<EventData> events;
    
    public FrameData(){}
    
    //_onclear
    
    
}
