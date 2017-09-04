package com.dragonbones.util.json;

import com.dragonbones.util.Array;
import com.dragonbones.util.StrReader;

import java.util.HashMap;
import java.util.Objects;

public class JSON {
    static public Object parse(String json) {
        return parse(new StrReader(json));
    }

    static public Object parse(StrReader s) {
        s.skipSpaces();
        switch (s.peek()) {
            case '{':
                return parseObject(s);
            case '[':
                return parseArray(s);
            case '"':
                return parseString(s);
            case 't':
            case 'f':
                return parseBool(s);
            case 'n':
                return parseNull(s);
            case '.':
            case '+':
            case '-':
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case 'e':
            case 'E':
                return parseNumber(s);
        }
        throw new StrReader.ParseException("Unexpected character " + s.peek());
    }

    static public Object parseObject(StrReader s) {
        HashMap<String, Object> out = new HashMap<>();
        s.skipSpaces();
        s.expect('{');
        s.skipSpaces();
        if (s.peek() != '}') {
            while (s.hasMore()) {
                s.skipSpaces();
                String key = Objects.toString(parse(s));
                s.skipSpaces();
                s.expect(':');
                s.skipSpaces();
                Object value = parse(s);
                out.put(key, value);
                s.skipSpaces();
                char c = s.peek();
                if (c == ',') {
                    s.skip();
                    continue;
                }
                if (c == '}') break;
                throw new StrReader.ParseException();
            }
        }
        s.skipSpaces();
        s.expect('}');

        return out;
    }

    static public Array parseArray(StrReader s) {
        Array<Object> out = new Array<>();
        s.skipSpaces();
        s.expect('[');
        s.skipSpaces();
        if (s.peek() != ']') {
            while (s.hasMore()) {
                s.skipSpaces();
                out.push(parse(s));
                s.skipSpaces();
                char c = s.peek();
                if (c == ',') {
                    s.skip();
                    continue;
                }
                if (c == ']') break;
                throw new StrReader.ParseException();
            }
        }
        s.skipSpaces();
        s.expect(']');
        s.skipSpaces();
        return out;
    }

    static public String parseString(StrReader s) {
        StringBuilder sb = new StringBuilder();
        s.skipSpaces();
        s.expect('"');
        while (s.hasMore()) {
            char c = s.peek();
            if (c == '"') {
                break;
            } else if (c == '\\') {
                s.skip();
                char cc = s.read();
                switch (cc) {
                    case 'n':
                        sb.append('\n');
                        break;
                    case 'r':
                        sb.append('\r');
                        break;
                    case 't':
                        sb.append('\t');
                        break;
                    case 'b':
                        sb.append('\b');
                        break;
                    case 'f':
                        sb.append('\f');
                        break;
                    case '\\':
                        sb.append('\\');
                        break;
                    case '/':
                        sb.append('/');
                        break;
                    case 'u':
                        sb.appendCodePoint(Integer.parseInt(s.read(4), 16));
                        break;
                    default:
                        throw new StrReader.ParseException("Invalid " + cc);
                }
            } else {
                sb.append(c);
                s.skip();
            }
        }
        s.expect('"');
        s.skipSpaces();
        return sb.toString();
    }

    static public double parseNumber(StrReader s) {
        StringBuilder sb = new StringBuilder();
        s.skipSpaces();
        loop:
        while (s.hasMore()) {
            char c = s.peek();
            switch (c) {
                case '.':
                case '+':
                case '-':
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                case 'e':
                case 'E':
                    sb.append(c);
                    s.skip();
                    break;
                default:
                    break loop;
            }
        }
        s.skipSpaces();
        return Double.parseDouble(sb.toString());
    }

    static public boolean parseBool(StrReader s) {
        s.skipSpaces();
        String v = s.expect("true", "false");
        s.skipSpaces();
        return Objects.equals(v, "true");
    }

    static public Object parseNull(StrReader s) {
        s.skipSpaces();
        s.expect("null");
        s.skipSpaces();
        return null;
    }
}
