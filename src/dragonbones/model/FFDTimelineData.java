/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package dragonbones.model;


/**
 *
 * @author mebius
 */
public class FFDTimelineData {
    
    @Override
    public String toString()
    {
        return "[Class dragonBones.FFDTimelineData]";
    }
    
    public int displayIndex = 0;
    public SkinData skin ;
    public SlotDisplayDataSet slot ;
    
    public FFDTimelineData()
    {
        
    }
    
    //_onClear
}
