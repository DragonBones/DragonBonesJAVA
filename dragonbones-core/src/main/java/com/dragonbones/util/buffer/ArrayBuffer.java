package com.dragonbones.util.buffer;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class ArrayBuffer {
    public ByteBuffer data;

    public ArrayBuffer(byte[] data) {
        this.data = ByteBuffer.wrap(data).order(ByteOrder.nativeOrder());
    }

    public ArrayBuffer(int length) {
        this.data = ByteBuffer.allocate(length).order(ByteOrder.nativeOrder());
    }

    public int getU8(int i) {
        return data.get(i);
    }

    public int getU32(int i) {
        return data.getInt(i);
    }

    public float getF32(int i) {
        return data.getFloat(i);
    }

    public int getU16(int i) {
        return data.getChar(i);
    }

    public int getS16(int i) {
        return data.getShort(i);
    }

    public void setS16(int i, int v) {
        data.putShort(i, (short) v);
    }

    public void setF32(int i, float value) {
        data.putFloat(i, value);
    }

    public void setU16(int i, int value) {
        data.putChar(i, (char)value);
    }

    public byte[] getBytes(int i, int count) {
        byte[] bytes = new byte[count];
        for (int n = 0; n < count; n++) {
            bytes[n] = (byte) getU8(i + n);
        }
        return bytes;
    }
}
