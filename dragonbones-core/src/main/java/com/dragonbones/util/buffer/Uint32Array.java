package com.dragonbones.util.buffer;

import com.dragonbones.util.IntArray;

public class Uint32Array extends IntArray implements ArrayBufferView {
    static public final int BYTES_PER_ELEMENT = 4;
    private final ArrayBuffer buffer;
    private final int offset;
    private final int count;
    private final int byteOffset;

    public Uint32Array(ArrayBuffer buffer, int offset, int count) {
        super(false);
        this.buffer = buffer;
        this.offset = offset;
        this.count = count;
        this.byteOffset = offset * BYTES_PER_ELEMENT;
    }

    public int get(int index) {
        return buffer.getU32(byteOffset + index * BYTES_PER_ELEMENT);
    }
}
