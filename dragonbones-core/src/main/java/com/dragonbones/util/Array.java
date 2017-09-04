package com.dragonbones.util;

import java.util.Arrays;
import java.util.Comparator;

final public class Array<T> extends ArrayBase<T> {
    private int length;
    private T[] data = (T[]) new Object[0];

    public Array() {
        this((T[]) new Object[16], 0);
    }

    public Array(int length) {
        this((T[]) new Object[length], length);
    }

    public Array(T[] data) {
        this(data, data.length);
    }

    public Array(T[] data, int length) {
        this.data = data;
        this.length = length;
    }

    @Override
    public ArrayBase<T> create(int count) {
        return new Array<>(count);
    }

    private void ensureCapacity(int minLength) {
        if (data.length < minLength) {
            data = Arrays.copyOf(data, Math.max(minLength, data.length * 3));
        }
    }

    public T get(int index) {
        return data[index];
    }

    public void set(int index, T value) {
        data[index] = value;
    }

    @Override
    public T getObject(int index) {
        return get(index);
    }

    @Override
    public void setObject(int index, T value) {
        set(index, value);
    }

    //@Deprecated
    public void add(T value) {
        pushObject(value);
    }

    public void push(T value) {
        pushObject(value);
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

    public Array<T> copy() {
        Array<T> out = new Array<>();
        out.length = length;
        out.data = Arrays.copyOf(data, data.length);
        return out;
    }

    @Override
    public void sort(Comparator<T> comparator, int start, int end) {
        Arrays.sort(data, start, end, comparator);
    }
}
