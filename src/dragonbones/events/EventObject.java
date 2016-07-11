package dragonbones.events;

import dragonbones.core.BaseObject;
import dragonbones.armature.Armature;
import dragonbones.armature.Bone;
import dragonbones.armature.Slot;

import dragonbones.animation.AnimationState;

/**
 *
 * @author mebius
 */
public class EventObject extends BaseObject{
    public static String START = "start";
    public static String LOOP_COMMPLETE  = "loopComplete";
    public static String COMPLETE = "complete";
    public static String FADE_IN = "fadeIn";
    public static String FADE_IN_COMPLETE = "fadeInComplete";
    public static String FADE_OUT = "fadeOut";
    public static String FADE_OUT_COMPLETE = "fadeOutComplete";
    public static String FRAME_EVENT = "frameEvent";
    public static String SOUND_EVENT = "soundEvent";
    
    @Override
    public String toString()
    {
        return "[Class dragonBones.EventObject]";
    }
    
    public String type;
    public String name;
    public Object data;
    public Armature armature;
    public Bone bone;
    public Slot slot;
    
    public AnimationState animationState;
    public Object userData;
    
    public EventObject()
    {
        
    }
    
    //_onClear
    
}
