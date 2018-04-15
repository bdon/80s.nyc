import argparse
import csv
import errno
import os
import math
from sets import Set

import numpy as np
import tensorflow as tf
import progressbar
from scandir import scandir
from PIL import Image, ImageDraw

def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exc:  # Python >2.5
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise

# crops black borders
class ImageCropper(object):
    pass

class ImageToBbl(object):
    def __init__(self,mapping):
        self.map = {}
        with open(mapping,'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                boro = row['boro']
                block = row['block']
                lot = row['lot']
                image_url = row['image_url']
                basename = image_url.split("/")[-1][0:-4] # strip off jpg
                self.map[basename] = (boro,block,lot)

    def bbl_for_basename(self,basename):
        bbl = self.map[basename]
        return bbl[0] + bbl[1] + bbl[2]


# a csv file that is:
# image_name,bbl,is_easement,image_valid,photoset (dof or lvd)
# irrelevant right now = easements
class Manifest(object):
    def __init__(self,manifest_file):
        self.seen_images = Set()
        if os.path.isfile(manifest_file):
            print "Reading manifest file..."
            with open(manifest_file,'rb') as f:
                reader = csv.reader(f)
                for line in reader:
                    self.seen_images.add(line[0])
            print "Seen {0} images.".format(len(self.seen_images))

        self.file_to_write = open(manifest_file,'a')

    def write(self,image_name,bbl,image_relevant,image_valid,photoset):
        self.file_to_write.write("{0},{1},{2},{3},{4}\n".format(image_name,bbl,image_relevant,image_valid,photoset))
        self.file_to_write.flush()

    def contains(self, image_name):
        return image_name in self.seen_images


# checks is the photo is an orange or white "not photographed" card
class ImageClassifier(object):
    def __init__(self,model):
        self.graph = tf.Graph()
        graph_def = tf.GraphDef()
        with open(model, "rb") as f:
            graph_def.ParseFromString(f.read())
        with self.graph.as_default():
            tf.import_graph_def(graph_def)
            self.in_op = self.graph.get_operation_by_name("import/input").outputs[0]
            self.out_op = self.graph.get_operation_by_name("import/final_result").outputs[0]

    def is_valid_photo(self,file_name,model_session):
        file_reader = tf.read_file(file_name, "file_reader")
        image_reader = tf.image.decode_jpeg(file_reader, channels = 3, name='jpeg_reader')
        float_caster = tf.cast(image_reader, tf.float32)
        dims_expander = tf.expand_dims(float_caster, 0);
        resized = tf.image.resize_bilinear(dims_expander, [224, 224])
        normalized = tf.divide(tf.subtract(resized, [128]), [128])
        resizeSession = tf.Session()
        tensor = resizeSession.run(normalized)
        resizeSession.close()
        results = model_session.run(self.out_op,{self.in_op: tensor})
        return results.argmax() == 0



def cropimage(img):
    def color_difference(color1, color2):
        a = math.pow(color1[0] - color2[0],2)
        b = math.pow(color1[1] - color2[1],2)
        c = math.pow(color1[2] - color2[2],2)
        return math.sqrt(a+b+c)

    def get_average_color(arr, image):
        r, g, b = 0,0,0
        count = 0
        for s in range(arr[0],arr[2]):
            for t in range(arr[1],arr[3]):
                pixlr, pixlg, pixlb = image[s, t]
                r += pixlr
                g += pixlg
                b += pixlb
                count += 1
        return ((r/count), (g/count), (b/count))

    pixels = img.load()
    average1_0 = get_average_color([60,50,80,330], pixels)
    average1_1 = get_average_color([560,50,580,330], pixels)
    if color_difference(average1_0,[0,0,0]) < 40 and color_difference(average1_1,[0,0,0]) < 40:
        try:
            left_intensity = 0
            left_border = 200
            while left_intensity < 50:
                averagefindleft = get_average_color([left_border,50,left_border+5,330], pixels)
                left_intensity = color_difference(averagefindleft,[0,0,0])
                left_border = left_border + 5

            right_intensity = 0
            right_border = 490
            while right_intensity < 50:
                averagefindright = get_average_color([right_border-5,50,right_border,330], pixels)
                right_intensity = color_difference(averagefindright,[0,0,0])
                right_border = right_border - 5
            draw = ImageDraw.Draw(img)
            return img.crop((left_border,0,right_border,480))
        except (IndexError,SystemError):
            return None
    else:
        return img.crop((20,0,630,480))


def writeimage(bbl,img,output_dir):
    boro = bbl[0]
    block = bbl[1:6]
    lot = bbl[6:10]
    mkdir_p(output_dir + "/{0}/{1}".format(boro,block))
    img.save(output_dir + "/{0}/{1}/{2}.jpg".format(boro,block,lot),"JPEG")


# the actual program
NUM_IMAGES = 842240 # so we don't need to calculate it...
parser = argparse.ArgumentParser()
parser.add_argument("--image_dir", help="directory containing all images with LVD or DOF names")
parser.add_argument("--model", help="TensorFlow model .pb to classify orange or white missing photo cards")
parser.add_argument("--mapping", help="mapping from boro,block,lot to URL")
parser.add_argument("--manifest", help="a CSV keeping track of what image names have been processed.")
parser.add_argument("--output_dir", help="output directory, will create boro, block, and lot subdirectories.")

args = parser.parse_args()
model = args.model
image_dir = args.image_dir
image_to_bbl = ImageToBbl(args.mapping)
manifest = Manifest(args.manifest)
output_dir = args.output_dir
assert output_dir
log = open('run.log','a')

progress = progressbar.ProgressBar(max_value=NUM_IMAGES)
classifier = ImageClassifier(model)
with tf.Session(graph=classifier.graph) as session:
    for idx, image_file in enumerate(scandir(image_dir)):
        progress.update(idx)
        imagename = image_file.name # including .jpg
        imagepath = image_file.path # full path
        if manifest.contains(image_file.name): # did we process this image already?
            continue
        bbl = image_to_bbl.bbl_for_basename(imagename[0:-4])
        if os.path.splitext(imagename)[0][-1].isalpha(): # is this an easement?
            is_relevant = False
            manifest.write(imagename,bbl,False,False,"unknown")
            continue
        image_valid = classifier.is_valid_photo(imagepath,session)
        if not image_valid:
            manifest.write(imagename,bbl,True,False,"unknown")
            continue
        image = Image.open(imagepath)
        if not image.size == (640,480): # it's a DOF file that doesn't have black letterboxing
            writeimage(bbl,image,output_dir)
            manifest.write(imagename,bbl,True,True,"dof")
        else:
            image = cropimage(image)
            if image:
                writeimage(bbl,image,output_dir)
                manifest.write(imagename,bbl,True,True,"lvd")
            else:
                log.write("invalid image? {0}".format(imagename))
                log.flush()
                manifest.write(imagename,bbl,True,False,"lvd")

