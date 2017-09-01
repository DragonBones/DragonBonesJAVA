package com.dragonbones.factory;

import com.dragonbones.model.ArmatureData;
import com.dragonbones.model.DragonBonesData;
import com.dragonbones.model.SkinData;
import org.jetbrains.annotations.Nullable;

/**
 * @private
 */
public class BuildArmaturePackage {
    public String dataName = "";
    public String textureAtlasName = "";
    public DragonBonesData data;
    public ArmatureData armature;
    public @Nullable
    SkinData skin = null;
}
