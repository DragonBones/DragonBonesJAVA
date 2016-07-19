/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package dragonbones.model;

import dragonbones.geom.Matrix;
import java.util.ArrayList;

/**
 *
 * @author mebius
 */
public class SlotTimelineData {
    
    public String toString()
    {
        return "[Class dragonBones.SlotTimelineData]";
    }
    
    public static Matrix cacheFrame( ArrayList<Matrix> cacheFrames, int cacheFrameIndex, Matrix globalTransformMatrix )
    {
        Matrix cacheMatrix = new Matrix();
        Matrix cache = cacheFrames.get(cacheFrameIndex) ;
        cache = new Matrix();
        cacheMatrix.copyFrom( globalTransformMatrix );
        return cacheMatrix;
    }
    
    public SlotData slot;
    public ArrayList<Matrix> cachedFrames;
    
    public SlotTimelineData()
    {
        this.cachedFrames = new ArrayList<Matrix>();
    }
    
    //_onClear
    
    public void cacheFrames(int cacheFrameCount)
    {
        //TODO
    }
    
}
