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
public class PointTest {
    
    public PointTest() {
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
     * Test of toString method, of class Point.
     */
    @Test
    public void testToString() {
        System.out.println("Point ToString");
        Point instance = new Point(11,67);
        System.out.println(instance.toString());
        String expResult = "point object";
        String result = "数据错误";
        if(instance.x!=11 || instance.y!=67)
        {
            assertEquals(expResult, result);
        }
        instance.x = 80;
        instance.y = 90;
        System.out.println(instance.toString());
        if(instance.x!=80 || instance.y!=90)
        {
            assertEquals(expResult, result);
        }
        //
        // TODO review the generated test code and remove the default call to fail.
        //fail("The test case is a prototype.");
    }
    
}
