package com.dragonbones.util;

public class CharArray extends IntArray {
    public CharArray(boolean none) {
        super(none);
    }

    public CharArray() {
    }

    public CharArray(int length) {
        super(length);
    }

    public CharArray(int[] data) {
        super(data);
    }

    public CharArray(int[] data, int length) {
        super(data, length);
    }

    @Override
    protected IntArray createInstance() {
        return new CharArray();
    }
}
