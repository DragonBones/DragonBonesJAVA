package com.dragonbones.core;

/**
 * @private
 */
public enum TimelineType {
    Action(0),
    ZOrder(1),

    BoneAll(10),
    BoneT(11),
    BoneR(12),
    BoneS(13),
    BoneX(14),
    BoneY(15),
    BoneRotate(16),
    BoneSkew(17),
    BoneScaleX(18),
    BoneScaleY(19),

    SlotVisible(23),
    SlotDisplay(20),
    SlotColor(21),
    SlotFFD(22),

    AnimationTime(40),
    AnimationWeight(41);

    public static TimelineType[] values = values();
    final int v;

    TimelineType(int v) {
        this.v = v;
    }
}
