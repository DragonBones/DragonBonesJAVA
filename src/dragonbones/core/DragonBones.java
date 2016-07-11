package dragonbones.core;



/**
 *
 * @author mebius
 */
public class DragonBones {

    public enum ArmatureType {
        Armature, MovieClip, Stage;
    }
    
    public enum DisplayType {
        Image ,Armature ,Mesh ;
    }
    
    public enum ExtensionType {
         FFD ,AdjustColor , BevelFilter ,BlurFilter ,DropShadowFilter ,GlowFilter ,GradientBevelFilter ,GradientGlowFilter ;
    }

    public enum EventType {
        Frame ,Sound ;
    }
    
    public enum ActionType {
        Play ,Stop ,GotoAndPlay,GotoAndStop,FadeIn ,FadeOut;
    }
    public enum BlendMode {
        Normal ,Add ,Alpha,Darken ,Difference ,Erase ,HardLight,Invert ,Layer ,Lighten ,Multiply ,Overlay,Screen ,Subtract;
    }
    
    public static double PI_D = Math.PI * 2;
    public static double PI_H = Math.PI / 2;
    public static double PI_Q = Math.PI / 4;
    public static double ANGLE_TO_RADIAN = Math.PI / 180;
    public static double RADIAN_TO_ANGLE = 180 / Math.PI;
    public static double SECOND_TO_MILLISECOND = 1000;
    public static double NO_TWEEN = 100;
    
    public static String VERSION = "4.7";
    
    public DragonBones()
    {
        
    }
    
}
