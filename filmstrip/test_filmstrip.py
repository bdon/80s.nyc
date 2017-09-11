from stripmaker import StripMaker 
import numpy as np

class Thing(object):
    def __init__(self,coords,foo):
        self.coords = np.array(coords)
        self.foo = foo


# a square should result in 4 filmstrips
def test_square():
    faces = [
                Thing([(0,0),(1,0)],'a'),
                Thing([(1,0),(1,1)],'b'),
                Thing([(1,1),(0,1)],'c'),
                Thing([(0,1),(0,0)],'d')
            ]
    assert len(StripMaker(faces).strips) == 4

# a triangle should result in 3 filmstrips
def test_3sides_of_square():
    faces = [
                Thing([(0,0),(1,0)],'a'),
                Thing([(1,0),(1,1)],'b'),
                Thing([(1,1),(0,1)],'c')
            ]
    assert len(StripMaker(faces).strips) == 3

def test_triangle():
    faces = [
                Thing([(0,0),(1,0)],'a'),
                Thing([(1,0),(1,1)],'b'),
                Thing([(1,1),(0,0)],'c')
            ]
    assert len(StripMaker(faces).strips) == 3

# a straight line should result in 1 filmstrip
def test_straight_line():
    faces = [
                Thing([(0,0),(1,0)],'a'),
                Thing([(1,0),(2,0)],'b')
            ]
    strips = StripMaker(faces).strips
    assert len(strips) == 1
    assert len(strips[0].pts) == 3

# a 45 degree angle should result in 1 filmstrip
def test_45deg_angle():
    faces = [
                Thing([(0,0),(1,0)],'a'),
                Thing([(1,0),(2,1)],'b')
            ]
    assert len(StripMaker(faces).strips) == 1

# an orphan 
#def test_orphan():
#    faces = [[(0,0),(1,0)],[(2,0),(3,0)]]
#    assert len(StripMaker(faces).strips) == 2

# an orphan 
#def test_orphan_complex():
#    faces = [[(0,0),(1,0)],[(4,0),(5,0)],[(1,0),(2,0)]]
#    assert len(StripMaker(faces).strips) == 2
