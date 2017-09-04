package com.dragonbones.animation;

import com.dragonbones.armature.Armature;
import com.dragonbones.armature.Slot;
import com.dragonbones.core.ActionType;
import com.dragonbones.core.BaseObject;
import com.dragonbones.core.BinaryOffset;
import com.dragonbones.event.EventObject;
import com.dragonbones.event.EventStringType;
import com.dragonbones.event.IEventDispatcher;
import com.dragonbones.model.ActionData;
import com.dragonbones.model.TimelineData;
import com.dragonbones.util.Array;

/**
 * @internal
 * @private
 */
public class ActionTimelineState extends TimelineState {
    private void _onCrossFrame(int frameIndex) {
        IEventDispatcher eventDispatcher = this._armature.getEventDispatcher();
        if (this._animationState.actionEnabled) {
            int frameOffset = this._animationData.frameOffset + this._timelineArray.get(this._timelineData.offset + BinaryOffset.TimelineFrameOffset.v + frameIndex);
            int actionCount = this._frameArray.get(frameOffset + 1);
            Array<ActionData> actions = this._armature.armatureData.actions;
            for (int i = 0; i < actionCount; ++i) {
                int actionIndex = this._frameArray.get(frameOffset + 2 + i);
                ActionData action = actions.get(actionIndex);
                if (action.type == ActionType.Play) {
                    if (action.slot != null) {
                        Slot slot = this._armature.getSlot(action.slot.name);
                        if (slot != null) {
                            Armature childArmature = slot.getChildArmature();
                            if (childArmature != null) {
                                childArmature._bufferAction(action, true);
                            }
                        }
                    } else if (action.bone != null) {
                        for (Slot slot : this._armature.getSlots()) {
                            Armature childArmature = slot.getChildArmature();
                            if (childArmature != null && slot.getParent().boneData == action.bone) {
                                childArmature._bufferAction(action, true);
                            }
                        }
                    } else {
                        this._armature._bufferAction(action, true);
                    }
                } else {
                    EventStringType eventType = action.type == ActionType.Frame ? EventObject.FRAME_EVENT : EventObject.SOUND_EVENT;
                    if (action.type == ActionType.Sound || eventDispatcher.hasEvent(eventType)) {
                        EventObject eventObject = BaseObject.borrowObject(EventObject.class);
                        // eventObject.time = this._frameArray[frameOffset] * this._frameRateR; // Precision problem
                        eventObject.time = this._frameArray.get(frameOffset) / this._frameRate;
                        eventObject.type = eventType;
                        eventObject.name = action.name;
                        eventObject.data = action.data;
                        eventObject.armature = this._armature;
                        eventObject.animationState = this._animationState;

                        if (action.bone != null) {
                            eventObject.bone = this._armature.getBone(action.bone.name);
                        }

                        if (action.slot != null) {
                            eventObject.slot = this._armature.getSlot(action.slot.name);
                        }

                        this._armature._dragonBones.bufferEvent(eventObject);
                    }
                }
            }
        }
    }

    protected void _onArriveAtFrame() {
    }

    protected void _onUpdateFrame() {
    }

