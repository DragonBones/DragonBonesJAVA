package dragonbones.textures;

import dragonbones.core.BaseObject;
import dragonbones.geom.Rectangle;

/**
 *
 * @author mebius
 */
public class TextureData extends BaseObject{
    public static Rectangle generateRectangle()
    {
        return new Rectangle(0,0,0,0);
    }
    
    public boolean rotated = false;
    public String name = "";
    public Rectangle frame = null;
    public TextureAtlasData parent = null;
    public Rectangle region = new Rectangle(0,0,0,0);
    
    public TextureData()
    {
        
    }
    
    //_onClear
}
