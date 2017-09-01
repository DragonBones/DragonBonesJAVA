package com.dragonbones.model;

import com.dragonbones.core.DisplayType;
import com.dragonbones.util.Array;
import org.jetbrains.annotations.Nullable;

/**
 * @private
 */
public class ArmatureDisplayData extends DisplayData {
    public boolean inheritAnimation;
    public final Array<ActionData> actions = new Array<>();
    @Nullable
    public ArmatureData armature;

    protected void _onClear() {
        super._onClear();

        for (ActionData action : this.actions) {
            action.returnToPool();
        }

        this.type = DisplayType.Armature;
        this.inheritAnimation = false;
        this.actions.clear();
        this.armature = null;
    }
}
