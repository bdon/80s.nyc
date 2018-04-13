import glob
import numpy as np
import tensorflow as tf

def read_tensor_from_image_file(file_name):
  input_name = "file_reader"
  output_name = "normalized"
  file_reader = tf.read_file(file_name, input_name)
  image_reader = tf.image.decode_jpeg(file_reader, channels = 3, name='jpeg_reader')
  float_caster = tf.cast(image_reader, tf.float32)
  dims_expander = tf.expand_dims(float_caster, 0);
  resized = tf.image.resize_bilinear(dims_expander, [224, 224])
  normalized = tf.divide(tf.subtract(resized, [128]), [128])
  sess = tf.Session()
  return sess.run(normalized)

graph = tf.Graph()
graph_def = tf.GraphDef()

with open("80snyc_model.pb", "rb") as f:
  graph_def.ParseFromString(f.read())
with graph.as_default():
  tf.import_graph_def(graph_def)

input_operation = graph.get_operation_by_name("import/input");
output_operation = graph.get_operation_by_name("import/final_result");

with tf.Session(graph=graph) as sess:
  for valid in glob.glob("images/valid/*"):
      t = read_tensor_from_image_file(valid)
      results = sess.run(output_operation.outputs[0],
                      {input_operation.outputs[0]: t})
      argmax = results.argmax()
      if argmax == 0:
          print "photo"
      else:
          print "card"