    public void update(float passedTime) {
        int prevState = this.playState;
        float prevPlayTimes = this.currentPlayTimes;
        float prevTime = this.currentTime;

        if (this.playState <= 0 && this._setCurrentTime(passedTime)) {
            IEventDispatcher eventDispatcher = this._armature.getEventDispatcher();
            if (prevState < 0) {
                if (this.playState != prevState) {
                    if (this._animationState.displayControl && this._animationState.resetToPose) { // Reset zorder to pose.
                        this._armature._sortZOrder(null, 0);
                    }

                    prevPlayTimes = this.currentPlayTimes;

                    if (eventDispatcher.hasEvent(EventObject.START)) {
                        EventObject eventObject = BaseObject.borrowObject(EventObject.class);
                        eventObject.type = EventObject.START;
                        eventObject.armature = this._armature;
                        eventObject.animationState = this._animationState;
                        this._armature._dragonBones.bufferEvent(eventObject);
                    }
                } else {
                    return;
                }
            }

            boolean isReverse = this._animationState.timeScale < 0f;
            EventObject loopCompleteEvent = null;
            EventObject completeEvent = null;
            if (this.currentPlayTimes != prevPlayTimes) {
                if (eventDispatcher.hasEvent(EventObject.LOOP_COMPLETE)) {
                    loopCompleteEvent = BaseObject.borrowObject(EventObject.class);
                    loopCompleteEvent.type = EventObject.LOOP_COMPLETE;
                    loopCompleteEvent.armature = this._armature;
                    loopCompleteEvent.animationState = this._animationState;
                }

                if (this.playState > 0) {
                    if (eventDispatcher.hasEvent(EventObject.COMPLETE)) {
                        completeEvent = BaseObject.borrowObject(EventObject.class);
                        completeEvent.type = EventObject.COMPLETE;
                        completeEvent.armature = this._armature;
                        completeEvent.animationState = this._animationState;
                    }

                }
            }

            if (this._frameCount > 1) {
                TimelineData timelineData = this._timelineData;
                int timelineFrameIndex = (int) Math.floor(this.currentTime * this._frameRate); // uint
                int frameIndex = this._frameIndices.get(timelineData.frameIndicesOffset + timelineFrameIndex);
                if (this._frameIndex != frameIndex) { // Arrive at frame.
                    int crossedFrameIndex = this._frameIndex;
                    this._frameIndex = frameIndex;
                    if (this._timelineArray != null) {
                        this._frameOffset = this._animationData.frameOffset + this._timelineArray.get(timelineData.offset + BinaryOffset.TimelineFrameOffset.v + this._frameIndex);
                        if (isReverse) {
                            if (crossedFrameIndex < 0) {
                                int prevFrameIndex = (int) Math.floor(prevTime * this._frameRate);
                                crossedFrameIndex = this._frameIndices.get(timelineData.frameIndicesOffset + prevFrameIndex);
                                if (this.currentPlayTimes == prevPlayTimes) { // Start.
                                    if (crossedFrameIndex == frameIndex) { // Uncrossed.
                                        crossedFrameIndex = -1;
                                    }
                                }
                            }

                            while (crossedFrameIndex >= 0) {
                                int frameOffset = this._animationData.frameOffset + this._timelineArray.get(timelineData.offset + BinaryOffset.TimelineFrameOffset.v + crossedFrameIndex);
                                // const framePosition = this._frameArray[frameOffset] * this._frameRateR; // Precision problem
                                float framePosition = this._frameArray.get(frameOffset) / this._frameRate;
                                if (
                                        this._position <= framePosition &&
                                                framePosition <= this._position + this._duration
                                        ) { // Support interval play.
                                    this._onCrossFrame(crossedFrameIndex);
                                }

                                if (loopCompleteEvent != null && crossedFrameIndex == 0) { // Add loop complete event after first frame.
                                    this._armature._dragonBones.bufferEvent(loopCompleteEvent);
                                    loopCompleteEvent = null;
                                }

                                if (crossedFrameIndex > 0) {
                                    crossedFrameIndex--;
                                } else {
                                    crossedFrameIndex = this._frameCount - 1;
                                }

                                if (crossedFrameIndex == frameIndex) {
                                    break;
                                }
                            }
                        } else {
                            if (crossedFrameIndex < 0) {
                                int prevFrameIndex = (int) Math.floor(prevTime * this._frameRate);
                                crossedFrameIndex = this._frameIndices.get(timelineData.frameIndicesOffset + prevFrameIndex);
                                int frameOffset = this._animationData.frameOffset + this._timelineArray.get(timelineData.offset + BinaryOffset.TimelineFrameOffset.v + crossedFrameIndex);
                                // const framePosition = this._frameArray[frameOffset] * this._frameRateR; // Precision problem
                                float framePosition = this._frameArray.get(frameOffset) / this._frameRate;
                                if (this.currentPlayTimes == prevPlayTimes) { // Start.
                                    if (prevTime <= framePosition) { // Crossed.
                                        if (crossedFrameIndex > 0) {
                                            crossedFrameIndex--;
                                        } else {
                                            crossedFrameIndex = this._frameCount - 1;
                                        }
                                    } else if (crossedFrameIndex == frameIndex) { // Uncrossed.
                                        crossedFrameIndex = -1;
                                    }
                                }
                            }

                            while (crossedFrameIndex >= 0) {
                                if (crossedFrameIndex < this._frameCount - 1) {
                                    crossedFrameIndex++;
                                } else {
                                    crossedFrameIndex = 0;
                                }

                                int frameOffset = this._animationData.frameOffset + this._timelineArray.get(timelineData.offset + BinaryOffset.TimelineFrameOffset.v + crossedFrameIndex);
                                // const framePosition = this._frameArray[frameOffset] * this._frameRateR; // Precision problem
                                float framePosition = this._frameArray.get(frameOffset) / this._frameRate;
                                if (
                                        this._position <= framePosition &&
                                                framePosition <= this._position + this._duration
                                        ) { // Support interval play.
                                    this._onCrossFrame(crossedFrameIndex);
                                }

                                if (loopCompleteEvent != null && crossedFrameIndex == 0) { // Add loop complete event before first frame.
                                    this._armature._dragonBones.bufferEvent(loopCompleteEvent);
                                    loopCompleteEvent = null;
                                }

                                if (crossedFrameIndex == frameIndex) {
                                    break;
                                }
                            }
                        }
                    }
                }
            } else if (this._frameIndex < 0) {
                this._frameIndex = 0;
                if (this._timelineData != null) {
                    this._frameOffset = this._animationData.frameOffset + this._timelineArray.get(this._timelineData.offset + BinaryOffset.TimelineFrameOffset.v);
                    // Arrive at frame.
                    float framePosition = this._frameArray.get(this._frameOffset) / this._frameRate;
                    if (this.currentPlayTimes == prevPlayTimes) { // Start.
                        if (prevTime <= framePosition) {
                            this._onCrossFrame(this._frameIndex);
                        }
                    } else if (this._position <= framePosition) { // Loop complete.
                        if (!isReverse && loopCompleteEvent != null) { // Add loop complete event before first frame.
                            this._armature._dragonBones.bufferEvent(loopCompleteEvent);
                            loopCompleteEvent = null;
                        }

                        this._onCrossFrame(this._frameIndex);
                    }
                }
            }

            if (loopCompleteEvent != null) {
                this._armature._dragonBones.bufferEvent(loopCompleteEvent);
            }

            if (completeEvent != null) {
                this._armature._dragonBones.bufferEvent(completeEvent);
            }
        }
    }

    public void setCurrentTime(float value) {
        this._setCurrentTime(value);
        this._frameIndex = -1;
    }
}
