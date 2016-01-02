# n13.coffee

# This script should help me run ConvNetjS.
# Demo:
# coffee n13.coffee

convnetjs = require("./convnetjs.js")

magicNet = new convnetjs.MagicNet()

# This function wraps console.log() inside of clog().
clog = (in_x) ->
  console.log in_x

clog magicNet

# This function should calculate the median of an array of numbers.
mymedian = (in_a) ->
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

clog mymedian([4,3,2,1]) # should == 2.5
clog mymedian([4,3,2,1,5]) # should == 3

# This function should calculate the mean of an array of numbers.
mymean = (in_a) ->
  mysum = 0
  in_a.forEach (x)->
    mysum += x
  return mysum / in_a.length

clog mymean([0]) # should == 0
clog mymean([0,2]) # should == 1
clog mymean([4,3,2,1,5]) # should == 3


# end
