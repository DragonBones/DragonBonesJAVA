package dragonbones.model;

import java.util.ArrayList;
import java.util.Map;

/**
 *
 * @author mebius
 */
public class AnimationData extends TimelineData{

    public String toString() {
        return "[Class dragonBones.AnimationData]";
    }

    public boolean hasAsynchronyTimeline;
    public boolean hasBoneTimelineEvent;

    public double frameCount;
    public double playTimes;
    public double position;
    public double duration;
    public double fadeInTime;
    public double cacheTimeToFrameScale;
    public String name;
    public AnimationData animation;
    
    public Map<String,BoneTimelineData> boneTimelines;
    public Map<String,SlotTimelineData> slotTimelines;
    public Map<String,FFDTimelineData> ffdTimelines;
    public ArrayList<Boolean> cachedFrames;

    public AnimationData() {

    }

    //_onClear
    public void cacheFrames(double value) {
        if (this.animation != null) {
            return;
        }
        int cacheFrameCount = Math.max(Math.floor(this.frameCount * this.scale * value), 1);
        this.cacheTimeToFrameScale = cacheFrameCount / (this.duration + 0.000001);
        this.cachedFrames.length = 0;
        this.cachedFrames.length = cacheFrameCount;
        for(Map<String,BoneTimelineData> i : this.boneTimelines)
        {
            
        }
    }
}
