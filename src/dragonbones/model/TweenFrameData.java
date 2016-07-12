package dragonbones.model;

import java.util.ArrayList;

/**
 *
 * @author mebius
 */
public class TweenFrameData extends FrameData {

    public static ArrayList<Double> samplingCurve(ArrayList<Double> curve, int frameCount) {
        if (curve.size() == 0 || frameCount == 0) {
            return null;
        }
        int samplingTimes = frameCount + 2;
        double samplingStep = 1 / samplingTimes;
        ArrayList<Double> sampling = new ArrayList<Double>();
        
        double rel = (samplingTimes - 1)*2;
        sampling.add(rel);
        
        curve.add(0, 0.0);
        curve.add(0, 0.0);
        curve.add();
        
        
    }
    
    public double tweenEasing;
    public ArrayList<Double> curve;
    
    public TweenFrameData(){}
    
    //_onClear

}
