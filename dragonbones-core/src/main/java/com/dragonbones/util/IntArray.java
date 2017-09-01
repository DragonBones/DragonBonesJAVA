package com.dragonbones.util;

import java.util.Arrays;
import java.util.Comparator;

public class IntArray extends NumberArray<Integer> {
    static private final int[] EMPTY = new int[0];
    private int length;
    private int[] data;

    protected IntArray(boolean none) {
    }

    public IntArray() {
        this(EMPTY, 0);
    }

    public IntArray(int length) {
        this(new int[length], length);
    }

    public IntArray(int[] data) {
        this(data, data.length);
    }

    public IntArray(int[] data, int length) {
        this.data = data;
        this.length = length;
    }

    private void ensureCapacity(int minLength) {
        if (data.length < minLength) {
            data = Arrays.copyOf(data, Math.max(16, Math.max(minLength, data.length * 3)));
        }
    }

    public int get(int index) {
        return data[index];
    }

    public void set(int index, int value) {
        data[index] = value;
    }

    @Override
    public Integer getObject(int index) {
        return get(index);
    }

    @Override
    public void setObject(int index, Integer value) {
        set(index, (Integer) value);
    }

    @Override
    public ArrayBase<Integer> create(int count) {
        return new IntArray(count);
    }

    public void push(int value) {
        int pos = getLength();
        setLength(pos + 1);
        data[pos] = value;
    }

    @Override
    public int getLength() {
        return length;
    }

    @Override
    public void setLength(int length) {
        this.length = length;
        ensureCapacity(length);
    }

    protected IntArray createInstance() {
        return new IntArray();
    }

    public IntArray copy() {
        IntArray out = createInstance();
        out.length = length;
        out.data = Arrays.copyOf(data, data.length);
        return out;
    }

    public void sort(int start, int end) {
        Arrays.sort(data, start, end);
    }

    public void sort(Comparator<Integer> comparator, int start, int end) {
        throw new RuntimeException("Not implemented");
    }
}
