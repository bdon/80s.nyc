import numpy as np
import math

def unit(vector):
    return vector / np.linalg.norm(vector)

def close(p1,p2):
    return np.allclose(p1,p2,atol=0.1)

class Filmstrip(object):
    def __init__(self,face_obj):
        self.faces = [face_obj]
        self.pts = list(face_obj.coords)

    def touches(self,face_obj):
        face = face_obj.coords
        return close(self.pts[0],face[0]) or close(self.pts[0],face[-1]) or close(self.pts[-1],face[0]) or close(self.pts[-1],face[-1])

    def add_touching_face(self,face_obj):
        face = face_obj.coords
        
        if close(self.pts[0],face[0]):
            self.pts = list(face[::-1][:-1]) + self.pts
            self.faces.insert(0,face_obj)
        elif close(self.pts[0],face[-1]):
            self.pts = list(face[:-1]) + self.pts
            self.faces.insert(0,face_obj)
        elif close(self.pts[-1],face[0]):
            self.pts = self.pts + list(face[1:])
            self.faces.append(face_obj)
        elif close(self.pts[-1],face[-1]):
            self.pts = self.pts + list(face[:-1][::-1])
            self.faces.append(face_obj)
        else:
            raise Exception

    def point_is_left(self,centroid):
        if self.pts[0][0] < self.pts[-1][0]:
            left_point = self.pts[0]
            right_point = self.pts[-1]
            reverse = False
        else:
            left_point = self.pts[-1]
            right_point = self.pts[0]
            reverse = True
        c = centroid.coords[0]
        # find the left-most point of the segment
        d1 = (c[0] - left_point[0])*(right_point[1]-left_point[1]) - (c[1]-left_point[1])*(right_point[0]-left_point[0])
        # find the sign of a point guaranteed on the left
        test_point = (left_point[0], left_point[1] + 1)
        d2 = (test_point[0] - left_point[0])*(right_point[1]-left_point[1]) - (test_point[1]-left_point[1])*(right_point[0]-left_point[0])
        return d1 * d2 > 0


        

    # precondition: face touches current first or last point
    def join_angle(self,face_obj):
        face = face_obj.coords
        if close(self.pts[0],face[0]):
            vec0 = self.pts[1] - self.pts[0]
            vec1 = face[1] - face[0]
        elif close(self.pts[0],face[-1]):
            vec0 = self.pts[1] - self.pts[0]
            vec1 = face[-2] - face[-1]
        elif close(self.pts[-1],face[0]):
            vec0 = self.pts[-2] - self.pts[-1]
            vec1 = face[1] - face[0]
        elif close(self.pts[-1],face[-1]):
            vec0 = self.pts[-2] - self.pts[-1]
            vec1 = face[-2] - face[-1]
        else:
            raise Exception
        return np.arccos(np.clip(np.dot(unit(vec0),unit(vec1)),-1.0,1.0)) * 180 / math.pi

    def __repr__(self):
        return 'filmstrip ' + str(self.faces)


class StripMaker(object):
    def __init__(self,faces):
        face = faces.pop(0)
        faces_seen = 0
        strips = [Filmstrip(face)]
        while len(faces) != 0:
            # for every filmstrip, find any touching faces left
            face = faces.pop(0)
            matched = False
            for strip in strips:
                if strip.touches(face):
                    join_angle = strip.join_angle(face)
                    if join_angle > 90 + 15 and strip.join_angle(face) < 270 - 15:
                        matched = True
                        strip.add_touching_face(face)
                        faces_seen = 0
                        break


            if not matched:
                # if a face reaches the front of the list again without the length changing, 
                # it is an orphan, make it a new filmstrip
                if len(faces)+1 == faces_seen:
                    strips.append(Filmstrip(face))
                    faces_seen = 0
                else:
                    faces_seen = faces_seen + 1
                    # put it at the back of the list
                    faces.append(face)
        self._strips = strips

    @property
    def strips(self):
        return self._strips

    def pruned_strips(self):
        def lots_then_length(x):
            return (len(x.faces),sum(f.length for f in x.faces))
        # remove any strips that are subsets of other strips
        # order the strips by the # of lots, and then by length
        sorted(self._strips, key=lots_then_length)
    
        pruned = []
        seen_lots = set()
        for strip in self._strips:
            these_lots = set([f.lot_id for f in strip.faces])
            if these_lots.issubset(seen_lots):
                pass
            else:
                pruned.append(strip)
                seen_lots.update(these_lots)

        return pruned
