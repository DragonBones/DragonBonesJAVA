package com.dragonbones.model;

import com.dragonbones.core.ActionType;
import com.dragonbones.core.BaseObject;
import org.jetbrains.annotations.Nullable;

/**
 * @private
 */
public class ActionData extends BaseObject {
    public ActionType type;
    public String name; // Frame event name | Sound event name | Animation name
    public @Nullable
    BoneData bone;
    public @Nullable
    SlotData slot;
    public @Nullable
    UserData data = null; //

    protected void _onClear() {
        if (this.data != null) {
            this.data.returnToPool();
        }

        this.type = ActionType.Play;
        this.name = "";
        this.bone = null;
        this.slot = null;
        this.data = null;
    }
}
