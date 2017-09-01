package com.dragonbones.model;

import com.dragonbones.core.BaseObject;
import com.dragonbones.util.Array;
import org.jetbrains.annotations.Nullable;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * 皮肤数据。（通常一个骨架数据至少包含一个皮肤数据）
 *
 * @version DragonBones 3.0
 * @language zh_CN
 */
public class SkinData extends BaseObject {
    /**
     * 数据名称。
     *
     * @version DragonBones 3.0
     * @language zh_CN
     */
    public String name;
    /**
     * @private
     */
    public final Map<String, Array<DisplayData>> displays = new HashMap<>();

    /**
     * @private
     */
    protected void _onClear() {
        for (String k : this.displays.keySet()) {
            Array<DisplayData> slotDisplays = this.displays.get(k);
            for (DisplayData display : slotDisplays) {
                if (display != null) {
                    display.returnToPool();
                }
            }

            this.displays.remove(k);
        }

        this.name = "";
        // this.displays.clear();
    }

    /**
     * @private
     */
    public void addDisplay(String slotName, @Nullable DisplayData value) {
        if (!(this.displays.containsKey(slotName))) {
            this.displays.put(slotName, new Array<>());
        }

        Array<DisplayData> slotDisplays = this.displays.get(slotName); // TODO clear prev
        slotDisplays.add(value);
    }

    /**
     * @private
     */
    @Nullable
    public DisplayData getDisplay(String slotName, String displayName) {
        Array<DisplayData> slotDisplays = this.getDisplays(slotName);
        if (slotDisplays != null) {
            for (DisplayData display : slotDisplays) {
                if (display != null && Objects.equals(display.name, displayName)) {
                    return display;
                }
            }
        }

        return null;
    }

    /**
     * @private
     */
    @Nullable
    public Array<DisplayData> getDisplays(String slotName) {
        if (!(this.displays.containsKey(slotName))) {
            return null;
        }

        return this.displays.get(slotName);
    }
}
