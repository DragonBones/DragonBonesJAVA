package com.dragonbones.util.json;

import com.dragonbones.util.StreamUtil;
import org.junit.Test;

import java.nio.charset.StandardCharsets;

public class JSONTest {
    @Test
    public void name() throws Exception {
        JSON.parse("[true,false]");
        JSON.parse("{}");
        JSON.parse("{\"a\":1}");
        JSON.parse("1");
        JSON.parse("\"abc\"");
        JSON.parse("true");
        JSON.parse("false");
        JSON.parse("null");
        JSON.parse("[1,2,3,4]");
        JSON.parse("true");
        JSON.parse("false");
        JSON.parse("[]");
        JSON.parse("[[]]");
        JSON.parse("[[[]],[]]");
        JSON.parse("[ [ true, false ], 1, 2, { \"a\" : true } ]");
        JSON.parse("[ [ true, false ] , 1 , 2 , { \"a\" : true } ]");

        JSON.parse(StreamUtil.getResourceString("NewDragon/NewDragon.json", StandardCharsets.UTF_8));
        //System.out.println();
    }
}