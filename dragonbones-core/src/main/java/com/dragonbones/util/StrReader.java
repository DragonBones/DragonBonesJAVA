package com.dragonbones.util;

import org.jetbrains.annotations.NotNull;

import java.util.Arrays;
import java.util.Objects;

public class StrReader {
    private int offset;
    private String str;

    public StrReader(String str) {
        this(str, 0);
    }

    public StrReader(String str, int offset) {
        this.str = str;
        this.offset = offset;
    }

    public boolean hasMore() {
        return offset() < length();
    }

    public boolean eof() {
        return offset() >= length();
    }

    public char peek() {
        return str.charAt(offset);
    }

    public char read() {
        return str.charAt(offset++);
    }

    public int offset() {
        return offset;
    }

    public int length() {
        return str.length();
    }

    public int available() {
        return length() - offset();
    }

    public String peek(int count) {
        return str.substring(offset, offset + Math.min(count, available()));
    }

    public String read(int count) {
        String out = peek(count);
        skip(out.length());
        return out;
    }

    public void skip(int count) {
        offset += Math.min(count, available());
    }

    public void skip() {
        skip(1);
    }

    public boolean tryRead(char c) {
        if (peek() == c) {
            skip();
            return true;
        } else {
            return false;
        }
    }

    public String tryRead(String value) {
        String read = peek(value.length());
        if (Objects.equals(read, value)) {
            skip(read.length());
            return read;
        } else {
            return null;
        }
    }

    public String tryRead(String... values) {
        for (String value : values) {
            String out = tryRead(value);
            if (out != null) return out;
        }
        return null;
    }

    public char expect(char expect) {
        char value = peek();
        if (value != expect) throw new ParseException("Expected " + expect);
        skip();
        return value;
    }

    @NotNull
    public String expect(@NotNull String expect) {
        String value = tryRead(expect);
        if (value == null) throw new ParseException("Expected " + expect);
        return value;
    }

    @NotNull
    public String expect(@NotNull String... expect) {
        final int offset = this.offset();
        final String value = tryRead(expect);
        if (value == null) {
            throw new ParseException("Expected " + Arrays.asList(expect) + " at " + offset);
        }
        return value;
    }

    public void skipSpaces() {
        while (hasMore()) {
            char c = peek();
            if (c == ' ' || c == '\n' || c == '\r' || c == '\t') {
                skip(1);
            } else {
                break;
            }
        }
    }

    static public class ParseException extends RuntimeException {
        public ParseException() {
            super();
        }

        public ParseException(String s) {
            super(s);
        }
    }
}
