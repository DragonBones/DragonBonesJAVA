package dragonbones.textures;

import dragonbones.core.BaseObject;
import java.util.Map;

/**
 *
 * @author mebius
 */
public class TextureAtlasData extends BaseObject{
    
    public boolean autoSearch;
    
    public double scale;
    
    public String name;
    public String imagePath;
    public Map<String, TextureData> textures;
    
    public TextureAtlasData()
    {
        
    }
    
    //_onClear
    
    //public  TextureData generateTextureData(){}
    
    public void addTextureData(TextureData value)
    {
        if(value!=null && value.name!="" && this.textures.get(value.name)!=null)
        {
            this.textures.put(value.name, value);
            value.parent = this;
        }
        else
        {
            throw new Error();
        }
    }
    
    public TextureData getTextureData(String name)
    {
        return this.textures.get(name);
    }
}


