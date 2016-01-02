# n13.coffee

# This script should help me run ConvNetjS.
# Demo:
# coffee n13.coffee

convnetjs = require("./convnetjs.js")

# This function wraps console.log() inside of clog().
clog = (in_x)->
  console.log in_x

# This function should calculate the median of an array of numbers.
mymedian = (in_a)->
  my_a     = in_a.sort()
  mylen    = my_a.length
  if(mylen %2 == 0)
    # If mylen is even I should pick two in the middle and average them
    mymiddle1 = mylen / 2
    mymiddle2 = mymiddle1 - 1
    mymiddle  = (my_a[mymiddle1] + my_a[mymiddle2] )/2
  else
    # If mylen is odd I should pick the elem in the middle.
    mymiddle = my_a[((mylen / 2) - 0.5)]
  return mymiddle

# This function should calculate the mean of an array of numbers.
mymean = (in_a)->
  mysum = 0
  in_a.forEach (x)->
    mysum += x
  return mysum / in_a.length

# I should read a csv file into global.myarray

rl = require('readline').createInterface(
  input: require('fs').createReadStream('../public/csv/GSPC.csv'))
global.myarray = []
rl.on 'line', (line)->
  global.myarray.push line
  return
# Upon close of reading the file, I should pass the array to a callback function.
rl.on 'close', ->
  cb1(global.myarray)
  return

# This function should accept an array and transform it into a model.
cb1 = (in_a)->
  # Yahoo data is in wrong order. I should check and reverse if nec.
  if in_a[0].split(',')[0] is 'Date' # This is what I expect.
    csv_s_a = in_a.slice(1,in_a.length)
  # I should check again
  csv_a = csv_s_a.map((row)->row.split(','))
  d1 = csv_a[1][0]
  d2 = csv_a[2][0]
  if (d1 > d2) # date1 > date2?
    csv_a.reverse()
  # I should get both dates and prices out of csv_s_a
  ydate_s_a = csv_a.map((row)->row[0])
  cp_a      = csv_a.map((row)->row[4])
  clog ydate_s_a[16123]
  clog cp_a[16123]
# end
