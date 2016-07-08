/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package dragonbones.geom;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author mebius
 */
public class RectangleTest {
    
    public RectangleTest() {
    }
    
    @BeforeClass
    public static void setUpClass() {
    }
    
    @AfterClass
    public static void tearDownClass() {
    }
    
    @Before
    public void setUp() {
    }
    
    @After
    public void tearDown() {
    }

    /**
     * Test of copyFrom method, of class Rectangle.
     */
    @Test
    public void testCopyFrom() {
        System.out.println("Rectangle copyFrom");
        Rectangle value = new Rectangle(7,8,9,3);
        Rectangle instance = new Rectangle(1,2,3,4);
        System.out.println(value.x+","+value.y+","+value.width+","+value.height);
        System.out.println(instance.x+","+instance.y+","+instance.width+","+instance.height);
        instance.copyFrom(value);
        System.out.println(instance.x+","+instance.y+","+instance.width+","+instance.height);
        if(instance.x!=7||instance.y!=8||instance.width!=9||instance.height!=3)
        {
            assertEquals("Rectangle", "数据错误");
        }
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }

    /**
     * Test of clear method, of class Rectangle.
     */
    @Test
    public void testClear() {
        System.out.println("Rectangle clear");
        Rectangle instance = new Rectangle(1,2,3,4);
        System.out.println(instance.x+","+instance.y+","+instance.width+","+instance.height);
        instance.clear();
        System.out.println(instance.x+","+instance.y+","+instance.width+","+instance.height);
        if(instance.x!=0||instance.y!=0||instance.width!=0||instance.height!=0)
        {
            assertEquals("Rectangle","数据错误");
        }
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }
    
}
